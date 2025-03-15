import { Home, Shirt, History, Settings } from 'lucide-react';
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
import { ThemeToggle } from '@/components/ThemeToggle';

export default function NavSidebar() {
	return (
		<Sidebar collapsible='icon' className='transition-[width] duration-300'>
			<SidebarRail />
			<SidebarHeader className='border-b border-border'>
				<div className='flex items-center justify-between px-4 py-3'>
					<h1 className='text-lg font-semibold transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0'>
						VTON
					</h1>
					<SidebarTrigger className='group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:right-2' />
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton tooltip='Home'>
							<Home className='h-4 w-4' />
							<span>Home</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton tooltip='Virtual Try-On' isActive={true}>
							<Shirt className='h-4 w-4' />
							<span>Virtual Try-On</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton tooltip='History'>
							<History className='h-4 w-4' />
							<span>History</span>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton tooltip='Settings'>
							<Settings className='h-4 w-4' />
							<span>Settings</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarContent>

			<SidebarFooter className='border-t border-border'>
				<div className='p-4 transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0'>
					<ThemeToggle />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
