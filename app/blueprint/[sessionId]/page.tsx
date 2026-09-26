import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { BlueprintResult } from './blueprint-result';

export const metadata: Metadata = {
  title: 'Your Build-Ready Blueprint',
  robots: { index: false, follow: false },
};

export default async function BlueprintPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-6 md:px-8 md:py-10">
        <SiteHeader compact />
        <BlueprintResult sessionId={sessionId} />
        <SiteFooter />
      </div>
    </main>
  );
}
