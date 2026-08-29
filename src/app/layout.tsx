import type { Metadata } from "next";
import { Inter as FontBody } from "next/font/google";
import { VT323 as FontDisplay } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import ShoppingCart from "@/components/cart/ShoppingCart";

// VT323 gives the retro terminal/tv text feel; Inter for body copy.
const fontBody = FontBody({ subsets: ["latin"], variable: "--font-body" });
const fontDisplay = FontDisplay({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BKLYN THREADS",
  description:
    "Retro 90s Brooklyn streetwear. Tees, outerwear, headwear, footwear & accessories.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontBody.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen bg-obsidian text-bone-white antialiased">
        <CartProvider>
          {children}
          <ShoppingCart />
        </CartProvider>
      </body>
    </html>
  );
}