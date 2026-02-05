'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Flower2, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { speciesApi } from '@/lib/api/species';
import type { Species } from '@/types';

export default function SpeciesListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['public-species', searchQuery, page],
    queryFn: () => speciesApi.getAll({ search: searchQuery, page, per_page: 24 }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Flower2 className="h-8 w-8 text-green-600" />
              Plant Species Database
            </h1>
            <p className="text-gray-600 mt-2">
              Browse our collection of Indonesian herbal plants
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by species name, family, or local name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 py-6"
              />
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Flower2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No species found matching your search.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Found {data?.total || 0} species
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map((species: Species) => (
                  <Link key={species.id} href={`/species/${species.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-lg italic text-green-700">
                          {species.scientific_name}
                        </CardTitle>
                        <CardDescription>
                          {species.family && (
                            <span className="text-sm">Family: {species.family}</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex-1">
                          {species.local_names && species.local_names.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Local Names:</p>
                              <div className="flex flex-wrap gap-1">
                                {species.local_names.slice(0, 3).map((ln, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {ln.name}
                                  </Badge>
                                ))}
                                {species.local_names.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{species.local_names.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm pt-3 border-t mt-auto">
                          <span className="text-gray-500">
                            {species.compounds_count ?? species.compounds?.length ?? 0} compounds
                          </span>
                          <span className="text-green-600 flex items-center gap-1">
                            View details <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {data && data.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {data.last_page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                    disabled={page === data.last_page}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}