import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, Mail, Lock, User, ArrowRight, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import "./styles/Organizer.css"; 

const loginSchema = z.object({
  email: z.string().trim().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

const registerSchema = z.object({
  orgName: z.string().trim().min(2, "Nazwa organizacji musi mieć co najmniej 2 znaki"),
  website: z.string().trim().max(255, "Strona jest za długa").optional(),
  phoneNumber: z.string().trim().max(50, "Telefon jest za długi").optional(),

  contactEmail: z.string().trim().email("Nieprawidłowy adres email"),
  phoneNumber: z.string().trim().max(50, "Telefon jest za długi").optional(),
  userName: z.string().trim().min(2, "Imię musi mieć co najmniej 2 znaki").max(100),
  email: z.string().trim().email("Nieprawidłowy adres email").max(255),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków").max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są takie same",
  path: ["confirmPassword"],
});

export default function OrganizerAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, user, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [orgName, setOrgName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role && user.role.toLowerCase() === "organizer") {
        if (user.organizer_status === "approved") {
          navigate("/settings", { replace: true });
        } else {
          navigate("/organizer/waiting", { replace: true });
        }
      }
    }
  }, [isLoading, user, navigate]);

  const resetForm = () => {
    setOrgName("");
    setWebsite("");
    setContactEmail("");
    setPhoneNumber("");
    setLogoFile(null);
    setProfileFile(null);
    setUserName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  async function uploadFileIfPossible(file) {
    if (!file) return null;
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        console.warn("Upload endpoint returned error, falling back to null", await res.text());
        return null;
      }
      const data = await res.json();
      return data.url || data.path || data.fileUrl || null;
    } catch (err) {
      console.warn("Upload failed (endpoint may not exist). Proceeding without upload.", err);
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          const f = {};
          parsed.error.errors.forEach((err) => {
            if (err.path[0]) f[err.path[0]] = err.message;
          });
          setErrors(f);
          setIsSubmitting(false);
          return;
        }

        const { error, user: loggedUser } = await login(email, password);

        if (error) {
          toast({
            title: "Logowanie nie powiodło się",
            description: error,
            variant: "destructive",
          });
          return;
        }
        if (
          loggedUser?.role?.toLowerCase() === "organizer" &&
          loggedUser?.organizer_status !== "approved"
        ) {
          toast({
            title: "Konto oczekuje na zatwierdzenie",
            description:
              "Administrator musi zatwierdzić Twoją organizację przed pierwszym logowaniem.",
            variant: "destructive",
          });
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.reload();
          return;
        }
        toast({
          title: "Zalogowano",
          description: "Witaj!",
        });
      } else {
        const parsed = registerSchema.safeParse({
          orgName,
          website,
          contactEmail,
          phoneNumber,
          userName,
          email,
          password,
          confirmPassword,
        });

        if (!parsed.success) {
          const f = {};
          parsed.error.errors.forEach((err) => {
            if (err.path[0]) f[err.path[0]] = err.message;
          });
          setErrors(f);
          setIsSubmitting(false);
          return;
        }

        let logoUrl = null;
        let profilePicUrl = null;
        if (logoFile) {
          logoUrl = await uploadFileIfPossible(logoFile);
        }
        if (profileFile) {
          profilePicUrl = await uploadFileIfPossible(profileFile);
        }

        const payload = {
          orgName: orgName,
          description: "",
          website: website || null,
          contactEmail: contactEmail,
          facebookLink: null, 
          instagramLink: null,
          phoneNumber: phoneNumber || null,
          logoUrl: logoUrl, 
          profilePicUrl: profilePicUrl, 
          userName: userName,
          email: email,
          password: password,
        };

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/organizers/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = body?.message || body?.error || "Rejestracja nie powiodła się";
          toast({ title: "Błąd", description: message, variant: "destructive" });
          setIsSubmitting(false);
          return;
        }

        toast({
          title: "Zgłoszenie wysłane",
          description: "Twoja organizacja została zgłoszona. Czekaj na potwierdzenie od administratora.",
        });

        resetForm();
        navigate("/organizer/waiting");
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Błąd", description: err.message || "Coś poszło nie tak", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="organizer-theme min-h-screen flex items-center justify-center p-4">

        <div className="animated-gradient" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-100/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-3xl mx-auto relative z-10">

        <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
          <h1 className="text-2xl font-bold text-foreground">Living City - Organizer</h1>
          <p className="text-foreground mt-1">Panel dla organizatorów wydarzeń</p>
        </div>

        <Card className="backdrop-blur dark:bg-card shadow-2xl border border-border">



          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              {isLogin ? "Zaloguj się do konta organizatora" : "Zarejestruj organizację"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Zaloguj się, aby zarządzać swoimi wydarzeniami"
                : "Podaj podstawowe informacje o organizacji i zakładaj konto organizatora"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="orgName">Nazwa organizacji</Label>
                      <Input
                        id="orgName"
                        type="text"
                        placeholder="Nazwa organizacji"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className={`mt-1 ${errors.orgName ? "border-destructive" : ""}`}
                      />
                      {errors.orgName && <p className="text-sm text-destructive">{errors.orgName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="website">Strona www (opcjonalnie)</Label>
                        <Input id="website" placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="contactEmail">Email kontaktowy organizacji</Label>
                        <Input id="contactEmail" placeholder="kontakt@org.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={`mt-1 ${errors.contactEmail ? "border-destructive" : ""}`} />
                        {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phoneNumber">Telefon (opcjonalnie)</Label>
                        <Input id="phoneNumber" placeholder="+48123..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Logo / Avatar</Label>
                        <div className="flex items-center gap-3 mt-1">
                          <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm bg-amber-50 hover:bg-amber-100">
                            <Upload className="w-4 h-4" />
                            <span>{logoFile ? logoFile.name : "Wybierz logo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                              className="hidden"
                            />
                          </label>

                          <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer text-sm bg-amber-50 hover:bg-amber-100">
                            <Upload className="w-4 h-4" />
                            <span>{profileFile ? profileFile.name : "Wybierz avatar"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="userName">Imię i nazwisko (osoby kontaktowej)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="userName" type="text" placeholder="Jan Kowalski" value={userName} onChange={(e) => setUserName(e.target.value)} className={`pl-10 ${errors.userName ? "border-destructive" : ""}`} />
                  </div>
                  {errors.userName && <p className="text-sm text-destructive">{errors.userName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="twoj@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`pl-10 ${errors.email ? "border-destructive" : ""}`} />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`} />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              )}

              <Button type="submit"
                  variant="default"
                  className="w-full"
                >


                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? "Logowanie..." : "Tworzenie konta..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Zaloguj się" : "Zarejestruj organizację"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Nie masz konta organizatora?" : "Masz już konto?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                  className="ml-1 text-primary hover:opacity-80 font-medium"
                >
                  {isLogin ? "Zarejestruj organizację" : "Zaloguj się"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
