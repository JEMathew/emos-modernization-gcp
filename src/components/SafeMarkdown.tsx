import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol === 'https:' || parsed.protocol === 'mailto:') return url;
  } catch {
    // Invalid and relative model-generated URLs are not rendered as links.
  }
  return '';
}

export function SafeMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      skipHtml
      urlTransform={safeUrl}
      components={{
        img: ({ alt }) => <span>{alt || '[image removed]'}</span>,
        a: ({ href, children: linkChildren }) => href
          ? <a href={href} rel="noopener noreferrer" target="_blank">{linkChildren}</a>
          : <span>{linkChildren as ReactNode}</span>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
