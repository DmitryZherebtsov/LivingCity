import { Link } from "react-router-dom";
import { MapPin, ArrowBigLeft } from "lucide-react";

export default function OrganizerWaiting() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="max-w-xl w-full text-center bg-card p-8 rounded-xl shadow-sm border">
        
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary">
            <MapPin className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">
          Dziękujemy za zgłoszenie
        </h2>

        <p className="mb-4 text-muted-foreground">
          Twoja organizacja została zgłoszona i oczekuje na zatwierdzenie przez administratora.
        </p>

        <p className="text-sm text-muted-foreground mb-6">
          Po zatwierdzeniu, które może potrwać kilka dni, otrzymasz powiadomienie
          e-mailem wskazanym w formularzu i będziesz mógł się zalogować.
        </p>

        <div className="flex items-center justify-center gap-2 font-medium">
          <ArrowBigLeft className="h-4 w-4" />
          <Link
            to="/"
            className="text-primary hover:underline"
          >
            Wróć do logowania
          </Link>
        </div>

      </div>
    </div>
  );
}
