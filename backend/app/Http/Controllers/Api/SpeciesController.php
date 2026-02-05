<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Species;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\PersonalAccessToken;

class SpeciesController extends Controller
{
    /**
     * Display a listing of species.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Species::query();
        
        // Get user from Bearer token (works on public routes without middleware)
        $user = null;
        if ($token = $request->bearerToken()) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $user = $accessToken->tokenable;
            }
        }

        // Filter by creator (for my submissions) - must be applied first
        $filterByCreator = false;
        if ($request->has('created_by') && $user && is_numeric($request->created_by)) {
            $createdById = (int) $request->created_by;
            $currentUserId = (int) $user->id;
            // Only allow users to filter by their own ID unless they are admin/verifier
            if ($createdById === $currentUserId || $user->isVerifier()) {
                $query->where('created_by', $createdById);
                // Exclude legacy/sample data from user contributions
                $query->where('is_legacy', false);
                $filterByCreator = true;
            }
        }

        // Filter by status
        // If filtering by own submissions, allow all statuses
        if ($filterByCreator && (int) $request->created_by === (int) $user->id) {
            // User viewing own submissions - allow all statuses or filter if specified
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        } elseif (!$user || !$user->isVerifier()) {
            // Non-verifiers can only see published
            $query->where('status', 'published');
        } elseif ($request->has('status')) {
            // Verifiers/admins can filter by status
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('scientific_name', 'like', "%{$search}%")
                  ->orWhere('family', 'like', "%{$search}%")
                  ->orWhereHas('localNames', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('virtues', function ($q) use ($search) {
                      $q->where('description', 'like', "%{$search}%")
                        ->orWhere('description_en', 'like', "%{$search}%");
                  });
            });
        }

        // Specific virtue/use search
        if ($request->has('virtue') && $request->virtue) {
            $virtue = $request->virtue;
            $query->whereHas('virtues', function ($q) use ($virtue) {
                $q->where('description', 'like', "%{$virtue}%")
                  ->orWhere('description_en', 'like', "%{$virtue}%");
            });
        }

        // Filter by family
        if ($request->has('family')) {
            $query->where('family', $request->family);
        }

        // Eager load relationships
        $query->with(['localNames', 'reference', 'creator', 'virtues']);
        
        // Add compounds count
        $query->withCount('compounds');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $species = $query->orderBy('scientific_name')->paginate($perPage);

        return response()->json($species);
    }

    /**
     * Store a newly created species.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'species_code' => 'required|string|max:20|unique:species',
            'scientific_name' => 'required|string|max:200',
            'variety' => 'nullable|string|max:100',
            'family' => 'nullable|string|max:100',
            'discoverer' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'description_en' => 'nullable|string',
            'reference_id' => 'nullable|exists:references,id',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'draft';

        $species = Species::create($validated);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'created',
            $validated,
            "Spesies baru '{$species->scientific_name}' ditambahkan"
        );

        return response()->json([
            'message' => 'Species created successfully',
            'data' => $species->load(['reference', 'creator'])
        ], 201);
    }

    /**
     * Display the specified species.
     */
    public function show(Species $species): JsonResponse
    {
        // Load all relationships
        $species->load([
            'localNames',
            'aliases.reference',
            'virtues.plantPart',
            'virtues.reference',
            'compounds.group',
            'reference',
            'creator',
            'verifier'
        ]);

        return response()->json($species);
    }

    /**
     * Update the specified species.
     */
    public function update(Request $request, Species $species): JsonResponse
    {
        $validated = $request->validate([
            'scientific_name' => 'sometimes|string|max:200',
            'variety' => 'nullable|string|max:100',
            'family' => 'nullable|string|max:100',
            'discoverer' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'description_en' => 'nullable|string',
            'reference_id' => 'nullable|exists:references,id',
            'status' => 'sometimes|in:draft,pending,published,rejected',
        ]);

        $oldValues = $species->only(array_keys($validated));
        $species->update($validated);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'updated',
            ['old' => $oldValues, 'new' => $validated],
            "Spesies '{$species->scientific_name}' diperbarui"
        );

