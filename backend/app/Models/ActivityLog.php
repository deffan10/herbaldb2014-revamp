<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'loggable_type',
        'loggable_id',
        'action',
        'changes',
        'description',
        'user_id',
        'ip_address',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log an activity.
     */
    public static function log(
        Model $model,
        string $action,
        ?array $changes = null,
        ?string $description = null,
        ?int $userId = null
    ): self {
        return self::create([
            'loggable_type' => get_class($model),
            'loggable_id' => $model->id,
            'action' => $action,
            'changes' => $changes,
            'description' => $description,
            'user_id' => $userId ?? auth()->id(),
            'ip_address' => request()->ip(),
        ]);
    }

    /**
     * Get action label in Indonesian.
     */
    public function getActionLabelAttribute(): string
    {
        $labels = [
            'created' => 'Dibuat',
            'updated' => 'Diperbarui',
            'deleted' => 'Dihapus',
            'status_changed' => 'Status Diubah',
            'photo_uploaded' => 'Foto Diunggah',
            'photo_deleted' => 'Foto Dihapus',
            'submitted' => 'Diajukan Review',
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'species_attached' => 'Spesies Ditambahkan',
            'species_detached' => 'Spesies Dihapus',
            'local_name_added' => 'Nama Lokal Ditambah',
            'local_name_deleted' => 'Nama Lokal Dihapus',
            'virtue_added' => 'Manfaat Ditambah',
            'virtue_deleted' => 'Manfaat Dihapus',
            'molecular_info_contributed' => 'Info Molekuler Ditambah',
            'species_link_contributed' => 'Link Spesies Ditambah',
            'species_link_removed' => 'Link Spesies Dihapus',
        ];

        return $labels[$this->action] ?? $this->action;
    }

    /**
     * Get loggable type label.
     */
    public function getLoggableTypeLabelAttribute(): string
    {
        $labels = [
            'App\\Models\\Species' => 'Spesies',
            'App\\Models\\Compound' => 'Senyawa',
        ];

        return $labels[$this->loggable_type] ?? class_basename($this->loggable_type);
    }
}
