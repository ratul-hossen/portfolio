import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary: "bg-accent text-white hover:brightness-110",
  secondary: "bg-surface-2 text-fg hover:bg-line",
  ghost: "text-accent hover:underline underline-offset-4 px-0!",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  external?: boolean;
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-medium transition-all",
    variants[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
