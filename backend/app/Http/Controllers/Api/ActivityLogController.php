<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    /**
     * Get activity logs (for verifiers and admins).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by type (species, compound)
        if ($request->has('type')) {
            $type = match($request->type) {
                'species' => 'App\\Models\\Species',
                'compound' => 'App\\Models\\Compound',
                default => $request->type,
            };
            $query->where('loggable_type', $type);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        // Search in description
        if ($request->has('search') && $request->search) {
            $query->where('description', 'like', "%{$request->search}%");
        }

        $perPage = $request->get('per_page', 20);
        $logs = $query->paginate($perPage);

        // Transform the data to include labels
        $logs->getCollection()->transform(function ($log) {
            $log->action_label = $log->action_label;
            $log->loggable_type_label = $log->loggable_type_label;
            return $log;
        });

        return response()->json($logs);
    }

    /**
     * Get activity logs for a specific model.
     */
    public function forModel(Request $request, string $type, int $id): JsonResponse
    {
        $modelType = match($type) {
            'species' => 'App\\Models\\Species',
            'compound' => 'App\\Models\\Compound',
            default => null,
        };

        if (!$modelType) {
            return response()->json(['message' => 'Invalid type'], 400);
        }

        $logs = ActivityLog::with('user')
            ->where('loggable_type', $modelType)
            ->where('loggable_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        $logs->transform(function ($log) {
            $log->action_label = $log->action_label;
            $log->loggable_type_label = $log->loggable_type_label;
            return $log;
        });

        return response()->json($logs);
    }

    /**
     * Get summary statistics of activity logs.
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = [
            'total_today' => ActivityLog::whereDate('created_at', today())->count(),
            'total_week' => ActivityLog::where('created_at', '>=', now()->subWeek())->count(),
            'by_action' => ActivityLog::where('created_at', '>=', now()->subWeek())
                ->selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->pluck('count', 'action'),
            'by_type' => ActivityLog::where('created_at', '>=', now()->subWeek())
                ->selectRaw("CASE 
                    WHEN loggable_type = 'App\\\\Models\\\\Species' THEN 'species'
                    WHEN loggable_type = 'App\\\\Models\\\\Compound' THEN 'compound'
                    ELSE 'other' END as type, COUNT(*) as count")
                ->groupBy('type')
                ->pluck('count', 'type'),
        ];

        return response()->json($stats);
    }
}
