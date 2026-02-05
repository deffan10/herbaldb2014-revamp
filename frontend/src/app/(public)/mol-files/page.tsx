'use client';

import { useState, useEffect } from 'react';
import { Search, Download, FileBox, Loader2, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

interface MolFile {
  name: string;
  filename: string;
  folder: 'mol1' | 'mol2';
  url: string;
}

interface MolFilesResponse {
  mol1: MolFile[];
  mol2: MolFile[];
  total_mol1: number;
  total_mol2: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
const BACKEND_URL = API_URL.replace('/api/v1', '');

export default function MolFilesPage() {
  const [molFiles, setMolFiles] = useState<MolFilesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<'mol1' | 'mol2'>('mol1');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchMolFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/mol-files`);
        if (response.ok) {
          const data = await response.json();
          setMolFiles(data);
        }
      } catch (error) {
        console.error('Failed to fetch MOL files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMolFiles();
  }, []);

  const getCurrentFiles = () => {
    if (!molFiles) return [];
    const files = currentTab === 'mol1' ? molFiles.mol1 : molFiles.mol2;
    
    // Filter by search
    const filtered = searchQuery
      ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : files;
    
    return filtered;
  };

  const filteredFiles = getCurrentFiles();
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownload = async (file: MolFile) => {
    try {
      // Use API endpoint that sets proper Content-Disposition header
      const downloadUrl = `${BACKEND_URL}/api/v1/mol-files/${file.folder}/${encodeURIComponent(file.filename)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to API download endpoint
      const downloadUrl = `${BACKEND_URL}/api/v1/mol-files/${file.folder}/${encodeURIComponent(file.filename)}`;
      window.location.href = downloadUrl;
    }
  };

  const handleDownloadAll = () => {
    // Download as text file listing all MOL file URLs
    const files = getCurrentFiles();
    const content = files.map(f => `${BACKEND_URL}/${f.url}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mol-files-${currentTab}-urls.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentTab]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileBox className="h-8 w-8 text-blue-600" />
              MOL Files Database
            </h1>
            <p className="text-gray-600 mt-2">
              Download molecular structure files (MOL format) untuk penelitian dan analisis
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total MOL Files</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {molFiles ? molFiles.total_mol1 + molFiles.total_mol2 : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FileBox className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">MOL1 (2D Structure)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {molFiles?.total_mol1 || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileBox className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">MOL2 (3D Structure)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {molFiles?.total_mol2 || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Browse MOL Files</CardTitle>
              <CardDescription>
                File struktur molekul dalam format MOL dapat digunakan dengan software seperti ChemDraw, Avogadro, PyMOL, dll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari nama senyawa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadAll}
                  disabled={!molFiles}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download URL List
                </Button>
              </div>

              {/* Tabs */}
              <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as 'mol1' | 'mol2')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="mol1">
                    MOL1 - 2D Structure ({molFiles?.total_mol1 || 0})
                  </TabsTrigger>
                  <TabsTrigger value="mol2">
                    MOL2 - 3D Structure ({molFiles?.total_mol2 || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mol1" className="mt-0">
                  {renderFileList()}
                </TabsContent>
                <TabsContent value="mol2" className="mt-0">
                  {renderFileList()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tentang Format MOL</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">MOL Format (V2000/V3000)</h4>
                  <p className="text-gray-600 text-sm">
                    Format file standar untuk menyimpan struktur kimia 2D. Berisi informasi atom, ikatan, 
                    dan koordinat 2D molekul. Kompatibel dengan sebagian besar software kimia.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">MOL2 Format (Tripos)</h4>
                  <p className="text-gray-600 text-sm">
                    Format file untuk struktur 3D dengan informasi tambahan seperti tipe atom SYBYL, 
                    muatan parsial, dan substruktur. Cocok untuk molecular docking dan simulasi.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Software yang mendukung:</strong> ChemDraw, Avogadro, PyMOL, UCSF Chimera, 
                  RDKit, Open Babel, MarvinSketch, Jmol, dan banyak lagi.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );

  function renderFileList() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading MOL files...</span>
        </div>
      );
    }

    if (filteredFiles.length === 0) {
      return (
        <div className="text-center py-12">
          <FileBox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery ? `Tidak ada file ditemukan untuk "${searchQuery}"` : 'Tidak ada file MOL'}
          </p>
        </div>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-4">
          Menampilkan {paginatedFiles.length} dari {filteredFiles.length} file
          {searchQuery && ` (filter: "${searchQuery}")`}
        </p>

        <div className="grid gap-2">
          {paginatedFiles.map((file, index) => (
            <div 
              key={`${file.folder}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileBox className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{file.filename}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleDownload(file)}
                className="flex-shrink-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              Halaman {currentPage} dari {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }
}
