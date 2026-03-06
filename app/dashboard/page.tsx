'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import ScheduleGrid from '@/components/ScheduleGrid';
import { CourseSlot, TalkFirstFlexibleClass } from '@/lib/types';
import Loading from '@/components/Loading';

export default function DashboardPage() {
	const [courses, setCourses] = useState<CourseSlot[]>([]);
	const [rawClasses, setRawClasses] = useState<TalkFirstFlexibleClass[]>([]);
	const [startDate, setStartDate] = useState<string>('');
	const [endDate, setEndDate] = useState<string>('');
	const [loading, setLoading] = useState(true);

	const fetchDataRef = useRef(false);

	const mapAndSetCourses = useCallback((classes: TalkFirstFlexibleClass[], plansData: any) => {
		// Flatten plans for easy lookup
		const planMap: Record<string, 'primary' | 'backup'> = {};
		plansData.primary?.forEach((p: { externalCourseId: string }) => planMap[p.externalCourseId] = 'primary');
		plansData.backup?.forEach((b: { externalCourseId: string }) => planMap[b.externalCourseId] = 'backup');

		// Map TalkFirst API courses to CourseSlot type
		const mapped = classes.map((course: TalkFirstFlexibleClass) => {
			const scheduleDate = new Date(course.date);
			const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			const dayName = days[scheduleDate.getDay()];

			const color = course.subClassType?.bgcolor || '#4A90E2';
			const startTime = course.startTime?.substring(0, 5) || '';
			const endTime = course.endTime?.substring(0, 5) || '';
			const timeLabel = startTime && endTime ? `${startTime} - ${endTime}` : '';

			return {
				id: course.id,
				course_code: course.subClassType?.name || course.programClassId || '',
				course_name: course.subClassType?.name || 'Unknown',
				course_type_name: course.programClassId === '019b08a3-11f1-7f49-aee8-6ba81cdb469f' ? 'MAIN-CLASS' :
					course.programClassId === '019b08a3-50e9-7c33-b9ce-0b86668579b6' ? 'FREE-TALK' : 'SKILLACTIVITIES',
				sub_class_name: course.subClassType?.name,
				lecturer: course.teacherName || 'TBA',
				room: course.room || 'TBA',
				day: dayName,
				time_slot: timeLabel || 'EXTRA',
				start_time: startTime,
				end_time: endTime,
				color: color,
				status: course.hasEnrolled ? 'ENROLLED' : 'AVAILABLE',
				syllabus: course.lesson || '',
				plan_type: planMap[course.id],
				priority_order: plansData.backup?.find((b: { externalCourseId: string }) => b.externalCourseId === course.id)?.priorityOrder,
				lesson_description: course.lessonInfo?.description || '',
			};
		});

		setCourses(mapped);
	}, []);

	// Initial full fetch (courses + plans)
	const fetchAllData = useCallback(async () => {
		if (fetchDataRef.current) return;
		fetchDataRef.current = true;

		try {
			const [coursesRes, plansRes] = await Promise.all([
				fetch('/api/courses'),
				fetch('/api/plans')
			]);

			if (!coursesRes.ok || !plansRes.ok) throw new Error('Failed to fetch data');

			const courseResponse = await coursesRes.json();
			const plansData = await plansRes.json();

			if (courseResponse.startDate) setStartDate(courseResponse.startDate);
			if (courseResponse.endDate) setEndDate(courseResponse.endDate);

			if (courseResponse.flexibleClasses && Array.isArray(courseResponse.flexibleClasses)) {
				setRawClasses(courseResponse.flexibleClasses);
				mapAndSetCourses(courseResponse.flexibleClasses, plansData);
			}
		} catch (err) {
			console.error('Fetch all data error:', err);
		} finally {
			setLoading(false);
		}
	}, [mapAndSetCourses]);

	// Optimized fetch (plans only, reuse raw classes)
	const fetchPlansOnly = useCallback(async () => {
		try {
			const res = await fetch('/api/plans');
			if (!res.ok) throw new Error('Failed to fetch plans');
			const plansData = await res.json();

			// Reuse cached raw classes to update mapped courses
			mapAndSetCourses(rawClasses, plansData);
		} catch (err) {
			console.error('Fetch plans error:', err);
		}
	}, [mapAndSetCourses, rawClasses]);

	useEffect(() => {
		fetchAllData();
	}, [mapAndSetCourses, fetchAllData]);

	if (loading) {
		return <Loading />;
	}

	return (
		<div className="space-y-4 w-full flex-1 flex flex-col overflow-hidden px-4 md:px-6">
			{/* Schedule Legend */}
			<div className="flex flex-wrap items-center justify-center gap-6">
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#FEF08A] shadow-[0_0_10px_rgba(254,240,138,0.3)]"></div>
					<span className="text-[10px] font-bold text-gray-400 tracking-widest">Main Class</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#BAE6FD] shadow-[0_0_10px_rgba(186,230,253,0.3)]"></div>
					<span className="text-[10px] font-bold text-gray-400 tracking-widest">Free Talk</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-3 h-3 rounded-full bg-[#BBF7D0] shadow-[0_0_10px_rgba(187,247,208,0.3)]"></div>
					<span className="text-[10px] font-bold text-gray-400 tracking-widest">Skill Activities</span>
				</div>
			</div>

			<ScheduleGrid
				initialCourses={courses}
				onRefresh={fetchPlansOnly}
				startDate={startDate}
				endDate={endDate}
			/>
		</div>
	);
}
