import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formateDate(date: number | Date){
  return new Intl.DateTimeFormat("es-ES", {
  weekday: "short", // "Lun"
  day: "2-digit",   // "31"
  month: "short",   // "Mar"
  year: "numeric"   // "2025"
}).format(date);
}