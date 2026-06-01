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

export function formatRelativeTime(date: Date, now = new Date()): string {
  const diffInMs = Math.max(0, now.getTime() - date.getTime());
  const diffInMinutes = Math.floor(diffInMs / (60 * 1000));

  if (diffInMinutes < 1) return "agora";
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours} h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `há ${diffInDays} ${diffInDays === 1 ? "dia" : "dias"}`;
}
