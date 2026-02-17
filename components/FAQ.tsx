"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I add my clothes to the app?",
    answer:
      "Just snap a photo or pick one from your gallery. You can even photograph multiple pieces laid out together — our AI detects each item individually, tags it with details like category, color, pattern, and material, and removes the background automatically. No manual data entry needed.",
  },
  {
    question: "How does outfit planning work?",
    answer:
      "Pick the occasion (work, casual, date night, formal, and more), choose a style vibe (classic, bold, afrocentric, relaxed, minimal), set the weather, and Closet Heritage generates outfit combinations from your actual wardrobe. You get multiple suggestions to swipe through, and you can even pin specific items you want to build an outfit around.",
  },
  {
    question: "Do I need to upload all my clothes at once?",
    answer:
      "Not at all. You can start with just a few items and add more whenever you like. Even a handful of pieces is enough to start getting outfit suggestions. You can also leave during processing and come back later — your progress is saved.",
  },
  {
    question: "Can I see how an outfit looks on me before wearing it?",
    answer:
      "Yes — Closet Heritage has a virtual try-on feature. Upload a full-body photo of yourself, and the AI generates a realistic image of you wearing any outfit combination from your wardrobe, so you can see how it looks before getting dressed.",
  },
  {
    question: "What if I don't like a suggested outfit?",
    answer:
      "You're always in control. Dismiss any suggestion and it won't come back. You can also choose exactly which item combinations to reject, so the app learns what you don't like. If you change your mind later, you can restore dismissed combinations from your settings.",
  },
  {
    question: "Can I plan outfits for a full week?",
    answer:
      "Yes. You can plan anywhere from 1 to 7 days at once. The app tracks what you've already planned and worn, avoids repeating items too soon, and gives you a weekly calendar view so you always know what's coming up.",
  },
  {
    question: "Does Closet Heritage work with African wear?",
    answer:
      "Absolutely. Closet Heritage is built for real wardrobes — including African fashion, traditional wear like kaftans, dashikis, and agbadas, and global styles. Our AI recognizes and works with diverse clothing types and cultural styles.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Your wardrobe data and photos are stored securely in the cloud and are never sold or shared. If you ever want to leave, you can delete your account and all your data — including every image — is permanently removed.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-16 md:py-24">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-semibold text-foreground mb-8">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-sm md:text-base font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
