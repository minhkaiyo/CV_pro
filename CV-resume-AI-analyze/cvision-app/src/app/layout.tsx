import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ['normal', 'italic'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CVision AI | Tối Ưu CV & Phân Tích Hồ Sơ Bằng Trí Tuệ Nhân Tạo",
  description: "CVision AI là nền tảng phân tích và tối ưu hóa CV hàng đầu, giúp bạn chinh phục nhà tuyển dụng nhờ công nghệ AI tiên tiến, quét ATS và gợi ý thông minh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${playfair.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#0B0B0C]`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
