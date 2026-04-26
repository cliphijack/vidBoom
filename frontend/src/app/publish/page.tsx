"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PublishResult {
  platform: string;
  success: boolean;
  url?: string;
  error?: string;
}

const PLATFORMS = [
  { id: "youtube", label: "YouTube Shorts", icon: "▶" },
  { id: "instagram", label: "Instagram Reels", icon: "◈" },
  { id: "threads", label: "Threads", icon: "⌖" },
  { id: "tiktok", label: "TikTok", icon: "♪" },
];

function PublishForm() {
  const params = useSearchParams();
  const router = useRouter();
  const videoId = params.get("id") || "";
  const videoName = params.get("name") || "";

  const [title, setTitle] = useState(videoName.replace(/\.[^.]+$/, ""));
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [firstComment, setFirstComment] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["youtube", "instagram", "threads", "tiktok"]);
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState<PublishResult[] | null>(null);
  const [error, setError] = useState("");

  const toggle = (id: string) =>
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const publish = async () => {
    if (!videoId) return;
    if (platforms.length === 0) { setError("플랫폼을 하나 이상 선택하세요."); return; }
    setPublishing(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(`${API}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drive_file_id: videoId,
          title,
          description,
          hashtags: hashtags.split(/\s+/).filter(Boolean),
          first_comment: firstComment || undefined,
          platforms,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: PublishResult[] = await res.json();
      setResults(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "발행 실패");
    } finally {
      setPublishing(false);
    }
  };

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
          <Link href="/history" className="hover:text-white transition-colors">발행 히스토리</Link>
        </nav>
      </header>

      <main className="px-8 py-10 max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-zinc-500 text-sm hover:text-white transition-colors">← 목록으로</Link>
          <h1 className="text-2xl font-bold mt-3">발행하기</h1>
          {videoName && (
            <p className="text-zinc-400 text-sm mt-1 truncate">📹 {videoName}</p>
          )}
        </div>

        {!results ? (
          <div className="space-y-6">
            {/* platforms */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">플랫폼 선택</label>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      platforms.includes(p.id)
                        ? "border-white bg-white/10 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* title */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">제목</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="영상 제목"
              />
            </div>

            {/* description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 transition-colors resize-none"
                placeholder="영상 설명 (선택)"
              />
            </div>

            {/* hashtags */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">해시태그</label>
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="#shorts #viral #fyp"
              />
            </div>

            {/* first comment */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                첫 댓글 <span className="text-zinc-500 font-normal">(선택)</span>
              </label>
              <input
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="링크나 추가 정보를 첫 댓글로 남기세요"
              />
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-red-300 text-sm">{error}</div>
            )}

            <button
              onClick={publish}
              disabled={publishing || !videoId}
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
            >
              {publishing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  발행 중...
                </span>
              ) : (
                `💥 ${platforms.length}개 플랫폼에 발행`
              )}
            </button>
          </div>
        ) : (
          /* results */
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">발행 결과</h2>
            {results.map((r) => {
              const platform = PLATFORMS.find((p) => p.id === r.platform);
              return (
                <div
                  key={r.platform}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    r.success ? "border-green-800 bg-green-950/30" : "border-red-800 bg-red-950/30"
                  }`}
                >
                  <span className="text-xl">{platform?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{platform?.label}</p>
                    {r.success && r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline truncate block mt-1"
                      >
                        {r.url}
                      </a>
                    ) : (
                      <p className="text-xs text-red-400 mt-1">{r.error}</p>
                    )}
                  </div>
                  <span className={`text-lg ${r.success ? "text-green-400" : "text-red-400"}`}>
                    {r.success ? "✓" : "✗"}
                  </span>
                </div>
              );
            })}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setResults(null)}
                className="flex-1 py-3 border border-zinc-700 rounded-xl text-sm hover:border-zinc-500 transition-colors"
              >
                다시 발행
              </button>
              <Link href="/" className="flex-1">
                <button className="w-full py-3 bg-white text-black font-medium rounded-xl text-sm hover:bg-zinc-200 transition-colors">
                  목록으로
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PublishPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <PublishForm />
    </Suspense>
  );
}
