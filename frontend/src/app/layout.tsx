import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import Header from "@/components/common/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F3F4F6] text-gray-800 min-h-screen">
        <I18nProvider>
          <Header />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
