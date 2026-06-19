export type Snapshot<T> = {
  trackerId: string;
  domain: string;
  capturedDay: string;
  sourceUrl: string;
  sourceHash: string;
  data: T;
};

export interface SnapshotStore {
  latest<T>(trackerId: string, domain: string): Promise<Snapshot<T> | null>;
  save<T>(snap: Snapshot<T>): Promise<void>;
}

export class InMemorySnapshotStore implements SnapshotStore {
  private readonly byKey = new Map<string, Snapshot<unknown>>();
  private key(trackerId: string, domain: string) {
    return `${trackerId}::${domain}`;
  }
  async latest<T>(trackerId: string, domain: string): Promise<Snapshot<T> | null> {
    return (this.byKey.get(this.key(trackerId, domain)) as Snapshot<T> | undefined) ?? null;
  }
  async save<T>(snap: Snapshot<T>): Promise<void> {
    this.byKey.set(this.key(snap.trackerId, snap.domain), snap as Snapshot<unknown>);
  }
}
