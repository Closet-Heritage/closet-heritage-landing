import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";

export const metadata = {
  title: "Delete Your Account — Closet Heritage",
  description:
    "Instructions for deleting your Closet Heritage account and associated data.",
};

export default function DeleteAccountPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          Delete Your Account
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: March 6, 2026
        </p>

        <div className="space-y-10 text-foreground/90 text-[15px] leading-relaxed">
          <section>
            <p>
              We respect your right to control your data. If you no longer wish
              to use Closet Heritage, you can permanently delete your account and
              all associated data directly from the app.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              How to Delete Your Account
            </h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Open the <strong>Closet Heritage</strong> app on your device.</li>
              <li>Go to the <strong>Profile</strong> tab (bottom-right).</li>
              <li>Scroll down and tap <strong>Delete Account</strong>.</li>
              <li>
                Type <strong>&quot;DELETE&quot;</strong> to confirm, then tap the{" "}
                <strong>Delete My Account</strong> button.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              What Gets Deleted
            </h2>
            <p className="mb-3">
              When you delete your account, the following data is{" "}
              <strong>permanently removed</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Your profile information (name, email, avatar)</li>
              <li>All clothing items and wardrobe data</li>
              <li>All outfit plans and virtual try-on images</li>
              <li>Your uploaded photos (originals, processed, and cropped images)</li>
              <li>Shared outfits and comments you&apos;ve made</li>
              <li>Push notification tokens and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              What We Retain
            </h2>
            <p>
              After account deletion, we do <strong>not</strong> retain any of
              your personal data. Your account and all associated data are
              permanently deleted from our servers. This action cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              Need Help?
            </h2>
            <p>
              If you&apos;re unable to access the app or need assistance
              deleting your account, contact us at{" "}
              <a
                href="mailto:hello@mail.closetheritage.com"
                className="text-warm-accent hover:underline"
              >
                hello@mail.closetheritage.com
              </a>{" "}
              and we&apos;ll process your request within 48 hours.
            </p>
          </section>
        </div>
      </main>
      <BottomBar />
    </>
  );
}
