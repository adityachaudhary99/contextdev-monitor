import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runEvalCase, type EvalCase } from "./harness.js";

const load = (f: string) => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${f}`, import.meta.url)), "utf8"));

const cases: EvalCase[] = [
  { name: "firecrawl-standard-price-bump", t1: load("pricing-firecrawl-t1.json"), t2: load("pricing-firecrawl-t2.json"), expectChangedKinds: ["price_changed"] },
];

let failures = 0;
for (const c of cases) {
  const r = runEvalCase(c);
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  detected=[${r.detectedKinds.join(",")}]`);
  if (!r.pass) failures++;
}
console.log(`\n${cases.length - failures}/${cases.length} eval cases passed`);
process.exit(failures === 0 ? 0 : 1);
