import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**"],
  },
  {
    rules: {
      // Setting a loading flag before kicking off a fetch inside useEffect
      // is the standard client-side data-fetching pattern used throughout
      // this app; the extra render it causes is negligible.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
