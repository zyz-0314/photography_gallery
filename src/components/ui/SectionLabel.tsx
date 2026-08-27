import { cx } from "@/lib/cx";

/** Small uppercase label with a hairline rule. */
export function SectionLabel({
  children,
  className,
  line = true,
}: {
  children: React.ReactNode;
  className?: string;
  line?: boolean;
}) {
  return (
    <div
      className={cx("flex items-center gap-3", className)}
    >
      {line && <span className="h-px w-8 bg-line" />}
      <span className="label text-muted">{children}</span>
    </div>
  );
}
