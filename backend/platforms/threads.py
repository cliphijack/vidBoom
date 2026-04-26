import os
import httpx
import time

BASE = "https://graph.threads.net/v1.0"
USER_ID = os.getenv("THREADS_USER_ID", "")
TOKEN = os.getenv("META_ACCESS_TOKEN", "")


def upload_threads(video_path: str, title: str, description: str,
                   hashtags: str, first_comment: str | None = None) -> str:
    text = f"{description}\n\n{hashtags}"

    # 1단계: 미디어 컨테이너 생성
    r = httpx.post(f"{BASE}/{USER_ID}/threads", params={
        "media_type": "VIDEO",
        "video_url": _upload_video_to_cdn(video_path),
        "text": text,
        "access_token": TOKEN,
    })
    r.raise_for_status()
    container_id = r.json()["id"]

    # 2단계: 처리 대기 (최대 30초)
    for _ in range(10):
        time.sleep(3)
        status = httpx.get(f"{BASE}/{container_id}", params={
            "fields": "status,error_message",
            "access_token": TOKEN,
        }).json()
        if status.get("status") == "FINISHED":
            break

    # 3단계: 발행
    pub = httpx.post(f"{BASE}/{USER_ID}/threads_publish", params={
        "creation_id": container_id,
        "access_token": TOKEN,
    })
    pub.raise_for_status()
    post_id = pub.json()["id"]

    # 첫댓글
    if first_comment:
        httpx.post(f"{BASE}/{post_id}/replies", params={
            "text": first_comment,
            "access_token": TOKEN,
        })

    return f"https://www.threads.net/t/{post_id}"


def _upload_video_to_cdn(video_path: str) -> str:
    # Threads API는 공개 URL이 필요 — 실제 구현 시 임시 CDN or presigned URL 활용
    # TODO: S3 / Cloudflare R2 presigned URL 연동
    raise NotImplementedError("Threads 영상 CDN 업로드 구현 필요 (S3/R2 연동)")
