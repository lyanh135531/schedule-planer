'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trash2, Calendar, Clock, MapPin, CheckCircle2, LayoutGrid } from 'lucide-react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

interface CartItem {
	id: string;
	externalCourseId: string;
	courseCode: string;
	courseName: string;
	syllabus?: string;
	day: string;
	timeSlotLabel: string;
	planType: string;
	priorityOrder: number | null;
	status: string;
	courseTypeName: string;
	courseTypeDisplayName: string;
	lecturer?: string;
	room?: string;
}

interface RequirementStatus {
	name: string;
	displayName: string;
	current: number;
	required: number;
}

export default function CartTable() {
	const [items, setItems] = useState<CartItem[]>([]);
	const [requirements, setRequirements] = useState<RequirementStatus[]>([]);
	const [loading, setLoading] = useState(true);
	const [isClearModalOpen, setIsClearModalOpen] = useState(false);

	const fetchData = async () => {
		setLoading(true);
		try {
			// Fetch plans and settings in parallel
			const [plansRes, settingsRes] = await Promise.all([
				fetch('/api/plans'),
				fetch('/api/settings/course-requirements')
			]);

			if (!plansRes.ok || !settingsRes.ok) throw new Error('Failed to fetch data');

			const plansData = await plansRes.json();
			const settingsData = await settingsRes.json();

			// Map plans
			const allItems: CartItem[] = [
				...plansData.primary.map((p: CartItem) => ({ ...p, status: 'Primary' })),
				...plansData.backup.map((b: CartItem) => ({
					...b,
					status: `Backup (P${b.priorityOrder})`
				}))
			];
			setItems(allItems);

			// Map requirements
			const reqStatus = (settingsData.settings || []).map((s: { courseTypeName: string; courseTypeDisplayName: string; requiredCount: number; }) => ({
				name: s.courseTypeName,
				displayName: s.courseTypeDisplayName,
				current: allItems.filter(i => i.courseTypeName === s.courseTypeName && i.planType === 'primary').length,
				required: s.requiredCount
			}));
			setRequirements(reqStatus);

		} catch (err) {
			console.error('Fetch data error:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Failed to delete');
			await fetchData(); // Refresh all data to update progress
		} catch (err) {
			console.error('Delete error:', err);
		}
	};

	const handleClearAll = async () => {
		setIsClearModalOpen(false);
		try {
			const response = await fetch('/api/plans', { method: 'DELETE' });
			if (!response.ok) throw new Error('Failed to clear all');
			await fetchData();
		} catch (err) {
			console.error('Clear all error:', err);
		}
	};

	if (loading) return (
		<div className="flex flex-col items-center justify-center py-20 animate-pulse">
			<div className="w-12 h-12 rounded-full border-4 border-orange-600/20 border-t-orange-600 animate-spin mb-4" />
			<p className="text-gray-500 font-black uppercase tracking-widest text-xs">Analyzing plan...</p>
		</div>
	);

	return (
		<div className="space-y-12">
			{/* Progress Section */}
			<div className="flex flex-wrap gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
				<div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-4">
					<LayoutGrid className="w-4 h-4 text-orange-600" />
					<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Requirement Status</span>
				</div>
				{requirements.map((req) => {
					const isComplete = req.current >= req.required;
					return (
						<div key={req.name} className="flex items-center gap-2">
							<span className="text-[10px] font-bold text-gray-400 uppercase">{req.displayName}:</span>
							<div className="flex items-center gap-1.5">
								<span className={cn("text-xs font-black", isComplete ? "text-green-500" : "text-white")}>
									{req.current}/{req.required}
								</span>
								{isComplete ? (
									<CheckCircle2 className="w-3 h-3 text-green-500" />
								) : (
									<div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Course List Section */}
			<div className="space-y-4">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-2">
					<div className="space-y-0.5">
						<h2 className="text-lg font-black text-white uppercase tracking-tight">Weekly Plan</h2>
						<p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Selected classes summary</p>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						{items.length > 0 && (
							<Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 hover:bg-white/5 px-3 rounded-lg border border-white/5 transition-all"
									>
										<Trash2 className="w-3 h-3 mr-2" />
										Clear All Plans
									</Button>
								</DialogTrigger>
								<DialogContent className="glass-panel border-white/10 text-white max-w-[400px] rounded-3xl p-8">
									<DialogHeader className="space-y-4 pt-4">
										<div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto sm:mx-0">
											<Trash2 className="w-6 h-6 text-red-500" />
										</div>
										<div className="space-y-1">
											<DialogTitle className="text-xl font-black uppercase tracking-tight">Clear Plan?</DialogTitle>
											<DialogDescription className="text-gray-500 text-xs font-bold leading-relaxed">
												This action will permanently delete all courses from your current weekly schedule. You cannot undo this.
											</DialogDescription>
										</div>
									</DialogHeader>
									<DialogFooter className="mt-8 flex flex-row gap-3">
										<Button
											variant="ghost"
											onClick={() => setIsClearModalOpen(false)}
											className="flex-1 h-11 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/5"
										>
											Cancel
										</Button>
										<Button
											onClick={handleClearAll}
											className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-[0_10px_20px_rgba(239,68,68,0.2)]"
										>
											Yes, Clear All
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}

						{items.length > 0 && (
							<div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
								<div className="flex flex-col items-center border-r border-white/10 pr-3">
									<span className="text-[14px] font-black text-white leading-none">{items.length}</span>
									<span className="text-[7px] font-bold text-gray-500 uppercase tracking-tighter">Total</span>
								</div>
								<div className="flex flex-col items-center border-r border-white/10 pr-3">
									<span className="text-[14px] font-black text-orange-600 leading-none">{items.filter(i => i.planType === 'primary').length}</span>
									<span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">Primary</span>
								</div>
								<div className="flex flex-col items-center">
									<span className="text-[14px] font-black text-blue-600 leading-none">{items.filter(i => i.planType === 'backup').length}</span>
									<span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">Backup</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{items.length === 0 ? (
					<div className="bg-white/5 border border-white/5 rounded-3xl py-16 flex flex-col items-center justify-center text-center space-y-4">
						<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
							<LayoutGrid className="w-8 h-8" />
						</div>
						<div className="space-y-1">
							<h3 className="text-md font-bold text-white uppercase">Your plan is empty</h3>
							<p className="text-xs text-gray-500 max-w-xs mx-auto">Explore the schedule to build your routine</p>
						</div>
						<Link href="/dashboard">
							<Button className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl px-6 h-10 border border-white/10">
								Return to Schedule
							</Button>
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-2">
						{items.map((item) => (
							<div
								key={item.id}
								className={cn(
									"flex items-center gap-4 bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all group",
									item.planType === 'backup' && "opacity-60 border-l-2 border-dashed border-gray-600 pl-4"
								)}
							>
								{/* Type Indicator */}
								<div className={cn(
									"flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md transition-all group-hover:scale-105",
									item.planType === 'primary'
										? "bg-orange-700/20 text-orange-700 border-orange-600/30 shadow-[0_0_15px_rgba(194,65,12,0.15)]"
										: "bg-blue-700/20 text-blue-700 border-blue-600/30 shadow-[0_0_15px_rgba(29,78,216,0.1)]"
								)}>
									<div className={cn(
										"w-1.5 h-1.5 rounded-full mr-2 animate-pulse",
										item.courseTypeName === 'MAIN-CLASS' && "bg-[#BAE6FD] shadow-[0_0_8px_#BAE6FD]",
										item.courseTypeName === 'SKILLACTIVITIES' && "bg-[#D8B4FE] shadow-[0_0_8px_#D8B4FE]",
										item.courseTypeName === 'FREE-TALK' && "bg-[#FEF08A] shadow-[0_0_8px_#FEF08A]"
									)} />
									{item.planType === 'primary' ? 'PRI' : 'BCK'}
								</div>

								{/* Course Details */}
								<div className="flex-1 flex flex-col gap-1.5">
									<div className="flex flex-wrap items-center gap-2 text-white">
										<h4 className="text-sm font-bold tracking-tight">{item.syllabus || item.courseName}</h4>
										<span className="text-[9px] font-black text-orange-600/60 uppercase tracking-widest">
											{item.courseTypeDisplayName}
										</span>
									</div>

									<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-500 font-medium">
										<span className="flex items-center gap-1.5 leading-none px-2 py-0.5 rounded-md bg-white/5">
											<Calendar className="w-3 h-3 text-orange-600/50" />
											{item.day}
										</span>
										<span className="flex items-center gap-1.5 leading-none px-2 py-0.5 rounded-md bg-white/5">
											<Clock className="w-3 h-3 text-orange-600/50" />
											{item.timeSlotLabel}
										</span>
										{item.lecturer && (
											<span className="flex items-center gap-1.5 leading-none px-2 py-0.5 rounded-md bg-white/5">
												<div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
												<span className="text-gray-400">{item.lecturer}</span>
											</span>
										)}
										{item.room && (
											<span className="flex items-center gap-1.5 leading-none px-2 py-0.5 rounded-md bg-white/5">
												<MapPin className="w-3 h-3 text-orange-600/50" />
												{item.room}
											</span>
										)}
									</div>
								</div>

								{/* Delete Action button */}
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={() => handleDelete(item.id)}
									className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
								>
									<Trash2 className="w-3.5 h-3.5" />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
