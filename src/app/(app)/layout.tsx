type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-card px-6 py-4">
        <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">
          Authenticated app placeholder
        </p>
      </div>
      {children}
    </div>
  );
}
