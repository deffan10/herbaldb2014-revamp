<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compound;
use App\Models\CompoundGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\PersonalAccessToken;

class CompoundController extends Controller
{
    /**
     * Display a listing of compounds.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Compound::query();
        
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

        // Search - only search columns that exist in the database
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('knapsack_id', 'like', "%{$search}%")
                  ->orWhere('pubchem_id', 'like', "%{$search}%");
            });
        }

        // Filter by group
        if ($request->has('group_id')) {
            $query->where('compound_group_id', $request->group_id);
        }

        // Filter by species
        if ($request->has('species_id')) {
            $query->whereHas('species', function ($q) use ($request) {
                $q->where('species.id', $request->species_id);
            });
        }

        // Eager load
        $query->with(['group']);
        
        // Add species count
        $query->withCount('species');

        // Pagination
        $perPage = $request->get('per_page', 15);
        $compounds = $query->orderBy('name')->paginate($perPage);

        return response()->json($compounds);
    }

    /**
     * Store a newly created compound.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'knapsack_id' => 'nullable|string|max:50',
            'metabolite_id' => 'nullable|string|max:50',
            'pubchem_id' => 'nullable|string|max:50',
            'compound_group_id' => 'nullable|exists:compound_groups,id',
            'cas_number' => 'nullable|string|max:50',
            'molecular_formula' => 'nullable|string|max:100',
            'molecular_weight' => 'nullable|numeric',
            'smiles' => 'nullable|string',
            'inchi' => 'nullable|string',
            'inchi_key' => 'nullable|string|max:50',
            'mol_file_path' => 'nullable|string|max:255',
            'mol2_file_path' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = 'draft';

        $compound = Compound::create($validated);

        // Log the activity
        \App\Models\ActivityLog::log(
            $compound,
            'created',
            $validated,
            "Senyawa baru '{$compound->name}' ditambahkan"
        );

        return response()->json([
            'message' => 'Compound created successfully',
            'data' => $compound->load('group')
        ], 201);
    }

    /**
     * Display the specified compound.
     */
    public function show(Compound $compound): JsonResponse
    {
        $compound->load(['group', 'species', 'creator', 'verifier']);

        return response()->json($compound);
    }

