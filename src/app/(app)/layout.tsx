import { redirect } from "next/navigation";

import { AppShell } from "@/components/app/AppShell";
import { UnauthorizedError, requireUserId } from "@/server/auth/session";

type AppLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function AppLayout({ children }: AppLayoutProps) {
  try {
    await requireUserId();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/login");
    }

    throw error;
  }

  return <AppShell>{children}</AppShell>;
}
