'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookOpen, MessageSquare, Star, Minus, Plus } from 'lucide-react';
import Loading from '@/components/Loading';

interface CourseRequirement {
	courseTypeId: string;
	courseTypeName: string;
	courseTypeDisplayName: string;
	requiredCount: number;
	defaultRequiredCount: number;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	'MAIN-CLASS': BookOpen,
	'FREE-TALK': MessageSquare,
	'SKILLACTIVITIES': Star,
};

const TYPE_COLORS: Record<string, { bg: string; icon: string }> = {
	'MAIN-CLASS': { bg: 'bg-[#FEF08A]/10', icon: 'text-[#FEF08A]/80' },
	'FREE-TALK': { bg: 'bg-[#BAE6FD]/10', icon: 'text-[#BAE6FD]/80' },
	'SKILLACTIVITIES': { bg: 'bg-[#BBF7D0]/10', icon: 'text-[#BBF7D0]/80' },
};

export default function SettingsPage() {
	const [settings, setSettings] = useState<CourseRequirement[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		setLoading(true);
		try {
			const res = await fetch('/api/settings/course-requirements');
			if (!res.ok) throw new Error('Failed to fetch requirements');
			const data = await res.json();
			setSettings(data.settings || []);
		} catch (err: unknown) {
			console.error('Fetch settings error:', err);
			setMessage({ text: 'Failed to load configuration', type: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		try {
			const res = await fetch('/api/settings/course-requirements', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ settings }),
			});

			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.message || 'Failed to update settings');
			}

			setMessage({ text: 'Configuration saved successfully! 🚀', type: 'success' });
			setTimeout(() => setMessage(null), 3000);
		} catch (err: unknown) {
			console.error('Save settings error:', err);
			const errorText = err instanceof Error ? err.message : 'Error saving configuration. Please try again.';
			setMessage({ text: errorText, type: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const adjustCount = (id: string, delta: number) => {
		setSettings(prev => prev.map(s => {
			if (s.courseTypeId === id) {
				return { ...s, requiredCount: Math.max(0, Math.min(15, s.requiredCount + delta)) };
			}
			return s;
		}));
	};

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="w-full max-w-4xl mx-auto py-2 md:py-10 space-y-4 md:space-y-10">
			{/* Minimalist Header */}
			<div className="flex justify-between items-center px-4 md:px-0">
				<div className="space-y-0.5">
					<h1 className="text-xl md:text-3xl font-bold text-white tracking-tight">
						Course Setup
					</h1>
					<p className="text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-widest hidden sm:block">
						Weekly Session Targets
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={handleSave}
						disabled={saving}
						className="h-7 md:h-9 px-3 md:px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[9px] md:text-[11px] uppercase tracking-wider rounded-md transition-all shadow-md md:shadow-lg shadow-orange-600/20"
					>
						{saving ? 'Saving...' : <><span className="hidden md:inline">Save Settings</span><span className="md:hidden">Save</span></>}
					</Button>
				</div>
			</div>

			{/* Configuration Section */}
			<div className="space-y-2 md:space-y-3 px-4 md:px-0">
				{message && (
					<div className={cn(
						"p-2 md:p-3 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold text-center animate-in fade-in slide-in-from-top-1 border shadow-sm md:shadow-lg",
						message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
					)}>
						{message.text}
					</div>
				)}

				<div className="grid gap-2 md:gap-3">
					{settings.map((item) => {
						const Icon = TYPE_ICONS[item.courseTypeName] || BookOpen;
						return (
							<div
								key={item.courseTypeId}
								className="flex flex-row items-center justify-between p-2 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all gap-2 md:gap-0 shadow-sm md:shadow-xl"
							>
								<div className="flex flex-row items-center gap-2 md:gap-4 text-left">
									<div className={cn(
										"w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shadow-inner shrink-0",
										(TYPE_COLORS[item.courseTypeName] || { bg: 'bg-orange-500/10' }).bg
									)}>
										<Icon className={cn(
											"w-4 h-4 md:w-5 md:h-5",
											(TYPE_COLORS[item.courseTypeName] || { icon: 'text-orange-500/80' }).icon
										)} />
									</div>
									<h3 className="text-[11px] md:text-sm font-black text-white uppercase tracking-tight leading-tight line-clamp-2 md:line-clamp-none max-w-[120px] md:max-w-none">
										{item.courseTypeDisplayName}
									</h3>
								</div>

								{/* Minimal Counter */}
								<div className="flex items-center gap-1 bg-black/20 p-1 md:p-1.5 rounded-lg md:rounded-xl border border-white/5 shadow-inner shrink-0">
									<button
										onClick={() => adjustCount(item.courseTypeId, -1)}
										className="w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-white bg-white/5 md:bg-transparent hover:bg-white/10 md:hover:bg-white/5 transition-all active:scale-95"
									>
										<Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
									</button>

									<div className="w-6 md:w-12 text-center">
										<span className="text-sm md:text-lg font-black text-white tabular-nums">{item.requiredCount}</span>
									</div>

									<button
										onClick={() => adjustCount(item.courseTypeId, 1)}
										className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-orange-600/20 text-orange-600 flex items-center justify-center hover:bg-orange-600/30 hover:text-orange-500 transition-all shadow-[0_0_10px_rgba(234,88,12,0.1)] active:scale-95"
									>
										<Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Clean Status Footer */}
			<div className="pt-2 md:pt-6 border-t border-white/5 text-center">
				<p className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest hidden sm:block">
					All changes are synced securely with your dashboard
				</p>
			</div>
		</div>
	);
}
