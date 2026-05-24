import { toast as hotToast, type ToastOptions } from 'react-hot-toast';

type ToastVariant = 'default' | 'success' | 'error';

type ToastProps = ToastOptions & {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

function renderContent(title?: string, description?: string) {
  if (!title && !description) return null;
  return (
    <div>
      {title && <strong className="block">{title}</strong>}
      {description && <div className="text-sm opacity-90">{description}</div>}
    </div>
  );
}

export function useToast() {
  const toast = (props: ToastProps) => {
    const { title, description, variant = 'default', ...rest } = props;
    const content = renderContent(title, description) ?? title ?? description ?? '';

    if (variant === 'success') {
      return hotToast.success(content, rest);
    }
    if (variant === 'error') {
      return hotToast.error(content, rest);
    }
    return hotToast(content, rest);
  };

  return {
    toast,
    success: (title: string, description?: string) =>
      toast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) =>
      toast({ title, description, variant: 'error' }),
  };
}
