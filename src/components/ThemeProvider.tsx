"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * Wraps next-themes. Class strategy so dark styles key off `.dark` on <html>.
 * `disableTransitionOnChange` implements the Rauno rule: switching themes must
 * not trigger transitions/animations on elements.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
