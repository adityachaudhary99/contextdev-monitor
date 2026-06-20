export function slugify(category: string): string {
  return category.trim().toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
export function deslugify(slug: string): string {
  return slug.replace(/-+/g, " ").replace(/\s+/g, " ").trim();
}
