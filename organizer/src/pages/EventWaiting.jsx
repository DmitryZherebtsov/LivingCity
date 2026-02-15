import { Link } from "react-router-dom";
import { CalendarClock, ArrowBigLeft } from "lucide-react";

function EventWaiting() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="max-w-xl w-full text-center bg-card p-8 rounded-xl shadow-sm border">

        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary">
            <CalendarClock className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Wydarzenie zostało zgłoszone
        </h2>

        <p className="mb-4 text-muted-foreground">
          Twoje wydarzenie zostało przesłane do weryfikacji i oczekuje na zatwierdzenie przez administratora.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Po zatwierdzeniu wydarzenie stanie się publicznie widoczne w serwisie.
          Proces weryfikacji może potrwać do kilku dni roboczych.
        </p>

        <div className="flex items-center justify-center gap-2 font-medium">
          <ArrowBigLeft className="h-4 w-4" />
          <Link
            to="/dashboard"
            className="text-primary hover:underline"
          >
            Przejdź do panelu
          </Link>
        </div>

      </div>
    </div>
  );
}

export default EventWaiting;