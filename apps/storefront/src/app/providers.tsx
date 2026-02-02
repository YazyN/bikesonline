"use client"

import { CartProvider } from "@/components/providers"
import { StoreCart } from "@medusajs/types"
import type React from "react"

import { PropsWithChildren } from "react"

interface ProvidersProps extends PropsWithChildren {
  cart: StoreCart | null
}

export function Providers({ children, cart }: ProvidersProps) {
  return <CartProvider cart={cart}>{children}</CartProvider>
}
