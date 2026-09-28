import Link from "next/link";
import { ComponentsShell } from "@/components/docs/ComponentsShell";
export const metadata = { title: "Getting started — Mizu" };
function Code({ children }: { children: string }) {
  return (
    <pre tabIndex={0} role="region" aria-label="Code example">
      <code>{children}</code>
    </pre>
  );
}
export default function GettingStarted() {
  return (
    <ComponentsShell>
      <article className="mizu-guide">
        <h1>Make a surface.</h1>
        <p>
          126 systems for React 18.3 and 19. One stylesheet, optional fonts,
          native controls and purposeful motion. Mizu needs no Tailwind
          configuration and no provider for ordinary components.
        </p>
        <h2>Install</h2>
        <Code>npm install mizu-ui</Code>
        <p>
          Run this command in your React application. Mizu supports React and
          React DOM 18.3 or 19, with Motion 12 or 13 as a peer dependency. Use
          the React versions your application already supplies. Then import the
          stylesheet and the components you need.
        </p>
        <h2>Render a working interaction</h2>
        <Code>{`"use client"; // required at an interactive Next.js boundary
import { useState } from "react";
import "mizu-ui/styles.css";
import "mizu-ui/fonts.css"; // optional self-hosted fonts
import { Button, TextField } from "mizu-ui";

export function App() {
  const [draft, setDraft] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  return <div className="mizu-root" style={{ padding: 24 }}>
    <form onSubmit={e => {
      e.preventDefault();
      if (!draft.trim()) return;
      setProjects(items => [...items, draft.trim()]);
      setDraft("");
    }}>
      <TextField label="Project name" required value={draft}
        onChange={e => setDraft(e.target.value)} />
      <Button type="submit">Create project</Button>
    </form>
    <ul>{projects.map((project, i) => <li key={i}>{project}</li>)}</ul>
  </div>;
}`}</Code>
        <p>
          Import styles in your app entry or root layout. Set your document
          language and remove the browser’s default body margin. The optional
          font file includes Archivo Variable, Instrument Serif and JetBrains
          Mono. SoftType needs a font with a width axis; the bundled Archivo has
          one.
        </p>
        <h2>Keep imports focused</h2>
        <Code>{`import { TextField, Switch } from "mizu-ui/forms";
import { Progress, AsyncButton } from "mizu-ui/status";
import { MotionPreferences } from "mizu-ui/motion";`}</Code>
        <p>
          All 14 families have subpaths. The root exports the same APIs. ESM,
          declarations, source maps and inspectable source ship together. Mizu
          never imports Next.js; the showcase uses the same implementations.
          CommonJS require is unsupported.
        </p>
        <h2>Change the material</h2>
        <Code>{`<div className="mizu-root" data-theme="light">…</div>

.my-surface {
  --mizu-accent: #2763c4;
  --mizu-accent-fill: #2052a3;
}`}</Code>
        <p>
          Dark is the default. Theme any ancestor, pass className and style, or
          override <code>--mizu-*</code> tokens. Foreground accent and
          filled-button accent are separate for legibility. Check contrast when
          replacing colors. Native dialogs retain the theme where they are
          rendered.
        </p>
        <h2>Use real states</h2>
        <p>
          Native fields accept standard form attributes and controlled or
          default values. State systems expose explicit values and callbacks.
          AsyncButton and AsyncForm follow your promise, keep failure visible
          and provide AbortSignal on unmount; your service must honor that
          signal. FileDropzone returns validated files to your code. It does not
          upload them.
        </p>
        <h2>Motion and keyboard</h2>
        <Code>{`<MotionPreferences reduced={true}>
  <YourInterface />
</MotionPreferences>`}</Code>
        <p>
          With no override, the operating system’s motion preference applies.
          The provider additionally stops Mizu CSS and canvas movement.
          Continuous tickers include a pause control; native inputs keep
          platform keyboard behavior. Read each component’s notes for its
          particular interactions and limits.
        </p>
        <h2>Inspect and copy</h2>
        <p>
          Every component page has a live preview, compiled typed usage, API
          notes and a source link. Source ships under{" "}
          <code>node_modules/mizu-ui/src</code>. Copy its relative dependencies
          too; imports use .tsx/.ts extensions and the package build rewrites
          them to .js. Use TypeScript 5.7+ with
          allowImportingTsExtensions/rewriteRelativeImportExtensions if
          compiling copied source, or adapt extensions to your build system.
          Keep the stylesheet and MIT license.
        </p>
        <Link href="/components" className="mizu-text-button">
          Explore the collection →
        </Link>
      </article>
    </ComponentsShell>
  );
}
