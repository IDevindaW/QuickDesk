import "./globals.css";

export const metadata = {
  title: "QuickDesk",
  description: "Minimal IT support ticketing system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}