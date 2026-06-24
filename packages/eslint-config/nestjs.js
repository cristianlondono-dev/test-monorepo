import tseslint from "typescript-eslint";
import { base } from "./base.js";

/** Config para apps NestJS: extiende la base, permite patrones comunes del framework. */
export const nestjsConfig = tseslint.config(...base, {
  rules: {
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
});

export default nestjsConfig;
