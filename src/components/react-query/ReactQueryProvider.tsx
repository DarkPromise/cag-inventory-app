"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface IReactQueryProviderProps {
  children?: React.ReactNode;
}

export const ReactQueryProvider = (props: IReactQueryProviderProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false, // Disable retries
      },
    },
  });
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};

export default ReactQueryProvider;
