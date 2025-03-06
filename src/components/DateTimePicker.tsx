"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  createReserva,
  getAvailableTimes,
  getUnavailableDates,
} from "./actions";
import { Input } from "./ui/input";

// Definir esquema de validación con Zod
const formSchema = z.object({
  date: z.date({
    required_error: "Por favor selecciona una fecha.",
  }),
  time: z.string({
    required_error: "Por favor selecciona una hora.",
  }),
  customerName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres."),
  customerContact: z.string().email("Por favor ingresa un correo válido."),
});

type FormValues = z.infer<typeof formSchema>;

export default function DateTimePickerPage() {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined,
      time: "",
      customerName: "",
      customerContact: "",
    },
  });

  useEffect(() => {
    // Obtener las fechas no disponibles al cargar el componente
    getUnavailableDates().then((dates) => {
      setUnavailableDates(dates.map((d) => new Date(d)));
    });
  }, []);

  // Manejo de selección de fecha
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    form.setValue("date", date);

    const formattedDate = date.toString();
    console.log(formattedDate);
    const data = await getAvailableTimes(formattedDate);

    setTimeSlots(data.availableTimes);
  };

  // Envío del formulario
  const onSubmit = async (data: FormValues) => {
    console.log("Reserva enviada:", data);
    await createReserva({ ...data, date: data.date.toString() });
    form.reset();
    form.resetField("time");

    // Aquí puedes enviar los datos a una API
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reserva tu cita</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Selección de Fecha */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => handleDateSelect(date)}
                  disabled={(date) =>
                    unavailableDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    )
                  }
                  className="rounded-md border"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selección de Hora */}
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una hora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.length > 0 ? (
                      timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled value="No">
                        No hay horarios disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre del Cliente */}
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reserva a nombre de</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ingresa tu nombre" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contacto del Cliente */}
          <FormField
            control={form.control}
            name="customerContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="ejemplo@gmail.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Reservar</Button>
        </form>
      </Form>
    </div>
  );
}
