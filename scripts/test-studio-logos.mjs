import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as runtime from "react/jsx-runtime";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { studioLogo } from "../src/lib/studio-logos.ts";

test("studio logos match known brands without assigning unrelated studios a parent logo", () => {
  for (const name of ["Valve", "  VALVE  ", "Valve Corporation"]) assert.equal(studioLogo(name), "/images/studios/valve.svg");
  assert.equal(studioLogo("Ubisoft Montreal"), "/images/studios/ubisoft.svg");
  assert.equal(studioLogo("Square Enix Creative Business Unit I"), "/images/studios/squareenix.svg");
  for (const name of ["Unknown Studio", "CD Projekt RED", "Valve fan studio", "constructor", "__proto__", "../../valve"]) assert.equal(studioLogo(name), null);
  for (const name of ["Valve", "Ubisoft", "Rockstar Games", "Epic Games", "Riot Games", "Remedy Entertainment", "Square Enix", "Sega", "Konami", "Activision", "CD Projekt"]) {
    const svg = readFileSync(new URL(`../public${studioLogo(name)}`, import.meta.url), "utf8");
    assert.ok(svg.startsWith("<svg"));
    assert.ok(!/<script|href=|<foreignObject/i.test(svg));
  }
});

test("studio names remain visible and escaped, with decorative fixed-size local logos", () => {
  const compiledModule = { exports: {} };
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/components/studio-name.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, {
    module: compiledModule, exports: compiledModule.exports,
    require: name => ({ "react/jsx-runtime": runtime, "@/lib/studio-logos": { studioLogo } })[name],
  });
  const render = name => renderToStaticMarkup(React.createElement(compiledModule.exports.StudioName, { name }));
  const valve = render("Valve");
  for (const text of ['src="/images/studios/valve.svg"', 'alt=""', 'width="32"', 'height="32"', '>Valve</span>']) assert.ok(valve.includes(text), text);
  const unknown = render("Unknown <Studio>");
  assert.ok(!unknown.includes("<img"));
  assert.ok(unknown.includes("Unknown &lt;Studio&gt;"));
});
