import { activityGate } from "@/lib/activity-gate";
import { loadActivity } from "@/lib/activity-log";
import { getMany, listKeys } from "@/lib/blob-store";
import {
  ACTIVITY_RANGES,
  buildActivityStats,
  parseActivityRange,
  rangeStartMs,
  type ActivityRange,
  type ActivityStats,
} from "@/lib/activity-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity", robots: { index: false, follow: false } };

type SearchParams = Promise<{ key?: string; range?: string }>;

export default async function ActivityPage({ searchParams }: { searchParams: SearchParams }) {
  const { key, range: rangeRaw } = await searchParams;
  const gate = activityGate(key);
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24 text-center">
        <p className="gold-label">ManifestOS</p>
        <h1 className="mt-3 text-3xl font-semibold text-pearl">Activity</h1>
        <p className="mt-3 text-sm text-champagne">
          {gate.reason === "unconfigured"
            ? "Set ACTIVITY_ADMIN_SECRET, then open this page with ?key= that secret."
            : "Add the activity key: /ops/activity?key=YOUR_SECRET"}
        </p>
      </main>
    );
  }
  const range = parseActivityRange(rangeRaw);
  const [events, waitlist] = await Promise.all([loadActivity(rangeStartMs(range)), loadWaitlist()]);
  const stats = buildActivityStats(events, range);
  return <Board stats={stats} adminKey={key || ""} waitlist={waitlist} />;
}

type WaitlistRow = { email: string; kind: string; context: string; at: string };

async function loadWaitlist(): Promise<WaitlistRow[]> {
  const keys = await listKeys("waitlist/", 200);
  const rows = await getMany<WaitlistRow>(keys);
  return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 60);
}

