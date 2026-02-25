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

export default function Navbar() {
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
		<nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%]">
			<div className="glass-panel rounded-2xl px-6 py-3 flex items-center justify-between">
				{/* Logo / Brand */}
				<Link href="/dashboard" className="flex items-center gap-2 group">
					<div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(232,90,33,0.3)] group-hover:scale-105 transition-all duration-300">
						<span className="text-white font-black italic text-xl leading-none select-none transform translate-x-[-1.5px]">T</span>
					</div>
					<div className="flex flex-col">
						<span className="text-sm font-black text-white leading-none tracking-tight uppercase italic">TalkFirst</span>
						<span className="text-[10px] font-bold text-orange-600/80 leading-none tracking-[0.2em] uppercase">Support</span>
					</div>
				</Link>

				{/* Nav Links */}
				<div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black transition-all duration-300",
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
				<div className="flex items-center gap-4">
					{/* User Profile Pill */}
					<div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-orange-600/30 hover:bg-orange-600/5 transition-all duration-500 group cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.2)]">
						<div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center shadow-[0_0_10px_rgba(232,90,33,0.3)] group-hover:shadow-[0_0_15px_rgba(232,90,33,0.5)] transition-all duration-500">
							<User className="w-4 h-4 text-white" />
						</div>
						<div className="flex flex-col pr-1">
							<span className="text-xs font-bold text-white leading-none">Admin</span>
						</div>
					</div>

					{/* Logout Action */}
					<button
						onClick={handleLogout}
						className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group"
					>
						<div className="p-1 rounded-md bg-white/5 group-hover:bg-red-500/10 transition-colors">
							<LogOut className="w-3.5 h-3.5" />
						</div>
						<span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit</span>
					</button>
				</div>
			</div>
		</nav>
	);
}
