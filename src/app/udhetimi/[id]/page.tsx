import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { GabimDatabaze } from "@/components/GabimDatabaze";
import { Preferimi } from "@/components/Preferimi";
import { Vendtakimi } from "@/components/Vendtakimi";
import { getCurrentSession } from "@/lib/auth";
import { lexoGjendjenPreferimit } from "@/lib/preferimet";
import { gjejUdhetimin, type Udhetim } from "@/lib/udhetimet";

export default async function Detajet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connection();

  let udhetim: Udhetim | undefined;
  let preferimi = { ruajtur: false, numer: 0 };
  const session = await getCurrentSession();
  try {
    udhetim = await gjejUdhetimin(id);
    if (udhetim && session?.user?.id) {
      preferimi = await lexoGjendjenPreferimit(session.user.id, id);
    }
  } catch (error) {
    console.error(`Gabim gjatë leximit të udhëtimit ${id}:`, error);
    return <GabimDatabaze href="/" actionLabel="Kthehu te lista" />;
  }
  if (!udhetim) {
    notFound();
  }

  const paVende = udhetim.vende === 0;

  return (
    <main className="page-shell page-shell--detail">
      <Link className="back-link" href="/">← Të gjitha nisjet</Link>
      <section className="detail-panel">
        <p className="eyebrow">DETAJET E UDHËTIMIT</p>
        <h1>{udhetim.nisja}<span className="route-arrow"> → </span>{udhetim.destinacioni}</h1>
        <p className="detail-panel__intro">
          Një rrugë e përbashkët, më pak makina në rrugë.
        </p>
        <dl className="detail-list">
          <div>
            <dt>Ora e nisjes</dt>
            <dd>{udhetim.ora}</dd>
          </div>
          <div>
            <dt>Vendtakimi</dt>
            <dd>{udhetim.vendtakimi}</dd>
          </div>
          <div>
            <dt>Vende të lira</dt>
            <dd>{udhetim.vende}</dd>
          </div>
        </dl>
        <Vendtakimi udhetimLabel={`${udhetim.nisja} → ${udhetim.destinacioni}`} />
        {paVende ? (
          <button className="button button--muted button--wide" disabled>
            Nuk ka vende të lira
          </button>
        ) : (
          <Link className="button button--wide" href={`/udhetimi/${id}/kerkesa`}>
            Kërko vend <span aria-hidden="true">→</span>
          </Link>
        )}
        <Preferimi
          udhetimiId={udhetim.id}
          fillimishtRuajtur={preferimi.ruajtur}
          numerFillestar={preferimi.numer}
          iKycur={Boolean(session?.user?.id)}
        />
      </section>
      <p className="demo-note demo-note--detail">
        Ky është një shembull mësimor. Nuk dërgohet kërkesë reale.
      </p>
    </main>
  );
}
