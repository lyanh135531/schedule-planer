import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const userId = cookieStore.get('user_id')?.value;

	if (!userId) {
		redirect('/login');
	}

	// Fetch user data
	const user = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});

	return (
		<div className="h-screen flex flex-col bg-[#0f1117] text-white selection:bg-orange-500/30 overflow-hidden">
			{/* Global Academy Background */}
			<div
				className="fixed inset-0 pointer-events-none opacity-10 bg-[url('https://talkfirst.vn/wp-content/uploads/2022/05/talkfirst-hoc-vien-1.jpg')] bg-cover bg-center grayscale mix-blend-screen -z-10"
			></div>
			<div className="fixed inset-0 bg-gradient-to-b from-[#0f1117]/80 via-[#0f1117]/40 to-transparent pointer-events-none -z-10"></div>

			<Navbar userEmail={user?.email || 'User'} />

			<main className="flex-1 pt-24 pb-4 w-full overflow-hidden flex flex-col">
				{children}
			</main>

			<Footer />
		</div>
	);
}
