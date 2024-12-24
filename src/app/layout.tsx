import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {/* <Navbar /> */}
        <div className="h-[calc(100vh-4rem)]">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
