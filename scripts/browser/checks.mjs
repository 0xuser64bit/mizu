import assert from "node:assert/strict";

// Browser-adapter tests. Pass a native Codex tab; all UI actions stay in its API.
// A Playwright runner can provide the same adapter (including domSnapshot).
export async function checkDocumentation(tab, baseUrl) {
  const page = tab.playwright;
  await tab.goto(`${baseUrl}/components/command-palette`);
  assert((await page.domSnapshot()).includes("Open commands"));
  for (const name of [
    "Usage",
    "Source & setup",
    "Props",
    "Accessibility",
    "Motion",
    "Works alongside",
  ])
    assert.equal(
      await page
        .locator(".mizu-docs-content")
        .getByRole("heading", { name, exact: true })
        .count(),
      1,
    );
  await page
    .getByRole("button", { name: "Open commands", exact: true })
    .click();
  assert((await page.domSnapshot()).includes('listbox "Available commands"'));
  await page
    .getByRole("combobox", { name: "Command palette", exact: true })
    .fill("save");
  assert.equal(
    await page.locator(".mizu-command-list").getByRole("option").count(),
    1,
  );
  await page
    .getByRole("combobox", { name: "Command palette", exact: true })
    .press("Enter");
  assert.equal(
    await page.locator('.mizu-preview-stage [role="status"]').innerText(),
    "Changes saved.",
  );
  assert.equal(
    await page.evaluate(() => document.activeElement?.textContent?.trim()),
    "Open commands",
  );
  await page
    .getByRole("button", { name: "Open commands", exact: true })
    .click();
  assert((await page.domSnapshot()).includes('combobox "Command palette"'));
  await page
    .getByRole("combobox", { name: "Command palette", exact: true })
    .press("Escape");
  assert.equal(
    await page.evaluate(() => document.activeElement?.textContent?.trim()),
    "Open commands",
  );
  await tab.goto(`${baseUrl}/components/history-controls`);
  assert((await page.domSnapshot()).includes("First draft"));
  await page
    .getByRole("button", { name: "Edit draft name: First draft", exact: true })
    .click();
  assert((await page.domSnapshot()).includes('textbox "Draft name"'));
  await page
    .getByRole("textbox", { name: "Draft name", exact: true })
    .fill("Second draft");
  await page
    .getByRole("textbox", { name: "Draft name", exact: true })
    .press("Enter");
  assert((await page.domSnapshot()).includes("Second draft"));
  await page.getByRole("button", { name: /Undo/ }).click();
  assert((await page.domSnapshot()).includes("First draft"));
  await tab.goto(`${baseUrl}/components/split-pane`);
  assert((await page.domSnapshot()).includes("Resize panels"));
  await page
    .getByRole("separator", { name: "Resize panels" })
    .press("ArrowRight");
  assert.equal(
    await page
      .getByRole("separator", { name: "Resize panels" })
      .getAttribute("aria-valuenow"),
    "46",
  );
  await tab.goto(`${baseUrl}/components/softtype`);
  assert((await page.domSnapshot()).includes("Reduce motion"));
  await page
    .locator(".mizu-softtype")
    .waitFor({ state: "visible", timeoutMs: 10000 });
  await page
    .getByRole("button", { name: "Reduce motion", exact: true })
    .click();
  await page.domSnapshot();
  assert.equal(await page.locator('[data-motion="reduced"]').count(), 1);
  assert.equal(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".mizu-softtype"))
          .animationName,
    ),
    "none",
  );
  return {
    documentHeadings: true,
    commandExecution: true,
    escapeRestoresFocus: true,
    undo: true,
    keyboardResize: true,
    reducedCssMotion: true,
  };
}
export async function sweepDocumentation(tab, baseUrl) {
  await tab.goto(`${baseUrl}/components`);
  await tab.playwright.domSnapshot();
  const routes = await tab.playwright.evaluate(() => [
    ...new Set(
      Array.from(
        document.querySelectorAll('nav[aria-label="Component families"] a'),
      ).map((a) => a.getAttribute("href")),
    ),
  ]);
  assert(routes.length >= 100);
  const results = [];
  for (const route of routes) {
    await tab.goto(baseUrl + route);
    await tab.playwright.domSnapshot();
    const result = await tab.playwright.evaluate(() => ({
      path: location.pathname,
      heading: document.querySelector("h1")?.textContent,
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      previewChildren: document
        .querySelector(".mizu-preview-stage")
        ?.querySelectorAll("*").length,
    }));
    assert(
      result.heading && result.previewChildren,
      `${route}: missing heading or preview`,
    );
    assert(result.documentWidth <= result.width, `${route}: document overflow`);
    results.push(result);
  }
  return results;
}
export async function checkConsumer(tab, baseUrl) {
  await tab.goto(baseUrl);
  const page = tab.playwright;
  assert((await page.domSnapshot()).includes("Your next release."));
  await page.getByRole("button", { name: /Edit release name:/ }).click();
  assert((await page.domSnapshot()).includes('textbox "Release name"'));
  await page
    .getByRole("textbox", { name: "Release name", exact: true })
    .fill("Packed release");
  await page
    .getByRole("textbox", { name: "Release name", exact: true })
    .press("Enter");
  assert((await page.domSnapshot()).includes("Packed release"));
  await page.getByRole("button", { name: /Undo/ }).click();
  assert((await page.domSnapshot()).includes("Workshop release"));
  await page
    .getByRole("searchbox", { name: "Find a piece", exact: true })
    .fill("Wave");
  assert.equal(await page.locator("tbody tr").count(), 1);
  assert((await page.domSnapshot()).includes("WaveText"));
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  assert((await page.domSnapshot()).includes("Saved"));
  await page.getByRole("button", { name: "Commands", exact: true }).click();
  assert((await page.domSnapshot()).includes('combobox "Command palette"'));
  await page
    .getByRole("combobox", { name: "Command palette", exact: true })
    .fill("Create");
  assert.equal(
    await page.locator(".mizu-command-list").getByRole("option").count(),
    1,
  );
  await page
    .getByRole("combobox", { name: "Command palette", exact: true })
    .press("Enter");
  assert((await page.domSnapshot()).includes("Unsaved"));
  await page
    .getByRole("searchbox", { name: "Find a piece", exact: true })
    .fill("");
  assert.equal(await page.locator("tbody tr").count(), 4);
  await page
    .getByRole("button", { name: "Restore saved", exact: true })
    .click();
  assert((await page.domSnapshot()).includes("Restored"));
  assert.equal(await page.locator("tbody tr").count(), 3);
  await page
    .getByRole("button", { name: "Archive drafts", exact: true })
    .click();
  assert((await page.domSnapshot()).includes("Archive the unfinished pieces?"));
  await page.getByRole("button", { name: "Archive", exact: true }).click();
  await page.domSnapshot();
  assert.equal(await page.locator("tbody tr").count(), 2);
  await page
    .getByRole("button", { name: "Recover archive", exact: true })
    .click();
  assert((await page.domSnapshot()).includes("Recovered"));
  assert.equal(await page.locator("tbody tr").count(), 3);
  return {
    restore: true,
    archiveRecovery: true,
    edit: true,
    undo: true,
    filter: true,
    save: true,
    commandCreate: true,
  };
}
