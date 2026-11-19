import Link from "next/link";
import { connection } from "next/server";

import { EditorOra } from "@/components/EditorOra";
import { Hyrja } from "@/components/Hyrja";
import { authConfigured, getCurrentSession } from "@/lib/auth";
import { siguroProfilin } from "@/lib/profilet";
import { lexoUdhetimetPerShofer } from "@/lib/udhetimet";

export default async function Paneli() {
  await connection();

  if (!authConfigured) {
    return (
      <main className="page-shell page-shell--detail">
        <Link className="back-link" href="/">← Kthehu te lista</Link>
        <section className="detail-panel">
          <p className="eyebrow">PANELI I SHOFERIT</p>
          <h1>Konfiguro hyrjen me GitHub</h1>
          <p className="detail-panel__intro">
            Shto kredencialet private në <code>.env.local</code>, krijo callback-un
            GitHub sipas README dhe rifillo serverin.
          </p>
          <Hyrja brenda={false} konfigurimiGati={false} />
        </section>
      </main>
    );
  }

  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return (
      <main className="page-shell page-shell--detail">
        <Link className="back-link" href="/">← Kthehu te lista</Link>
        <section className="detail-panel">
          <p className="eyebrow">PANELI I SHOFERIT</p>
          <h1>Hyr për të vazhduar</h1>
          <p className="detail-panel__intro">
            GitHub vërteton identitetin; roli dhe pronësia kontrollohen veçmas në Neon.
          </p>
          <Hyrja brenda={false} konfigurimiGati />
        </section>
      </main>
    );
  }

  try {
    const profili = await siguroProfilin(session.user.id, session.user.name);
    const udhetimet = await lexoUdhetimetPerShofer(session.user.id);

    return (
      <main className="page-shell page-shell--detail">
        <Link className="back-link" href="/">← Kthehu te lista</Link>
        <section className="detail-panel">
          <p className="eyebrow">PANELI I SHOFERIT</p>
          <h1>Përshëndetje, {profili.emri}</h1>
          <p className="detail-panel__intro">
            Roli yt: <strong>{profili.roli}</strong>. Ndryshimi ruhet vetëm për
            udhëtimet që janë caktuar te ID-ja jote GitHub.
          </p>
          <Hyrja brenda konfigurimiGati />
          {profili.roli !== "shofer" ? (
            <p className="empty-state" role="status">
              Profili yt është udhëtar. Për ta provuar si shofer, cakto rolin dhe
              pronarin e udhëtimit në Neon sipas README.
            </p>
          ) : udhetimet.length === 0 ? (
            <p className="empty-state" role="status">
              Nuk ka udhëtime të caktuara te profili yt.
            </p>
          ) : (
            <div className="owned-rides">
              {udhetimet.map((udhetim) => (
                <article className="owned-ride" key={udhetim.id}>
                  <h2>{udhetim.nisja} → {udhetim.destinacioni}</h2>
                  <p>ID {udhetim.id} · {udhetim.vende} vende të lira</p>
                  <EditorOra udhetim={udhetim} />
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  } catch (error) {
    console.error("Gabim gjatë hapjes së panelit të shoferit:", error);
    return (
      <main className="page-shell page-shell--detail">
        <section className="detail-panel">
          <p className="eyebrow">GABIM I DATABAZËS</p>
          <h1>Paneli nuk u hap</h1>
          <p role="alert">Kontrollo lidhjen me Neon dhe migrimet SQL, pastaj provo përsëri.</p>
          <Hyrja brenda konfigurimiGati />
        </section>
      </main>
    );
  }
}
