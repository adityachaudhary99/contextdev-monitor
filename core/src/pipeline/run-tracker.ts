// core/src/pipeline/run-tracker.ts
import type { Tracker } from "../trackers/tracker.js";
import type { ContextClient } from "../client/context-client.js";
import type { SnapshotStore } from "../cache/snapshot-store.js";
import type { CreditLedger } from "../credits/ledger.js";
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
    });
    validateCitations(report);
    return report;
  };

  const located = await tracker.locate(domain, client);
  if (!located.ok) return finish({ failures: [located.failure] });
  const sourceUrl = located.value;

  const scraped = await client.scrapeMarkdown(sourceUrl);
  if (!scraped.ok) return finish({ sourceUrl, failures: [scraped.failure] });
  const sourceHash = hashContent(scraped.value.markdown);

  const prior = await store.latest<T>(tracker.id, domain);

  // Content-hash gate: identical source ⇒ no extraction, no diff.
  if (prior && prior.sourceHash === sourceHash) {
    return finish({ sourceUrl, sourceTitle: `${domain} ${tracker.id}` });
  }

  const extracted = await client.extractStructured(sourceUrl, tracker.jsonSchema);
  if (!extracted.ok) return finish({ sourceUrl, failures: [extracted.failure] });

  const normalized = tracker.normalize(tracker.parse(extracted.value));
  const diff = prior
    ? tracker.diff(prior.data as never, normalized as never)
    : { changed: false as const, changes: [] };

  await store.save({ trackerId: tracker.id, domain, capturedDay: day, sourceUrl, sourceHash, data: normalized });
  return finish({ sourceUrl, sourceTitle: `${domain} ${tracker.id}`, diff });
}
