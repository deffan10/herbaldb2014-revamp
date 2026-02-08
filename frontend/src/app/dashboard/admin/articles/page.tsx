'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Loader2, Upload, Calendar, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { articlesApi } from '@/lib/api/articles';
import type { Article, ArticlePayload, PaginatedResponse } from '@/types';
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

function RichTextEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd: string) => {
    document.execCommand(cmd, false);
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={() => exec('bold')}>
          B
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => exec('italic')}>
          I
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => exec('underline')}>
          U
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => exec('insertUnorderedList')}>
          Bullet
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => exec('insertOrderedList')}>
          Number
        </Button>
      </div>
      <div
        ref={ref}
        className="min-h-[200px] border rounded-md p-3 bg-white focus:outline-none"
        contentEditable
        onInput={() => onChange(ref.current?.innerHTML || '')}
        suppressContentEditableWarning
      />
    </div>
  );
}

export default function AdminArticlesPage() {
  const { isAdmin } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [form, setForm] = useState<ArticlePayload>({
    title: '',
    body_html: '',
    featured_image_path: '',
    published_at: new Date().toISOString().slice(0, 10),
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['admin-articles', page],
    queryFn: () => articlesApi.getPaginated({ page, per_page: 10 }),
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ArticlePayload) => {
      if (editing) {
        return articlesApi.update(editing.id, payload);
      }
      return articlesApi.create(payload);
    },
    onSuccess: () => {
      toast({ title: 'Berhasil', description: 'Artikel tersimpan.' });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setIsDialogOpen(false);
      setEditing(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan artikel',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => articlesApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Berhasil', description: 'Artikel dihapus.' });
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus artikel',
        variant: 'destructive',
      });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', body_html: '', featured_image_path: '', published_at: new Date().toISOString().slice(0, 10) });
    setImagePreview('');
    setIsDialogOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditing(article);
    setForm({
      title: article.title,
      body_html: article.body_html,
      featured_image_path: article.featured_image_path,
      published_at: article.published_at ? article.published_at.slice(0, 10) : undefined,
    });
    setImagePreview(article.featured_image_url || '');
    setIsDialogOpen(true);
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await articlesApi.uploadImage(file);
      setForm((prev) => ({ ...prev, featured_image_path: res.path }));
      setImagePreview(res.url);
      toast({ title: 'Berhasil', description: 'Gambar diupload.' });
    } catch (error: any) {
      toast({ title: 'Gagal', description: error.response?.data?.message || 'Upload gagal', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body_html.trim() || !form.featured_image_path) {
      toast({ title: 'Validasi', description: 'Judul, isi, dan gambar wajib diisi.', variant: 'destructive' });
      return;
    }
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
            <ImageIcon className="h-6 w-6 text-green-600" />
            Artikel
          </h1>
          <p className="text-gray-500">Kelola konten artikel untuk homepage dan halaman artikel.</p>
        </div>
        <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Artikel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Artikel</CardTitle>
          <CardDescription>Menampilkan {data?.data?.length || 0} artikel (page {data?.current_page || 1} dari {data?.last_page || 1})</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Memuat...</div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Publish</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="font-semibold text-gray-900">{article.title}</div>
                      <div className="text-xs text-gray-500">{article.slug}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(article)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(article)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" disabled={(data?.current_page || 1) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <span className="text-sm text-gray-600">Page {data?.current_page || 1} / {data?.last_page || 1}</span>
            <Button variant="outline" disabled={(data?.current_page || 1) >= (data?.last_page || 1)} onClick={() => setPage((p) => (data && data.current_page < data.last_page ? p + 1 : p))}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Artikel' : 'Tambah Artikel'}</DialogTitle>
            <DialogDescription>Isi artikel dengan rich text dan unggah featured image.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Judul artikel"
                />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Publish</Label>
                <Input
                  type="date"
                  value={form.published_at || ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, published_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Featured Image</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" className="gap-2 shrink-0" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Gambar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e.target.files?.[0])}
                      disabled={uploading}
                    />
                  </label>
                </Button>
                {form.featured_image_path && <span className="text-xs text-gray-500 truncate max-w-[200px]" title={form.featured_image_path}>{form.featured_image_path}</span>}
              </div>
              {imagePreview && (
                <div className="max-h-40 w-fit rounded-md overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="max-h-40 max-w-full object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Isi Artikel (Rich Text)</Label>
              <RichTextEditor
                value={form.body_html}
                onChange={(val) => setForm((prev) => ({ ...prev, body_html: val }))}
              />
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
            <AlertDialogTitle>Hapus artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus artikel secara permanen.
            </AlertDialogDescription>
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
