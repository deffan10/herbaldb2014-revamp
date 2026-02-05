<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Species
            'species.view',
            'species.create',
            'species.edit',
            'species.delete',
            'species.verify',
            
            // Compounds
            'compounds.view',
            'compounds.create',
            'compounds.edit',
            'compounds.delete',
            'compounds.verify',
            
            // Contributions
            'contributions.view',
            'contributions.review',
            
            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            
            // Admin
            'admin.access',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin - full access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Verifier - can verify submissions
        $verifierRole = Role::create(['name' => 'verifier']);
        $verifierRole->givePermissionTo([
            'species.view',
            'species.create',
            'species.edit',
            'species.verify',
            'compounds.view',
            'compounds.create',
            'compounds.edit',
            'compounds.verify',
            'contributions.view',
            'contributions.review',
        ]);

        // Contributor - can submit data
        $contributorRole = Role::create(['name' => 'contributor']);
        $contributorRole->givePermissionTo([
            'species.view',
            'species.create',
            'compounds.view',
            'compounds.create',
            'contributions.view',
        ]);

        // Guest - view only (implicit, no role needed)
    }
}
