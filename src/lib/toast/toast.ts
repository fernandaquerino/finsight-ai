import { toast } from "sonner";

type ToastOptions = Readonly<{
  title: string;
  description?: string;
}>;

function success({ title, description }: ToastOptions): string | number {
  return toast.success(title, { description });
}

function error({ title, description }: ToastOptions): string | number {
  return toast.error(title, { description });
}

function warning({ title, description }: ToastOptions): string | number {
  return toast.warning(title, { description });
}

function info({ title, description }: ToastOptions): string | number {
  return toast.info(title, { description });
}

export const showToast = {
  success,
  error,
  warning,
  info,
} as const;

export type { ToastOptions };
