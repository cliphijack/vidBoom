import os
import tempfile
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
]
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")


def _get_service():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)
        with open("token.json", "w") as f:
            f.write(creds.to_json())
    return build("drive", "v3", credentials=creds)


def list_videos() -> list[dict]:
    """Drive 폴더에서 세로형 영상 목록 반환"""
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
    """Drive 영상을 임시 파일로 다운로드 후 경로 반환"""
    service = _get_service()
    request = service.files().get_media(fileId=file_id)
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    downloader = MediaIoBaseDownload(tmp, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    tmp.close()
    return tmp.name
