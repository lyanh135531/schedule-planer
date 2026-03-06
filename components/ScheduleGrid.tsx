'use client';

import { useState } from 'react';
import { CourseSlot } from '@/lib/types';
import { cn } from '@/lib/utils';
import CourseModal from '@/components/CourseModal';

interface ScheduleGridProps {
	initialCourses: CourseSlot[];
	onRefresh?: () => void;
	startDate?: string;
	endDate?: string;
}

const COURSE_COLORS: Record<string, string> = {
	'MAIN-CLASS': 'bg-[#FEF08A]/90 text-black border-yellow-400',
	'FREE-TALK': 'bg-[#BAE6FD]/90 text-black border-sky-300',
	'SKILLACTIVITIES': 'bg-[#BBF7D0]/90 text-black border-green-400',
};

const COURSE_PRIORITY: Record<string, number> = {
	'MAIN-CLASS': 1,
	'FREE-TALK': 2,
	'SKILLACTIVITIES': 3,
};

export default function ScheduleGrid({ initialCourses, onRefresh, startDate, endDate }: ScheduleGridProps) {
	const [selectedCourse, setSelectedCourse] = useState<CourseSlot | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Dynamically generate the 7 days of the week starting from startDate
	const getDaysOfWeek = () => {
		if (!startDate) return [];

		const baseDate = new Date(startDate);
		const days = [];
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

		for (let i = 0; i < 7; i++) {
			const date = new Date(baseDate);
			date.setDate(baseDate.getDate() + i);

			// Format as DD-MM-YYYY
			const d = date.getDate().toString().padStart(2, '0');
			const m = (date.getMonth() + 1).toString().padStart(2, '0');
			const y = date.getFullYear();

			days.push({
				key: dayNames[date.getDay()],
				date: `${d}-${m}-${y}`
			});
		}
		return days;
	};

	const DAYS = getDaysOfWeek();

	// Dynamically generate time slots from courses
	const getDynamicTimeSlots = () => {
		const slotsMap = new Map<string, { id: string; label: string; group: string; startTime: string }>();
		initialCourses.forEach(course => {
			if (course.time_slot && course.time_slot !== 'EXTRA') {
				if (!slotsMap.has(course.time_slot)) {
					const hour = parseInt(course.start_time?.split(':')[0] || '0');
					let group = 'MORNING';
					if (hour >= 12 && hour < 18) group = 'AFTERNOON';
					if (hour >= 18) group = 'EVENING';
					slotsMap.set(course.time_slot, {
						id: course.time_slot,
						label: course.time_slot,
						group,
						startTime: course.start_time || '00:00'
					});
				}
			}
		});
		return Array.from(slotsMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
	};

	const TIME_SLOTS = getDynamicTimeSlots();

	const getCourses = (day: string, slotId: string) => {
		return initialCourses
			.filter(c => c.day === day && c.time_slot === slotId)
			.sort((a, b) => {
				const priorityA = COURSE_PRIORITY[a.course_type_name] || 99;
				const priorityB = COURSE_PRIORITY[b.course_type_name] || 99;
				return priorityA - priorityB;
			});
	};

	const handleCellClick = (course?: CourseSlot) => {
		if (course) {
			setSelectedCourse(course);
			setIsModalOpen(true);
		}
	};

	return (
		<div className="w-full flex-1 flex flex-col overflow-hidden">
			<div className="overflow-x-auto w-full flex-1 flex flex-col">
				<div className="min-w-[1200px] w-full bg-transparent relative rounded-md border border-white/10 overflow-hidden flex flex-col flex-1">

					{/* Header Section - Sticky */}
					<div className="grid grid-cols-8 gap-0 border-b border-white/10 bg-[#161923] sticky top-0 z-50 shadow-xl">
						<div className="col-span-1 flex items-center justify-center py-4 bg-black/40 border-r border-white/10">
							<span className="text-[9px] font-black text-white/20 tracking-[0.3em] uppercase">Time</span>
						</div>
						{DAYS.map((day) => (
							<div key={day.key} className="col-span-1 p-3 border-l border-white/5 flex flex-col items-center justify-center text-center bg-black/20">
								<div className="text-[11px] font-bold text-orange-500 tracking-tighter">{day.key}</div>
								<div className="text-[10px] font-bold text-gray-500 tabular-nums">{day.date}</div>
							</div>
						))}
					</div>

					{/* Grid Body - Scrollable Area */}
					<div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-[#121212]/30">
						{['MORNING', 'AFTERNOON', 'EVENING'].map(group => {
							const groupSlots = TIME_SLOTS.filter(s => s.group === group);
							if (groupSlots.length === 0) return null;

							return (
								<div key={group} className="relative">
									{/* Session Divider Header with Thin Orange Top Line */}
									<div className="w-full border-t border-[#e85a21]/30 h-px"></div>

									{groupSlots.map((slot) => (
										<div
											key={slot.id}
											className={cn(
												"grid grid-cols-8 border-b border-white/10 gap-0 min-h-[100px] transition-colors hover:bg-white/[0.02]",
											)}
										>
											{/* Time Column - Floating Labels */}
											<div className="col-span-1 flex items-center justify-center px-4 py-4 relative border-r border-white/10 bg-black/20">
												<span className="text-[13px] font-bold text-white whitespace-nowrap tracking-tight drop-shadow-lg">
													{slot.label}
												</span>
											</div>

											{/* Content Slots */}
											{DAYS.map(day => {
												const courses = getCourses(day.key, slot.id);
												return (
													<div
														key={`${day.key}-${slot.id}`}
														className="col-span-1 border-l border-white/10 p-2 relative group"
													>
														<div className="flex flex-col gap-2 h-full">
															{courses.length > 0 ? (
																courses.map(course => (
																	<div
																		key={course.id}
																		onClick={() => handleCellClick(course)}
																		className={cn(
																			"relative rounded-md flex flex-col justify-between border-t-[3px] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 shadow-sm p-1.5 min-h-[60px]",
																			COURSE_COLORS[course.course_type_name] || 'bg-white text-black border-gray-400'
																		)}
																	>
																		<div className="space-y-1">
																			{course.plan_type && (
																				<div className={cn(
																					"absolute top-1.5 right-1.5 flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-[0.1em] border backdrop-blur-md shadow-sm z-10",
																					course.plan_type === 'primary'
																						? "bg-orange-700/20 text-orange-700 border-orange-600/40 shadow-[0_0_12px_rgba(194,65,12,0.2)]"
																						: "bg-blue-700/20 text-blue-700 border-blue-600/40 shadow-[0_0_12px_rgba(29,78,216,0.15)]"
																				)}>
																					<div className={cn(
																						"w-1 h-1 rounded-full mr-1 animate-pulse",
																						course.plan_type === 'primary' ? "bg-orange-700" : "bg-blue-700"
																					)} />
																					{course.plan_type === 'primary' ? 'PRI' : `BCK ${course.priority_order || ''}`}
																				</div>
																			)}
																			{course.sub_class_name && (
																				<div className="text-[9px] font-bold text-black/50 tracking-tighter mb-0.5">
																					{course.sub_class_name}
																				</div>
																			)}
																			<div className="text-[11px] font-bold leading-tight text-center text-black tracking-tight line-clamp-2 h-[2.5em] flex items-center justify-center">
																				{course.syllabus || course.course_name || course.course_code}
																			</div>
																		</div>

																		<div className="mt-auto pt-1 flex flex-col items-center gap-1">
																			<div className="text-[8px] font-bold tracking-tight text-black/70 flex items-center gap-1">
																				<span className="line-clamp-1">{course.lecturer}</span>
																				<span className="opacity-30">|</span>
																				<span>{course.room}</span>
																			</div>
																		</div>
																	</div>
																))
															) : (
																<div className="w-full h-full"></div>
															)}
														</div>
													</div>
												);
											})}
										</div>
									))}
								</div>
							);
						})}
					</div>
				</div>

				{selectedCourse && (
					<CourseModal
						course={selectedCourse}
						isOpen={isModalOpen}
						onClose={() => setIsModalOpen(false)}
						onSuccess={onRefresh}
					/>
				)}
			</div>
		</div>
	);
}
