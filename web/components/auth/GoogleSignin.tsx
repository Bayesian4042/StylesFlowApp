'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import GoogleIcon from '@/assets/GoogleIcon';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

const GoogleSignin = () => {
	const [isLoading, setIsLoading] = useState(false);
	return (
		<Button
			variant='outline'
			className='h-11 w-full font-medium'
			onClick={async () => {
				try {
					setIsLoading(true);
					await signIn('google', {
						callbackUrl: '/virtual-try-on',
						redirect: true,
					});
				} catch (error) {
					console.error('Google sign-in error:', error);
				} finally {
					setIsLoading(false);
				}
			}}
			disabled={isLoading}
		>
			{isLoading ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : <GoogleIcon />}
			Continue with Google
		</Button>
	);
};

export default GoogleSignin;
