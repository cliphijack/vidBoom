"""
YouTube 리프레시 토큰 발급 스크립트
딱 한 번만 실행하면 됩니다.

사용법:
  pip install google-auth-oauthlib
  python get_youtube_token.py
"""
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]

CLIENT_ID = input("YOUTUBE_CLIENT_ID: ").strip()
CLIENT_SECRET = input("YOUTUBE_CLIENT_SECRET: ").strip()

client_config = {
    "installed": {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
    }
}

flow = InstalledAppFlow.from_client_config(client_config, SCOPES)

# 브라우저 없이 URL만 출력 → 브라우저에서 열고 코드 복붙
flow.redirect_uri = "urn:ietf:wg:oauth:2.0:oob"
auth_url, _ = flow.authorization_url(prompt="consent")

print("\n아래 URL을 브라우저에서 열어주세요:")
print(auth_url)
print()

code = input("브라우저에서 받은 코드 붙여넣기: ").strip()
flow.fetch_token(code=code)
creds = flow.credentials

print("\n=== GitHub Secret에 추가하세요 ===")
print(f"YOUTUBE_CLIENT_ID     = {CLIENT_ID}")
print(f"YOUTUBE_CLIENT_SECRET = {CLIENT_SECRET}")
print(f"YOUTUBE_REFRESH_TOKEN = {creds.refresh_token}")
