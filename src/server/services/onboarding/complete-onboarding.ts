import { SUGGESTED_CATEGORIES } from "@/features/onboarding/data/catalog";
import { accountRepository } from "@/server/repositories/accounts";
import { categoryRepository } from "@/server/repositories/categories";
import type { Database } from "@/server/repositories/types";
import { userProfileRepository } from "@/server/repositories/user-profiles";
import { userRepository } from "@/server/repositories/users";
import type { OnboardingInput } from "@/server/validators/onboarding";

const categoryByKey = new Map(
  SUGGESTED_CATEGORIES.map((category) => [category.key, category]),
);

// Conclui o onboarding de forma atômica: ou tudo persiste, ou nada.
// Cria/atualiza perfil, nome, categorias e contas numa única transação.
export async function completeOnboarding(
  db: Database,
  userId: string,
  input: OnboardingInput,
): Promise<void> {
  const now = new Date();

  await db.transaction(async (tx) => {
    await userRepository.updateName(tx, userId, input.name);

    await userProfileRepository.upsert(tx, userId, {
      currency: input.currency,
      primaryGoal: input.primaryGoal,
      trackingStartMonth: input.trackingStartMonth ?? null,
      // Consentimento só é registrado se o usuário aceitou explicitamente.
      aiConsentAt: input.aiConsent ? now : null,
      onboardingCompletedAt: now,
    });

    // Categorias: nome/cor/kind vêm do catálogo no servidor, nunca do cliente.
    for (const key of input.categoryKeys) {
      const category = categoryByKey.get(key);
      if (!category) {
        continue;
      }

      await categoryRepository.create(tx, {
        userId,
        name: category.name,
        color: category.color,
        kind: category.kind,
      });
    }

    for (const account of input.accounts) {
      await accountRepository.create(tx, {
        userId,
        name: account.name,
        type: account.type,
        initialBalance:
          account.initialBalance != null
            ? account.initialBalance.toFixed(2)
            : null,
      });
    }
  });
}
