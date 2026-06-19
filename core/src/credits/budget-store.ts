export interface BudgetStore {
  /** Atomically consume `units` if it would not exceed the cap; returns whether it succeeded. */
  tryConsume(units: number, day: string): Promise<boolean>;
  spent(day: string): Promise<number>;
}

export class InMemoryBudgetStore implements BudgetStore {
  private readonly byDay = new Map<string, number>();
  constructor(private readonly dailyCap: number) {}
  async tryConsume(units: number, day: string): Promise<boolean> {
    const current = this.byDay.get(day) ?? 0;
    if (current + units > this.dailyCap) return false;
    this.byDay.set(day, current + units);
    return true;
  }
  async spent(day: string): Promise<number> {
    return this.byDay.get(day) ?? 0;
  }
}
