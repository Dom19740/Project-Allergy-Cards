import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { usePageSEO } from '@/hooks/usePageSEO';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface AffiliateSummaryRow {
  ref: string;
  currency: string | null;
  paidCount: number;
  paidTotal: number;
  refundedCount: number;
  refundedTotal: number;
  netTotal: number;
}

// Totals from the API are in the smallest currency unit (cents for USD).
const formatMoney = (cents: number, currency: string | null) =>
  currency ? `${(cents / 100).toFixed(2)} ${currency}` : (cents / 100).toFixed(2);

const Admin = () => {
  usePageSEO({ title: 'Admin | Simple Allergy Alert' });

  const [checkingStoredSecret, setCheckingStoredSecret] = useState(true);
  const [unlockedSecret, setUnlockedSecret] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState('');
  const [summary, setSummary] = useState<AffiliateSummaryRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const attemptUnlock = async (candidate: string) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/admin/affiliate-summary', {
        headers: { 'x-admin-secret': candidate },
      });
      if (response.status === 401) {
        // Wrong or stale secret - clear it rather than retrying with it again.
        await storage.remove(STORAGE_KEYS.ADMIN_SECRET);
        setUnlockedSecret(null);
        setErrorMessage('Incorrect secret.');
        return;
      }
      if (!response.ok) {
        setErrorMessage(`Request failed (${response.status}).`);
        return;
      }
      const data = await response.json();
      setSummary(data.summary ?? []);
      setUnlockedSecret(candidate);
      await storage.set(STORAGE_KEYS.ADMIN_SECRET, candidate);
    } catch {
      setErrorMessage('Network error - check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    storage.get<string>(STORAGE_KEYS.ADMIN_SECRET).then((saved) => {
      setCheckingStoredSecret(false);
      if (saved) attemptUnlock(saved);
    });
    // Only ever run on mount - attemptUnlock intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    attemptUnlock(secretInput);
  };

  const handleForget = async () => {
    await storage.remove(STORAGE_KEYS.ADMIN_SECRET);
    setUnlockedSecret(null);
    setSummary(null);
    setSecretInput('');
  };

  if (checkingStoredSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!unlockedSecret) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm p-6 space-y-4">
          <h1 className="text-xl font-bold">Admin</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="admin-secret">Admin secret</Label>
              <Input
                id="admin-secret"
                type="password"
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                autoFocus
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={!secretInput || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unlock'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Affiliate payouts</h1>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => attemptUnlock(unlockedSecret)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleForget}>
            Forget secret
          </Button>
        </div>
      </div>

      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      {summary && summary.length === 0 && (
        <p className="text-muted-foreground">No affiliate purchases recorded yet.</p>
      )}

      {summary && summary.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4">Referrer</th>
                <th className="py-2 pr-4">Paid</th>
                <th className="py-2 pr-4">Refunded</th>
                <th className="py-2 pr-4">Net owed</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => (
                <tr key={row.ref} className="border-b">
                  <td className="py-2 pr-4 font-medium">{row.ref}</td>
                  <td className="py-2 pr-4">
                    {row.paidCount} ({formatMoney(row.paidTotal, row.currency)})
                  </td>
                  <td className="py-2 pr-4">
                    {row.refundedCount} ({formatMoney(row.refundedTotal, row.currency)})
                  </td>
                  <td className="py-2 pr-4 font-semibold">{formatMoney(row.netTotal, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;
