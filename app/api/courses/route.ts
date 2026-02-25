import { NextResponse } from 'next/server';

// Mock data matching TalkFirst API response format
const MOCK_COURSES_RESPONSE = {
	code: "200",
	message: "",
	data: [
		{
			timeDuration: {
				key: "90M",
				value: "e7c84594-bd6b-47b8-b66d-98b1432fa251",
				label: "90 m",
				configuration: null,
				getGroup: "TIME-DURATION"
			},
			classType: {
				key: "MAIN-CLASS",
				value: "e2816127-a66d-424e-bce2-e3f13644fe62",
				label: "Main Class",
				configuration: {
					slot: 25,
					manager: {
						cancel: { type: "m", number: 0 },
						register: { type: "m", number: 0 }
					},
					student: {
						cancel: { type: "m", number: 720 },
						register: { type: "m", number: 720 }
					}
				},
				getGroup: "CLASS-TYPE"
			},
			subClass: {
				key: "COMMUNICATIVE",
				value: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
				label: "Communicative",
				configuration: {
					color: "#4A90E2",
					backgroundColor: "#fff"
				},
				getGroup: "SUB-CLASS-TYPE"
			},
			level: [
				{
					key: "TALKON1",
					value: "3dba57e9-50a9-45aa-9537-22f27966f80a",
					label: "Talk on 1",
					configuration: {
						deferment: { create: true },
						attendance: [
							{ id: "e2816127-a66d-424e-bce2-e3f13644fe62", key: "MAIN-CLASS", registered: 36 },
							{ id: "c6542656-0ffb-4383-a361-fb096ad19f0d", key: "FREE-TALK", registered: 12 }
						]
					},
					getGroup: "LEVEL"
				}
			],
			studentDocumentLink: null,
			id: "course-001",
			fromDate: "2026-02-16T00:00:00",
			toDate: "2026-02-22T00:00:00",
			slot: 25,
			slotUsed: 8,
			syllabusId: {
				key: "syllabus-001",
				value: "syllabus-001",
				label: "Daily Conversations",
				configuration: null,
				getGroup: ""
			},
			lessonStatus: {
				key: "available-001",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			classTimeId: {
				key: "08:50-10:20",
				value: "b477bdd1-68bb-42b3-9a8c-7520aecf9af2",
				label: "08:50 - 10:20",
				configuration: {
					end: { hour: 10, minute: 20, second: 0 },
					key: "MORNING",
					start: { hour: 8, minute: 50, second: 0 },
					value: "9c9c10c4-e01f-4ee5-8484-45f35e868ec1"
				},
				getGroup: "KHUNG-GIO"
			},
			room: {
				key: "Ground",
				value: "fb1c9eea-23ca-4619-a025-1b2519edc094",
				label: "Ground",
				configuration: {
					color: "#DE6A9C",
					backgroundColor: "#fff"
				},
				getGroup: "ROOM"
			},
			teacherId: {
				email: "",
				phone: "",
				image: "",
				key: "teacher-001",
				value: "teacher-001",
				label: "John Smith"
			},
			timeScheduleStart: "2026-02-17T08:50:00",
			timeScheduleEnd: "2026-02-17T10:20:00",
			lessonStatusProcess: "AVAILABLE",
			lessonProcess: {
				key: "available-001",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			timeSchedule: "2026-02-17T00:00:00"
		},
		{
			timeDuration: {
				key: "90M",
				value: "e7c84594-bd6b-47b8-b66d-98b1432fa251",
				label: "90 m",
				configuration: null,
				getGroup: "TIME-DURATION"
			},
			classType: {
				key: "FREE-TALK",
				value: "c6542656-0ffb-4383-a361-fb096ad19f0d",
				label: "Free Talk",
				configuration: {
					slot: 25,
					manager: {
						cancel: { type: "m", number: 0 },
						register: { type: "m", number: 0 }
					},
					student: {
						cancel: { type: "m", number: 720 },
						register: { type: "m", number: 720 }
					}
				},
				getGroup: "CLASS-TYPE"
			},
			subClass: {
				key: "FREE-TALK",
				value: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
				label: "Free Talk",
				configuration: {
					color: "#F5A623",
					backgroundColor: "#fff"
				},
				getGroup: "SUB-CLASS-TYPE"
			},
			level: [
				{
					key: "TALKON2",
					value: "6d90aaf8-10b0-4301-9702-9f487573d8b2",
					label: "Talk on 2",
					configuration: {
						deferment: { create: true },
						attendance: [
							{ id: "e2816127-a66d-424e-bce2-e3f13644fe62", key: "MAIN-CLASS", registered: 24 },
							{ id: "c6542656-0ffb-4383-a361-fb096ad19f0d", key: "FREE-TALK", registered: 12 }
						]
					},
					getGroup: "LEVEL"
				}
			],
			studentDocumentLink: null,
			id: "course-002",
			fromDate: "2026-02-16T00:00:00",
			toDate: "2026-02-22T00:00:00",
			slot: 25,
			slotUsed: 12,
			syllabusId: {
				key: "syllabus-002",
				value: "syllabus-002",
				label: "Casual Conversations",
				configuration: null,
				getGroup: ""
			},
			lessonStatus: {
				key: "available-002",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			classTimeId: {
				key: "13:30-15:00",
				value: "c588cee2-79cc-53c4-ba9d-8631bf8d0ca3",
				label: "13:30 - 15:00",
				configuration: {
					end: { hour: 15, minute: 0, second: 0 },
					key: "AFTERNOON",
					start: { hour: 13, minute: 30, second: 0 },
					value: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1"
				},
				getGroup: "KHUNG-GIO"
			},
			room: {
				key: "First",
				value: "ab2c9ffa-34db-5729-b136-2c2630fed195",
				label: "First Floor",
				configuration: {
					color: "#7B68EE",
					backgroundColor: "#fff"
				},
				getGroup: "ROOM"
			},
			teacherId: {
				email: "",
				phone: "",
				image: "",
				key: "teacher-002",
				value: "teacher-002",
				label: "Sarah Johnson"
			},
			timeScheduleStart: "2026-02-18T13:30:00",
			timeScheduleEnd: "2026-02-18T15:00:00",
			lessonStatusProcess: "AVAILABLE",
			lessonProcess: {
				key: "available-002",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			timeSchedule: "2026-02-18T00:00:00"
		},
		{
			timeDuration: {
				key: "90M",
				value: "e7c84594-bd6b-47b8-b66d-98b1432fa251",
				label: "90 m",
				configuration: null,
				getGroup: "TIME-DURATION"
			},
			classType: {
				key: "SKILLACTIVITIES",
				value: "b88cab75-cc37-4c12-8e0a-6ee90b87c990",
				label: "Skills & Activities",
				configuration: {
					slot: 25,
					manager: {
						cancel: { type: "m", number: 0 },
						register: { type: "m", number: 0 }
					},
					student: {
						cancel: { type: "m", number: 720 },
						register: { type: "m", number: 720 }
					}
				},
				getGroup: "CLASS-TYPE"
			},
			subClass: {
				key: "DRAMACLUB",
				value: "20eac131-58eb-4adc-9905-65e3e58290ce",
				label: "Drama Club",
				configuration: {
					color: "#613659",
					backgroundColor: "#fff"
				},
				getGroup: "SUB-CLASS-TYPE"
			},
			level: [
				{
					key: "WORKOUT1",
					value: "3f4c3661-162a-4e2f-8d66-911385b59f8e",
					label: "Work out 1",
					configuration: {
						deferment: { create: true },
						attendance: [
							{ id: "e2816127-a66d-424e-bce2-e3f13644fe62", key: "MAIN-CLASS", registered: 24 },
							{ id: "c6542656-0ffb-4383-a361-fb096ad19f0d", key: "FREE-TALK", registered: 12 },
							{ id: "b88cab75-cc37-4c12-8e0a-6ee90b87c990", key: "SKILLACTIVITIES", registered: 12 }
						]
					},
					getGroup: "LEVEL"
				}
			],
			studentDocumentLink: null,
			id: "course-003",
			fromDate: "2026-02-16T00:00:00",
			toDate: "2026-02-22T00:00:00",
			slot: 25,
			slotUsed: 6,
			syllabusId: {
				key: "syllabus-003",
				value: "syllabus-003",
				label: "The \"Sống Ảo\" Cafe",
				configuration: null,
				getGroup: ""
			},
			lessonStatus: {
				key: "available-003",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			classTimeId: {
				key: "18:15-19:45",
				value: "2309ae2c-0a27-4405-ab69-13fe5ed4b3bf",
				label: "18:15 - 19:45",
				configuration: {
					end: { hour: 19, minute: 45, second: 0 },
					key: "EVENING",
					start: { hour: 18, minute: 15, second: 0 },
					value: "b941967d-7060-49e2-88d2-95db033c7fa6"
				},
				getGroup: "KHUNG-GIO"
			},
			room: {
				key: "Ground",
				value: "fb1c9eea-23ca-4619-a025-1b2519edc094",
				label: "Ground",
				configuration: {
					color: "#DE6A9C",
					backgroundColor: "#fff"
				},
				getGroup: "ROOM"
			},
			teacherId: {
				email: "",
				phone: "",
				image: "",
				key: "teacher-003",
				value: "teacher-003",
				label: "Misty"
			},
			timeScheduleStart: "2026-02-19T18:15:00",
			timeScheduleEnd: "2026-02-19T19:45:00",
			lessonStatusProcess: "AVAILABLE",
			lessonProcess: {
				key: "available-003",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			timeSchedule: "2026-02-19T00:00:00"
		},
		{
			timeDuration: {
				key: "90M",
				value: "e7c84594-bd6b-47b8-b66d-98b1432fa251",
				label: "90 m",
				configuration: null,
				getGroup: "TIME-DURATION"
			},
			classType: {
				key: "SKILLACTIVITIES",
				value: "b88cab75-cc37-4c12-8e0a-6ee90b87c990",
				label: "Skills & Activities",
				configuration: {
					slot: 25,
					manager: {
						cancel: { type: "m", number: 0 },
						register: { type: "m", number: 0 }
					},
					student: {
						cancel: { type: "m", number: 720 },
						register: { type: "m", number: 720 }
					}
				},
				getGroup: "CLASS-TYPE"
			},
			subClass: {
				key: "PRONUNCIATIONCLUB",
				value: "72a3350b-384e-4f35-98cc-0043e61fc2fd",
				label: "Pronunciation Club",
				configuration: {
					color: "#956F00",
					backgroundColor: "#fff"
				},
				getGroup: "SUB-CLASS-TYPE"
			},
			level: [
				{
					key: "VOICE-UP2",
					value: "0b26d6d2-834b-47ea-b015-0f6ce7e6a457",
					label: "Voice -Up 2",
					configuration: {
						deferment: { create: true },
						attendance: [
							{ id: "e2816127-a66d-424e-bce2-e3f13644fe62", key: "MAIN-CLASS", registered: 36 },
							{ id: "c6542656-0ffb-4383-a361-fb096ad19f0d", key: "FREE-TALK", registered: 12 }
						]
					},
					getGroup: "LEVEL"
				}
			],
			studentDocumentLink: "",
			id: "course-004",
			fromDate: "2026-02-16T00:00:00",
			toDate: "2026-02-22T00:00:00",
			slot: 25,
			slotUsed: 10,
			syllabusId: {
				key: "syllabus-004",
				value: "syllabus-004",
				label: "Birthday Banter - θ & ð",
				configuration: null,
				getGroup: ""
			},
			lessonStatus: {
				key: "available-004",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			classTimeId: {
				key: "10:30-12:00",
				value: "9bd415fa-3354-4dd5-890f-1e0c27408852",
				label: "10:30 - 12:00",
				configuration: {
					end: { hour: 12, minute: 0, second: 0 },
					key: "MORNING",
					start: { hour: 10, minute: 30, second: 0 },
					value: "9c9c10c4-e01f-4ee5-8484-45f35e868ec1"
				},
				getGroup: "KHUNG-GIO"
			},
			room: {
				key: "Ground",
				value: "fb1c9eea-23ca-4619-a025-1b2519edc094",
				label: "Ground",
				configuration: {
					color: "#DE6A9C",
					backgroundColor: "#fff"
				},
				getGroup: "ROOM"
			},
			teacherId: {
				email: "",
				phone: "",
				image: "",
				key: "teacher-004",
				value: "teacher-004",
				label: "Nick Nguyen"
			},
			timeScheduleStart: "2026-02-20T10:30:00",
			timeScheduleEnd: "2026-02-20T12:00:00",
			lessonStatusProcess: "AVAILABLE",
			lessonProcess: {
				key: "available-004",
				value: "AVAILABLE",
				label: "AVAILABLE",
				configuration: {
					color: "#4CAF50",
					locked: false,
					disabled: false,
					backgroundColor: "#4CAF50"
				},
				getGroup: "LESSON-CLASS-STATUS"
			},
			timeSchedule: "2026-02-20T00:00:00"
		},
		{
			id: "course-005",
			timeSchedule: "2026-02-21T00:00:00",
			timeScheduleStart: "2026-02-21T15:30:00",
			timeScheduleEnd: "2026-02-21T17:00:00",
			classTimeId: {
				label: "15:30 - 17:00",
				configuration: {
					start: { hour: 15, minute: 30 },
					end: { hour: 17, minute: 0 }
				}
			},
			classType: { key: "FREE-TALK", label: "Free Talk" },
			subClass: { label: "Grammar", configuration: { color: "#BAE6FD" } },
			teacherId: { label: "Emma Watson" },
			room: { label: "Room 101" },
			syllabusId: { label: "Basic Grammar" }
		},
		{
			id: "course-006",
			timeSchedule: "2026-02-18T00:00:00",
			timeScheduleStart: "2026-02-18T19:50:00",
			timeScheduleEnd: "2026-02-18T21:20:00",
			classTimeId: {
				label: "19:50 - 21:20",
				configuration: {
					start: { hour: 19, minute: 50 },
					end: { hour: 21, minute: 20 }
				}
			},
			classType: { key: "MAIN-CLASS", label: "Main Class" },
			subClass: { label: "Pronunciation", configuration: { color: "#FFEDD5" } },
			teacherId: { label: "David Gandy" },
			room: { label: "Room 202" },
			syllabusId: { label: "Vowel Sounds" }
		},
		// --- OVERLAPPING COURSES FOR TESTING (MONDAY EVENING) ---
		{
			id: "overlap-1",
			timeDuration: { key: "90M", value: "v1", label: "90 m", configuration: null, getGroup: "" },
			classType: {
				key: "MAIN-CLASS",
				value: "v2",
				label: "Main Class",
				configuration: { slot: 25, manager: { cancel: { type: "m", number: 0 }, register: { type: "m", number: 0 } }, student: { cancel: { type: "m", number: 720 }, register: { type: "m", number: 720 } } },
				getGroup: ""
			},
			subClass: { key: "GRAMMAR", value: "v3", label: "Grammar", configuration: { color: "#D8B4FE" }, getGroup: "" },
			syllabusId: { key: "s1", value: "s1", label: "Advanced Grammar", configuration: null, getGroup: "" },
			lessonStatus: { key: "as-1", value: "AVAILABLE", label: "AVAILABLE", configuration: { color: "#4CAF50" }, getGroup: "" },
			classTimeId: {
				key: "18:15-19:45",
				value: "t1",
				label: "18:15 - 19:45",
				configuration: { end: { hour: 19, minute: 45, second: 0 }, key: "EVENING", start: { hour: 18, minute: 15, second: 0 }, value: "v4" },
				getGroup: ""
			},
			room: { key: "R1", value: "v5", label: "Room 101", configuration: { color: "#DE6A9C" }, getGroup: "" },
			teacherId: { key: "T1", value: "v6", label: "Dr. Smith" },
			timeScheduleStart: "2026-02-09T18:15:00",
			timeScheduleEnd: "2026-02-09T19:45:00",
			timeSchedule: "2026-02-09T00:00:00"
		},
		{
			id: "overlap-2",
			timeDuration: { key: "90M", value: "v1", label: "90 m", configuration: null, getGroup: "" },
			classType: {
				key: "FREE-TALK",
				value: "v2b",
				label: "Free Talk",
				configuration: { slot: 25, manager: { cancel: { type: "m", number: 0 }, register: { type: "m", number: 0 } }, student: { cancel: { type: "m", number: 720 }, register: { type: "m", number: 720 } } },
				getGroup: ""
			},
			subClass: { key: "FREETALK", value: "v3b", label: "Free Talk", configuration: { color: "#FEF08A" }, getGroup: "" },
			syllabusId: { key: "s2", value: "s2", label: "Evening Discussion", configuration: null, getGroup: "" },
			lessonStatus: { key: "as-2", value: "AVAILABLE", label: "AVAILABLE", configuration: { color: "#4CAF50" }, getGroup: "" },
			classTimeId: {
				key: "18:15-19:45",
				value: "t1",
				label: "18:15 - 19:45",
				configuration: { end: { hour: 19, minute: 45, second: 0 }, key: "EVENING", start: { hour: 18, minute: 15, second: 0 }, value: "v4" },
				getGroup: ""
			},
			room: { key: "R2", value: "v5b", label: "Room 102", configuration: { color: "#DE6A9C" }, getGroup: "" },
			teacherId: { key: "T2", value: "v6b", label: "Jane Doe" },
			timeScheduleStart: "2026-02-09T18:15:00",
			timeScheduleEnd: "2026-02-09T19:45:00",
			timeSchedule: "2026-02-09T00:00:00"
		},
		{
			id: "overlap-3",
			timeDuration: { key: "90M", value: "v1", label: "90 m", configuration: null, getGroup: "" },
			classType: {
				key: "SKILLACTIVITIES",
				value: "v2c",
				label: "Skill Activities",
				configuration: { slot: 25, manager: { cancel: { type: "m", number: 0 }, register: { type: "m", number: 0 } }, student: { cancel: { type: "m", number: 720 }, register: { type: "m", number: 720 } } },
				getGroup: ""
			},
			subClass: { key: "PRONUNCIATION", value: "v3c", label: "Pronunciation", configuration: { color: "#BAE6FD" }, getGroup: "" },
			syllabusId: { key: "s3", value: "s3", label: "Phonetics Lab", configuration: null, getGroup: "" },
			lessonStatus: { key: "as-3", value: "Full", label: "FULL", configuration: { color: "#F44336" }, getGroup: "" },
			classTimeId: {
				key: "18:15-19:45",
				value: "t1",
				label: "18:15 - 19:45",
				configuration: { end: { hour: 19, minute: 45, second: 0 }, key: "EVENING", start: { hour: 18, minute: 15, second: 0 }, value: "v4" },
				getGroup: ""
			},
			room: { key: "R3", value: "v5c", label: "Room 103", configuration: { color: "#DE6A9C" }, getGroup: "" },
			teacherId: { key: "T3", value: "v6c", label: "Mike Ross" },
			timeScheduleStart: "2026-02-09T18:15:00",
			timeScheduleEnd: "2026-02-09T19:45:00",
			timeSchedule: "2026-02-09T00:00:00"
		}
	]
};

export async function GET() {
	try {
		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 300));

		return NextResponse.json(MOCK_COURSES_RESPONSE);
	} catch (error) {
		console.error('Error fetching courses:', error);
		return NextResponse.json(
			{ code: "500", message: "Internal server error", data: [] },
			{ status: 500 }
		);
	}
}
