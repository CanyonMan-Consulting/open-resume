import "./globals.css";
import { TopNavBar } from "components/TopNavBar";
import { Analytics } from "@vercel/analytics/react";
import { ReactQueryClientProvider } from "components/ReactQueryClientProvider";
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: "OpenResume - Free Open-source Resume Builder and Parser",
  description:
    "OpenResume is a free, open-source, and powerful resume builder that allows anyone to create a modern professional resume in 3 simple steps. For those who have an existing resume, OpenResume also provides a resume parser to help test and confirm its ATS readability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryClientProvider>
      <html lang="en">
        <body style={{ maxHeight: '100vh', textAlign: 'left', overflow: 'hidden' }}>
          {children}
        </body>
      </html >
    </ReactQueryClientProvider>
  );
}
