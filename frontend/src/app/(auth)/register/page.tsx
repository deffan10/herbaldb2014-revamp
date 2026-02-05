'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Leaf, Loader2, Eye, EyeOff, Upload, Building2, Search, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { authApi } from '@/lib/api/auth';

import ptIndonesia from '@/data/pt-indonesia.json';

interface PTIndonesia {
  kode: string;
  nama: string;
  provinsi: string;
  kabupatenKota: string;
  kecamatan: string;
  alamat: string;
  tautan: string;
  telepon: string;
  surel: string;
  bentuk: string;
  lembaga: string;
  kelompokKoordinator: string;
}

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  role: z.enum(['contributor', 'verifier']),
  institution: z.string().min(2, 'Please select or enter your institution'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').max(15, 'Nomor WhatsApp maksimal 15 digit').regex(/^[0-9+]+$/, 'Nomor WhatsApp hanya boleh berisi angka'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RORInstitution {
  id: string;
  name: string;
  country: { country_name: string };
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationDoc, setVerificationDoc] = useState<File | null>(null);
  
  // Institution search
  const [institutionOpen, setInstitutionOpen] = useState(false);
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [institutions, setInstitutions] = useState<RORInstitution[]>([]);
  const [searchingInstitutions, setSearchingInstitutions] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'contributor',
    },
  });

  const selectedRole = watch('role');

  // Get 4670+ universities from PDDIKTI data (2021)
  // Note: This data may be outdated. Users can type custom institution if not found.
  const allUniversities = ptIndonesia as PTIndonesia[];

  // Search institutions - PDDIKTI data + manual entry option
  useEffect(() => {
    const searchInstitutions = async () => {
      if (institutionSearch.length < 2) {
        // Show first 20 popular universities (PTN first)
        const popular = allUniversities
          .filter(pt => pt.kelompokKoordinator === 'Negeri' && pt.bentuk === 'Universitas')
          .slice(0, 20)
          .map((inst, idx) => ({
            id: `pt-${idx}`,
            name: inst.nama,
            country: { country_name: `${inst.kabupatenKota}, ${inst.provinsi}` }
          }));
        setInstitutions(popular as RORInstitution[]);
        return;
      }

      setSearchingInstitutions(true);
      try {
        const searchLower = institutionSearch.toLowerCase();
        
        // Search from PDDIKTI data (4670+ PT)
        const filtered = allUniversities
          .filter(inst => 
            inst.nama.toLowerCase().includes(searchLower) ||
            inst.kabupatenKota.toLowerCase().includes(searchLower) ||
            inst.provinsi.toLowerCase().includes(searchLower)
          )
          .slice(0, 30)
          .map((inst, idx) => ({
            id: `pt-${idx}`,
            name: inst.nama,
            country: { country_name: `${inst.kabupatenKota}, ${inst.provinsi}` }
          }));

        // Also try Hipo API for more results (especially international)
        let apiResults: RORInstitution[] = [];
        if (filtered.length < 10) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/universities/search?name=${encodeURIComponent(institutionSearch)}`
            );
            const apiData = await response.json();
            if (Array.isArray(apiData) && apiData.length > 0) {
              // Filter out duplicates
              const existingNames = new Set(filtered.map(f => f.name.toLowerCase()));
              apiResults = apiData
                .filter((item: { name: string }) => !existingNames.has(item.name.toLowerCase()))
                .slice(0, 15)
                .map((item: { name: string; country: string }, idx: number) => ({
                  id: `api-${idx}`,
                  name: item.name,
                  country: { country_name: item.country }
                }));
            }
          } catch {
            // Ignore API errors
          }
        }

        setInstitutions([...filtered, ...apiResults] as RORInstitution[]);
      } catch (error) {
        console.error('Failed to search institutions:', error);
        setInstitutions([]);
      } finally {
        setSearchingInstitutions(false);
      }
    };

    const debounce = setTimeout(searchInstitutions, 200);
    return () => clearTimeout(debounce);
  }, [institutionSearch]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const registerData = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        role_requested: data.role,
        institution: data.institution,
        whatsapp: data.whatsapp,
      };

      const response = await authApi.register(registerData);
      
      // Check if verifier account requires approval
      if (response.requires_approval) {
        toast.success('Pendaftaran berhasil! Akun verifier Anda sedang menunggu persetujuan admin.', {
          duration: 6000,
          position: 'top-center',
        });
      } else {
        toast.success('Pendaftaran berhasil! Silakan login.', {
          position: 'top-center',
        });
      }
      
      router.push('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((messages) => {
          messages.forEach((msg: string) => toast.error(msg));
        });
      } else {
        toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Leaf className="h-10 w-10 text-green-600" />
            </div>
          </Link>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join HerbalDB to contribute to our database
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. John Doe"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@institution.edu"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Account Type</Label>
              <RadioGroup
                defaultValue="contributor"
                onValueChange={(value) => setValue('role', value as 'contributor' | 'verifier')}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="contributor"
                    id="contributor"
                    className="peer sr-only"
                    {...register('role')}
                  />
                  <Label
                    htmlFor="contributor"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                  >
                    <span className="font-semibold">Contributor</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      Submit new data for review
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="verifier"
                    id="verifier"
                    className="peer sr-only"
                    {...register('role')}
                  />
                  <Label
                    htmlFor="verifier"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600 cursor-pointer"
                  >
                    <span className="font-semibold">Verifier</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      Review and verify submissions
                    </span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Institution</Label>
              <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={institutionOpen}
                    className={`w-full justify-between text-left truncate ${errors.institution ? 'border-red-500' : ''}`}
                  >
                    <span className="truncate">{watch('institution') || 'Search or enter institution...'}</span>
                    <Building2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" side="bottom">
                  <Command>
                    <CommandInput
                      placeholder="Cari institusi (misal: Muhammadiyah, Harvard, dll)..."
                      value={institutionSearch}
                      onValueChange={setInstitutionSearch}
                    />
                    <CommandList className="max-h-[300px]">
                      {searchingInstitutions ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm">Mencari institusi...</span>
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>
                            <div className="p-4 text-center">
                              <p className="text-sm text-muted-foreground mb-2">Institusi tidak ditemukan di database.</p>
                              <p className="text-xs text-muted-foreground mb-3">Data berisi 4670+ PT Indonesia. Jika institusi Anda tidak ada, ketik nama lengkap lalu klik tombol di bawah.</p>
                              {institutionSearch && institutionSearch.length >= 2 && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    // Check for duplicate (case-insensitive)
                                    const isDuplicate = allUniversities.some(
                                      pt => pt.nama.toLowerCase() === institutionSearch.toLowerCase()
                                    );
                                    if (isDuplicate) {
                                      alert('Institusi ini sudah ada di database. Silakan pilih dari daftar.');
                                      return;
                                    }
                                    setValue('institution', institutionSearch);
                                    setInstitutionOpen(false);
                                  }}
                                >
                                  Gunakan &quot;{institutionSearch}&quot;
                                </Button>
                              )}
                            </div>
                          </CommandEmpty>
                          <CommandGroup heading={institutionSearch.length >= 2 ? `Hasil pencarian "${institutionSearch}"` : "Universitas Populer Indonesia"}>
                            {institutions.map((inst) => (
                              <CommandItem
                                key={inst.id}
                                value={inst.name}
                                onSelect={() => {
                                  setValue('institution', inst.name);
                                  setInstitutionOpen(false);
                                }}
                                className="cursor-pointer py-2"
                              >
                                <div className="flex flex-col w-full">
                                  <span className="font-medium text-sm leading-tight">{inst.name}</span>
                                  <span className="text-xs text-muted-foreground mt-0.5">
                                    {inst.country?.country_name}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.institution && (
                <p className="text-sm text-red-500">{errors.institution.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
              <p className="text-xs text-muted-foreground">
                Untuk notifikasi status kontribusi Anda
              </p>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="08123456789"
                  {...register('whatsapp')}
                  className={`pl-9 ${errors.whatsapp ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.whatsapp && (
                <p className="text-sm text-red-500">{errors.whatsapp.message}</p>
              )}
            </div>

            {/* Verification Document (for verifier role) */}
            {selectedRole === 'verifier' && (
              <div className="space-y-2">
                <Label>Verification Document</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload a document proving your expertise (e.g., academic credentials, research publications)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setVerificationDoc(e.target.files?.[0] || null)}
                    className="hidden"
                    id="verification-doc"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('verification-doc')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {verificationDoc ? verificationDoc.name : 'Upload Document'}
                  </Button>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('password_confirmation')}
                  className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}