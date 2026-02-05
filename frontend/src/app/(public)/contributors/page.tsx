'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, Building, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import api from '@/lib/api/client';

interface Contributor {
  id: number;
  name: string;
  email: string;
  institution?: string;
  avatar_url?: string;
  contributions_count?: number;
}

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const { data } = await api.get('/contributors');
        setContributors(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Failed to fetch contributors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContributors();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-8 w-8 text-orange-600" />
              Our Contributors
            </h1>
            <p className="text-gray-600 mt-2">
              Meet the researchers and contributors who help build our database
            </p>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : contributors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No contributors found.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Total {contributors.length} contributors
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contributors.map((contributor) => (
                  <Card key={contributor.id} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contributor.avatar_url} />
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {getInitials(contributor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg text-gray-900">
                            {contributor.name}
                          </CardTitle>
                          {contributor.institution && (
                            <CardDescription className="text-sm flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {contributor.institution}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {contributor.contributions_count !== undefined && (
                        <Badge variant="secondary">
                          {contributor.contributions_count} contributions
                        </Badge>
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
