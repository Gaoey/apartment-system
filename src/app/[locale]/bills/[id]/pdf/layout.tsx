import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: "Bill PDF - Bill Renting System",
  description: "PDF view for apartment rental bills",
};

const locales = ['th', 'en'];

export default async function PDFLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}