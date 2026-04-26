# 💥 vidBoom

> **Upload once. Explode everywhere.**

Google Drive에 세로형 영상을 올리면, 버튼 하나로 **YouTube Shorts · Instagram Reels · Threads · TikTok** 동시 발행 + 첫 댓글 자동 등록.

무료 오픈소스. 월정액 SaaS 불필요. git clone 하고 `.env` 채우면 끝.

---

## 기능

| 기능 | 설명 |
|------|------|
| 📁 Drive 연동 | Google Drive 폴더의 영상 목록 자동 조회 |
| 🚀 멀티 발행 | YouTube / Instagram / Threads / TikTok 동시 업로드 |
| 💬 첫 댓글 | 발행 직후 첫 댓글 자동 작성 |
| 📊 히스토리 | 발행 기록 + 플랫폼별 링크 보관 |
| 🐳 도커 배포 | `docker-compose up` 한 줄로 실행 |

---

## 빠른 시작

```bash
git clone https://github.com/cliphijack/vidBoom.git
cd vidBoom
cp backend/.env.example backend/.env
# backend/.env 열어서 API 키 채우기
docker-compose up --build
```

브라우저에서 `http://localhost:3000` 접속.

---

## 프로젝트 구조

```
vidBoom/
├── docker-compose.yml
├── backend/                   # FastAPI
│   ├── main.py
│   ├── services/gdrive.py     # Drive 영상 목록 / 다운로드
│   ├── platforms/
│   │   ├── youtube.py
│   │   ├── instagram.py
│   │   ├── threads.py
│   │   └── tiktok.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
└── frontend/                  # Next.js 15 + Tailwind
    ├── src/app/
    │   ├── page.tsx           # Drive 영상 그리드
    │   ├── publish/page.tsx   # 발행 폼
    │   └── history/page.tsx   # 발행 히스토리
    └── Dockerfile
```

---

## 플랫폼별 API 설정

### Google Drive + YouTube
1. [Google Cloud Console](https://console.cloud.google.com) → 프로젝트 생성
2. **Google Drive API**, **YouTube Data API v3** 활성화
3. OAuth 2.0 클라이언트 ID 생성 (데스크톱 앱)
4. `.env`에 `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 입력
5. Drive 폴더 ID → `GOOGLE_DRIVE_FOLDER_ID`

### Instagram / Threads
1. [Meta for Developers](https://developers.facebook.com) → 앱 생성
2. Instagram Basic Display + Threads API 추가
3. `.env`에 `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN` 입력

### TikTok
1. [TikTok for Developers](https://developers.tiktok.com) → Content Posting API 신청
2. `.env`에 `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_ACCESS_TOKEN` 입력

---

## 스택

- **Frontend**: Next.js 15 · TypeScript · Tailwind CSS
- **Backend**: FastAPI · Python 3.12
- **Infra**: Docker Compose

---

## License

MIT — 자유롭게 사용, 수정, 배포 가능.
