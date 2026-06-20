import { cn } from "../../lib/cn.js";
export function Button({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-strong disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", className)} {...p} />;
}
