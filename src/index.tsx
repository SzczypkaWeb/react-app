// Standalone entry point, used only when running this app directly (e.g. via
// `pnpm dev`) so the exposed Widget can be previewed outside of a host shell.
import { createRoot } from 'react-dom/client';
import { Widget } from './Widget';

createRoot(document.getElementById('root')!).render(<Widget />);
