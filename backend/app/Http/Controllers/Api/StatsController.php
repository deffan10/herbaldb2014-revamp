<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Visits;

class StatsController extends Controller
{
    /**
     * Get database statistics for homepage
     */
    public function index(): JsonResponse
    {
        // Cache stats for 1 hour to reduce database load

        // Hit counter: increment setiap kali endpoint ini diakses (anggap homepage hit)
        $visits = visits('homepage')->increment()->count();

        $stats = Cache::remember('homepage_stats', 3600, function () use ($visits) {
            return [
                'species' => DB::table('species')->where('status', 'published')->count(),
                'compounds' => DB::table('compounds')->where('status', 'published')->count(),
                'references' => DB::table('references')->count(),
                'contributors' => User::count(), // Count all users as contributors
                'local_names' => DB::table('local_names')->count(),
                'virtues' => DB::table('virtues')->count(),
                'compound_groups' => DB::table('compound_groups')->count(),
                'plant_parts' => DB::table('plant_parts')->count(),
                'homepage_visits' => $visits,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get detailed statistics for admin dashboard
     */
    public function detailed(): JsonResponse
    {
        $stats = [
            'species' => [
                'total' => DB::table('species')->count(),
                'published' => DB::table('species')->where('status', 'published')->count(),
                'pending' => DB::table('species')->where('status', 'pending')->count(),
                'draft' => DB::table('species')->where('status', 'draft')->count(),
                'legacy' => DB::table('species')->where('is_legacy', true)->count(),
            ],
            'compounds' => [
                'total' => DB::table('compounds')->count(),
                'published' => DB::table('compounds')->where('status', 'published')->count(),
                'pending' => DB::table('compounds')->where('status', 'pending')->count(),
                'draft' => DB::table('compounds')->where('status', 'draft')->count(),
                'legacy' => DB::table('compounds')->where('is_legacy', true)->count(),
            ],
            'references' => DB::table('references')->count(),
            'local_names' => DB::table('local_names')->count(),
            'virtues' => DB::table('virtues')->count(),
            'species_aliases' => DB::table('species_aliases')->count(),
            'species_compounds' => DB::table('species_compounds')->count(),
            'compound_groups' => DB::table('compound_groups')->count(),
            'plant_parts' => DB::table('plant_parts')->count(),
            'users' => [
                'total' => DB::table('users')->count(),
                'admins' => DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('roles.name', 'admin')
                    ->count(),
                'verifiers' => DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('roles.name', 'verifier')
                    ->count(),
                'contributors' => DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('roles.name', 'contributor')
                    ->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get list of contributors (public users)
     */
    public function contributors(): JsonResponse
    {
        $contributors = User::select('id', 'name', 'institution', 'avatar_url', 'created_at')
            ->withCount([
                'createdSpecies as species_count',
                'createdCompounds as compounds_count',
                'verifiedSpecies as verified_species_count',
                'verifiedCompounds as verified_compounds_count'
            ])
            ->orderByDesc('species_count')
            ->orderByDesc('compounds_count')
            ->get()
            ->map(function ($user) {
                $totalContributions = ($user->species_count ?? 0) + ($user->compounds_count ?? 0);
                $totalVerified = ($user->verified_species_count ?? 0) + ($user->verified_compounds_count ?? 0);
                
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'institution' => $user->institution,
                    'avatar_url' => $user->avatar_url,
                    'member_since' => $user->created_at?->format('Y'),
                    'species_count' => $user->species_count ?? 0,
                    'compounds_count' => $user->compounds_count ?? 0,
                    'verified_count' => $totalVerified,
                    'total_contributions' => $totalContributions,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $contributors,
            'total' => $contributors->count(),
        ]);
    }
}
