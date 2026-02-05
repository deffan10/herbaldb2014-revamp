'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, FlaskConical, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { compoundsApi } from '@/lib/api/compounds';
import type { Compound } from '@/types';

export default function CompoundsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['public-compounds', searchQuery, page],
    queryFn: () => compoundsApi.getAll({ search: searchQuery, page, per_page: 24 }),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              Bioactive Compounds Database
            </h1>
            <p className="text-gray-600 mt-2">
              Explore chemical compounds found in Indonesian herbal plants
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by compound name, formula, or group..."
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
              <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No compounds found matching your search.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Found {data?.total || 0} compounds
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map((compound: Compound) => (
                  <Link key={compound.id} href={`/compounds/${compound.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-700">
                          {compound.name}
                        </CardTitle>
                        <CardDescription>
                          {compound.group && (
                            <Badge variant="outline" className="text-xs">
                              {compound.group.name}
                            </Badge>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <div className="flex-1">
                          {compound.knapsack_id && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500">KNApSAcK ID:</p>
                              <p className="font-mono text-sm">{compound.knapsack_id}</p>
                            </div>
                          )}
                          
                          {compound.pubchem_id && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-500">PubChem ID:</p>
                              <p className="font-mono text-sm">{compound.pubchem_id}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm pt-3 border-t mt-auto">
                          <span className="text-gray-500">
                            Found in {compound.species_count ?? compound.species?.length ?? 0} species
                          </span>
                          <span className="text-blue-600 flex items-center gap-1">
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