"use client";
// Generated from catalog usage by bun run examples:sync.
import { useState } from "react";
import {
  Presence,
  Stack,
  Button,
  Alert,
  Tilt,
  Frame,
  Parallax,
  ImageFigure,
  ScrollProgress,
} from "@/mizu";

export function PresenceDemo() {
  const [saved, setSaved] = useState(false);
  return (
    <Stack gap={20}>
      <Button size="sm" onClick={() => setSaved(!saved)}>
        Change state
      </Button>
      <Presence presenceKey={String(saved)}>
        <Alert
          title={saved ? "Changes saved" : "Draft in progress"}
          tone={saved ? "success" : "neutral"}
        >
          {saved
            ? "The current draft is ready for review."
            : "Keep shaping the idea."}
        </Alert>
      </Presence>
    </Stack>
  );
}

export function TiltDemo() {
  return (
    <Tilt max={5}>
      <Frame>
        <p className="mizu-field-hint">POINTER STUDY</p>
        <h3 style={{ fontSize: 36, letterSpacing: "-.04em", margin: "20px 0" }}>
          A little depth.
        </h3>
        <p className="mizu-field-hint">
          Move across the surface. The reading order and hit targets stay
          familiar.
        </p>
      </Frame>
    </Tilt>
  );
}

export function ParallaxDemo() {
  return (
    <Parallax distance={35}>
      <ImageFigure
        src="/images/field.svg"
        alt="A field of measurement diamonds"
        caption="Scroll the page to study the relationship."
        width={720}
        height={360}
      />
    </Parallax>
  );
}

export function ScrollProgressDemo() {
  return (
    <Stack gap={20}>
      <ScrollProgress label="Documentation reading progress" />
      <p className="mizu-field-hint">
        Scroll this document. The line measures the available document scroll,
        including the API below.
      </p>
    </Stack>
  );
}
