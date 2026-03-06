import CartTable from '@/components/CartTable';

export default function CartPage() {
	return (
		<div className="w-full flex-1 flex flex-col overflow-hidden px-4 md:px-8 pt-4">
			{/* Main Content */}
			<CartTable />
		</div>
	);
}
