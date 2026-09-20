import { describe, expect, it } from 'vitest';
import { demoSolutions, generateDemoBlueprint } from './demo-data';
import {
  applyChangeToArtifacts,
  applyRefinement,
  classifyChangeRequest,
  createChangeRequest,
  createInitialPreviewVersion,
  undoVersion,
} from './refine';
import { generateDemoApp } from './generated-app';

const brief = {
  summary: 'A family needs a simple feeding status.',
  affectedUsers: ['A family'],
  currentWorkaround: 'Memory',
  friction: 'Unclear status',
  desiredOutcome: 'A visible status',
  privacySensitivity: 'low' as const,
  confidence: 0.9,
};

const solution = demoSolutions[0];

describe('change classification', () => {
  it('classifies copy, layout, data, new capability, preview-only, and blueprint changes', () => {
    expect(classifyChangeRequest('Call it CareLog.').changeClass).toBe('copy');
    expect(classifyChangeRequest('Make the main button even larger.').changeClass).toBe('layout');
    expect(classifyChangeRequest('Remember who fed the dog.').changeClass).toBe('data');
    expect(classifyChangeRequest('Add reminder nudges.').changeClass).toBe('new_capability');
    expect(classifyChangeRequest('Rebuild the preview.').changeClass).toBe('rebuild_preview_only');
    expect(classifyChangeRequest('Keep this private to one caregiver.').changeClass).toBe('blueprint_touching');
  });

  it('does not mark copy or layout as blueprint-touching', () => {
    expect(classifyChangeRequest('Rename the heading to CareLog.').affectsBlueprint).toBe(false);
    expect(classifyChangeRequest('Make the main button even larger.').affectsBlueprint).toBe(false);
    expect(classifyChangeRequest('Rebuild the preview.').affectsBlueprint).toBe(false);
  });
});

describe('blueprint artifact updates', () => {
  it('leaves artifacts unchanged for copy and layout', () => {
    const artifacts = generateDemoBlueprint(solution, brief);
    const copyRequest = createChangeRequest('Call it CareLog.', 'change-copy');
    const layoutRequest = createChangeRequest('Make the main button even larger.', 'change-layout');
    expect(applyChangeToArtifacts(artifacts, copyRequest).updatedTypes).toEqual([]);
    expect(applyChangeToArtifacts(artifacts, layoutRequest).artifacts).toEqual(artifacts);
  });

  it('updates data artifacts and marks later plan items stale', () => {
    const artifacts = generateDemoBlueprint(solution, brief);
    const request = createChangeRequest('Remember who fed the dog.', 'change-data');
    const result = applyChangeToArtifacts(artifacts, request);
    expect(result.updatedTypes).toEqual(['data_model', 'feature_spec', 'acceptance_criteria']);
    const dataModel = result.artifacts.find((artifact) => artifact.type === 'data_model');
    const architecture = result.artifacts.find((artifact) => artifact.type === 'system_architecture');
    expect(dataModel?.plainLanguageSummary).toContain('Remember who fed the dog.');
    expect(dataModel?.status).toBe('ready');
    expect(architecture?.status).toBe('stale');
  });

  it('updates scope artifacts when a new capability is added', () => {
    const artifacts = generateDemoBlueprint(solution, brief);
    const request = createChangeRequest('Add reminder nudges.', 'change-capability');
    const result = applyChangeToArtifacts(artifacts, request);
    expect(result.updatedTypes).toContain('mvp_scope');
    expect(result.updatedTypes).toContain('feature_spec');
    expect(result.artifacts.find((artifact) => artifact.type === 'mvp_scope')?.plainLanguageSummary).toContain('reminder nudges');
  });
});

describe('preview rebuild and undo', () => {
  it('rebuilds the preview to reflect copy and layout refinements', () => {
    const copyApp = generateDemoApp(solution, [{ changeClass: 'copy', text: 'Call it CareLog.' }]);
    const layoutApp = generateDemoApp(solution, [{ changeClass: 'layout', text: 'Make the main button even larger.' }]);
    expect(copyApp.name).toBe('CareLog');
    expect(copyApp.previewHtml).toContain('CareLog');
    expect(layoutApp.previewHtml).toContain('min-height:88px');
    expect(layoutApp.files[0].contents).toContain('I fed the dog');
  });

  it('applies a change, then undo restores the previous artifacts and preview', () => {
    const artifacts = generateDemoBlueprint(solution, brief);
    const app = generateDemoApp(solution);
    const initial = createInitialPreviewVersion(artifacts, app, solution, '2026-09-20T18:00:00.000Z');
    const applied = applyRefinement({
      text: 'Remember who fed the dog.',
      artifacts,
      app,
      solution,
      changeRequests: [],
      versions: [initial],
      currentVersionIndex: 0,
      now: new Date('2026-09-20T18:01:00.000Z'),
    });

    expect(applied.versions).toHaveLength(2);
    expect(applied.request.changeClass).toBe('data');
    expect(applied.app.previewHtml).toContain('Who did this?');
    expect(applied.artifacts.find((artifact) => artifact.type === 'data_model')?.plainLanguageSummary).toContain('Remember who fed the dog.');

    const undone = undoVersion(applied.versions, applied.currentVersionIndex);
    expect(undone).not.toBeNull();
    expect(undone?.app.name).toBe(app.name);
    expect(undone?.app.previewHtml).not.toContain('Who did this?');
    expect(undone?.artifacts.find((artifact) => artifact.type === 'data_model')?.plainLanguageSummary).toBe(
      artifacts.find((artifact) => artifact.type === 'data_model')?.plainLanguageSummary,
    );
  });
});
