import { Suspense } from 'react';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-void text-pearl" />}>
      {children}
    </Suspense>
  );
}
