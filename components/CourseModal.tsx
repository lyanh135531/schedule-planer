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
	planType: 'primary' | 'backup';
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

			// Check for time conflicts with primary plans
			const conflict = data.primary.find((p: Plan) => {
				if (p.day !== course.day) return false;

				// Standard overlap check
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
	}, [course.day, course.end_time, course.id, course.start_time]);

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
				body.priorityOrder = 1;
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

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="bg-[#2a2a2a] text-white border-gray-700 sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className={cn(
						course.course_type_name === 'MAIN-CLASS' && "text-[#BAE6FD]",
						course.course_type_name === 'FREE-TALK' && "text-[#FEF08A]",
						course.course_type_name === 'SKILLACTIVITIES' && "text-[#D8B4FE]",
						!['MAIN-CLASS', 'FREE-TALK', 'SKILLACTIVITIES'].includes(course.course_type_name) && "text-orange-500"
					)}>
						{course.syllabus || course.course_name}
					</DialogTitle>
					<DialogDescription className="text-gray-400">
						{course.lecturer}
					</DialogDescription>
				</DialogHeader>

				{conflictCourse && !registrationInfo && (
					<div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3">
						<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
						<p className="text-[11px] font-bold text-red-500 uppercase tracking-tighter text-red-500">
							Conflicts with: {conflictCourse.courseName}
						</p>
					</div>
				)}

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<span className="text-sm font-bold text-gray-500">Day:</span>
						<span className="col-span-3 text-sm">{course.day}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<span className="text-sm font-bold text-gray-500">Time:</span>
						<span className="col-span-3 text-sm">{course.time_slot}</span>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<span className="text-sm font-bold text-gray-500">Room:</span>
						<span className="col-span-3 text-sm">{course.room}</span>
					</div>
				</div>
				<DialogFooter className="flex gap-2 sm:justify-end">
					{registrationInfo ? (
						<Button
							onClick={handleRemove}
							disabled={loading}
							className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30"
						>
							{loading ? 'Removing...' : 'Remove from Plan'}
						</Button>
					) : (
						<>
							<Button
								onClick={() => handleAddToPlan('backup')}
								disabled={loading}
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								Add as Backup
							</Button>
							<Button
								onClick={() => handleAddToPlan('primary')}
								disabled={loading || !!conflictCourse}
								className={cn(
									"bg-orange-600 hover:bg-orange-700 text-white",
									!!conflictCourse && "opacity-50 grayscale cursor-not-allowed"
								)}
							>
								{loading ? 'Adding...' : 'Add to Primary'}
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
