<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Compound extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'knapsack_id',
        'metabolite_id',
        'pubchem_id',
        'cas_number',
        'molecular_formula',
        'molecular_weight',
        'smiles',
        'inchi',
        'inchi_key',
        'compound_group_id',
        'mol_file_path',
        'mol2_file_path',
        'status',
        'created_by',
        'verified_by',
        'verified_at',
        'is_legacy',
        'legacy_id',
        'source',
        'species_source',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(CompoundGroup::class, 'compound_group_id');
    }

    public function species(): BelongsToMany
    {
        return $this->belongsToMany(Species::class, 'species_compounds')
            ->withPivot(['plant_part_id', 'reference_id', 'notes', 'status'])
            ->withTimestamps();
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
