"use server"
import { db } from "@/db";
import { closedDays, InsertReservation, reservations, specialSchedules } from "@/db/schema";
import { eq } from "drizzle-orm";


const generateTimeSlots = (openTime: string, closeTime: string) => {
  const slots: string[] = [];
  let currentTime = new Date(`2000-01-01T${openTime}:00`);
  const endTime = new Date(`2000-01-01T${closeTime}:00`);

  while (currentTime < endTime) {
    slots.push(currentTime.toTimeString().slice(0, 5)); // Formato "HH:MM"
    currentTime = new Date(currentTime.getTime() + 30 * 60000);
  }

  return slots;
};


export async function getUnavailableDates(){
    const closedDates = await db.select({
        date: closedDays.date
    }).from(closedDays).then((res) => res.map((r) => r.date));

     const specialDates = await db
    .select({ date: specialSchedules.date })
    .from(specialSchedules)
    .then((res) => res.map((r) => r.date));

    const unavailableDates = Array.from(new Set([...closedDates, ...specialDates]));

  return unavailableDates;
}


export async function createReserva(data: InsertReservation) {
    await db.insert(reservations).values(data)
}


export async function getAvailableTimes(date: string) {
  if (!date) return { date, availableTimes: [], isClosed: true };

  // Verificar si la fecha está cerrada
  const closedDay = await db.select().from(closedDays).where(eq(closedDays.date, date));
  if (closedDay.length > 0) {
    return { date, availableTimes: [], isClosed: true, reason: closedDay[0].reason }
  }
   const specialSchedule = await db
    .select({ openTime: specialSchedules.openTime, closeTime: specialSchedules.closeTime })
    .from(specialSchedules)
    .where(eq(specialSchedules.date, date))
    .limit(1);

  let openTime = "09:00";
  let closeTime = "23:00";

  if (specialSchedule.length > 0) {
    openTime = specialSchedule[0].openTime;
    closeTime = specialSchedule[0].closeTime;
  }

  // Generar los horarios disponibles
  let availableTimes = generateTimeSlots(openTime, closeTime);

  // Obtener las reservas existentes para la fecha
  const reservedTimes = await db
    .select({ time: reservations.time })
    .from(reservations)
    .where(eq(reservations.date, date))
    .then((res) => res.map((r) => r.time));

  // Filtrar los horarios ocupados
  availableTimes = availableTimes.filter((time) => !reservedTimes.includes(time));

  return { date, availableTimes, isClosed: false };
}