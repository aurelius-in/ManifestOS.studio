import { Suspense } from 'react';
import StudioPage from './studio-page';

export default function StudioRoute() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#080706] text-[#FFF8E7]" />}>
      <StudioPage />
    </Suspense>
  );
}
