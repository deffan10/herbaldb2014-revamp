'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { articlesApi, articleAdsApi } from '@/lib/api/articles';
import type { Article, ArticleAd } from '@/types';

export default function ArticleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: () => articlesApi.getBySlug(slug || ''),
    enabled: !!slug,
  });

  const { data: moreArticles } = useQuery<Article[]>({
    queryKey: ['article-latest'],
    queryFn: () => articlesApi.getLatest(5),
  });

  const { data: ads } = useQuery<ArticleAd[]>({
    queryKey: ['article-ads'],
    queryFn: () => articleAdsApi.getPublic(2),
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="mb-6 text-green-700 hover:text-green-800 w-fit">
            <Link href="/artikel" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Artikel
            </Link>
          </Button>

          {isLoading || !article ? (
            <Card className="shadow-sm">
              <div className="h-64 bg-gray-200 animate-pulse" />
              <CardHeader>
                <CardTitle className="h-6 bg-gray-200 animate-pulse rounded" />
                <CardDescription className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden shadow-sm">
                  {article.featured_image_url && (
                    <div className="h-80 bg-gray-100">
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl text-gray-900 leading-tight">{article.title}</CardTitle>
                    {article.published_at && (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.published_at).toLocaleDateString('id-ID', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none text-justify" dangerouslySetInnerHTML={{ __html: article.body_html }} />
                  </CardContent>
                </Card>
              </div>

              <aside className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      Artikel Lainnya
                    </CardTitle>
                    <CardDescription>Update terbaru dari HerbalDB</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(moreArticles || []).filter((a) => a.slug !== article.slug).slice(0, 4).map((a) => (
                      <Link key={a.id} href={`/artikel/${a.slug}`} className="block">
                        <div className="flex gap-3 group">
                          <div className="h-16 w-20 bg-gray-100 rounded overflow-hidden">
                            {a.featured_image_url ? (
                              <img src={a.featured_image_url} alt={a.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm group-hover:text-green-700 line-clamp-2">{a.title}</p>
                            {a.published_at && (
                              <p className="text-xs text-gray-500 mt-1">{new Date(a.published_at).toLocaleDateString('id-ID')}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-blue-500" />
                      Iklan
                    </CardTitle>
                    <CardDescription>Konten sponsor pilihan</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    {(ads || []).map((ad) => {
                      const CardBody = (
                        <div
                          className={`rounded-lg overflow-hidden border bg-white transition-shadow ${ad.target_url ? 'hover:shadow-lg cursor-pointer' : 'hover:shadow-md cursor-default'}`}
                        >
                          {ad.image_url ? (
                            <img src={ad.image_url} alt={ad.title || 'Iklan'} className="w-full h-32 object-cover" />
                          ) : (
                            <div className="w-full h-32 bg-gray-100" />
                          )}
                          {ad.title && (
                            <p className="p-3 text-sm font-semibold text-gray-800 text-center">{ad.title}</p>
                          )}
                        </div>
                      );

                      return ad.target_url ? (
                        <Link key={ad.id} href={ad.target_url} target="_blank" rel="noopener noreferrer" className="block">
                          {CardBody}
                        </Link>
                      ) : (
                        <div key={ad.id}>{CardBody}</div>
                      );
                    })}
                  </CardContent>
                </Card>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
