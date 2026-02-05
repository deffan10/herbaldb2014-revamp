<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DonationMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DonationMethodController extends Controller
{
    /**
     * Get all active donation methods (public)
     */
    public function index()
    {
        $methods = DonationMethod::active()->ordered()->get();
        $showQris = DonationMethod::where('show_qris', true)->exists();
        
        return response()->json([
            'methods' => $methods,
            'show_qris' => $showQris,
        ]);
    }

    /**
     * Get all donation methods for admin
     */
    public function adminIndex()
    {
        $methods = DonationMethod::ordered()->get();
        
        return response()->json([
            'data' => $methods,
        ]);
    }

    /**
     * Store a new donation method
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:bank,ewallet,qris',
            'account_number' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'show_qris' => 'boolean',
            'sort_order' => 'integer',
        ]);

        // Handle QRIS image upload
        if ($request->hasFile('qris_image')) {
            $path = $request->file('qris_image')->store('qris', 'public');
            $validated['qris_image'] = $path;
        }

        $method = DonationMethod::create($validated);

        return response()->json([
            'message' => 'Metode donasi berhasil ditambahkan',
            'data' => $method,
        ], 201);
    }

    /**
     * Update a donation method
     */
    public function update(Request $request, DonationMethod $donationMethod)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:bank,ewallet,qris',
            'account_number' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:100',
            'is_active' => 'boolean',
            'show_qris' => 'boolean',
            'sort_order' => 'integer',
        ]);

        // Handle QRIS image upload
        if ($request->hasFile('qris_image')) {
            // Delete old image if exists
            if ($donationMethod->qris_image) {
                Storage::disk('public')->delete($donationMethod->qris_image);
            }
            $path = $request->file('qris_image')->store('qris', 'public');
            $validated['qris_image'] = $path;
        }

        $donationMethod->update($validated);

        return response()->json([
            'message' => 'Metode donasi berhasil diperbarui',
            'data' => $donationMethod,
        ]);
    }

    /**
     * Delete a donation method
     */
    public function destroy(DonationMethod $donationMethod)
    {
        // Delete QRIS image if exists
        if ($donationMethod->qris_image) {
            Storage::disk('public')->delete($donationMethod->qris_image);
        }

        $donationMethod->delete();

        return response()->json([
            'message' => 'Metode donasi berhasil dihapus',
        ]);
    }

    /**
     * Toggle QRIS visibility
     */
    public function toggleQris(Request $request)
    {
        $validated = $request->validate([
            'show_qris' => 'required|boolean',
        ]);

        // Update all methods to show/hide QRIS
        DonationMethod::query()->update(['show_qris' => $validated['show_qris']]);

        return response()->json([
            'message' => 'Pengaturan QRIS berhasil diperbarui',
            'show_qris' => $validated['show_qris'],
        ]);
    }

    /**
     * Upload QRIS image
     */
    public function uploadQris(Request $request)
    {
        $request->validate([
            'qris_image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $path = $request->file('qris_image')->store('qris', 'public');

        // Get or create QRIS method
        $qrisMethod = DonationMethod::firstOrCreate(
            ['type' => 'qris'],
            [
                'name' => 'QRIS',
                'icon' => 'QrCode',
                'color' => 'bg-gray-50 text-gray-600',
                'is_active' => true,
                'show_qris' => true,
            ]
        );

        // Delete old image
        if ($qrisMethod->qris_image) {
            Storage::disk('public')->delete($qrisMethod->qris_image);
        }

        $qrisMethod->update(['qris_image' => $path]);

        return response()->json([
            'message' => 'QRIS berhasil diupload',
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }
}
