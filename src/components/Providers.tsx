'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: '12px',
            fontSize: '0.9rem',
          },
          success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-bg)' } },
          error: { iconTheme: { primary: 'var(--color-error)', secondary: 'var(--color-bg)' } },
        }}
      />
    </QueryClientProvider>
  );
}
