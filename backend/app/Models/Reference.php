<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reference extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_name',
        'authors',
        'year',
        'type',
        'url',
        'created_by',
    ];

    public function species(): HasMany
    {
        return $this->hasMany(Species::class);
    }

    public function virtues(): HasMany
    {
        return $this->hasMany(Virtue::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
