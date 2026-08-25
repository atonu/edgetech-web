<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Theming & Contrast Guardrails
- **Design Tokens**: Always use CSS variables from `globals.css` (`var(--color-text)`, `var(--color-text-muted)`, `var(--color-surface)`, `var(--color-primary)`).
- **No Hardcoded Hex Colors**: Never use hardcoded light hex colors (`#fff`, `#e2e8f0`) or dark hex colors (`#000`, `#111`) for text or container surfaces without theme scoping.
- **Dual-Theme Verification**: All UI components, tables, badges, and callout boxes must have clear, high-contrast readability in both Light Mode (`[data-theme='light']`) and Dark Mode.
