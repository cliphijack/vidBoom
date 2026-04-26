import { NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

function getAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (credentials) {
    const key = JSON.parse(credentials);
    return new google.auth.GoogleAuth({ credentials: key, scopes: SCOPES });
  }
  // OAuth2 with refresh token
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return oauth2;
}

export async function GET() {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth: auth as never });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

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
