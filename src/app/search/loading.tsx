import { Skeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-16 glass rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-3xl" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 glass rounded-2xl">
                  <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
