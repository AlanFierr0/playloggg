import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Keep original image sizing and external URLs during the visual prototype.
  { rules: { "@next/next/no-img-element": "off", "@next/next/no-page-custom-font": "off" } },
  { files: ["*.cjs"], rules: { "@typescript-eslint/no-require-imports": "off" } },
  globalIgnores([".next/**", ".next-e2e/**", "playwright-report/**", "test-results/**", "e2e-artifacts/**", "out/**", "design-reference/**", "next-env.d.ts"]),
]);
