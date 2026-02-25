import { pgTable, uuid, text, integer, timestamp, time, date, jsonb, unique } from 'drizzle-orm/pg-core';

// ==================== USERS ====================
export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	username: text('username').notNull().unique(),
	password: text('password'),
	refreshToken: text('refresh_token'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ==================== COURSE TYPES ====================
export const courseTypes = pgTable('course_types', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(), // 'main', 'free_talk', 'skills'
	displayName: text('display_name').notNull(),
	defaultRequiredCount: integer('default_required_count').notNull(),
	registrationOrder: integer('registration_order').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type CourseType = typeof courseTypes.$inferSelect;
export type NewCourseType = typeof courseTypes.$inferInsert;

// ==================== USER COURSE SETTINGS ====================
export const userCourseSettings = pgTable('user_course_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	courseTypeId: uuid('course_type_id').notNull().references(() => courseTypes.id),
	requiredCount: integer('required_count').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
	uniqueUserCourseType: unique().on(table.userId, table.courseTypeId),
}));

export type UserCourseSetting = typeof userCourseSettings.$inferSelect;
export type NewUserCourseSetting = typeof userCourseSettings.$inferInsert;

// ==================== USER COURSE PLANS ====================
export const userCoursePlans = pgTable('user_course_plans', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	externalCourseId: text('external_course_id').notNull(), // from TalkFirst API
	courseCode: text('course_code'),
	courseName: text('course_name').notNull(),
	syllabus: text('syllabus'),
	lecturer: text('lecturer'),
	room: text('room'),
	courseTypeId: uuid('course_type_id').references(() => courseTypes.id),
	day: text('day').notNull(),
	timeSlotLabel: text('time_slot_label'),
	startTime: text('start_time'),
	endTime: text('end_time'),
	planType: text('plan_type').notNull(), // 'primary' | 'backup'
	priorityOrder: integer('priority_order'), // NULL for primary, 1,2,3... for backup
	linkedPrimaryId: uuid('linked_primary_id').references((): any => userCoursePlans.id, { onDelete: 'cascade' }), // backup links to primary
	status: text('status').notNull().default('planned'), // 'planned', 'registered', 'failed', 'skipped'
	registeredAt: timestamp('registered_at', { withTimezone: true }),
	failedReason: text('failed_reason'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type UserCoursePlan = typeof userCoursePlans.$inferSelect;
export type NewUserCoursePlan = typeof userCoursePlans.$inferInsert;

// ==================== SUBMISSION HISTORY ====================
export const submissionHistory = pgTable('submission_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull().references(() => users.id),
	planId: uuid('plan_id').references(() => userCoursePlans.id, { onDelete: 'cascade' }),
	submissionDate: date('submission_date').notNull(),
	attemptOrder: integer('attempt_order'),
	result: text('result').notNull(), // 'success', 'failed', 'skipped'
	reason: text('reason'),
	apiResponse: jsonb('api_response'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type SubmissionHistory = typeof submissionHistory.$inferSelect;
export type NewSubmissionHistory = typeof submissionHistory.$inferInsert;
