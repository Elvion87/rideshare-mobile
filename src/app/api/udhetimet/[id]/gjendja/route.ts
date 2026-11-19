import { getCurrentSession } from "@/lib/auth";
import { lexoGjendjenUdhetimit } from "@/lib/kerkesat";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getCurrentSession();
  const githubId = session?.user?.id;
  if (!githubId) {
    return Response.json({ error: "Hyr me GitHub për të lexuar gjendjen." }, {
      status: 401,
      headers,
    });
  }

  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) {
    return Response.json({ error: "ID-ja e udhëtimit nuk është e vlefshme." }, {
      status: 400,
      headers,
    });
  }

  try {
    const gjendja = await lexoGjendjenUdhetimit(id, githubId);
    if (!gjendja) {
      return Response.json({ error: "Udhëtimi nuk u gjet." }, {
        status: 404,
        headers,
      });
    }
    return Response.json(gjendja, { headers });
  } catch (error) {
    console.error("Gabim gjatë leximit të gjendjes së udhëtimit:", error);
    return Response.json({ error: "Gjendja nuk mund të lexohet tani." }, {
      status: 503,
      headers,
    });
  }
}
