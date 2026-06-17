import type { Metadata } from 'next';
import SpeciesDetailClient from './SpeciesDetailClient';
import type { Species } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

async function getSpeciesData(id: string): Promise<Species | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
    const res = await fetch(`${API_URL}/species/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error('Error fetching species details in Server Component:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const species = await getSpeciesData(id);

  if (!species) {
    return {
      title: 'Spesies Tidak Ditemukan - HerbalDB',
      description: 'Detail spesies tanaman herbal tidak ditemukan.',
    };
  }

  const localNameText = species.local_names && species.local_names.length > 0
    ? ` (${species.local_names[0].name})`
    : '';
  const title = `${species.scientific_name}${localNameText} - HerbalDB`;
  const description = species.description || `Informasi lengkap mengenai taksonomi, nama lokal, senyawa bioaktif, khasiat tradisional, dan publikasi referensi ilmiah untuk tanaman obat ${species.scientific_name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://herbaldb.site/species/${id}`,
      images: species.photo ? [{ url: species.photo }] : [],
    },
  };
}

export default async function SpeciesDetailPage({ params }: Props) {
  const { id } = await params;
  const species = await getSpeciesData(id);

  return <SpeciesDetailClient initialData={species} />;
}
