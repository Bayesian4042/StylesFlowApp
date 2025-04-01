import type { Metadata } from 'next';
import ProtectedLayoutClient from './protected-layout.client';

export const metadata: Metadata = {
	title: 'StylesFlow',
	description: 'Try on clothes virtually using AI',
};

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
