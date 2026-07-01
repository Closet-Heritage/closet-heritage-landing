'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyChip({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // clipboard denied — no-op
        }
    };
    return (
        <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 font-mono text-[13px] font-bold rounded-md px-2 py-1 transition-colors"
            style={{
                background: 'var(--ch-accent-tint)',
                color: 'var(--ch-accent-dark)',
            }}
            title="Copy to clipboard"
        >
            {value}
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
        </button>
    );
}
