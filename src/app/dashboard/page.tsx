import { db } from "@/db";
import { Suspense } from "react";
import { ReservationsTableSkeleton } from "./components/reservations-data-skeleton";
import { ReservationsDataTable } from "./components/reservations-data-table";
export const dynamic = "force-dynamic";
export default async function ReservationsPage() {
  const reservationsList = await db.query.reservations.findMany({
    orderBy: (reservations, { desc }) => [desc(reservations.createdAt)],
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Lista de reservas para Antaño</h1>
      <Suspense fallback={<ReservationsTableSkeleton />}>
        <ReservationsDataTable data={reservationsList} />
      </Suspense>
    </div>
  );
}
