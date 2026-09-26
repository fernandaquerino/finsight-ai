import { AIChatScreen } from "@/features/ai-chat/components/AIChatScreen";

export const metadata = {
  title: "Chat IA · FinSight AI",
  description:
    "Converse com seus próprios dados financeiros. Toda resposta com número cita a fonte.",
};

export default function AIChatPage() {
  return <AIChatScreen />;
}
