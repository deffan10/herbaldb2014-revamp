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
        $references = Reference::orderBy('source_name')->get();

        return response()->json($references);
    }

    /**
     * Display the specified reference.
     */
    public function show(Reference $reference): JsonResponse
    {
        return response()->json($reference);
    }
}
