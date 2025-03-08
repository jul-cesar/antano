import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Mail, Phone } from "lucide-react";

interface ThankYouScreenProps {
  reservationDetails: {
    date: string;
    time: string;
    peopleNr: string;
    customerName: string;
    customerLastName: string;
    customerContact: string;
  };
  onNewReservation: () => void;
}

export default function ThankYouScreen({
  reservationDetails,
  onNewReservation,
}: ThankYouScreenProps) {
  const {
    date,
    time,
    peopleNr,
    customerName,
    customerLastName,
    customerContact,
  } = reservationDetails;

  return (
    <div className="mt-8 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          ¡Gracias por tu reserva!
        </h2>
        <p className="text-green-700 mb-6">
          Hemos recibido tu solicitud de reserva correctamente. En breve
          recibirás un correo electrónico de confirmación con todos los detalles
          de tu reserva en <strong>{customerContact}</strong>.
        </p>
        <div className="bg-white rounded-md p-4 mb-6 max-w-md mx-auto">
          <h3 className="font-medium mb-2 text-gray-700">
            Resumen de tu reserva:
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Fecha:</span> {date}
            </p>
            <p>
              <span className="font-medium">Hora:</span> {time}
            </p>
            <p>
              <span className="font-medium">Personas:</span> {peopleNr}
            </p>
            <p>
              <span className="font-medium">Reservado a nombre de:</span>{" "}
              {customerName} {customerLastName}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600 mb-2">
            Si necesitas modificar o cancelar tu reserva, por favor contáctanos:
          </p>
          <p className="flex items-center justify-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" /> +57 123 456 7890
          </p>
          <p className="flex items-center justify-center gap-2 text-gray-600">
            <Mail className="h-4 w-4" /> reservas@antanocafe.com
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/">
          <Button className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </a>
      </div>
    </div>
  );
}
