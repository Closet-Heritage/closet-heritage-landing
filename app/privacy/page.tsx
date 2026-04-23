import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";

export const metadata = {
  title: "Privacy Policy — Closet Heritage",
  description:
    "Privacy Policy for Closet Heritage. Learn what data we collect, how AI processes your photos, how payments are handled, and your rights.",
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
          Last updated: April 23, 2026
        </p>

        <div className="space-y-10 text-foreground/90 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              1. Introduction
            </h2>
            <p>
              Closet Heritage (&quot;we&quot;, &quot;us&quot;, or
              &quot;our&quot;) respects your privacy. This Privacy Policy
              explains what data we collect, how we use it, how AI processes
              your photos, how payments are handled, and your rights regarding
              your personal information when you use the Closet Heritage mobile
              app and website (the &quot;Service&quot;).
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
                <strong>Avatar photo:</strong> A full-body photo used solely for
                virtual try-on generation (see Section 4 for how we handle this)
              </li>
              <li>
                <strong>Outfit preferences:</strong> Occasion, style vibes,
                pinned items, and dismissed combinations
              </li>
              <li>
                <strong>Comments and outfit names:</strong> Any text you enter
                on shared outfits or when naming items (see Section 7 for
                content moderation)
              </li>
              <li>
                <strong>Referral / promo codes:</strong> If you redeem a code,
                we store the code you used and link it to your account so the
                correct reward is applied
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
                <strong>Device identifier for anti-abuse:</strong> When you
                redeem a referral, gift, or promo code, we collect your iOS
                <code className="px-1"> identifierForVendor</code> or Android
                <code className="px-1"> ANDROID_ID</code>. These identifiers are
                scoped to our app, are not cross-app trackable, and are used
                solely to prevent the same device from repeatedly farming
                referral rewards
              </li>
              <li>
                <strong>Push notification tokens:</strong> Expo push tokens
                (which are ultimately delivered through Apple&apos;s APNs or
                Google&apos;s FCM) used to deliver notifications about completed
                processing, comments on shared outfits, and outfit reminders
              </li>
              <li>
                <strong>Usage analytics:</strong> Anonymized usage data such as
                screens visited, features used (e.g., outfit generation,
                virtual try-on), and session information, collected via PostHog
                (see Section 8)
              </li>
              <li>
                <strong>Error and crash data:</strong> JavaScript exceptions and
                error logs to help us identify and fix issues
              </li>
              <li>
                <strong>Session recordings:</strong> Anonymized screen sessions
                at a 10% sample rate, with text inputs masked for privacy.
                Clothing and try-on images are visible in recordings because
                they are core to how the Service is used
              </li>
              <li>
                <strong>Payment metadata:</strong> When you complete a purchase,
                we receive a transaction reference, amount, currency, plan or
                coin pack, and success/failure status. We never receive or store
                card numbers, mobile money PINs, CVVs, bank account numbers, or
                similar sensitive payment credentials (see Section 5)
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
                with clothing items to synthesize try-on visualization images
              </li>
              <li>
                <strong>Notifications:</strong> Sending push notifications about
                completed photo processing, comments on shared outfits, or
                outfit reminders
              </li>
              <li>
                <strong>Payments and subscriptions:</strong> Processing
                purchases, crediting coins, activating subscriptions, handling
                refunds, and sending renewal reminders
              </li>
              <li>
                <strong>Anti-abuse and security:</strong> Preventing spam,
                referral fraud, duplicate-account abuse, and payment fraud
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
              Closet Heritage uses Google&apos;s Gemini family of AI models
              (accessed through Google&apos;s paid Gemini API) to process your
              photos and generate content. When you upload a clothing photo, use
              virtual try-on, or generate outfits:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                Your images and related text (e.g., occasion, vibe) are sent to
                Google&apos;s AI services for processing — specifically for
                photo validation, item detection, clothing tagging, background
                removal, hallucination verification, and try-on image
                generation
              </li>
              <li>
                <strong>Paid tier — no training use:</strong> We use
                Google&apos;s paid Gemini API. Under Google&apos;s
                paid-tier terms, your prompts, uploads, and AI outputs are
                <strong> not used to train Google&apos;s AI models</strong> and
                are not retained by Google beyond the short window needed to
                fulfill the request and provide abuse protections
              </li>
              <li>
                <strong>AI-generated content disclosure:</strong> Virtual try-on
                images are <strong>synthesized by AI</strong> — they are
                approximations, not photographs of you actually wearing the
                items. Outfit suggestions, item tags, and grid layouts are
                likewise AI-generated and may contain errors or misclassifications
              </li>
              <li>
                Processed results (crops, try-on images, tags) are stored in
                your personal account and are not shared with other users,
                except when you explicitly share an outfit via the sharing
                feature
              </li>
            </ul>

            <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
              Avatar photos and biometric data
            </h3>
            <p>
              Your avatar is a full-body photo of you used solely to generate
              try-on images:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                We do <strong>not</strong> extract biometric templates, face
                embeddings, fingerprints, voiceprints, or any other biometric
                identifiers from your avatar
              </li>
              <li>
                We do <strong>not</strong> use your avatar for identity
                verification, face matching, surveillance, or any
                identification purpose
              </li>
              <li>
                Avatar photos are sent to Google Gemini for try-on generation
                under the paid-tier terms described above and are not retained
                by Google for training
              </li>
              <li>
                You can replace or delete your avatar at any time from the app.
                When you delete your account, your avatar is permanently deleted
                along with all other personal data
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              5. Payment Data
            </h2>
            <p>
              Closet Heritage offers subscriptions and one-time coin-pack
              purchases. We never see, process, or store your card numbers,
              mobile money PINs, CVVs, or bank account numbers — those are
              handled entirely by the payment providers below.
            </p>

            <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
              Payment providers
            </h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Apple In-App Purchase (iOS):</strong> Purchases on iOS
                are processed by Apple. Apple receives your Apple ID and payment
                method and handles the transaction. We receive a transaction
                identifier and subscription status from Apple via RevenueCat
              </li>
              <li>
                <strong>Google Play Billing (Android):</strong> Purchases on
                Android are processed by Google. Google receives your Google
                account and payment method and handles the transaction. We
                receive a transaction identifier and subscription status from
                Google via RevenueCat
              </li>
              <li>
                <strong>Paystack (Ghana — MTN MoMo, Telecel Cash, AirtelTigo,
                card):</strong> When you pay via our web checkout, you enter
                your payment details directly into Paystack. Paystack processes
                the payment and sends us a transaction reference, amount, and
                success/failure status. We pass your email and an anonymous user
                ID to Paystack so they can issue a receipt
              </li>
              <li>
                <strong>RevenueCat:</strong> We use RevenueCat to manage
                subscription entitlements and your coin balance across
                platforms. RevenueCat receives your Closet Heritage user ID,
                subscription events, and coin-ledger transactions. RevenueCat
                does not receive payment credentials
              </li>
            </ul>

            <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
              What we store
            </h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Transaction reference (from Apple, Google, or Paystack)</li>
              <li>Amount, currency, plan or coin pack identifier</li>
              <li>Status (success, failed, refunded, processing)</li>
              <li>Timestamp and channel (e.g., &quot;mobile_money&quot;)</li>
              <li>
                Your email (as used with the payment provider, for receipt
                delivery)
              </li>
            </ul>
            <p className="mt-3">
              We retain payment records for the duration required by tax,
              accounting, and fraud-prevention obligations (typically 7 years in
              jurisdictions where applicable), even after account deletion. See
              Section 11.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              6. Data Storage &amp; Security
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
              <li>
                Payment webhooks are signed with HMAC and verified before any
                state change is applied
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              7. Content Moderation
            </h2>
            <p>
              We apply automated content filters to user-submitted text
              (including outfit names and comments on shared outfits) to block
              profanity and abusive language. If your text is flagged, you will
              see an error and the text will not be saved; the specific words
              that triggered the filter may be shown so you can revise. We do
              not currently employ human moderators. Image content is not
              moderated by humans; the AI pipeline performs basic validation
              (e.g., full-body checks on avatars) but does not classify images
              for policy violations.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              8. Analytics &amp; Tracking
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
                Session recordings (a 10% sample of sessions, with text inputs
                masked for privacy)
              </li>
              <li>
                Error and crash reports
              </li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> use any advertising trackers, IDFA/GAID
              collection, or cross-app tracking. PostHog data is used solely for
              product improvement and is not shared with advertisers.
            </p>

            <h3 className="font-heading text-base font-semibold text-foreground mt-4 mb-2">
              Cookies
            </h3>
            <p>
              The mobile app does not use cookies. Our website
              (closetheritage.com) uses the following cookies:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                <strong>Theme preference (essential):</strong> a small cookie
                storing your light/dark-mode preference so the correct theme
                loads on your next visit
              </li>
              <li>
                <strong>PostHog analytics cookies:</strong> used to distinguish
                unique visitors and sessions in aggregate analytics. No
                personally identifying data is stored in these cookies
              </li>
            </ul>
            <p className="mt-3">
              We do not use advertising cookies, third-party marketing cookies,
              or any cookie that enables cross-site tracking.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              9. Data Sharing &amp; Third-Party Processors
            </h2>
            <p>
              We do <strong>not</strong> sell your personal data. We share data
              only with the third-party processors listed below, each acting on
              our behalf under contractual data-protection terms, and only to
              the extent necessary to deliver the Service.
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                <strong>Google (Gemini API):</strong> AI photo and text
                processing. See Section 4
              </li>
              <li>
                <strong>Supabase:</strong> Database, authentication, file
                storage, and realtime subscription infrastructure. Hosted in the
                EU (Frankfurt region)
              </li>
              <li>
                <strong>Railway:</strong> Backend application hosting
              </li>
              <li>
                <strong>PostHog:</strong> Product analytics and session
                recordings (US-hosted)
              </li>
              <li>
                <strong>Resend:</strong> Transactional email delivery
                (verification emails, referral and gift-code invitations,
                account notifications)
              </li>
              <li>
                <strong>RevenueCat:</strong> Subscription entitlement and virtual
                currency (coin) management
              </li>
              <li>
                <strong>Paystack:</strong> Payment processing for Ghana mobile
                money and card payments
              </li>
              <li>
                <strong>Apple and Google:</strong> In-app purchase processing,
                push notification delivery (APNs and FCM respectively), and, if
                you use Google or Apple sign-in, identity verification
              </li>
              <li>
                <strong>Expo:</strong> Push notification routing to APNs and FCM
              </li>
              <li>
                <strong>Legal and regulatory:</strong> We may disclose data if
                required by law, regulation, valid legal process, or to protect
                our rights, your safety, or the security of the Service
              </li>
              <li>
                <strong>Shared outfits:</strong> If you explicitly share an
                outfit, only the outfit details and try-on image are visible to
                anyone with the link. Your avatar, full wardrobe, and profile
                information are not exposed
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              10. International Data Transfers
            </h2>
            <p>
              Delivering the Service involves transferring your personal data
              across borders. In particular:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                Our primary database and storage are hosted in the{" "}
                <strong>European Union</strong> (Supabase, Frankfurt)
              </li>
              <li>
                AI processing (Google Gemini), analytics (PostHog), email
                (Resend), subscription management (RevenueCat), and backend
                hosting (Railway) are primarily hosted in the{" "}
                <strong>United States</strong>
              </li>
              <li>
                Paystack is hosted in <strong>Ghana</strong> and other African
                regions
              </li>
              <li>
                Apple and Google operate globally
              </li>
            </ul>
            <p className="mt-3">
              For transfers of EU/UK personal data to countries outside the
              EEA/UK, we rely on the{" "}
              <strong>European Commission&apos;s Standard Contractual
              Clauses</strong> (SCCs) and equivalent UK safeguards, together
              with supplementary technical measures (encryption in transit,
              access controls, row-level security). Each of our third-party
              processors listed in Section 9 has either executed SCCs with us or
              operates under an adequacy decision.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              11. Data Retention
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
              <li>
                <strong>Payment records exception:</strong> transaction records
                required for tax, accounting, and fraud-prevention compliance
                are retained for the period required by applicable law
                (typically up to 7 years). These records include only the
                reference, amount, status, and plan — not your clothing photos,
                avatar, or wardrobe content
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              12. Legal Basis for Processing (GDPR)
            </h2>
            <p>
              If you are located in the European Economic Area, the United
              Kingdom, or another jurisdiction with equivalent law, we rely on
              the following legal bases under the General Data Protection
              Regulation (GDPR) Article 6:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                <strong>Performance of a contract (Art. 6(1)(b)):</strong>{" "}
                Processing your account, photos, outfits, and payments to
                deliver the Service you signed up for
              </li>
              <li>
                <strong>Consent (Art. 6(1)(a)):</strong> Optional features such
                as analytics, session recordings, and push notifications. You
                can withdraw consent at any time through device settings or by
                contacting us
              </li>
              <li>
                <strong>Legitimate interest (Art. 6(1)(f)):</strong> Security,
                fraud prevention, anti-abuse (including referral device
                fingerprinting), debugging, and protecting the integrity of the
                Service
              </li>
              <li>
                <strong>Legal obligation (Art. 6(1)(c)):</strong> Retaining
                payment and tax records as required by law
              </li>
            </ul>
            <p className="mt-3">
              You have the right to lodge a complaint with your local data
              protection authority if you believe we have mishandled your data.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              13. Automated Decision-Making
            </h2>
            <p>
              We use AI-driven personalization to generate outfit suggestions,
              tag clothing items, and synthesize try-on images. These decisions
              are purely for convenience and do <strong>not</strong> produce
              legal effects or similarly significant effects on you within the
              meaning of GDPR Article 22. They do not affect pricing, creditworthiness,
              eligibility, or access to services.
            </p>
            <p className="mt-3">
              You can always override AI-generated tags, reject outfit
              suggestions (dismiss), or retake photos. If you believe an AI
              output has caused you harm, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              14. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                <strong>Access your data:</strong> View all your personal
                information, clothing items, and outfits within the app
              </li>
              <li>
                <strong>Correct your data:</strong> Update your name, gender,
                avatar, and all clothing item details at any time
              </li>
              <li>
                <strong>Delete your data:</strong> Delete individual items, or
                delete your entire account (which permanently removes all data
                including photos, outfits, and your profile, subject to the
                payment-record retention exception in Section 11)
              </li>
              <li>
                <strong>Port your data:</strong> Request a machine-readable
                export of your data by contacting us
              </li>
              <li>
                <strong>Object to or restrict processing:</strong> Where we rely
                on legitimate interest, you can object to specific processing
                activities
              </li>
              <li>
                <strong>Withdraw consent:</strong> Revoke push notification,
                analytics, or other optional permissions through your device
                settings or by contacting us
              </li>
              <li>
                <strong>Non-discrimination (California residents, CCPA/CPRA):</strong>{" "}
                We will not deny you service, charge you a different price, or
                provide a different quality of service because you exercised any
                of these rights
              </li>
              <li>
                <strong>Opt out of sale/sharing (California residents):</strong>{" "}
                We do not sell or share your personal information for targeted
                advertising. There is nothing to opt out of, but we state this
                explicitly for clarity
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              15. Children&apos;s Privacy
            </h2>
            <p>
              Closet Heritage is designed for a general audience and is rated 4+
              on the App Store and has a content rating on Google Play. We do
              not knowingly collect personal data from children under 13 without
              parental consent. If we learn that we have collected data from a
              child under 13, we will promptly delete it. If you are a parent or
              guardian and believe your child has provided us with personal
              data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              16. Changes to This Policy
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
              17. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or how we handle
              your data, or you want to exercise any of your rights, contact us:
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
