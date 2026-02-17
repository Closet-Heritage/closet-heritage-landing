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
  label = "Get Early Access",
}: {
  className?: string;
  variant?: "dark" | "light";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
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
        body: JSON.stringify({ name: name.trim(), email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
        }, 5000);
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
        {label}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-background">
          {status === "success" ? (
            <div className="py-8 text-center">
              <p className="font-heading text-2xl font-medium text-foreground">You&apos;re on the list!</p>
              <p className="mt-3 text-sm text-muted-foreground">
                We&apos;ll notify you as soon as <strong>Closet Heritage</strong> is ready to test.
              </p>
            </div>
          ) : (
            <>
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Get Early Access</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your details and we&apos;ll let you know when <strong>Closet Heritage</strong> is ready.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="rounded-none h-11"
              />
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
