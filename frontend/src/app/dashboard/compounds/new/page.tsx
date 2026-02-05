'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { compoundsApi } from '@/lib/api/compounds';
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
});

type CompoundFormValues = z.infer<typeof compoundFormSchema>;

export default function NewCompoundPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CompoundFormValues) => compoundsApi.create(data as any),
    onSuccess: () => {
      toast({
        title: 'Berhasil',
        description: 'Senyawa baru berhasil ditambahkan',
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

  const onSubmit = async (data: CompoundFormValues) => {
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
          <Link href="/dashboard/compounds">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="h-6 w-6" />
            Tambah Senyawa Baru
          </h1>
          <p className="text-gray-500 mt-1">
            Tambahkan senyawa bioaktif baru ke database
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
                      <Input placeholder="Curcumin" {...field} />
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
                        <Input placeholder="C21H20O6" {...field} />
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
                        <Input placeholder="368.38" {...field} />
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
                      <Input placeholder="458-37-7" {...field} />
                    </FormControl>
                    <FormDescription>Chemical Abstracts Service registry number</FormDescription>
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
                        <Input placeholder="C00000001" {...field} />
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
                        <Input placeholder="HMDB0002269" {...field} />
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
                        <Input placeholder="969516" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
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
                  Simpan Senyawa
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
