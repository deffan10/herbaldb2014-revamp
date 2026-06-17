import type { Metadata } from 'next';
import CompoundDetailClient from './CompoundDetailClient';
import type { Compound } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

async function getCompoundData(id: string): Promise<Compound | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
    const res = await fetch(`${API_URL}/compounds/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error('Error fetching compound details in Server Component:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const compound = await getCompoundData(id);

  if (!compound) {
    return {
      title: 'Senyawa Tidak Ditemukan - HerbalDB',
      description: 'Detail senyawa bioaktif tidak ditemukan.',
    };
  }

  const title = `${compound.name} - Senyawa Bioaktif - HerbalDB`;
  const formulaText = compound.molecular_formula ? ` (${compound.molecular_formula})` : '';
  const description = `Informasi detail senyawa bioaktif ${compound.name}${formulaText}. Menampilkan berat molekul, struktur kimia SMILES/InChI, deskripsi farmakologi, dan daftar tanaman herbal Indonesia yang mengandung senyawa ini.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://herbaldb.site/compounds/${id}`,
    },
  };
}

export default async function CompoundDetailPage({ params }: Props) {
  const { id } = await params;
  const compound = await getCompoundData(id);

  return <CompoundDetailClient initialData={compound} />;
}
