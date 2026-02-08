'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
  Calendar,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api/client';

interface Reference {
  id: number;
  source_name: string;
  authors: string | null;
  year: number | null;
  type: string | null;
  url: string | null;
  created_by: number | null;
  created_at: string;
}

export default function ReferencesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<Reference | null>(null);
  const [deletingRef, setDeletingRef] = useState<Reference | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    source_name: '',
    authors: '',
    year: '',
    type: '',
    url: '',
  });

  // Fetch references
  const { data: referencesData, isLoading } = useQuery({
    queryKey: ['references', searchQuery],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      const { data } = await api.get('/references', { params });
      return data;
    },
  });

  const references: Reference[] = referencesData?.data || [];

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        source_name: data.source_name,
        authors: data.authors || null,
        year: data.year ? parseInt(data.year) : null,
        type: data.type || null,
        url: data.url || null,
      };

      if (editingRef) {
        return api.put(`/references/${editingRef.id}`, payload);
      }
      return api.post('/references', payload);
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: editingRef ? 'Referensi berhasil diperbarui' : 'Referensi baru berhasil ditambahkan',
      });
      queryClient.invalidateQueries({ queryKey: ['references'] });
      closeDialog();
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.delete(`/references/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Referensi berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['references'] });
      setIsDeleteDialogOpen(false);
      setDeletingRef(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan',
        variant: 'destructive',
      });
    },
  });

  const openCreateDialog = () => {
    setEditingRef(null);
    setFormData({
      source_name: '',
      authors: '',
      year: '',
      type: '',
      url: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (ref: Reference) => {
    setEditingRef(ref);
    setFormData({
      source_name: ref.source_name,
      authors: ref.authors || '',
      year: ref.year?.toString() || '',
      type: ref.type || '',
      url: ref.url || '',
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRef(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.source_name.trim()) {
      toast({
        title: 'Error',
        description: 'Nama sumber wajib diisi',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const confirmDelete = (ref: Reference) => {
    setDeletingRef(ref);
    setIsDeleteDialogOpen(true);
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case 'book':
        return <Badge className="bg-blue-100 text-blue-700">Buku</Badge>;
      case 'journal':
        return <Badge className="bg-purple-100 text-purple-700">Jurnal</Badge>;
      case 'website':
        return <Badge className="bg-green-100 text-green-700">Website</Badge>;
      case 'other':
        return <Badge className="bg-gray-100 text-gray-700">Lainnya</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Referensi
          </h1>
          <p className="text-gray-500 mt-1">
            Daftar sumber referensi untuk data spesies dan senyawa
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Referensi
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari referensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Referensi</CardTitle>
          <CardDescription>
            Total {references.length} referensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Tidak ada referensi yang cocok dengan pencarian' : 'Belum ada referensi'}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Sumber</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {references.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {ref.source_name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ref.authors || '-'}
                    </TableCell>
                    <TableCell>
                      {ref.year || '-'}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(ref.type)}
                    </TableCell>
                    <TableCell>
                      {ref.url ? (
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Link
                        </a>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(ref)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isAdmin() && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => confirmDelete(ref)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRef ? 'Edit Referensi' : 'Tambah Referensi Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingRef ? 'Perbarui informasi referensi' : 'Tambahkan sumber referensi baru ke database'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source_name">Nama Sumber *</Label>
              <Input
                id="source_name"
                placeholder="Contoh: Jurnal Farmasi Indonesia Vol 1"
                value={formData.source_name}
                onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authors">Penulis</Label>
              <Input
                id="authors"
                placeholder="Contoh: Dr. Ahmad, Prof. Budi"
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Tahun</Label>
                <Input
                  id="year"
                  type="number"
                  min="1800"
                  max={new Date().getFullYear() + 1}
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipe</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Buku</SelectItem>
                    <SelectItem value="journal">Jurnal</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Referensi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus referensi &quot;{deletingRef?.source_name}&quot;?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRef && deleteMutation.mutate(deletingRef.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
