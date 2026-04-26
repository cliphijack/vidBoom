import os
from instagrapi import Client

_client: Client | None = None


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = Client()
        session_file = "ig_session.json"
        if os.path.exists(session_file):
            _client.load_settings(session_file)
            _client.login(os.getenv("INSTAGRAM_USERNAME"), os.getenv("INSTAGRAM_PASSWORD"))
        else:
            _client.login(os.getenv("INSTAGRAM_USERNAME"), os.getenv("INSTAGRAM_PASSWORD"))
            _client.dump_settings(session_file)
    return _client


def upload_instagram(video_path: str, title: str, description: str,
                     hashtags: str, first_comment: str | None = None) -> str:
    cl = _get_client()
    caption = description  # 캡션은 깔끔하게, 해시태그는 첫댓글로
    media = cl.clip_upload(video_path, caption=caption)

    comment_text = first_comment or hashtags
    if comment_text:
        cl.media_comment(media.id, comment_text)

    return f"https://www.instagram.com/reel/{media.code}/"
