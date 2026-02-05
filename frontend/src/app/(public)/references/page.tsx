'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/api/client';

interface Reference {
  id: number;
  source_name: string;
  authors?: string;
  year?: number;
  type: string;
  url?: string;
}

export default function ReferencesPage() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const { data } = await api.get('/references');
        // Handle both array and paginated response
        setReferences(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Failed to fetch references:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReferences();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              References & Sources
            </h1>
            <p className="text-gray-600 mt-2">
              Scientific publications and authoritative sources backing our database
            </p>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : references.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No references found.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Total {references.length} references
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {references.map((ref) => (
                  <Card key={ref.id} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg text-gray-900">
                          {ref.source_name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {ref.type || 'source'}
                        </Badge>
                      </div>
                      {ref.authors && (
                        <CardDescription className="text-sm">
                          {ref.authors}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {ref.year && (
                        <p className="text-sm text-gray-500 mb-2">
                          Year: {ref.year}
                        </p>
                      )}
                      
                      {ref.url && (
                        <a 
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Visit Source
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
