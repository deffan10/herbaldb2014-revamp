'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Flower2,
  FlaskConical,
  Users,
  FileCheck,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth';
import { speciesApi } from '@/lib/api/species';
import { compoundsApi } from '@/lib/api/compounds';
import api from '@/lib/api/client';

interface ActivityLog {
  id: number;
  action: string;
  action_label: string;
  loggable_type_label: string;
  description: string;
  created_at: string;
  user: { name: string } | null;
}

export default function DashboardPage() {
  const { user, isAdmin, isVerifier, isContributor } = useAuthStore();

  const { data: speciesData } = useQuery({
    queryKey: ['species-stats'],
    queryFn: () => speciesApi.getAll({ per_page: 1 }),
  });

  const { data: compoundsData } = useQuery({
    queryKey: ['compounds-stats'],
    queryFn: () => compoundsApi.getAll({ per_page: 1 }),
  });

  // Fetch pending counts for admin/verifier
  const { data: pendingSpecies } = useQuery({
    queryKey: ['pending-species-count'],
    queryFn: async () => {
      const { data } = await api.get('/species', { params: { status: 'pending', per_page: 1 } });
      return data;
    },
    enabled: isAdmin() || isVerifier(),
  });

  const { data: pendingCompounds } = useQuery({
    queryKey: ['pending-compounds-count'],
    queryFn: async () => {
      const { data } = await api.get('/compounds', { params: { status: 'pending', per_page: 1 } });
      return data;
    },
    enabled: isAdmin() || isVerifier(),
  });

  // Fetch total users for admin
  const { data: usersData } = useQuery({
    queryKey: ['users-count'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: { per_page: 1 } });
      return data;
    },
    enabled: isAdmin(),
  });

  // Fetch recent activity logs
  const { data: activityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await api.get('/activity-logs', { params: { per_page: 5 } });
      return data;
    },
    enabled: isAdmin() || isVerifier(),
  });

  const pendingReviewsCount = (pendingSpecies?.total || 0) + (pendingCompounds?.total || 0);

  const stats = [
    {
      title: 'Total Species',
      value: speciesData?.total || speciesData?.meta?.total || 0,
      icon: Flower2,
      color: 'bg-green-100 text-green-600',
      href: '/dashboard/species',
    },
    {
      title: 'Total Compounds',
      value: compoundsData?.total || compoundsData?.meta?.total || 0,
      icon: FlaskConical,
      color: 'bg-blue-100 text-blue-600',
      href: '/dashboard/compounds',
    },
    ...(isAdmin() || isVerifier()
      ? [
          {
            title: 'Pending Reviews',
            value: pendingReviewsCount,
            icon: FileCheck,
            color: 'bg-orange-100 text-orange-600',
            href: '/dashboard/reviews',
          },
        ]
      : []),
    ...(isAdmin()
      ? [
          {
            title: 'Total Users',
            value: usersData?.total || 0,
            icon: Users,
            color: 'bg-purple-100 text-purple-600',
            href: '/dashboard/users',
          },
        ]
      : []),
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const recentActivities: ActivityLog[] = activityLogs?.data || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with HerbalDB today.
          </p>
        </div>
        {(isAdmin() || isContributor()) && (
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/species/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Species
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/compounds/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Compound
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Update terbaru dalam database</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action_label}</p>
                      <p className="text-sm text-gray-500">{activity.loggable_type_label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 hover:bg-gray-100"
                      >
                        {activity.user?.name || 'System'}
                      </Badge>
                      <span className="text-xs text-gray-400">{formatTimeAgo(activity.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {isAdmin() || isVerifier() ? 'Belum ada aktivitas terbaru' : 'Aktivitas hanya untuk Admin/Verifier'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Role-specific content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isAdmin() && (
                <>
                  <Link
                    href="/dashboard/users"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Manage Users</p>
                        <p className="text-sm text-gray-500">View and manage user accounts</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </Link>
                  <Link
                    href="/dashboard/reviews"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <FileCheck className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Review Submissions</p>
                        <p className="text-sm text-gray-500">Approve or reject pending entries</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </>
              )}

              {isVerifier() && !isAdmin() && (
                <Link
                  href="/dashboard/reviews"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <FileCheck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Review Submissions</p>
                      <p className="text-sm text-gray-500">Verify contributor submissions</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              )}

              {isContributor() && (
                <Link
                  href="/dashboard/submissions"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">My Submissions</p>
                      <p className="text-sm text-gray-500">Track your contribution status</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              )}

              <Link
                href="/dashboard/species"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Flower2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Browse Species</p>
                    <p className="text-sm text-gray-500">View all plant species</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                href="/dashboard/compounds"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Browse Compounds</p>
                    <p className="text-sm text-gray-500">Explore bioactive compounds</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}