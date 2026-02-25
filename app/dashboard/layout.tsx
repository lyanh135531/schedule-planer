import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const userId = cookieStore.get('user_id');

	if (!userId) {
		redirect('/login');
	}

	return (
		<div className="min-h-screen flex flex-col bg-[#1a1a1a] text-white selection:bg-orange-500/30">
			{/* Global Academy Background */}
			<div
				className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://talkfirst.vn/wp-content/uploads/2022/05/talkfirst-hoc-vien-1.jpg')] bg-cover bg-center grayscale mix-blend-screen -z-10"
			></div>
			<div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none -z-10"></div>

			<Navbar />

			<main className="flex-1 pt-24 pb-12 w-full">
				{children}
			</main>

			<Footer />
		</div>
	);
}
