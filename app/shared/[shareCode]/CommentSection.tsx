"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Trash2, Flag, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment" },
  { value: "other", label: "Other" },
] as const;

// ============================================
// Confirm Dialog
// ============================================
function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-full flex-shrink-0 ${confirmVariant === "danger" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
            <AlertTriangle size={18} className={confirmVariant === "danger" ? "text-red-500" : "text-amber-500"} />
          </div>
          <div>
            <h3 className="text-base font-heading font-semibold text-foreground">{title}</h3>
            <p className="text-sm font-body text-muted-foreground mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-body font-medium text-white rounded-lg transition-colors cursor-pointer ${
              confirmVariant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-amber-500 hover:bg-amber-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Report Modal
// ============================================
function ReportModal({
  open,
  onReport,
  onClose,
}: {
  open: boolean;
  onReport: (reason: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const canSubmit = selected && (selected !== "other" || otherText.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    await onReport(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-muted">
              <Flag size={16} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-heading font-semibold text-foreground">Report comment</h3>
              <p className="text-xs font-body text-muted-foreground">Why are you reporting this?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reason options */}
        <div className="px-5 pb-2 space-y-2">
          {REPORT_REASONS.map((reason) => {
            const isSelected = selected === reason.value;
            return (
              <button
                key={reason.value}
                onClick={() => setSelected(reason.value)}
                className={`w-full text-left px-4 py-3 text-sm font-body rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-warm-accent bg-warm-accent/5 text-foreground font-medium"
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? "border-warm-accent" : "border-border"
                  }`}>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-warm-accent" />}
                  </span>
                  {reason.label}
                </span>
              </button>
            );
          })}

          {/* Other — text input */}
          {selected === "other" && (
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Please describe the issue..."
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 text-sm font-body bg-secondary text-foreground placeholder:text-muted-foreground rounded-xl border border-border focus:border-warm-accent focus:outline-none resize-none transition-colors"
            />
          )}
        </div>

        {/* Submit */}
        <div className="px-5 pt-3 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full py-2.5 text-sm font-body font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
          >
            {isSubmitting ? "Reporting..." : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Comment Section
// ============================================
interface CommentSectionProps {
  shareCode: string;
}

export function CommentSection({ shareCode }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [deleteTokens, setDeleteTokens] = useState<Record<string, string>>({});
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Restore saved name and delete tokens from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("ch-comment-name");
    if (savedName) setAuthorName(savedName);
    try {
      const saved = localStorage.getItem("ch-comment-tokens");
      if (saved) setDeleteTokens(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

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

    const trimmedName = authorName.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }
    if (!trimmedContent) {
      toast.error("Please write a comment");
      return;
    }

    // Optimistic insert
    const optimisticComment: Comment = {
      id: `optimistic-${Date.now()}`,
      authorName: trimmedName,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setContent("");
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
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        setContent(trimmedContent);
        toast.error("Too many comments. Please wait a moment.");
        return;
      }

      if (!res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
        setContent(trimmedContent);
        try {
          const errJson = await res.json();
          toast.error(errJson?.error?.message || "Failed to post comment. Please try again.");
        } catch {
          toast.error("Failed to post comment. Please try again.");
        }
        return;
      }

      const json = await res.json();
      const { deleteToken: token, ...realComment } = json.data;

      // Replace optimistic comment with real one
      setComments((prev) =>
        prev.map((c) => (c.id === optimisticComment.id ? realComment : c))
      );

      // Store delete token for this comment
      if (token && realComment.id) {
        const updated = { ...deleteTokens, [realComment.id]: token };
        setDeleteTokens(updated);
        localStorage.setItem("ch-comment-tokens", JSON.stringify(updated));
      }

      // Persist name for next time
      localStorage.setItem("ch-comment-name", trimmedName);

      toast.success(`Thanks, ${trimmedName}!`, {
        description: "Your comment has been posted.",
      });
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setContent(trimmedContent);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const token = deleteTokens[commentId];
    if (!token) return;

    // Optimistic removal
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== commentId));
    setDeletingCommentId(null);

    try {
      const res = await fetch(
        `${BACKEND_URL}/shared/comments/${commentId}/delete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deleteToken: token }),
        }
      );

      if (!res.ok) {
        setComments(prev);
        toast.error("Failed to delete comment");
        return;
      }

      // Remove token from storage
      const { [commentId]: _removed, ...remaining } = deleteTokens;
      setDeleteTokens(remaining);
      localStorage.setItem("ch-comment-tokens", JSON.stringify(remaining));
      toast.success("Comment deleted");
    } catch {
      setComments(prev);
      toast.error("Failed to delete comment");
    }
  };

  const handleReport = async (reason: string) => {
    const commentId = reportingCommentId;
    if (!commentId) return;

    try {
      const res = await fetch(
        `${BACKEND_URL}/shared/comments/${commentId}/report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      if (res.ok) {
        toast.success("Comment reported. Thanks for helping keep things safe.");
      } else {
        const errJson = await res.json().catch(() => null);
        toast.error(errJson?.error?.message || "Failed to report comment");
      }
    } catch {
      toast.error("Failed to report comment");
    }
    setReportingCommentId(null);
  };

  const canSend = authorName.trim().length > 0 && content.trim().length > 0 && !isSending;

  return (
    <div>
      <h2 className="text-sm font-body font-semibold text-muted-foreground uppercase tracking-wider mb-5 flex items-center gap-2">
        <MessageCircle size={16} />
        Comments {!isLoading && `(${comments.length})`}
      </h2>

      {/* Comment form — card style */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="rounded-xl border border-border overflow-hidden focus-within:border-warm-accent transition-colors">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={50}
            className="w-full px-4 py-3 text-sm font-body bg-transparent text-foreground placeholder:text-muted-foreground border-b border-border focus:outline-none"
          />
          <div className="flex items-end gap-2 px-4 py-3">
            <textarea
              placeholder="Say something nice..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1000}
              rows={2}
              className="flex-1 text-sm font-body bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
              style={{ maxHeight: 120 }}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="flex-shrink-0 p-2 text-warm-accent hover:text-foreground disabled:text-border transition-colors disabled:cursor-not-allowed"
              aria-label="Send comment"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-border/40" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-border/40 rounded" />
                <div className="h-3 w-full bg-border/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={28} className="mx-auto text-border mb-3" strokeWidth={1.5} />
          <p className="text-sm font-body text-muted-foreground">
            No comments yet
          </p>
          <p className="text-xs font-body text-muted-foreground mt-1">
            Be the first to share your thoughts
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 group ${comment.id.startsWith("optimistic-") ? "opacity-60" : ""}`}
            >
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
                <p className="text-sm font-body text-foreground mt-0.5 break-words leading-relaxed">
                  {comment.content}
                </p>
              </div>
              {/* Delete (own comment) */}
              {deleteTokens[comment.id] && !comment.id.startsWith("optimistic-") && (
                <button
                  onClick={() => setDeletingCommentId(comment.id)}
                  className="self-center p-1.5 text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {/* Report (others' comments) */}
              {!deleteTokens[comment.id] && !comment.id.startsWith("optimistic-") && (
                <button
                  onClick={() => setReportingCommentId(comment.id)}
                  className="self-center p-1.5 text-amber-400 hover:text-amber-500 transition-colors cursor-pointer"
                  aria-label="Report comment"
                >
                  <Flag size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deletingCommentId}
        title="Delete comment?"
        message="This comment will be permanently removed. This can't be undone."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={() => deletingCommentId && handleDelete(deletingCommentId)}
        onCancel={() => setDeletingCommentId(null)}
      />

      {/* Report modal */}
      <ReportModal
        key={reportingCommentId ?? 'closed'}
        open={!!reportingCommentId}
        onReport={handleReport}
        onClose={() => setReportingCommentId(null)}
      />
    </div>
  );
}
