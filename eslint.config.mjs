import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["node_modules/**"],
  },
  {
    rules: {
      // Loading from localStorage in useEffect is a valid pattern for client-side state initialisation
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
