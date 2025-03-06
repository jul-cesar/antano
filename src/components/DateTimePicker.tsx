"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn, formateDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Check, Clock, Loader2, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    const fetchUnavailableDates = async () => {
      try {
        setIsLoadingDates(true);
        const dates = await getUnavailableDates();
        setUnavailableDates(dates.map((d) => new Date(d)));
      } catch (error) {
        toast.info("No se pudieron cargar las fechas disponibles");
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchUnavailableDates();
  }, []);

  // Manejo de selección de fecha
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;

    form.setValue("date", date);
    // Reset time when date changes
    form.setValue("time", "");

    try {
      setIsLoadingTimes(true);
      const formattedDate = formateDate(date);
      const data = await getAvailableTimes(formattedDate);
      setTimeSlots(data.availableTimes);

      if (data.availableTimes.length === 0) {
        toast(
          "No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha."
        );
      }
    } catch (error) {
      toast.warning("No se pudieron cargar los horarios disponibles");
      setTimeSlots([]);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  // Envío del formulario
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);

      await createReserva({
        ...data,
        date: formateDate(data.date),
      });

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `¡Reserva confirmada para ${
          data.customerName
        } el ${data.date.toLocaleDateString()} a las ${data.time}!`
      );

      toast.success("Tu cita ha sido reservada correctamente");

      // Resetear formulario
      form.reset();
      setTimeSlots([]);

      // Actualizar fechas no disponibles
      const dates = await getUnavailableDates();
      setUnavailableDates(dates.map((d) => new Date(d)));
    } catch (error) {
      toast.warning("No se pudo completar la reserva. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card className="border shadow-sm">
        <CardHeader className="">
          <CardTitle className="text-2xl font-bold text-primary">
            Reserva tu mesa para Antaño!
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              <p>{successMessage}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Selección de Fecha */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Fecha
                      </FormLabel>
                      <div className="relative">
                        {isLoadingDates && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-md">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        )}
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => handleDateSelect(date)}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            unavailableDates.some(
                              (d) => d.toDateString() === date.toDateString()
                            )
                          }
                          className={cn(
                            "rounded-md border",
                            isLoadingDates && "opacity-50 pointer-events-none"
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  {/* Selección de Hora */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Hora
                        </FormLabel>
                        <div className="relative">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={
                              isLoadingTimes ||
                              !form.getValues().date ||
                              isSubmitting
                            }
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(isLoadingTimes && "opacity-70")}
                              >
                                {isLoadingTimes ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Cargando horarios...</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Selecciona una hora" />
                                )}
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
                        </div>
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
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Reserva a nombre de
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresa tu nombre"
                            disabled={isSubmitting}
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Correo electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ejemplo@gmail.com"
                            type="email"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={
                  isSubmitting || isLoadingTimes || !form.formState.isValid
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Reservar cita"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
