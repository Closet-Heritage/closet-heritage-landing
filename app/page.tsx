import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Quote from "@/components/Quote";
import HowItWorks from "@/components/HowItWorks";
import Rediscover from "@/components/Rediscover";
import Features from "@/components/Features";
import BuiltForReal from "@/components/BuiltForReal";
import FinalCTA from "@/components/FinalCTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import BottomBar from "@/components/BottomBar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Quote
          text="Don't buy more clothes. Learn how to wear what you own."
          attribution="— Vivienne Westwood"
        />
        <HowItWorks />
        <Rediscover />
        <Features />
        <BuiltForReal />
        <FinalCTA />
        <FAQ />
      </main>
      <Footer />
      <BottomBar />
    </>
  );
}
