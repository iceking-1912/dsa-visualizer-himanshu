import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Visualizer",
  description: "Interactive Data Structures and Algorithms Visualizer with Terminal CLI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
