'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Coffee, Server, Globe, Copy, Check, QrCode, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { api } from '@/lib/api';

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
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Wallet,
  QrCode,
};

export default function DonatePage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [donationMethods, setDonationMethods] = useState<DonationMethod[]>([]);
  const [showQris, setShowQris] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrisImage, setQrisImage] = useState<string | null>(null);

  useEffect(() => {
    fetchDonationMethods();
  }, []);

  const fetchDonationMethods = async () => {
    try {
      const response = await api.get('/donation-methods');
      const methods = response.data.methods || [];
      setDonationMethods(methods.filter((m: DonationMethod) => m.type !== 'qris'));
      setShowQris(response.data.show_qris || false);
      
      // Get QRIS image if available
      const qrisMethod = methods.find((m: DonationMethod) => m.type === 'qris');
      if (qrisMethod?.qris_image) {
        setQrisImage(qrisMethod.qris_image);
      }
    } catch (error) {
      console.error('Failed to fetch donation methods:', error);
      // Use default methods if API fails
      setDonationMethods(defaultMethods);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Default methods as fallback
  const defaultMethods: DonationMethod[] = [
    {
      id: 1,
      name: 'Bank BCA',
      type: 'bank',
      icon: 'CreditCard',
      account_number: '1234567890',
      account_name: 'Nama Pemilik Rekening',
      color: 'bg-blue-50 text-blue-600',
      qris_image: null,
      is_active: true,
      show_qris: false,
    },
    {
      id: 2,
      name: 'GoPay',
      type: 'ewallet',
      icon: 'Wallet',
      account_number: '081234567890',
      account_name: 'Nama Pemilik',
      color: 'bg-green-50 text-green-600',
      qris_image: null,
      is_active: true,
      show_qris: false,
    },
  ];

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || CreditCard;
  };

  const usageItems = [
    {
      icon: Server,
      title: 'Server & Hosting',
      description: 'Biaya server untuk menjaga website tetap online 24/7',
    },
    {
      icon: Globe,
      title: 'Domain',
      description: 'Perpanjangan domain agar website mudah diakses',
    },
    {
      icon: Coffee,
      title: 'Development',
      description: 'Pengembangan fitur baru dan maintenance rutin',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-full mb-6">
              <Heart className="h-10 w-10 text-pink-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dukung HerbalDB Indonesia
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bantu kami menjaga database tanaman obat Indonesia tetap online dan terus berkembang 
              untuk kepentingan edukasi dan penelitian.
            </p>
          </div>

          {/* Why Donate */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Mengapa Donasi Penting?</CardTitle>
              <CardDescription>
                Donasi Anda akan digunakan untuk:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {usageItems.map((item) => (
                  <div key={item.title} className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <item.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Donation Methods */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Metode Donasi</CardTitle>
              <CardDescription>
                Pilih metode pembayaran yang paling nyaman untuk Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                  <span className="ml-2 text-gray-600">Memuat metode donasi...</span>
                </div>
              ) : donationMethods.length > 0 ? (
                <div className="space-y-4">
                  {donationMethods.map((method) => {
                    const IconComponent = getIcon(method.icon);
                    return (
                      <div 
                        key={method.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${method.color}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-600">a.n. {method.account_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <code className="bg-white px-3 py-2 rounded-lg text-sm font-mono border">
                            {method.account_number}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(method.account_number || '', method.id.toString())}
                            className="flex items-center gap-2"
                          >
                            {copiedItem === method.id.toString() ? (
                              <>
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Belum ada metode donasi yang tersedia.
                </p>
              )}
            </CardContent>
          </Card>

          {/* QRIS - Only show if enabled */}
          {showQris && (
            <Card className="mb-8 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <QrCode className="h-6 w-6" />
                  Scan QRIS
                </CardTitle>
                <CardDescription>
                  Scan QR code untuk donasi via semua e-wallet dan mobile banking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  {qrisImage ? (
                    <div className="relative w-64 h-64 mb-4">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${qrisImage}`}
                        alt="QRIS Code"
                        fill
                        className="object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-64 h-64 bg-gray-200 rounded-xl flex items-center justify-center mb-4">
                      <div className="text-center text-gray-500">
                        <QrCode className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">QR Code akan ditampilkan di sini</p>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 text-center">
                    Scan menggunakan aplikasi e-wallet atau mobile banking Anda
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Note */}
          <Card className="border-0 shadow-lg bg-green-50">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Terima Kasih!</h3>
                  <p className="text-gray-600 text-sm">
                    Setiap donasi sangat berarti bagi keberlangsungan proyek ini. 
                    Kami berkomitmen untuk menjaga transparansi penggunaan dana dan 
                    terus mengembangkan database ini untuk kepentingan bersama.
                  </p>
                  <p className="text-gray-600 text-sm mt-3">
                    Jika Anda memiliki pertanyaan atau ingin berkontribusi dengan cara lain, 
                    silakan hubungi kami melalui halaman <Link href="/contact" className="text-green-600 hover:underline">kontak</Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/">
                Kembali ke Beranda
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
