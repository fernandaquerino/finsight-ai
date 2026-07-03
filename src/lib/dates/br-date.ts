// Helpers para o formato de data brasileiro (DD/MM/AAAA) usado nos inputs.
// Compartilhados entre o lançamento manual e a edição inline no detalhe.

export function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Converte DD/MM/AAAA -> YYYY-MM-DD (formato esperado pela API). Retorna null
// se a data não for válida (ex.: 31/02).
export function brDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  const isValid =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);

  return isValid ? `${year}-${month}-${day}` : null;
}
