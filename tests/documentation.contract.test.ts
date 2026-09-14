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
    expect(readme).toContain('claude/messaging-source.md');
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

  it('maps every challenge requirement and distinguishes verified from pending external proof', () => {
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

    expect(deliverables).toContain('deployed `secretKeyRef` and runtime IAM externally verified');
    expect(deliverables).toContain('least-privilege cleanup pending');
    expect(deliverables).toContain('Durable sanitized Custom Instructions screenshot retained');
    expect(deliverables).toContain('dev-tutorial=cloud-run-ai-challenge');
  });

  it('does not preserve the stale permanent test-count claim', () => {
    const evidenceIndex = readRepositoryFile('docs/EVIDENCE_INDEX.md');

    expect(evidenceIndex).not.toContain('42 passing');
    expect(evidenceIndex).toContain('dated results are recorded');
  });

  it('keeps the canonical messaging source resolved and capability-honest', () => {
    const messaging = readRepositoryFile('claude/messaging-source.md');
    const normalized = messaging.replace(/\s+/g, ' ');

    expect(messaging).toContain('Founder experience: **15+ years**');
    expect(normalized).toContain('AI-Native Modernization, Governed by Evidence—From First Signal to Proven Outcome.');
    expect(normalized).toContain('EMOS is designed to govern the full enterprise modernization lifecycle—from business alignment and estate discovery through evidence-based decisions and planning, into governed execution, validation, transition to live operations, measured benefits, learning and reassessment.');
    expect(normalized).toContain('Beta v1.0 delivers the evidence, decision and planning foundation today');
    expect(normalized).toContain('The authoritative lifecycle contains fifteen stages.');
    expect(normalized).toContain('designed to remain model-agnostic');
    expect(normalized).toContain('The current beta does not execute migrations');
    expect(messaging).not.toContain('[RESOLVE');
    expect(messaging).not.toContain('What none of them produces');
  });

  it('publishes one search description and accurate entity metadata', () => {
    const index = readRepositoryFile('index.html');

    expect(index.match(/<meta name="description"/g)).toHaveLength(1);
    expect(index).toContain('<link rel="canonical" href="https://emos-modernization.ai.studio/" />');
    expect(index).toContain('"@type": "Organization"');
    expect(index).toContain('"@type": "WebApplication"');
    expect(index).toContain('"isAccessibleForFree": true');
    expect(index).toContain('EMOS | AI-Native Enterprise Modernization');
    expect(index).toContain('AI-Native Modernization, Governed by Evidence—From First Signal to Proven Outcome.');
    expect(index).not.toContain('6R Execution Platform');
  });

  it('keeps the introduction undated and aligned with the canonical beta boundary', () => {
    const srt = readRepositoryFile('docs/demo/EMOS-Beta-Introduction.srt');
    const vtt = readRepositoryFile('docs/demo/EMOS-Beta-Introduction.vtt');

    for (const captions of [srt, vtt]) {
      expect(captions).toContain('designed to govern the entire');
      expect(captions).toContain('Beta v1.0 delivers the evidence, decision, and planning foundation today.');
      expect(captions).not.toContain('Today, September');
      expect(captions).not.toContain('decision-intelligence foundation for continuous');
    }
  });
});
