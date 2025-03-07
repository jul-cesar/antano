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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { peopleNrReservation } from "@/lib/constants";
import { cn, formateDate } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Check,
  Clock,
  Loader2,
  Mail,
  Phone,
  User,
  Users2Icon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import * as z from "zod";
import {
  createReserva,
  getAvailableTimes,
  getUnavailableDates,
} from "./actions";
import { CalendarYear } from "./ui/calendar-year";

// First step validation schema
const firstStepSchema = z.object({
  date: z.date({
    required_error: "Por favor selecciona una fecha.",
  }),
  time: z
    .string({
      required_error: "Por favor selecciona una hora.",
    })
    .min(1, "Por favor selecciona una hora."),
  peopleNr: z
    .string()
    .refine((v) => peopleNrReservation.some((n) => n.toString() === v), {
      message: "Por favor selecciona el número de personas.",
    }),
});

type FirstStepValues = z.infer<typeof firstStepSchema>;

// Second step validation schema
const secondStepSchema = z.object({
  customerName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres."),
  customerLastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres."),
  customerContact: z.string().email("Por favor ingresa un correo válido."),
  hasAllergy: z.enum(["si", "no"]),
  customerAllergy: z.string().optional(),
  phone_number: z.string().optional(),
  customerBirthDay: z.date({
    required_error: "Por favor selecciona tu fecha de nacimiento",
  }),
});

type SecondStepValues = z.infer<typeof secondStepSchema>;

