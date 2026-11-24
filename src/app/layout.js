import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata = {
  title: "QuickDesk",
  description: "Minimal IT support ticketing system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeToggle />
        <div className="container">{children}</div>
      </body>
    </html>
  );
}