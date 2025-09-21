import { FormLabel } from "@/components/ui/form";

export default function CustomLabel(props: React.ComponentProps<typeof FormLabel>) {
  return (
    <FormLabel {...props}
      className="text-slate-900 font-medium leading-5" />
  )
}