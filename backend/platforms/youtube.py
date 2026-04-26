import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.force-ssl"]


def _get_service():
    creds = None
    if os.path.exists("yt_token.json"):
        creds = Credentials.from_authorized_user_file("yt_token.json", SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file("yt_credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)
        with open("yt_token.json", "w") as f:
            f.write(creds.to_json())
    return build("youtube", "v3", credentials=creds)


def upload_youtube(video_path: str, title: str, description: str,
                   hashtags: str, first_comment: str | None = None) -> str:
    service = _get_service()
    tags = [t.strip().lstrip("#") for t in hashtags.split() if t.startswith("#")]
    full_desc = f"{description}\n\n{hashtags}"

    body = {
        "snippet": {
            "title": title,
            "description": full_desc,
            "tags": tags,
            "categoryId": "22",  # People & Blogs
            "defaultLanguage": "ko",
        },
        "status": {"privacyStatus": "public"},
    }

    media = MediaFileUpload(video_path, mimetype="video/mp4", resumable=True)
    response = service.videos().insert(part="snippet,status", body=body, media_body=media).execute()
    video_id = response["id"]

    if first_comment:
        service.commentThreads().insert(
            part="snippet",
            body={
                "snippet": {
                    "videoId": video_id,
                    "topLevelComment": {"snippet": {"textOriginal": first_comment}},
                }
            },
        ).execute()

    return f"https://youtube.com/shorts/{video_id}"
