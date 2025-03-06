import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import Header from "@/components/common/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider> {/*  确保 children 传递到 I18nProvider */}
          <Header />
          {children} {/*  这里的 children 是 page.tsx */}
        </I18nProvider>
      </body>
    </html>
  );
}
