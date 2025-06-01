import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ui/layout/ClientLayout";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yunike Vendor Dashboard",
  description: "Manage your store and products with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <AuthProvider>
        <ClientLayout>{children}</ClientLayout>   
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
