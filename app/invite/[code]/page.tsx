import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { normalizeCode } from "@/lib/invite-config";
import { InviteClient } from "./InviteClient";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { code: rawCode } = await params;
  const code = normalizeCode(rawCode);
  const title = code
    ? `You've been invited to Closet Heritage (${code})`
    : "Closet Heritage";
  return {
    title,
    description:
      "Claim your invite code and get free coins when you join Closet Heritage — the AI stylist for what you already own.",
    openGraph: {
      title,
      description:
        "Claim your invite code and get free coins when you join Closet Heritage.",
      type: "website",
    },
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code: rawCode } = await params;
  const code = normalizeCode(rawCode);
  if (!code) notFound();

  return <InviteClient code={code} />;
}
