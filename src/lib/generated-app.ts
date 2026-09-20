import { GeneratedApp, SolutionProposal } from './domain';

export function generateDemoApp(solution: SolutionProposal): GeneratedApp {
  const appName = solution.title === 'FedYet' || solution.title.startsWith('FedYet') ? 'FedYet' : solution.title;
  return {
    name: appName,
    description: solution.plainLanguageSummary,
    entryFile: 'src/App.tsx',
    capabilities: ['local status persistence', 'timestamp history', 'mobile-first interface'],
    files: [{ path: 'src/App.tsx', language: 'tsx', contents: `import { useState } from 'react';

export default function App() {
  const [fed, setFed] = useState(false);
  const [lastFed, setLastFed] = useState<string | null>(null);
  const feed = () => { setFed(true); setLastFed(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); };
  return <main style={{ minHeight: '100vh', background: '#080706', color: '#fff8e7', padding: 24, fontFamily: 'Arial' }}>
    <section style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ color: '#d89b22', letterSpacing: 3, fontSize: 12 }}>FAMILY CARE</p>
      <h1 style={{ fontSize: 42, margin: '18px 0 8px' }}>FedYet?</h1>
      <p style={{ color: '#beb6a3', fontSize: 18 }}>A clear answer for everyone looking after the dog.</p>
      <div style={{ background: '#12100c', border: '1px solid rgba(242,193,78,.25)', borderRadius: 24, padding: 28, marginTop: 28 }}>
        <div style={{ color: fed ? '#ffd66b' : '#beb6a3', fontSize: 18 }}>{fed ? 'Yes, the dog was fed.' : 'Not marked yet today.'}</div>
        {lastFed && <p style={{ color: '#beb6a3' }}>Recorded at {lastFed}</p>}
        <button onClick={feed} style={{ marginTop: 20, width: '100%', minHeight: 64, border: 0, borderRadius: 18, background: '#d89b22', color: '#080706', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}>{fed ? 'Mark again' : 'I fed the dog'}</button>
      </div>
      <p style={{ color: '#beb6a3', marginTop: 28, fontSize: 14 }}>Today’s history will appear here as family members check in.</p>
    </section>
  </main>;
}` }],
  };
}
