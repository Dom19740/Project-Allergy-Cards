import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { parseBackupPayload, applyParsedBackup, takePendingBackupRestore } from '@/lib/backup';
import { PREMIUM_LIMITS } from '@/lib/premium-config';

// If the user picked "Restore Purchase" out of the Backup & Restore gate
// dialog, the backup they were mid-import on got stashed in sessionStorage
// (see stashPendingBackupRestore). Once premium-status-changed actually
// fires true - meaning the restore-purchase flow verified a real purchase,
// not just a client-side flag - finish that import automatically instead of
// making the user re-open the file/clipboard a second time.
export const usePendingBackupRestore = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const tryResume = async () => {
      const pendingText = await takePendingBackupRestore();
      if (!pendingText) return;

      try {
        const parsed = parseBackupPayload(pendingText);
        const result = await applyParsedBackup(parsed, PREMIUM_LIMITS.MAX_SAVED_CARDS);
        toast.success(`Premium restored - imported all ${result.importedCards} card${result.importedCards === 1 ? '' : 's'} from your backup.`);
        // The user started this from the Home screen menu - land them back
        // there instead of leaving them on the premium/onboarding screen
        // they detoured through to restore their purchase.
        navigate('/');
      } catch {
        toast.error("Premium restored, but couldn't finish importing your backup. Try Paste from clipboard or Restore from file again.");
      }
    };

    const handleStatusChange = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) tryResume();
    };

    window.addEventListener('premium-status-changed', handleStatusChange);
    return () => window.removeEventListener('premium-status-changed', handleStatusChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
