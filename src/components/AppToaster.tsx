"use client";

import { Toaster } from "@tessera/ui";
import { toaster } from "@/lib/toaster";

export default function AppToaster() {
  return <Toaster toastManager={toaster} />;
}
