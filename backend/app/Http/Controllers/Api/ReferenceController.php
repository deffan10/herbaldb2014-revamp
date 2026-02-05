<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReferenceController extends Controller
{
    /**
     * Display a listing of references.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Reference::query();
        
        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('source_name', 'like', "%{$search}%")
                  ->orWhere('authors', 'like', "%{$search}%")
                  ->orWhere('url', 'like', "%{$search}%");
            });
        }
        
        $references = $query->orderBy('source_name')->get();

        return response()->json([
            'data' => $references
        ]);
    }

    /**
     * Store a newly created reference.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source_name' => 'required|string|max:500',
            'authors' => 'nullable|string|max:500',
            'year' => 'nullable|integer|min:1800|max:' . (date('Y') + 1),
            'type' => 'nullable|string|in:book,journal,website,other',
            'url' => 'nullable|url|max:500',
        ]);

        $validated['created_by'] = $request->user()->id;
        
        $reference = Reference::create($validated);

        return response()->json([
            'message' => 'Reference created successfully',
            'data' => $reference,
        ], 201);
    }

    /**
     * Display the specified reference.
     */
    public function show(Reference $reference): JsonResponse
    {
        return response()->json([
            'data' => $reference
        ]);
    }

    /**
     * Update the specified reference.
     */
    public function update(Request $request, Reference $reference): JsonResponse
    {
        $validated = $request->validate([
            'source_name' => 'sometimes|string|max:500',
            'authors' => 'nullable|string|max:500',
            'year' => 'nullable|integer|min:1800|max:' . (date('Y') + 1),
            'type' => 'nullable|string|in:book,journal,website,other',
            'url' => 'nullable|url|max:500',
        ]);

        $reference->update($validated);

        return response()->json([
            'message' => 'Reference updated successfully',
            'data' => $reference->fresh(),
        ]);
    }

    /**
     * Remove the specified reference.
     */
    public function destroy(Reference $reference): JsonResponse
    {
        // Check if reference is being used
        $speciesCount = $reference->species()->count();
        $virtuesCount = $reference->virtues()->count();
        
        if ($speciesCount > 0 || $virtuesCount > 0) {
            return response()->json([
                'message' => "Referensi tidak dapat dihapus karena masih digunakan oleh {$speciesCount} spesies dan {$virtuesCount} khasiat.",
            ], 400);
        }

        $reference->delete();

        return response()->json([
            'message' => 'Reference deleted successfully',
        ]);
    }
}
