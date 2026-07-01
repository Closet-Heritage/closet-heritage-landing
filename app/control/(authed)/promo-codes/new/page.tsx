import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NewCodeForm } from './form';

export default function NewPromoCodePage() {
    return (
        <div className="max-w-[720px] space-y-5">
            <div>
                <Link href="/control/promo-codes" className="inline-flex items-center gap-1 text-[13px] font-medium mb-3" style={{ color: 'var(--ch-fg-2)' }}>
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to codes
                </Link>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>New promo code</h1>
                <p className="text-sm ch-soft mt-1">
                    Pick a type, set the rewards, and the code is live immediately.
                </p>
            </div>
            <div className="ch-card p-6">
                <NewCodeForm />
            </div>
        </div>
    );
}
