import "./globals.css";
import ClientContent from "./ClientContent";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="bg-white dark:bg-gray-900">
        <ClientContent>{children}</ClientContent>
      </body>
    </html>
  );
}