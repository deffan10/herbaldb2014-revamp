'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  FlaskConical,
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  FileCode,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { compoundsApi } from '@/lib/api/compounds';
import type { Compound, CompoundGroup } from '@/types';

export default function CompoundsPage() {
  const { isAdmin, isContributor } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['compounds', searchQuery, groupFilter, page],
    queryFn: () => compoundsApi.getAll({ 
      search: searchQuery, 
      compound_group_id: groupFilter !== 'all' ? parseInt(groupFilter) : undefined,
      page,
      per_page: 10 
    }),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['compound-groups'],
    queryFn: () => compoundsApi.getGroups(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => compoundsApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Senyawa berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal menghapus senyawa',
        variant: 'destructive',
      });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'pending':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      case 'rejected':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  const total = data?.total || data?.meta?.total || 0;
  const lastPage = data?.last_page || data?.meta?.last_page || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6" />
            Database Senyawa
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola senyawa bioaktif dalam database
          </p>
        </div>
        {(isAdmin() || isContributor()) && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/compounds/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Senyawa Baru
            </Link>
          </Button>
        )}
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Semua Senyawa</CardTitle>
              <CardDescription>
                {total} senyawa ditemukan
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari senyawa..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 w-full sm:w-48"
                />
              </div>
              <Select 
                value={groupFilter} 
                onValueChange={(v) => {
                  setGroupFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Grup</SelectItem>
                  {groups.map((group: CompoundGroup) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
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
              Gagal memuat data. Silakan coba lagi.
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada senyawa yang ditemukan.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Senyawa</TableHead>
                    <TableHead>Grup</TableHead>
                    <TableHead>KNApSAcK ID</TableHead>
                    <TableHead>PubChem ID</TableHead>
                    <TableHead>File MOL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((compound: Compound) => (
                    <TableRow key={compound.id}>
                      <TableCell>
                        <p className="font-medium">{compound.name}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {compound.compound_group?.name || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {compound.knapsack_id || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {compound.pubchem_id || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {compound.mol_file_path ? (
                          <Badge variant="outline" className="gap-1">
                            <FileCode className="h-3 w-3" />
                            MOL
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(compound.status || 'published')}>
                          {compound.status || 'published'}
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
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/compounds/${compound.id}`} className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Lihat di Publik
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/compounds/${compound.id}/edit`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            {(isAdmin() || isContributor()) && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/compounds/${compound.id}/edit`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {isAdmin() && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 flex items-center gap-2"
                                  onClick={() => setDeleteId(compound.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus
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
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Halaman {page} dari {lastPage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                      disabled={page === lastPage}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Senyawa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Senyawa akan dihapus permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
