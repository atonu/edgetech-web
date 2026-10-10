'use client';

import DOMPurify from 'isomorphic-dompurify';

interface RichTextContentProps {
  html: string;
  className?: string;
}

export default function RichTextContent({ html, className }: RichTextContentProps) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code', 'pre',
      'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['colspan', 'rowspan', 'scope', 'data-borderless'],
    ALLOW_DATA_ATTR: false,
  });

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}