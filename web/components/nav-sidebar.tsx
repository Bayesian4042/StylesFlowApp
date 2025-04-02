import { Shirt, LogOut, Sun, Moon, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarTrigger,
	SidebarRail,
} from '@/components/ui/sidebar';
import AuthCheck from '@/components/auth/AuthCheck';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';

export default function NavSidebar() {
	const { theme, setTheme } = useTheme();
	const router = useRouter();
	const { data: session } = useSession();
	
	const handleSignOut = () => {
		signOut({ callbackUrl: '/login' });
	};

	const toggleTheme = () => {
		setTheme(theme === 'light' ? 'dark' : 'light');
	};

	const handleVirtualTryOn = () => {
		router.push('/virtual-try-on');
	};

	const handleAdmin = () => {
		router.push('/admin');
	};
	return (
		<Sidebar collapsible='icon' className='transition-[width] duration-300'>
			<SidebarRail />
			<SidebarHeader>
				<div className='flex items-center justify-between px-4 py-3'>
					<h1 className='text-lg font-semibold transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0'>
					StylesFlow
					</h1>
					<SidebarTrigger className='group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:right-2' />
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton tooltip='Virtual Try-On' isActive={true} onClick={handleVirtualTryOn}>
							<Shirt className='h-4 w-4' />
							<span>Virtual Try-On</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					{session?.user?.is_admin && (
						<SidebarMenuItem>
							<SidebarMenuButton tooltip='Admin' onClick={handleAdmin}>
								<UserCog className='h-4 w-4' />
								<span>Admin</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton tooltip='Theme' onClick={toggleTheme}>
							<Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
							<Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
							<span>Theme</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton tooltip='Sign Out' onClick={handleSignOut}>
							<LogOut className='h-4 w-4' />
							<span>Sign Out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

export function ProtectedNavSidebar() {
	return (
		<AuthCheck>
			<NavSidebar />
		</AuthCheck>
	);
}