export default function ReservationForm() {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Store first step data separately
  const [firstStepData, setFirstStepData] = useState<FirstStepValues | null>(
    null
  );

  // Separate form for first step
  const firstStepForm = useForm<FirstStepValues>({
    resolver: zodResolver(firstStepSchema),
    defaultValues: {
      date: undefined,
      time: "",
      peopleNr: "",
    },
    mode: "all",
  });

  // Separate form for second step
  const secondStepForm = useForm<SecondStepValues>({
    resolver: zodResolver(secondStepSchema),
    defaultValues: {
      customerName: "",
      customerLastName: "",
      customerContact: "",
      hasAllergy: "no",
      customerAllergy: "",
      phone_number: "",
      customerBirthDay: undefined,
    },
    mode: "onChange",
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

    firstStepForm.setValue("date", date);
    // Reset time when date changes
    firstStepForm.setValue("time", "");

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

  // Avanzar al siguiente paso
  const handleNextStep = async (data: FirstStepValues) => {
    setFirstStepData(data);
    setCurrentStep(2);
  };

  // Volver al paso anterior
  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  // Envío del formulario
  const onSubmit = async (data: SecondStepValues) => {
    if (!firstStepData) return;

    try {
      setIsSubmitting(true);
      setSuccessMessage(null);

      // Combine data from both steps
      const completeData = {
        ...firstStepData,
        ...data,
      };

      await createReserva({
        ...completeData,
        date: formateDate(firstStepData.date),
        peopleNr: Number.parseInt(firstStepData.peopleNr),
        customerBirthDay: formateDate(data.customerBirthDay),
      });

      // Mostrar mensaje de éxito
      setSuccessMessage(
        `¡Reserva confirmada para ${
          data.customerName
        } el ${firstStepData.date.toLocaleDateString()} a las ${
          firstStepData.time
        }!`
      );

      toast.success("Tu reserva ha sido confirmada correctamente");

      // Resetear formulario y volver al primer paso
      firstStepForm.reset();
      secondStepForm.reset();
      setFirstStepData(null);
      setTimeSlots([]);
      setCurrentStep(1);

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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div>
        <h1 className="mb-4 text-4xl text-center font-extrabold leading-none tracking-tight text-[#623928] md:text-2xl lg:text-3xl ">
          Haz una reserva para Antaño
        </h1>

        <Image
          className="mx-auto m-0"
          alt="Antaño Horno y Café logo."
          width={120}
          height={30}
          src={
            "https://instagram.fpei1-1.fna.fbcdn.net/v/t51.2885-19/473117456_1321427895544387_3209803347449756692_n.jpg?_nc_ht=instagram.fpei1-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2AG2avGVrlvG5WJl1UJD_DTj2LVd8qsc4bCxsosH0XFId8HO6_5Dk8qZbxFJOaDSlD_d5xzw1SwqEc1nNj3IFUcP&_nc_ohc=USWcrwODRIkQ7kNvgFrhgpU&_nc_gid=5805950dbb0242fbb67297d15471d5b9&edm=APoiHPcBAAAA&ccb=7-5&oh=00_AYF6V528VISz6Lf4Y8Mw7eIm-3JMTZIfU0U-RH7wwOE80g&oe=67D15DE5&_nc_sid=22de04"
          }
        />
      </div>
      <div className="pt-1">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
            <Check className="h-5 w-5" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 2 ? "bg-primary" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {currentStep === 1 ? (
          <Form {...firstStepForm}>
            <form
              onSubmit={firstStepForm.handleSubmit(handleNextStep)}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Selección de Fecha */}
                <FormField
                  control={firstStepForm.control}
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
                    control={firstStepForm.control}
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
                              !firstStepForm.getValues().date ||
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

                  {/* Selección de Personas */}
                  <FormField
                    control={firstStepForm.control}
                    name="peopleNr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users2Icon className="h-4 w-4" />
                          Personas
                        </FormLabel>
                        <div className="relative">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona número de personas" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {peopleNrReservation.map((n) => (
                                <SelectItem value={n.toString()} key={n}>
                                  {n}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full mt-6">
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...secondStepForm}>
            <form
              onSubmit={secondStepForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Resumen de la primera parte */}
              {firstStepData && (
                <div className="bg-muted p-4 rounded-md mb-6">
                  <h3 className="font-medium mb-2">Detalles de la reserva:</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-1">
                      <span className="font-medium text-center">Fecha: </span>{" "}
                      {formateDate(firstStepData.date).split("2025")[0]}
                    </div>
                    <div className="flex flex-col lg:flex-row lg:justify-center items-center gap-1">
                      <span className="font-medium">Hora: </span>{" "}
                      {firstStepData.time}
                    </div>
                    <div className="flex flex-col lg:flex-row lg:justify-center items-center gap-1">
                      <span className="font-medium">Personas: </span>{" "}
                      {firstStepData.peopleNr}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Nombre del Cliente */}
                <FormField
                  control={secondStepForm.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jimi"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Apellido del Cliente */}
                <FormField
                  control={secondStepForm.control}
                  name="customerLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Apellido
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Hendrix"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contacto del Cliente */}
                <FormField
                  control={secondStepForm.control}
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
                          placeholder="ejem@gmail.com"
                          type="email"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Teléfono del Cliente */}
                <FormField
                  control={secondStepForm.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </FormLabel>
                      <FormControl>
                        <PhoneInputWithCountrySelect
                          countrySelectProps={{
                            className: "",
                          }}
                          placeholder="Teléfono"
                          numberInputProps={{
                            className:
                              "border border-input bg-background placeholder:text-muted-foreground focus:border-primary p-2 rounded-md w-full",
                          }}
                          defaultCountry="CO"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Alergias */}
                <FormField
                  control={secondStepForm.control}
                  name="hasAllergy"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>¿Tienes alguna alergia alimentaria?</FormLabel>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="allergy-yes"
                            value="si"
                            checked={field.value === "si"}
                            onChange={() => field.onChange("si")}
                            className="mr-2"
                          />
                          <label htmlFor="allergy-yes">Sí</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="allergy-no"
                            value="no"
                            checked={field.value === "no"}
                            onChange={() => field.onChange("no")}
                            className="mr-2"
                          />
                          <label htmlFor="allergy-no">No</label>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {secondStepForm.watch("hasAllergy") === "si" && (
                  <FormField
                    control={secondStepForm.control}
                    name="customerAllergy"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Detalla tus alergias alimentarias</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            className="w-full min-h-[100px] p-2 border border-input rounded-md"
                            placeholder="Describe tus alergias alimentarias aquí..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Fecha de nacimiento */}
                <FormField
                  control={secondStepForm.control}
                  name="customerBirthDay"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Fecha de nacimiento
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarYear
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar reserva"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
