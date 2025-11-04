import { Input } from '@/components/ui/input';

export default function CustomInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className="h-10 pt-2 pb-2 border-slate-300 placeholder:text-base placeholder:leading-5  placeholder:text-slate-400"
    />
  );
}
