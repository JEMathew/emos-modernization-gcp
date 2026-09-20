// Isolated browser QA fixture. Never imported by the application entry point.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dashboard } from '../../src/components/Dashboard';
import { ThemeProvider } from '../../src/lib/theme';
import '../../src/index.css';

createRoot(document.getElementById('root')!).render(<ThemeProvider><Dashboard user={{ uid: 'local-qa-only', displayName: 'Local synthetic preview' } as any} /></ThemeProvider>);
