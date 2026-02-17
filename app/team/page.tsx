import Navbar from "@/components/Navbar";
import Team from "@/components/Team";
import Footer from "@/components/Footer";
import BottomBar from "@/components/BottomBar";

export const metadata = {
  title: "Our Team — Closet Heritage",
  description:
    "Meet the team behind Closet Heritage — designers, builders, and problem-solvers creating meaningful wardrobe experiences.",
};

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main>
        <Team />
      </main>
      <Footer />
      <BottomBar />
    </>
  );
}
