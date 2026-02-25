import { Loader2 } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
			<div className="relative">
				{/* Inner Ring */}
				<Loader2 className="w-10 h-10 text-orange-600/20 animate-spin" />
				{/* Outer Glow Ring */}
				<Loader2 className="w-10 h-10 text-orange-600 animate-[spin_1.5s_linear_infinite] absolute inset-0 drop-shadow-[0_0_8px_rgba(232,90,33,0.5)]" />
			</div>
			<p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] animate-pulse">
				Initializing System
			</p>
		</div>
	);
}

export function LoadingOverlay() {
	return (
		<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
			<Loading />
		</div>
	);
}

export function InlineLoading() {
	return (
		<Loader2 className="w-4 h-4 text-white animate-spin" />
	);
}
