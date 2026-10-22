import Link from "next/link";

export function GabimDatabaze({
  href,
  actionLabel,
}: {
  href: string;
  actionLabel: string;
}) {
  return (
    <main className="page-shell page-shell--detail">
      <section className="request-panel">
        <p className="eyebrow">LIDHJA ME DATABAZËN</p>
        <h1>RideShare</h1>
        <p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p>
        <Link className="button button--wide button--outline" href={href}>
          {actionLabel}
        </Link>
      </section>
    </main>
  );
}
