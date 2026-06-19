import { CREDIT_COST, type Endpoint } from "../client/cost-table.js";

export class CreditLedger {
  private readonly log: Array<{ endpoint: Endpoint; cost: number }> = [];
  record(endpoint: Endpoint): void {
    this.log.push({ endpoint, cost: CREDIT_COST[endpoint] });
  }
  total(): number {
    return this.log.reduce((sum, e) => sum + e.cost, 0);
  }
  entries(): ReadonlyArray<{ endpoint: Endpoint; cost: number }> {
    return this.log;
  }
}
