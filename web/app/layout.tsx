import type { Metadata } from 'next';
import './globals.css';
import { Nunito } from 'next/font/google';
import Loading from './loading';
import { Suspense } from 'react';
import Providers from './providers';
import { SidebarProvider } from '@/components/ui/sidebar';
import NavSidebar from '@/components/nav-sidebar';

const nunito = Nunito({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'FastAPI + Next.js',
	description: 'FastAPI + Next.js',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body className={`${nunito.className} antialiased`}>
				<Suspense fallback={<Loading />}>
					<Providers>
						<SidebarProvider>
							<div className="flex h-screen overflow-hidden bg-background group/sidebar">
								<NavSidebar />
								<main className="flex-1 overflow-auto transition-all duration-300 group-data-[collapsible=icon]/sidebar:pl-[48px]">
									{children}
								</main>
							</div>
						</SidebarProvider>
					</Providers>
				</Suspense>
			</body>
		</html>
	);
}
