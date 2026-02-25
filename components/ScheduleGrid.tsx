'use client';

import { useState } from 'react';
import { CourseSlot } from '@/lib/types';
import { cn } from '@/lib/utils';
import CourseModal from '@/components/CourseModal';

interface ScheduleGridProps {
	initialCourses: CourseSlot[];
	onRefresh?: () => void;
}

const DAYS = [
	{ key: 'MONDAY', date: '09-02-2026' },
	{ key: 'TUESDAY', date: '10-02-2026' },
	{ key: 'WEDNESDAY', date: '11-02-2026' },
	{ key: 'THURSDAY', date: '12-02-2026' },
	{ key: 'FRIDAY', date: '13-02-2026' },
	{ key: 'SATURDAY', date: '14-02-2026' },
	{ key: 'SUNDAY', date: '15-02-2026' },
];

const COURSE_COLORS: Record<string, string> = {
	'MAIN-CLASS': 'bg-[#BAE6FD]/90 text-black border-sky-300',
	'FREE-TALK': 'bg-[#FEF08A]/90 text-black border-yellow-400',
	'SKILLACTIVITIES': 'bg-[#D8B4FE]/90 text-black border-purple-400',
};

const COURSE_PRIORITY: Record<string, number> = {
	'MAIN-CLASS': 1,
	'FREE-TALK': 2,
	'SKILLACTIVITIES': 3,
};

export default function ScheduleGrid({ initialCourses, onRefresh }: ScheduleGridProps) {
	const [selectedCourse, setSelectedCourse] = useState<CourseSlot | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

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
		<div className="overflow-x-auto w-full border-t border-white/5">
			<div className="min-w-[1200px] w-full bg-transparent relative overflow-hidden">

				{/* Header Section */}
				<div className="grid grid-cols-8 gap-0 border-b border-white/10 bg-[#222222]/80 top-[80px] z-40">
					<div className="col-span-1 flex items-center justify-center py-4">
						<span className="text-[9px] font-black text-white/10 tracking-[0.3em] uppercase">Time</span>
					</div>
					{DAYS.map((day) => (
						<div key={day.key} className="col-span-1 p-3 border-l border-white/5 flex flex-col items-center justify-center text-center">
							<div className="text-[11px] font-black text-orange-500 uppercase tracking-tighter">{day.key}</div>
							<div className="text-[10px] font-bold text-gray-500 tabular-nums">{day.date}</div>
						</div>
					))}
				</div>

				{/* Grid Body */}
				<div className="relative z-10">
					{['MORNING', 'AFTERNOON', 'EVENING'].map(group => {
						const groupSlots = TIME_SLOTS.filter(s => s.group === group);
						if (groupSlots.length === 0) return null;

						return (
							<div key={group} className="relative">
								{/* Session Divider Header with Thin Orange Top Line (NON-STICKY) */}
								<div className="w-full border-t border-[#e85a21]/50 h-px"></div>

								{groupSlots.map(slot => (
									<div
										key={slot.id}
										className="grid grid-cols-8 border-b border-white/5 gap-0 min-h-[80px]"
									>
										{/* Time Column - Floating Labels */}
										<div className="col-span-1 flex items-center justify-center px-4 py-3 relative bg-[#1a1a1a]/20">
											<span className="text-[12px] font-black text-white whitespace-nowrap tracking-tight drop-shadow-md">
												{slot.label}
											</span>
										</div>

										{/* Content Slots */}
										{DAYS.map(day => {
											const courses = getCourses(day.key, slot.id);
											return (
												<div
													key={`${day.key}-${slot.id}`}
													className="col-span-1 border-l border-white/5 p-1 relative group"
												>
													<div className="flex flex-col gap-2 h-full">
														{courses.length > 0 ? (
															courses.map(course => (
																<div
																	key={course.id}
																	onClick={() => handleCellClick(course)}
																	className={cn(
																		"relative rounded-xl flex flex-col justify-between border-t-[3px] cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:brightness-110 shadow-sm p-1.5 min-h-[60px]",
																		COURSE_COLORS[course.course_type_name] || 'bg-white text-black border-gray-400'
																	)}
																>
																	<div className="space-y-1">
																		{course.plan_type && (
																			<div className={cn(
																				"absolute top-1.5 right-1.5 flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.1em] border backdrop-blur-md shadow-sm z-10",
																				course.plan_type === 'primary'
																					? "bg-orange-700/20 text-orange-700 border-orange-600/40 shadow-[0_0_12px_rgba(194,65,12,0.2)]"
																					: "bg-blue-700/20 text-blue-700 border-blue-600/40 shadow-[0_0_12px_rgba(29,78,216,0.15)]"
																			)}>
																				<div className={cn(
																					"w-1 h-1 rounded-full mr-1 animate-pulse",
																					course.plan_type === 'primary' ? "bg-orange-700" : "bg-blue-700"
																				)} />
																				{course.plan_type === 'primary' ? 'PRI' : 'BCK'}
																			</div>
																		)}
																		<div className="text-[11px] font-black leading-tight text-center text-black tracking-tight line-clamp-2">
																			{course.syllabus || course.course_name || course.course_code}
																		</div>
																	</div>

																	<div className="mt-auto pt-1 flex flex-col items-center gap-1">
																		<div className="text-[8px] font-black tracking-tight uppercase text-black/70 flex items-center gap-1">
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
	);
}
