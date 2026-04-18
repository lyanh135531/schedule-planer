/**
 * TalkFirst API Service
 *
 * This service handles communication with the external TalkFirst API.
 */

// Cloudflare Turnstile sitekey for campus.talkfirst.vn
const TALKFIRST_TURNSTILE_SITEKEY = '0x4AAAAAACs0R0RvKtXLE0Qn';
const TALKFIRST_PAGE_URL = 'https://campus.talkfirst.vn';

export interface RegistrationResult {
    success: boolean;
    message: string;
    statusCode?: number;
    apiResponse?: Record<string, unknown>;
}

/**
 * Giải Cloudflare Turnstile token tự động dùng CapSolver API.
 *
 * Đăng ký tại https://capsolver.com để lấy API key (có free credits).
 * Set env var: CAPSOLVER_API_KEY=...
 *
 * Chi phí: ~$0.001 / token (rất rẻ, ~1000 lần login = $1)
 */
async function solveTurnstile(): Promise<string | null> {
    const apiKey = process.env.CAPSOLVER_API_KEY;
    if (!apiKey) {
        console.error(
            '[Turnstile] CAPSOLVER_API_KEY is not set. Cannot solve Turnstile.',
        );
        return null;
    }

    console.log('[Turnstile] Creating task with CapSolver...');

    try {
        // Bước 1: Tạo task
        const createRes = await fetch('https://api.capsolver.com/createTask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientKey: apiKey,
                task: {
                    type: 'AntiTurnstileTaskProxyLess',
                    websiteURL: TALKFIRST_PAGE_URL,
                    websiteKey: TALKFIRST_TURNSTILE_SITEKEY,
                },
            }),
            signal: AbortSignal.timeout(15000),
        });

        const createData = await createRes.json();
        if (createData.errorId !== 0 || !createData.taskId) {
            console.error('[Turnstile] CapSolver createTask error:', createData);
            return null;
        }

        const taskId = createData.taskId as string;
        console.log(`[Turnstile] Task created: ${taskId}. Waiting for result...`);

        // Bước 2: Poll kết quả (tối đa 60 giây)
        for (let i = 0; i < 30; i++) {
            await new Promise((r) => setTimeout(r, 2000)); // Chờ 2 giây mỗi lần

            const resultRes = await fetch('https://api.capsolver.com/getTaskResult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientKey: apiKey, taskId }),
                signal: AbortSignal.timeout(10000),
            });

            const resultData = await resultRes.json();

            if (resultData.status === 'ready') {
                const token = resultData.solution?.token as string | undefined;
                if (token) {
                    console.log('[Turnstile] Token obtained successfully.');
                    return token;
                }
            }

            if (resultData.errorId !== 0) {
                console.error('[Turnstile] CapSolver getTaskResult error:', resultData);
                return null;
            }

            console.log(
                `[Turnstile] Still processing... (attempt ${i + 1}/30, status: ${resultData.status})`,
            );
        }

        console.error('[Turnstile] Timed out waiting for CapSolver result.');
        return null;
    } catch (error) {
        console.error('[Turnstile] Error calling CapSolver API:', error);
        return null;
    }
}

export class TalkFirstService {
    /**
     * Login to TalkFirst to get a valid token/session.
     * Automatically solves Cloudflare Turnstile via CapSolver before logging in.
     */
    static async login(
        email: string,
        password?: string,
    ): Promise<{ accessToken: string; refreshToken: string } | null> {
        console.log(
            `[TalkFirstService] Logging in for email: ${email} with password: ${password ? '********' : 'NOT_PROVIDED'}`,
        );

        // Lấy Turnstile token trước khi login
        const turnstileToken = await solveTurnstile();
        if (!turnstileToken) {
            console.error(
                '[TalkFirstService] Failed to obtain Turnstile token. Login aborted.',
            );
            return null;
        }

        try {
            const response = await fetch(
                'https://campus.talkfirst.vn/api/student/auth/login/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ email, password, turnstileToken }),
                    signal: AbortSignal.timeout(15000),
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
