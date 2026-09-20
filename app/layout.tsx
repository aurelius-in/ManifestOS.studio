import './globals.css';

export const metadata = {
  title: 'ManifestOS.studio',
  description: 'Problem-first AI software creation studio',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
