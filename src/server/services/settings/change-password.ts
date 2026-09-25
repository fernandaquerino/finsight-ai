import { userRepository, type Database } from "@/server/repositories";
import { hashPassword, verifyPassword } from "@/server/services/auth/password";
import type { ChangePasswordInput } from "@/server/validators/settings";

import {
  InvalidCurrentPasswordError,
  PasswordNotSetError,
  UserNotFoundError,
} from "./errors";

// Troca de senha. Exige a senha atual: sessão válida não basta para trocar a
// credencial de acesso (defesa contra sessão sequestrada).
export async function changePassword(
  db: Database,
  userId: string,
  input: ChangePasswordInput,
): Promise<{ id: string }> {
  const user = await userRepository.findById(db, userId);

  if (!user) {
    throw new UserNotFoundError();
  }

  if (!user.passwordHash) {
    throw new PasswordNotSetError();
  }

  const isCurrentPasswordValid = await verifyPassword(
    input.currentPassword,
    user.passwordHash,
  );

  if (!isCurrentPasswordValid) {
    throw new InvalidCurrentPasswordError();
  }

  const passwordHash = await hashPassword(input.newPassword);
  const updated = await userRepository.updatePasswordHash(
    db,
    userId,
    passwordHash,
  );

  if (!updated) {
    throw new UserNotFoundError();
  }

  return { id: updated.id };
}
