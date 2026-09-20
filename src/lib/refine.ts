import {
  ARTIFACT_DEPENDENCY_ORDER,
  ArtifactType,
  BlueprintArtifact,
  ChangeClass,
  ChangeClassification,
  ChangeRequest,
  GeneratedApp,
  ProjectVersion,
  SolutionProposal,
} from './domain';
import { generateDemoApp } from './generated-app';

const CLASS_LABELS: Record<ChangeClass, string> = {
  copy: 'Copy change',
  layout: 'Layout change',
  data: 'Data change',
  new_capability: 'New capability',
  rebuild_preview_only: 'Preview rebuild only',
  blueprint_touching: 'Blueprint change',
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function blueprintTypesForRequest(text: string): ArtifactType[] {
  const types = new Set<ArtifactType>();
  if (includesAny(text, ['privacy', 'private to', 'security'])) {
    types.add('privacy_security');
    types.add('problem_brief');
  }
  if (includesAny(text, ['architecture', 'system design', 'runtime'])) {
    types.add('system_architecture');
    types.add('architecture_decision');
  }
  if (includesAny(text, ['user', 'caregiver', 'household', 'family', 'who is this for'])) {
    types.add('jobs_to_be_done');
    types.add('problem_brief');
  }
  if (includesAny(text, ['scope', 'plan', 'blueprint', 'not yet', 'non-goal'])) {
    types.add('solution_brief');
    types.add('mvp_scope');
    types.add('feature_spec');
  }
  if (types.size === 0) {
    types.add('solution_brief');
    types.add('mvp_scope');
    types.add('feature_spec');
    types.add('system_architecture');
  }
  return ARTIFACT_DEPENDENCY_ORDER.filter((type) => types.has(type));
}

export function classifyChangeRequest(text: string): ChangeClassification {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();

  if (includesAny(normalized, ['rebuild the preview', 'refresh the preview', 'regenerate the preview', 'preview only', 'just rebuild'])) {
    return {
      changeClass: 'rebuild_preview_only',
      label: CLASS_LABELS.rebuild_preview_only,
      reason: 'This only asks to rebuild the current preview, so the plan stays as-is.',
      affectsBlueprint: false,
      affectedArtifactTypes: [],
    };
  }

  if (includesAny(normalized, ['architecture', 'blueprint', 'privacy', 'private to', 'security', 'change the plan', 'scope', 'system design', 'different users', 'not a household'])) {
    const affectedArtifactTypes = blueprintTypesForRequest(normalized);
    return {
      changeClass: 'blueprint_touching',
      label: CLASS_LABELS.blueprint_touching,
      reason: 'This changes requirements or architecture, so the hidden plan updates first.',
      affectsBlueprint: true,
      affectedArtifactTypes,
    };
  }

  if (includesAny(normalized, ['remind', 'notif', 'export', 'new feature', 'also track', 'multiple pet', 'capability', 'share with'])) {
    return {
      changeClass: 'new_capability',
      label: CLASS_LABELS.new_capability,
      reason: 'This adds a capability, so scope, flows, and the build plan need to move with it.',
      affectsBlueprint: true,
      affectedArtifactTypes: ['mvp_scope', 'feature_spec', 'user_flows', 'implementation_plan', 'build_task_graph'],
    };
  }

  if (
    includesAny(normalized, ['remember', 'persist', 'history', 'timestamp', 'who fed', 'who did', 'data model', 'field for']) ||
    /\b(log|record|store|who)\b/.test(normalized)
  ) {
    return {
      changeClass: 'data',
      label: CLASS_LABELS.data,
      reason: 'This changes what the solution remembers, so the data model and related specs update.',
      affectsBlueprint: true,
      affectedArtifactTypes: ['data_model', 'feature_spec', 'acceptance_criteria'],
    };
  }

  if (includesAny(normalized, ['title', 'heading', 'wording', 'label', 'rename', 'call it', 'copy', 'named', 'say '])) {
    return {
      changeClass: 'copy',
      label: CLASS_LABELS.copy,
      reason: 'This is a wording change. The plan stays the same and only the preview is rebuilt.',
      affectsBlueprint: false,
      affectedArtifactTypes: [],
    };
  }

  if (includesAny(normalized, ['larger', 'smaller', 'bigger', 'button', 'layout', 'spacing', 'color', 'font', 'mobile', 'padding', 'size'])) {
    return {
      changeClass: 'layout',
      label: CLASS_LABELS.layout,
      reason: 'This is a layout or visual change. The plan stays the same and only the preview is rebuilt.',
      affectsBlueprint: false,
      affectedArtifactTypes: [],
    };
  }

  if (/\badd\b/.test(normalized)) {
    return {
      changeClass: 'new_capability',
      label: CLASS_LABELS.new_capability,
      reason: 'This asks to add something new, so the plan is updated before rebuild.',
      affectsBlueprint: true,
      affectedArtifactTypes: ['mvp_scope', 'feature_spec', 'user_flows', 'implementation_plan', 'build_task_graph'],
    };
  }

  const affectedArtifactTypes = blueprintTypesForRequest(normalized);
  return {
    changeClass: 'blueprint_touching',
    label: CLASS_LABELS.blueprint_touching,
    reason: 'The change may affect the plan, so those artifacts are reviewed before the preview rebuilds.',
    affectsBlueprint: true,
    affectedArtifactTypes,
  };
}

export function createChangeRequest(text: string, id: string, createdAt = new Date().toISOString()): ChangeRequest {
  return {
    id,
    text: text.trim(),
    createdAt,
    ...classifyChangeRequest(text),
  };
}

export function applyChangeToArtifacts(artifacts: BlueprintArtifact[], request: ChangeRequest): {
  artifacts: BlueprintArtifact[];
  updatedTypes: ArtifactType[];
} {
  if (!request.affectsBlueprint || request.affectedArtifactTypes.length === 0) {
    return { artifacts: clone(artifacts), updatedTypes: [] };
  }

  const affected = new Set(request.affectedArtifactTypes);
  const earliest = Math.min(
    ...request.affectedArtifactTypes.map((type) => ARTIFACT_DEPENDENCY_ORDER.indexOf(type)).filter((index) => index >= 0),
  );

  const next = artifacts.map((artifact) => {
    const orderIndex = ARTIFACT_DEPENDENCY_ORDER.indexOf(artifact.type);
    if (affected.has(artifact.type)) {
      return {
        ...artifact,
        status: 'ready' as const,
        plainLanguageSummary: `${artifact.plainLanguageSummary} Updated after refinement: ${request.text}`,
        technicalDetail: `${artifact.technicalDetail} Classified as ${request.label}. ${request.reason}`,
      };
    }
    if (orderIndex > earliest) {
      return { ...artifact, status: 'stale' as const };
    }
    return { ...artifact };
  });

  return { artifacts: next, updatedTypes: request.affectedArtifactTypes };
}

export function createProjectVersion(input: {
  versionNumber: number;
  label: string;
  changeRequest: ChangeRequest | null;
  changeRequests: ChangeRequest[];
  artifacts: BlueprintArtifact[];
  app: GeneratedApp;
  solution: SolutionProposal;
  createdAt?: string;
}): ProjectVersion {
  return {
    id: `version-${input.versionNumber}`,
    versionNumber: input.versionNumber,
    label: input.label,
    createdAt: input.createdAt || new Date().toISOString(),
    changeRequest: input.changeRequest ? clone(input.changeRequest) : null,
    changeRequests: clone(input.changeRequests),
    artifacts: clone(input.artifacts),
    app: clone(input.app),
    solution: clone(input.solution),
  };
}

export function createInitialPreviewVersion(
  artifacts: BlueprintArtifact[],
  app: GeneratedApp,
  solution: SolutionProposal,
  createdAt = new Date().toISOString(),
): ProjectVersion {
  return createProjectVersion({
    versionNumber: 1,
    label: 'Initial preview',
    changeRequest: null,
    changeRequests: [],
    artifacts,
    app,
    solution,
    createdAt,
  });
}

export function applyRefinement(input: {
  text: string;
  artifacts: BlueprintArtifact[];
  app: GeneratedApp;
  solution: SolutionProposal;
  changeRequests: ChangeRequest[];
  versions: ProjectVersion[];
  currentVersionIndex: number;
  now?: Date;
}): {
  request: ChangeRequest;
  artifacts: BlueprintArtifact[];
  app: GeneratedApp;
  changeRequests: ChangeRequest[];
  versions: ProjectVersion[];
  currentVersionIndex: number;
  updatedTypes: ArtifactType[];
} {
  const now = input.now || new Date();
  const request = createChangeRequest(input.text, `change-${now.getTime()}`, now.toISOString());

  let versions = input.versions.map((version) => clone(version));
  let currentVersionIndex = input.currentVersionIndex;

  if (versions.length === 0) {
    versions = [createInitialPreviewVersion(input.artifacts, input.app, input.solution, now.toISOString())];
    currentVersionIndex = 0;
  } else {
    versions = versions.slice(0, currentVersionIndex + 1);
  }

  const { artifacts, updatedTypes } = applyChangeToArtifacts(input.artifacts, request);
  const changeRequests = [...clone(input.changeRequests), request];
  const app = generateDemoApp(input.solution, changeRequests);
  const version = createProjectVersion({
    versionNumber: versions.length + 1,
    label: request.label,
    changeRequest: request,
    changeRequests,
    artifacts,
    app,
    solution: input.solution,
    createdAt: now.toISOString(),
  });

  versions.push(version);

  return {
    request,
    artifacts,
    app,
    changeRequests,
    versions,
    currentVersionIndex: versions.length - 1,
    updatedTypes,
  };
}

export function restoreVersion(versions: ProjectVersion[], index: number) {
  const version = versions[index];
  if (!version) return null;
  return {
    artifacts: clone(version.artifacts),
    app: clone(version.app),
    solution: clone(version.solution),
    changeRequests: clone(version.changeRequests),
    currentVersionIndex: index,
  };
}

export function undoVersion(versions: ProjectVersion[], currentVersionIndex: number) {
  if (currentVersionIndex <= 0) return null;
  return restoreVersion(versions, currentVersionIndex - 1);
}
