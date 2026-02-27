import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";

export const metadata = {
  title: "Privacy Policy — Closet Heritage",
  description:
    "Privacy Policy for Closet Heritage. Learn how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: February 27, 2026
        </p>

        <div className="space-y-10 text-foreground/90 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              1. Introduction
            </h2>
            <p>
              Closet Heritage (&quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) respects your privacy. This Privacy Policy
              explains what data we collect, how we use it, and your rights
              regarding your personal information when you use the Closet
              Heritage mobile app and website (the &quot;Service&quot;).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              2. Data We Collect
            </h2>

            <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
              Information you provide
            </h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Account information:</strong> Name, email address,
                gender, and authentication data (email/password, Google, or
                Apple sign-in)
              </li>
              <li>
                <strong>Profile preferences:</strong> Washing frequency and
                display preferences (e.g., dark mode)
              </li>
              <li>
                <strong>Clothing photos:</strong> Photos you upload of your
                clothing items
              </li>
              <li>
                <strong>Avatar photo:</strong> A full-body photo used for
                virtual try-on
              </li>
              <li>
                <strong>Outfit preferences:</strong> Occasion, style vibes,
                pinned items, and dismissed combinations
              </li>
            </ul>

            <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
              Information collected automatically
            </h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Device information:</strong> Device type, operating
                system, and push notification tokens
              </li>
              <li>
                <strong>Location (optional):</strong> Approximate location for
                weather-appropriate outfit suggestions, only when you grant
                permission
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              3. How We Use Your Data
            </h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Wardrobe management:</strong> Processing your clothing
                photos with AI to detect, categorize, tag, and remove
                backgrounds from clothing items
              </li>
              <li>
                <strong>Outfit planning:</strong> Generating personalized outfit
                suggestions based on your wardrobe, preferences, and context
                (occasion, weather, style vibe)
              </li>
              <li>
                <strong>Virtual try-on:</strong> Combining your avatar photo
                with clothing items to generate visualization images
              </li>
              <li>
                <strong>Notifications:</strong> Sending push notifications about
                completed photo processing or outfit reminders
              </li>
              <li>
                <strong>Service improvement:</strong> Understanding usage
                patterns to improve features and fix issues
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              4. AI Processing
            </h2>
            <p>
              Closet Heritage uses third-party AI services (Google Gemini) to
              process your photos and generate content. When you upload a
              clothing photo or use virtual try-on:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                Your images are sent to AI services for processing (detection,
                tagging, background removal, try-on generation)
              </li>
              <li>
                AI processing is performed solely to deliver features to you —
                your images are not used to train AI models
              </li>
              <li>
                Processed results are stored in your personal account and are
                not shared with other users
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              5. Data Storage &amp; Security
            </h2>
            <p>
              Your data is stored securely using Supabase (cloud
              infrastructure) with the following measures:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>All data is encrypted in transit (TLS/SSL)</li>
              <li>Database access is controlled by row-level security policies</li>
              <li>
                Images are stored in secure cloud storage with access restricted
                to your account
              </li>
              <li>
                Authentication tokens are stored securely on your device
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              6. Data Sharing
            </h2>
            <p>
              We do <strong>not</strong> sell your personal data. We only share
              data in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                <strong>AI service providers:</strong> Images are sent to Google
                Gemini for processing (subject to Google&apos;s data processing
                terms)
              </li>
              <li>
                <strong>Infrastructure providers:</strong> Data is stored on
                Supabase (cloud hosting) and processed on our backend servers
              </li>
              <li>
                <strong>Legal requirements:</strong> If required by law,
                regulation, or legal process
              </li>
              <li>
                <strong>Shared outfits:</strong> If you choose to share an
                outfit via a link, only the outfit details and try-on image (not
                your avatar or full wardrobe) are visible to anyone with the
                link
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                <strong>Access your data:</strong> View all your personal
                information, clothing items, and outfits within the app
              </li>
              <li>
                <strong>Edit your data:</strong> Update your name, gender, avatar,
                and all clothing item details at any time
              </li>
              <li>
                <strong>Delete your data:</strong> Delete individual items, or
                delete your entire account (which permanently removes all data
                including photos, outfits, and your profile)
              </li>
              <li>
                <strong>Withdraw consent:</strong> Revoke location or
                notification permissions through your device settings at any
                time
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              8. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. When
              you delete your account:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                All personal data, clothing photos, processed images, outfits,
                and your avatar are permanently deleted
              </li>
              <li>
                Deletion is immediate and irreversible
              </li>
              <li>
                We may retain anonymized, aggregated data (e.g., total user
                counts) that cannot be linked back to you
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Closet Heritage is not intended for children under 16. We do not
              knowingly collect data from anyone under 16. If we learn that we
              have collected data from a child under 16, we will promptly delete
              it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              10. Cookies &amp; Tracking
            </h2>
            <p>
              The Closet Heritage mobile app does not use cookies. Our website
              may use essential cookies for functionality (e.g., form
              submissions). We do not use third-party advertising trackers or
              analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              11. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              material changes, we will notify you through the app or by email.
              The &quot;Last updated&quot; date at the top reflects the most
              recent revision.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              12. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or how we handle
              your data, contact us:
            </p>
            <ul className="list-none mt-3 space-y-1.5">
              <li>
                Email:{" "}
                <a
                  href="mailto:info@closetheritage.com"
                  className="text-warm-accent hover:underline"
                >
                  info@closetheritage.com
                </a>
              </li>
              <li>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/233549034076"
                  className="text-warm-accent hover:underline"
                >
                  +233 54 903 4076
                </a>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <BottomBar />
    </>
  );
}
