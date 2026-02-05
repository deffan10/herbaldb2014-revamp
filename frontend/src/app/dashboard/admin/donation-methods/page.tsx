'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  CreditCard, 
  Wallet, 
  QrCode,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DonationMethod {
  id: number;
  name: string;
  type: 'bank' | 'ewallet' | 'qris';
  account_number: string | null;
  account_name: string | null;
  icon: string;
  color: string;
  qris_image: string | null;
  is_active: boolean;
  show_qris: boolean;
  sort_order: number;
}

const iconOptions = [
  { value: 'CreditCard', label: 'Credit Card (Bank)', icon: CreditCard },
  { value: 'Wallet', label: 'Wallet (E-Wallet)', icon: Wallet },
  { value: 'QrCode', label: 'QR Code (QRIS)', icon: QrCode },
];

const colorOptions = [
  { value: 'bg-blue-50 text-blue-600', label: 'Biru' },
  { value: 'bg-green-50 text-green-600', label: 'Hijau' },
  { value: 'bg-yellow-50 text-yellow-600', label: 'Kuning' },
  { value: 'bg-purple-50 text-purple-600', label: 'Ungu' },
  { value: 'bg-pink-50 text-pink-600', label: 'Pink' },
  { value: 'bg-red-50 text-red-600', label: 'Merah' },
  { value: 'bg-gray-50 text-gray-600', label: 'Abu-abu' },
];

const typeOptions = [
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'qris', label: 'QRIS' },
];

