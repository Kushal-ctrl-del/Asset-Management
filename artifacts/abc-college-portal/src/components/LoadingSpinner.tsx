import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
    </div>
  );
}
