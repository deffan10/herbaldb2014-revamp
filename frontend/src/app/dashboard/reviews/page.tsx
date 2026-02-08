'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  FileCheck,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Flower2,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { speciesApi } from '@/lib/api/species';
import { compoundsApi } from '@/lib/api/compounds';
import api from '@/lib/api/client';
import type { Species, Compound } from '@/types';

interface ReviewDialogState {
  open: boolean;
  type: 'species' | 'compound';
  id: number | null;
  name: string;
  action: 'approve' | 'reject' | null;
}

export default function ReviewsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewDialog, setReviewDialog] = useState<ReviewDialogState>({
    open: false,
    type: 'species',
    id: null,
    name: '',
    action: null,
  });
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch pending species
  const { data: pendingSpecies, isLoading: speciesLoading } = useQuery({
    queryKey: ['pending-species'],
    queryFn: async () => {
      const { data } = await api.get('/species', { params: { status: 'pending', per_page: 50 } });
      return data;
    },
  });

  // Fetch pending compounds
  const { data: pendingCompounds, isLoading: compoundsLoading } = useQuery({
    queryKey: ['pending-compounds'],
    queryFn: async () => {
      const { data } = await api.get('/compounds', { params: { status: 'pending', per_page: 50 } });
      return data;
    },
  });

  const verifySpeciesMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: 'approve' | 'reject'; notes?: string }) =>
      speciesApi.verify(id, action, notes),
    onSuccess: (_, variables) => {
      toast({
        title: 'Berhasil',
        description: `Spesies berhasil ${variables.action === 'approve' ? 'disetujui' : 'ditolak'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-species'] });
      queryClient.invalidateQueries({ queryKey: ['species'] });
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

  const verifyCompoundMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: number; action: 'approve' | 'reject'; notes?: string }) =>
      compoundsApi.verify(id, action, notes),
    onSuccess: (_, variables) => {
      toast({
        title: 'Berhasil',
        description: `Senyawa berhasil ${variables.action === 'approve' ? 'disetujui' : 'ditolak'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-compounds'] });
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
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

  const openReviewDialog = (
    type: 'species' | 'compound',
    id: number,
    name: string,
    action: 'approve' | 'reject'
  ) => {
    setReviewDialog({ open: true, type, id, name, action });
    setNotes('');
  };

  const closeDialog = () => {
    setReviewDialog({ open: false, type: 'species', id: null, name: '', action: null });
    setNotes('');
    setIsProcessing(false);
  };

  const handleReview = async () => {
    if (!reviewDialog.id || !reviewDialog.action) return;
    
    setIsProcessing(true);
    try {
      if (reviewDialog.type === 'species') {
        await verifySpeciesMutation.mutateAsync({
          id: reviewDialog.id,
          action: reviewDialog.action,
          notes: notes || undefined,
        });
      } else {
        await verifyCompoundMutation.mutateAsync({
          id: reviewDialog.id,
          action: reviewDialog.action,
          notes: notes || undefined,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const speciesList = pendingSpecies?.data || [];
  const compoundsList = pendingCompounds?.data || [];
  const totalPending = speciesList.length + compoundsList.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileCheck className="h-6 w-6" />
          Review Pengajuan
        </h1>
        <p className="text-gray-500 mt-1">
          Review dan verifikasi data yang diajukan oleh kontributor
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalPending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Flower2 className="h-4 w-4" /> Spesies Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{speciesList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <FlaskConical className="h-4 w-4" /> Senyawa Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{compoundsList.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="species" className="w-full">
        <TabsList>
          <TabsTrigger value="species" className="flex items-center gap-1">
            <Flower2 className="h-4 w-4" />
            Spesies ({speciesList.length})
          </TabsTrigger>
          <TabsTrigger value="compounds" className="flex items-center gap-1">
            <FlaskConical className="h-4 w-4" />
            Senyawa ({compoundsList.length})
          </TabsTrigger>
        </TabsList>

        {/* Species Tab */}
        <TabsContent value="species">
          <Card>
            <CardHeader>
              <CardTitle>Spesies Menunggu Verifikasi</CardTitle>
              <CardDescription>
                Data spesies yang diajukan oleh kontributor
              </CardDescription>
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
                  Tidak ada spesies yang menunggu verifikasi
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Ilmiah</TableHead>
                      <TableHead>Famili</TableHead>
                      <TableHead>Diajukan Oleh</TableHead>
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
                        <TableCell>
                          <span className="text-sm">{species.creator?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {species.created_at ? new Date(species.created_at).toLocaleDateString('id-ID') : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/species/${species.id}/edit`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => openReviewDialog('species', species.id, species.scientific_name, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Setujui
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => openReviewDialog('species', species.id, species.scientific_name, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Tolak
                            </Button>
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
        </TabsContent>

        {/* Compounds Tab */}
        <TabsContent value="compounds">
          <Card>
            <CardHeader>
              <CardTitle>Senyawa Menunggu Verifikasi</CardTitle>
              <CardDescription>
                Data senyawa yang diajukan oleh kontributor
              </CardDescription>
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
                  Tidak ada senyawa yang menunggu verifikasi
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Senyawa</TableHead>
                      <TableHead>Grup</TableHead>
                      <TableHead>Diajukan Oleh</TableHead>
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
                        <TableCell>
                          <span className="text-sm">{compound.creator?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {compound.created_at ? new Date(compound.created_at).toLocaleDateString('id-ID') : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/compounds/${compound.id}/edit`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => openReviewDialog('compound', compound.id, compound.name, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Setujui
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => openReviewDialog('compound', compound.id, compound.name, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Tolak
                            </Button>
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
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? 'Setujui' : 'Tolak'} {reviewDialog.type === 'species' ? 'Spesies' : 'Senyawa'}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.action === 'approve' 
                ? `Anda akan menyetujui "${reviewDialog.name}". Data akan dipublikasikan.`
                : `Anda akan menolak "${reviewDialog.name}". Kontributor akan diberi tahu.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Catatan {reviewDialog.action === 'reject' ? '(wajib untuk penolakan)' : '(opsional)'}
              </label>
              <Textarea
                placeholder={
                  reviewDialog.action === 'reject'
                    ? 'Jelaskan alasan penolakan...'
                    : 'Tambahkan catatan jika diperlukan...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Batal
            </Button>
            <Button
              onClick={handleReview}
              disabled={isProcessing || (reviewDialog.action === 'reject' && !notes.trim())}
              className={
                reviewDialog.action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : reviewDialog.action === 'approve' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {reviewDialog.action === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
