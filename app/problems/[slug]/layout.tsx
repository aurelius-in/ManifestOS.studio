import { Suspense } from 'react';

export default function ProblemLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="min-h-screen" />}>{children}</Suspense>;
}
