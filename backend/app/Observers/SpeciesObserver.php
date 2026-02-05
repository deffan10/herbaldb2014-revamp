<?php

namespace App\Observers;

use App\Models\Species;
use App\Models\ActivityLog;

class SpeciesObserver
{
    /**
     * Handle the Species "created" event.
     */
    public function created(Species $species): void
    {
        ActivityLog::log(
            $species,
            'created',
            ['new' => $species->toArray()],
            "Spesies '{$species->scientific_name}' dibuat"
        );
    }

    /**
     * Handle the Species "updating" event.
     */
    public function updating(Species $species): void
    {
        $original = $species->getOriginal();
        $dirty = $species->getDirty();
        
        // Check for status change
        if (isset($dirty['status'])) {
            $action = match($dirty['status']) {
                'pending' => 'submitted',
                'published' => 'approved',
                'rejected' => 'rejected',
                default => 'status_changed',
            };
            
            ActivityLog::log(
                $species,
                $action,
                [
                    'old_status' => $original['status'],
                    'new_status' => $dirty['status'],
                ],
                "Status spesies '{$species->scientific_name}' diubah dari '{$original['status']}' ke '{$dirty['status']}'"
            );
        }
        
        // Skip photo logging here (handled in controller to avoid duplicate logs)
        // Log other changes (excluding status and photo which are handled separately)
        $otherChanges = array_diff_key($dirty, array_flip(['status', 'photo', 'updated_at']));
        if (!empty($otherChanges)) {
            $changes = [
                'old' => array_intersect_key($original, $otherChanges),
                'new' => $otherChanges,
            ];
            
            ActivityLog::log(
                $species,
                'updated',
                $changes,
                "Spesies '{$species->scientific_name}' diperbarui"
            );
        }
    }

    /**
     * Handle the Species "deleted" event.
     */
    public function deleted(Species $species): void
    {
        ActivityLog::log(
            $species,
            'deleted',
            ['deleted' => $species->toArray()],
            "Spesies '{$species->scientific_name}' dihapus"
        );
    }
}
