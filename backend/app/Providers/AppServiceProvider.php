<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Species;
use App\Models\Compound;
use App\Observers\SpeciesObserver;
use App\Observers\CompoundObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        Species::observe(SpeciesObserver::class);
        Compound::observe(CompoundObserver::class);
    }
}
