import { createToaster } from "@tessera/ui";

// One shared manager so non-React code (lib/speech.ts) can raise toasts.
// Rendered by <AppToaster /> in the root layout.
export const toaster = createToaster();
