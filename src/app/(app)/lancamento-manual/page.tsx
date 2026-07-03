import { ManualTransactionScreen } from "@/features/transactions/components/ManualTransactionScreen";

type NewTransactionPageProps = {
  searchParams: Promise<{ id?: string }>;
};

// ?id=<uuid> entra em modo edição; sem id, criação.
export default async function NewTransactionPage({
  searchParams,
}: NewTransactionPageProps) {
  const { id } = await searchParams;

  return <ManualTransactionScreen transactionId={id} />;
}
