import { getCurrentSession } from "@/lib/auth";
import { krijoKerkese } from "@/lib/kerkesat";
import { siguroProfilin } from "@/lib/profilet";
import { eshteOrigjineNjete } from "@/lib/same-origin";

const headers = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
    return Response.json({ error: "Hyr me GitHub për të kërkuar një vend." }, {
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
    await siguroProfilin(githubId, session.user?.name);
    const result = await krijoKerkese(id, githubId);
    if ("gabim" in result) {
      const status = result.gabim === "udhetimi_mungon" ? 404 : 409;
      const error = result.gabim === "pa_vende"
        ? "Nuk ka vende të lira për këtë udhëtim."
        : result.gabim === "udhetimi_yt"
          ? "Nuk mund të kërkosh vend në udhëtimin tënd."
          : "Udhëtimi nuk u gjet ose nuk është i hapur për kërkesa.";
      return Response.json({ error }, { status, headers });
    }
    return Response.json(result, {
      status: result.eRe ? 201 : 200,
      headers,
    });
  } catch (error) {
    console.error("Gabim gjatë ruajtjes së kërkesës për udhëtim:", error);
    return Response.json({ error: "Kërkesa nuk u ruajt. Provo përsëri." }, {
      status: 503,
      headers,
    });
  }
}
