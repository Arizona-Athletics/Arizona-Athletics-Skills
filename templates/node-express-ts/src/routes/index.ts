/**
 * Index route — renders the canonical UA Athletics home page (hero + toolbar
 * + 3-card grid).
 */

import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.render("pages/home", {
    title: "Arizona Athletics",
    // Hero copy follows the voice/content rules in the design spec:
    // confident, short, second-person. "Bear Down. Build Up." as the punctuation.
    hero: {
      headline: "Bear Down. Build Up.",
      sub: "Be the next chapter in 140+ years of Wildcat resolve.",
      ctas: [
        { href: "/tickets", label: "Buy Tickets" },
        { href: "/schedule", label: "See the Schedule" },
      ],
    },
    toolbar: [
      { href: "/tickets", label: "Tickets" },
      { href: "/schedule", label: "Schedule" },
      { href: "/roster", label: "Roster" },
      { href: "/news", label: "News" },
      { href: "/watch", label: "Watch" },
    ],
    cards: [
      {
        eyebrow: "From McKale",
        headline: "Wildcats sweep weekend series",
        body:
          "A second-half surge in front of a sold-out McKale Center sends the Cats into conference play unbeaten at home.",
        href: "/news/sweep",
      },
      {
        eyebrow: "From Arizona Stadium",
        headline: "Defense holds the line under the lights",
        body:
          "Three turnovers, a goal-line stand, and a Tucson crowd that refused to sit down — the Cats steal a road win on the rivalry's biggest stage.",
        href: "/news/stadium",
      },
      {
        eyebrow: "From the Desert",
        headline: "Wildcat softball opens its 35th season",
        body:
          "Hillenbrand's grass is cut, the schedule is set, and the Cats step back into the sun for opening weekend — bear down for nine innings.",
        href: "/news/softball",
      },
    ],
  });
});

export default router;
