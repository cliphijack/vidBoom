import os
import httpx

TOKEN = os.getenv("TIKTOK_ACCESS_TOKEN", "")


def upload_tiktok(video_path: str, title: str, description: str,
                  hashtags: str, first_comment: str | None = None) -> str:
    # TikTok Content Posting API (Direct Post)
    # 문서: https://developers.tiktok.com/doc/content-posting-api-get-started

    # 1단계: 업로드 초기화
    init = httpx.post(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
        json={
            "post_info": {
                "title": f"{title} {hashtags}",
                "privacy_level": "PUBLIC_TO_EVERYONE",
                "disable_duet": False,
                "disable_comment": False,
                "disable_stitch": False,
            },
            "source_info": {
                "source": "FILE_UPLOAD",
                "video_size": os.path.getsize(video_path),
                "chunk_size": os.path.getsize(video_path),
                "total_chunk_count": 1,
            },
        },
    )
    init.raise_for_status()
    data = init.json()["data"]
    publish_id = data["publish_id"]
    upload_url = data["upload_url"]

    # 2단계: 영상 업로드
    with open(video_path, "rb") as f:
        video_bytes = f.read()
    httpx.put(
        upload_url,
        content=video_bytes,
        headers={
            "Content-Type": "video/mp4",
            "Content-Range": f"bytes 0-{len(video_bytes)-1}/{len(video_bytes)}",
        },
    ).raise_for_status()

    return f"https://www.tiktok.com/ (publish_id: {publish_id})"
