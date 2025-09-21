"use client";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"

import CustomInput from "@/app/components/CustomInput";
import CustomButton from "@/app/components/CustomButton";
import CustomLabel from "@/app/components/CustomLabel";

const registerSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  email: z.string().min(1, "El correo electrónico es obligatorio"),
  password: z.string(),
  confirmPassword: z.string(),
});

export default function RegisterForm() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    console.log(values);
  }

  return <Form {...form}>
    <form action="onSubmit={form.handleSubmit(onSubmit)}" className="flex flex-col gap-5">
      <FormField
        control={form.control}
        name="email"
        render={() => (
          <FormItem>
            <CustomLabel htmlFor="email">Correo electrónico</CustomLabel>
            <FormControl>
              <CustomInput id="email" type="email" placeholder="Ingrese el correo electrónico" required />
            </FormControl>
          </FormItem>
        )}
      />
      <CustomButton>Registrarse</CustomButton>
    </form>
  </Form>
}