import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AUTOPSY — AI Teacher",
  description: "AI Teacher That Understands. Explains. Interacts. Adapts.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f0eefc] bg-dashboard-canvas text-slate-900 font-sans antialiased selection:bg-purple-600 selection:text-white">
        <Nav />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
