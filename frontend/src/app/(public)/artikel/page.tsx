'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, ArrowLeft, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { articlesApi } from '@/lib/api/articles';
import type { Article, PaginatedResponse } from '@/types';

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export default function ArticlesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', page],
    queryFn: () => articlesApi.getPaginated({ page, per_page: 10 }),
    keepPreviousData: true,
  });

  const articles = data?.data || [];

  const canPrev = (data?.current_page || 1) > 1;
  const canNext = (data?.current_page || 1) < (data?.last_page || 1);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Newspaper className="h-7 w-7 text-green-600" />
                Artikel
              </h1>
              <p className="text-gray-600">Kumpulan artikel terbaru seputar HerbalDB dan herbal Indonesia.</p>
            </div>
            <div className="text-sm text-gray-500">
              Menampilkan {(data?.from ?? 0)} - {(data?.to ?? 0)} dari {data?.total ?? 0} artikel
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="overflow-hidden shadow-sm">
                  <div className="h-40 bg-gray-200 animate-pulse" />
                  <CardHeader>
                    <CardTitle className="h-5 bg-gray-200 animate-pulse rounded" />
                    <CardDescription>
                      <span className="block h-4 bg-gray-200 animate-pulse rounded w-11/12" />
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Belum ada artikel.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-100 overflow-hidden">
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
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2 mb-2">{article.title}</CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-2">
                      {stripHtml(article.body_html).slice(0, 160)}
                      {stripHtml(article.body_html).length > 160 ? '…' : ''}
                    </CardDescription>
                    <div className="mt-4">
                      <Link href={`/artikel/${article.slug}`} className="text-green-700 font-semibold hover:underline">
                        Read more →
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-gray-600">
              Page {data?.current_page || 1} of {data?.last_page || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => (canNext ? p + 1 : p))}
              disabled={!canNext}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
