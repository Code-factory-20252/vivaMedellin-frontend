import { Button } from '@/components/ui/button';

export default function CustomButton(props: React.ComponentProps<typeof Button>) {
  return (
    <Button
      {...props}
      className="bg-sky-500 rounded-full h-14 text-lg font-semibold  hover:bg-sky-600 dark:bg-sky-300 dark:hover:bg-sky-500 dark:text-slate-800"
    />
  );
}

//"bg-sky-500 rounded-full h-14 text-lg font-semibold  hover:bg-sky-600 dark:bg-sky-300 dark:hover:bg-sky-500 dark:text-slate-800"
