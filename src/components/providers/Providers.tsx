"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import React, { useEffect, useState, useTransition } from "react";
import Theme from "../theme/Theme.tsx";
import ReactQueryProvider from "../react-query/ReactQueryProvider.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-sg.js";

export interface ProvidersProps {
  children?: React.ReactNode;
}

/** As more and more providers are being included,
 *  it is better to have a single entry point for all providers.
 */
export const Providers = (props: ProvidersProps) => {
  return (
    <>
      <AppRouterCacheProvider>
        <Theme>
          <ReactQueryProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-sg">
              {props.children}
            </LocalizationProvider>
          </ReactQueryProvider>
        </Theme>
      </AppRouterCacheProvider>
    </>
  );
};

export default Providers;
