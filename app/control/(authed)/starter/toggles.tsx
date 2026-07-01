'use client';

import { useTransition } from 'react';
import { Power, PowerOff, Eye, EyeOff } from 'lucide-react';
import { setSkuActiveAction, setPersonaActiveAction } from '@/app/control/actions/starter';

const PERSONA_EXPLAINER_ON = (label: string) =>
    `Show all 9 "${label}" pieces to new users during onboarding. Users who already picked this persona are unaffected — their wardrobes stay put.`;
const PERSONA_EXPLAINER_OFF = (label: string) =>
    `Dark the entire "${label}" persona. New users won't be offered it during onboarding. Users who already picked it keep their items.`;

export function PersonaToggle({
    personaId,
    personaLabel,
    allActive,
    allOff,
    activeCount,
    totalCount,
    seededCount,
}: {
    personaId: string;
    personaLabel: string;
    allActive: boolean;
    allOff: boolean;
    activeCount: number;
    totalCount: number;
    seededCount: number;
}) {
    const [pending, startTransition] = useTransition();

    const flip = (target: boolean) => {
        const verb = target ? 'Activate' : 'Deactivate';
        const preface = target
            ? `Show every "${personaLabel}" piece to new users during onboarding?`
            : `Hide the entire "${personaLabel}" persona from new users?\n\nWhat happens:\n• New users won't be offered this persona.\n• ${seededCount.toLocaleString()} existing pickers keep their items — nothing is removed.\n• Reversible any time.`;
        if (!confirm(preface)) return;
        startTransition(async () => {
            const res = await setPersonaActiveAction(personaId, target);
            if (!res.ok) alert(`Failed to ${verb.toLowerCase()}: ${res.error}`);
        });
    };

    return (
        <div className="flex gap-1.5 shrink-0">
            <button
                type="button"
                onClick={() => flip(true)}
                disabled={pending || allActive}
                className="ch-btn ch-btn--secondary"
                title={PERSONA_EXPLAINER_ON(personaLabel)}
            >
                <Eye className="w-3 h-3" /> Show all
            </button>
            <button
                type="button"
                onClick={() => flip(false)}
                disabled={pending || allOff}
                className="ch-btn ch-btn--ghost"
                title={PERSONA_EXPLAINER_OFF(personaLabel)}
            >
                <EyeOff className="w-3 h-3" /> Hide all
            </button>
        </div>
    );
}

export function SkuToggle({
    skuId,
    skuName,
    active,
    seededCount,
}: {
    skuId: string;
    skuName: string | null;
    active: boolean;
    seededCount: number;
}) {
    const [pending, startTransition] = useTransition();

    const flip = () => {
        const label = skuName || skuId;
        const preface = active
            ? `Hide "${label}" from the offering?\n\nNew users won't be shown this piece as part of the persona's 9-piece set. ${seededCount.toLocaleString()} existing owners keep it in their closets.`
            : `Show "${label}" to new users again?`;
        if (!confirm(preface)) return;
        startTransition(async () => {
            const res = await setSkuActiveAction(skuId, !active);
            if (!res.ok) alert(`Failed to toggle ${label}: ${res.error}`);
        });
    };

    const tooltip = active
        ? `Click to hide "${skuName ?? skuId}" from the offering. ${seededCount.toLocaleString()} users already own it — their closets are unaffected.`
        : `Click to show "${skuName ?? skuId}" again. Persona will look complete once all 9 SKUs are shown.`;

    return (
        <button
            type="button"
            onClick={flip}
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-1.5 transition-colors"
            style={{
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                background: active ? 'var(--ch-success-tint)' : 'rgba(41,26,12,0.05)',
                color: active ? 'var(--ch-success)' : 'var(--ch-fg-3)',
                border: '1px solid',
                borderColor: active ? 'rgba(15, 109, 61, 0.15)' : 'var(--ch-border)',
                cursor: pending ? 'wait' : 'pointer',
            }}
            title={tooltip}
        >
            {active ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
            {pending ? '…' : active ? 'Live' : 'Hidden'}
        </button>
    );
}
