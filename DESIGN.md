# Northstar Design System

## Philosophy

Northstar is one communication workspace with two deliberately different modes. Mail is formal, persistent, document-oriented, and optimized for scanning. Chat is immediate, internal, and conversational. Shared navigation and identity connect the modes without merging their timelines.

## Tokens

Semantic tokens live in `app/globals.css`: `--background`, `--foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--accent`, `--destructive`, `--ring`, and `--radius`. Components should use semantic variables or the existing Tailwind aliases instead of arbitrary color values.

The default palette is near-white, near-black, neutral gray, and restrained professional red. Red is reserved for identity, primary actions, unread emphasis, important labels, and focus.

## Typography and Spacing

Inter is used for a compact enterprise interface. Use the existing hierarchy: eyebrow and metadata at 11-12px, body at 14px, section titles at 16-20px, and document subjects at 24px. The spacing scale follows 4px increments. Inbox and chat rows are intentionally tighter than reading panes and settings.

## Radius and Elevation

Use the shared 8px maximum radius. Prefer borders and background shifts over shadows. Elevation is reserved for overlays such as the settings panel and command surfaces.

## Components

The application shell has three levels: global rail, context sidebar, and content workspace. Reusable communication components include `MailList`, `MailReadingPane`, `ChatWorkspace`, avatars, presence indicators, attachments, bridge actions, and settings controls. New modules should plug into the existing global/context navigation rather than introduce a new shell.

## Email UX

Email rows prioritize sender, subject, preview, and time. Unread rows use stronger weight and a dot; selected rows use a subtle accent background. The reading pane is a comfortable document with sender metadata, labels, attachments, thread actions, and an intentional `Discuss in chat` bridge.

## Chat UX

Chat uses compact message groups, presence, typing state, and a lightweight composer. It does not use email form fields or large document cards. `Continue in email` is an explicit bridge that preserves context without automatically formalizing a message.

## Responsive Behavior

Desktop shows global rail, context navigation, list, and reading/conversation workspace. Tablet reduces the context navigation and keeps two useful panes. Mobile uses one active context at a time; the list and reading surface are not compressed into three columns.

## Accessibility and States

Use semantic buttons, links, headings, labels, focus-visible rings, and aria-labels for icon-only controls. Every primary surface must account for default, hover, active, selected, focused, disabled, loading, empty, error, unread, and read states. Do not communicate status by color alone.

## Do / Don't

Do preserve alignment, whitespace, scan speed, restrained borders, and clear actions. Do not turn every element into a card, merge Mail and Chat into one feed, overuse red, add decorative gradients, or use arbitrary spacing and colors.