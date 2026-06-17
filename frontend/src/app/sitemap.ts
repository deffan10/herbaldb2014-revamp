import { MetadataRoute } from 'next';

const BASE_URL = 'https://herbaldb.site';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static routes
  const routes = ['', '/about', '/species', '/compounds', '/references', '/contributors', '/donate', '/artikel'];
  const staticUrls = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const dynamicUrls: MetadataRoute.Sitemap = [];

  // 2. Fetch Species
  try {
    const res = await fetch(`${API_URL}/species?per_page=1000`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (res.ok) {
      const result = await res.json();
      const speciesList = result?.data || [];
      const speciesUrls = speciesList.map((item: any) => ({
        url: `${BASE_URL}/species/${item.id}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
      dynamicUrls.push(...speciesUrls);
    }
  } catch (error) {
    console.error('Failed to fetch species for sitemap:', error);
  }

  // 3. Fetch Compounds
  try {
    const res = await fetch(`${API_URL}/compounds?per_page=1000`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const result = await res.json();
      const compoundsList = result?.data || [];
      const compoundsUrls = compoundsList.map((item: any) => ({
        url: `${BASE_URL}/compounds/${item.id}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
      dynamicUrls.push(...compoundsUrls);
    }
  } catch (error) {
    console.error('Failed to fetch compounds for sitemap:', error);
  }

  // 4. Fetch Articles (Berita/Artikel)
  try {
    const res = await fetch(`${API_URL}/articles?per_page=1000`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const result = await res.json();
      const articlesList = result?.data || (Array.isArray(result) ? result : []);
      const articlesUrls = articlesList.map((item: any) => ({
        url: `${BASE_URL}/artikel/${item.slug}`,
        lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
      dynamicUrls.push(...articlesUrls);
    }
  } catch (error) {
    console.error('Failed to fetch articles for sitemap:', error);
  }

  return [...staticUrls, ...dynamicUrls];
}
