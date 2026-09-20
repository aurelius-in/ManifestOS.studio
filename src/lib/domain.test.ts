import { describe, expect, it } from 'vitest';
import { demoSolutions, generateDemoBlueprint, generateDemoBuildTasks } from './demo-data';
import { generateDemoApp } from './generated-app';
import { makeProblemRecord, searchCommons, similarity, slugifyProblem } from './commons';
import { DEFAULT_PROBLEM } from './copy';

const brief = {
  summary: 'A test problem',
  affectedUsers: ['A family'],
  currentWorkaround: 'Memory',
  friction: 'Unclear status',
  desiredOutcome: 'A visible status',
  privacySensitivity: 'low' as const,
  confidence: 0.9,
};

describe('architecture-first demo pipeline', () => {
  it('creates the complete ordered Blueprint', () => {
    const artifacts = generateDemoBlueprint(demoSolutions[0], brief);
    expect(artifacts).toHaveLength(17);
    expect(artifacts[0].type).toBe('problem_brief');
    expect(artifacts[16].type).toBe('build_task_graph');
  });

  it('creates build tasks in dependency order', () => {
    const tasks = generateDemoBuildTasks(demoSolutions[0]);
    expect(tasks[0].dependsOn).toEqual([]);
    expect(tasks[1].dependsOn).toEqual(['foundation']);
    expect(tasks.at(-1)?.dependsOn).toEqual(['validation']);
  });

  it('creates a runnable constrained preview app from a selected solution', () => {
    const app = generateDemoApp(demoSolutions[0]);
    expect(app.entryFile).toBe('src/App.tsx');
    expect(app.files[0].contents).toContain('I fed the dog');
    expect(app.previewHtml).toContain('I fed the dog');
  });
});

describe('problem commons', () => {
  it('keeps the dog-feeding example as a problem, not an app project name', () => {
    const record = makeProblemRecord(DEFAULT_PROBLEM);
    expect(record.statement).toBe(DEFAULT_PROBLEM);
    expect(record.slug).toBe('dad-dog-feeding');
    expect(record.statement.toLowerCase()).not.toContain('dog feeding app');
  });

  it('finds similar seeded problems without inventing a large network', () => {
    const result = searchCommons(DEFAULT_PROBLEM);
    expect(result.matches[0]?.problem.slug).toBe('dad-dog-feeding');
    expect(result.matches[0]?.solutions.length).toBeGreaterThan(0);
    expect(result.matches[0]?.problem.peopleWithThisProblem).toBeLessThan(20);
    expect(result.peopleWithSimilarProblems).toBeLessThan(50);
  });

  it('stays quiet when a problem is unlike the seeded commons', () => {
    expect(similarity('I need a recipe for pickled herring', DEFAULT_PROBLEM)).toBeLessThan(0.12);
    expect(searchCommons('I need a recipe for pickled herring').matches).toHaveLength(0);
  });

  it('slugifies ordinary language into a shareable problem url fragment', () => {
    expect(slugifyProblem(DEFAULT_PROBLEM).startsWith('my-elderly-dad-cant-reliably-remember')).toBe(true);
  });
});
