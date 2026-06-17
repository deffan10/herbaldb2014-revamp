'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FlaskConical, 
  ArrowLeft, 
  Leaf,
  BookOpen, 
  Atom,
  Tag,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle,
  FileText,
  Plus,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import { compoundsApi } from '@/lib/api/compounds';
import api from '@/lib/api/client';
import type { Compound, Species } from '@/types';

export default function CompoundDetailClient({ initialData }: { initialData?: Compound | null }) {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const [compound, setCompound] = useState<Compound | null>(initialData || null);
  const [loading, setLoading] = useState(initialData ? false : true);
  const [error, setError] = useState<string | null>(null);

  // Molecular info contribution
  const [molInfoModalOpen, setMolInfoModalOpen] = useState(false);
  const [molFormData, setMolFormData] = useState({
    molecular_formula: '',
    molecular_weight: '',
    smiles: '',
    inchi: '',
    inchi_key: '',
    cas_number: '',
  });
  const [submittingMolInfo, setSubmittingMolInfo] = useState(false);

  // Species link contribution
  const [speciesModalOpen, setSpeciesModalOpen] = useState(false);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [speciesResults, setSpeciesResults] = useState<Species[]>([]);
  const [searchingSpecies, setSearchingSpecies] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [submittingSpecies, setSubmittingSpecies] = useState(false);

  const handleAddMolInfoClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan daftar atau login untuk menambahkan informasi.',
      });
      router.push('/register');
      return;
    }
    
    // Check if token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: 'Sesi Berakhir',
          description: 'Silakan login kembali untuk melanjutkan.',
        });
        router.push('/login');
        return;
      }
    }
    
    // Pre-fill with existing data
    if (compound) {
      setMolFormData({
        molecular_formula: compound.molecular_formula || '',
        molecular_weight: compound.molecular_weight?.toString() || '',
        smiles: compound.smiles || '',
        inchi: compound.inchi || '',
        inchi_key: compound.inchi_key || '',
        cas_number: compound.cas_number || '',
      });
    }
    setMolInfoModalOpen(true);
  };

  const handleSubmitMolInfo = async () => {
    if (!compound) return;
    
    setSubmittingMolInfo(true);
    try {
      const dataToSubmit: Record<string, any> = {};
      
      // Only include non-empty values
      if (molFormData.molecular_formula?.trim()) {
        dataToSubmit.molecular_formula = molFormData.molecular_formula.trim();
      }
      if (molFormData.molecular_weight?.trim()) {
        const weight = parseFloat(molFormData.molecular_weight);
        if (!isNaN(weight)) {
          dataToSubmit.molecular_weight = weight;
        }
      }
      if (molFormData.smiles?.trim()) {
        dataToSubmit.smiles = molFormData.smiles.trim();
      }
      if (molFormData.inchi?.trim()) {
        dataToSubmit.inchi = molFormData.inchi.trim();
      }
      if (molFormData.inchi_key?.trim()) {
        dataToSubmit.inchi_key = molFormData.inchi_key.trim();
      }
      if (molFormData.cas_number?.trim()) {
        dataToSubmit.cas_number = molFormData.cas_number.trim();
      }

      // Check if at least one field is filled
      if (Object.keys(dataToSubmit).length === 0) {
        toast({
          title: 'Error',
          description: 'Mohon isi setidaknya satu field.',
          variant: 'destructive',
        });
        setSubmittingMolInfo(false);
        return;
      }

      const response = await api.post(`/compounds/${compound.id}/contribute-molecular`, dataToSubmit);
      
      setCompound(response.data.data);
      toast({
        title: 'Berhasil',
        description: 'Informasi molekuler berhasil ditambahkan.',
      });
      setMolInfoModalOpen(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan informasi.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Error already surfaced via toast
    } finally {
      setSubmittingMolInfo(false);
    }
  };

  const handleAddSpeciesClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan daftar atau login untuk menambahkan spesies.',
      });
      router.push('/register');
      return;
    }
    setSpeciesModalOpen(true);
  };

  // Search species
  useEffect(() => {
    const searchSpecies = async () => {
      if (speciesSearch.length < 2) {
        setSpeciesResults([]);
        return;
      }

      setSearchingSpecies(true);
      try {
        const response = await api.get('/species', {
          params: { search: speciesSearch, per_page: 10 },
        });
        setSpeciesResults(response.data.data || []);
      } catch (error) {
        console.error('Failed to search species:', error);
      } finally {
        setSearchingSpecies(false);
      }
    };

    const debounce = setTimeout(searchSpecies, 300);
    return () => clearTimeout(debounce);
  }, [speciesSearch]);

  const handleSubmitSpeciesLink = async () => {
    if (!selectedSpecies || !compound) return;
    
    setSubmittingSpecies(true);
    try {
      const response = await api.post(`/compounds/${compound.id}/contribute-species`, {
        species_id: selectedSpecies.id,
      });
      
      setCompound(response.data.data);
      toast({
        title: 'Berhasil',
        description: 'Spesies berhasil ditambahkan dan akan direview.',
      });
      setSpeciesModalOpen(false);
      setSelectedSpecies(null);
      setSpeciesSearch('');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Gagal menambahkan spesies.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingSpecies(false);
    }
  };

  useEffect(() => {
    const fetchCompound = async () => {
      if (!params.id) return;
      if (initialData && String(initialData.id) === String(params.id)) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await compoundsApi.getById(params.id as string);
        // Handle response format
        const data = (response as any).data || response;
        setCompound(data);
      } catch (err: any) {
        console.error('Failed to fetch compound:', err);
        setError(err.response?.data?.message || 'Compound not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCompound();
  }, [params.id, initialData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading compound data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !compound) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <FlaskConical className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Compound Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The compound you are looking for does not exist.'}</p>
            <Button onClick={() => router.push('/compounds')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Compounds List
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
              href="/compounds" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Compounds List
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {compound.group && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {compound.group.name}
                    </Badge>
                  )}
                  <Badge 
                    variant={compound.status === 'published' ? 'default' : 'secondary'}
                    className={compound.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {compound.status}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {compound.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                  {compound.pubchem_id && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span>PubChem: <strong className="text-gray-700">{compound.pubchem_id}</strong></span>
                    </div>
                  )}
                  {compound.knapsack_id && (
                    <div className="flex items-center gap-1">
                      <Atom className="h-4 w-4" />
                      <span>KNApSAcK: <strong className="text-gray-700">{compound.knapsack_id}</strong></span>
                    </div>
                  )}
                  {compound.cas_number && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>CAS: <strong className="text-gray-700">{compound.cas_number}</strong></span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {compound.pubchem_id && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchem_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      PubChem
                    </a>
                  </Button>
                )}
                {compound.knapsack_id && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`http://www.knapsackfamily.com/knapsack_core/information.php?sname=C_ID&word=${compound.knapsack_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      KNApSAcK
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
              {/* Molecular Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Atom className="h-5 w-5 text-blue-600" />
                      Molecular Information
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddMolInfoClick}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Kontribusi
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {compound.molecular_formula && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">Molecular Formula</span>
                      <span className="font-mono text-gray-900">{compound.molecular_formula}</span>
                    </div>
                  )}
                  
                  {compound.molecular_weight && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">Molecular Weight</span>
                      <span className="font-mono text-gray-900">{compound.molecular_weight} g/mol</span>
                    </div>
                  )}
                  
                  {compound.smiles && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500 block mb-2">SMILES</span>
                      <code className="text-sm text-gray-700 break-all bg-white p-2 rounded border block">
                        {compound.smiles}
                      </code>
                    </div>
                  )}
                  
                  {compound.inchi && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500 block mb-2">InChI</span>
                      <code className="text-sm text-gray-700 break-all bg-white p-2 rounded border block">
                        {compound.inchi}
                      </code>
                    </div>
                  )}
                  
                  {compound.inchi_key && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">InChI Key</span>
                      <code className="font-mono text-sm text-gray-900">{compound.inchi_key}</code>
                    </div>
                  )}

                  {/* Show message if no molecular data */}
                  {!compound.molecular_formula && !compound.molecular_weight && !compound.smiles && !compound.inchi && !compound.inchi_key && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-4">
                        Informasi molekuler belum tersedia untuk senyawa ini.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleAddMolInfoClick}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Jadi yang pertama menambahkan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Species containing this compound */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        Species Containing This Compound
                      </CardTitle>
                      <CardDescription>
                        Plant species where this compound has been identified
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSpeciesClick}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {compound.species && compound.species.length > 0 ? (
                    <div className="space-y-3">
                      {compound.species.map((sp) => (
                        <Link 
                          key={sp.id}
                          href={`/species/${sp.id}`}
                          className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 hover:text-green-600 italic">
                                {sp.scientific_name}
                              </h4>
                              <div className="flex gap-2 mt-1">
                                {sp.family && (
                                  <Badge variant="outline" className="text-xs">
                                    {sp.family}
                                  </Badge>
                                )}
                                {sp.species_code && (
                                  <Badge variant="outline" className="text-xs font-mono">
                                    {sp.species_code}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Leaf className="h-5 w-5 text-green-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Belum ada spesies yang terhubung dengan senyawa ini.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleAddSpeciesClick}
                        className="flex items-center gap-1 mx-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Jadi yang pertama menambahkan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Compound Name</h4>
                    <p className="text-gray-900 font-medium">{compound.name}</p>
                  </div>
                  
                  {compound.group && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Compound Group</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        {compound.group.name}
                      </Badge>
                    </div>
                  )}
                  
                  {compound.pubchem_id && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">PubChem ID</h4>
                      <a 
                        href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchem_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {compound.pubchem_id}
                      </a>
                    </div>
                  )}
                  
                  {compound.knapsack_id && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">KNApSAcK ID</h4>
                      <a 
                        href={`http://www.knapsackfamily.com/knapsack_core/information.php?sname=C_ID&word=${compound.knapsack_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {compound.knapsack_id}
                      </a>
                    </div>
                  )}
                  
                  {compound.cas_number && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">CAS Number</h4>
                      <p className="text-gray-900 font-mono">{compound.cas_number}</p>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Added: {new Date(compound.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  {compound.verified_at && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified: {new Date(compound.verified_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {compound.species?.length || 0}
                      </div>
                      <div className="text-sm text-gray-500">Species Found In</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* External Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">External Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {compound.pubchem_id && (
                    <a 
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.pubchem_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">View on PubChem</span>
                    </a>
                  )}
                  {compound.knapsack_id && (
                    <a 
                      href={`http://www.knapsackfamily.com/knapsack_core/information.php?sname=C_ID&word=${compound.knapsack_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">View on KNApSAcK</span>
                    </a>
                  )}
                  {compound.cas_number && (
                    <a 
                      href={`https://commonchemistry.cas.org/detail?cas_rn=${compound.cas_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">View on CAS Common Chemistry</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Molecular Info Contribution Dialog */}
      <Dialog open={molInfoModalOpen} onOpenChange={setMolInfoModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kontribusi Informasi Molekuler</DialogTitle>
            <DialogDescription>
              Tambahkan atau lengkapi informasi molekuler untuk <strong>{compound?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mol-formula">Molecular Formula</Label>
                <Input
                  id="mol-formula"
                  placeholder="C6H12O6"
                  value={molFormData.molecular_formula}
                  onChange={(e) => setMolFormData({ ...molFormData, molecular_formula: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mol-weight">Molecular Weight</Label>
                <Input
                  id="mol-weight"
                  type="number"
                  step="0.01"
                  placeholder="180.16"
                  value={molFormData.molecular_weight}
                  onChange={(e) => setMolFormData({ ...molFormData, molecular_weight: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cas-number">CAS Number</Label>
              <Input
                id="cas-number"
                placeholder="50-99-7"
                value={molFormData.cas_number}
                onChange={(e) => setMolFormData({ ...molFormData, cas_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smiles">SMILES</Label>
              <Input
                id="smiles"
                placeholder="OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O"
                value={molFormData.smiles}
                onChange={(e) => setMolFormData({ ...molFormData, smiles: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inchi">InChI</Label>
              <Input
                id="inchi"
                placeholder="InChI=1S/C6H12O6/c7-1-2-..."
                value={molFormData.inchi}
                onChange={(e) => setMolFormData({ ...molFormData, inchi: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inchi-key">InChI Key</Label>
              <Input
                id="inchi-key"
                placeholder="WQZGKKKJIJFFOK-GASJEMHNSA-N"
                value={molFormData.inchi_key}
                onChange={(e) => setMolFormData({ ...molFormData, inchi_key: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMolInfoModalOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmitMolInfo} 
              disabled={submittingMolInfo}
            >
              {submittingMolInfo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Species Link Contribution Dialog */}
      <Dialog open={speciesModalOpen} onOpenChange={setSpeciesModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Spesies</DialogTitle>
            <DialogDescription>
              Tambahkan spesies yang mengandung senyawa <strong>{compound?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cari Spesies</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ketik nama ilmiah atau nama lokal..."
                  value={speciesSearch}
                  onChange={(e) => setSpeciesSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {searchingSpecies && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Mencari...</span>
              </div>
            )}

            {speciesResults.length > 0 && (
              <div className="border rounded-lg max-h-[200px] overflow-y-auto">
                {speciesResults.map((sp) => (
                  <div
                    key={sp.id}
                    onClick={() => setSelectedSpecies(sp)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedSpecies?.id === sp.id ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="font-medium italic">{sp.scientific_name}</div>
                    {sp.family && (
                      <div className="text-xs text-gray-500">{sp.family}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedSpecies && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Dipilih:</strong> <span className="italic">{selectedSpecies.scientific_name}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSpeciesModalOpen(false);
              setSelectedSpecies(null);
              setSpeciesSearch('');
            }}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmitSpeciesLink} 
              disabled={!selectedSpecies || submittingSpecies}
            >
              {submittingSpecies ? (
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
