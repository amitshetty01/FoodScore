export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <div className="w-14 h-14 rounded-full border-2 border-zinc-100 dark:border-zinc-800" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-300 animate-spin" />
          <div className="absolute inset-2 w-10 h-10 rounded-full border-2 border-transparent border-b-emerald-400 border-l-emerald-200 animate-spin animation-delay-500" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading</p>
          <div className="flex gap-1 mt-1 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
