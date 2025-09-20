import { Input } from "@/components/ui/input"

export default function CustomInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input {...props}
      className="border-slate-300 placeholder:leading-6 placeholder:text-slate-400" />
  )
}