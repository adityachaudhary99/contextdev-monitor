// core/src/pipeline/run-tracker.ts
import type { Tracker } from "../trackers/tracker.js";
import type { ContextClient } from "../client/context-client.js";
import type { SnapshotStore } from "../cache/snapshot-store.js";
import type { CreditLedger } from "../credits/ledger.js";
import type { NormalizedSnapshot } from "../trackers/pricing/normalize.js";
import type { Pricing } from "../trackers/pricing/schema.js";
import { hashContent } from "../cache/content-hash.js";
import { assembleReport, type Report } from "../report/report.js";
import { validateCitations } from "../report/citation-validator.js";

export async function runTracker<T>(args: {
  tracker: Tracker<T>; domain: string; client: ContextClient; ledger: CreditLedger;
  store: SnapshotStore; day: string; now?: () => number;
}): Promise<Report> {
  const { tracker, domain, client, ledger, store, day } = args;
  const now = args.now ?? (() => Date.now());
  const start = now();
  const finish = (extra: Partial<Parameters<typeof assembleReport>[0]>) => {
    const report = assembleReport({
      domain, trackerId: tracker.id, sourceUrl: extra.sourceUrl ?? `https://${domain}`,
      sourceTitle: extra.sourceTitle ?? `${domain} ${tracker.id}`,
      diff: extra.diff ?? { changed: false, changes: [] },
      creditsUsed: ledger.total(), latencyMs: now() - start, failures: extra.failures ?? [],
      pricing: extra.pricing, priorExisted: extra.priorExisted ?? false,
    });
    validateCitations(report);
    return report;
  };

  const located = await tracker.locate(domain, client);
  if (!located.ok) return finish({ failures: [located.failure], priorExisted: false });
  const sourceUrl = located.value.url;
  const sourceHash = hashContent(located.value.markdown);

  const prior = await store.latest<T>(tracker.id, domain);

  // Content-hash gate: identical source ⇒ no extraction, no diff.
  if (prior && prior.sourceHash === sourceHash) {
    return finish({ sourceUrl, sourceTitle: `${domain} ${tracker.id}`, pricing: prior.data as NormalizedSnapshot<Pricing>, priorExisted: true });
  }

  const extracted = await client.extractStructured(sourceUrl, tracker.jsonSchema);
  if (!extracted.ok) return finish({ sourceUrl, failures: [extracted.failure], priorExisted: prior != null });

  const normalized = tracker.normalize(tracker.parse(extracted.value));
  const diff = prior
    // v1 limitation: SnapshotStore is keyed by tracker.id but typed opaquely, so the generic Tracker<T> seam isn't enforced across the store boundary. Safe for the single pricing tracker (run-tracker tests lock this wiring); a second tracker in Plan 2 should parameterize runTracker<T,N> to remove these casts.
    ? tracker.diff(prior.data as never, normalized as never)
    : { changed: false as const, changes: [] };

  await store.save({ trackerId: tracker.id, domain, capturedDay: day, sourceUrl, sourceHash, data: normalized });
  return finish({ sourceUrl, sourceTitle: `${domain} ${tracker.id}`, diff, pricing: normalized as NormalizedSnapshot<Pricing>, priorExisted: prior != null });
}
