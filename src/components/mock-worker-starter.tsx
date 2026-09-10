"use client";

import { useEffect } from "react";
import { startMockWorker } from "@/mocks/browser";

export function MockWorkerStarter() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      startMockWorker();
    }
  }, []);

  return null;
}
