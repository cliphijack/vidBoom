import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const REPO = process.env.GITHUB_REPO || "cliphijack/vidBoom";
const WORKFLOW = "publish.yml";
const REF = process.env.GITHUB_REF || "master";

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 });
  }

  const body = await req.json();
  const jobId = randomUUID();

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: REF,
        inputs: {
          job_id: jobId,
          drive_file_id: body.drive_file_id,
          title: body.title,
          description: body.description || "",
          hashtags: (body.hashtags || []).join(","),
          first_comment: body.first_comment || "",
          platforms: (body.platforms || []).join(","),
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  return NextResponse.json({ job_id: jobId });
}
