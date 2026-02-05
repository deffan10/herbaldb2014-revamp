'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ClipboardList,
  Eye,
  Edit,
  Flower2,
  FlaskConical,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api/client';
import type { Species, Compound } from '@/types';

export default function SubmissionsPage() {
  const { user } = useAuthStore();

  // Fetch user's species
  const { data: mySpecies, isLoading: speciesLoading } = useQuery({
    queryKey: ['my-species'],
    queryFn: async () => {
      const { data } = await api.get('/species', { params: { created_by: user?.id, per_page: 50 } });
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user's compounds
  const { data: myCompounds, isLoading: compoundsLoading } = useQuery({
    queryKey: ['my-compounds'],
    queryFn: async () => {
      const { data } = await api.get('/compounds', { params: { created_by: user?.id, per_page: 50 } });
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <FileEdit className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  const speciesList = mySpecies?.data || [];
  const compoundsList = myCompounds?.data || [];

  // Calculate stats
  const speciesStats = {
    total: speciesList.length,
    draft: speciesList.filter((s: Species) => s.status === 'draft').length,
    pending: speciesList.filter((s: Species) => s.status === 'pending').length,
    published: speciesList.filter((s: Species) => s.status === 'published').length,
    rejected: speciesList.filter((s: Species) => s.status === 'rejected').length,
  };

  const compoundStats = {
    total: compoundsList.length,
    draft: compoundsList.filter((c: Compound) => c.status === 'draft').length,
    pending: compoundsList.filter((c: Compound) => c.status === 'pending').length,
    published: compoundsList.filter((c: Compound) => c.status === 'published').length,
    rejected: compoundsList.filter((c: Compound) => c.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Kontribusi Saya
        </h1>
        <p className="text-gray-500 mt-1">
          Lihat dan kelola data yang Anda kontribusikan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Kontribusi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{speciesStats.total + compoundStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4 text-orange-500" /> Menunggu Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {speciesStats.pending + compoundStats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> Dipublikasikan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {speciesStats.published + compoundStats.published}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" /> Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {speciesStats.rejected + compoundStats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="species" className="w-full">
        <TabsList>
          <TabsTrigger value="species" className="flex items-center gap-1">
            <Flower2 className="h-4 w-4" />
            Spesies ({speciesStats.total})
          </TabsTrigger>
          <TabsTrigger value="compounds" className="flex items-center gap-1">
            <FlaskConical className="h-4 w-4" />
            Senyawa ({compoundStats.total})
          </TabsTrigger>
        </TabsList>

        {/* Species Tab */}
        <TabsContent value="species">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Spesies Saya</CardTitle>
                <CardDescription>
                  Data spesies yang Anda kontribusikan
                </CardDescription>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/species/new">
                  Tambah Spesies
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {speciesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : speciesList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Flower2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>Anda belum mengontribusikan spesies apapun</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/species/new">Tambah Spesies Pertama</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Ilmiah</TableHead>
                      <TableHead>Famili</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {speciesList.map((species: Species) => (
                      <TableRow key={species.id}>
                        <TableCell>
                          <p className="font-medium italic">{species.scientific_name}</p>
                          <p className="text-xs text-gray-500">{species.species_code}</p>
                        </TableCell>
                        <TableCell>{species.family || '-'}</TableCell>
                        <TableCell>{getStatusBadge(species.status || 'draft')}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {species.created_at ? new Date(species.created_at).toLocaleDateString('id-ID') : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/species/${species.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {(species.status === 'draft' || species.status === 'rejected') && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/species/${species.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compounds Tab */}
        <TabsContent value="compounds">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Senyawa Saya</CardTitle>
                <CardDescription>
                  Data senyawa yang Anda kontribusikan
                </CardDescription>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/compounds/new">
                  Tambah Senyawa
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {compoundsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : compoundsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FlaskConical className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>Anda belum mengontribusikan senyawa apapun</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/compounds/new">Tambah Senyawa Pertama</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Senyawa</TableHead>
                      <TableHead>Grup</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compoundsList.map((compound: Compound) => (
                      <TableRow key={compound.id}>
                        <TableCell>
                          <p className="font-medium">{compound.name}</p>
                        </TableCell>
                        <TableCell>{compound.compound_group?.name || '-'}</TableCell>
                        <TableCell>{getStatusBadge(compound.status || 'draft')}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {compound.created_at ? new Date(compound.created_at).toLocaleDateString('id-ID') : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/compounds/${compound.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {(compound.status === 'draft' || compound.status === 'rejected') && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/compounds/${compound.id}/edit`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
