'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Leaf, 
  ArrowLeft, 
  MapPin, 
  FlaskConical, 
  BookOpen, 
  Heart,
  User,
  Calendar,
  CheckCircle,
  Tag,
  ExternalLink,
  Loader2,
  ImageIcon,
  Camera,
  Upload,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { speciesApi } from '@/lib/api/species';
import api from '@/lib/api/client';
import type { Species } from '@/types';

export default function SpeciesDetailClient({ initialData }: { initialData?: Species | null }) {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [species, setSpecies] = useState<Species | null>(initialData || null);
  const [loading, setLoading] = useState(initialData ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan daftar atau login untuk mengunggah gambar.',
      });
      router.push('/register');
      return;
    }
    setUploadModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Hanya file gambar yang diizinkan.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Ukuran file maksimal 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !species) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      
      const response = await api.post(`/species/${species.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSpecies({ ...species, photo: response.data.photo });
      toast({
        title: 'Berhasil',
        description: 'Gambar berhasil diunggah.',
      });
      setUploadModalOpen(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal mengunggah gambar.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Local name contribution
  const [localNameModalOpen, setLocalNameModalOpen] = useState(false);
  const [newLocalName, setNewLocalName] = useState('');
  const [newLocalNameRegion, setNewLocalNameRegion] = useState('');
  const [submittingLocalName, setSubmittingLocalName] = useState(false);

  // Virtue/Use contribution
  const [virtueModalOpen, setVirtueModalOpen] = useState(false);
  const [newVirtueDescription, setNewVirtueDescription] = useState('');
  const [newVirtueType, setNewVirtueType] = useState<'traditional' | 'scientific' | 'clinical'>('traditional');
  const [newVirtuePlantPartId, setNewVirtuePlantPartId] = useState<number | undefined>();
  const [submittingVirtue, setSubmittingVirtue] = useState(false);
  const [plantParts, setPlantParts] = useState<Array<{ id: number; name: string }>>([]);

  const handleAddLocalNameClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan daftar atau login untuk menambahkan nama lokal.',
      });
      router.push('/register');
      return;
    }
    setLocalNameModalOpen(true);
  };

  const handleSubmitLocalName = async () => {
    if (!newLocalName.trim() || !species) return;
    
    setSubmittingLocalName(true);
    try {
      const response = await api.post(`/species/${species.id}/local-names`, {
        name: newLocalName.trim(),
        region: newLocalNameRegion.trim() || null,
      });
      
      // Update species with new local name
      setSpecies({
        ...species,
        local_names: [...(species.local_names || []), response.data.data],
      });
      
      toast({
        title: 'Berhasil',
        description: 'Nama lokal berhasil ditambahkan dan akan direview.',
      });
      setLocalNameModalOpen(false);
      setNewLocalName('');
      setNewLocalNameRegion('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal menambahkan nama lokal.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingLocalName(false);
    }
  };

  const handleAddVirtueClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan daftar atau login untuk menambahkan manfaat.',
      });
      router.push('/register');
      return;
    }
    setVirtueModalOpen(true);
  };

  const handleSubmitVirtue = async () => {
    if (!newVirtueDescription.trim() || !species) return;
    
    setSubmittingVirtue(true);
    try {
      const response = await api.post(`/species/${species.id}/virtues`, {
        description: newVirtueDescription.trim(),
        plant_part_id: newVirtuePlantPartId || null,
        virtue_type: newVirtueType,
      });
      
      // Update species with new virtue
      setSpecies({
        ...species,
        virtues: [...(species.virtues || []), response.data.data],
      });
      
      toast({
        title: 'Berhasil',
        description: 'Manfaat berhasil ditambahkan dan akan direview.',
      });
      setVirtueModalOpen(false);
      setNewVirtueDescription('');
      setNewVirtueType('traditional');
      setNewVirtuePlantPartId(undefined);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal menambahkan manfaat.',
        variant: 'destructive',
      });
      console.error('Error adding virtue:', err);
    } finally {
      setSubmittingVirtue(false);
    }
  };

  useEffect(() => {
    const fetchSpecies = async () => {
      if (!params.id) return;
      if (initialData && String(initialData.id) === String(params.id)) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await speciesApi.getById(params.id as string);
        // Handle response format - could be { data: species } or species directly
        const data = (response as any).data || response;
        setSpecies(data);
      } catch (err: any) {
        console.error('Failed to fetch species:', err);
        setError(err.response?.data?.message || 'Species not found');
      } finally {
        setLoading(false);
      }
    };

    fetchSpecies();
  }, [params.id, initialData]);

  // Fetch plant parts for virtue form
  useEffect(() => {
    const fetchPlantParts = async () => {
      try {
        const response = await api.get('/plant-parts');
        const data = (response as any).data;
        // Handle both array and paginated response
        if (Array.isArray(data)) {
          setPlantParts(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setPlantParts(data.data);
        } else {
          setPlantParts([]);
        }
      } catch (err) {
        console.error('Failed to fetch plant parts:', err);
        setPlantParts([]);
      }
    };

    fetchPlantParts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading species data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Species Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The species you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/species')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Species List
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-20">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link 
              href="/species" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Species List
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Species Image Placeholder - Clickable */}
              <div className="flex-shrink-0">
                <div 
                  onClick={!species.photo ? handleImageClick : undefined}
                  className={`relative w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-2 border-dashed border-green-200 flex items-center justify-center group ${!species.photo ? 'cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all' : ''}`}
                >
                  {species.photo ? (
                    <img 
                      src={species.photo.startsWith('http') ? species.photo : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${species.photo}`}
                      alt={species.scientific_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                        <Upload className="h-8 w-8 text-green-400 group-hover:text-green-600 transition-colors" />
                      </div>
                      <p className="text-xs text-green-600 font-medium">Foto belum tersedia</p>
                      <p className="text-xs text-green-500 mt-1">Klik untuk upload</p>
                      <Camera className="h-4 w-4 text-green-400 mx-auto mt-2 group-hover:text-green-600 transition-colors" />
                    </div>
                  )}
                </div>
              </div>

              {/* Species Info */}
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {species.species_code}
                  </Badge>
                  <Badge 
                    variant={species.status === 'published' ? 'default' : 'secondary'}
                    className={species.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {species.status}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 italic mb-2">
                  {species.scientific_name}
                </h1>
                
                {species.variety && (
                  <p className="text-lg text-gray-600">var. {species.variety}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                  {species.family && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span>Family: <strong className="text-gray-700">{species.family}</strong></span>
                    </div>
                  )}
                  {species.discoverer && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{species.discoverer}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {species.reference?.url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={species.reference.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Reference
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {(species.description || species.description_en) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {species.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Indonesian</h4>
                        <p className="text-gray-700">{species.description}</p>
                      </div>
                    )}
                    {species.description_en && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">English</h4>
                        <p className="text-gray-700">{species.description_en}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tabs for related data */}
              <Tabs defaultValue="local_names" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="local_names" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Local Names ({species.local_names?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="compounds" className="flex items-center gap-1">
                    <FlaskConical className="h-4 w-4" />
                    Compounds ({species.compounds?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="virtues" className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    Uses ({species.virtues?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Local Names Tab */}
                <TabsContent value="local_names">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Local Names</CardTitle>
                          <CardDescription>
                            Regional and vernacular names for this species
                          </CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleAddLocalNameClick}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tambah
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {species.local_names && species.local_names.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {species.local_names.map((localName) => (
                            <div 
                              key={localName.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="font-medium text-gray-900">{localName.name}</span>
                              {localName.region && (
                                <Badge variant="outline" className="text-xs">
                                  {localName.region}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            No local names recorded for this species.
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={handleAddLocalNameClick}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Jadi yang pertama menambahkan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Compounds Tab */}
                <TabsContent value="compounds">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bioactive Compounds</CardTitle>
                      <CardDescription>
                        Chemical compounds found in this species
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {species.compounds && species.compounds.length > 0 ? (
                        <div className="space-y-3">
                          {species.compounds.map((compound) => (
                            <Link 
                              key={compound.id}
                              href={`/compounds/${compound.id}`}
                              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 hover:text-green-600">
                                    {compound.name}
                                  </h4>
                                  <div className="flex gap-2 mt-1">
                                    {compound.knapsack_id && (
                                      <Badge variant="outline" className="text-xs">
                                        KNApSAcK: {compound.knapsack_id}
                                      </Badge>
                                    )}
                                    {compound.pubchem_id && (
                                      <Badge variant="outline" className="text-xs">
                                        PubChem: {compound.pubchem_id}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {compound.group && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    {compound.group.name}
                                  </Badge>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No compounds recorded for this species.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Virtues/Uses Tab */}
                <TabsContent value="virtues">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Traditional Uses & Benefits</CardTitle>
                          <CardDescription>
                            Medicinal and traditional uses of this species
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddVirtueClick}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Tambah
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {species.virtues && species.virtues.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {species.virtues.map((virtue) => (
                            <div 
                              key={virtue.id}
                              className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {(virtue.plant_part || virtue.plantPart) && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    {(virtue.plant_part || virtue.plantPart)?.name}
                                  </Badge>
                                )}
                                {virtue.virtue_type && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                                    {virtue.virtue_type === 'traditional' ? 'Tradisional' : 
                                     virtue.virtue_type === 'scientific' ? 'Ilmiah' : 
                                     virtue.virtue_type === 'clinical' ? 'Klinis' : virtue.virtue_type}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-700 text-sm">{virtue.description}</p>
                              {virtue.description_en && (
                                <p className="text-gray-500 text-xs mt-2 italic">
                                  {virtue.description_en}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">
                            Belum ada manfaat yang tercatat untuk spesies ini.
                          </p>
                          <Button
                            variant="outline"
                            onClick={handleAddVirtueClick}
                            className="flex items-center gap-1 mx-auto"
                          >
                            <Plus className="h-4 w-4" />
                            Jadi yang pertama menambahkan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Species Code</h4>
                    <p className="text-gray-900 font-mono">{species.species_code}</p>
                  </div>
                  
                  {species.family && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Family</h4>
                      <p className="text-gray-900">{species.family}</p>
                    </div>
                  )}
                  
                  {species.discoverer && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Discoverer</h4>
                      <p className="text-gray-900">{species.discoverer}</p>
                    </div>
                  )}
                  
                  {species.reference && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Reference</h4>
                      <p className="text-gray-900">{species.reference.source_name}</p>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Added: {new Date(species.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  {species.verified_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified: {new Date(species.verified_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Aliases */}
              {species.aliases && species.aliases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scientific Synonyms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {species.aliases.map((alias) => (
                        <li key={alias.id} className="text-gray-700 italic">
                          {alias.alias_name}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {species.local_names?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Local Names</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {species.compounds?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Compounds</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {species.virtues?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Uses</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {species.aliases?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Synonyms</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Upload Image Dialog */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Gambar Spesies</DialogTitle>
            <DialogDescription>
              Unggah gambar untuk <span className="italic">{species?.scientific_name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="species-image-input"
            />
            
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={clearSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="species-image-input"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">Klik untuk memilih gambar</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG hingga 5MB</p>
              </label>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Local Name Dialog */}
      <Dialog open={localNameModalOpen} onOpenChange={setLocalNameModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Nama Lokal</DialogTitle>
            <DialogDescription>
              Tambahkan nama daerah untuk <span className="italic">{species?.scientific_name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="local-name">Nama Lokal *</Label>
              <Input
                id="local-name"
                placeholder="Contoh: Jahe, Kunyit, Temulawak..."
                value={newLocalName}
                onChange={(e) => setNewLocalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Daerah/Region (opsional)</Label>
              <Input
                id="region"
                placeholder="Contoh: Jawa, Sunda, Minang..."
                value={newLocalNameRegion}
                onChange={(e) => setNewLocalNameRegion(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocalNameModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmitLocalName} 
              disabled={!newLocalName.trim() || submittingLocalName}
            >
              {submittingLocalName ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Virtue/Use Dialog */}
      <Dialog open={virtueModalOpen} onOpenChange={setVirtueModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Manfaat/Kegunaan</DialogTitle>
            <DialogDescription>
              Tambahkan manfaat tradisional untuk <span className="italic">{species?.scientific_name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="virtue-description">Deskripsi Manfaat *</Label>
              <Input
                id="virtue-description"
                placeholder="Contoh: Mengobati batuk, meredakan demam..."
                value={newVirtueDescription}
                onChange={(e) => setNewVirtueDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plant-part">Bagian Tanaman (opsional)</Label>
              <select
                id="plant-part"
                value={newVirtuePlantPartId || ''}
                onChange={(e) => setNewVirtuePlantPartId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Pilih bagian tanaman --</option>
                {Array.isArray(plantParts) && plantParts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="virtue-type">Jenis Manfaat</Label>
              <select
                id="virtue-type"
                value={newVirtueType}
                onChange={(e) => setNewVirtueType(e.target.value as 'traditional' | 'scientific' | 'clinical')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="traditional">Manfaat Tradisional</option>
                <option value="scientific">Manfaat Ilmiah</option>
                <option value="clinical">Manfaat Klinis</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVirtueModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmitVirtue} 
              disabled={!newVirtueDescription.trim() || submittingVirtue}
            >
              {submittingVirtue ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
