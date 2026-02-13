import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowBigLeft, MapPin } from "lucide-react";

export default function OrganizerWaiting() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.organizer_status === "approved") {
        navigate("/organizer", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center bg-white p-8 rounded shadow">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
          <MapPin className="w-7 h-7 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-4">Dziękujemy za zgłoszenie</h2>
        <p className="mb-4">
          Twoja organizacja została zgłoszona i oczekuje na zatwierdzenie przez administratora. 
        </p>
        <p className="ml-1 text-primary hover:opacity-80 font-medium">Po zatwierdzeniu które może trwać kilka dni otrzymasz powiadomienie e-mailem wskazanym w formularze i będziesz mógł się zalogować.</p>
        <br />
        
        {/* <div className="inline-flex items-center justify-center font-semibold mb-4">
          <Link to="/organizer/auth" className="text-primary font-medium">
            Wróć do logowania
          </Link>
          <ArrowBigLeft/>
        </div> */}
        
      </div>
    </div>
  );
}
