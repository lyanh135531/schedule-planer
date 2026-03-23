'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, ShoppingCart, Settings, User, LogOut } from 'lucide-react';

const NAV_ITEMS = [
	{ name: 'Schedule', href: '/dashboard', icon: Calendar },
	{ name: 'Plan Manager', href: '/dashboard/cart', icon: ShoppingCart },
	{ name: 'Course Setup', href: '/dashboard/settings', icon: Settings },
];

export default function Navbar({ userEmail }: { userEmail?: string }) {
	const pathname = usePathname();

	const handleLogout = async () => {
		try {
			const res = await fetch('/api/auth/logout', { method: 'POST' });
			if (res.ok) {
				window.location.href = '/login';
			}
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	return (
		<>
		<nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full px-4 md:px-6">
			<div className="w-full mx-auto rounded-md py-3 flex items-center justify-between">
				{/* Logo / Brand */}
				<Link href="/dashboard" className="flex items-center gap-2 group">
					<div className="w-8 h-8 md:w-9 md:h-9 rounded-md bg-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(232,90,33,0.3)] group-hover:scale-105 transition-all duration-300">
						<span className="text-white font-black italic text-lg md:text-xl leading-none select-none transform translate-x-[-1.5px]">T</span>
					</div>
					<div className="flex-col hidden sm:flex">
						<span className="text-sm font-black text-white leading-none tracking-tight uppercase italic">TalkFirst</span>
						<span className="text-[10px] font-bold text-orange-600/80 leading-none tracking-[0.2em] uppercase">Support</span>
					</div>
					<div className="flex-col flex sm:hidden">
						<span className="text-xs font-black text-white leading-none tracking-tight uppercase italic">TalkFirst</span>
					</div>
				</Link>

				{/* Nav Links - Centered */}
				<div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/5 p-1 rounded-md border border-white/5">
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-2 px-4 py-2 rounded-md text-sm font-black transition-all duration-300",
									isActive
										? "bg-orange-600 text-white shadow-[0_4px_15px_rgba(232,90,33,0.3)]"
										: "text-gray-400 hover:text-white hover:bg-white/5"
								)}
							>
								<Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-500")} />
								{item.name}
							</Link>
						);
					})}
				</div>

				{/* User Actions */}
				<div className="flex items-center gap-3 md:gap-4">
					{/* User Profile Pill */}
					<div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-md bg-white/5 border border-white/5 hover:border-orange-600/30 hover:bg-orange-600/5 transition-all duration-500 group cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.2)]">
						<div className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-orange-600 flex items-center justify-center shadow-[0_0_10px_rgba(232,90,33,0.3)] group-hover:shadow-[0_0_15px_rgba(232,90,33,0.5)] transition-all duration-500">
							<User className="w-3 h-3 md:w-4 md:h-4 text-white" />
						</div>
						<div className="flex flex-col pr-1">
							<span className="text-[10px] md:text-xs font-bold text-white leading-none max-w-[80px] md:max-w-none truncate">
								{userEmail?.split('@')[0] || 'User'}
							</span>
						</div>
					</div>

					{/* Logout Action */}
					<button
						onClick={handleLogout}
						className="flex items-center cursor-pointer gap-2 px-2 md:px-3 py-2 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group"
					>
						<div className="p-1 rounded-md bg-white/5 group-hover:bg-red-500/10 transition-colors">
							<LogOut className="w-3.5 h-3.5 md:w-3.5 md:h-3.5" />
						</div>
						<span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em]">Exit</span>
					</button>
				</div>
			</div>
		</nav>

		{/* MOBILE BOTTOM NAVIGATION */}
		<div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#161923]/90 backdrop-blur-xl border-t border-white/10 pb-2">
			<div className="flex items-center justify-around p-1">
				{NAV_ITEMS.map((item) => {
					const Icon = item.icon;
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 px-2 min-w-[60px] rounded-xl transition-all duration-300",
								isActive
									? "text-orange-500"
									: "text-gray-500 hover:text-white"
							)}
						>
							<div className={cn(
								"p-1 rounded-md transition-all duration-300",
								isActive ? "bg-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.3)]" : "bg-transparent"
							)}>
								<Icon className="w-[18px] h-[18px]" />
							</div>
							<span className={cn(
								"text-[8px] font-black uppercase tracking-wider text-center whitespace-pre-wrap leading-tight",
								isActive ? "text-orange-500" : "text-gray-500"
							)}>
								{item.name.replace(' ', '\n')}
							</span>
						</Link>
					);
				})}
			</div>
		</div>
		</>
	);
}
