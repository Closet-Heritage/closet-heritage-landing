"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000/api/v1";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function CommentSection({ shareCode }: { shareCode: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`${BACKEND_URL}/shared/${shareCode}/comments`);
        if (res.ok) {
          const json = await res.json();
          setComments(json.data?.comments ?? []);
        }
      } catch {
        // Silent fail — comments are optional
      } finally {
        setIsLoading(false);
      }
    }
    fetchComments();
  }, [shareCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = authorName.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      setError("Please enter your name");
      return;
    }
    if (!trimmedContent) {
      setError("Please write a comment");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${BACKEND_URL}/shared/${shareCode}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: trimmedName,
          content: trimmedContent,
        }),
      });

      if (res.status === 429) {
        setError("Too many comments. Please wait a moment.");
        return;
      }

      if (!res.ok) {
        setError("Failed to post comment. Please try again.");
        return;
      }

      const json = await res.json();
      setComments((prev) => [json.data, ...prev]);
      setContent("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-body font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <MessageCircle size={16} />
        Comments ({isLoading ? "..." : comments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
            className="flex-shrink-0 sm:w-40 px-3 py-2 text-sm font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Leave a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              className="flex-1 px-3 py-2 text-sm font-body bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 bg-btn-cta text-foreground font-body text-sm font-semibold hover:bg-btn-cta-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
        {error && (
          <p className="text-xs font-body text-destructive">{error}</p>
        )}
      </form>

      {/* Comments list */}
      {isLoading ? (
        <p className="text-sm font-body text-muted-foreground">
          Loading comments...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm font-body text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-heading font-semibold text-foreground">
                  {comment.authorName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-body font-semibold text-foreground">
                    {comment.authorName}
                  </span>
                  <span className="text-[10px] font-body text-muted-foreground">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm font-body text-foreground mt-0.5 break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
