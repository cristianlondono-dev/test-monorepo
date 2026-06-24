import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import { base } from "./base.js";

/** Config para apps Next.js: extiende la base + reglas de React/Next. */
export const nextConfig = tseslint.config(...base, {
  plugins: {
    "react-hooks": reactHooks,
    "@next/next": nextPlugin,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
  },
});

export default nextConfig;
