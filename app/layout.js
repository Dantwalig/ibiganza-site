import "./globals.css";

const TITLE = "IBIGANZA | Building confidence, preserving culture, inspiring purpose";
const DESC =
  "IBIGANZA is a community-centered organization in Rwanda that helps children and young people grow through faith, culture, creativity and mentorship.";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: TITLE,
  description: DESC,
  openGraph: { title: TITLE, description: DESC, type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#16382c" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Nunito+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
