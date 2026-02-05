<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpeciesCompound extends Model
{
    use HasFactory;

    protected $table = 'species_compounds';

    protected $fillable = [
        'species_id',
        'compound_id',
        'plant_part_id',
        'reference_id',
        'notes',
        'status',
        'created_by',
        'verified_by',
    ];

    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    public function compound(): BelongsTo
    {
        return $this->belongsTo(Compound::class);
    }

    public function plantPart(): BelongsTo
    {
        return $this->belongsTo(PlantPart::class);
    }

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class);
    }
}
