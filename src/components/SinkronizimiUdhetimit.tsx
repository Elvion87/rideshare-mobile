"use client";

import { useEffect, useRef, useState } from "react";

import type {
  GjendjaUdhetimit,
  StatusKerkese,
} from "@/lib/kerkesat-types";

function eshteStatusKerkese(value: unknown): value is StatusKerkese {
  return value === "ne pritje" || value === "pranuar";
}

function eshteObjekt(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function eshteGjendja(value: unknown): value is GjendjaUdhetimit {
  if (!eshteObjekt(value)) {
    return false;
  }
  const trip = value.udhetim;
  const ownRequest = value.kerkesaIme;
  const requests = value.kerkesat;
  return Boolean(
    eshteObjekt(trip) &&
      typeof trip.id === "string" &&
      typeof trip.vende === "number" &&
      (value.roli === "shofer" || value.roli === "udhetar") &&
      (ownRequest === null ||
        (eshteObjekt(ownRequest) &&
          typeof ownRequest.id === "string" &&
          eshteStatusKerkese(ownRequest.status))) &&
      Array.isArray(requests) &&
      requests.every(
        (request) =>
          eshteObjekt(request) &&
          typeof request.id === "string" &&
          typeof request.udhetar === "string" &&
          eshteStatusKerkese(request.status),
      ),
  );
}

export function SinkronizimiUdhetimit({
  fillestare,
}: {
  fillestare: GjendjaUdhetimit;
}) {
  const [gjendja, setGjendja] = useState(fillestare);
  const [offline, setOffline] = useState(false);
  const [rilidhje, setRilidhje] = useState(false);
  const [veprimi, setVeprimi] = useState("");
  const [dukeVepruar, setDukeVepruar] = useState(false);
  const refreshRef = useRef<(() => Promise<void>) | null>(null);
  const gabimiUShfaq = useRef(false);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let controller: AbortController | undefined;

    const refresh = async () => {
      if (!active || inFlight) {
        return;
      }
      if (!navigator.onLine) {
        setOffline(true);
        setRilidhje(true);
        return;
      }

      inFlight = true;
      controller = new AbortController();
      try {
        const response = await fetch(
          `/api/udhetimet/${encodeURIComponent(gjendja.udhetim.id)}/gjendja`,
          {
            cache: "no-store",
            credentials: "same-origin",
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(`Leximi i gjendjes dështoi (${response.status}).`);
        }
        const latest: unknown = await response.json();
        if (!eshteGjendja(latest)) {
          throw new Error("Serveri ktheu gjendje të pavlefshme të udhëtimit.");
        }
        if (active) {
          setGjendja(latest);
          setOffline(false);
          setRilidhje(false);
          gabimiUShfaq.current = false;
        }
      } catch (error) {
        if (
          active &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          if (!gabimiUShfaq.current) {
            console.error("Leximi automatik i udhëtimit dështoi:", error);
            gabimiUShfaq.current = true;
          }
          setOffline(!navigator.onLine);
          setRilidhje(true);
        }
      } finally {
        inFlight = false;
      }
    };

    refreshRef.current = refresh;
    const interval = window.setInterval(() => {
      void refresh();
    }, 5000);
    const whenOnline = () => {
      setOffline(false);
      void refresh();
    };
    const whenOffline = () => {
      setOffline(true);
      setRilidhje(true);
    };

    window.addEventListener("online", whenOnline);
    window.addEventListener("offline", whenOffline);
    void refresh();

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("online", whenOnline);
      window.removeEventListener("offline", whenOffline);
      controller?.abort();
      refreshRef.current = null;
    };
  }, [gjendja.udhetim.id]);

  async function dergoVeprimin(
    url: string,
    sukses: (body: Record<string, unknown>) => string,
  ) {
    if (offline || !navigator.onLine || dukeVepruar) {
      setOffline(!navigator.onLine);
      setVeprimi("Veprimet që kërkojnë rrjet janë bllokuar derisa të rilidhesh.");
      return;
    }

    setDukeVepruar(true);
    setVeprimi("");
    try {
      const response = await fetch(url, {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const body: unknown = await response.json();
      if (!body || typeof body !== "object") {
        throw new Error("Serveri ktheu përgjigje të pavlefshme.");
      }
      const result = body as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(
          typeof result.error === "string" ? result.error : "Veprimi dështoi.",
        );
      }
      setVeprimi(sukses(result));
      await refreshRef.current?.();
    } catch (error) {
      console.error("Veprimi i udhëtimit dështoi:", error);
      setRilidhje(true);
      setVeprimi(
        error instanceof Error
          ? error.message
          : "Veprimi dështoi. Provo përsëri.",
      );
    } finally {
      setDukeVepruar(false);
    }
  }

  const { udhetim, kerkesaIme, kerkesat, roli } = gjendja;

  return (
    <section className="sync-panel" aria-label="Gjendja e përditësuar e udhëtimit">
      <p className="eyebrow">
        {roli === "shofer" ? "KËRKESAT E UDHËTIMIT" : "KËRKESA IME"}
      </p>
      <dl className="sync-panel__summary">
        <div>
          <dt>Vende të lira</dt>
          <dd>{udhetim.vende}</dd>
        </div>
        <div>
          <dt>Statusi i udhëtimit</dt>
          <dd>{udhetim.vende > 0 ? "Aktiv" : "Plot"}</dd>
        </div>
      </dl>

      {roli === "udhetar" ? (
        <div className="sync-panel__request">
          {kerkesaIme ? (
            <>
              <p>
                Statusi yt:{" "}
                <strong>
                  {kerkesaIme.status === "pranuar" ? "U pranua" : "Në pritje"}
                </strong>
              </p>
              {kerkesaIme.status === "pranuar" ? (
                <p>Vendi u konfirmua.</p>
              ) : (
                <p>Kërkesa u dërgua dhe pret përgjigjen e shoferit.</p>
              )}
            </>
          ) : udhetim.vende > 0 ? (
            <button
              className="button button--wide"
              type="button"
              disabled={offline || dukeVepruar}
              onClick={() =>
                void dergoVeprimin(
                  `/api/udhetimet/${encodeURIComponent(udhetim.id)}/kerkesa`,
                  (body) =>
                    body.eRe === true
                      ? "Kërkesa u dërgua."
                      : "Kërkesa ekzistuese u lexua nga serveri.",
                )
              }
            >
              {dukeVepruar ? "Duke dërguar…" : "Kërko një vend"}
            </button>
          ) : (
            <p>Nuk ka vende të lira për një kërkesë të re.</p>
          )}
        </div>
      ) : (
        <div className="sync-panel__requests">
          {kerkesat.length === 0 ? (
            <p>Nuk ka kërkesa për këtë udhëtim.</p>
          ) : (
            kerkesat.map((request) => (
              <article className="sync-request" key={request.id}>
                <div>
                  <strong>{request.udhetar}</strong>
                  <span>
                    {request.status === "pranuar" ? "U pranua" : "Në pritje"}
                  </span>
                </div>
                {request.status === "ne pritje" ? (
                  <button
                    className="button button--small"
                    type="button"
                    disabled={offline || dukeVepruar}
                    onClick={() =>
                      void dergoVeprimin(
                        `/api/udhetimet/${encodeURIComponent(udhetim.id)}/kerkesat/${encodeURIComponent(request.id)}/prano`,
                        (body) =>
                          body.ndryshoi === true
                            ? "Pranimi u ruajt."
                            : "Kërkesa ishte pranuar më parë.",
                      )
                    }
                  >
                    {dukeVepruar ? "Duke ruajtur…" : "Prano kërkesën"}
                  </button>
                ) : null}
              </article>
            ))
          )}
        </div>
      )}

      <p
        className={`sync-panel__status${rilidhje ? " sync-panel__status--offline" : ""}`}
        role="status"
        aria-live="polite"
      >
        {offline
          ? "Po rilidhemi · të dhënat e shfaqura mund të jenë të vjetra."
          : rilidhje
            ? "Po rilidhemi · kërkesa e radhës bëhet automatikisht."
            : "Gjendja u lexua nga serveri · përditësim automatik çdo 5 sekonda."}
      </p>
      {offline ? (
        <p className="sync-panel__offline">
          Veprimet që kërkojnë rrjet janë të bllokuara.
        </p>
      ) : null}
      {veprimi ? (
        <p className="form-message" role="status" aria-live="polite">
          {veprimi}
        </p>
      ) : null}
    </section>
  );
}
