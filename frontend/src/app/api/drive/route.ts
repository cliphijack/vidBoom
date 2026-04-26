import { NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

export async function GET() {
  try {
    const credJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!credJson) return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON 환경변수가 없습니다" }, { status: 500 });
    if (!folderId) return NextResponse.json({ error: "GOOGLE_DRIVE_FOLDER_ID 환경변수가 없습니다" }, { status: 500 });

    const credentials = JSON.parse(credJson);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: "files(id,name,size,createdTime,thumbnailLink)",
      orderBy: "createdTime desc",
      pageSize: 50,
    });

    return NextResponse.json(res.data.files || []);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Drive API error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
