/**
 * Trigger Actual Registration Simulation
 */
async function trigger() {
	console.log('🚀 Triggering automated registration for current plans...');

	try {
		const res = await fetch('http://localhost:3000/api/cron/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer your_cron_secret'
			}
		});

		const data = await res.json();
		console.log('✅ Cycle completed!');
		console.log('Summary:', JSON.stringify(data, null, 2));
	} catch (err) {
		console.error('❌ Trigger failed:', err);
	}
}

trigger();
