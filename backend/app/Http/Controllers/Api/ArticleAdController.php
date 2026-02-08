<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArticleAd;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArticleAdController extends Controller
{
    public function publicIndex(Request $request): JsonResponse
    {
        $limit = (int) $request->query('limit', 2);
        $ads = ArticleAd::active()->ordered()->limit($limit)->get();

        return response()->json([
            'data' => $ads,
        ]);
    }

    public function index(): JsonResponse
    {
        $ads = ArticleAd::ordered()->get();

        return response()->json([
            'data' => $ads,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'target_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $path = $request->file('image')->store('article-ads', 'public');

        $ad = ArticleAd::create([
            'title' => $validated['title'] ?? null,
            'target_url' => $validated['target_url'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sort_order' => $validated['sort_order'] ?? 0,
            'image_path' => $path,
        ]);

        return response()->json([
            'message' => 'Iklan berhasil dibuat',
            'data' => $ad,
        ], 201);
    }

    public function update(Request $request, ArticleAd $articleAd): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'target_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'image' => 'sometimes|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('image')) {
            if ($articleAd->image_path) {
                Storage::disk('public')->delete($articleAd->image_path);
            }
            $articleAd->image_path = $request->file('image')->store('article-ads', 'public');
        }

        $articleAd->fill([
            'title' => $validated['title'] ?? $articleAd->title,
            'target_url' => $validated['target_url'] ?? $articleAd->target_url,
            'is_active' => $validated['is_active'] ?? $articleAd->is_active,
            'sort_order' => $validated['sort_order'] ?? $articleAd->sort_order,
        ]);

        $articleAd->save();

        return response()->json([
            'message' => 'Iklan berhasil diperbarui',
            'data' => $articleAd->fresh(),
        ]);
    }

    public function destroy(ArticleAd $articleAd): JsonResponse
    {
        if ($articleAd->image_path) {
            Storage::disk('public')->delete($articleAd->image_path);
        }

        $articleAd->delete();

        return response()->json([
            'message' => 'Iklan berhasil dihapus',
        ]);
    }
}
