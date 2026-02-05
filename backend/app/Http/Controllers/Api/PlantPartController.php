<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantPart;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PlantPartController extends Controller
{
    /**
     * Display a listing of plant parts.
     */
    public function index(): JsonResponse
    {
        $plantParts = PlantPart::orderBy('name')->get();
        
        return response()->json([
            'data' => $plantParts
        ]);
    }
}
