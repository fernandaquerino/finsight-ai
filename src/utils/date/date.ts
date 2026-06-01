export function getMonthName(date: Date = new Date()): string {
  const monthName = date.toLocaleDateString("pt-BR", {
    month: "long",
  });

  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}
