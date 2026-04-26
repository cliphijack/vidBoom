import os
import json
import tempfile
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")


def _get_service():
    cred_json = os.environ["GOOGLE_SERVICE_ACCOUNT_JSON"]
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(cred_json), scopes=SCOPES
    )
    return build("drive", "v3", credentials=credentials)


def list_videos() -> list[dict]:
    service = _get_service()
    query = f"'{FOLDER_ID}' in parents and mimeType contains 'video/' and trashed=false"
    results = service.files().list(
        q=query,
        fields="files(id, name, size, createdTime, thumbnailLink)",
        orderBy="createdTime desc",
        pageSize=50,
    ).execute()
    return results.get("files", [])


def download_video(file_id: str) -> str:
    service = _get_service()
    request = service.files().get_media(fileId=file_id)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    downloader = MediaIoBaseDownload(tmp, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    tmp.close()
    return tmp.name
