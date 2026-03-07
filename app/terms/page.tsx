import Navbar from "@/components/Navbar";
import BottomBar from "@/components/BottomBar";

export const metadata = {
  title: "Terms of Service — Closet Heritage",
  description:
    "Terms of Service for Closet Heritage, the AI-powered digital wardrobe app.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-[800px] mx-auto px-6 lg:px-12 py-16 md:py-24">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Last updated: March 7, 2026
        </p>

        <div className="space-y-10 text-foreground/90 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              1. About Closet Heritage
            </h2>
            <p>
              Closet Heritage is a mobile application that uses artificial
              intelligence to help you digitize your wardrobe, plan outfits, and
              visualize how clothing looks on you. These Terms of Service
              (&quot;Terms&quot;) govern your use of the Closet Heritage app and
              website (together, the &quot;Service&quot;), operated by Closet
              Heritage (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="mt-3">
              By creating an account or using the Service, you agree to these
              Terms. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              2. Eligibility
            </h2>
            <p>
              Closet Heritage is designed for a general audience. Users under the
              age of majority in their jurisdiction should have their parent or
              guardian&apos;s consent before using the Service. By using Closet
              Heritage, you confirm that you have any required parental or
              guardian consent.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              3. Your Account
            </h2>
            <p>
              You may sign up using email, Google, or Apple. You are responsible
              for keeping your login credentials secure and for all activity
              under your account. Please notify us immediately if you suspect
              unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              4. Your Content
            </h2>
            <p>
              You retain ownership of all photos and data you upload to Closet
              Heritage (&quot;Your Content&quot;). By uploading content, you
              grant us a limited, non-exclusive license to process, store, and
              display it solely to provide the Service to you. This includes:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                Analyzing clothing photos with AI to detect, tag, and categorize
                items
              </li>
              <li>Removing image backgrounds for cleaner wardrobe display</li>
              <li>
                Using your avatar photo to generate virtual try-on images
              </li>
              <li>Storing processed images in your personal wardrobe</li>
            </ul>
            <p className="mt-3">
              We do not sell, share, or use Your Content for any purpose other
              than delivering the Service to you. When you delete your account,
              all Your Content is permanently removed.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              5. AI-Generated Content
            </h2>
            <p>
              Closet Heritage uses AI to generate outfit suggestions, clothing
              tags, and virtual try-on images. These are provided for
              convenience and personal use. AI outputs may not always be
              accurate — for example, color detection or category assignments
              may occasionally be incorrect. You can edit any AI-generated tags
              or details at any time.
            </p>
            <p className="mt-3">
              Virtual try-on images are AI-generated approximations and may not
              perfectly represent how clothing will look in real life. They are
              meant as a helpful visualization, not a guarantee of fit or
              appearance.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              6. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1.5">
              <li>
                Upload content that is illegal, harmful, or violates the rights
                of others
              </li>
              <li>
                Upload photos of other people without their consent
              </li>
              <li>
                Attempt to reverse-engineer, decompile, or extract the AI models
                or algorithms used in the Service
              </li>
              <li>
                Use the Service for any commercial purpose without our written
                permission
              </li>
              <li>
                Interfere with or disrupt the Service or its infrastructure
              </li>
              <li>
                Create multiple accounts to circumvent restrictions
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              7. Intellectual Property
            </h2>
            <p>
              The Closet Heritage app, website, branding, AI models, and all
              related technology are owned by Closet Heritage and protected by
              intellectual property laws. Nothing in these Terms grants you any
              right to use our trademarks, logos, or branding.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              8. Service Availability
            </h2>
            <p>
              We strive to keep Closet Heritage available and reliable, but we
              do not guarantee uninterrupted access. The Service may be
              temporarily unavailable for maintenance, updates, or circumstances
              beyond our control. We may also modify or discontinue features
              with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              9. Disclaimers
            </h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, whether express or
              implied. We do not warrant that AI-generated suggestions will be
              suitable for any particular occasion, weather condition, or
              personal preference. Use your own judgment when selecting outfits.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Closet Heritage shall not
              be liable for any indirect, incidental, special, or consequential
              damages arising from your use of the Service. Our total liability
              for any claim related to the Service shall not exceed the amount
              you paid us in the 12 months preceding the claim, or $50 USD,
              whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              11. Account Termination
            </h2>
            <p>
              You may delete your account at any time from the app settings.
              This permanently removes your profile, wardrobe, outfit history,
              avatar, and all associated data.
            </p>
            <p className="mt-3">
              We may suspend or terminate your account if you violate these
              Terms or engage in activity that harms the Service or other users.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              12. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. If we make material
              changes, we will notify you through the app or by email. Your
              continued use of the Service after changes take effect constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              13. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Republic of Ghana. Any
              disputes shall be resolved in the courts of Accra, Ghana.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground mb-3">
              14. Contact Us
            </h2>
            <p>
              If you have questions about these Terms, reach out to us:
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
