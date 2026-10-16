import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../context/authContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Electronic Support",
  description: "Electronic repair and support services",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (() => {
            const theme = localStorage.getItem("theme") || "light";
            document.documentElement.setAttribute("data-theme", theme);
          })();
        `,
          }}
        />
      </head>
      <body className="h-full bg-base-100 text-base-content" suppressHydrationWarning>
        <AuthProvider>
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}