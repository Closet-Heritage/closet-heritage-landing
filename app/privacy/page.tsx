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
          Last updated: March 7, 2026
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
                <strong>Device information:</strong> Device model, operating
                system version, screen size, app version, and language/locale
              </li>
              <li>
                <strong>Push notification tokens:</strong> Used to deliver
                notifications about completed processing and outfit reminders
              </li>
              <li>
                <strong>Usage analytics:</strong> We collect anonymized usage
                data such as screens visited, features used (e.g., outfit
                generation, virtual try-on), and session information to improve
                the Service. This data is collected via PostHog, a privacy-focused
                analytics platform.
              </li>
              <li>
                <strong>Error and crash data:</strong> JavaScript exceptions and
                error logs to help us identify and fix issues
              </li>
              <li>
                <strong>Session recordings:</strong> We may record anonymized
                screen sessions (with text inputs masked) to understand how
                users interact with the app and improve the experience. Clothing
                images are visible in recordings as they are core to the
                Service.
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
                <strong>Analytics provider:</strong> Usage data, session
                recordings, and error reports are processed by PostHog (US
                servers) to help us improve the Service. PostHog does not sell
                your data or use it for advertising.
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
              Closet Heritage is designed for a general audience and is rated 4+
              on the App Store and has a content rating on Google Play. We do not
              knowingly collect personal data from children under 13 without
              parental consent. If we learn that we have collected data from a
              child under 13, we will promptly delete it. If you are a parent or
              guardian and believe your child has provided us with personal data,
              please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              10. Analytics &amp; Tracking
            </h2>
            <p>
              We use PostHog, a privacy-focused analytics platform, to
              understand how the app is used and to improve the Service. PostHog
              collects:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                Usage events (e.g., features used, screens visited)
              </li>
              <li>
                Device information (model, OS version, screen size, language)
              </li>
              <li>
                Session recordings (a sample of sessions, with text inputs
                masked for privacy)
              </li>
              <li>
                Error and crash reports
              </li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> use any advertising trackers or
              cross-app tracking. PostHog data is used solely for product
              improvement and is not shared with advertisers. Our website may use
              essential cookies for functionality. The mobile app does not use
              cookies.
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
