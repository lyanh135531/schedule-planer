
async function triggerCron() {
	const secret = process.env.CRON_SECRET || 'your_secret_key';
	const url = 'http://localhost:3000/api/cron/register';

	console.log(`[Cron Trigger] Sending request to ${url}...`);

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${secret}`,
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		if (response.ok) {
			console.log('[Cron Trigger] Success:', JSON.stringify(data, null, 2));
		} else {
			console.error('[Cron Trigger] Failed:', response.status, data);
		}
	} catch (error) {
		console.error('[Cron Trigger] Error:', error);
	}
}

triggerCron();
