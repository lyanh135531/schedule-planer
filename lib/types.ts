export type User = {
  id: string;
  username: string;
  refresh_token: string;
  created_at: string;
};

export type CourseSlot = {
  id: string; // This will map to external_course_id
  course_code: string;
  course_name: string;
  course_type_name: string; // 'MAIN-CLASS', 'FREE-TALK', 'SKILLACTIVITIES'
  sub_class_name?: string; // e.g., 'Vocabulary', 'Pronunciation'
  lecturer: string;
  room: string;
  day: string;
  time_slot: string; // label like "08:50 - 10:20"
  start_time: string;
  end_time: string;
  color: string;
  status?: string;
  syllabus?: string;
  plan_type?: 'primary' | 'backup';
  priority_order?: number;
  lesson_description?: string;
};

export type PreRegistration = {
  id: string;
  user_id: string;
  course_code: string;
  course_name: string;
  slot_day: string;
  slot_time: string;
  status: 'pending' | 'success' | 'failed';
  submitted_at: string | null;
  created_at: string;
};

// TalkFirst API response types
export interface TalkFirstSummary {
  programClassId: string;
  programClassName: string;
  maxClassesPerWeek: number;
  enrolledClassesThisWeek: number;
}

export interface TalkFirstLessonInfo {
  lesson: string;
  description: string;
  studentDocKey: string;
}

export interface TalkFirstSubClassType {
  name: string;
  color: string;
  bgcolor: string;
}

export interface TalkFirstFlexibleClass {
  id: string;
  timeSlot: string;
  programClassId: string;
  date: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  room: string;
  lesson: string;
  currentStudents: number;
  maxStudents: number;
  hasEnrolled: boolean;
  timeType: string;
  mode: string;
  lessonInfo: TalkFirstLessonInfo;
  subClassType: TalkFirstSubClassType;
}

export interface TalkFirstClassResponse {
  startDate: string;
  endDate: string;
  summary: TalkFirstSummary[];
  totalClasses: number;
  flexibleClasses: TalkFirstFlexibleClass[];
  fixedClasses: any[];
  canBooking: boolean;
}
