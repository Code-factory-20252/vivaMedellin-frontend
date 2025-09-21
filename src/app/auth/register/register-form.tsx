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

import FormInput from "@/app/components/CustomInput";
import { FormLabel } from "@/components/ui/form";

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


  return <Form {...form}>
    <FormField
      name="email"
      render={() => (
        <FormItem>
          <FormLabel htmlFor="email">Correo electrónico</FormLabel>
          <FormControl>
            <FormInput type="email" placeholder="Ingrese el correo electrónico" />
          </FormControl>
        </FormItem>
      )}
    />
  </Form>
}