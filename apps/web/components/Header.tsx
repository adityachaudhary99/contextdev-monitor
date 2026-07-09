'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import ThemeToggle from "./ThemeToggle.js";
import { cn } from "../lib/cn.js";

const NAV = [
  { href: "/", label: "Map a market" },
  { href: "/landscape", label: "Landscapes" },
];

export default function Header() {
  const pathname = usePathname() || "";
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="flex items-baseline gap-2 text-fg">
          <span className="display text-[15px] uppercase tracking-[0.06em]">Intelligence Monitor</span>
          <span className="stamp hidden text-primary sm:inline">by context.dev</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
          <a
            href="https://github.com/adityachaudhary99/contextdev-monitor"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Github size={16} aria-hidden="true" />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
