<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'institution',
        'whatsapp',
        'avatar_url',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function contributions(): HasMany
    {
        return $this->hasMany(Contribution::class);
    }

    public function createdSpecies(): HasMany
    {
        return $this->hasMany(Species::class, 'created_by');
    }

    public function verifiedSpecies(): HasMany
    {
        return $this->hasMany(Species::class, 'verified_by');
    }

    public function createdCompounds(): HasMany
    {
        return $this->hasMany(Compound::class, 'created_by');
    }

    public function verifiedCompounds(): HasMany
    {
        return $this->hasMany(Compound::class, 'verified_by');
    }

    // Helpers
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isVerifier(): bool
    {
        return $this->hasRole('verifier') || $this->hasRole('admin');
    }

    public function isContributor(): bool
    {
        return $this->hasRole('contributor');
    }
}
