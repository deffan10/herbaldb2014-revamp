<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SpeciesController;
use App\Http\Controllers\Api\CompoundController;
use App\Http\Controllers\Api\ReferenceController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\MolFileController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\DonationMethodController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PlantPartController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('v1')->group(function () {
    
    // Auth routes (public)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Stats (public)
    Route::get('/stats', [StatsController::class, 'index']);

    // Public species routes
    Route::get('/species', [SpeciesController::class, 'index']);
    Route::get('/species/families', [SpeciesController::class, 'families']);
    Route::get('/species/{species}', [SpeciesController::class, 'show']);

    // Public compound routes
    Route::get('/compounds', [CompoundController::class, 'index']);
    Route::get('/compounds/groups', [CompoundController::class, 'groups']);
    Route::get('/compounds/{compound}', [CompoundController::class, 'show']);

    // Public reference routes
    Route::get('/references', [ReferenceController::class, 'index']);
    Route::get('/references/{reference}', [ReferenceController::class, 'show']);

    // Public plant parts route
    Route::get('/plant-parts', [PlantPartController::class, 'index']);

    // Public contributors route
    Route::get('/contributors', [StatsController::class, 'contributors']);

    // MOL Files (public)
    Route::get('/mol-files', [MolFileController::class, 'index']);
    Route::get('/mol-files/{folder}/{filename}', [MolFileController::class, 'download']);

    // Donation methods (public - get only)
    Route::get('/donation-methods', [DonationMethodController::class, 'index']);

    // University search proxy (to avoid mixed content issues)
    Route::get('/universities/search', function (\Illuminate\Http\Request $request) {
        $name = $request->query('name', '');
        if (strlen($name) < 2) {
            return response()->json([]);
        }
        
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->get('http://universities.hipolabs.com/search', [
                    'name' => $name
                ]);
            
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([]);
        }
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/profile/password', [AuthController::class, 'changePassword']);
        Route::put('/password', [AuthController::class, 'changePassword']);

        // Species management (requires authentication)
        Route::post('/species', [SpeciesController::class, 'store'])
            ->middleware('permission:species.create');
        Route::put('/species/{species}', [SpeciesController::class, 'update'])
            ->middleware('permission:species.edit');
        Route::delete('/species/{species}', [SpeciesController::class, 'destroy'])
            ->middleware('permission:species.delete');
        Route::post('/species/{species}/submit', [SpeciesController::class, 'submit'])
            ->middleware('permission:species.create');
        Route::post('/species/{species}/verify', [SpeciesController::class, 'verify'])
            ->middleware('permission:species.verify');
        Route::put('/species/{species}/status', [SpeciesController::class, 'updateStatus'])
            ->middleware('permission:species.verify');
        Route::post('/species/{species}/photo', [SpeciesController::class, 'uploadPhoto']);
        Route::delete('/species/{species}/photo', [SpeciesController::class, 'deletePhoto']);
        Route::post('/species/{species}/local-names', [SpeciesController::class, 'addLocalName']);
        Route::delete('/species/{species}/local-names/{localNameId}', [SpeciesController::class, 'deleteLocalName'])
            ->middleware('permission:species.edit');
        Route::post('/species/{species}/virtues', [SpeciesController::class, 'addVirtue']);
        Route::delete('/species/{species}/virtues/{virtueId}', [SpeciesController::class, 'deleteVirtue'])
            ->middleware('permission:species.edit');

        // Compound management (requires authentication)
        Route::post('/compounds', [CompoundController::class, 'store'])
            ->middleware('permission:compounds.create');
        Route::put('/compounds/{compound}', [CompoundController::class, 'update'])
            ->middleware('permission:compounds.edit');
        Route::delete('/compounds/{compound}', [CompoundController::class, 'destroy'])
            ->middleware('permission:compounds.delete');
        Route::post('/compounds/{compound}/attach-species', [CompoundController::class, 'attachToSpecies'])
            ->middleware('permission:compounds.edit');
        Route::post('/compounds/{compound}/detach-species', [CompoundController::class, 'detachFromSpecies'])
            ->middleware('permission:compounds.edit');
        Route::post('/compounds/{compound}/submit', [CompoundController::class, 'submit'])
            ->middleware('permission:compounds.create');
        Route::post('/compounds/{compound}/verify', [CompoundController::class, 'verify'])
            ->middleware('permission:compounds.verify');
        Route::put('/compounds/{compound}/status', [CompoundController::class, 'updateStatus'])
            ->middleware('permission:compounds.verify');
        
        // Compound contributions (any authenticated user)
        Route::post('/compounds/{compound}/contribute-molecular', [CompoundController::class, 'contributeMolecularInfo']);
        Route::post('/compounds/{compound}/contribute-species', [CompoundController::class, 'contributeSpeciesLink']);
        Route::delete('/compounds/{compound}/species/{speciesId}', [CompoundController::class, 'removeSpeciesLink'])
            ->middleware('permission:compounds.edit');

        // Reference management (any authenticated user can create)
        Route::post('/references', [ReferenceController::class, 'store']);
        Route::put('/references/{reference}', [ReferenceController::class, 'update'])
            ->middleware('permission:species.edit');
        Route::delete('/references/{reference}', [ReferenceController::class, 'destroy'])
            ->middleware('role:admin');

        // Activity logs (for verifiers and admins)
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])
            ->middleware('permission:species.verify');
        Route::get('/activity-logs/stats', [ActivityLogController::class, 'stats'])
            ->middleware('permission:species.verify');
        Route::get('/activity-logs/{type}/{id}', [ActivityLogController::class, 'forModel'])
            ->middleware('permission:species.verify');

        // Donation methods management (admin only)
        Route::get('/admin/donation-methods', [DonationMethodController::class, 'adminIndex'])
            ->middleware('role:admin');
        Route::post('/admin/donation-methods', [DonationMethodController::class, 'store'])
            ->middleware('role:admin');
        Route::put('/admin/donation-methods/{donationMethod}', [DonationMethodController::class, 'update'])
            ->middleware('role:admin');
        Route::delete('/admin/donation-methods/{donationMethod}', [DonationMethodController::class, 'destroy'])
            ->middleware('role:admin');
        Route::post('/admin/donation-methods/toggle-qris', [DonationMethodController::class, 'toggleQris'])
            ->middleware('role:admin');
        Route::post('/admin/donation-methods/upload-qris', [DonationMethodController::class, 'uploadQris'])
            ->middleware('role:admin');

        // User management (admin only)
        Route::get('/admin/users', [UserController::class, 'index'])
            ->middleware('role:admin');
        Route::get('/admin/users/{user}', [UserController::class, 'show'])
            ->middleware('role:admin');
        Route::put('/admin/users/{user}', [UserController::class, 'update'])
            ->middleware('role:admin');
        Route::post('/admin/users/{user}/activate', [UserController::class, 'activate'])
            ->middleware('role:admin');
        Route::post('/admin/users/{user}/deactivate', [UserController::class, 'deactivate'])
            ->middleware('role:admin');
        Route::put('/admin/users/{user}/role', [UserController::class, 'updateRole'])
            ->middleware('role:admin');
        Route::post('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])
            ->middleware('role:admin');
        Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])
            ->middleware('role:admin');
    });
});
