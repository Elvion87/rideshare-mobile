"use client";

import { useState } from "react";

type GjendjaVendndodhjes =
  | "idle"
  | "loading"
  | "success"
  | "denied"
  | "timeout"
  | "unavailable";

const mesazhet: Record<GjendjaVendndodhjes, string> = {
  idle: "",
  loading: "Po kërkojmë vendndodhjen…",
  success: "Pozicioni u mor. Shkruaj vetë emrin e vendtakimit.",
  denied: "Leja u refuzua. Shkruaj vendtakimin vetë.",
  timeout: "Koha mbaroi. Shkruaj vendtakimin vetë ose provo përsëri.",
  unavailable: "Vendndodhja nuk është e disponueshme. Mund ta shkruash vendtakimin.",
};

export function Vendtakimi({ udhetimLabel }: { udhetimLabel: string }) {
  const [teksti, setTeksti] = useState("");
  const [vendtakimi, setVendtakimi] = useState("");
  const [gabim, setGabim] = useState("");
  const [gjendja, setGjendja] = useState<GjendjaVendndodhjes>("idle");
  const [saktesia, setSaktesia] = useState<number | null>(null);

  function konfirmo() {
    const pastruar = teksti.trim();
    if (!pastruar) {
      setGabim("Shkruaj një vendtakim para konfirmimit.");
      return;
    }
    setVendtakimi(pastruar);
    setGabim("");
  }

  function kerkoVendndodhjen() {
    setGabim("");
    setSaktesia(null);
    if (!navigator.geolocation) {
      setGjendja("unavailable");
      return;
    }

    setGjendja("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSaktesia(Math.round(position.coords.accuracy));
        setGjendja("success");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGjendja("denied");
        } else if (error.code === error.TIMEOUT) {
          setGjendja("timeout");
        } else {
          setGjendja("unavailable");
        }
      },
      { timeout: 10_000 },
    );
  }

  return (
    <section className="meeting-panel" aria-label={`Vendtakimi për ${udhetimLabel}`}>
      <p className="eyebrow">ZGJEDHJA JOTE · NUK I DËRGOHET SHOFERIT</p>
      <label htmlFor="meeting-input">Shkruaj vendtakimin</label>
      <input
        id="meeting-input"
        data-testid="meeting-input"
        type="text"
        value={teksti}
        onChange={(event) => {
          setTeksti(event.target.value);
          setGabim("");
        }}
        placeholder="p.sh. Biblioteka"
        autoComplete="off"
      />
      <div className="meeting-actions">
        <button
          className="button button--small"
          data-testid="confirm-meeting"
          type="button"
          onClick={konfirmo}
        >
          Konfirmo vendtakimin
        </button>
        <button
          className="button button--small button--outline"
          data-testid="locate-me"
          type="button"
          onClick={kerkoVendndodhjen}
          disabled={gjendja === "loading"}
        >
          {gjendja === "loading" ? "Po kërkojmë…" : "Përdor vendndodhjen time"}
        </button>
      </div>
      <p
        className="form-message form-message--error"
        data-testid="meeting-error"
        role="alert"
        aria-live="polite"
      >
        {gabim}
      </p>
      <p className="confirmed-meeting">
        Vendtakimi i konfirmuar:{" "}
        <strong data-testid="confirmed-meeting">{vendtakimi}</strong>
      </p>
      <p
        className="form-message"
        data-testid="location-status"
        data-state={gjendja}
        role="status"
        aria-live="polite"
      >
        {mesazhet[gjendja]}
      </p>
      <p className="location-accuracy" data-testid="location-accuracy">
        {saktesia === null ? "" : `Saktësia rreth ${saktesia} m`}
      </p>
      <p className="meeting-privacy">
        Vendndodhja përdoret vetëm në këtë ekran; koordinatat nuk ruhen dhe nuk dërgohen.
      </p>
    </section>
  );
}
