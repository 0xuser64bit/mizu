import Link from "next/link";
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
    <>
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
        <h2>Install one component</h2>
        <Code>{`npx shadcn@latest init 0xuser64bit/mizu/preset
npx shadcn@latest add 0xuser64bit/mizu/select-field`}</Code>
        <p>
          The shadcn CLI needs Tailwind and an import alias in your project.
          Plain <code>init</code> installs shadcn’s own theme into your global
          CSS; the Mizu preset writes components.json without it, so your global
          CSS, layout and dependencies stay as they are, and adds Mizu’s tokens
          and font files. Skip init if the project already has a
          components.json.
        </p>
        <p>
          Each catalog page has its own add command. The CLI copies the selected
          component and its source dependencies into your UI directory, with
          base.css, Mizu’s tokens, and the stylesheets that hold its rules. Each
          rule lives in one stylesheet, beside the module that renders it, or
          under shared/ when unrelated components render it, so components you
          add together never repeat CSS. Seventeen components style themselves
          inline, among them Accordion, Tabs, Mark and Badge; base.css is all
          the CSS they bring. Motion is installed only for components that use
          it. Load the fonts as shown below.
        </p>
        <Code>{`import { SelectField } from "@/components/ui/mizu/select-field";`}</Code>
        <p>
          Every component has its own item and path, its name in kebab case:
          DataInspector is <code>data-inspector</code>, and that file exports
          DataInspector and the types it takes. Use the UI alias configured in
          your <code>components.json</code> if yours differs from{" "}
          <code>@/components/ui</code>. The installed file imports that CSS
          itself. Wrap a surface in <code>className=&quot;mizu-root&quot;</code>{" "}
          for the default theme, and edit the copied code to suit your app.
        </p>
        <p>
          The installed files carry no <code>&quot;use client&quot;</code> of
          their own; each component’s source says whether it needs the browser.
          Mark, Badge, Kbd, Stat, Timeline and the other static pieces render as
          Server Components, with no client JavaScript. Every component page
          says which kind it is.
        </p>
        <p>
          Keep data your Server Components read in a module without{" "}
          <code>&quot;use client&quot;</code>, such as a <code>data.ts</code>.
          Exported from a client module, an array reaches server code as a
          client reference rather than an array, and <code>.map</code> fails
          while prerendering. Mizu’s own helpers (matchesQuery, squarify,
          FLAP_CHARACTERS) live in plain modules for the same reason.
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
          language and remove the browser’s default body margin.
        </p>
        <h2 id="fonts">Load the fonts</h2>
        <p>
          Mizu is set in Archivo, Instrument Serif and JetBrains Mono. Without
          them every component still works, in your system fonts, so a missing
          font is easy to miss. Import the self-hosted faces once, in your root
          layout:
        </p>
        <Code>{`import "mizu-ui/fonts.css"; // npm
import "@/components/ui/mizu/fonts.css"; // shadcn: add 0xuser64bit/mizu/fonts`}</Code>
        <p>
          With next/font, give the faces these variable names and set them on{" "}
          <code>&lt;html&gt;</code> or <code>&lt;body&gt;</code>. Mizu’s font
          tokens read them, so there is nothing to override.
        </p>
        <Code>{`import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fonts = \`\${archivo.variable} \${serif.variable} \${mono.variable}\`;
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}`}</Code>
        <p>
          Keep <code>axes: [&quot;wdth&quot;]</code>: SoftType and the wide and
          narrow styles move along Archivo’s width axis. For other faces
          entirely, override <code>--mizu-font-display</code>,{" "}
          <code>--mizu-font-serif</code> and <code>--mizu-font-mono</code> on
          your surface.
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
        <Code>{`npx shadcn@latest add 0xuser64bit/mizu/motion-preferences`}</Code>
        <p>
          From the registry, the provider is its own item. Import it from{" "}
          <code>@/components/ui/mizu/motion-preferences</code>; it governs every
          Mizu component installed alongside it.
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
    </>
  );
}
