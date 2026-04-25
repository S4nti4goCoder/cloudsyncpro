import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1 sm:gap-1.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={isFirst}
        className={cn(
          "flex h-8 items-center gap-1 rounded-md border border-border px-2 sm:px-3",
          "text-xs font-medium text-foreground transition-colors",
          "hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <div className="flex items-center gap-1">
        {buildPageList(page, pageCount).map((item, idx) =>
          item === "…" ? (
            <span
              key={`gap-${idx}`}
              className="px-1 text-xs text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                item === page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-muted",
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={isLast}
        className={cn(
          "flex h-8 items-center gap-1 rounded-md border border-border px-2 sm:px-3",
          "text-xs font-medium text-foreground transition-colors",
          "hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40",
        )}
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * Build a compact list of page numbers with ellipsis.
 * Examples (current=5, pageCount=10): [1, "…", 4, 5, 6, "…", 10]
 *           (current=1, pageCount=3):  [1, 2, 3]
 */
function buildPageList(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const result: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) result.push("…");
  for (let i = start; i <= end; i++) result.push(i);
  if (end < pageCount - 1) result.push("…");

  result.push(pageCount);
  return result;
}
