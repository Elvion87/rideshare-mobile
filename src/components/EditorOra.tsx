"use client";

import { useState, useTransition } from "react";

import { ruajOren } from "@/app/panel/actions";
import type { Udhetim } from "@/lib/udhetimet";

export function EditorOra({ udhetim }: { udhetim: Udhetim }) {
  const [ora, setOra] = useState(udhetim.ora);
  const [mesazhi, setMesazhi] = useState("");
  const [isPending, startTransition] = useTransition();

  function ruaj() {
    setMesazhi("");
    startTransition(async () => {
      const rezultati = await ruajOren(udhetim.id, ora);
      setMesazhi(rezultati.ok ? "Ora u ruajt." : rezultati.mesazhi);
    });
  }

  return (
    <form
      className="ride-editor"
      action={ruaj}
      aria-label={`Ndrysho orën e udhëtimit ${udhetim.id}`}
    >
      <label htmlFor={`ora-${udhetim.id}`}>Ora e nisjes</label>
      <div className="ride-editor__row">
        <input
          id={`ora-${udhetim.id}`}
          name="ora"
          type="time"
          required
          value={ora}
          onChange={(event) => setOra(event.target.value)}
        />
        <button className="button button--small" type="submit" disabled={isPending}>
          {isPending ? "Duke ruajtur…" : "Ruaj"}
        </button>
      </div>
      <p className="form-message" aria-live="polite" role={mesazhi.includes("nuk") ? "alert" : "status"}>
        {mesazhi}
      </p>
    </form>
  );
}
