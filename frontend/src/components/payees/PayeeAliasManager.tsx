'use client';

import { useState, useEffect, useCallback } from 'react';
import { PayeeAlias } from '@/types/payee';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { payeesApi } from '@/lib/payees';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';

interface PayeeAliasManagerProps {
  payeeId: string;
}

export function PayeeAliasManager({ payeeId }: PayeeAliasManagerProps) {
  const [aliases, setAliases] = useState<PayeeAlias[]>([]);
  const [newAlias, setNewAlias] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const loadAliases = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await payeesApi.getAliases(payeeId);
      setAliases(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load aliases'));
    } finally {
      setIsLoading(false);
    }
  }, [payeeId]);

  useEffect(() => {
    loadAliases();
  }, [loadAliases]);

  const handleAdd = async () => {
    const trimmed = newAlias.trim();
    if (!trimmed) return;

    setIsAdding(true);
    try {
      const created = await payeesApi.createAlias({
        payeeId,
        alias: trimmed,
      });
      setAliases((prev) => [...prev, created].sort((a, b) => a.alias.localeCompare(b.alias)));
      setNewAlias('');
      toast.success(`Alias "${trimmed}" added`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add alias'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (alias: PayeeAlias) => {
    try {
      await payeesApi.deleteAlias(alias.id);
      setAliases((prev) => prev.filter((a) => a.id !== alias.id));
      toast.success(`Alias "${alias.alias}" removed`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to remove alias'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Aliases
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Aliases map imported payee names to this payee. Use * as wildcard (e.g., &quot;STARBUCKS*&quot;).
        Case-insensitive.
      </p>

      {/* Existing aliases */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : aliases.length > 0 ? (
        <ul className="space-y-1">
          {aliases.map((alias) => (
            <li
              key={alias.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-1.5"
            >
              <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {alias.alias}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(alias)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                title="Remove alias"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">
          No aliases configured
        </p>
      )}

      {/* Add new alias */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="e.g., STARBUCKS #*"
            value={newAlias}
            onChange={(e) => setNewAlias(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAdd}
          disabled={!newAlias.trim() || isAdding}
        >
          {isAdding ? 'Adding...' : 'Add'}
        </Button>
      </div>
    </div>
  );
}
