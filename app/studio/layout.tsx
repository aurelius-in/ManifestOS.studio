import { Suspense } from 'react';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#080706] text-[#FFF8E7]" />}>
      {children}
    </Suspense>
  );
}
