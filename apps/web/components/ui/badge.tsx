import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn.js";
const badge = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", {
  variants: { variant: {
    neutral: "bg-surface text-muted border border-border",
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    change: "bg-change/10 text-change",
  } }, defaultVariants: { variant: "neutral" },
});
export function Badge({ variant, className, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ variant }), className)} {...p} />;
}
