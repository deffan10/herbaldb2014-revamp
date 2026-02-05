'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  ArrowLeft,
  Flower2,
  Save,
  Plus,
  Trash2,
  Loader2,
  MapPin,
  Heart,
  Send,
  Camera,
  Upload,
  ImageIcon,
  X,
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
import { speciesApi } from '@/lib/api/species';
import api from '@/lib/api/client';

// Validation schema
const speciesFormSchema = z.object({
  species_code: z.string().min(1, 'Kode spesies wajib diisi').max(10, 'Maksimal 10 karakter'),
  scientific_name: z.string().min(1, 'Nama ilmiah wajib diisi').max(200, 'Maksimal 200 karakter'),
  variety: z.string().max(100).optional(),
  family: z.string().max(100).optional(),
  discoverer: z.string().max(100).optional(),
  description: z.string().optional(),
  description_en: z.string().optional(),
  reference_id: z.number().optional().nullable(),
  local_names: z.array(z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Nama lokal wajib diisi'),
    language: z.string().optional(),
    region: z.string().optional(),
  })).optional(),
  virtues: z.array(z.object({
    id: z.number().optional(),
    description: z.string().min(1, 'Khasiat wajib diisi'),
    plant_part_id: z.number().optional().nullable(),
    reference_id: z.number().optional().nullable(),
  })).optional(),
});

type SpeciesFormValues = z.infer<typeof speciesFormSchema>;