function Board({ stats, adminKey, waitlist }: { stats: ActivityStats; adminKey: string; waitlist: WaitlistRow[] }) {
  const href = (range: ActivityRange) => {
    const params = new URLSearchParams();
    if (adminKey) params.set("key", adminKey);
    params.set("range", range);
    return `/ops/activity?${params.toString()}`;
  };
  const max = Math.max(...stats.funnel.map((step) => step.sessions), 1);

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="text-center">
          <p className="gold-label">ManifestOS.studio</p>
          <h1 className="mt-3 text-4xl font-semibold text-pearl">Activity</h1>
          <p className="mt-2 text-sm text-champagne">
            {stats.rangeLabel} · what was read, how long, and where the problem path stops · {new Date(stats.checkedAt).toLocaleString()}
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-2">
          {ACTIVITY_RANGES.map((item) => (
            <a
              key={item.id}
              href={href(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm ${stats.range === item.id ? "bg-gold-primary text-void" : "border border-[rgba(232,176,32,0.28)] text-champagne"}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <section className="panel p-5">
          <p className="gold-label">{stats.rangeLabel} snapshot</p>
          <p className="mt-3 text-pearl">{stats.headline}</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Visitors" value={stats.visitors} />
          <Stat label="Sessions" value={stats.sessions} />
          <Stat label="Page views" value={stats.pageViews} />
          <Stat label="Typical session" value={stats.medianSessionLabel} />
        </div>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-pearl">Money</h2>
          <p className="mt-1 text-sm text-champagne">The paid path: Blueprint offer, checkout, and the Keep waitlist that tells us whether to build it.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Saw the Blueprint offer" value={stats.money.offerViews} />
            <Stat label="Clicked to buy" value={stats.money.checkoutClicks} />
            <Stat label="Blueprints bought" value={stats.money.blueprintsPaid} />
            <Stat label="Pricing page" value={stats.money.pricingViews} />
            <Stat label="Blueprint waitlist" value={stats.money.waitlist.blueprint} />
            <Stat label="Keep waitlist" value={stats.money.waitlist.keep} />
            <Stat label="Follow a problem" value={stats.money.waitlist.problem} />
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-pearl">Emails collected</h2>
          <p className="mt-1 text-sm text-champagne">Newest first, all time. Blueprint and Keep are people asking to pay. Follow is people who care about a problem.</p>
          {waitlist.length === 0 ? (
            <p className="mt-4 text-sm text-champagne">No emails yet.</p>
          ) : (
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-champagne">
                <tr>
                  <th className="py-1">When</th>
                  <th>List</th>
                  <th>Email</th>
                  <th>About</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((row) => (
                  <tr key={`${row.at}-${row.email}`} className="border-t border-[rgba(232,176,32,0.12)] align-top text-pearl">
                    <td className="py-2 pr-3 text-xs text-champagne">{new Date(row.at).toLocaleDateString()}</td>
                    <td className="pr-3">{row.kind}</td>
                    <td className="pr-3">{row.email}</td>
                    <td className="text-champagne">{row.context.slice(0, 120)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-pearl">How far a problem travels</h2>
          <p className="mt-1 text-sm text-champagne">Sessions that actually did each step. There is no account step on purpose.</p>
          <ul className="mt-5 space-y-3">
            {stats.funnel.map((step) => (
              <li key={step.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-pearl">{step.label}</span>
                  <span className="tabular-nums text-champagne">
                    {step.sessions}
                    {step.continuePct === null ? "" : ` · ${step.continuePct}% continued`}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-void">
                  <div className="h-full rounded-full bg-gold-primary" style={{ width: `${Math.max(4, (step.sessions / max) * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-champagne">{step.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-pearl">Where they stopped</h2>
            <p className="mt-1 text-sm text-champagne">Furthest step. This is the drop-off.</p>
            {stats.stops.length === 0 ? (
              <p className="mt-4 text-sm text-champagne">No sessions yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-[rgba(232,176,32,0.12)]">
                {stats.stops.map((row) => (
                  <li key={row.key} className="flex justify-between py-2 text-sm text-pearl">
                    <span>{row.label}</span>
                    <span className="tabular-nums text-gold-bright">
                      {row.sessions}
                      {row.sharePct === null ? "" : ` · ${row.sharePct}%`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-pearl">Commitment</h2>
            <p className="mt-1 text-sm text-champagne">A problem, a join, or the studio. Not an account.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Problem box focused" value={stats.commitment.problemFocused} />
              <Stat label="Problem submitted" value={stats.commitment.problemSubmitted} />
              <Stat label="I have this too" value={stats.commitment.saidToo} />
              <Stat label="Studio opened" value={stats.commitment.studioOpened} />
              <Stat label="Reached a plan" value={stats.commitment.reachedPlan} />
              <Stat label="Reached software" value={stats.commitment.reachedSoftware} />
              <Stat label="Signup started" value={stats.signups.started} hint="No signup exists yet. This stays at zero until one does." />
            </div>
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-pearl">Studio stages</h2>
            <p className="mt-1 text-sm text-champagne">Time is how long they stayed on that stage before moving.</p>
            {stats.stages.length === 0 ? (
              <p className="mt-4 text-sm text-champagne">No studio sessions yet.</p>
            ) : (
              <table className="mt-4 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-champagne">
                  <tr>
                    <th className="py-1">Stage</th>
                    <th>Sessions</th>
                    <th>Median</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.stages.map((row) => (
                    <tr key={row.stage} className="border-t border-[rgba(232,176,32,0.12)] text-pearl">
                      <td className="py-2">{row.stage}</td>
                      <td className="tabular-nums">{row.sessions}</td>
                      <td className="tabular-nums text-champagne">{row.medianDwellLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-pearl">Pages and time</h2>
            {stats.pages.length === 0 ? (
              <p className="mt-4 text-sm text-champagne">No page views yet.</p>
            ) : (
              <table className="mt-4 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-champagne">
                  <tr>
                    <th className="py-1">Page</th>
                    <th>Views</th>
                    <th>Median</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pages.map((page) => (
                    <tr key={page.path} className="border-t border-[rgba(232,176,32,0.12)] text-pearl">
                      <td className="py-2">{page.path}</td>
                      <td className="tabular-nums">{page.views}</td>
                      <td className="tabular-nums text-champagne">{page.medianDwellLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-pearl">Sections reached</h2>
            {stats.sections.length === 0 ? (
              <p className="mt-4 text-sm text-champagne">No section views yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-[rgba(232,176,32,0.12)]">
                {stats.sections.map((row) => (
                  <li key={row.name} className="flex justify-between py-2 text-sm text-pearl">
                    <span>{row.name}</span>
                    <span className="text-gold-bright">{row.sessions}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="panel p-5">
            <h2 className="text-lg font-semibold text-pearl">Where they came from</h2>
            {stats.sources.length === 0 ? (
              <p className="mt-4 text-sm text-champagne">No sessions yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-[rgba(232,176,32,0.12)]">
                {stats.sources.map((row) => (
                  <li key={row.source} className="flex justify-between py-2 text-sm text-pearl">
                    <span>{row.source}</span>
                    <span className="text-gold-bright">{row.sessions}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-pearl">What stands out</h2>
          <ul className="mt-4 space-y-3">
            {stats.insights.map((tip) => (
              <li key={tip.title}>
                <p className={`font-semibold ${tip.severity === "critical" ? "text-gold-bright" : "text-pearl"}`}>{tip.title}</p>
                <p className="mt-1 text-sm text-champagne">{tip.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-pearl">Recent sessions</h2>
          {stats.recent.length === 0 ? (
            <p className="mt-4 text-sm text-champagne">No sessions yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[rgba(232,176,32,0.12)]">
              {stats.recent.map((row) => (
                <li key={`${row.id}-${row.when}`} className="py-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-pearl">{row.stopped}</span>
                    <span className="text-xs text-champagne">
                      {row.when} · {row.durationLabel} · {row.source}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-champagne">{row.trail}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="panel-quiet p-3">
      <p className="text-2xl font-semibold tabular-nums text-gold-bright">{value}</p>
      <p className="mt-1 text-xs text-champagne">{label}</p>
      {hint ? <p className="mt-1 text-[11px] leading-snug text-champagne/80">{hint}</p> : null}
    </div>
  );
}
