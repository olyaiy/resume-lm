import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { BuyMeCoffee } from "@/components/shared/buy-me-coffee";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <BuyMeCoffee />
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
