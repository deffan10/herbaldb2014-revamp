'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Leaf, FlaskConical, Loader2, Filter, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { speciesApi } from '@/lib/api/species';
import { compoundsApi } from '@/lib/api/compounds';
import type { Species, Compound } from '@/types';

// Common search suggestions for virtues/uses
const virtueSuggestions = [
  'demam', 'batuk', 'diabetes', 'hipertensi', 'malaria',
  'diare', 'luka', 'nyeri', 'infeksi', 'kanker',
  'antioksidan', 'antiinflamasi', 'antibakteri', 'antivirus'
];

const ITEMS_PER_PAGE = 8; // 2 columns x 4 rows

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  const initialVirtue = searchParams.get('virtue') || '';
  const initialPage = parseInt(searchParams.get('page') || '1');
  
  const [query, setQuery] = useState(initialQuery);
  const [virtueQuery, setVirtueQuery] = useState(initialVirtue);
  const [searchType, setSearchType] = useState(initialType);
  const [searchMode, setSearchMode] = useState<'general' | 'virtue'>(initialVirtue ? 'virtue' : 'general');
  const [loading, setLoading] = useState(false);
  const [speciesResults, setSpeciesResults] = useState<Species[]>([]);
  const [compoundResults, setCompoundResults] = useState<Compound[]>([]);
  const [speciesTotal, setSpeciesTotal] = useState(0);
  const [compoundsTotal, setCompoundsTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const performSearch = async (searchQuery: string, virtue?: string, page: number = 1) => {
    if (!searchQuery.trim() && !virtue?.trim()) {
      setSpeciesResults([]);
      setCompoundResults([]);
      setSpeciesTotal(0);
      setCompoundsTotal(0);
      return;
    }

    setLoading(true);
    try {
      // Build params with pagination for virtue search
      const speciesParams: any = { 
        per_page: virtue?.trim() ? ITEMS_PER_PAGE : 10,
        page: virtue?.trim() ? page : 1
      };
      const compoundsParams: any = { per_page: 10 };
      
      if (searchQuery.trim()) {
        speciesParams.search = searchQuery;
        compoundsParams.search = searchQuery;
      }
      
      if (virtue?.trim()) {
        speciesParams.virtue = virtue;
      }

      // Search species and compounds in parallel
      const [speciesRes, compoundsRes] = await Promise.all([
        speciesApi.getAll(speciesParams),
        virtue ? Promise.resolve({ data: [], total: 0 }) : compoundsApi.getAll(compoundsParams),
      ]);

      setSpeciesResults(speciesRes.data || []);
      setSpeciesTotal(speciesRes.total || 0);
      setTotalPages(Math.ceil((speciesRes.total || 0) / ITEMS_PER_PAGE));
      setCompoundResults(compoundsRes.data || []);
      setCompoundsTotal(compoundsRes.total || 0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery || initialVirtue) {
      performSearch(initialQuery, initialVirtue, currentPage);
    }
  }, [initialQuery, initialVirtue, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (initialVirtue) {
      router.push(`/search?virtue=${encodeURIComponent(initialVirtue)}&page=${newPage}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'virtue' && virtueQuery.trim()) {
      router.push(`/search?virtue=${encodeURIComponent(virtueQuery.trim())}`);
      performSearch('', virtueQuery.trim());
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const handleVirtueSuggestionClick = (suggestion: string) => {
    setVirtueQuery(suggestion);
    setSearchMode('virtue');
    router.push(`/search?virtue=${encodeURIComponent(suggestion)}`);
    performSearch('', suggestion);
  };

  const totalResults = speciesTotal + compoundsTotal;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Search className="h-8 w-8 text-green-600" />
              Search Database
            </h1>
            <p className="text-gray-600 mt-2">
              Search across species, compounds, local names, and uses/virtues
            </p>
          </div>

          {/* Search Mode Tabs */}
          <div className="mb-6 flex justify-center">
            <Tabs value={searchMode} onValueChange={(v) => {
              setSearchMode(v as 'general' | 'virtue');
              // Clear results and query when switching tabs
              setSpeciesResults([]);
              setCompoundResults([]);
              setSpeciesTotal(0);
              setCompoundsTotal(0);
              if (v === 'virtue') {
                setQuery('');
              } else {
                setVirtueQuery('');
              }
              // Clear URL params
              router.push('/search');
            }}>
              <TabsList>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Pencarian Umum
                </TabsTrigger>
                <TabsTrigger value="virtue" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Cari Berdasarkan Manfaat
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            {searchMode === 'general' ? (
              <div className="flex gap-4 max-w-2xl mx-auto">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search plants, compounds, local names..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 py-6 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
                  Search
                </Button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-grow">
                    <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400" />
                    <Input
                      type="text"
                      placeholder="Contoh: demam, diabetes, luka, batuk..."
                      value={virtueQuery}
                      onChange={(e) => setVirtueQuery(e.target.value)}
                      className="pl-10 py-6 text-lg"
                    />
                  </div>
                  <Button type="submit" size="lg" className="bg-pink-600 hover:bg-pink-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Cari Manfaat
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-sm text-gray-500">Saran:</span>
                  {virtueSuggestions.map((suggestion) => (
                    <Badge 
                      key={suggestion}
                      variant="outline"
                      className="cursor-pointer hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300 transition-colors"
                      onClick={() => handleVirtueSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          ) : (initialQuery || initialVirtue) ? (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {initialVirtue ? (
                  <>Ditemukan {speciesTotal} tanaman dengan manfaat terkait "{initialVirtue}"</>
                ) : (
                  <>Found {totalResults} results for "{initialQuery}"</>
                )}
              </p>

              {initialVirtue ? (
                // Virtue search results - show species in grid 2 columns x 4 rows with pagination
                <div className="space-y-6">
                  {speciesResults.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        {speciesResults.map((species) => (
                          <Link key={species.id} href={`/species/${species.id}`}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg italic text-green-700">
                                      {species.scientific_name}
                                    </CardTitle>
                                    <CardDescription>
                                      {species.family && `Family: ${species.family}`}
                                    </CardDescription>
                                  </div>
                                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 shrink-0">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {species.virtues?.length || 0}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                {species.local_names && species.local_names.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {species.local_names.slice(0, 2).map((ln, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {ln.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {species.virtues && species.virtues.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {species.virtues[0]?.description || species.virtues[0]?.description_en}
                                    </p>
                                    {species.virtues.length > 1 && (
                                      <p className="text-xs text-green-600 mt-1">
                                        +{species.virtues.length - 1} manfaat lainnya
                                      </p>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className="w-10"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Tidak ditemukan tanaman dengan manfaat "{initialVirtue}"</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Coba kata kunci lain atau gunakan pencarian umum
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // General search results
                <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">
                    All Results ({totalResults})
                  </TabsTrigger>
                  <TabsTrigger value="species">
                    <Leaf className="h-4 w-4 mr-1" />
                    Species ({speciesTotal})
                  </TabsTrigger>
                  <TabsTrigger value="compounds">
                    <FlaskConical className="h-4 w-4 mr-1" />
                    Compounds ({compoundsTotal})
                  </TabsTrigger>
                </TabsList>

                {/* All Results */}
                <TabsContent value="all">
                  <div className="space-y-8">
                    {/* Species Section */}
                    {speciesResults.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Leaf className="h-5 w-5 text-green-600" />
                          Species ({speciesTotal})
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {speciesResults.slice(0, 6).map((species) => (
                            <Link key={species.id} href={`/species/${species.id}`}>
                              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg italic text-green-700">
                                    {species.scientific_name}
                                  </CardTitle>
                                  <CardDescription>
                                    {species.family && `Family: ${species.family}`}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {species.local_names && species.local_names.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {species.local_names.slice(0, 3).map((ln, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {ln.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                        {speciesTotal > 6 && (
                          <Link href={`/species?search=${encodeURIComponent(initialQuery)}`}>
                            <Button variant="outline" className="mt-4">
                              View all {speciesTotal} species results
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Compounds Section */}
                    {compoundResults.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-blue-600" />
                          Compounds ({compoundsTotal})
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {compoundResults.slice(0, 6).map((compound) => (
                            <Link key={compound.id} href={`/compounds/${compound.id}`}>
                              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardHeader className="pb-2">
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
                                <CardContent>
                                  {compound.knapsack_id && (
                                    <p className="text-sm text-gray-500">
                                      KNApSAcK: {compound.knapsack_id}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          ))}
                        </div>
                        {compoundsTotal > 6 && (
                          <Link href={`/compounds?search=${encodeURIComponent(initialQuery)}`}>
                            <Button variant="outline" className="mt-4">
                              View all {compoundsTotal} compound results
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}

                    {totalResults === 0 && (
                      <div className="text-center py-12">
                        <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No results found for "{initialQuery}"</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Try different keywords or check spelling
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Species Only */}
                <TabsContent value="species">
                  {speciesResults.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {speciesResults.map((species) => (
                        <Link key={species.id} href={`/species/${species.id}`}>
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg italic text-green-700">
                                {species.scientific_name}
                              </CardTitle>
                              <CardDescription>
                                {species.family && `Family: ${species.family}`}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {species.local_names && species.local_names.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {species.local_names.slice(0, 3).map((ln, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {ln.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No species found for "{initialQuery}"</p>
                    </div>
                  )}
                </TabsContent>

                {/* Compounds Only */}
                <TabsContent value="compounds">
                  {compoundResults.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {compoundResults.map((compound) => (
                        <Link key={compound.id} href={`/compounds/${compound.id}`}>
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader className="pb-2">
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
                            <CardContent>
                              {compound.knapsack_id && (
                                <p className="text-sm text-gray-500">
                                  KNApSAcK: {compound.knapsack_id}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No compounds found for "{initialQuery}"</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter a search term to find species and compounds</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-gray-400">Try searching for:</span>
                {['Curcuma', 'Zingiber', 'Alkaloid', 'Flavonoid'].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(term);
                      router.push(`/search?q=${term}`);
                      performSearch(term);
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
