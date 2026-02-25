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
