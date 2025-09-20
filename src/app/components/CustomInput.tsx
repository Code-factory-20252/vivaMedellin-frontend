import { Input } from "@/components/ui/input"

export default function CustomInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input {...props}
      className="border-slate-300 placeholder:leading-6 placeholder:text-slate-400" />
  )
}
// <div className="flex flex-col gap-1.5 w-md">
// <Label htmlFor="email" className="text-slate-900 font-medium leading-5">Correo electrónico</Label>