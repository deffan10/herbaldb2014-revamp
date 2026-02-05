<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Virtue extends Model
{
    use HasFactory;

    protected $fillable = [
        'species_id',
        'plant_part_id',
        'usage_type',
        'description',
        'description_en',
        'medical_term',
        'reference_id',
        'status',
        'created_by',
        'verified_by',
    ];

    public function species(): BelongsTo
    {
        return $this->belongsTo(Species::class);
    }

    public function plantPart(): BelongsTo
    {
        return $this->belongsTo(PlantPart::class);
    }

    public function reference(): BelongsTo
    {
        return $this->belongsTo(Reference::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
