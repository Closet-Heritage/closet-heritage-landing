"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does outfit planning work?",
    answer:
      "You add your clothes, choose what you're dressing for, and Closet Heritage suggests outfit combinations based on your style and preferences.",
  },
  {
    question: "Do I need to upload all my clothes at once?",
    answer:
      "Not at all. You can start with just a few items and add more whenever you like. Closet Heritage works with whatever you've uploaded — even a handful of pieces is enough to start getting outfit suggestions.",
  },
  {
    question: "Does Closet Heritage automatically choose outfits for me?",
    answer:
      "Closet Heritage suggests outfits based on your wardrobe, the occasion, and your style preferences. You always have the final say — you can accept, tweak, or dismiss any suggestion.",
  },
  {
    question: "Can I plan outfits for different days or events?",
    answer:
      "Yes! You can plan outfits for specific days of the week or for special occasions like work meetings, dates, or casual outings. You can even plan a full week of outfits in advance.",
  },
  {
    question: "Does Closet Heritage work with African wear?",
    answer:
      "Absolutely. Closet Heritage is built for real wardrobes — including African fashion, traditional wear, and global styles. Our AI understands and works with diverse clothing types and cultural styles.",
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
