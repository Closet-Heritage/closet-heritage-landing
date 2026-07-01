import DocsSidebar from './DocsSidebar';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-5">
            <DocsSidebar />
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}
