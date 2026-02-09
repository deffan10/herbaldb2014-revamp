'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Leaf, FlaskConical, BookOpen, Users, ArrowRight, Loader2, Heart, Globe, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { statsApi, Stats } from '@/lib/api/stats';
import { articlesApi } from '@/lib/api/articles';
import type { Article } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articlesApi.getLatest(3);
        setLatestArticles(data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setArticlesLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
  };

  const snippet = (html: string): string => {
    // Strip tags and decode common nbsp entities so cards don't show "&nbsp;"
    const plain = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ');
    return plain.trim().slice(0, 160) + (plain.length > 160 ? '…' : '');
  };

  const statsDisplay = [
    { 
      label: 'Spesies Tanaman', 
      value: stats?.species ?? 0, 
      icon: Leaf,
      href: '/species'
    },
    { 
      label: 'Senyawa', 
      value: stats?.compounds ?? 0, 
      icon: FlaskConical,
      href: '/compounds'
    },
    { 
      label: 'Referensi', 
      value: stats?.references ?? 0, 
      icon: BookOpen,
      href: '/references'
    },
    { 
      label: 'Kontributor', 
      value: stats?.contributors ?? 0, 
      icon: Users,
      href: '/contributors'
    },
    {
      label: 'Kunjungan Web',
      value: '-', // Placeholder, akan diisi data Google Analytics
      icon: Globe,
      href: '#analytics'
    },
  ];

  const features = [
    {
      title: 'Database Lengkap',
      description: 'Akses ribuan data tanaman obat Indonesia dengan informasi taksonomi dan khasiat tradisional.',
      icon: Leaf,
      href: '/species',
    },
    {
      title: 'Senyawa Bioaktif',
      description: 'Jelajahi senyawa kimia dalam tanaman obat beserta struktur molekul dan data farmakologi.',
      icon: FlaskConical,
      href: '/compounds',
    },
    {
      title: 'Referensi Ilmiah',
      description: 'Semua data didukung oleh publikasi ilmiah dan dokumentasi pengetahuan tradisional.',
      icon: BookOpen,
      href: '/references',
    },
    {
      title: 'Berbasis Komunitas',
      description: 'Bergabung dengan komunitas peneliti dan kontributor untuk memperluas database.',
      icon: Users,
      href: '/register',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section with Search */}
      <main className="flex-grow">
        <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-40 pb-20">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Logo & Title */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <Leaf className="h-16 w-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              HerbalDB Indonesia
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover the rich biodiversity of Indonesian herbal plants and their bioactive compounds
            </p>

            {/* Google-style Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <Search className="absolute left-5 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search plants, compounds, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-32 py-6 text-lg border-0 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button 
                    type="submit"
                    className="absolute right-2 bg-green-600 hover:bg-green-700 rounded-full px-6"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/species" className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1">
                Browse Species <ArrowRight className="h-3 w-3" />
              </Link>
              <Link href="/compounds" className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1">
                Browse Compounds <ArrowRight className="h-3 w-3" />
              </Link>
              <Link href="/search?type=advanced" className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-1">
                Advanced Search <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsDisplay.map((stat) => (
                <Link 
                  key={stat.label} 
                  href={stat.href}
                  className="text-center group cursor-pointer"
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {loading ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    ) : (
                      typeof stat.value === 'number' ? formatNumber(stat.value) : '-'
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Explore Our Database
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                HerbalDB provides comprehensive information about Indonesian medicinal plants,
                their chemical compounds, and traditional uses.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Link key={feature.title} href={feature.href}>
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full cursor-pointer group">
                    <CardHeader>
                      <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                        <feature.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-green-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Artikel Terbaru</h2>
              <p className="text-gray-600 mb-4">Tulisan terbaru seputar HerbalDB dan dunia herbal Indonesia.</p>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/artikel">Berita Lainnya</Link>
              </Button>
            </div>

            {articlesLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="shadow-sm">
                    <div className="h-40 bg-gray-100 animate-pulse" />
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <span className="block bg-gray-100 h-5 w-3/4 animate-pulse rounded" />
                      </CardTitle>
                      <CardDescription>
                        <span className="block bg-gray-100 h-4 w-full animate-pulse rounded" />
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : latestArticles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Belum ada artikel.</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {latestArticles.map((article) => (
                  <Link key={article.id} href={`/artikel/${article.slug}`}>
                    <Card className="h-full shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-44 bg-gray-100 overflow-hidden">
                        {article.featured_image_url ? (
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </div>
                      <CardHeader className="text-center">
                        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-gray-600">
                          {snippet(article.body_html)}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Additional Stats Section */}
        {stats && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Database Coverage
                </h2>
                <p className="text-gray-600">
                  Our comprehensive database includes detailed information across multiple categories
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(stats.local_names)}</div>
                  <div className="text-sm text-gray-500 mt-1">Local Names</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(stats.virtues)}</div>
                  <div className="text-sm text-gray-500 mt-1">Traditional Uses</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(stats.compound_groups)}</div>
                  <div className="text-sm text-gray-500 mt-1">Compound Groups</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(stats.plant_parts)}</div>
                  <div className="text-sm text-gray-500 mt-1">Plant Parts</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-green-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Contribute to HerbalDB
            </h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Join our community of researchers and help expand the database. 
              Share your knowledge and contribute to preserving traditional herbal medicine.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Become a Contributor</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-green-700">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <GraduationCap className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Tentang Proyek Ini
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600 text-justify">
              <p className="text-lg leading-relaxed mb-6">
                <strong className="text-gray-900">HerbalDB Indonesia</strong> adalah database tanaman obat Indonesia yang awalnya dikembangkan 
                sejak tahun 2014. Saya melihat potensi besar dari website ini untuk dunia farmasi dan kesehatan di Indonesia.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Sebagai seseorang yang bekerja di lingkungan kampus farmasi, saya memahami betapa pentingnya akses terhadap 
                informasi tanaman obat tradisional Indonesia bagi mahasiswa, dosen, dan peneliti. Database ini menyimpan 
                ribuan data spesies tanaman, senyawa bioaktif, dan khasiat tradisional yang sangat berharga untuk 
                penelitian dan pengembangan obat.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Sayangnya, website asli sudah tidak di-maintenance dan menjadi outdated. Melihat nilai ilmiah dan 
                potensinya yang besar, saya memutuskan untuk berkontribusi dalam merevitalisasi proyek ini agar 
                dapat dimanfaatkan kembali oleh komunitas akademik dan masyarakat luas.
              </p>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
                <p className="text-sm text-green-800">
                  <strong>Catatan:</strong> Proyek ini merupakan hasil fork dari <strong>HerbalDB</strong> yang 
                  awalnya dikembangkan oleh <strong>Annisa Prida</strong>. Terima kasih atas kontribusi dan 
                  fondasi yang telah dibangun.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Globe className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Akses Terbuka</h3>
                  <p className="text-sm text-gray-600">Database gratis untuk keperluan edukasi dan penelitian</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <GraduationCap className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Untuk Akademisi</h3>
                  <p className="text-sm text-gray-600">Mendukung mahasiswa & dosen farmasi dalam penelitian</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Heart className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
                  <p className="text-sm text-gray-600">Dikembangkan bersama komunitas untuk kebermanfaatan bersama</p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Bantu kami menjaga website ini tetap online dan terus berkembang
              </p>
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
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