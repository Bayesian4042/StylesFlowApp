import type { Metadata } from 'next';
import './globals.css';
import { Nunito } from 'next/font/google';
import Loading from './loading';
import { Suspense } from 'react';
import Providers from './providers.client';

const nunito = Nunito({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'StylesFlow',
	description: 'Virtual Try-On Platform',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={nunito.className}>
				<Providers>
					<Suspense fallback={<Loading />}>
						{children}
					</Suspense>
				</Providers>
			</body>
		</html>
	);
}
