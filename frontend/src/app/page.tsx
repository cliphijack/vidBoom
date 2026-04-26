"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DriveVideo {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  thumbnailLink?: string;
}

export default function Home() {
  const [videos, setVideos] = useState<DriveVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVideos = () => {
    setLoading(true);
    fetch("/api/drive")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setVideos(data);
      })
      .catch((e) => setError(e.message || "Google Drive 연결 실패. 환경변수를 확인하세요."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVideos(); }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💥</span>
          <span className="font-bold text-xl tracking-tight">vidBoom</span>
          <span className="text-xs text-zinc-500 ml-2">Upload once. Explode everywhere.</span>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400">
          <Link href="/" className="text-white font-medium">영상 목록</Link>
          <Link href="/history" className="hover:text-white transition-colors">발행 히스토리</Link>
        </nav>
      </header>

      <main className="px-8 py-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Google Drive 영상</h1>
          <button onClick={fetchVideos} className="text-sm text-zinc-400 hover:text-white border border-zinc-700 px-4 py-2 rounded-lg transition-colors">
            새로고침
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-xl h-48 animate-pulse" />)}
          </div>
        ) : videos.length === 0 && !error ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-5xl mb-4">📁</p>
            <p>Google Drive 폴더에 영상이 없습니다.</p>
            <p className="text-sm mt-2">.env의 GOOGLE_DRIVE_FOLDER_ID를 확인하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {videos.map((v) => (
              <Link key={v.id} href={`/publish?id=${v.id}&name=${encodeURIComponent(v.name)}`}>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group cursor-pointer">
                  <div className="aspect-[9/16] bg-zinc-800 relative flex items-center justify-center">
                    {v.thumbnailLink
                      ? <img src={v.thumbnailLink} alt={v.name} className="w-full h-full object-cover" />
                      : <span className="text-4xl">🎬</span>}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm bg-black/60 px-4 py-2 rounded-full font-medium">
                        발행하기 →
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {(v.size / 1024 / 1024).toFixed(1)} MB · {new Date(v.createdTime).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
