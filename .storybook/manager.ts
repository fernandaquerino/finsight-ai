import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const theme = create({
  base: "light",
  brandTitle: "FinSight AI — Design System",

  colorPrimary: "hsl(248, 53%, 50%)",
  colorSecondary: "hsl(248, 53%, 50%)",

  appBg: "hsl(0, 0%, 99%)",
  appContentBg: "hsl(0, 0%, 100%)",
  appBorderColor: "hsl(240, 6%, 90%)",
  appBorderRadius: 8,

  textColor: "hsl(240, 10%, 12%)",
  textInverseColor: "hsl(0, 0%, 100%)",

  barBg: "hsl(0, 0%, 100%)",
  barTextColor: "hsl(240, 4%, 46%)",
  barSelectedColor: "hsl(248, 53%, 50%)",
  barHoverColor: "hsl(248, 53%, 50%)",

  inputBg: "hsl(0, 0%, 100%)",
  inputBorder: "hsl(240, 6%, 90%)",
  inputTextColor: "hsl(240, 10%, 12%)",
  inputBorderRadius: 6,
});

addons.setConfig({ theme });
