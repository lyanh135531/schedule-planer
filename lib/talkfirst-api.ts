/**
 * TalkFirst API Service
 *
 * This service handles communication with the external TalkFirst API.
 */

export interface RegistrationResult {
    success: boolean;
    message: string;
    statusCode?: number;
    apiResponse?: Record<string, unknown>;
}

export class TalkFirstService {
    /**
     * Login to TalkFirst to get a valid token/session
     */
    static async login(
        email: string,
        password?: string,
    ): Promise<{ accessToken: string; refreshToken: string } | null> {
        console.log(
            `[TalkFirstService] Logging in for email: ${email} with password: ${password ? '********' : 'NOT_PROVIDED'}`,
        );

        try {
            const response = await fetch(
                'https://campus.talkfirst.vn/api/student/auth/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                    signal: AbortSignal.timeout(10000), // 10 second timeout
                },
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[TalkFirstService] Login failed:', errorData);
                return null;
            }

            const data = await response.json();
            if (data.accessToken && data.refreshToken) {
                return {
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                };
            }

            return null;
        } catch (error) {
            console.error('[TalkFirstService] Login network error:', error);
            return null;
        }
    }

    /**
     * Register a specific course
     * API will send the ID of the class to register
     */
    static async registerCourse(
        classId: string,
        token: string,
    ): Promise<RegistrationResult> {
        console.log(
            `[TalkFirstService] Attempting to register class: ${classId} with token: ${token.substring(0, 10)}...`,
        );

        try {
            const response = await fetch(
                'https://campus.talkfirst.vn/api/student/my-schedule',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ flexibleClassScheduleId: classId }),
                    signal: AbortSignal.timeout(15000), // 15 second timeout for registration
                },
            );

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                return {
                    success: true,
                    message: data.message || 'Registration successful',
                    statusCode: response.status,
                    apiResponse: data,
                };
            } else {
                return {
                    success: false,
                    message: data.message || data.error || 'Registration failed',
                    statusCode: response.status,
                    apiResponse: data,
                };
            }
        } catch (error) {
            console.error(`[TalkFirstService] Registration error for ${classId}:`, error);
            return {
                success: false,
                message:
                    error instanceof Error ? error.message : 'Unknown technical error',
            };
        }
    }

    /**
     * Get list of classes for a specific week
     * @param token Access token
     * @param date Monday of the week in YYYY-MM-DD format. If omitted, uses next week's Monday.
     */
    static async getClasses(
        token: string,
        date?: string,
    ): Promise<import('./types').TalkFirstClassResponse | null> {
        let targetDate = date;

        if (!targetDate) {
            const now = new Date();
            const day = now.getDay();
            const diff = now.getDate() - (day === 0 ? 6 : day - 1) + 7;
            const nextMonday = new Date(now.setDate(diff));
            targetDate = nextMonday.toISOString().split('T')[0];
        }

        console.log(`[TalkFirstService] Fetching classes for date: ${targetDate}`);

        try {
            const url = new URL(
                'https://campus.talkfirst.vn/api/student/my-schedule/classes',
            );
            url.searchParams.append('weekType', 'current');
            url.searchParams.append('date', targetDate);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                signal: AbortSignal.timeout(10000), // 10 second timeout
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[TalkFirstService] Fetch classes failed:', errorData);
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('[TalkFirstService] Fetch classes error:', error);
            return null;
        }
    }
}
