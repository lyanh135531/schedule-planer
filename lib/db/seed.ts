import { db } from './index';
import { courseTypes } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Seed course types (MAIN-CLASS, FREE-TALK, SKILLACTIVITIES)
 */
export async function seedCourseTypes() {
	console.log('🌱 Seeding course types...');

	const types = [
		{ name: 'MAIN-CLASS', displayName: 'Main Class', defaultRequiredCount: 3, registrationOrder: 1 },
		{ name: 'FREE-TALK', displayName: 'Free Talk', defaultRequiredCount: 1, registrationOrder: 2 },
		{ name: 'SKILLACTIVITIES', displayName: 'Skills & Activities', defaultRequiredCount: 0, registrationOrder: 3 },
	];

	for (const type of types) {
		const existing = await db.select().from(courseTypes).where(eq(courseTypes.name, type.name)).limit(1);
		if (existing.length === 0) {
			await db.insert(courseTypes).values(type);
			console.log(`  ✓ Created course type: ${type.displayName}`);
		} else {
			console.log(`  - Course type already exists: ${type.displayName}`);
		}
	}
}

/**
 * Run all seeds
 */
export async function runSeeds() {
	try {
		await seedCourseTypes();
		console.log('✅ Seeding completed successfully!');
	} catch (error) {
		console.error('❌ Seeding failed:', error);
		throw error;
	}
}

// Run if called directly
if (require.main === module) {
	runSeeds()
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}
