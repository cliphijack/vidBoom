import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]


def _get_service():
    creds = Credentials(
        token=None,
        refresh_token=os.environ["YOUTUBE_REFRESH_TOKEN"],
        client_id=os.environ["YOUTUBE_CLIENT_ID"],
        client_secret=os.environ["YOUTUBE_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=SCOPES,
    )
    creds.refresh(Request())
    return build("youtube", "v3", credentials=creds)


def upload_youtube(video_path: str, title: str, description: str,
                   hashtags: list, first_comment: str | None = None) -> str:
    service = _get_service()
    tags = [t.lstrip("#") for t in hashtags if t]
    full_desc = f"{description}\n\n{' '.join(hashtags)}" if hashtags else description

    body = {
        "snippet": {
            "title": title,
            "description": full_desc,
            "tags": tags,
            "categoryId": "22",
            "defaultLanguage": "ko",
        },
        "status": {"privacyStatus": "public"},
    }

    media = MediaFileUpload(video_path, mimetype="video/mp4", resumable=True)
    response = (
        service.videos()
        .insert(part="snippet,status", body=body, media_body=media)
        .execute()
    )
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
