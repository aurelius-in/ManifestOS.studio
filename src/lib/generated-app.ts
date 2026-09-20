import { GeneratedApp, SolutionProposal } from './domain';

const previewCss = `
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    font-family: Outfit, Arial, sans-serif;
    background:
      radial-gradient(circle at 50% 0%, rgba(232,176,32,0.16), transparent 42%),
      #050403;
    color: #f6f0e4;
  }
  .star {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 8px;
    background: #fff1b8;
    clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
    filter: drop-shadow(0 0 6px #ffd56a);
    vertical-align: middle;
  }
`;

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
  return <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(232,176,32,0.16), transparent 42%), #050403', color: '#f6f0e4', padding: 24, fontFamily: 'Outfit, Arial, sans-serif' }}>
    <section style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ color: '#e8b020', letterSpacing: 3, fontSize: 12 }}><span style={{ display: 'inline-block', width: 10, height: 10, marginRight: 8, background: '#fff1b8', clipPath: 'polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%)', verticalAlign: 'middle' }} />FAMILY CARE</p>
      <h1 style={{ fontSize: 42, margin: '18px 0 8px', background: 'linear-gradient(180deg,#fff6d4,#ffd56a 42%,#e8b020)', WebkitBackgroundClip: 'text', color: 'transparent' }}>FedYet?</h1>
      <p style={{ color: '#c4b59a', fontSize: 18 }}>A clear answer for everyone looking after the dog.</p>
      <div style={{ background: '#14110c', border: '1px solid rgba(255,213,106,.28)', borderRadius: 24, padding: 28, marginTop: 28, boxShadow: '0 0 32px rgba(232,176,32,.18)' }}>
        <div style={{ color: fed ? '#ffd56a' : '#c4b59a', fontSize: 18 }}>{fed ? 'Yes, the dog was fed.' : 'Not marked yet today.'}</div>
        {lastFed && <p style={{ color: '#c4b59a' }}>Recorded at {lastFed}</p>}
        <button onClick={feed} style={{ marginTop: 20, width: '100%', minHeight: 64, border: 0, borderRadius: 18, background: 'linear-gradient(180deg,#ffe08a,#e8b020 48%,#c49218)', color: '#1a1408', fontSize: 20, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 20px rgba(232,176,32,.32)' }}>{fed ? 'Mark again' : 'I fed the dog'}</button>
      </div>
      <p style={{ color: '#c4b59a', marginTop: 28, fontSize: 14 }}>Today’s history will appear here as family members check in.</p>
    </section>
  </main>;
}` }],
  };
}

export function buildPreviewSrcDoc(app: GeneratedApp): string {
  const name = app.name.replace(/</g, '');
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>${previewCss}</style>
  </head>
  <body>
    <div style="padding:32px;min-height:420px">
      <div style="max-width:420px;margin:auto;text-align:center">
        <p style="color:#e8b020;letter-spacing:3px;font-size:11px"><span class="star"></span>FAMILY CARE</p>
        <h1 style="font-size:40px;margin:16px 0 8px;background:linear-gradient(180deg,#fff6d4,#ffd56a 42%,#e8b020);-webkit-background-clip:text;color:transparent">${name}</h1>
        <p style="color:#c4b59a">A clear answer for everyone looking after the dog.</p>
        <div style="background:#14110c;border:1px solid rgba(255,213,106,.28);border-radius:20px;padding:24px;margin-top:24px;box-shadow:0 0 28px rgba(232,176,32,.2)">
          <div id="status" style="color:#c4b59a;font-size:18px">Not marked yet today.</div>
          <button onclick="document.getElementById('status').textContent='Yes, the dog was fed.';this.style.color='#1a1408'" style="margin-top:20px;width:100%;min-height:60px;border:0;border-radius:16px;background:linear-gradient(180deg,#ffe08a,#e8b020 48%,#c49218);font-size:18px;font-weight:bold;color:#1a1408;cursor:pointer">I fed the dog</button>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
