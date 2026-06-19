export type SourceFailure = { url: string; reason: string };
export type Result<T> = { ok: true; value: T } | { ok: false; failure: SourceFailure };
