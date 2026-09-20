import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from '../../src/components/Dashboard';
import { ThemeProvider } from '../../src/lib/theme';
import '../../src/index.css';
createRoot(document.getElementById('root')!).render(<ThemeProvider>
  <p role="note" className="bg-amber-100 px-4 py-2 text-xs text-black">Local QA: synthetic data only. First save intentionally fails; retry succeeds in memory. Reload clears imports. AI calls disabled.</p>
  <Dashboard user={{ uid: 'local-qa-only', displayName: 'Synthetic intake review' } as any} />
</ThemeProvider>);
