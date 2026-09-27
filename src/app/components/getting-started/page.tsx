import Link from "next/link";
import { ComponentsShell } from "@/components/docs/ComponentsShell";
export const metadata = { title: "Getting started — Mizu" };
export default function GettingStarted() {
  return <ComponentsShell><article className="mizu-guide"><h1>Make a surface.</h1><p>React 18.3 or 19, TypeScript if you want it, one stylesheet. Mizu needs no Tailwind configuration and no application provider for ordinary components.</p>
    <h2>Install</h2><pre><code>npm install mizu-ui motion</code></pre><p>React and React DOM are peers. Motion powers the expressive family; native operating controls use React and CSS.</p>
    <h2>Render</h2><pre><code>{`import "mizu-ui/styles.css";
import "mizu-ui/fonts.css"; // optional self-hosted fonts
import { Button, TextField } from "mizu-ui";

export function App() {
  return <div className="mizu-root" style={{ padding: 24 }}>
    <TextField label="Project" name="project" />
    <Button onClick={() => console.info("Create project")}>Create project</Button>
  </div>;
}`}</code></pre>
    <h2>Keep imports focused</h2><pre><code>{`import { TextField, Switch } from "mizu-ui/forms";
import { Progress, AsyncButton } from "mizu-ui/status";`}</code></pre><p>The package ships ESM, declarations, source maps and inspectable source. It never imports Next.js. The website imports the same component implementations.</p>
    <h2>Change the material</h2><pre><code>{`<div className="mizu-root" data-theme="light">…</div>

.my-surface {
  --mizu-accent: #2763c4;
  --mizu-accent-fill: #2052a3;
}`}</code></pre><p>Override tokens on an ancestor or style a component with its className. Check contrast whenever you replace colors. Native dialogs retain the theme where they are rendered.</p>
    <h2>Use real states</h2><p>Values are controlled where composition needs them. Native fields also accept defaultValue and standard form attributes. AsyncButton and AsyncForm follow your actual promises and supply AbortSignal for cleanup.</p>
    <h2>Motion and keyboard</h2><p>Components honor prefers-reduced-motion. Continuous tickers have a pause control. Native inputs provide platform keyboard behavior. Read each component’s notes for its particular interactions and limits.</p>
    <h2>Inspect and copy</h2><p>Every page has a live preview, typed usage, API notes and its source file. Source ships under <code>node_modules/mizu-ui/src</code>; relative imports identify supporting files to copy alongside it.</p><Link href="/components" className="mizu-text-button">Explore the collection →</Link>
  </article></ComponentsShell>;
}