    /**
     * Update the specified compound.
     */
    public function update(Request $request, Compound $compound): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:200',
            'knapsack_id' => 'nullable|string|max:50',
            'metabolite_id' => 'nullable|string|max:50',
            'pubchem_id' => 'nullable|string|max:50',
            'compound_group_id' => 'nullable|exists:compound_groups,id',
            'cas_number' => 'nullable|string|max:50',
            'molecular_formula' => 'nullable|string|max:100',
            'molecular_weight' => 'nullable|numeric',
            'smiles' => 'nullable|string',
            'inchi' => 'nullable|string',
            'inchi_key' => 'nullable|string|max:50',
            'mol_file_path' => 'nullable|string|max:255',
            'mol2_file_path' => 'nullable|string|max:255',
            'status' => 'sometimes|in:draft,pending,published,rejected',
        ]);

        $oldValues = $compound->only(array_keys($validated));
        $compound->update($validated);

        // Log the activity
        \App\Models\ActivityLog::log(
            $compound,
            'updated',
            ['old' => $oldValues, 'new' => $validated],
            "Senyawa '{$compound->name}' diperbarui"
        );

        return response()->json([
            'message' => 'Compound updated successfully',
            'data' => $compound->fresh('group')
        ]);
    }

    /**
     * Remove the specified compound.
     */
    public function destroy(Compound $compound): JsonResponse
    {
        $compound->delete();

        return response()->json([
            'message' => 'Compound deleted successfully'
        ]);
    }

    /**
     * Get compound groups for filter.
     */
    public function groups(): JsonResponse
    {
        $groups = CompoundGroup::orderBy('name')->get();
        return response()->json($groups);
    }

    /**
     * Attach compound to species.
     */
    public function attachToSpecies(Request $request, Compound $compound): JsonResponse
    {
        $validated = $request->validate([
            'species_id' => 'required|exists:species,id',
            'concentration' => 'nullable|string|max:50',
            'plant_part_id' => 'nullable|exists:plant_parts,id',
        ]);

        $compound->species()->attach($validated['species_id'], [
            'concentration' => $validated['concentration'] ?? null,
            'plant_part_id' => $validated['plant_part_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Compound attached to species successfully'
        ]);
    }

    /**
     * Detach compound from species.
     */
    public function detachFromSpecies(Request $request, Compound $compound): JsonResponse
    {
        $validated = $request->validate([
            'species_id' => 'required|exists:species,id',
        ]);

        $compound->species()->detach($validated['species_id']);

        return response()->json([
            'message' => 'Compound detached from species successfully'
        ]);
    }

    /**
     * Submit compound for review.
     */
    public function submit(Compound $compound): JsonResponse
    {
        if ($compound->status !== 'draft' && $compound->status !== 'rejected') {
            return response()->json([
                'message' => 'Only draft or rejected compounds can be submitted'
            ], 400);
        }

        $compound->update(['status' => 'pending']);

        return response()->json([
            'message' => 'Compound submitted for review',
            'data' => $compound->fresh('group')
        ]);
    }

    /**
     * Verify/Publish compound (verifier only).
     */
    public function verify(Request $request, Compound $compound): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($compound->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending compounds can be verified'
            ], 400);
        }

        if ($validated['action'] === 'approve') {
            $compound->update([
                'status' => 'published',
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
            ]);

            return response()->json([
                'message' => 'Compound approved and published',
                'data' => $compound->fresh('group')
            ]);
        } else {
            $compound->update([
                'status' => 'rejected',
                'rejection_notes' => $validated['notes'] ?? null,
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
            ]);

            return response()->json([
                'message' => 'Compound rejected',
                'data' => $compound->fresh('group')
            ]);
        }
    }

    /**
     * Update compound status (verifier/admin only).
     */
    public function updateStatus(Request $request, Compound $compound): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,published,rejected',
        ]);

        $oldStatus = $compound->status;
        $newStatus = $validated['status'];

        $compound->update([
            'status' => $newStatus,
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $compound,
            'status_changed',
            [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'changed_by' => $request->user()->id,
            ],
            "Status senyawa '{$compound->name}' diubah dari '{$oldStatus}' menjadi '{$newStatus}'"
        );

        return response()->json([
            'message' => "Status berhasil diubah menjadi {$newStatus}",
            'data' => $compound->fresh('group')
        ]);
    }

    /**
     * Contribute molecular information (authenticated users).
                'data' => $compound->fresh('group')
            ]);
        }
    }

    /**
     * Contribute molecular information (authenticated users).
     */
    public function contributeMolecularInfo(Request $request, Compound $compound): JsonResponse
    {
        try {
            $validated = $request->validate([
                'molecular_formula' => 'nullable|string|max:100',
                'molecular_weight' => 'nullable|numeric',
                'smiles' => 'nullable|string|max:2000',
                'inchi' => 'nullable|string|max:2000',
                'inchi_key' => 'nullable|string|max:50',
                'cas_number' => 'nullable|string|max:50',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        // Filter out null/empty values
        $changes = array_filter($validated, fn($v) => $v !== null && $v !== '');
        
        if (empty($changes)) {
            return response()->json([
                'message' => 'Mohon isi setidaknya satu field untuk diperbarui.',
            ], 400);
        }

        try {
            // Log the activity
            \App\Models\ActivityLog::log(
                $compound,
                'molecular_info_contributed',
                [
                    'contributed_by' => $request->user()->id,
                    'changes' => $changes,
                ],
                "Informasi molekuler ditambahkan untuk senyawa '{$compound->name}'"
            );

            // Apply changes (for now, direct update - could be pending review later)
            $compound->update($changes);

            return response()->json([
                'message' => 'Informasi molekuler berhasil ditambahkan',
                'data' => $compound->fresh('group'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Error updating molecular info', [
                'compound_id' => $compound->id,
                'error' => $e->getMessage(),
                'changes' => $changes,
            ]);
            
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Contribute species link (authenticated users).
     */
    public function contributeSpeciesLink(Request $request, Compound $compound): JsonResponse
    {
        $validated = $request->validate([
            'species_id' => 'required|exists:species,id',
            'concentration' => 'nullable|string|max:50',
            'plant_part_id' => 'nullable|exists:plant_parts,id',
        ]);

        // Check if already linked
        if ($compound->species()->where('species.id', $validated['species_id'])->exists()) {
            return response()->json([
                'message' => 'Species is already linked to this compound',
            ], 400);
        }

        // Get species for logging
        $species = \App\Models\Species::find($validated['species_id']);

        // Attach with pivot data
        $compound->species()->attach($validated['species_id'], [
            'concentration' => $validated['concentration'] ?? null,
            'plant_part_id' => $validated['plant_part_id'] ?? null,
            'created_by' => $request->user()->id,
            'status' => 'pending', // Needs verification
        ]);

        // Log the activity
        \App\Models\ActivityLog::log(
            $compound,
            'species_link_contributed',
            [
                'species_id' => $validated['species_id'],
                'species_name' => $species->scientific_name,
                'contributed_by' => $request->user()->id,
            ],
            "Spesies '{$species->scientific_name}' ditambahkan ke senyawa '{$compound->name}'"
        );

        return response()->json([
            'message' => 'Species link contributed successfully',
            'data' => $compound->fresh(['group', 'species']),
        ], 201);
    }

    /**
     * Remove species link (verifier only).
     */
    public function removeSpeciesLink(Request $request, Compound $compound, int $speciesId): JsonResponse
    {
        $species = \App\Models\Species::findOrFail($speciesId);
        
        // Log before deletion
        \App\Models\ActivityLog::log(
            $compound,
            'species_link_removed',
            [
                'species_id' => $speciesId,
                'species_name' => $species->scientific_name,
            ],
            "Spesies '{$species->scientific_name}' dihapus dari senyawa '{$compound->name}'"
        );

        $compound->species()->detach($speciesId);

        return response()->json([
            'message' => 'Species link removed successfully',
        ]);
    }
}
