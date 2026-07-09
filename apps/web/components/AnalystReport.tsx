import type { ReactNode } from "react";
import type { AnalystReport as Report } from "@contextdev/core";
import { Layers, Award, CheckCircle2, Zap, Lightbulb, Compass } from "lucide-react";
import { Badge } from "./ui/badge.js";

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
        <span className="text-primary" aria-hidden="true">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function AnalystReport({ report }: { report: Report }) {
  const { overview, segments, leaders, tableStakes, differentiators, gaps, picks } = report;
  return (
    <article className="flex flex-col gap-7 rule-t pt-5">
      <h2 className="display text-lg text-fg">Analyst report</h2>

      {overview && <p className="narrative max-w-[72ch] text-fg">{overview}</p>}

      {segments.length > 0 && (
        <Section icon={<Layers size={14} />} title="Segments">
          <div className="flex flex-col divide-y divide-border">
            {segments.map((s) => (
              <div key={s.name} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-fg">{s.name}</span>
                  {s.members.map((m) => (<Badge key={m} variant="neutral">{m}</Badge>))}
                </div>
                {s.note && <p className="narrative mt-1 text-[15px] text-muted">{s.note}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
        {leaders.length > 0 && (
          <Section icon={<Award size={14} />} title="Leaders">
            <ul className="flex flex-col gap-2">
              {leaders.map((l) => (
                <li key={l.name} className="text-[15px] leading-relaxed">
                  <span className="font-semibold text-fg">{l.name}</span>
                  {l.why && <span className="text-muted">: {l.why}</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {tableStakes.length > 0 && (
          <Section icon={<CheckCircle2 size={14} />} title="Table stakes">
            <div className="flex flex-wrap gap-1.5">
              {tableStakes.map((t) => (<Badge key={t} variant="neutral">{t}</Badge>))}
            </div>
          </Section>
        )}
      </div>

      {differentiators.length > 0 && (
        <Section icon={<Zap size={14} />} title="What sets them apart">
          <ul className="flex flex-col gap-2">
            {differentiators.map((d) => (
              <li key={d.player + d.edge} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                <span className="shrink-0 font-semibold text-fg sm:w-32">{d.player}</span>
                <span className="text-[15px] leading-relaxed text-muted">{d.edge}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
        {gaps.length > 0 && (
          <Section icon={<Lightbulb size={14} />} title="Whitespace">
            <ul className="flex flex-col gap-1.5">
              {gaps.map((g) => (
                <li key={g} className="flex items-start gap-2 text-[15px] leading-relaxed text-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {g}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {picks.length > 0 && (
          <Section icon={<Compass size={14} />} title="Pick by use case">
            <ul className="flex flex-col gap-2">
              {picks.map((p) => (
                <li key={p.useCase} className="text-[15px] leading-relaxed">
                  <span className="text-muted">{p.useCase} → </span>
                  <span className="font-semibold text-fg">{p.player}</span>
                  {p.why && <span className="text-muted"> ({p.why})</span>}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </article>
  );
}
