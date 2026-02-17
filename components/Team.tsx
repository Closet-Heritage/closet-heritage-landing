import Image from "next/image";

const teamMembers = [
  {
    name: "Sombang Patience Nyolengma",
    image: "/images/team-patience.jpg",
    role: "CEO & Co-Founder",
    bio: "Drives the vision behind Closet Heritage — making personal style accessible, intentional, and effortless for everyone.",
  },
  {
    name: "Ryan Tangu Mbun Tangwe",
    image: "/images/team-ryan.jpg",
    role: "CTO & Co-Founder",
    bio: "Architects the AI and engineering behind Closet Heritage — from wardrobe digitization to intelligent outfit planning.",
  },
];

export default function Team() {
  return (
    <section id="team" className="py-12 md:py-16">
      <div className="max-w-[1248px] mx-auto px-6 lg:px-12">
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 mb-10">
          <div>
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Who we are
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-foreground leading-snug">
              A small team of designers, builders, and problem-solvers creating
              meaningful experiences.
            </h2>
          </div>
          <div className="md:border-l md:border-border md:pl-6">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Our Mission
            </p>
            <p className="font-heading text-lg md:text-xl text-foreground leading-relaxed">
              To create simple, thoughtful experiences that help people make
              better choices with confidence.
            </p>
          </div>
        </div>

        <div className="h-px bg-border mb-10" />

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="border border-border/50 overflow-hidden flex flex-col"
            >
              {/* Photo */}
              <div className="relative aspect-[5/6] w-full overflow-hidden bg-muted">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-1.5">
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  {member.role}
                </p>
                <p className="font-heading text-xl md:text-2xl font-semibold text-foreground">
                  {member.name}
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mt-1">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
