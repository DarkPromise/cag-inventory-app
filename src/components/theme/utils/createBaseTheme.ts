import { createTheme } from "@mui/material";
import { TypographyOptions } from "@mui/material/styles/createTypography";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** Font */
const typography: TypographyOptions = {
  fontFamily: `${inter.style.fontFamily}`,
};

export const createBaseTheme = (theme: "light" | "dark") => {
  return theme === "light"
    ? createTheme({
        palette: {
          mode: "light",
        },
        typography: typography,
      })
    : createTheme({
        palette: {
          mode: "dark",
        },
        typography: typography,
      });
};
