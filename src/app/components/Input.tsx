import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InputFormat() {
  return (
    <div className="flex flex-col gap-1.5 w-md">
      <Label htmlFor="email" className="text-slate-900 font-medium leading-5">Correo electrónico</Label>
      <Input id="email" className="border-slate-300 placeholder:leading-6 placeholder:text-slate-400" type="email" placeholder="Ingrese el correo electrónico" />
    </div>
  )
}