export default function DonationMethodsPage() {
  const { isAdmin, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [methods, setMethods] = useState<DonationMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQris, setShowQris] = useState(false);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<DonationMethod | null>(null);
  const [isNewMethod, setIsNewMethod] = useState(false);
  
  // QRIS upload
  const [uploadingQris, setUploadingQris] = useState(false);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'bank' | 'ewallet' | 'qris',
    account_number: '',
    account_name: '',
    icon: 'CreditCard',
    color: 'bg-blue-50 text-blue-600',
    is_active: true,
    sort_order: 0,
  });

  const fetchMethods = useCallback(async () => {
    try {
      const response = await api.get('/admin/donation-methods');
      setMethods(response.data.data || []);
      
      // Check if QRIS is enabled
      const qrisMethod = response.data.data?.find((m: DonationMethod) => m.type === 'qris');
      if (qrisMethod) {
        setShowQris(qrisMethod.show_qris);
        setQrisImage(qrisMethod.qris_image);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat metode donasi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    fetchMethods();
  }, [isAuthenticated, isAdmin, router, fetchMethods]);

  const openNewDialog = () => {
    setFormData({
      name: '',
      type: 'bank',
      account_number: '',
      account_name: '',
      icon: 'CreditCard',
      color: 'bg-blue-50 text-blue-600',
      is_active: true,
      sort_order: methods.length,
    });
    setIsNewMethod(true);
    setSelectedMethod(null);
    setEditDialogOpen(true);
  };

  const openEditDialog = (method: DonationMethod) => {
    setFormData({
      name: method.name,
      type: method.type,
      account_number: method.account_number || '',
      account_name: method.account_name || '',
      icon: method.icon,
      color: method.color,
      is_active: method.is_active,
      sort_order: method.sort_order,
    });
    setIsNewMethod(false);
    setSelectedMethod(method);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (method: DonationMethod) => {
    setSelectedMethod(method);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNewMethod) {
        await api.post('/admin/donation-methods', formData);
        toast({
          title: 'Berhasil',
          description: 'Metode donasi berhasil ditambahkan',
        });
      } else if (selectedMethod) {
        await api.put(`/admin/donation-methods/${selectedMethod.id}`, formData);
        toast({
          title: 'Berhasil',
          description: 'Metode donasi berhasil diperbarui',
        });
      }
      setEditDialogOpen(false);
      fetchMethods();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan metode donasi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMethod) return;
    
    try {
      await api.delete(`/admin/donation-methods/${selectedMethod.id}`);
      toast({
        title: 'Berhasil',
        description: 'Metode donasi berhasil dihapus',
      });
      setDeleteDialogOpen(false);
      fetchMethods();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus metode donasi',
        variant: 'destructive',
      });
    }
  };

  const handleToggleQris = async (enabled: boolean) => {
    try {
      await api.post('/admin/donation-methods/toggle-qris', { show_qris: enabled });
      setShowQris(enabled);
      toast({
        title: 'Berhasil',
        description: enabled ? 'QRIS diaktifkan' : 'QRIS dinonaktifkan',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah pengaturan QRIS',
        variant: 'destructive',
      });
    }
  };

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingQris(true);
    const formData = new FormData();
    formData.append('qris_image', file);
    
    try {
      const response = await api.post('/admin/donation-methods/upload-qris', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setQrisImage(response.data.path);
      toast({
        title: 'Berhasil',
        description: 'QRIS berhasil diupload',
      });
      fetchMethods();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal upload QRIS',
        variant: 'destructive',
      });
    } finally {
      setUploadingQris(false);
    }
  };

  const toggleMethodActive = async (method: DonationMethod) => {
    try {
      await api.put(`/admin/donation-methods/${method.id}`, {
        is_active: !method.is_active,
      });
      fetchMethods();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive',
      });
    }
  };

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(i => i.value === iconName);
    return iconOption?.icon || CreditCard;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metode Donasi</h1>
          <p className="text-gray-600">Kelola metode pembayaran untuk halaman donasi</p>
        </div>
        <Button onClick={openNewDialog} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Metode
        </Button>
      </div>

      {/* QRIS Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pengaturan QRIS
          </CardTitle>
          <CardDescription>
            Tampilkan atau sembunyikan section QRIS di halaman donasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tampilkan QRIS</Label>
              <p className="text-sm text-gray-500">
                {showQris ? 'QRIS ditampilkan di halaman donasi' : 'QRIS disembunyikan'}
              </p>
            </div>
            <Switch checked={showQris} onCheckedChange={handleToggleQris} />
          </div>
          
          {showQris && (
            <div className="pt-4 border-t">
              <Label>Upload QRIS Image</Label>
              <div className="mt-2 flex items-start gap-4">
                {qrisImage ? (
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${qrisImage}`}
                      alt="QRIS"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400">
                    <QrCode className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleQrisUpload}
                    disabled={uploadingQris}
                    className="hidden"
                    id="qris-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('qris-upload')?.click()}
                    disabled={uploadingQris}
                  >
                    {uploadingQris ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {qrisImage ? 'Ganti QRIS' : 'Upload QRIS'}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Format: JPG, PNG. Max 2MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donation Methods List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Metode Pembayaran</CardTitle>
          <CardDescription>
            {methods.filter(m => m.type !== 'qris').length} metode terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {methods.filter(m => m.type !== 'qris').length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada metode donasi</p>
              <Button onClick={openNewDialog} variant="link" className="mt-2">
                Tambah metode pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {methods.filter(m => m.type !== 'qris').map((method) => {
                const IconComponent = getIcon(method.icon);
                return (
                  <div
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      method.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${method.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {method.type}
                          </span>
                          {!method.is_active && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {method.account_number} • a.n. {method.account_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMethodActive(method)}
                        title={method.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {method.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(method)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(method)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNewMethod ? 'Tambah Metode Donasi' : 'Edit Metode Donasi'}
            </DialogTitle>
            <DialogDescription>
              {isNewMethod
                ? 'Tambahkan metode pembayaran baru untuk donasi'
                : 'Perbarui informasi metode pembayaran'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Bank BCA, GoPay"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'bank' | 'ewallet' | 'qris') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nomor Rekening/HP</Label>
                <Input
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nama Pemilik</Label>
                <Input
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="Nama Lengkap"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Warna</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${opt.value.split(' ')[0]}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Aktif</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Metode Donasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus metode &quot;{selectedMethod?.name}&quot;? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
