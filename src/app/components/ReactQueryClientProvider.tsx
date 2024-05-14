'use client'

import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { useState } from 'react'

export const ReactQueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any, query) => {
            console.error(error)
          }
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false
          },
          mutations: {
            retry: false
          }
        }
      })

  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}