import './globals.css';

export const metadata = {
  title: 'WhatsApp AI Support Engine',
  description: 'White-label, multi-business WhatsApp AI support, RAG, tickets & memory',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
