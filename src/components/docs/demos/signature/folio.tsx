"use client";

import { useState } from "react";
import { Folio, Sidenote } from "@/mizu";
import { Scenarios } from "./shared";

type Scenario = "wide" | "column";

/** An original essay, written for this demo. */
function Essay() {
  return (
    <>
      <h2 id="folio-decision">A line is a decision</h2>
      <p>
        Every interface is drawn with lines before it is drawn with anything
        else. Long before colour, type or motion arrive, someone decides where
        one thing ends and the next begins — and that decision is almost always
        a line.
        <Sidenote>
          Even a gap is a line of sorts: one drawn without ink, which the eye
          completes anyway.
        </Sidenote>
      </p>
      <p>
        The thinnest line a screen can draw is called a hairline. On paper it
        was the finest stroke a pen could hold without breaking; on a display it
        is a single device pixel, which is why the same design can look delicate
        on one screen and faint on another.
        <Sidenote>
          On dense displays one CSS pixel spans several device pixels, so a 1px
          rule has quietly thickened.
        </Sidenote>{" "}
        Drawing with hairlines is a wager that the reader will lean in.
      </p>

      <h2 id="folio-ruling-pen">The ruling pen</h2>
      <p>
        Draughtsmen once drew their finest lines with a ruling pen: two steel
        blades, a screw to set the gap between them, and a drop of ink held
        between the blades by surface tension.
        <Sidenote>
          The screw was the whole instrument. A quarter turn changed the weight
          of every line after it, so it was set once and left alone.
        </Sidenote>{" "}
        The pen could not improvise. It drew exactly the line it had been set to
        draw, again and again — which is precisely what a system asks of its
        components.
      </p>
      <blockquote>
        A system is a ruling pen: set once, trusted everywhere.
      </blockquote>
      <p>
        The discipline was in the setting. A drawing with three line weights
        reads as a drawing; a drawing with eleven reads as a mess, however
        carefully each line is made.
        <Sidenote>
          Drafting standards settle on a handful of widths, each tied to a
          meaning: outlines, hidden edges, centre lines.
        </Sidenote>{" "}
        Interfaces are no different, and the temptation to add a twelfth weight
        never goes away.
      </p>

      <h2 id="folio-ink">Ink and water</h2>
      <p>
        Sumi ink is soot and animal glue, pressed into a stick and ground
        against a stone with a little water.
        <Sidenote>
          The grinding is slow on purpose: how long you grind, and how much
          water you allow, decides how dark the ink will be.
        </Sidenote>{" "}
        The same stick gives a deep black or a pale grey. Nothing is added to
        make the lighter tone; something is withheld.
        <Sidenote>
          <em>Mizu</em> means water. The quieter tones in this library are the
          same ink with more water in it, not new colours.
        </Sidenote>
      </p>
      <h3 id="folio-subtraction">Tone by subtraction</h3>
      <p>
        A palette built this way has a useful property: every tone is related to
        every other, so nothing on the page argues. Muted text is ink with water
        in it. A faint rule is ink with more. The accent is the only thing
        allowed to be something else, which is why it appears so rarely.
        <Sidenote>
          An accent that appears everywhere stops pointing at anything.
        </Sidenote>
      </p>

      <h2 id="folio-margins">Margins</h2>
      <p>
        Book designers have long used the margin as a second voice: a place for
        glosses, references and asides that would interrupt the text if they
        lived inside it.
        <Sidenote>
          Medieval manuscripts are full of marginalia — commentary, corrections,
          and the occasional knight fighting a snail.
        </Sidenote>{" "}
        A sidenote is that second voice with good manners.
        <Sidenote>
          Footnotes ask you to leave the page; sidenotes ask you to glance.
        </Sidenote>{" "}
        It sits beside the sentence it belongs to, close enough to find and far
        enough away to ignore.
        <Sidenote>
          Three notes this close together cannot all sit level with their marks,
          so each steps down just far enough to clear the one above.
        </Sidenote>
      </p>
      <p>
        Reading on a screen takes the margin away just when it would be most
        useful, so these notes fold into the text when there is no room and step
        back out when there is. The line that tracks your progress does the work
        a ribbon bookmark once did, without asking you to move it.
      </p>
    </>
  );
}

export function FolioShowcase() {
  const [scenario, setScenario] = useState<Scenario>("wide");
  return (
    <div className="mizu-showcase">
      <Scenarios
        label="Width"
        value={scenario}
        onChange={setScenario}
        options={[
          { value: "wide", label: "Full width" },
          { value: "column", label: "Narrow column" },
        ]}
        note="Notes sit in the margin beside their marks and step down to avoid each other; in a narrow column each mark unfolds its note in place. The contents rail follows you and counts down the reading time."
      />
      <Folio
        key={scenario}
        label="The ink line"
        style={{
          ["--mizu-folio-offset" as string]: "84px",
          maxWidth: scenario === "column" ? 560 : undefined,
        }}
      >
        <Essay />
      </Folio>
    </div>
  );
}
