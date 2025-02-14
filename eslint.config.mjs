import nextPlugin from "@next/eslint-plugin-next";
import stylistic from "@stylistic/eslint-plugin";

export default [
  /** Stylistic */
  {
    plugins: {
      "@stylistic": stylistic
    },
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/no-explicit-any": "off",
      "@stylistic/no-unused-vars": "off",
      //"@stylistic/no-empty-object-type": ["error", { allowInterfaces: "always" }]
    }
  },
  /** Next.JS */
  {
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules
    }
  },
  {
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.json"],
        },
      },
    },
    ignores: ["node_modules/", ".next/", "public/", "next.config.ts", "tailwind.config.ts"],
  }
];
