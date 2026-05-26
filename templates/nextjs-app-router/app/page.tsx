import { Card } from "@/components/Card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Toolbar } from "@/components/Toolbar";

/**
 * Home demo page composing the six required components in their canonical
 * arrangement: Header → Hero → Toolbar → grid of Cards → Footer.
 *
 * Three Card variants are rendered to demonstrate the component contract:
 *   1. Eyebrow + headline + body + footer slot (full)
 *   2. Headline + body + footer slot (no eyebrow)
 *   3. Eyebrow + headline + body only (minimal, no footer)
 */
export default function HomePage(): React.ReactElement {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <Hero
          headline="Bear Down. Always."
          subhead="The official starter for Arizona Athletics web projects."
          ctaLabel="Get Started"
          ctaHref="#cards"
          secondaryCtaLabel="Read the docs"
          secondaryCtaHref="https://github.com/arizona-athletics"
        />
        <Toolbar
          title="Featured"
          filters={["All", "Football", "Basketball", "Olympic Sports"]}
        />
        <section
          id="cards"
          aria-label="Featured content"
          className="mx-auto w-full max-w-default px-4 py-8 md:py-10"
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              eyebrow="Football"
              headline="Wildcats Take the Territorial Cup"
              body="Arizona defeats ASU 38-35 in double overtime."
              href="#"
              footer={<span className="text-semantic-text-muted text-sm">Nov 30, 2025</span>}
            />
            <Card
              headline="2026 Basketball Schedule Released"
              body="Tipoff confirmed for McKale Center; full slate now available."
              href="#"
              footer={<span className="text-semantic-text-muted text-sm">Today</span>}
            />
            <Card
              eyebrow="Track & Field"
              headline="Pac-12 Indoor Championships"
              body="Six Wildcats earn all-conference honors over the weekend."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
