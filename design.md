# Design Document — Code-to-Doc Generator

**Version:** 1.0 | **Stack:** React + Tailwind · Node/Express · MongoDB · JWT · OpenRouter

---

## Design Philosophy

**Aesthetic Direction:** Developer-native dark tool. Monospace precision, terminal-inspired palette, zero decorative noise. Every element earns its place. The UI should feel like an IDE extension — familiar, focused, and fast.

**Core Principle:** "The tool should disappear. The documentation should appear."

---

## Color System (Tailwind CSS Custom Tokens)

```js
colors: {
  bg: {
    primary:  '#0d0f12',
    surface:  '#13161c',
    elevated: '#1a1f29',
    overlay:  '#0a0c0f',
  },
  accent: {
    DEFAULT:  '#00e5a0',
    dim:      '#00a070',
    glow:     '#00e5a020',
  },
  border: { DEFAULT: '#2a2f3d', focus: '#00e5a060' },
  text: { primary: '#e8eaf0', muted: '#6b7280', code: '#a8b5c8' },
  status: { success: '#00e5a0', warn: '#f5a623', danger: '#ff4444', info: '#60a5fa' }
}
```

---

## Typography

| Role         | Font             | Tailwind Class        | Weight |
|--------------|------------------|-----------------------|--------|
| App title    | JetBrains Mono   | font-mono text-2xl    | 700    |
| Headings     | JetBrains Mono   | font-mono text-lg     | 600    |
| Body text    | Inter            | font-sans text-sm     | 400    |
| Code input   | Fira Code        | font-mono text-sm     | 400    |
| Buttons      | JetBrains Mono   | font-mono text-xs     | 600    |

---

## Layout Architecture

```
+--------------------------------------------------------------+
|  NAVBAR: Logo | [History] | [Account] | [Logout]             |
+-------------------------+------------------------------------+
|                         |                                    |
|   CODE INPUT PANEL      |   DOCUMENTATION OUTPUT PANEL       |
|   [Language dropdown]   |   [Copy] [Export .md] [Save]       |
|   <textarea>            |   Rendered Markdown (DOMPurify)    |
|   Chars: 2341 / 8000    |   Toggle: Rendered | Raw           |
|   [Upload file]         |                                    |
|   [GENERATE DOCS]       |                                    |
|                         |                                    |
+-------------------------+------------------------------------+
|  SECURITY BAR: Sanitized | Rate OK | Auth | model: free      |
+--------------------------------------------------------------+
```

### Responsive Breakpoints

- lg (>1024px): Side-by-side 50/50 split panels
- md (768-1024px): Stacked panels with tab toggle
- sm (<768px): Single panel, bottom nav bar

---

## Authentication UI

- Centered card on dark canvas (bg-surface, rounded-xl, border)
- Tabs: Login | Register
- Fields: Email, Password (Register adds Confirm Password)
- Show/hide password toggle
- JWT stored in httpOnly cookie — NOT localStorage
- Error messages inline below field, never alert popups

---

## Component Specifications

### CodeInputPanel
- textarea styled with font-mono, bg-transparent
- Character counter turns warn at 7000, danger at 8000
- Hard client-side limit: block input at 8000 chars
- File upload validates extension AND MIME before reading
- Rejects files > 50KB client-side

### GenerateButton
- Full-width accent mint, uppercase tracking-widest
- Loading: animated cursor blink (animate-cursor keyframe)
- Rate-limited: shows RETRY IN Xs countdown
- Unauthenticated: redirects to login with toast

### OutputPanel
- prose prose-invert prose-sm (Tailwind Typography)
- DOMPurify sanitization before dangerouslySetInnerHTML
- Copy to clipboard button with checkmark flash
- Skeleton loader during generation

### SecurityStatusBar
- Fixed bottom strip
- Pills: Input Sanitized | Output Escaped | Rate OK | Auth Active | model: openrouter/free
- Amber pill when rate limit > 80% consumed

### HistoryDrawer (authenticated only)
- Slide-in from left (translate-x transition)
- Language badge + timestamp + first 60 chars of code
- Click to reload both panels from MongoDB
- Delete button with confirm toast

---

## Security UX Patterns

| Threat                | UX Response                                      |
|-----------------------|--------------------------------------------------|
| XSS via LLM output    | DOMPurify before every DOM write                 |
| JWT expiry            | Auto-redirect to login with "Session expired"    |
| Rate limit hit        | Countdown timer, amber pill, no error detail     |
| Oversized file upload | Instant client-side rejection with toast         |
| API key exposure      | Key only in server .env, never in client         |
| CSRF                  | SameSite=Strict cookies + Origin header check    |
| Unauth route access   | ProtectedRoute wrapper redirects to /auth        |

---

## Frontend File Structure

```
frontend/
  src/
    components/
      CodeInputPanel.jsx
      OutputPanel.jsx
      GenerateButton.jsx
      LanguageSelector.jsx
      SecurityStatusBar.jsx
      HistoryDrawer.jsx
      Navbar.jsx
      ProtectedRoute.jsx
      AuthCard.jsx
    pages/
      Home.jsx
      Auth.jsx
    utils/
      sanitize.js
      fileValidator.js
      languageDetect.js
      rateLimit.js
    hooks/
      useGenerate.js
      useAuth.js
      useRateLimit.js
    context/
      AuthContext.jsx
    App.jsx
  tailwind.config.js
  package.json
```

## Backend File Structure

```
backend/
  src/
    routes/
      auth.js        (POST /api/auth/register, /login, /logout)
      generate.js    (POST /api/generate - JWT protected)
      history.js     (GET/DELETE /api/history - JWT protected)
    controllers/
      authController.js
      generateController.js
      historyController.js
    middleware/
      authMiddleware.js   (JWT verify)
      rateLimiter.js      (express-rate-limit)
      inputValidator.js   (zod schemas)
      sanitize.js
    models/
      User.js             (email, passwordHash, createdAt)
      Generation.js       (userId, language, code, output, createdAt)
    utils/
      openrouter.js
      logger.js
    app.js
  .env.example
  package.json
```

---

## Accessibility

- WCAG AA contrast on all text elements
- All interactive elements keyboard-navigable
- aria-live="polite" on output panel
- aria-busy="true" on generate button during loading
- Focus trapped in auth modal when open

---

*Last updated: 2025 | Version 1.0*