        return response()->json([
            'message' => 'Species updated successfully',
            'data' => $species->fresh(['reference', 'creator'])
        ]);
    }

    /**
     * Remove the specified species.
     */
    public function destroy(Species $species): JsonResponse
    {
        $species->delete();

        return response()->json([
            'message' => 'Species deleted successfully'
        ]);
    }

    /**
     * Submit species for review.
     */
    public function submit(Species $species): JsonResponse
    {
        if ($species->status !== 'draft') {
            return response()->json([
                'message' => 'Only draft species can be submitted'
            ], 422);
        }

        $species->update(['status' => 'pending']);

        return response()->json([
            'message' => 'Species submitted for review',
            'data' => $species
        ]);
    }

    /**
     * Verify/Publish species (verifier only).
     */
    public function verify(Request $request, Species $species): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string',
        ]);

        if ($species->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending species can be verified'
            ], 422);
        }

        $species->update([
            'status' => $validated['action'] === 'approve' ? 'published' : 'rejected',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Species ' . ($validated['action'] === 'approve' ? 'approved' : 'rejected'),
            'data' => $species->load('verifier')
        ]);
    }

    /**
     * Update species status (verifier/admin only).
     */
    public function updateStatus(Request $request, Species $species): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,published,rejected',
        ]);

        $oldStatus = $species->status;
        $newStatus = $validated['status'];

        $species->update([
            'status' => $newStatus,
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'status_changed',
            [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $request->user()->id,
            ],
            "Status spesies '{$species->scientific_name}' diubah dari '{$oldStatus}' menjadi '{$newStatus}'"
        );

        return response()->json([
            'message' => "Status berhasil diubah menjadi {$newStatus}",
            'data' => $species->fresh()
        ]);
    }

    /**
     * Get list of families for filter.
     */
    public function families(): JsonResponse
    {
        $families = Species::whereNotNull('family')
            ->where('status', 'published')
            ->distinct()
            ->orderBy('family')
            ->pluck('family');

        return response()->json($families);
    }

    /**
     * Upload species photo.
     */
    public function uploadPhoto(Request $request, Species $species): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $file = $request->file('photo');
        $filename = 'species_' . $species->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        
        // Store in public storage
        $path = $file->storeAs('species', $filename, 'public');

        $species->update([
            'photo' => 'storage/' . $path,
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'photo_uploaded',
            ['photo' => 'storage/' . $path],
            "Foto untuk spesies '{$species->scientific_name}' diunggah"
        );

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'photo' => 'storage/' . $path,
        ]);
    }

    /**
     * Delete species photo.
     */
    public function deletePhoto(Species $species): JsonResponse
    {
        if (!$species->photo) {
            return response()->json([
                'message' => 'No photo to delete',
            ]);
        }

        // Delete file from storage
        $photoPath = str_replace('storage/', '', $species->photo);
        \Illuminate\Support\Facades\Storage::disk('public')->delete($photoPath);

        // Update species
        $species->update([
            'photo' => null,
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'photo_deleted',
            [],
            "Foto untuk spesies '{$species->scientific_name}' dihapus"
        );

        return response()->json([
            'message' => 'Photo deleted successfully',
        ]);
    }

    /**
     * Add a local name to species.
     */
    public function addLocalName(Request $request, Species $species): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'region' => 'nullable|string|max:100',
            'language' => 'nullable|string|max:50',
        ]);

        $localName = $species->localNames()->create([
            'name' => $validated['name'],
            'region' => $validated['region'] ?? null,
            'language' => $validated['language'] ?? null,
            'status' => 'pending', // Needs verification
            'created_by' => $request->user()->id,
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'local_name_added',
            [
                'local_name_id' => $localName->id,
                'name' => $localName->name,
                'region' => $localName->region,
            ],
            "Nama lokal '{$localName->name}' ditambahkan ke spesies '{$species->scientific_name}'"
        );

        return response()->json([
            'message' => 'Local name added successfully',
            'data' => $localName,
        ], 201);
    }

    /**
     * Delete a local name from species.
     */
    public function deleteLocalName(Request $request, Species $species, int $localNameId): JsonResponse
    {
        $localName = $species->localNames()->findOrFail($localNameId);
        
        // Log before deletion
        \App\Models\ActivityLog::log(
            $species,
            'local_name_deleted',
            [
                'local_name_id' => $localName->id,
                'name' => $localName->name,
                'region' => $localName->region,
            ],
            "Nama lokal '{$localName->name}' dihapus dari spesies '{$species->scientific_name}'"
        );

        $localName->delete();

        return response()->json([
            'message' => 'Local name deleted successfully',
        ]);
    }

    /**
     * Add a virtue/use to species.
     */
    public function addVirtue(Request $request, Species $species): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'required|string|max:500',
            'plant_part_id' => 'nullable|integer|exists:plant_parts,id',
            'virtue_type' => 'nullable|in:traditional,scientific,clinical',
            'description_en' => 'nullable|string|max:500',
        ]);

        $virtue = $species->virtues()->create([
            'description' => $validated['description'],
            'plant_part_id' => $validated['plant_part_id'] ?? null,
            'virtue_type' => $validated['virtue_type'] ?? 'traditional',
            'description_en' => $validated['description_en'] ?? null,
            'status' => 'pending', // Needs verification
            'created_by' => $request->user()->id,
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $species,
            'virtue_added',
            [
                'virtue_id' => $virtue->id,
                'description' => $virtue->description,
                'virtue_type' => $virtue->virtue_type,
            ],
            "Manfaat '{$virtue->description}' ditambahkan ke spesies '{$species->scientific_name}'"
        );

        return response()->json([
            'message' => 'Virtue added successfully',
            'data' => $virtue,
        ], 201);
    }

    /**
     * Delete a virtue from species.
     */
    public function deleteVirtue(Request $request, Species $species, int $virtueId): JsonResponse
    {
        $virtue = $species->virtues()->findOrFail($virtueId);
        
        // Log before deletion
        \App\Models\ActivityLog::log(
            $species,
            'virtue_deleted',
            [
                'virtue_id' => $virtue->id,
                'description' => $virtue->description,
                'virtue_type' => $virtue->virtue_type,
            ],
            "Manfaat '{$virtue->description}' dihapus dari spesies '{$species->scientific_name}'"
        );

        $virtue->delete();

        return response()->json([
            'message' => 'Virtue deleted successfully',
        ]);
    }
}
