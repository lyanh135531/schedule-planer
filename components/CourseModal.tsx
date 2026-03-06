'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CourseSlot } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CourseModalProps {
	course: CourseSlot;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

interface Plan {
	id: string;
	externalCourseId: string;
	courseName: string;
	day: string;
	startTime: string;
	endTime: string;
	syllabus: string;
	planType: 'primary' | 'backup';
	linkedPrimaryId?: string;
}

export default function CourseModal({ course, isOpen, onClose, onSuccess }: CourseModalProps) {
	const [loading, setLoading] = useState(false);
	const [existingPlans, setExistingPlans] = useState<{ primary: Plan[]; backup: Plan[] }>({ primary: [], backup: [] });
	const [registrationInfo, setRegistrationInfo] = useState<{ id: string; type: 'primary' | 'backup' } | null>(null);
	const [conflictCourse, setConflictCourse] = useState<Plan | null>(null);

	// Fetch current plans to check for status and conflicts
	const checkStatus = useCallback(async () => {
		try {
			const res = await fetch('/api/plans');
			if (!res.ok) return;
			const data = await res.json();
			setExistingPlans(data);

			// Check if THIS course is already registered
			const primaryMatch = data.primary.find((p: Plan) => p.externalCourseId === course.id);
			if (primaryMatch) {
				setRegistrationInfo({ id: primaryMatch.id, type: 'primary' });
				return;
			}
			const backupMatch = data.backup.find((b: Plan) => b.externalCourseId === course.id);
			if (backupMatch) {
				setRegistrationInfo({ id: backupMatch.id, type: 'backup' });
				return;
			}

			// Check for conflicts with primary plans (Time OR Syllabus)
			const conflict = data.primary.find((p: Plan) => {
				// 1. Syllabus conflict (Same lesson)
				if (course.syllabus && p.syllabus === course.syllabus) {
					return true;
				}

				// 2. Time conflict (Same day + overlap)
				if (p.day !== course.day) return false;

				const s1 = course.start_time;
				const e1 = course.end_time;
				const s2 = p.startTime;
				const e2 = p.endTime;

				if (!s1 || !e1 || !s2 || !e2) return false;

				return (
					(s1 >= s2 && s1 < e2) ||
					(e1 > s2 && e1 <= e2) ||
					(s1 <= s2 && e1 >= e2)
				);
			});
			setConflictCourse(conflict || null);
		} catch (err) {
			console.error('Status check error:', err);
		}
	}, [course.day, course.end_time, course.id, course.start_time, course.syllabus]);

	// Use effect to fetch status when modal opens
	useEffect(() => {
		if (isOpen) {
			checkStatus();
		} else {
			// Clear state when closing
			setRegistrationInfo(null);
			setConflictCourse(null);
		}
	}, [isOpen, checkStatus]);

	const handleRemove = async () => {
		if (!registrationInfo) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/plans/${registrationInfo.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to remove course');

			toast.success('Removed from plan');
			if (onSuccess) onSuccess();
			onClose();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Error removing course');
		} finally {
			setLoading(false);
		}
	};

	const handleAddToPlan = async (planType: 'primary' | 'backup') => {
		setLoading(true);
		try {
			const body: {
				externalCourseId: string;
				courseCode: string;
				courseName: string;
				syllabus: string;
				lecturer: string;
				room: string;
				courseTypeName: string;
				day: string;
				startTime: string;
				endTime: string;
				timeSlotLabel: string;
				planType: 'primary' | 'backup';
				linkedPrimaryId?: string;
				priorityOrder?: number;
			} = {
				externalCourseId: course.id,
				courseCode: course.course_code,
				courseName: course.course_name,
				syllabus: course.syllabus || '',
				lecturer: course.lecturer || '',
				room: course.room || '',
				courseTypeName: course.course_type_name,
				day: course.day,
				startTime: course.start_time,
				endTime: course.end_time,
				timeSlotLabel: course.time_slot,
				planType,
			};

			if (planType === 'backup') {
				// SMART LINKING: Use the conflict course if available, or fall back to the first primary
				const linkTo = conflictCourse || existingPlans.primary[0];

				if (!linkTo) {
					throw new Error('Please add a primary course first before adding a backup.');
				}

				body.linkedPrimaryId = linkTo.id;

				// Calculate next priority order globally (across ALL backups, not just per-primary)
				const totalBackupsCount = existingPlans.backup.length;
				body.priorityOrder = totalBackupsCount + 1;
			}

			const response = await fetch('/api/plans', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || `Failed to add to ${planType} plan`);
			}

			toast.success(`${course.course_name} added to ${planType} plan!`);
			if (onSuccess) onSuccess();
			onClose();
		} catch (err: unknown) {
			console.error('Plan update error:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to update plan';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	// Derive display values
	const courseTypeLabel = course.course_type_name === 'MAIN-CLASS' ? 'Main Class'
		: course.course_type_name === 'FREE-TALK' ? 'Free Talk'
			: 'Skill Activities';

	const typeColors = {
		'MAIN-CLASS': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400', accent: 'from-amber-500/20' },
		'FREE-TALK': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', dot: 'bg-sky-400', accent: 'from-sky-500/20' },
		'SKILLACTIVITIES': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400', accent: 'from-emerald-500/20' },
	};
	const tc = typeColors[course.course_type_name as keyof typeof typeColors] || typeColors['SKILLACTIVITIES'];

	const isEnrolled = course.status === 'ENROLLED';

	return (
		<Dialog open={isOpen} onOpenChange={onClose} >
			<DialogContent showCloseButton={false} className="bg-[#161923] text-white border-white/10 sm:max-w-[460px] rounded-md p-0 overflow-hidden gap-0">

				{/* Colored Top Accent */}
				<div className={cn("h-1 w-full bg-gradient-to-r", tc.accent, "to-transparent")} />

				{/* Header */}
				<div className="px-6 pt-5 pb-4 space-y-3">
					<DialogHeader className="space-y-2">
						<div className="flex items-start justify-between gap-3">
							<div className="flex-1 min-w-0 space-y-1.5">
								<div className="flex flex-wrap items-center gap-2">
									{/* SubClassType Badge */}
									{course.sub_class_name && (
										<span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border", tc.bg, tc.text, tc.border)}>
											<div className={cn("w-1.5 h-1.5 rounded-full", tc.dot)} />
											{course.sub_class_name}
										</span>
									)}
									{/* Course Type */}
									<span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
										{courseTypeLabel}
									</span>
								</div>
								<DialogTitle className="text-lg font-black text-white tracking-tight leading-snug">
									{course.syllabus || course.course_name}
								</DialogTitle>
								<DialogDescription className="sr-only">Course details for {course.syllabus || course.course_name}</DialogDescription>
							</div>

							{/* Status Indicator */}
							{(isEnrolled || registrationInfo) && (
								<div className={cn(
									"shrink-0 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border",
									isEnrolled ? "bg-green-500/10 text-green-400 border-green-500/20" :
										registrationInfo?.type === 'primary' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
											"bg-blue-500/10 text-blue-400 border-blue-500/20"
								)}>
									{isEnrolled ? 'Enrolled' : registrationInfo?.type === 'primary' ? 'Primary' : 'Backup'}
								</div>
							)}
						</div>
					</DialogHeader>

					{/* Lesson Description */}
					{course.lesson_description && (
						<p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
							{course.lesson_description}
						</p>
					)}
				</div>

				{/* Info Grid */}
				<div className="px-6 pb-4">
					<div className="grid grid-cols-2 gap-3">
						{/* Lecturer */}
						<div className="bg-white/[0.03] rounded-md p-3 border border-white/5">
							<p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Lecturer</p>
							<p className="text-sm font-bold text-white truncate">{course.lecturer}</p>
						</div>
						{/* Room */}
						<div className="bg-white/[0.03] rounded-md p-3 border border-white/5">
							<p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Room</p>
							<p className="text-sm font-bold text-white truncate">{course.room}</p>
						</div>
						{/* Day */}
						<div className="bg-white/[0.03] rounded-md p-3 border border-white/5">
							<p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Day</p>
							<p className="text-sm font-bold text-white">{course.day}</p>
						</div>
						{/* Time */}
						<div className="bg-white/[0.03] rounded-md p-3 border border-white/5">
							<p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Time</p>
							<p className="text-sm font-bold text-white">{course.time_slot}</p>
						</div>
					</div>
				</div>


				{/* Conflict Warning */}
				{conflictCourse && !registrationInfo && (
					<div className="px-6 pb-4">
						<div className="bg-red-500/5 border border-red-500/15 p-3 rounded-md flex items-center gap-3">
							<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
							<p className="text-[10px] font-bold text-red-400">
								{course.syllabus && conflictCourse.syllabus === course.syllabus
									? `Duplicate lesson: ${course.syllabus}`
									: `Time conflict with: ${conflictCourse.syllabus || conflictCourse.courseName}`}
							</p>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="px-6 pb-6">
					<DialogFooter className="flex gap-2 sm:justify-end">
						{registrationInfo ? (
							<Button
								onClick={handleRemove}
								disabled={loading}
								className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-[10px] uppercase tracking-widest rounded-md transition-all"
							>
								{loading ? 'Removing...' : 'Remove from Plan'}
							</Button>
						) : (
							<div className="flex gap-2 w-full">
								<Button
									onClick={() => handleAddToPlan('backup')}
									disabled={loading}
									className="flex-1 h-11 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold text-[10px] uppercase tracking-widest rounded-md transition-all"
								>
									Add as Backup
								</Button>
								<Button
									onClick={() => handleAddToPlan('primary')}
									disabled={loading || !!conflictCourse}
									className={cn(
										"flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-md shadow-[0_6px_20px_rgba(232,90,33,0.25)] transition-all",
										!!conflictCourse && "opacity-40 grayscale cursor-not-allowed shadow-none"
									)}
								>
									{loading ? 'Adding...' : 'Add Primary'}
								</Button>
							</div>
						)}
					</DialogFooter>
				</div>

			</DialogContent>
		</Dialog>
	);
}
