import { runSeeds } from '../lib/db/seed';

console.log('🚀 Starting database setup...\n');

runSeeds()
	.then(() => {
		console.log('\n✅ Database setup completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Database setup failed:', error);
		process.exit(1);
	});
