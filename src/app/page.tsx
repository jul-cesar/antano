import DateTimePickerPage from "@/components/DateTimePicker";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <section className="container">
      <Link href={"/dashboard"}>
        <Button variant={"link"}>Ver lista de reservas hechas</Button>
      </Link>
      <DateTimePickerPage />
    </section>
  );
}
