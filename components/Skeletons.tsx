"use client";

/** Skeleton loader for results list — calm, no spinners */
export function ResultsSkeleton() {
  return (
    <ul className="space-y-2" aria-busy="true" aria-label="Loading results">
      {[1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
        >
          <div className="h-4 w-4/5 rounded bg-slate-200 animate-pulse dark:bg-slate-700" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-100 animate-pulse dark:bg-slate-700" />
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-14 rounded-full bg-slate-100 animate-pulse dark:bg-slate-700" />
            <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse dark:bg-slate-700" />
          </div>
        </li>
      ))}
    </ul>
  );
}
