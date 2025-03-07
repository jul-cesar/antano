import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Antaño Horno y Café",
  description:
    "Si nunca has saboreado la cocina colombiana, deberías reservar mesa en este restaurante. Su atrayente laing y sabrosa picada te van a saber increíblemente bien. Merece la pena probar aquí un sensacional café. Su admirable personal muestra un alto nivel de calidad en Antaño horno y café. Te va a encantar su profesional servicio. Los precios de este lugar se dice que son razonables. Una decoración interesante y su ambiente cuidado ayudan a sus clientes a sentirse relajados. La puntuación media de este lugar en Google es de 4,5.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />

        {children}
      </body>
    </html>
  );
}
