import { describe, expect, it } from 'vitest';
import { demoSolutions, generateDemoApp, generateDemoBlueprint, generateDemoBuildTasks } from './demo-data';
import { generateDemoApp as createApp } from './generated-app';

const brief = { summary: 'A test problem', affectedUsers: ['A family'], currentWorkaround: 'Memory', friction: 'Unclear status', desiredOutcome: 'A visible status', privacySensitivity: 'low' as const, confidence: 0.9 };

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
    const app = createApp(demoSolutions[0]);
    expect(app.entryFile).toBe('src/App.tsx');
    expect(app.files[0].contents).toContain('I fed the dog');
  });
});
