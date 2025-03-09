"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Reservation } from "@/db/schema";
import { formateDate } from "@/lib/utils";
import { DatePicker } from "./date-picker";
import { StatusFilter } from "./reservations-filter";

export function ReservationsDataTable({ data }: { data: Reservation[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.getValue("date") as string;
        return <div>{date}</div>;
      },
    },
    {
      accessorKey: "time",
      header: "Hora",
      cell: ({ row }) => {
        const time = row.getValue("time") as string;
        return <div>{time}</div>;
      },
    },
    {
      accessorKey: "customerName",
      header: "Nombre",
      cell: ({ row }) => {
        const name = row.getValue("customerName") as string;
        const lastName = row.original.customerLastName;
        return <div>{`${name || ""} ${lastName || ""}`}</div>;
      },
    },
    {
      accessorKey: "customerContact",
      header: "Contacto",
      cell: ({ row }) => {
        const contact = row.getValue("customerContact") as string;
        return <div>{contact}</div>;
      },
    },
    {
      accessorKey: "peopleNr",
      header: "Personas",
      cell: ({ row }) => {
        const peopleNr = row.getValue("peopleNr") as number;
        return <div className="text-center">{peopleNr}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={
              status === "active"
                ? "default"
                : status === "canceled"
                ? "destructive"
                : "outline"
            }
          >
            {status === "active"
              ? "Activa"
              : status === "canceled"
              ? "Cancelada"
              : "Modificada"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "attendanceStatus",
      header: "Asistencia",
      cell: ({ row }) => {
        const attendanceStatus = row.getValue("attendanceStatus") as string;
        return (
          <Badge
            variant={
              attendanceStatus === "pending"
                ? "outline"
                : attendanceStatus === "attended"
                ? "default"
                : attendanceStatus === "late"
                ? "secondary"
                : "destructive"
            }
          >
            {attendanceStatus === "pending"
              ? "Pendiente"
              : attendanceStatus === "attended"
              ? "Asistió"
              : attendanceStatus === "late"
              ? "Tarde"
              : "No asistió"}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center py-4 gap-4">
        <Input
          placeholder="Buscar por nombre, contacto..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <DatePicker
            onChange={(date) => {
              if (date) {
                const formattedDate = formateDate(date);
                table.getColumn("date")?.setFilterValue(formattedDate);
              } else {
                table.getColumn("date")?.setFilterValue("");
              }
            }}
          />
          <StatusFilter
            title="Estado"
            column={table.getColumn("status")}
            options={[
              { value: "active", label: "Activa" },
              { value: "canceled", label: "Cancelada" },
              { value: "modified", label: "Modificada" },
            ]}
          />
          <StatusFilter
            title="Asistencia"
            column={table.getColumn("attendanceStatus")}
            options={[
              { value: "pending", label: "Pendiente" },
              { value: "attended", label: "Asistió" },
              { value: "late", label: "Tarde" },
              { value: "no_show", label: "No asistió" },
            ]}
          />
          <StatusFilter
            title="Hora"
            column={table.getColumn("time")}
            options={[
              { value: "08:00", label: "8:00 AM" },
              { value: "08:30", label: "8:30 AM" },
              { value: "09:00", label: "9:00 AM" },
              { value: "09:30", label: "9:30 AM" },
              { value: "10:00", label: "10:00 AM" },
              { value: "10:30", label: "10:30 AM" },
              { value: "11:00", label: "11:00 AM" },
              { value: "11:30", label: "11:30 AM" },
              { value: "12:00", label: "12:00 PM" },
              { value: "12:30", label: "12:30 PM" },
              { value: "13:00", label: "1:00 PM" },
              { value: "13:30", label: "1:30 PM" },
              { value: "14:00", label: "2:00 PM" },
              { value: "14:30", label: "2:30 PM" },
              { value: "15:00", label: "3:00 PM" },
              { value: "15:30", label: "3:30 PM" },
              { value: "16:00", label: "4:00 PM" },
              { value: "16:30", label: "4:30 PM" },
              { value: "17:00", label: "5:00 PM" },
              { value: "17:30", label: "5:30 PM" },
              { value: "18:00", label: "6:00 PM" },
              { value: "18:30", label: "6:30 PM" },
              { value: "19:00", label: "7:00 PM" },
              { value: "19:30", label: "7:30 PM" },
              { value: "20:00", label: "8:00 PM" },
              { value: "20:30", label: "8:30 PM" },
              { value: "21:00", label: "9:00 PM" },
              { value: "21:30", label: "9:30 PM" },
              { value: "22:00", label: "10:00 PM" },
              { value: "22:30", label: "10:30 PM" },
              { value: "23:00", label: "11:00 PM" },
            ]}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "customerName"
                        ? "Nombre"
                        : column.id === "customerContact"
                        ? "Contacto"
                        : column.id === "peopleNr"
                        ? "Personas"
                        : column.id === "status"
                        ? "Estado"
                        : column.id === "attendanceStatus"
                        ? "Asistencia"
                        : column.id === "date"
                        ? "Fecha"
                        : column.id === "time"
                        ? "Hora"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} reserva(s) encontrada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
