import {
  notificationPreferenceRepository,
  userProfileRepository,
  userRepository,
  type Database,
} from "@/server/repositories";
import type { UpdateSettingsInput } from "@/server/validators/settings";

import { UserNotFoundError } from "./errors";

// Aplica um patch parcial que pode tocar três tabelas (users, user_profiles,
// notification_preferences). Tudo numa transação: um patch que grava o nome e
// falha na preferência não pode deixar a tela num estado meio salvo.
export async function updateSettings(
  db: Database,
  userId: string,
  input: UpdateSettingsInput,
): Promise<{ id: string }> {
  const profileFields = {
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.cpf !== undefined ? { cpf: input.cpf } : {}),
    ...(input.aiAutoCategorize !== undefined
      ? { aiAutoCategorize: input.aiAutoCategorize }
      : {}),
    ...(input.aiProactiveInsights !== undefined
      ? { aiProactiveInsights: input.aiProactiveInsights }
      : {}),
  };

  await db.transaction(async (tx) => {
    if (input.name !== undefined) {
      const user = await userRepository.updateName(tx, userId, input.name);
      if (!user) {
        throw new UserNotFoundError();
      }
    }

    if (Object.keys(profileFields).length > 0) {
      const profile = await userProfileRepository.updateSettings(
        tx,
        userId,
        profileFields,
      );
      if (!profile) {
        throw new UserNotFoundError("Perfil não encontrado.");
      }
    }

    if (input.notifications) {
      // Upsert: a linha só nasce quando o usuário mexe nas preferências pela
      // primeira vez. Os campos ausentes caem nos defaults do schema.
      await notificationPreferenceRepository.upsert(
        tx,
        userId,
        input.notifications,
      );
    }
  });

  return { id: userId };
}