export default function EditSpeciesPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAdmin, isVerifier } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speciesId = params.id as string;

  // Fetch species data
  const { data: species, isLoading: speciesLoading } = useQuery({
    queryKey: ['species', speciesId],
    queryFn: () => speciesApi.getById(speciesId),
    enabled: !!speciesId,
  });

  // Fetch references for dropdown
  const { data: references = [] } = useQuery({
    queryKey: ['references'],
    queryFn: async () => {
      const { data } = await api.get('/references');
      return data.data || data;
    },
  });

  // Fetch plant parts for dropdown
  const { data: plantParts = [] } = useQuery({
    queryKey: ['plant-parts'],
    queryFn: async () => {
      const { data } = await api.get('/plant-parts');
      return data.data || data;
    },
  });

  const form = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues: {
      species_code: '',
      scientific_name: '',
      variety: '',
      family: '',
      discoverer: '',
      description: '',
      description_en: '',
      reference_id: undefined,
      local_names: [],
      virtues: [],
    },
  });

  // Populate form when species data is loaded
  useEffect(() => {
    if (species) {
      const speciesData = (species as any).data || species;
      form.reset({
        species_code: speciesData.species_code || '',
        scientific_name: speciesData.scientific_name || '',
        variety: speciesData.variety || '',
        family: speciesData.family || '',
        discoverer: speciesData.discoverer || '',
        description: speciesData.description || '',
        description_en: speciesData.description_en || '',
        reference_id: speciesData.reference_id || undefined,
        local_names: speciesData.local_names?.map((ln: any) => ({
          id: ln.id,
          name: ln.name,
          language: ln.language || '',
          region: ln.region || '',
        })) || [],
        virtues: speciesData.virtues?.map((v: any) => ({
          id: v.id,
          description: v.description || v.virtue,
          plant_part_id: v.plant_part_id || undefined,
          reference_id: v.reference_id || undefined,
        })) || [],
      });
    }
  }, [species, form]);

  const { fields: localNameFields, append: appendLocalName, remove: removeLocalName } = useFieldArray({
    control: form.control,
    name: 'local_names',
    keyName: 'fieldId',
  });

  // Handle local name deletion with API call
  const handleRemoveLocalName = async (index: number) => {
    const localName = localNameFields[index];
    
    // If local name has an ID, it exists in database - delete via API
    if (localName.id) {
      try {
        await api.delete(`/species/${speciesId}/local-names/${localName.id}`);
        toast({
          title: 'Berhasil',
          description: 'Nama lokal berhasil dihapus.',
        });
        queryClient.invalidateQueries({ queryKey: ['species', speciesId] });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Gagal menghapus nama lokal.',
          variant: 'destructive',
        });
        return; // Don't remove from form if API call failed
      }
    }
    
    // Remove from form array
    removeLocalName(index);
  };

  const { fields: virtueFields, append: appendVirtue, remove: removeVirtue } = useFieldArray({
    control: form.control,
    name: 'virtues',
    keyName: 'fieldId',
  });

  // Handle virtue deletion with API call
  const handleRemoveVirtue = async (index: number) => {
    const virtue = virtueFields[index];
    
    // If virtue has an ID, it exists in database - delete via API
    if (virtue.id) {
      try {
        await api.delete(`/species/${speciesId}/virtues/${virtue.id}`);
        toast({
          title: 'Berhasil',
          description: 'Khasiat berhasil dihapus.',
        });
        queryClient.invalidateQueries({ queryKey: ['species', speciesId] });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Gagal menghapus khasiat.',
          variant: 'destructive',
        });
        return; // Don't remove from form if API call failed
      }
    }
    
    // Remove from form array
    removeVirtue(index);
  };

  const updateMutation = useMutation({
    mutationFn: (data: SpeciesFormValues) => speciesApi.update(parseInt(speciesId), data as any),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Data spesies berhasil diperbarui',
      });
      queryClient.invalidateQueries({ queryKey: ['my-species'] });
      queryClient.invalidateQueries({ queryKey: ['species'] });
      router.push('/dashboard/submissions');
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
    mutationFn: () => speciesApi.submit(parseInt(speciesId)),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Spesies berhasil diajukan untuk verifikasi',
      });
      queryClient.invalidateQueries({ queryKey: ['my-species'] });
      queryClient.invalidateQueries({ queryKey: ['species'] });
      router.push('/dashboard/submissions');
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
    mutationFn: () => speciesApi.delete(parseInt(speciesId)),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Spesies berhasil dihapus',
      });
      queryClient.invalidateQueries({ queryKey: ['species'] });
      router.push('/dashboard/species');
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal menghapus spesies',
        variant: 'destructive',
      });
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: (newStatus: string) => api.put(`/species/${speciesId}/status`, { status: newStatus }),
    onSuccess: (_, newStatus) => {
      toast({
        title: 'Berhasil',
        description: `Status spesies berhasil diubah menjadi ${newStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ['species'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal mengubah status',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: SpeciesFormValues) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Photo upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Hanya file gambar yang diizinkan.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Ukuran file maksimal 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      
      await api.post(`/species/${speciesId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil diunggah.',
      });
      queryClient.invalidateQueries({ queryKey: ['species', speciesId] });
      setSelectedFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal mengunggah gambar.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!speciesData?.photo) return;
    
    setUploadingPhoto(true);
    try {
      await api.delete(`/species/${speciesId}/photo`);
      
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil dihapus.',
      });
      queryClient.invalidateQueries({ queryKey: ['species', speciesId] });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal menghapus gambar.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const speciesData = (species as any)?.data || species;
  const canEdit = speciesData?.status === 'draft' || speciesData?.status === 'rejected' || isAdmin();
  const canSubmit = speciesData?.status === 'draft' || speciesData?.status === 'rejected';
  const canDelete = speciesData?.status === 'draft' || isAdmin();

  if (speciesLoading) {
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
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!species) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Spesies tidak ditemukan</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/species">Kembali</Link>
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
            <Link href="/dashboard/species">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Flower2 className="h-6 w-6" />
              Edit Spesies
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-500">{speciesData?.scientific_name}</p>
              <Badge variant={
                speciesData?.status === 'published' ? 'default' :
                speciesData?.status === 'pending' ? 'secondary' :
                speciesData?.status === 'rejected' ? 'destructive' : 'outline'
              }>
                {speciesData?.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Status change for verifiers */}
          {isVerifier() && (
            <Select
              value={speciesData?.status}
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
                  <AlertDialogTitle>Hapus Spesies?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Spesies &quot;{speciesData?.scientific_name}&quot; 
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
            Spesies ini sedang dalam status <strong>{speciesData?.status}</strong> dan tidak dapat diedit.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Foto Spesies
              </CardTitle>
              <CardDescription>
                Upload gambar untuk spesies ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Current/Preview Image */}
                <div className="w-48 h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : speciesData?.photo ? (
                    <img 
                      src={speciesData.photo.startsWith('http') ? speciesData.photo : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${speciesData.photo}`} 
                      alt={speciesData.scientific_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                      <span className="text-sm">Belum ada foto</span>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-4">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Pilih Gambar
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {selectedFile && (
                    <Button
                      type="button"
                      onClick={handleUploadPhoto}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Foto
                        </>
                      )}
                    </Button>
                  )}

                  {speciesData?.photo && !selectedFile && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeletePhoto}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Hapus Foto
                        </>
                      )}
                    </Button>
                  )}

                  <p className="text-xs text-gray-500">
                    Format: JPEG, PNG, GIF, WebP. Maksimal 5MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Data identifikasi spesies tanaman
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="species_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Spesies *</FormLabel>
                      <FormControl>
                        <Input placeholder="SPC001" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormDescription>Kode unik untuk identifikasi</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scientific_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Ilmiah *</FormLabel>
                      <FormControl>
                        <Input placeholder="Curcuma longa" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormDescription>Nama latin spesies</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="variety"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Varietas</FormLabel>
                      <FormControl>
                        <Input placeholder="var. domestica" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="family"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Famili</FormLabel>
                      <FormControl>
                        <Input placeholder="Zingiberaceae" disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discoverer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penemu</FormLabel>
                      <FormControl>
                        <Input placeholder="L." disabled={!canEdit} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reference_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referensi</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                      value={field.value?.toString() || ''}
                      disabled={!canEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih referensi..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {references.map((ref: any) => (
                          <SelectItem key={ref.id} value={ref.id.toString()}>
                            {ref.source_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi</CardTitle>
              <CardDescription>
                Deskripsi tanaman dalam bahasa Indonesia dan Inggris
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Indonesia)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Deskripsi tanaman dalam bahasa Indonesia..."
                        className="min-h-[120px]"
                        disabled={!canEdit}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (English)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Plant description in English..."
                        className="min-h-[120px]"
                        disabled={!canEdit}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Local Names */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Nama Lokal
                </CardTitle>
                <CardDescription>
                  Nama daerah atau vernakular dari spesies ini
                </CardDescription>
              </div>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLocalName({ name: '', language: '', region: '' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {localNameFields.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada nama lokal.
                </p>
              ) : (
                <div className="space-y-4">
                  {localNameFields.map((field, index) => (
                    <div key={field.fieldId} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`local_names.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Nama lokal" disabled={!canEdit} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`local_names.${index}.language`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Bahasa" disabled={!canEdit} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`local_names.${index}.region`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Daerah" disabled={!canEdit} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveLocalName(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Virtues */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Khasiat
                </CardTitle>
                <CardDescription>
                  Manfaat dan kegunaan tanaman
                </CardDescription>
              </div>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendVirtue({ description: '', plant_part_id: undefined, reference_id: undefined })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {virtueFields.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada khasiat.
                </p>
              ) : (
                <div className="space-y-4">
                  {virtueFields.map((field, index) => (
                    <div key={field.fieldId} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`virtues.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Deskripsi khasiat..." disabled={!canEdit} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`virtues.${index}.plant_part_id`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                                value={field.value?.toString() || ''}
                                disabled={!canEdit}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Bagian tanaman" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {plantParts.map((part: any) => (
                                    <SelectItem key={part.id} value={part.id.toString()}>
                                      {part.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveVirtue(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {canEdit && (
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/species">Batal</Link>
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
