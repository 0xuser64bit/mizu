import { mkdirSync, writeFileSync } from "node:fs";
import { CATALOG } from "../src/components/docs/catalog";

// Compile the documented examples as live demos: copied usage cannot silently drift.
const overrides: Record<string, string> = {
  AsyncForm: `  return <AsyncForm onSubmit={async (data) => { localStorage.setItem("mizu-demo-name", String(data.get("name"))); }} successMessage="Saved on this device."><TextField label="Display name" name="name" required /><button type="submit" className="mizu-text-button">Save locally</button></AsyncForm>;`,
  EmptyState: `  const [created, setCreated] = useState(false);\n  return created ? <p>Your new draft is ready.</p> : <EmptyState title="No releases yet" action={<Button size="sm" onClick={() => setCreated(true)}>Create a release</Button>}>Your first release starts with a finished piece.</EmptyState>;`,
};
const families = new Map<string, typeof CATALOG>();
for (const entry of CATALOG) families.set(entry.category, [...(families.get(entry.category) ?? []), entry]);
mkdirSync("src/components/docs/demos/generated", { recursive: true });
const demoLines: string[] = [];
for (const [family, entries] of families) {
  const imports = new Set<string>();
  const bodies = entries.map((entry) => {
    const match = entry.usage.match(/import \{ (.+) \} from "mizu-ui"/)!;
    match[1].split(",").forEach((name) => imports.add(name.trim()));
    const body = overrides[entry.name] ?? entry.usage.slice(entry.usage.indexOf("export function Example() {") + "export function Example() {\n".length, -2);
    demoLines.push(`  "${entry.slug}": dynamic(() => import("./demos/generated/${family.toLowerCase()}").then(m => m.${entry.name}Demo)),`);
    return `export function ${entry.name}Demo() {\n${body}\n}`;
  });
  writeFileSync(`src/components/docs/demos/generated/${family.toLowerCase()}.tsx`, `"use client";\n// Generated from catalog usage by bun run examples:sync.\nimport { useState } from "react";\nimport { ${[...imports].join(", ")} } from "@/mizu";\n\n${bodies.join("\n\n")}\n`);
}
writeFileSync("src/components/docs/GeneratedDemos.tsx", `"use client";\nimport dynamic from "next/dynamic";\nexport const GENERATED_DEMOS = {\n${demoLines.join("\n")}\n};\n`);
