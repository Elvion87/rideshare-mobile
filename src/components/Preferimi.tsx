"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { ruajPreferimin } from "@/app/udhetimi/[id]/actions";

export function Preferimi({
  udhetimiId,
  fillimishtRuajtur,
  numerFillestar,
  iKycur,
}: {
  udhetimiId: string;
  fillimishtRuajtur: boolean;
  numerFillestar: number;
  iKycur: boolean;
}) {
  const [ruajtur, setRuajtur] = useState(fillimishtRuajtur);
  const [numer, setNumer] = useState(numerFillestar);
  const [mesazhi, setMesazhi] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!iKycur) {
    return (
      <section className="favorite-panel">
        <p className="eyebrow">PREFERIM PERSONAL</p>
        <p>Hyr me GitHub për ta ruajtur këtë udhëtim te të preferuarat.</p>
        <Link className="button button--small" href="/panel">Hyr / Paneli im</Link>
      </section>
    );
  }

  function ruaj() {
    if (ruajtur || isPending) {
      return;
    }

    setRuajtur(true);
    setNumer((value) => value + 1);
    setMesazhi("Po presim konfirmimin e serverit.");

    startTransition(async () => {
      try {
        const rezultati = await ruajPreferimin(udhetimiId);
        if (!rezultati.ok) {
          setRuajtur(false);
          setNumer(numerFillestar);
          setMesazhi(rezultati.mesazhi);
          return;
        }
        setMesazhi("U ruajt te të preferuarat.");
      } catch (error) {
        console.error("Gabim gjatë kërkesës për preferim:", error);
        setRuajtur(false);
        setNumer(numerFillestar);
        setMesazhi("Nuk u ruajt. Provo përsëri.");
      }
    });
  }

  return (
    <section className="favorite-panel">
      <p className="eyebrow">PREFERIM PERSONAL · JO REZERVIM</p>
      <button
        className="favorite-button"
        type="button"
        onClick={ruaj}
        disabled={ruajtur || isPending}
        aria-pressed={ruajtur}
      >
        <span aria-hidden="true">{ruajtur ? "★" : "☆"}</span>
        {ruajtur ? (isPending ? "Po ruhet…" : "I ruajtur") : "Ruaj udhëtimin"}
      </button>
      <p className="favorite-count">
        Të preferuarat <strong>{numer}</strong>
      </p>
      <p className="form-message" role={mesazhi.startsWith("Nuk") ? "alert" : "status"} aria-live="polite">
        {mesazhi}
      </p>
    </section>
  );
}
