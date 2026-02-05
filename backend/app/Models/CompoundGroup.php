<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompoundGroup extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'name', 'name_en'];

    public function compounds(): HasMany
    {
        return $this->hasMany(Compound::class);
    }
}
