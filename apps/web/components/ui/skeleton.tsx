import { cn } from "../../lib/cn.js";
export function Skeleton({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted/20", className)} {...p} />;
}
