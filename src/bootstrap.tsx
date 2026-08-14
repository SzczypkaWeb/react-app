import { createRoot } from 'react-dom/client';
import { Widget } from './Widget';
import './styles.css';
import * as Sentry from '@sentry/react';

// Deliberately only here, not in Widget.tsx (the actual Module Federation
// export consumed by frontend-shell at runtime). This file only runs when
// react-app is loaded standalone (its own dev server / its own deployed
// Azure URL directly) - when loaded as a remote inside frontend-shell,
// index.tsx/bootstrap.tsx never execute at all, and frontend-shell's own
// Sentry.init() (already running in that shared browser tab) already
// captures global uncaught errors/rejections regardless of which webpack
// bundle they originated from - Module Federation shares one JS runtime,
// it isn't iframe-isolated. Initializing a second Sentry client here too
// would just conflict with that one instead of adding coverage. What
// frontend-shell's instance does NOT see is render-phase errors caught by
// its own ErrorBoundary (React swallows those before they reach any global
// handler) - see the fix in frontend-shell's ErrorBoundary.tsx for that
// separate gap.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
  debug: true,
});

createRoot(document.getElementById('root')!).render(<Widget />);
