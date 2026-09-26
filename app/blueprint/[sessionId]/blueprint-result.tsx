'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoredBlueprint } from '@/lib/blueprint-pack';
import { trackActivity } from '@/lib/activity-client';
import { SUPPORT_EMAIL } from '@/lib/copy';

type State =
  | { kind: 'loading'; note: string }
  | { kind: 'ready'; blueprint: StoredBlueprint }
  | { kind: 'error'; message: string };

export function BlueprintResult({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<State>({ kind: 'loading', note: 'Confirming your payment...' });
  const [copied, setCopied] = useState('');
  const tracked = useRef(false);

  const load = useCallback(async () => {
    for (let attempt = 0; attempt < 12; attempt++) {
      setState({ kind: 'loading', note: attempt === 0 ? 'Writing your Blueprint. This takes about a minute.' : 'Still writing. Stay on this page.' });
      try {
        const res = await fetch('/api/blueprint/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const body = (await res.json()) as { status?: string; blueprint?: StoredBlueprint; error?: string };
        if (res.ok && body.blueprint) {
          setState({ kind: 'ready', blueprint: body.blueprint });
          return;
        }
        if (res.status === 202 || res.status === 402) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        setState({ kind: 'error', message: body.error || 'Something went wrong.' });
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
    setState({ kind: 'error', message: `This is taking longer than it should. Refresh the page, or email ${SUPPORT_EMAIL}.` });
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (state.kind !== 'ready' || tracked.current) return;
    tracked.current = true;
    trackActivity('blueprint_paid', { title: state.blueprint.pack.title.slice(0, 80) });
  }, [state]);

  if (state.kind === 'loading') {
    return (
      <section className="panel p-6">
        <p className="gold-label">Build-Ready Blueprint</p>
        <h1 className="mt-3 text-3xl font-semibold text-pearl">Thank you. Manifesting what should exist.</h1>
        <p className="mt-3 text-champagne">{state.note}</p>
      </section>
    );
  }

  if (state.kind === 'error') {
    return (
      <section className="panel p-6">
        <p className="gold-label">Build-Ready Blueprint</p>
        <h1 className="mt-3 text-2xl font-semibold text-pearl">We hit a snag.</h1>
        <p className="mt-3 text-champagne">{state.message}</p>
        <button type="button" className="btn-gold mt-6" onClick={() => void load()}>
          Try again
        </button>
      </section>
    );
  }

  const { pack, markdown } = state.blueprint;

  function download() {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'blueprint'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    trackActivity('blueprint_download');
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    trackActivity('blueprint_prompt_copy', { builder: label });
    window.setTimeout(() => setCopied(''), 1500);
  }

  return (
    <article className="space-y-6">
      <section className="panel p-6">
        <p className="gold-label">Build-Ready Blueprint</p>
        <h1 className="mt-3 text-3xl font-semibold text-pearl">{pack.title}</h1>
        <p className="mt-3 text-champagne">Bookmark this page. It is your copy, and it will be here when you come back.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" className="btn-gold" onClick={download}>
            Download as Markdown
          </button>
          <button type="button" className="btn-ghost" onClick={() => void copy('Whole blueprint', markdown)}>
            {copied === 'Whole blueprint' ? 'Copied' : 'Copy the whole Blueprint'}
          </button>
        </div>
      </section>

      <Block title="1. What should exist">
        <p className="text-pearl">{pack.shouldExist.outcome}</p>
        <p className="mt-3 text-sm text-champagne">For: {pack.shouldExist.forWhom}</p>
        <List items={pack.shouldExist.worksWhen} label="It works when" />
      </Block>

      <Block title="2. What should not exist yet">
        <List items={pack.shouldNotExist} />
      </Block>

      <Block title="3. The smallest useful version">
        <ul className="space-y-3">
          {pack.smallestVersion.map((f) => (
            <li key={f.feature}>
              <p className="text-pearl">{f.feature}</p>
              <p className="text-sm text-champagne">Done when: {f.doneWhen}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="4. Screens and steps">
        <div className="space-y-4">
          {pack.screens.map((s) => (
            <div key={s.name}>
              <p className="text-pearl">{s.name}</p>
              <p className="text-sm text-champagne">{s.purpose}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-pearl/90">
                {s.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Block>

      <Block title="5. What it remembers">
        <ul className="space-y-2 text-sm">
          {pack.remembers.map((m) => (
            <li key={m.item}>
              <span className="text-pearl">{m.item}:</span> <span className="text-champagne">{m.details} Seen by: {m.whoSees}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="6. Boundaries">
        <List items={pack.boundaries.askBefore} label="Ask before" />
        <List items={pack.boundaries.never} label="Never" />
        <List items={pack.boundaries.privacy} label="Privacy" />
      </Block>

      <Block title="7. Edge cases">
        <List items={pack.edgeCases} />
      </Block>

      <Block title="8. Stranger checks">
        <p className="text-sm text-champagne">A first-time person with no setup must be able to:</p>
        <List items={pack.strangerChecks} />
        <p className="mt-4 text-sm text-champagne">
          Once it is built, run these the way a stranger would at{' '}
          <a href="https://apphole.pro" className="text-gold-bright underline-offset-2 hover:underline">
            AppHole.pro
          </a>
          .
        </p>
      </Block>

      <Block title="9. Paste-ready build prompts">
        <div className="space-y-4">
          {pack.prompts.map((p) => (
            <div key={p.builder} className="rounded-2xl border border-[rgba(232,176,32,0.15)] bg-void p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-pearl">{p.builder}</p>
                <button type="button" className="btn-ghost !px-4 !py-1.5 text-xs" onClick={() => void copy(p.builder, p.prompt)}>
                  {copied === p.builder ? 'Copied' : 'Copy prompt'}
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-champagne">{p.prompt}</pre>
            </div>
          ))}
        </div>
      </Block>

      <Block title="10. First week">
        <p className="text-sm text-pearl">Signal it is working: <span className="text-champagne">{pack.firstWeek.signal}</span></p>
        <p className="mt-2 text-sm text-pearl">Stop if: <span className="text-champagne">{pack.firstWeek.stopIf}</span></p>
        <p className="mt-2 text-sm text-pearl">Then: <span className="text-champagne">{pack.firstWeek.next}</span></p>
      </Block>

      <p className="text-sm text-champagne">
        If your builder cannot start from this, email {SUPPORT_EMAIL} within 14 days for a full refund.
      </p>
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel-quiet p-5">
      <h2 className="text-xl font-semibold text-pearl">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function List({ items, label }: { items: string[]; label?: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      {label ? <p className="text-sm text-gold-bright">{label}</p> : null}
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-pearl/90">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
