'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Leaf, 
  Heart, 
  GraduationCap, 
  Globe, 
  Users, 
  Database,
  GitFork,
  Mail,
  Github,
  Instagram,
  ExternalLink,
  Target,
  History
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-800 via-green-900 to-emerald-950 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">
              Tentang HerbalDB Indonesia
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Database tanaman obat Indonesia yang dikembangkan untuk mendukung 
              penelitian dan pendidikan farmasi di Indonesia.
            </p>
          </div>
        </section>

        {/* Origin Story */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-green-100 rounded-full p-3">
                <History className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sejarah Proyek</h2>
                <p className="text-gray-600">Bagaimana HerbalDB bermula dan berkembang</p>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600 text-justify">
              <p className="leading-relaxed mb-6">
                <strong className="text-gray-900">HerbalDB Indonesia</strong> adalah database tanaman obat 
                Indonesia yang awalnya dikembangkan sejak tahun 2014. Proyek ini menyimpan ribuan data 
                spesies tanaman, senyawa bioaktif, dan khasiat tradisional yang sangat berharga untuk 
                penelitian dan pengembangan obat.
              </p>
              
              <p className="leading-relaxed mb-6">
                Sebagai seseorang yang bekerja di lingkungan kampus farmasi, saya memahami betapa 
                pentingnya akses terhadap informasi tanaman obat tradisional Indonesia bagi mahasiswa, 
                dosen, dan peneliti. Sayangnya, website asli sudah tidak di-maintenance dan menjadi outdated.
              </p>
              
              <p className="leading-relaxed mb-6">
                Melihat nilai ilmiah dan potensinya yang besar, saya memutuskan untuk berkontribusi 
                dalam merevitalisasi proyek ini agar dapat dimanfaatkan kembali oleh komunitas akademik 
                dan masyarakat luas.
              </p>
            </div>

            {/* Attribution Card */}
            <Card className="mt-8 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <GitFork className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Kredit & Atribusi</h3>
                    <p className="text-gray-600">
                      Proyek ini merupakan hasil <strong>fork</strong> dari <strong>HerbalDB</strong> yang 
                      awalnya dikembangkan oleh <strong>Annisa Prida</strong>. 
                      Kami sangat menghargai fondasi dan kontribusi yang telah dibangun sebelumnya.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-green-100 rounded-full p-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Visi & Misi</h2>
                <p className="text-gray-600">Tujuan dan arah pengembangan HerbalDB</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-3">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Visi</h3>
                  <p className="text-gray-600">
                    Menjadi database tanaman obat Indonesia yang paling lengkap dan terpercaya, 
                    mendukung penelitian farmasi dan pelestarian pengetahuan tradisional.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-3">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Misi</h3>
                  <ol className="text-gray-600 space-y-2">
                    <li>• Menyediakan akses terbuka ke data herbal</li>
                    <li>• Mendukung riset dan pendidikan farmasi</li>
                    <li>• Memfasilitasi kolaborasi antar peneliti</li>
                    <li>• Melestarikan pengetahuan tradisional</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Apa yang Kami Tawarkan</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                    <Database className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Database Lengkap</h3>
                  <p className="text-sm text-gray-600">
                    Ribuan data spesies tanaman, senyawa bioaktif, dan file struktur molekul
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                    <Globe className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Akses Terbuka</h3>
                  <p className="text-sm text-gray-600">
                    Gratis untuk keperluan edukasi, penelitian, dan pengembangan
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
                    <Users className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Komunitas</h3>
                  <p className="text-sm text-gray-600">
                    Dikembangkan bersama komunitas akademik dan peneliti
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Hubungi Kami</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href="mailto:febriandeffan@gmail.com"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Mail className="h-6 w-6 text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">febriandeffan@gmail.com</div>
                </div>
              </a>
              
              <a 
                href="https://instagram.com/deffnotjeff"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Instagram className="h-6 w-6 text-pink-600" />
                <div>
                  <div className="text-sm text-gray-500">Instagram</div>
                  <div className="font-medium text-gray-900 flex items-center gap-1">
                    @deffnotjeff
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </a>
              
              <a 
                href="https://github.com/deffan10"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <Github className="h-6 w-6 text-gray-800" />
                <div>
                  <div className="text-sm text-gray-500">GitHub</div>
                  <div className="font-medium text-gray-900 flex items-center gap-1">
                    deffan10
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-green-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ingin Berkontribusi?
            </h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan komunitas kami dan bantu mengembangkan database tanaman obat Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Daftar Sekarang</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-green-700">
                <Link href="/donate">
                  <Heart className="mr-2 h-5 w-5" />
                  Dukung Proyek Ini
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
