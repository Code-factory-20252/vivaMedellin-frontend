"use client";
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form"

import CustomInput from "@/components/ui/CustomInput";
import CustomButton from "@/components/ui/CustomButton";
import CustomLabel from "@/components/ui/CustomLabel";

const registerSchema = z.object({
  username: z.string().nonempty("El nombre de usuario es obligatorio"),
  email: z.email("El correo electrónico no es válido"),
  password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"]
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <CustomLabel htmlFor={field.name}>Nombre de Usuario</CustomLabel>
            <FormControl>
              <CustomInput id={field.name} type="text" placeholder="Ingrese un nombre de usuario único" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <CustomLabel htmlFor={field.name}>Correo electrónico</CustomLabel>
            <FormControl>
              <CustomInput id={field.name} type="email" placeholder="Ingrese el correo electrónico" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <CustomLabel htmlFor={field.name}>Contraseña</CustomLabel>
            <FormControl>
              <CustomInput id={field.name} type="password" placeholder="Crea una contraseña" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <CustomLabel htmlFor={field.name}>Confirmar contraseña</CustomLabel>
            <FormControl>
              <CustomInput id={field.name} type="password" placeholder="Vuelva a ingresar la contraseña" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <CustomButton type="submit">Registrarse</CustomButton>
      <p className="self-center leading-2 text-slate-700">
        ¿Ya tienes cuenta?<span className="font-semibold text-sky-500"> Iniciar sesión</span>
      </p>
    </form>
  </Form>
}