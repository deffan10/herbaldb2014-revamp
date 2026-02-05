<?php

namespace App\Observers;

use App\Models\Compound;
use App\Models\ActivityLog;

class CompoundObserver
{
    /**
     * Handle the Compound "created" event.
     */
    public function created(Compound $compound): void
    {
        ActivityLog::log(
            $compound,
            'created',
            ['new' => $compound->toArray()],
            "Senyawa '{$compound->name}' dibuat"
        );
    }

    /**
     * Handle the Compound "updating" event.
     */
    public function updating(Compound $compound): void
    {
        $original = $compound->getOriginal();
        $dirty = $compound->getDirty();
        
        // Check for status change
        if (isset($dirty['status'])) {
            $action = match($dirty['status']) {
                'pending' => 'submitted',
                'published' => 'approved',
                'rejected' => 'rejected',
                default => 'status_changed',
            };
            
            ActivityLog::log(
                $compound,
                $action,
                [
                    'old_status' => $original['status'],
                    'new_status' => $dirty['status'],
                ],
                "Status senyawa '{$compound->name}' diubah dari '{$original['status']}' ke '{$dirty['status']}'"
            );
        }
        
        // Log other changes (excluding status)
        $otherChanges = array_diff_key($dirty, array_flip(['status', 'updated_at']));
        if (!empty($otherChanges)) {
            $changes = [
                'old' => array_intersect_key($original, $otherChanges),
                'new' => $otherChanges,
            ];
            
            ActivityLog::log(
                $compound,
                'updated',
                $changes,
                "Senyawa '{$compound->name}' diperbarui"
            );
        }
    }

    /**
     * Handle the Compound "deleted" event.
     */
    public function deleted(Compound $compound): void
    {
        ActivityLog::log(
            $compound,
            'deleted',
            ['deleted' => $compound->toArray()],
            "Senyawa '{$compound->name}' dihapus"
        );
    }
}
