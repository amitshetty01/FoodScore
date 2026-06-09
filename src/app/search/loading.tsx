import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function SearchLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="h-16 glass rounded-2xl mb-8 animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
