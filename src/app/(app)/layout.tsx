import { redirect } from "next/navigation";

import { auth } from "@/../auth";
import { AppShell } from "@/components/app/AppShell";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  return <AppShell>{children}</AppShell>;
}
