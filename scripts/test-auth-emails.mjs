import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { emails, renderEmail } from "./build-auth-emails.mjs";

test("auth emails keep provider links and OTP semantics, without scripts, remote images or user metadata", async () => {
  assert.equal(emails.length, 6);
  for (const email of emails) {
    const html = renderEmail(email);
    const saved = await readFile(new URL(`../supabase/templates/${email.id}.html`, import.meta.url), "utf8");
    assert.equal(saved.replaceAll("\r\n", "\n"), html, `${email.id} must be regenerated`);
    assert.ok(Buffer.byteLength(html) < 12000);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /max-width:560px/);
    assert.match(html, /prefers-color-scheme:light/);
    assert.match(html, /mailto:support@alanfierro.dev/);
    assert.doesNotMatch(html, /<script|<img|<link|@import|\.Data|\.TokenHash|—/);
    if (email.action) {
      assert.equal((html.match(/href="{{ \.ConfirmationURL }}"/g) ?? []).length, 2);
      assert.doesNotMatch(html, /{{ \.Token }}/);
    } else {
      assert.equal(email.id, "reauthentication");
      assert.match(html, /{{ \.Token }}/);
      assert.doesNotMatch(html, /\.ConfirmationURL/);
    }
  }
  assert.match(renderEmail(emails.find(email => email.id === "email-change")), /{{ \.NewEmail }}/);
});

test("email body and button colors retain WCAG AA contrast in both themes", () => {
  const luminance = color => {
    const rgb = color.match(/../g).map(part => parseInt(part, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const [fg, bg] of [["e3e2e6", "1b1b1f"], ["d4c4b0", "1b1b1f"], ["281900", "ffc665"], ["1c1b1f", "ffffff"], ["514637", "ffffff"], ["9a3412", "ffffff"]]) {
    const values = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, `${fg} on ${bg}`);
  }
});

test("local Auth configuration uses the generated subjects and template files", async () => {
  const config = await readFile(new URL("../supabase/config.toml", import.meta.url), "utf8");
  const subjects = JSON.parse(await readFile(new URL("../supabase/templates/subjects.json", import.meta.url), "utf8"));
  for (const email of emails) {
    const section = config.split(`[auth.email.template.${email.id.replaceAll("-", "_")}]`)[1]?.split(/\n\[/)[0];
    assert.ok(section?.includes(`subject = ${JSON.stringify(email.subject)}`), email.id);
    assert.ok(section.includes(`content_path = "./supabase/templates/${email.id}.html"`), email.id);
    assert.equal(subjects[email.id], email.subject);
  }
});
