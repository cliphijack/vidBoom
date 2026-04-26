from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os, json, uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

from services.gdrive import list_videos, download_video
from platforms.youtube import upload_youtube
from platforms.instagram import upload_instagram
from platforms.threads import upload_threads
from platforms.tiktok import upload_tiktok

load_dotenv()

HISTORY_FILE = Path("/app/data/history.json")
HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)


def _load_history() -> list:
    if HISTORY_FILE.exists():
        return json.loads(HISTORY_FILE.read_text())
    return []


def _save_history(records: list):
    HISTORY_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2))

app = FastAPI(title="vidBoom API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PublishRequest(BaseModel):
    drive_file_id: str
    title: str
    description: str = ""
    hashtags: list[str] = []
    first_comment: Optional[str] = None
    platforms: list[str]           # ["youtube", "instagram", "threads", "tiktok"]
    schedule_at: Optional[str] = None  # ISO 8601 or None = now


class PublishResult(BaseModel):
    platform: str
    success: bool
    url: Optional[str] = None
    error: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}


@app.get("/drive/videos")
def get_drive_videos():
    """Google Drive 폴더에서 세로형 영상 목록 반환"""
    return list_videos()


@app.post("/publish", response_model=list[PublishResult])
async def publish(req: PublishRequest, background_tasks: BackgroundTasks):
    """선택한 플랫폼에 동시 배포"""
    video_path = download_video(req.drive_file_id)
    results = []

    handlers = {
        "youtube":   upload_youtube,
        "instagram": upload_instagram,
        "threads":   upload_threads,
        "tiktok":    upload_tiktok,
    }

    for platform in req.platforms:
        handler = handlers.get(platform)
        if not handler:
            results.append(PublishResult(platform=platform, success=False, error="지원하지 않는 플랫폼"))
            continue
        try:
            url = handler(
                video_path=video_path,
                title=req.title,
                description=req.description,
                hashtags=req.hashtags,
                first_comment=req.first_comment,
            )
            results.append(PublishResult(platform=platform, success=True, url=url))
        except Exception as e:
            results.append(PublishResult(platform=platform, success=False, error=str(e)))

    records = _load_history()
    records.insert(0, {
        "id": str(uuid.uuid4()),
        "drive_file_id": req.drive_file_id,
        "title": req.title,
        "platforms": req.platforms,
        "results": [r.model_dump() for r in results],
        "published_at": datetime.utcnow().isoformat(),
    })
    _save_history(records)

    return results


@app.get("/history")
def get_history():
    """발행 히스토리 반환 (최신순)"""
    return _load_history()
