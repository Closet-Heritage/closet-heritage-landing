"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3000/api/v1";

interface ReactionsData {
  counts: { up: number; down: number };
  userReaction: "up" | "down" | null;
}

export function ReactionBar({ shareCode }: { shareCode: string }) {
  const [data, setData] = useState<ReactionsData>({
    counts: { up: 0, down: 0 },
    userReaction: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Restore persisted reaction from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`ch-reactions-${shareCode}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userReaction) {
          setData((prev) => ({ ...prev, userReaction: parsed.userReaction }));
        }
      } catch {
        /* ignore */
      }
    }
  }, [shareCode]);

  // Fetch reactions from server
  useEffect(() => {
    async function fetchReactions() {
      try {
        const res = await fetch(
          `${BACKEND_URL}/shared/${shareCode}/reactions`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setData(json.data);
            localStorage.setItem(
              `ch-reactions-${shareCode}`,
              JSON.stringify({ userReaction: json.data.userReaction })
            );
          }
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchReactions();
  }, [shareCode]);

  const handleToggle = async (reactionType: "up" | "down") => {
    if (isToggling) return;

    // Optimistic update
    const previous = { ...data, counts: { ...data.counts } };
    const newData = { ...data, counts: { ...data.counts } };

    if (data.userReaction === reactionType) {
      // Removing
      newData.counts[reactionType] = Math.max(0, newData.counts[reactionType] - 1);
      newData.userReaction = null;
    } else {
      // Adding or switching
      if (data.userReaction) {
        newData.counts[data.userReaction] = Math.max(
          0,
          newData.counts[data.userReaction] - 1
        );
      }
      newData.counts[reactionType] = newData.counts[reactionType] + 1;
      newData.userReaction = reactionType;
    }

    setData(newData);
    setIsToggling(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/shared/${shareCode}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          localStorage.setItem(
            `ch-reactions-${shareCode}`,
            JSON.stringify({ userReaction: json.data.userReaction })
          );
        }
      } else {
        // Rollback
        setData(previous);
      }
    } catch {
      setData(previous);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) return null;

  return (
    <>
      <button
        onClick={() => handleToggle("down")}
        disabled={isToggling}
        className={`absolute top-3 left-3 flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
          data.userReaction === "down"
            ? "bg-white/95 text-warm-accent"
            : "bg-white/70 text-muted-foreground hover:bg-white/90"
        }`}
      >
        <ThumbsDown
          size={14}
          fill={data.userReaction === "down" ? "currentColor" : "none"}
        />
        <span className="text-xs font-body font-semibold">
          {data.counts.down}
        </span>
      </button>
      <button
        onClick={() => handleToggle("up")}
        disabled={isToggling}
        className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
          data.userReaction === "up"
            ? "bg-white/95 text-warm-accent"
            : "bg-white/70 text-muted-foreground hover:bg-white/90"
        }`}
      >
        <ThumbsUp
          size={14}
          fill={data.userReaction === "up" ? "currentColor" : "none"}
        />
        <span className="text-xs font-body font-semibold">
          {data.counts.up}
        </span>
      </button>
    </>
  );
}
