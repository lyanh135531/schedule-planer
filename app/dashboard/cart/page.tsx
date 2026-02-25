import CartTable from '@/components/CartTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function CartPage() {
	return (
		<div className="w-full space-y-12 px-6 md:px-12">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/5">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-orange-500/80 mb-1">
						<Link href="/dashboard" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white transition-colors group">
							<ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
							Back to Schedule
						</Link>
					</div>
					<h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
						Plan <span className="text-orange-500">Manager</span>
					</h1>
					<p className="text-gray-500 text-xs font-medium">
						Review selections for <span className="text-white">Sunday Registration</span> (09:00 AM).
					</p>
				</div>

				<div className="flex gap-4">
					<Button className="h-11 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl px-6 shadow-lg shadow-orange-500/10 transition-all active:scale-95">
						<Save className="w-4 h-4 mr-2" />
						Save Plan
					</Button>
				</div>
			</div>

			{/* Main Content */}
			<CartTable />
		</div>
	);
}
