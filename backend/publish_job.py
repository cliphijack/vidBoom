"""Standalone publish script for GitHub Actions."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))

from services.gdrive import download_video
from platforms.youtube import upload_youtube
from platforms.instagram import upload_instagram
from platforms.threads import upload_threads
from platforms.tiktok import upload_tiktok

HANDLERS = {
    "youtube": upload_youtube,
    "instagram": upload_instagram,
    "threads": upload_threads,
    "tiktok": upload_tiktok,
}


def main():
    job_id = os.environ["JOB_ID"]
    drive_file_id = os.environ["DRIVE_FILE_ID"]
    title = os.environ["TITLE"]
    description = os.environ.get("DESCRIPTION", "")
    hashtags = [h.strip() for h in os.environ.get("HASHTAGS", "").split(",") if h.strip()]
    first_comment = os.environ.get("FIRST_COMMENT") or None
    platforms = [p.strip() for p in os.environ["PLATFORMS"].split(",") if p.strip()]

    print(f"[vidBoom] job={job_id} platforms={platforms}")
    video_path = download_video(drive_file_id)

    results = []
    for platform in platforms:
        handler = HANDLERS.get(platform)
        if not handler:
            results.append({"platform": platform, "success": False, "error": "지원하지 않는 플랫폼"})
            continue
        try:
            url = handler(
                video_path=video_path,
                title=title,
                description=description,
                hashtags=hashtags,
                first_comment=first_comment,
            )
            results.append({"platform": platform, "success": True, "url": url})
            print(f"[vidBoom] {platform} ✓ {url}")
        except Exception as e:
            results.append({"platform": platform, "success": False, "error": str(e)})
            print(f"[vidBoom] {platform} ✗ {e}")

    output = {"job_id": job_id, "results": results}
    with open("/tmp/vidboom_result.json", "w") as f:
        json.dump(output, f)
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
