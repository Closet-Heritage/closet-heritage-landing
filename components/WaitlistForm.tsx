"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function WaitlistForm({
  className = "",
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && status !== "success") {
      setStatus("idle");
      setMessage("");
    }
  }

  const buttonClass =
    variant === "light"
      ? "rounded-none h-11 px-8 bg-btn-cta-light text-foreground hover:bg-btn-cta-light-hover border border-border"
      : "rounded-none h-11 px-8 bg-btn-cta text-foreground hover:bg-btn-cta-hover border border-border";

  return (
    <>
      <Button className={`${buttonClass} ${className}`} onClick={() => setOpen(true)}>
        Get Early Access
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Get Early Access</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your email and we&apos;ll let you know when Closet Heritage is ready.
            </DialogDescription>
          </DialogHeader>

          {status === "success" ? (
            <div className="py-6 text-center">
              <p className="text-lg font-medium text-foreground">{message}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="rounded-none h-11"
              />
              {status === "error" && (
                <p className="text-sm text-destructive">{message}</p>
              )}
              <Button
                type="submit"
                disabled={status === "loading"}
                className="rounded-none h-11 w-full bg-foreground text-background hover:bg-foreground/90"
              >
                {status === "loading" ? "Joining..." : "Join the waitlist"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
