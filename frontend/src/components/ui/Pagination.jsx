/**
 * Pagination — numbered page controls.
 * Shows: « Prev  1 2 3 … 8 9 10  Next »
 */
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildPages(current, total) {
  if (total <= 7) return range(1, total);

  if (current <= 4) return [...range(1, 5), '...', total];
  if (current >= total - 3) return [1, '...', ...range(total - 4, total)];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function Pagination({ page, pages, total, limit, onPageChange, loading = false }) {
  if (!pages || pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);
  const pageList = buildPages(page, pages);

  const btn = (label, target, disabled, isActive = false) => (
    <button
      key={`${label}-${target}`}
      onClick={() => !disabled && !isActive && onPageChange(target)}
      disabled={disabled || isActive || loading}
      className={`
        min-w-[36px] h-9 px-2.5 rounded-xl text-sm font-medium transition-all
        ${isActive
          ? 'bg-primary-600 text-white shadow-sm cursor-default'
          : disabled
          ? 'text-slate-300 cursor-not-allowed'
          : 'text-muted hover:bg-slate-100 hover:text-ink'}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Result range */}
      <p className="text-xs text-muted">
        Showing <span className="font-semibold text-ink">{start.toLocaleString()}–{end.toLocaleString()}</span> of{' '}
        <span className="font-semibold text-ink">{total.toLocaleString()}</span> jobs
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => page > 1 && onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium text-muted hover:bg-slate-100 hover:text-ink disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
        >
          <FaChevronLeft className="h-3 w-3" /> Prev
        </button>

        {pageList.map((p, i) =>
          p === '...'
            ? <span key={`ellipsis-${i}`} className="px-1 text-muted text-sm select-none">...</span>
            : btn(p, p, false, p === page)
        )}

        {/* Next */}
        <button
          onClick={() => page < pages && onPageChange(page + 1)}
          disabled={page >= pages || loading}
          className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium text-muted hover:bg-slate-100 hover:text-ink disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
        >
          Next <FaChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Jump to page — shown when > 10 pages */}
      {pages > 10 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const val = parseInt(e.target.p.value, 10);
            if (val >= 1 && val <= pages) { onPageChange(val); e.target.reset(); }
          }}
          className="flex items-center gap-2"
        >
          <label className="text-xs text-muted">Go to page</label>
          <input
            name="p"
            type="number"
            min={1}
            max={pages}
            className="input !w-16 !py-1.5 !text-sm text-center"
            placeholder={page}
          />
          <button type="submit" className="btn-outline !py-1.5 !text-xs">Go</button>
        </form>
      )}
    </div>
  );
}
