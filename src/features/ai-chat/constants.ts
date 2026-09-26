import {
  CreditCardIcon,
  PiggyBankIcon,
  RepeatIcon,
  TrendingDownIcon,
} from "lucide-react";

import type { AISuggestionItem } from "@/components/app/AISuggestionPrompt";

// Perguntas de partida. Cada uma cobre uma tool diferente — o objetivo é que a
// primeira resposta já mostre o comportamento fundamentado (número + fonte).
export const CHAT_SUGGESTIONS: readonly AISuggestionItem[] = [
  { prompt: "Onde gastei mais este mês?", icon: TrendingDownIcon },
  { prompt: "Tenho assinaturas que posso cancelar?", icon: RepeatIcon },
  { prompt: "Como está o progresso das minhas metas?", icon: PiggyBankIcon },
  { prompt: "Qual dívida devo quitar primeiro?", icon: CreditCardIcon },
];
