'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Upload, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { articleAdsApi } from '@/lib/api/articles';
import type { ArticleAd } from '@/types';
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

interface AdFormState {
  title: string;
  target_url: string;
  sort_order: number;
  is_active: boolean;
  image?: File;
}

export default function ArticleAdsPage() {
  const { isAdmin } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleAd | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleAd | null>(null);
  const [form, setForm] = useState<AdFormState>({ title: '', target_url: '', sort_order: 0, is_active: true });

  const { data: ads, isLoading } = useQuery<ArticleAd[]>({
    queryKey: ['article-ads-admin'],
    queryFn: () => articleAdsApi.getAdmin(),
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: AdFormState) => {
      if (editing) {
        return articleAdsApi.update(editing.id, payload);
      }
      if (!payload.image) {
        throw new Error('Gambar wajib diupload');
      }
      return articleAdsApi.create(payload as Required<AdFormState>);
    },
    onSuccess: () => {
      toast({ title: 'Berhasil', description: 'Iklan tersimpan.' });
      queryClient.invalidateQueries({ queryKey: ['article-ads-admin'] });
      setIsDialogOpen(false);
      setEditing(null);
      setForm({ title: '', target_url: '', sort_order: 0, is_active: true });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error?.message || error.response?.data?.message || 'Terjadi kesalahan', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => articleAdsApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Berhasil', description: 'Iklan dihapus.' });
      queryClient.invalidateQueries({ queryKey: ['article-ads-admin'] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error.response?.data?.message || 'Tidak bisa menghapus iklan', variant: 'destructive' });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', target_url: '', sort_order: 0, is_active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (ad: ArticleAd) => {
    setEditing(ad);
    setForm({
      title: ad.title || '',
      target_url: ad.target_url || '',
      sort_order: ad.sort_order || 0,
      is_active: ad.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center text-gray-500">Halaman ini khusus admin.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ToggleRight className="h-6 w-6 text-green-600" />
            Iklan Sidebar
          </h1>
          <p className="text-gray-500">Kelola banner iklan pada sidebar halaman artikel.</p>
        </div>
        <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Iklan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Iklan</CardTitle>
          <CardDescription>Total {ads?.length || 0} iklan</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Memuat...</div>
          ) : ads && ads.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <Card key={ad.id} className="overflow-hidden border">
                  {ad.image_url && (
                    <div className="h-32 bg-gray-100">
                      <img src={ad.image_url} alt={ad.title || 'Iklan'} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{ad.title || 'Tanpa judul'}</p>
                        <p className="text-xs text-gray-500">Order: {ad.sort_order}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        {ad.is_active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        <span>{ad.is_active ? 'Aktif' : 'Nonaktif'}</span>
                      </div>
                    </div>
                    {ad.target_url && (
                      <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-sm text-green-700 hover:underline">
                        {ad.target_url}
                      </a>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(ad)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(ad)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">Belum ada iklan.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Iklan' : 'Tambah Iklan'}</DialogTitle>
            <DialogDescription>Banner akan tampil pada sidebar halaman artikel.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Judul iklan (opsional)"
              />
            </div>
            <div className="space-y-2">
              <Label>Link tujuan</Label>
              <Input
                value={form.target_url}
                onChange={(e) => setForm((prev) => ({ ...prev, target_url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2 flex items-center gap-3 mt-6">
                <Label htmlFor="is_active" className="text-sm text-gray-700">Aktif</Label>
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gambar</Label>
              <Button type="button" variant="outline" className="gap-2" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>{form.image ? form.image.name : 'Upload gambar'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.files?.[0] }))}
                  />
                </label>
              </Button>
              {editing?.image_url && !form.image && (
                <div className="h-24 w-full rounded-md overflow-hidden border">
                  <img src={editing.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus iklan?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
