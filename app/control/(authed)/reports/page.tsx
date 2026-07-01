export const dynamic = 'force-dynamic';

import { Flag, EyeOff, Clock } from 'lucide-react';
import { getReportedComments } from '../../queries';
import { ReportActions } from './actions';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupByComment(reports: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups = new Map<string, { comment: any; reports: any[] }>();
    for (const r of reports) {
        const commentId = r.comment_id as string;
        if (!groups.has(commentId)) groups.set(commentId, { comment: r.outfit_comments, reports: [] });
        groups.get(commentId)!.reports.push(r);
    }
    return Array.from(groups.values()).sort(
        (a, b) => new Date(b.reports[0].created_at).getTime() - new Date(a.reports[0].created_at).getTime(),
    );
}

export default async function ReportsPage() {
    const { data, error } = await getReportedComments(200);
    const grouped = groupByComment(data);

    return (
        <div className="max-w-[900px] space-y-5">
            <header>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ch-fg)' }}>Reported comments</h1>
                <p className="text-sm ch-soft mt-0.5">
                    {grouped.length.toLocaleString()} distinct comments flagged · auto-hides at 3+ reports
                </p>
            </header>

            {error && (
                <div className="rounded-lg border px-3.5 py-2.5 text-[12.5px]" style={{ borderColor: 'var(--ch-danger)', background: 'var(--ch-danger-tint)', color: 'var(--ch-danger)' }}>
                    Query error: <span className="font-mono">{error}</span>
                </div>
            )}

            <div className="ch-card">
                {grouped.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                        <Flag className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--ch-fg-3)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--ch-fg)' }}>No reports yet</p>
                        <p className="text-xs ch-muted mt-1">When someone flags a comment as abusive, it lands here.</p>
                    </div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--ch-border)' }}>
                        {grouped.map(({ comment, reports }) => {
                            const reasonCounts = reports.reduce<Record<string, number>>((acc, r) => {
                                acc[r.reason] = (acc[r.reason] || 0) + 1;
                                return acc;
                            }, {});
                            const commentId = comment?.id ?? reports[0].comment_id;
                            return (
                                <li key={commentId} className="px-5 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="text-sm font-semibold" style={{ color: 'var(--ch-fg)' }}>{comment?.author_name || 'Unknown commenter'}</span>
                                                <span className="ch-pill ch-pill--danger">
                                                    {reports.length} report{reports.length > 1 ? 's' : ''}
                                                </span>
                                                {comment?.is_hidden && (
                                                    <span className="ch-pill ch-pill--warn">
                                                        <EyeOff className="w-3 h-3" /> auto-hidden
                                                    </span>
                                                )}
                                            </div>
                                            {comment?.content ? (
                                                <blockquote className="mt-2 border-l-2 pl-3 py-1 text-[13.5px] whitespace-pre-wrap break-words" style={{ borderColor: 'var(--ch-danger)', color: 'var(--ch-fg-2)' }}>
                                                    {comment.content}
                                                </blockquote>
                                            ) : (
                                                <p className="mt-2 text-[13.5px] italic ch-muted">comment content unavailable</p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                                                {Object.entries(reasonCounts).map(([reason, count]) => (
                                                    <span key={reason} className="ch-pill ch-pill--muted">
                                                        {reason} · {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-[11px] ch-muted shrink-0 flex items-center gap-1 pt-1">
                                            <Clock className="w-3 h-3" />
                                            {timeAgo(reports[0].created_at)}
                                        </div>
                                    </div>
                                    {comment && (
                                        <div className="mt-3 pt-3 flex flex-wrap items-center gap-2" style={{ borderTop: '1px solid var(--ch-border)' }}>
                                            <ReportActions
                                                commentId={commentId}
                                                commenterUserId={comment.user_id ?? null}
                                                isHidden={!!comment.is_hidden}
                                            />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
