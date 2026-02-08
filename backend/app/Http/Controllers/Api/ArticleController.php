<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::query()->orderByDesc('published_at')->orderByDesc('created_at');

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($limit = $request->query('limit')) {
            $articles = $query->limit((int) $limit)->get();
            return response()->json(['data' => $articles]);
        }

        $perPage = (int) $request->query('per_page', 10);
        $articles = $query->paginate($perPage);

        return response()->json($articles);
    }

    public function show(Article $article): JsonResponse
    {
        return response()->json(['data' => $article]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body_html' => 'required|string',
            'featured_image_path' => 'required|string',
            'published_at' => 'nullable|date',
        ]);

        $validated['slug'] = $this->generateSlug($validated['title']);
        $validated['created_by'] = $request->user()->id;
        $article = Article::create($validated);

        return response()->json([
            'message' => 'Artikel berhasil dibuat',
            'data' => $article,
        ], 201);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'body_html' => 'sometimes|string',
            'featured_image_path' => 'sometimes|string',
            'published_at' => 'nullable|date',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $article->title) {
            $validated['slug'] = $this->generateSlug($validated['title'], $article->id);
        }

        $article->update($validated);

        return response()->json([
            'message' => 'Artikel berhasil diperbarui',
            'data' => $article->fresh(),
        ]);
    }

    public function destroy(Article $article): JsonResponse
    {
        if ($article->featured_image_path) {
            Storage::disk('public')->delete($article->featured_image_path);
        }

        $article->delete();

        return response()->json([
            'message' => 'Artikel berhasil dihapus',
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $path = $request->file('image')->store('articles', 'public');

        return response()->json([
            'message' => 'Gambar berhasil diupload',
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    private function generateSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $counter = 1;

        while (Article::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
