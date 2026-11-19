import { lexoUdhetimet } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await lexoUdhetimet();
    const trips = rows.map(({ id, nisja, destinacioni, ora, vendtakimi, vende }) => ({
      id,
      nisja,
      destinacioni,
      ora,
      vendtakimi,
      vende,
    }));
    return Response.json(
      { trips },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Gabim gjatë leximit të listës publike offline:", error);
    return Response.json(
      { error: "Lista nuk mund të lexohet tani." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
