'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
    name: z.string().min(1, 'Nama lokal wajib diisi'),
    language: z.string().optional(),
    region: z.string().optional(),
  })).optional(),
  virtues: z.array(z.object({
    description: z.string().min(1, 'Khasiat wajib diisi'),
    plant_part_id: z.number().optional().nullable(),
    reference_id: z.number().optional().nullable(),
  })).optional(),
});

type SpeciesFormValues = z.infer<typeof speciesFormSchema>;

export default function NewSpeciesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { fields: localNameFields, append: appendLocalName, remove: removeLocalName } = useFieldArray({
    control: form.control,
    name: 'local_names',
  });

  const { fields: virtueFields, append: appendVirtue, remove: removeVirtue } = useFieldArray({
    control: form.control,
    name: 'virtues',
  });

  const createMutation = useMutation({
    mutationFn: (data: SpeciesFormValues) => speciesApi.create(data as any),
    onSuccess: (response) => {
      toast({
        title: 'Berhasil',
        description: 'Spesies baru berhasil ditambahkan',
      });
      queryClient.invalidateQueries({ queryKey: ['species'] });
      router.push('/dashboard/species');
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: SpeciesFormValues) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/species">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flower2 className="h-6 w-6" />
            Tambah Spesies Baru
          </h1>
          <p className="text-gray-500 mt-1">
            Tambahkan spesies tanaman baru ke database
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <Input placeholder="SPC001" {...field} />
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
                        <Input placeholder="Curcuma longa" {...field} />
                      </FormControl>
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
                        <Input placeholder="var. domestica" {...field} />
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
                        <Input placeholder="Zingiberaceae" {...field} />
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
                        <Input placeholder="L." {...field} />
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih referensi..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {references.map((ref: any) => (
                          <SelectItem key={ref.id} value={ref.id.toString()}>
                            {ref.name || ref.title}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLocalName({ name: '', language: '', region: '' })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {localNameFields.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada nama lokal. Klik &quot;Tambah&quot; untuk menambahkan.
                </p>
              ) : (
                <div className="space-y-4">
                  {localNameFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`local_names.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Nama lokal" {...field} />
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
                                <Input placeholder="Bahasa (opsional)" {...field} />
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
                                <Input placeholder="Daerah (opsional)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeLocalName(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Virtues / Uses */}
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendVirtue({ description: '', plant_part_id: undefined, reference_id: undefined })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {virtueFields.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Belum ada khasiat. Klik &quot;Tambah&quot; untuk menambahkan.
                </p>
              ) : (
                <div className="space-y-4">
                  {virtueFields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <FormField
                            control={form.control}
                            name={`virtues.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea placeholder="Deskripsi khasiat..." {...field} />
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeVirtue(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
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
                  Simpan Spesies
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
