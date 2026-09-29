import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-[13px] font-medium text-fg/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusStyles = {
  live: "bg-success-soft text-success",
  completed: "bg-success-soft text-success",
  "in-progress": "bg-accent-soft text-accent",
  "in-development": "bg-accent-soft text-accent",
  coursework: "bg-surface-2 text-muted",
  upcoming: "bg-warning-soft text-warning",
} as const;

const statusLabels = {
  live: "Live",
  completed: "Completed",
  "in-progress": "In progress",
  "in-development": "In development",
  coursework: "Coursework",
  upcoming: "Upcoming",
} as const;

export function StatusBadge({ status }: { status: keyof typeof statusStyles }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {status === "live" ? <span className="size-1.5 animate-pulse rounded-full bg-current" /> : null}
      {statusLabels[status]}
    </span>
  );
}
