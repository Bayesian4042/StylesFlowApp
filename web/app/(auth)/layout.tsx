import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Authentication - StylesFlow',
	description: 'Sign in to StylesFlow',
};

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return children;
}
