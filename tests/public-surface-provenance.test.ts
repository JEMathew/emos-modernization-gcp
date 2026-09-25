import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const collectTextFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectTextFiles(entryPath);
    return /\.(?:html|json|md|srt|svg|ts|tsx|vtt)$/i.test(entry.name) ? [entryPath] : [];
  });

const PUBLIC_TEXT_FILES = [
  'README.md',
  'index.html',
  'metadata.json',
  'claude/messaging-source.md',
  'docs/AI_STUDIO_SECURITY_CONSTITUTION.md',
  'docs/EVIDENCE_INDEX.md',
  ...collectTextFiles('src'),
  ...collectTextFiles('public'),
  ...collectTextFiles('docs/demo'),
  ...collectTextFiles('docs/learning'),
];

const EVENT_PROVENANCE = /ideathon|idea[- ]thon|hackathon|hack[- ]a[- ]thon|competition entry|event (?:entry|submission|demonstration|prototype)|judg(?:e|es|ing)|jury/i;

describe('public-surface product provenance', () => {
  it.each(PUBLIC_TEXT_FILES)('%s contains no event-origin positioning', (relativePath) => {
    const content = fs.readFileSync(path.resolve(relativePath), 'utf8');
    expect(content).not.toMatch(EVENT_PROVENANCE);
  });
});
