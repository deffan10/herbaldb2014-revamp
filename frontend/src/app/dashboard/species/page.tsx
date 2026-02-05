'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Flower2,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth';
import { speciesApi } from '@/lib/api/species';
import type { Species } from '@/types';

export default function SpeciesPage() {
  const { isAdmin, isContributor } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['species', searchQuery, familyFilter, page],
    queryFn: () => speciesApi.getAll({ 
      search: searchQuery, 
      family: familyFilter !== 'all' ? familyFilter : undefined,
      page,
      per_page: 10 
    }),
  });

  const { data: families = [] } = useQuery({
    queryKey: ['species-families'],
    queryFn: () => speciesApi.getFamilies(),
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'pending':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      case 'rejected':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flower2 className="h-6 w-6" />
            Species Database
          </h1>
          <p className="text-gray-500 mt-1">
            Browse and manage plant species in the database
          </p>
        </div>
        {(isAdmin() || isContributor()) && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/species/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Species
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Species</CardTitle>
              <CardDescription>
                {data?.total || data?.meta?.total || 0} species found
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search species..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 w-64"
                />
              </div>
              <Select 
                value={familyFilter} 
                onValueChange={(v) => {
                  setFamilyFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {families.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load species. Please try again.
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No species found matching your criteria.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Species Name</TableHead>
                    <TableHead>Family</TableHead>
                    <TableHead>Local Names</TableHead>
                    <TableHead>Compounds</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((species: Species) => (
                    <TableRow key={species.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium italic">{species.scientific_name}</p>
                          {species.variety && (
                            <p className="text-xs text-gray-500">
                              var. {species.variety}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{species.family || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {species.local_names?.slice(0, 2).map((ln, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {ln.name}
                            </Badge>
                          ))}
                          {(species.local_names?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(species.local_names?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {species.compounds_count || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(species.status || 'approved')}>
                          {species.status || 'approved'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/species/${species.id}`} className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                View Public Page
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/species/${species.id}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {(isAdmin() || isContributor()) && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/species/${species.id}/edit`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {isAdmin() && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 flex items-center gap-2">
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {(data?.last_page || data?.meta?.last_page || 0) > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing page {page} of {data?.last_page || data?.meta?.last_page} ({data?.total || data?.meta?.total} results)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(data?.last_page || data?.meta?.last_page || 1, p + 1))}
                      disabled={page === (data?.last_page || data?.meta?.last_page)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}