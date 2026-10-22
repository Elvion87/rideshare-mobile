import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { GabimDatabaze } from "@/components/GabimDatabaze";
import { gjejUdhetimin, type Udhetim } from "@/lib/udhetimet";

export default async function Kerkesa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connection();

  let udhetim: Udhetim | undefined;
  try {
    udhetim = await gjejUdhetimin(id);
  } catch (error) {
    console.error(`Gabim gjatë leximit të udhëtimit ${id} për kërkesën:`, error);
    return <GabimDatabaze href="/" actionLabel="Kthehu te lista" />;
  }
  if (!udhetim) {
    notFound();
  }

  return (
    <main className="page-shell page-shell--detail">
      <Link className="back-link" href={`/udhetimi/${id}`}>← Kthehu te detajet</Link>
      <section className="request-panel">
        {udhetim.vende > 0 ? (
          <>
            <span className="request-icon" aria-hidden="true">✓</span>
            <p className="eyebrow">HAPI I FUNDIT · DEMONSTRIM</p>
            <h1>Simulim: Në pritje</h1>
            <p>
              Kërkesa jote për udhëtimin {udhetim.nisja} – {udhetim.destinacioni}
              {" "}nuk është dërguar te shoferi.
            </p>
            <p className="request-panel__note">
              Ky demonstrim nuk ruan rezervime dhe nuk kontakton askënd.
            </p>
          </>
        ) : (
          <>
            <span className="request-icon request-icon--quiet" aria-hidden="true">!</span>
            <p className="eyebrow">NUK KA VENDE</p>
            <h1>Udhëtimi është plot</h1>
            <p>Nuk mund të kërkosh vend në këtë udhëtim.</p>
          </>
        )}
        <Link className="button button--wide button--outline" href={`/udhetimi/${id}`}>
          Kthehu te detajet
        </Link>
      </section>
    </main>
  );
}
