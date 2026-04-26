"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HistoryItem {
  id: string;
  drive_file_id: string;
  title: string;
  platforms: string[];
  results: { platform: string; success: boolean; url?: string; error?: string }[];
  published_at: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  youtube: "▶",
  instagram: "◈",
  threads: "⌖",
  tiktok: "♪",
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/history`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => setError("히스토리를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💥</span>
          <span className="font-bold text-xl tracking-tight">vidBoom</span>
          <span className="text-xs text-zinc-500 ml-2">Upload once. Explode everywhere.</span>
        </div>
        <nav className="flex gap-6 text-sm text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">영상 목록</Link>
          <Link href="/history" className="text-white font-medium">발행 히스토리</Link>
        </nav>
      </header>

      <main className="px-8 py-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">발행 히스토리</h1>

        {error && (
          <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300 text-sm mb-6">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 && !error ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-5xl mb-4">📭</p>
            <p>아직 발행 기록이 없습니다.</p>
            <Link href="/" className="inline-block mt-4 text-sm text-zinc-400 hover:text-white transition-colors underline">
              영상 목록으로 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const successCount = item.results.filter((r) => r.success).length;
              return (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(item.published_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      successCount === item.results.length
                        ? "bg-green-900 text-green-300"
                        : successCount === 0
                        ? "bg-red-900 text-red-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}>
                      {successCount}/{item.results.length} 성공
                    </span>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {item.results.map((r) => (
                      <div key={r.platform} className="flex items-center gap-1.5">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                          >
                            <span>{PLATFORM_ICONS[r.platform]}</span>
                            <span className="capitalize">{r.platform}</span>
                            <span className="text-green-400">✓</span>
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <span>{PLATFORM_ICONS[r.platform]}</span>
                            <span className="capitalize">{r.platform}</span>
                            <span className="text-red-400">✗</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
