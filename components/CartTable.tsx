'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookOpen, Calendar, CheckCircle2, Clock, LayoutGrid, MapPin, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
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

const COURSE_TYPE_COLORS: Record<string, { dot: string; bg: string; text: string; border: string }> = {
	'MAIN-CLASS': { dot: 'bg-[#FEF08A] shadow-[0_0_8px_#FEF08A]', bg: 'bg-yellow-400/10', text: 'text-yellow-300', border: 'border-yellow-400/20' },
	'FREE-TALK': { dot: 'bg-[#BAE6FD] shadow-[0_0_8px_#BAE6FD]', bg: 'bg-sky-400/10', text: 'text-sky-300', border: 'border-sky-400/20' },
	'SKILLACTIVITIES': { dot: 'bg-[#BBF7D0] shadow-[0_0_8px_#BBF7D0]', bg: 'bg-green-400/10', text: 'text-green-300', border: 'border-green-400/20' },
};

export default function CartTable() {
	const [items, setItems] = useState<CartItem[]>([]);
	const [requirements, setRequirements] = useState<RequirementStatus[]>([]);
	const [loading, setLoading] = useState(true);
	const [isClearModalOpen, setIsClearModalOpen] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [plansRes, settingsRes] = await Promise.all([
				fetch('/api/plans'),
				fetch('/api/settings/course-requirements')
			]);

			if (!plansRes.ok || !settingsRes.ok) throw new Error('Failed to fetch data');

			const plansData = await plansRes.json();
			const settingsData = await settingsRes.json();

			const allItems: CartItem[] = [
				...plansData.primary.map((p: CartItem) => ({ ...p, status: 'Primary' })),
				...plansData.backup.map((b: CartItem) => ({
					...b,
					status: `Backup (P${b.priorityOrder})`
				}))
			];
			setItems(allItems);

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
		setDeletingId(id);
		try {
			const response = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
			if (!response.ok) throw new Error('Failed to delete');
			await fetchData();
		} catch (err) {
			console.error('Delete error:', err);
		} finally {
			setDeletingId(null);
		}
	};

	const handleClearAll = async (type?: 'primary' | 'backup') => {
		setIsClearModalOpen(false);
		try {
			const url = type ? `/api/plans?type=${type}` : '/api/plans';
			const response = await fetch(url, { method: 'DELETE' });
			if (!response.ok) throw new Error('Failed to clear plans');
			await fetchData();
		} catch (err) {
			console.error('Clear plans error:', err);
		}
	};

	const primaryItems = items.filter(i => i.planType === 'primary');
	const backupItems = items.filter(i => i.planType === 'backup');

	if (loading) return (
		<div className="flex flex-col items-center justify-center py-20 animate-pulse">
			<div className="w-12 h-12 rounded-full border-4 border-orange-600/20 border-t-orange-600 animate-spin mb-4" />
			<p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Analyzing plan...</p>
		</div>
	);

	return (
		<div className="flex-1 flex flex-col gap-2 md:gap-4 overflow-hidden">

			{/* Stats + Progress Bar Row */}
			<div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-2 md:gap-4 shrink-0 pb-1 md:pb-0 snap-x snap-mandatory custom-scrollbar">
				{requirements.map((req) => {
					const isComplete = req.current >= req.required;
					const pct = Math.min(100, Math.round((req.current / req.required) * 100));
					const colors = COURSE_TYPE_COLORS[req.name];
					return (
						<div key={req.name} className={cn(
							"relative overflow-hidden rounded-lg md:rounded-md p-3 md:p-4 border transition-all min-w-[70%] md:min-w-0 snap-center shrink-0 shadow-sm md:shadow-none",
							isComplete
								? "bg-green-500/5 border-green-500/20"
								: "bg-white/5 border-white/10"
						)}>
							<div className="flex items-start justify-between mb-2 md:mb-3">
								<div>
									<p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{req.displayName}</p>
									<p className={cn("text-xl md:text-2xl font-black leading-none", isComplete ? "text-green-400" : "text-white")}>
										{req.current}
										<span className="text-[10px] md:text-sm font-bold text-gray-600 ml-1">/ {req.required}</span>
									</p>
								</div>
								{isComplete
									? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
									: <div className={cn("w-2 h-2 rounded-full mt-2 animate-pulse", colors?.dot.split(' ')[0] || 'bg-orange-500')} />
								}
							</div>
							<div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
								<div
									className={cn("h-full rounded-full transition-all duration-700", isComplete ? "bg-green-500" : "bg-orange-600")}
									style={{ width: `${pct}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>

			{/* Course List */}
			<div className="flex-1 overflow-hidden flex flex-col bg-white/[0.02] rounded-lg md:rounded-md border border-white/10 shadow-md md:shadow-xl">
				{/* Table Header */}
				<div className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3 border-b border-white/10 shrink-0">
					<div className="flex items-center gap-2 md:gap-3">
						<BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500/70" />
						<div>
							<h2 className="text-[11px] md:text-sm font-bold text-white items-center gap-2 flex">Weekly Plan 
								<span className="md:hidden text-[9px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded ml-1">{primaryItems.length + backupItems.length}</span>
							</h2>
							{items.length > 0 && (
								<p className="text-[9px] md:text-[10px] text-gray-600 hidden md:block">
									{primaryItems.length} primary &nbsp;·&nbsp; {backupItems.length} backup
								</p>
							)}
						</div>
					</div>

					{items.length > 0 && (
						<div className="flex items-center gap-2">
							<Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
								<DialogTrigger asChild>
									<Button variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-red-500 hover:bg-red-500/5 px-2 rounded-md border border-white/5 transition-all">
										<Trash2 className="w-3 h-3 md:mr-2" />
										<span className="hidden md:inline">Clear All</span>
									</Button>
								</DialogTrigger>
								<DialogContent className="glass-panel border-white/10 text-white max-w-[420px] rounded-md p-8">
									<DialogHeader className="space-y-4 pt-4">
										<div className="space-y-1">
											<DialogTitle className="text-xl font-black uppercase tracking-tight">Clear Schedule?</DialogTitle>
											<DialogDescription className="text-gray-500 text-xs font-medium leading-relaxed">
												Choose which part of your schedule you want to clear. This action cannot be undone.
											</DialogDescription>
										</div>
									</DialogHeader>
									<div className="grid grid-cols-1 gap-3 mt-8">
										<Button
											onClick={() => handleClearAll('primary')}
											className="w-full h-12 bg-orange-600/10 hover:bg-orange-600/20 text-orange-500 font-bold text-[10px] uppercase tracking-widest rounded-md border border-orange-500/20"
										>
											Clear All Primary
										</Button>
										<Button
											onClick={() => handleClearAll('backup')}
											className="w-full h-12 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-[10px] uppercase tracking-widest rounded-md border border-blue-500/20"
										>
											Clear All Backup
										</Button>
										<div className="h-px bg-white/5 my-1" />
										<Button
											onClick={() => handleClearAll()}
											className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-md shadow-[0_10px_20px_rgba(239,68,68,0.2)]"
										>
											Yes, Clear Everything
										</Button>
										<Button variant="ghost" onClick={() => setIsClearModalOpen(false)} className="w-full h-10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white rounded-md">Cancel</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</div>

				{/* Items List */}
				<div className="flex-1 overflow-y-auto custom-scrollbar">
					{items.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 text-center">
							<div className="w-16 h-16 rounded-md bg-white/5 border border-white/10 flex items-center justify-center mb-4">
								<LayoutGrid className="w-7 h-7 text-gray-700" />
							</div>
							<h3 className="text-sm font-bold text-white mb-1">Your plan is empty</h3>
							<p className="text-xs text-gray-600 mb-6">Go to the schedule to start building your week</p>
							<Link href="/dashboard">
								<Button className="bg-orange-600/90 hover:bg-orange-500 text-white font-bold rounded-md px-6 h-10 shadow-lg shadow-orange-500/10">
									Return to Schedule
								</Button>
							</Link>
						</div>
					) : (
						<div className="divide-y divide-white/5">
							{/* Primary Section */}
							{primaryItems.length > 0 && (
								<div>
									<div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-orange-600/5">
										<ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-500" />
										<span className="text-[9px] md:text-[10px] font-bold text-orange-500/80 uppercase tracking-widest">Primary Classes</span>
										<span className="ml-auto text-[9px] md:text-[10px] font-bold text-gray-600">{primaryItems.length} selected</span>
									</div>
									{primaryItems.map(item => (
										<CourseRow key={item.id} item={item} onDelete={handleDelete} deleting={deletingId === item.id} />
									))}
								</div>
							)}

							{/* Backup Section */}
							{backupItems.length > 0 && (
								<div>
									<div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-blue-600/5">
										<div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-blue-500/50 flex items-center justify-center">
											<div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-blue-500" />
										</div>
										<span className="text-[9px] md:text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">Backup Classes</span>
										<span className="ml-auto text-[9px] md:text-[10px] font-bold text-gray-600">{backupItems.length} selected</span>
									</div>
									{backupItems.map((item, idx) => (
										<CourseRow key={item.id} item={item} index={idx + 1} onDelete={handleDelete} deleting={deletingId === item.id} />
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function CourseRow({ item, index, onDelete, deleting }: { item: CartItem; index?: number; onDelete: (id: string) => void; deleting: boolean }) {
	const colors = COURSE_TYPE_COLORS[item.courseTypeName];
	const isPrimary = item.planType === 'primary';

	return (
		<div className={cn(
			"flex items-center gap-2 md:gap-4 px-3 md:px-5 py-2 md:py-3.5 hover:bg-white/[0.04] transition-colors group border-b border-white/5 md:border-b-0",
			!isPrimary && "opacity-[0.85] md:opacity-70"
		)}>
			{/* Type Badge */}
			<div className={cn(
				"shrink-0 flex items-center justify-center min-w-[34px] md:min-w-[48px] gap-1 md:gap-1.5 px-1 md:px-2.5 py-1 md:py-1.5 rounded md:rounded-md text-[7px] md:text-[9px] font-black uppercase tracking-wider md:tracking-widest border",
				isPrimary
					? "bg-orange-700/10 text-orange-500 border-orange-600/20"
					: "bg-blue-700/10 text-blue-400 border-blue-600/20"
			)}>
				<div className={cn("hidden md:block w-1.5 h-1.5 rounded-full animate-pulse", colors?.dot.split(' ')[0] || 'bg-orange-500')} />
				{isPrimary ? 'PRI' : `BCK ${index ?? ''}`}
			</div>

			{/* Main Details */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
					<h4 className="text-[11px] md:text-sm font-black text-white truncate">{item.syllabus || item.courseName}</h4>
					<span className={cn("hidden md:inline-flex shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border", colors?.bg, colors?.text, colors?.border)}>
						{item.courseTypeDisplayName}
					</span>
				</div>
				<div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-0.5 md:gap-y-1">
					<span className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-bold text-gray-500">
						<Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500/50" />
						{item.day}
					</span>
					<span className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-bold text-gray-500">
						<Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500/50" />
						{item.timeSlotLabel}
					</span>
					{item.lecturer && (
						<span className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-bold text-gray-500">
							<div className="hidden md:block w-1 h-1 rounded-full bg-gray-700" />
							<span className="md:hidden opacity-50">👤</span>
							<span className="line-clamp-1 max-w-[65px] md:max-w-none">{item.lecturer}</span>
						</span>
					)}
					{item.room && (
						<span className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-bold text-gray-500">
							<MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500/50" />
							{item.room}
						</span>
					)}
				</div>
			</div>

			{/* Delete Button */}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => onDelete(item.id)}
				disabled={deleting}
				className="shrink-0 w-7 h-7 md:w-8 md:h-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-md md:opacity-0 md:group-hover:opacity-100"
			>
				<Trash2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
			</Button>
		</div>
	);
}
