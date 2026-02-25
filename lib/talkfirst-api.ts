/**
 * TalkFirst API Service
 * 
 * This service handles communication with the external TalkFirst API.
 */

const MAIN_API_URL = process.env.MAIN_API_URL || 'https://api.talkfirst.vn';

export interface RegistrationResult {
	success: boolean;
	message: string;
	apiResponse?: any;
}

export class TalkFirstService {
	/**
	 * Login to TalkFirst to get a valid token/session
	 */
	static async login(username: string, password?: string): Promise<string | null> {
		console.log(`[TalkFirstService] Logging in for user: ${username} with password: ${password ? '********' : 'NOT_PROVIDED'}`);
		return `tf_token_${Date.now()}`;
	}

	/**
	 * Register a specific course
	 * API will send the ID of the class to register
	 */
	static async registerCourse(classId: string, token: string): Promise<RegistrationResult> {
		console.log(`[TalkFirstService] Attempting to register class: ${classId} using API: ${MAIN_API_URL} with token: ${token.substring(0, 10)}...`);

		try {
			// Mocking the API response
			// In reality: 
			// const res = await fetch(`${MAIN_API_URL}/register`, { 
			//    method: 'POST', 
			//    headers: { Authorization: `Bearer ${token}` },
			//    body: JSON.stringify({ id: classId })
			// });

			// Simulate network delay
			await new Promise(resolve => setTimeout(resolve, 500));

			// MOCK LOGIC: Randomly fail some registrations to test fallback
			const isSuccess = Math.random() > 0.1; // 90% success rate

			if (isSuccess) {
				return {
					success: true,
					message: 'Registration successful',
					apiResponse: { code: '200', status: 'OK' }
				};
			} else {
				return {
					success: false,
					message: 'Session is full or unavailable',
					apiResponse: { code: '400', message: 'SESSION_FULL' }
				};
			}
		} catch (error) {
			console.error(`[TalkFirstService] Registration error for ${classId}:`, error);
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Unknown technical error'
			};
		}
	}
}
