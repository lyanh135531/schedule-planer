'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { InlineLoading } from '@/components/Loading';
import Footer from '@/components/Footer';

export default function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [mounted, setMounted] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			if (!res.ok) {
				const contentType = res.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const data = await res.json();
					throw new Error(data.message || 'Login failed');
				} else {
					const text = await res.text();
					console.error('Non-JSON error response:', text);
					throw new Error(`Server error (${res.status}).`);
				}
			}

			router.push('/dashboard');
		} catch (err: any) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (!mounted) return null;

	return (
		<div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]">
			{/* Dynamic Mesh Gradient Background */}
			<div className="absolute inset-0 z-0">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/20 blur-[120px] animate-pulse" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[150px] animate-pulse [animation-delay:2s]" />
				<div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-orange-900/10 blur-[100px]" />
				<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100 mt-[-10%] ml-[-10%] w-[120%] h-[120%] pointer-events-none" />
			</div>

			{/* Main Content */}
			<div className="relative z-10 w-full max-w-[440px] px-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
				{/* Logo Section */}
				<div className="flex flex-col items-center mb-10 space-y-4">
					<div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(232,90,33,0.4)] relative group transition-transform duration-500 hover:scale-110">
						<div className="absolute inset-0 rounded-2xl bg-orange-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
						<span className="text-white font-black italic text-4xl leading-none select-none transform translate-x-[-4px]">T</span>
					</div>
					<div className="text-center space-y-1">
						<h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
							TalkFirst <span className="text-orange-600">Support</span>
						</h1>
						<p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] translate-y-[-2px]">
							Premium Automation Hub
						</p>
					</div>
				</div>

				{/* Glassmorphic Login Card */}
				<div className="glass-panel rounded-[2rem] p-1 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
					{/* Inner Card Glow */}
					<div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 rotate-12 pointer-events-none transition-transform duration-1000 group-hover:scale-110" />

					<div className="relative bg-[#121212]/40 backdrop-blur-3xl rounded-[1.8rem] p-8 md:p-10 border border-white/5 space-y-8">
						<div className="space-y-2">
							<h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
								Welcome back <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
							</h2>
							<p className="text-sm text-gray-400 font-medium">
								Enter your credentials to access the dashboard
							</p>
						</div>

						<form onSubmit={handleLogin} className="space-y-6">
							<div className="space-y-4">
								{/* Username Field */}
								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
										Access ID
									</label>
									<div className="relative group">
										<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors">
											<User className="w-4 h-4" />
										</div>
										<input
											type="text"
											placeholder="username"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											required
											className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
										/>
									</div>
								</div>

								{/* Password Field */}
								<div className="space-y-2">
									<label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
										Security Key
									</label>
									<div className="relative group">
										<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-500 transition-colors">
											<Lock className="w-4 h-4" />
										</div>
										<input
											type="password"
											placeholder="password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
										/>
									</div>
								</div>
							</div>

							{error && (
								<div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center animate-shake">
									{error}
								</div>
							)}

							<Button
								type="submit"
								disabled={loading}
								className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-[0_10px_20px_rgba(232,90,33,0.3)] transition-all duration-300 transform active:scale-[0.98] group relative overflow-hidden"
							>
								{/* Shimmer Effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

								<div className="flex items-center justify-center gap-3">
									{loading ? (
										<>
											<InlineLoading />
											<span>Authenticating</span>
										</>
									) : (
										<>
											<span>Authenticate</span>
											<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
										</>
									)}
								</div>
							</Button>
						</form>

						{/* Security Footer */}
						<div className="flex items-center justify-center gap-2 pt-2">
							<ShieldCheck className="w-4 h-4 text-gray-600" />
							<span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
								Secure Encrypted Session
							</span>
						</div>
					</div>

					{/* Decorative Glow Dots */}
					<div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-orange-600/50 animate-pulse" />
					<div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-blue-600/50 animate-pulse [animation-delay:1s]" />
				</div>

				{/* Footer Meta */}
				<div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
					<Footer />
				</div>
			</div>
		</div>
	);
}
