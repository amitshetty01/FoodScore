import { SearchExperience } from '@/components/features/SearchExperience';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams }: SearchPageProps): Metadata {
  return {
    title: searchParams.q ? `"${searchParams.q}" — FoodScore` : 'Search — FoodScore',
    description: `Search results for ${searchParams.q} on FoodScore. Get health ratings for food products.`,
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return <SearchExperience defaultQuery={searchParams.q || ''} />;
}
