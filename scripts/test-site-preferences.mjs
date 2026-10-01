import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { siteLocale, siteTheme } from "../src/lib/locale/preferences.ts";

const dictionary = JSON.parse(readFileSync(new URL("../src/lib/locale/es-AR.json", import.meta.url), "utf8"));
const source = readFileSync(new URL("../src/lib/locale/translate.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
const compiledModule = { exports: {} };
vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require: () => ({ ...dictionary, default: dictionary }) });
const { translateText } = compiledModule.exports;
const require = createRequire(import.meta.url);

test("preferences only accept the supported locale and theme", () => {
  assert.equal(siteLocale(undefined), "en");
  assert.equal(siteLocale("es-AR"), "es-AR");
  assert.equal(siteLocale("fr"), "en");
  assert.equal(siteTheme(undefined), "dark");
  assert.equal(siteTheme("light"), "light");
  assert.equal(siteTheme("anything"), "dark");
});

test("Spanish UI translation preserves whitespace, titles and unknown user content", () => {
  assert.equal(translateText("  Backlog  ", "es-AR"), "  Pendientes  ");
  assert.equal(translateText("Log", "es-AR"), "Registrar");
  assert.equal(translateText("Elden Ring", "es-AR"), "Elden Ring");
  assert.equal(translateText("arrow_forward", "es-AR"), "arrow_forward");
  assert.equal(translateText("A custom user review", "es-AR"), "A custom user review");
  assert.equal(translateText("32 of 50 games · Showing 1–24", "es-AR"), "32 de 50 juegos · Se muestran 1–24");
  assert.equal(translateText("Page 2 of 4", "es-AR"), "Página 2 de 4");
  assert.equal(translateText("Backlog", "en"), "Backlog");
});

test("light and dark palettes cover every existing design color role", () => {
  const config = require("../tailwind.config.cjs");
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const darkPalette = css.match(/:root \{([^}]+)\}/)?.[1];
  const lightPalette = css.match(/html\.light \{([^}]+)\}/)?.[1];
  assert.ok(darkPalette);
  assert.ok(lightPalette);
  for (const [name, value] of Object.entries(config.theme.extend.colors)) {
    assert.equal(value, `rgb(var(--color-${name}) / <alpha-value>)`);
    assert.ok(darkPalette.includes(`--color-${name}:`), `dark ${name}`);
    assert.ok(lightPalette.includes(`--color-${name}:`), `light ${name}`);
  }
});

test("dynamic UI phrases translate without translating embedded names or titles", () => {
  assert.equal(translateText("Signed in as Games.", "es-AR"), "Iniciaste sesión como Games.");
  assert.equal(translateText("← Discover's portfolio", "es-AR"), "← Colección de Discover");
  assert.equal(translateText("Games's log entry", "es-AR"), "Registro de Games");
  assert.equal(translateText("Games screenshot 2", "es-AR"), "Captura 2 de Games");
  assert.equal(translateText("Choose tier, currently unassigned", "es-AR"), "Elegí un nivel; actual: sin asignar");
  assert.equal(translateText("Page 2 of 3", "es-AR"), "Página 2 de 3");
});
