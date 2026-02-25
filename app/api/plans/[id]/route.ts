import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userCoursePlans } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

/**
 * DELETE /api/plans/[id]
 * Remove a specific plan by ID
 */
export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		// Verify ownership
		const plan = await db
			.select()
			.from(userCoursePlans)
			.where(eq(userCoursePlans.id, id))
			.limit(1);

		if (plan.length === 0) {
			return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
		}

		if (plan[0].userId !== userId) {
			return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
		}

		// Delete the plan
		await db.delete(userCoursePlans).where(eq(userCoursePlans.id, id));

		// Also delete any backup plans linked to this primary
		if (plan[0].planType === 'primary') {
			await db
				.delete(userCoursePlans)
				.where(eq(userCoursePlans.linkedPrimaryId, id));
		}

		return NextResponse.json({ message: 'Plan deleted successfully' });
	} catch (error) {
		console.error('Delete plan error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

/**
 * PUT /api/plans/[id]
 * Update plan priority order (for backup plans)
 */
export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await req.json();
		const { priorityOrder } = body;

		if (typeof priorityOrder !== 'number' || priorityOrder < 1) {
			return NextResponse.json({ message: 'Invalid priority order' }, { status: 400 });
		}

		// Verify ownership and that it's a backup plan
		const plan = await db
			.select()
			.from(userCoursePlans)
			.where(eq(userCoursePlans.id, id))
			.limit(1);

		if (plan.length === 0) {
			return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
		}

		if (plan[0].userId !== userId) {
			return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
		}

		if (plan[0].planType !== 'backup') {
			return NextResponse.json({ message: 'Can only update priority for backup plans' }, { status: 400 });
		}

		// Update priority
		await db
			.update(userCoursePlans)
			.set({ priorityOrder })
			.where(eq(userCoursePlans.id, id));

		return NextResponse.json({ message: 'Priority updated successfully' });
	} catch (error) {
		console.error('Update plan priority error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
