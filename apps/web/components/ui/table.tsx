import { cn } from "../../lib/cn.js";
export const Table = (p: React.HTMLAttributes<HTMLTableElement>) => <table className={cn("w-full border-collapse text-sm", p.className)} {...p} />;
export const Th = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn("text-left text-[11px] font-semibold uppercase tracking-wide text-muted pb-2 px-3", p.className)} {...p} />;
export const Td = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn("px-3 py-3 border-t border-border text-fg", p.className)} {...p} />;
export const Thead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const Tbody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const Tr = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...p} />;
