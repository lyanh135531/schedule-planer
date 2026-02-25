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
	'MAIN-CLASS': { bg: 'bg-[#BAE6FD]/10', icon: 'text-[#BAE6FD]/80' },
	'FREE-TALK': { bg: 'bg-[#FEF08A]/10', icon: 'text-[#FEF08A]/80' },
	'SKILLACTIVITIES': { bg: 'bg-[#D8B4FE]/10', icon: 'text-[#D8B4FE]/80' },
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
		<div className="w-full max-w-4xl mx-auto py-10 space-y-10">
			{/* Minimalist Header */}
			<div className="flex justify-between items-center px-6 md:px-0">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold text-white tracking-tight">
						Course Setup
					</h1>
					<p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
						Weekly Session Targets
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={handleSave}
						disabled={saving}
						className="h-9 px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"
					>
						{saving ? 'Saving...' : 'Save Settings'}
					</Button>
				</div>
			</div>

			{/* Configuration Section */}
			<div className="space-y-3 px-6 md:px-0">
				{message && (
					<div className={cn(
						"p-3 rounded-lg text-[11px] font-bold text-center animate-in fade-in slide-in-from-top-1 border",
						message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
					)}>
						{message.text}
					</div>
				)}

				<div className="grid gap-2">
					{settings.map((item) => {
						const Icon = TYPE_ICONS[item.courseTypeName] || BookOpen;
						return (
							<div
								key={item.courseTypeId}
								className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
							>
								<div className="flex items-center gap-4">
									<div className={cn(
										"w-10 h-10 rounded-lg flex items-center justify-center",
										(TYPE_COLORS[item.courseTypeName] || { bg: 'bg-orange-500/10' }).bg
									)}>
										<Icon className={cn(
											"w-5 h-5",
											(TYPE_COLORS[item.courseTypeName] || { icon: 'text-orange-500/80' }).icon
										)} />
									</div>
									<h3 className="text-sm font-bold text-white uppercase tracking-tight">
										{item.courseTypeDisplayName}
									</h3>
								</div>

								{/* Minimal Counter */}
								<div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
									<button
										onClick={() => adjustCount(item.courseTypeId, -1)}
										className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
									>
										<Minus className="w-3.5 h-3.5" />
									</button>

									<div className="w-10 text-center">
										<span className="text-lg font-bold text-white tabular-nums">{item.requiredCount}</span>
									</div>

									<button
										onClick={() => adjustCount(item.courseTypeId, 1)}
										className="w-8 h-8 rounded-md bg-orange-600/20 text-orange-600 flex items-center justify-center hover:bg-orange-600/30 hover:text-orange-500 transition-all"
									>
										<Plus className="w-3.5 h-3.5" />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Clean Status Footer */}
			<div className="pt-6 border-t border-white/5 text-center">
				<p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
					All changes are synced securely with your dashboard
				</p>
			</div>
		</div>
	);
}
