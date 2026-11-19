"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";

export function Hyrja({
  brenda,
  konfigurimiGati,
  callbackUrl = "/panel",
}: {
  brenda: boolean;
  konfigurimiGati: boolean;
  callbackUrl?: string;
}) {
  const [gabim, setGabim] = useState("");
  const [dukePritur, setDukePritur] = useState(false);

  async function vepro() {
    setGabim("");
    setDukePritur(true);
    try {
      if (brenda) {
        await signOut({ callbackUrl: "/" });
      } else {
        await signIn("github", { callbackUrl });
      }
    } catch (error) {
      console.error("Gabim gjatë nisjes së hyrjes me GitHub:", error);
      setGabim("Hyrja nuk u përfundua. Provo përsëri.");
      setDukePritur(false);
    }
  }

  if (!konfigurimiGati) {
    return (
      <p className="auth-note" role="status">
        Hyrja me GitHub pret konfigurimin e variablave të mjedisit.
      </p>
    );
  }

  return (
    <div className="auth-control">
      <button className="button" type="button" onClick={vepro} disabled={dukePritur}>
        {dukePritur ? "Duke hapur GitHub…" : brenda ? "Dil nga GitHub" : "Hyr me GitHub"}
      </button>
      {gabim ? <p className="form-message form-message--error" role="alert">{gabim}</p> : null}
    </div>
  );
}
