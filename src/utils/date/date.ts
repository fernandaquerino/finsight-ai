export function getMonthName(date: Date = new Date()): string {
  const monthName = date.toLocaleDateString("pt-BR", {
    month: "long",
  });

  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}

export function getToday(): Date {
  return new Date();
}

export function getYear(date: Date = getToday()): number {
  return date.getFullYear();
}

export function getMonthAndYear(date: Date = getToday()): string {
  return `${getMonthName(date)} de ${getYear(date)}`;
}
