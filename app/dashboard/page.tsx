'use client';

import { useEffect, useState } from 'react';
import ScheduleGrid from '@/components/ScheduleGrid';
import { CourseSlot } from '@/lib/types';
import Loading from '@/components/Loading';

export default function DashboardPage() {
	const [courses, setCourses] = useState<CourseSlot[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		try {
			const [coursesRes, plansRes] = await Promise.all([
				fetch('/api/courses'),
				fetch('/api/plans')
			]);

			if (!coursesRes.ok || !plansRes.ok) throw new Error('Failed to fetch data');

			const response = await coursesRes.json();
			const plansData = await plansRes.json();

			// Flatten plans for easy lookup
			const planMap: Record<string, 'primary' | 'backup'> = {};
			plansData.primary.forEach((p: { externalCourseId: string }) => planMap[p.externalCourseId] = 'primary');
			plansData.backup.forEach((b: { externalCourseId: string }) => planMap[b.externalCourseId] = 'backup');

			// Parse TalkFirst API response format
			if (response.code !== "200" || !Array.isArray(response.data)) {
				throw new Error('Invalid API response');
			}

			// Map TalkFirst API courses to CourseSlot type
			const mappedCourses: CourseSlot[] = response.data.map((course: {
				id: string;
				timeSchedule: string;
				subClass?: { key: string; label: string; configuration?: { color?: string } };
				classType?: { key: string; label: string; configuration?: { color?: string } };
				classTimeId?: { label: string; configuration?: { start: { hour: number; minute: number }; end: { hour: number; minute: number } } };
				teacherId?: { label: string };
				room?: { label: string };
				lessonStatus?: { value: string };
				syllabusId?: { label: string };
			}) => {
				// Extract day from timeSchedule
				const scheduleDate = new Date(course.timeSchedule);
				const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
				const dayName = days[scheduleDate.getDay()].toUpperCase();

				// Get color from subClass configuration
				const color = course.subClass?.configuration?.color || course.classType?.configuration?.color || '#4A90E2';

				// Format times from configuration if available
				const startTime = course.classTimeId?.configuration?.start
					? `${course.classTimeId.configuration.start.hour.toString().padStart(2, '0')}:${course.classTimeId.configuration.start.minute.toString().padStart(2, '0')}`
					: '';
				const endTime = course.classTimeId?.configuration?.end
					? `${course.classTimeId.configuration.end.hour.toString().padStart(2, '0')}:${course.classTimeId.configuration.end.minute.toString().padStart(2, '0')}`
					: '';

				// Map time label directly to time_slot for dynamic grid
				const timeLabel = course.classTimeId?.label || '';

				// Special handling for Skill Activities / Clubs that might go to EXTRA if no time label
				const isExtra = course.classType?.key === 'SKILLACTIVITIES' && !timeLabel;

				return {
					id: course.id,
					course_code: course.subClass?.key || course.classType?.key || '',
					course_name: course.subClass?.label || course.classType?.label || 'Unknown',
					course_type_name: course.classType?.key || '',
					lecturer: course.teacherId?.label || 'TBA',
					room: course.room?.label || 'TBA',
					day: dayName,
					time_slot: isExtra ? 'EXTRA' : (timeLabel || 'EXTRA'),
					start_time: startTime,
					end_time: endTime,
					color: color,
					status: course.lessonStatus?.value || 'AVAILABLE',
					syllabus: course.syllabusId?.label || '',
					plan_type: planMap[course.id]
				};
			});

			setCourses(mappedCourses);
		} catch (err) {
			console.error('Fetch data error:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="space-y-6 w-full">
			{/* Schedule Legend */}
			<div className="flex flex-wrap items-center justify-center gap-6 pb-2">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#BAE6FD] shadow-[0_0_10px_rgba(186,230,253,0.3)]"></div>
					<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Class</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#FEF08A] shadow-[0_0_10px_rgba(254,240,138,0.3)]"></div>
					<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Free Talk</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#D8B4FE] shadow-[0_0_10px_rgba(216,180,254,0.3)]"></div>
					<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skill Activities</span>
				</div>
			</div>

			<ScheduleGrid initialCourses={courses} onRefresh={fetchData} />
		</div>
	);
}
