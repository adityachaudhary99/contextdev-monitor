import type { Landscape } from "../landscape/types.js";

export interface LandscapeStore {
  get(slug: string): Promise<Landscape | null>;
  save(slug: string, landscape: Landscape): Promise<void>;
  list(): Promise<string[]>;
}

export class InMemoryLandscapeStore implements LandscapeStore {
  private readonly bySlug = new Map<string, Landscape>();
  async get(slug: string): Promise<Landscape | null> { return this.bySlug.get(slug) ?? null; }
  async save(slug: string, landscape: Landscape): Promise<void> { this.bySlug.set(slug, landscape); }
  async list(): Promise<string[]> { return [...this.bySlug.keys()]; }
}
