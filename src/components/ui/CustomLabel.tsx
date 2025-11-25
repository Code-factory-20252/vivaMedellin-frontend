import { Label } from '@/components/ui/label';

export default function CustomLabel(props: React.ComponentProps<typeof Label>) {
  return <Label {...props} className="text-slate-900 font-medium leading-5 dark:text-slate-200" />;
}
