import { getCurrentSession } from "@/lib/auth";
import { pranoKerkese } from "@/lib/kerkesat";
import { eshteOrigjineNjete } from "@/lib/same-origin";

const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; kerkesaId: string }> },
) {
  if (!eshteOrigjineNjete(request)) {
    return Response.json({ error: "Kërkesa nuk erdhi nga ky aplikacion." }, {
      status: 403,
      headers,
    });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json({ error: "Formati i kërkesës nuk mbështetet." }, {
      status: 415,
      headers,
    });
  }

  const session = await getCurrentSession();
  const githubId = session?.user?.id;
  if (!githubId) {
    return Response.json({ error: "Hyr me GitHub për të pranuar kërkesa." }, {
      status: 401,
      headers,
    });
  }

  const { id, kerkesaId } = await params;
  if (
    !/^[a-zA-Z0-9_-]{1,40}$/.test(id) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      kerkesaId,
    )
  ) {
    return Response.json({ error: "ID-ja e udhëtimit ose kërkesës nuk është e vlefshme." }, {
      status: 400,
      headers,
    });
  }

  try {
    const result = await pranoKerkese(id, kerkesaId, githubId);
    if (!result.ok) {
      const status = result.gabim === "pa_leje" ? 403 : 409;
      const error = result.gabim === "pa_vende"
        ? "Nuk ka vende të lira. Kërkesa mbetet në pritje."
        : result.gabim === "pa_leje"
          ? "Këtë kërkesë mund ta pranojë vetëm shoferi pronar."
          : "Kërkesa nuk u gjet ose nuk është më në pritje.";
      return Response.json({ error }, { status, headers });
    }
    return Response.json(result, { headers });
  } catch (error) {
    console.error("Gabim gjatë pranimit të kërkesës për udhëtim:", error);
    return Response.json({ error: "Kërkesa nuk u pranua. Provo përsëri." }, {
      status: 503,
      headers,
    });
  }
}
