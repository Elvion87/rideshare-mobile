"use client";

import { useEffect, useState } from "react";

export function PwaRegister() {
  const [mesazhi, setMesazhi] = useState("");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      setMesazhi("Ky shfletues nuk mbështet ruajtjen offline.");
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("Regjistrimi i service worker dështoi:", error);
      setMesazhi("Ruajtja offline nuk u aktivizua. Rifresko faqen dhe provo përsëri.");
    });
  }, []);

  if (!mesazhi) {
    return null;
  }
  return <p className="pwa-notice" role="status">{mesazhi}</p>;
}
