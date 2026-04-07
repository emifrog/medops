export function MedListItemSkeleton() {
  return (
    <div className="w-full p-3.5 md:p-4 bg-slate-800/40 border-2 border-slate-700/30 rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-slate-700/60 rounded-md w-2/5" />
            <div className="h-4 bg-slate-700/40 rounded-full w-14" />
          </div>
          <div className="h-3 bg-slate-700/40 rounded-md w-1/2" />
        </div>
        <div className="w-4 h-4 bg-slate-700/40 rounded shrink-0" />
      </div>
    </div>
  );
}

export function MedDetailSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="w-10 h-10 bg-slate-800 border-2 border-slate-700 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-6 bg-slate-700/60 rounded-md w-3/4" />
          <div className="h-4 bg-slate-700/40 rounded-md w-1/2" />
        </div>
      </div>
      {/* Actions */}
      <div className="flex gap-2">
        <div className="flex-1 h-11 bg-slate-800/50 border-2 border-slate-700/40 rounded-xl" />
        <div className="w-24 h-11 bg-slate-800/50 border-2 border-slate-700/40 rounded-xl" />
      </div>
      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {[80, 120, 90, 100, 72].map((w, i) => (
          <div
            key={i}
            className="h-5 bg-slate-700/40 rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>
      {/* Sections */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border-2 border-slate-700/40 bg-slate-800/50 p-4 space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700/50 rounded" />
            <div className="h-3 bg-slate-700/50 rounded-md w-1/4" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-700/30 rounded-md w-full" />
            <div className="h-3 bg-slate-700/30 rounded-md w-5/6" />
            <div className="h-3 bg-slate-700/30 rounded-md w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 bg-slate-800/40 border-2 border-slate-700/30 rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-700/50 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-700/50 rounded w-3/4" />
              <div className="h-2.5 bg-slate-700/30 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
