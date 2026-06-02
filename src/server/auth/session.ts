import { auth } from "@/../auth";

type AuthSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} | null;
type SessionReader = () => Promise<AuthSession>;

export type CurrentUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";

  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function toCurrentUser(session: AuthSession): CurrentUser | null {
  const user = session?.user;
  const userId = user?.id;

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export async function readAuthSession(): Promise<AuthSession> {
  return auth();
}

export async function getCurrentUser(
  readSession: SessionReader = readAuthSession,
): Promise<CurrentUser | null> {
  return toCurrentUser(await readSession());
}

export async function requireUserId(
  readSession: SessionReader = readAuthSession,
): Promise<string> {
  const currentUser = await getCurrentUser(readSession);

  if (!currentUser) {
    throw new UnauthorizedError();
  }

  return currentUser.id;
}
