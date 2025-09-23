import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
//hello
export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "prettier/prettier": "error",
      "no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-bo-target-blank": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": 0,
      "jsx-a11y/label-has-for": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "import/no-unresolved": [
        "error",
        {
          ignore: [".svg"],
        },
      ],
      "import/named": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
    },
  }
);
