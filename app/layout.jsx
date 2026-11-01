import './globals.css';

export const metadata = {
  title: 'HACK-O-LANTERN 2026 - Judge Scoring Portal',
  description: 'Official Judge Scoring Desk for Top 10 Finalists at HACK-O-LANTERN 2026',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070707] text-neutral-100 antialiased selection:bg-[#ff7a1a]/30">
        {children}
      </body>
    </html>
  );
}

