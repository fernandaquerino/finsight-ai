import { getCurrentUser } from "@/server/auth/session";
import { UserMenuClient } from "./UserMenuClient";

export async function UserMenu() {
  const user = await getCurrentUser();

  return <UserMenuClient user={user} />;
}
