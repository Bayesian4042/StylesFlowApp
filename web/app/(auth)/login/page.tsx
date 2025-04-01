'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import GoogleSignin from '@/components/auth/GoogleSignin';
import Link from 'next/link';

export default function LoginPage() {
	return (
		<div className='flex min-h-screen items-center justify-center p-2 sm:p-4'>
			<Card className='w-full max-w-lg rounded-lg'>
				<CardHeader className='space-y-3 pb-8'>
					<CardTitle className='bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-center text-3xl font-bold text-transparent'>
						Welcome to StylesFlow
					</CardTitle>
					<CardDescription className='text-center text-base'>
						Sign in to try on clothes virtually
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6 p-6'>
					<GoogleSignin />
				</CardContent>
				<CardFooter className='flex flex-col space-y-6 pt-3'>
					<p className='text-center text-sm text-muted-foreground'>
						By signing in, you agree to our{' '}
						<Link
							href='/terms'
							className='font-medium text-primary underline underline-offset-4 hover:text-primary/90'
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href='/privacy'
							className='font-medium text-primary underline underline-offset-4 hover:text-primary/90'
						>
							Privacy Policy
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
