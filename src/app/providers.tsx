'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          // 선명도 유지: blur/brightness 없이 이동만 전환
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: -10 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </QueryClientProvider>
  );
}
