import { CardGrid } from "./components/Card";
import { Footer } from "./components/Footer";
import { Header, type NavItem } from "./components/Header";
import { Hero, HeroButton } from "./components/Hero";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toolbar } from "./components/Toolbar";

const NAV: readonly NavItem[] = [
  { label: "Football", href: "/football", current: true },
  { label: "Basketball", href: "/basketball" },
  { label: "Baseball", href: "/baseball" },
  { label: "Softball", href: "/softball" },
  { label: "All Sports", href: "/sports" },
  { label: "Shop", href: "/shop" },
];

export default function App() {
  return (
    <>
      <a href="#main" className="ua-skip-link">
        Skip to content
      </a>

      <Header siteTitle="Arizona Athletics" nav={NAV} actions={<ThemeToggle />} />

      <main id="main">
        <Hero
          headline="Bear Down. Build Up."
          subhead="Be the next chapter in 140+ years of Wildcat resolve."
          cta={
            <>
              <HeroButton href="/tickets">Buy Tickets</HeroButton>
              <HeroButton href="/schedule">2026 Schedule</HeroButton>
            </>
          }
        />

        <Toolbar />

        <CardGrid
          cards={[
            {
              id: "mckale",
              eyebrow: "From McKale",
              headline: "Wildcats sweep weekend series",
              body: "A second-half surge carries the Cats past a ranked conference foe in three straight.",
              href: "/news/sweep",
            },
            {
              id: "stadium",
              eyebrow: "From Arizona Stadium",
              headline: "Tickets on sale for the season opener",
              body: "Single-game and season passes open this week. Bear Down for kickoff under the desert sky.",
              href: "/news/tickets",
            },
            {
              id: "desert",
              eyebrow: "From the Desert",
              headline: "Bear Down Fund hits new milestone",
              body: "Wildcat donors fuel the next generation of Arizona student-athletes across every program.",
              href: "/news/bear-down-fund",
            },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
