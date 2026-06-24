import globals from "globals";
import { nestjsConfig } from "@repo/eslint-config/nestjs";

export default [
  ...nestjsConfig,
  {
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    ignores: ["eslint.config.mjs", "dist/**", "coverage/**"],
  },
];
