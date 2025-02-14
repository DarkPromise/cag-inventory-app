import "../styles/globals.css";

import type { Metadata } from "next";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import ReactQueryProvider from "../components/react-query/ReactQueryProvider.tsx";
import Theme from "../components/theme/Theme.tsx";
import Providers from "../components/providers/Providers.tsx";

export const metadata: Metadata = {
  title: "CAG Inventory",
  description: "A simple inventory management system",
};

/** I actually spent a few days trying to implement this using Antd, but it was just taking too much time
 *  to use and workaround with modern React frameworks like Next.js and React 19.
 *  So I decided to switch to Material-UI, which I am more familiar with.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <noscript>Your browser does not support JavaScript!</noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
