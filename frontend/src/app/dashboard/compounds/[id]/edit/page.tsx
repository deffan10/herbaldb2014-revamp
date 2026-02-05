'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  ArrowLeft,
  FlaskConical,
  Save,
  Loader2,
  Send,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { compoundsApi } from '@/lib/api/compounds';
import api from '@/lib/api/client';
import type { CompoundGroup } from '@/types';

// Validation schema
const compoundFormSchema = z.object({
  name: z.string().min(1, 'Nama senyawa wajib diisi').max(200, 'Maksimal 200 karakter'),
  knapsack_id: z.string().max(20).optional(),
  metabolite_id: z.string().max(100).optional(),
  pubchem_id: z.string().max(20).optional(),
  compound_group_id: z.number().optional().nullable(),
  molecular_formula: z.string().max(100).optional(),
  molecular_weight: z.string().max(50).optional(),
  cas_number: z.string().max(50).optional(),
  smiles: z.string().max(2000).optional(),
  inchi: z.string().max(2000).optional(),
  inchi_key: z.string().max(50).optional(),
});

type CompoundFormValues = z.infer<typeof compoundFormSchema>;

export default function EditCompoundPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin, isVerifier } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const compoundId = params.id as string;

  // Fetch compound data
  const { data: compound, isLoading: compoundLoading } = useQuery({
    queryKey: ['compound', compoundId],
    queryFn: () => compoundsApi.getById(compoundId),
    enabled: !!compoundId,
  });

  // Fetch compound groups for dropdown
  const { data: groups = [] } = useQuery({
    queryKey: ['compound-groups'],
    queryFn: () => compoundsApi.getGroups(),
  });

  const form = useForm<CompoundFormValues>({
    resolver: zodResolver(compoundFormSchema),
    defaultValues: {
      name: '',
      knapsack_id: '',
      metabolite_id: '',
      pubchem_id: '',
      compound_group_id: undefined,
      molecular_formula: '',
      molecular_weight: '',
      cas_number: '',
      smiles: '',
      inchi: '',
      inchi_key: '',
    },
  });

  // Populate form when compound data is loaded
  useEffect(() => {
    if (compound) {
      const compoundData = (compound as any).data || compound;
      form.reset({
        name: compoundData.name || '',
        knapsack_id: compoundData.knapsack_id || '',
        metabolite_id: compoundData.metabolite_id || '',
        pubchem_id: compoundData.pubchem_id || '',
        compound_group_id: compoundData.compound_group_id || undefined,
        molecular_formula: compoundData.molecular_formula || '',
        molecular_weight: compoundData.molecular_weight?.toString() || '',
        cas_number: compoundData.cas_number || '',
        smiles: compoundData.smiles || '',
        inchi: compoundData.inchi || '',
        inchi_key: compoundData.inchi_key || '',
      });
    }
  }, [compound, form]);

  const updateMutation = useMutation({
    mutationFn: (data: CompoundFormValues) => compoundsApi.update(parseInt(compoundId), data as any),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Data senyawa berhasil diperbarui',
      });
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      router.push('/dashboard/compounds');
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => compoundsApi.submit(parseInt(compoundId)),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Senyawa berhasil diajukan untuk verifikasi',
      });
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      router.push('/dashboard/compounds');
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal mengajukan untuk verifikasi',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => compoundsApi.delete(parseInt(compoundId)),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Senyawa berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['compounds'] });
      router.push('/dashboard/compounds');
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal menghapus senyawa',
        variant: 'destructive',
      });
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: (newStatus: string) => api.put(`/compounds/${compoundId}/status`, { status: newStatus }),
    onSuccess: (_, newStatus) => {
      toast({
        title: 'Berhasil',
        description: `Status senyawa berhasil diubah menjadi ${newStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ['compound', compoundId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal mengubah status',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: CompoundFormValues) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const compoundData = (compound as any)?.data || compound;
  const canEdit = compoundData?.status === 'draft' || compoundData?.status === 'rejected' || isAdmin();
  const canSubmit = compoundData?.status === 'draft' || compoundData?.status === 'rejected';
  const canDelete = compoundData?.status === 'draft' || isAdmin();

  if (compoundLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!compound) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Senyawa tidak ditemukan</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/compounds">Kembali</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/compounds">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FlaskConical className="h-6 w-6" />
              Edit Senyawa
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500">{compoundData?.name}</p>
              <Badge variant={
                compoundData?.status === 'published' ? 'default' :
                compoundData?.status === 'pending' ? 'secondary' :
                compoundData?.status === 'rejected' ? 'destructive' : 'outline'
              }>
                {compoundData?.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Status change for verifiers */}
          {isVerifier() && (
            <Select
              value={compoundData?.status}
              onValueChange={(value) => statusChangeMutation.mutate(value)}
              disabled={statusChangeMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ubah Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
          {canSubmit && (
            <Button
              variant="outline"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Ajukan Verifikasi
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Senyawa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Senyawa &quot;{compoundData?.name}&quot; 
                    akan dihapus permanen dari database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => deleteMutation.mutate()}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Senyawa ini sedang dalam status <strong>{compoundData?.status}</strong> dan tidak dapat diedit.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Data identifikasi senyawa bioaktif
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Senyawa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Curcumin" disabled={!canEdit} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compound_group_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grup Senyawa</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                      value={field.value?.toString() || ''}
                      disabled={!canEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih grup senyawa..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map((group: CompoundGroup) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="molecular_formula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formula Kimia</FormLabel>
                      <FormControl>
                        <Input placeholder="C21H20O6" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="molecular_weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Berat Molekul</FormLabel>
                      <FormControl>
                        <Input placeholder="368.38" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cas_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAS Number</FormLabel>
                    <FormControl>
                      <Input placeholder="458-37-7" disabled={!canEdit} {...field} />
                    </FormControl>
                    <FormDescription>Chemical Abstracts Service registry number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMILES</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O" 
                        disabled={!canEdit} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Simplified Molecular Input Line Entry System</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inchi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>InChI</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="InChI=1S/C6H12O6/c7-1-2-..." 
                        disabled={!canEdit} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>International Chemical Identifier</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inchi_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>InChI Key</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="WQZGKKKJIJFFOK-GASJEMHNSA-N" 
                        disabled={!canEdit} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Hashed version of InChI</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* External IDs */}
          <Card>
            <CardHeader>
              <CardTitle>ID Eksternal</CardTitle>
              <CardDescription>
                Referensi ke database eksternal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="knapsack_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KNApSAcK ID</FormLabel>
                      <FormControl>
                        <Input placeholder="C00000001" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metabolite_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metabolite ID</FormLabel>
                      <FormControl>
                        <Input placeholder="HMDB0002269" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pubchem_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PubChem ID</FormLabel>
                      <FormControl>
                        <Input placeholder="969516" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* MOL File Info */}
          {compoundData?.mol_file_path && (
            <Card>
              <CardHeader>
                <CardTitle>File MOL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-base px-4 py-2">
                    {compoundData.mol_file_path}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${compoundData.mol_file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download MOL
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {canEdit && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/compounds">Batal</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
