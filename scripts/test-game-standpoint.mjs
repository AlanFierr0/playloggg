import { test } from "node:test";
import { gamesQuery } from "../src/lib/games-query.ts";
import { defaultGamesFilters } from "../src/lib/games-view.ts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
let portfolio;
let locale = "en";
const dictionary = JSON.parse(readFileSync(new URL("../src/lib/locale/es-AR.json", import.meta.url), "utf8"));
const translationModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/locale/translate.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, { module: translationModule, exports: translationModule.exports, require: () => ({ ...dictionary, default: dictionary }) });
function loadComponent(path) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const compiledModule = { exports: {} };
  const imports = {
    "@/components/game-tags": { GameTags: props => React.createElement(loadComponent("../src/components/game-tags.tsx").GameTags,props) },
    "@/lib/games-query": { gamesQuery },
    "@/lib/games-view": { defaultGamesFilters },
    "@/components/site-preferences": { useMessages: () => (source) => translationModule.exports.translateText(source, locale) },
    "next/link": { default: ({ children, ...props }) => React.createElement("a", props, children), __esModule: true },
    "@/components/portfolio-provider": { usePortfolio: () => portfolio },
    "@/components/profile-avatar": { ProfileAvatar: ({ name }) => React.createElement("span", null, name) },
    "@/components/preview-action": { useNotice: () => () => {} },
    "@/lib/playback-status": { playbackLabels: { backlog: "Backlog", playing: "Playing" } },
  };
  vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports, require: (id) => imports[id] ?? require(id) });
  return compiledModule.exports;
}
const { GameStandpoint } = loadComponent("../src/components/game-standpoint.tsx");
const { ShelfLink } = loadComponent("../src/components/game-actions.tsx");
const game = { slug: "example-game", title: "Example", score: null, tier: null, logged: true, status: "backlog", hoursPlayed: 0, review: "<script>private review</script>" };

function render(gameValue, sample = false) {
  portfolio = { profile: { displayName: "Actual player", isSample: sample }, access: { canEdit: !sample } };
  return renderToStaticMarkup(React.createElement(GameStandpoint, { game: gameValue }));
}
test("unscored saved entry shows real owner, null tier, zero hours and escaped review without fabricated rank", () => {
  const html = render(game);
  for (const text of ["Actual player", "Your log entry", "Unrated", "Tier unassigned", "Backlog", "0 hrs", "&lt;script&gt;", "/log?game=example-game"]) assert.ok(html.includes(text), text);
  for (const text of ["Rank #1", "98 / 100", "78.4", "<script>"]) assert.ok(!html.includes(text), text);
});
test("score zero and independent tier are displayed without changing their values", () => {
  const html = render({ ...game, score: 0, tier: "S", hoursPlayed: null });
  assert.ok(html.includes("0 / 100")); assert.ok(html.includes("Tier S")); assert.ok(!html.includes("0 hrs"));
});
test("sample and unlogged entry explicitly identify their state", () => {
  const html = render({ ...game, logged: false, review: null }, true);
  assert.ok(html.includes("Sample profile entry")); assert.ok(html.includes("This profile has not logged this game.")); assert.ok(html.includes('href="/login"'));
});
test("Shelf routes guests to sign-in and editors to the selected game's editor", () => {
  portfolio = { access: { canEdit: false } };
  assert.ok(renderToStaticMarkup(React.createElement(ShelfLink, { slug: "example-game" }, "Shelf")).includes('href="/login?next=%2Flog%3Fgame%3Dexample-game"'));
  portfolio = { access: { canEdit: true } };
  assert.ok(renderToStaticMarkup(React.createElement(ShelfLink, { slug: "example-game" }, "Shelf")).includes('href="/log?game=example-game"'));
});

test("Spanish UI preserves user content even when it matches an interface message", () => {
  locale = "es-AR";
  try {
    const html = render({ ...game, review: "Games" });
    assert.ok(html.includes("Pendientes"));
    assert.ok(html.includes(">Games</p>"));
    assert.ok(!html.includes(">Juegos</p>"));
  } finally { locale = "en"; }
});
