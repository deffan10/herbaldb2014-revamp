import type { Metadata } from 'next';
import ArticleDetailClient from './ArticleDetailClient';
import type { Article } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticleData(slug: string): Promise<Article | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
    const res = await fetch(`${API_URL}/articles/${slug}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error('Error fetching article details in Server Component:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleData(slug);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan - HerbalDB',
      description: 'Detail artikel herbal tidak ditemukan.',
    };
  }

  const title = `${article.title} - HerbalDB`;
  
  // Strip HTML tags for description
  const cleanDescription = article.body_html
    ? article.body_html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160) + '...'
    : `Baca artikel lengkap seputar ${article.title} di database HerbalDB Indonesia.`;

  return {
    title,
    description: cleanDescription,
    openGraph: {
      title,
      description: cleanDescription,
      type: 'article',
      url: `https://herbaldb.site/artikel/${slug}`,
      images: article.featured_image_url ? [{ url: article.featured_image_url }] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleData(slug);

  return <ArticleDetailClient initialData={article} />;
}
