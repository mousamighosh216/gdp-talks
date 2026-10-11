import type { Metadata } from 'next';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '../src/index.css';
import Layout from '../src/components/Layout';

export const metadata: Metadata = {
  title: 'GDP Talks',
  description: 'Smart people should keep meeting. A hackathon where students and companies solve real problems together.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
