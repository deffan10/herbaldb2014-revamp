'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  History, 
  Loader2, 
  Search, 
  Filter,
  Calendar,
  User,
  Leaf,
  FlaskConical,
  FileEdit,
  Plus,
  Check,
  X,
  Camera,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ExternalLink,
  MapPin,
  Heart,
  Atom,
  Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api/client';

interface ActivityLog {
  id: number;
  loggable_type: string;
  loggable_id: number;
  action: string;
  action_label: string;
  loggable_type_label: string;
  changes: Record<string, any> | null;
  description: string;
  user_id: number | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string;
}

interface Stats {
  total_today: number;
  total_week: number;
  by_action: Record<string, number>;
  by_type: Record<string, number>;
}

export default function ChangelogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    // Check if user is verifier or admin
    if (isAuthenticated && user) {
      const isVerifierOrAdmin = user.roles?.some(r => ['verifier', 'admin'].includes(r.name));
      if (!isVerifierOrAdmin) {
        toast({
          title: 'Akses Ditolak',
          description: 'Halaman ini hanya untuk Verifier dan Admin.',
          variant: 'destructive',
        });
        router.push('/dashboard');
        return;
      }
      fetchLogs();
      fetchStats();
    }
  }, [isAuthenticated, user, page, typeFilter, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, per_page: 20 };
      if (typeFilter !== 'all') params.type = typeFilter;
      if (actionFilter !== 'all') params.action = actionFilter;
      if (search) params.search = search;

      const response = await api.get('/activity-logs', { params });
      setLogs(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Gagal memuat data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/activity-logs/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'updated':
        return <FileEdit className="h-4 w-4 text-blue-500" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'approved':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'submitted':
        return <FileEdit className="h-4 w-4 text-orange-500" />;
      case 'photo_uploaded':
        return <Camera className="h-4 w-4 text-purple-500" />;
      case 'local_name_added':
        return <MapPin className="h-4 w-4 text-teal-500" />;
      case 'local_name_deleted':
        return <MapPin className="h-4 w-4 text-red-500" />;
      case 'virtue_added':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'virtue_deleted':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'molecular_info_contributed':
        return <Atom className="h-4 w-4 text-blue-500" />;
      case 'species_link_contributed':
        return <Link2 className="h-4 w-4 text-green-500" />;
      case 'species_link_removed':
        return <Link2 className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-orange-100 text-orange-800';
      case 'photo_uploaded':
        return 'bg-purple-100 text-purple-800';
      case 'local_name_added':
        return 'bg-teal-100 text-teal-800';
      case 'local_name_deleted':
        return 'bg-red-100 text-red-800';
      case 'virtue_added':
        return 'bg-pink-100 text-pink-800';
      case 'virtue_deleted':
        return 'bg-red-100 text-red-800';
      case 'molecular_info_contributed':
        return 'bg-blue-100 text-blue-800';
      case 'species_link_contributed':
        return 'bg-green-100 text-green-800';
      case 'species_link_removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Species')) {
      return <Leaf className="h-4 w-4 text-green-600" />;
    }
    if (type.includes('Compound')) {
      return <FlaskConical className="h-4 w-4 text-blue-600" />;
    }
    return null;
  };

  // Get link to view item detail (public page)
  const getItemLink = (log: ActivityLog): string => {
    if (log.loggable_type.includes('Species')) {
      return `/species/${log.loggable_id}`;
    }
    if (log.loggable_type.includes('Compound')) {
      return `/compounds/${log.loggable_id}`;
    }
    return '#';
  };

  // Get link to edit item (dashboard page)
  const getEditLink = (log: ActivityLog): string => {
    if (log.loggable_type.includes('Species')) {
      return `/dashboard/species/${log.loggable_id}/edit`;
    }
    if (log.loggable_type.includes('Compound')) {
      return `/dashboard/compounds/${log.loggable_id}/edit`;
    }
    return '#';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="h-6 w-6 text-green-600" />
          Changelog
        </h1>
        <p className="text-gray-600">Riwayat perubahan pada spesies dan senyawa</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_today}</p>
                  <p className="text-sm text-gray-500">Perubahan Hari Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total_week}</p>
                  <p className="text-sm text-gray-500">Minggu Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.by_type.species || 0}</p>
                  <p className="text-sm text-gray-500">Spesies (7 hari)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FlaskConical className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.by_type.compound || 0}</p>
                  <p className="text-sm text-gray-500">Senyawa (7 hari)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari di deskripsi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="species">Spesies</SelectItem>
                <SelectItem value="compound">Senyawa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                <SelectItem value="created">Dibuat</SelectItem>
                <SelectItem value="updated">Diperbarui</SelectItem>
                <SelectItem value="submitted">Diajukan</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="photo_uploaded">Foto Upload</SelectItem>
                <SelectItem value="local_name_added">Nama Lokal Ditambah</SelectItem>
                <SelectItem value="local_name_deleted">Nama Lokal Dihapus</SelectItem>
                <SelectItem value="virtue_added">Manfaat Ditambah</SelectItem>
                <SelectItem value="virtue_deleted">Manfaat Dihapus</SelectItem>
                <SelectItem value="molecular_info_contributed">Info Molekuler Ditambah</SelectItem>
                <SelectItem value="species_link_contributed">Link Spesies Ditambah</SelectItem>
                <SelectItem value="species_link_removed">Link Spesies Dihapus</SelectItem>
                <SelectItem value="deleted">Dihapus</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
          <CardDescription>
            Semua perubahan tercatat di sini
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada aktivitas yang tercatat.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeIcon(log.loggable_type)}
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action_label}
                      </Badge>
                      <Link 
                        href={getItemLink(log)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        #{log.loggable_id}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-gray-700 mt-1">{log.description}</p>
                    
                    {/* Quick action links for verifiers */}
                    <div className="flex items-center gap-2 mt-2">
                      <Link 
                        href={getItemLink(log)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Lihat Detail
                      </Link>
                      {log.action !== 'deleted' && (
                        <Link 
                          href={getEditLink(log)}
                          className="text-xs text-green-600 hover:underline flex items-center gap-1"
                        >
                          <FileEdit className="h-3 w-3" />
                          Edit
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {log.user && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {log.changes && (log.action === 'updated' || log.action === 'status_changed') && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                          Lihat detail perubahan
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
