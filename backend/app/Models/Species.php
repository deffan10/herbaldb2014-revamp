<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Species extends Model
{
    use HasFactory;

    protected $fillable = [
        'species_code',
        'scientific_name',
        'variety',
        'family',
        'discoverer',
        'description',
        'description_en',
        'status',
        'created_by',
        'verified_by',
        'reference_id',
        'verified_at',
        'photo',
        'is_legacy',
        'legacy_id',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class);
    }

    public function localNames(): HasMany
    {
        return $this->hasMany(LocalName::class);
    }

    public function aliases(): HasMany
    {
        return $this->hasMany(SpeciesAlias::class);
    }

    public function virtues(): HasMany
    {
        return $this->hasMany(Virtue::class);
    }

    public function compounds(): BelongsToMany
    {
        return $this->belongsToMany(Compound::class, 'species_compounds')
            ->withPivot(['plant_part_id', 'reference_id', 'notes', 'status'])
            ->withTimestamps();
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    // Helpers
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
