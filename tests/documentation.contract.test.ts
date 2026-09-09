import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readRepositoryFile = (path: string) =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('Ideathon evidence documentation', () => {
  it('links the evidence pack and security constitution from the README', () => {
    const readme = readRepositoryFile('README.md');

    expect(readme).toContain('docs/IDEATHON_DELIVERABLES.md');
    expect(readme).toContain('docs/AI_STUDIO_SECURITY_CONSTITUTION.md');
    expect(readme).toContain('docs/EVIDENCE_INDEX.md');
  });

  it('covers every required security and product boundary in the AI Studio constitution', () => {
    const constitution = readRepositoryFile('docs/AI_STUDIO_SECURITY_CONSTITUTION.md');
    const normalized = constitution.toLowerCase();

    expect(normalized).toContain('trust boundaries');
    expect(constitution).toContain('Firebase Authentication');
    expect(constitution).toContain('request.auth.uid == userId');
    expect(constitution).toContain('Google Cloud Secret Manager');
    expect(constitution).toContain('model output as untrusted');
    expect(constitution).toContain('no unresolved critical evidence gaps');
  });

  it('maps every challenge requirement and keeps external proof explicitly pending', () => {
    const deliverables = readRepositoryFile('docs/IDEATHON_DELIVERABLES.md');

    for (const requirement of [
      'Google AI Studio security directives',
      'Firebase authentication',
      'Multi-turn Gemini interaction',
      'Isolated Cloud Firestore storage',
      'Google Cloud Secret Manager',
      'Original feature enhancement',
    ]) {
      expect(deliverables).toContain(requirement);
    }

    expect(deliverables).toContain('deployed binding evidence pending');
    expect(deliverables).toContain('Sanitized Custom Instructions screenshot captured.');
  });

  it('does not preserve the stale permanent test-count claim', () => {
    const evidenceIndex = readRepositoryFile('docs/EVIDENCE_INDEX.md');

    expect(evidenceIndex).not.toContain('42 passing');
    expect(evidenceIndex).toContain('dated results are recorded');
  });
});
