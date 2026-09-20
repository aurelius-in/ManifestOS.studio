import { ChangeClass, ChangeRequest, GeneratedApp, SolutionProposal } from './domain';

export interface PreviewModel {
  name: string;
  kicker: string;
  subtitle: string;
  statusIdle: string;
  statusDone: string;
  actionLabel: string;
  actionLabelRepeat: string;
  buttonMinHeight: number;
  showActor: boolean;
  showHistory: boolean;
  extraNote: string;
}

function quotedValue(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

export function buildPreviewModel(
  solution: SolutionProposal,
  changeRequests: Array<Pick<ChangeRequest, 'changeClass' | 'text'>> = [],
): PreviewModel {
  const isCare = /fed|dog|family|care/i.test(`${solution.title} ${solution.plainLanguageSummary}`);
  const model: PreviewModel = {
    name: solution.title.startsWith('FedYet') ? 'FedYet' : solution.title,
    kicker: isCare ? 'FAMILY CARE' : 'PREVIEW',
    subtitle: solution.plainLanguageSummary,
    statusIdle: isCare ? 'Not marked yet today.' : 'Nothing recorded yet.',
    statusDone: isCare ? 'Yes, the dog was fed.' : 'Recorded.',
    actionLabel: isCare ? 'I fed the dog' : 'Record it',
    actionLabelRepeat: isCare ? 'Mark again' : 'Record again',
    buttonMinHeight: 60,
    showActor: false,
    showHistory: false,
    extraNote: isCare
      ? "Today's history will appear here as family members check in."
      : 'History will appear here after the first action.',
  };

  for (const request of changeRequests) {
    applyPreviewChange(model, request.changeClass, request.text);
  }

  return model;
}

function applyPreviewChange(model: PreviewModel, changeClass: ChangeClass, text: string) {
  if (changeClass === 'copy') {
    const name = quotedValue(text, [
      /call it ["']?([^"'.]+)["']?/i,
      /title(?: should be| to) ["']?([^"'.]+)["']?/i,
      /rename (?:it|this|the app) to ["']?([^"'.]+)["']?/i,
      /named ["']?([^"'.]+)["']?/i,
    ]);
    if (name) model.name = name;
    const button = quotedValue(text, [
      /button (?:should )?(?:say|read|be labeled) ["']?([^"'.]+)["']?/i,
      /label (?:to|should be) ["']?([^"'.]+)["']?/i,
    ]);
    if (button) {
      model.actionLabel = button;
      model.actionLabelRepeat = button;
    }
    return;
  }

  if (changeClass === 'layout') {
    if (/larger|bigger|huge|xl/i.test(text)) model.buttonMinHeight = Math.max(model.buttonMinHeight, 88);
    if (/smaller|compact/i.test(text)) model.buttonMinHeight = 48;
    return;
  }

  if (changeClass === 'data') {
    model.showActor = true;
    model.showHistory = true;
    model.extraNote = 'The app now remembers who acted and keeps a visible history.';
    return;
  }

  if (changeClass === 'new_capability') {
    model.extraNote = /remind/i.test(text)
      ? 'Reminder nudges are on for this preview.'
      : `Added capability: ${text.trim()}`;
    return;
  }

  if (changeClass === 'blueprint_touching') {
    if (/private|privacy/i.test(text)) {
      model.kicker = 'PRIVATE';
      model.extraNote = 'Visibility is limited to the people named in the plan.';
    } else {
      model.extraNote = `Plan update: ${text.trim()}`;
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function previewModelToHtml(model: PreviewModel): string {
  const actor = model.showActor
    ? `<label style="display:block;color:#c4b59a;font-size:13px;text-align:left;margin-bottom:12px">Who did this?<input id="who" placeholder="Name" style="margin-top:8px;width:100%;min-height:44px;border:1px solid rgba(232,176,32,.35);border-radius:12px;background:#050403;color:#f6f0e4;padding:10px"></label>`
    : '';
  const history = model.showHistory
    ? `<ul id="history" style="margin:20px 0 0;padding-left:18px;color:#c4b59a;text-align:left;font-size:14px"></ul>`
    : '';
  return `<!doctype html><html><body style="margin:0"><div style="padding:32px;font-family:Outfit,Arial,sans-serif;background:radial-gradient(circle at 50% 0%, rgba(232,176,32,0.16), transparent 42%), #050403;color:#f6f0e4;min-height:420px"><div style="max-width:420px;margin:auto;text-align:center"><p style="color:#e8b020;letter-spacing:3px;font-size:11px">${escapeHtml(model.kicker)}</p><h1 style="font-size:40px;margin:16px 0 8px;background:linear-gradient(180deg,#fff6d4,#ffd56a 42%,#e8b020);-webkit-background-clip:text;color:transparent">${escapeHtml(model.name)}</h1><p style="color:#c4b59a">${escapeHtml(model.subtitle)}</p><div style="background:#14110c;border:1px solid rgba(255,213,106,.28);border-radius:20px;padding:24px;margin-top:24px;box-shadow:0 0 28px rgba(232,176,32,.2)">${actor}<div id="status" style="color:#c4b59a;font-size:18px">${escapeHtml(model.statusIdle)}</div><button id="action" onclick="recordAction()" style="margin-top:20px;width:100%;min-height:${model.buttonMinHeight}px;border:0;border-radius:16px;background:linear-gradient(180deg,#ffe08a,#e8b020 48%,#c49218);font-size:18px;font-weight:bold;color:#1a1408;cursor:pointer">${escapeHtml(model.actionLabel)}</button>${history}</div><p style="color:#c4b59a;margin-top:28px;font-size:14px">${escapeHtml(model.extraNote)}</p></div></div><script>
function recordAction(){
  var status = document.getElementById('status');
  var who = document.getElementById('who');
  var history = document.getElementById('history');
  var actor = who && who.value ? who.value : 'Someone';
  status.textContent = ${JSON.stringify(model.statusDone)};
  status.style.color = '#ffd56a';
  document.getElementById('action').textContent = ${JSON.stringify(model.actionLabelRepeat)};
  if (history) {
    var item = document.createElement('li');
    item.textContent = actor + ' recorded this at ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    history.prepend(item);
  }
}
</script></body></html>`;
}

export function generateDemoApp(
  solution: SolutionProposal,
  changeRequests: Array<Pick<ChangeRequest, 'changeClass' | 'text'>> = [],
): GeneratedApp {
  const model = buildPreviewModel(solution, changeRequests);
  const previewHtml = previewModelToHtml(model);
  const appName = model.name;
  return {
    name: appName,
    description: solution.plainLanguageSummary,
    entryFile: 'src/App.tsx',
    capabilities: [
      'local status persistence',
      'timestamp history',
      'mobile-first interface',
      ...(model.showActor ? ['actor attribution'] : []),
      ...(changeRequests.some((request) => request.changeClass === 'new_capability') ? ['added capability'] : []),
    ],
    previewHtml,
    files: [{
      path: 'src/App.tsx',
      language: 'tsx',
      contents: `import { useState } from 'react';

export default function App() {
  const [fed, setFed] = useState(false);
  const [lastFed, setLastFed] = useState<string | null>(null);
  const feed = () => { setFed(true); setLastFed(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); };
  return <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, rgba(232,176,32,0.16), transparent 42%), #050403', color: '#f6f0e4', padding: 24, fontFamily: 'Outfit, Arial, sans-serif' }}>
    <section style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ color: '#e8b020', letterSpacing: 3, fontSize: 12 }}>${model.kicker}</p>
      <h1 style={{ fontSize: 42, margin: '18px 0 8px' }}>${appName}</h1>
      <p style={{ color: '#c4b59a', fontSize: 18 }}>${solution.plainLanguageSummary}</p>
      <div style={{ background: '#14110c', border: '1px solid rgba(255,213,106,.28)', borderRadius: 24, padding: 28, marginTop: 28 }}>
        <div style={{ color: fed ? '#ffd56a' : '#c4b59a', fontSize: 18 }}>{fed ? ${JSON.stringify(model.statusDone)} : ${JSON.stringify(model.statusIdle)}}</div>
        {lastFed && <p style={{ color: '#c4b59a' }}>Recorded at {lastFed}</p>}
        <button onClick={feed} style={{ marginTop: 20, width: '100%', minHeight: ${model.buttonMinHeight}, border: 0, borderRadius: 18, background: 'linear-gradient(180deg,#ffe08a,#e8b020 48%,#c49218)', color: '#1a1408', fontSize: 20, fontWeight: 700, cursor: 'pointer' }}>{fed ? ${JSON.stringify(model.actionLabelRepeat)} : ${JSON.stringify(model.actionLabel)}}</button>
      </div>
      <p style={{ color: '#c4b59a', marginTop: 28, fontSize: 14 }}>${model.extraNote}</p>
    </section>
  </main>;
}`,
    }],
  };
}

export function buildPreviewSrcDoc(app: GeneratedApp): string {
  return app.previewHtml;
}
