import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { register, login } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import "@/pages/styles/auth.css";

type RegForm = {

  orgName: string;
  description: string;
  website: string;
  contactEmail: string;
  phone: string;
  address: string;
  city: string;
  logoUrl: string | null;
  nipKrs: string;

  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Auth = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoFileName, setLogoFileName] = useState("");

  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [regForm, setRegForm] = useState<RegForm>({
    orgName: "",
    description: "",
    website: "",
    contactEmail: "",
    phone: "",
    address: "",
    city: "",
    logoUrl: null,
    nipKrs: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(loginForm.email, loginForm.password);

      toast({
        title: "Zalogowano pomyślnie",
      });

      navigate("/dashboard");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("pending")) {
        toast({
          title: "Organizacja oczekuje na zatwierdzenie",
          description: "Administrator musi zatwierdzić konto.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logowanie nie powiodło się",
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (regForm.password !== regForm.confirmPassword) {
      toast({
        title: "Błąd",
        description: "Hasła nie są takie same",
        variant: "destructive",
      });
      return;
    }

    if (!regForm.orgName || !regForm.email || !regForm.fullName) {
      toast({
        title: "Błąd",
        description: "Uzupełnij wymagane pola (nazwa, e-mail, imię).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        orgName: regForm.orgName,
        description: regForm.description,
        website: regForm.website,
        phone: regForm.phone,
        city: regForm.city,
        address: regForm.address,
        logoUrl: regForm.logoUrl || "",
        nipKrs: regForm.nipKrs,
        email: regForm.email,
        password: regForm.password,
        fullName: regForm.fullName,
        contactEmail: regForm.contactEmail,
      });

      toast({
        title: "Rejestracja zakończona",
        description: "Twoja organizacja oczekuje na zatwierdzenie.",
      });
      
      navigate("/organizer/waiting", { replace: true });
    } catch (err: any) {
      toast({
        title: "Rejestracja nie powiodła się",
        description: err.message || "Błąd sieci",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRegForm((prev) => ({
        ...prev,
        logoUrl: reader.result as string,
      }));
      setLogoFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const updateReg = (field: keyof RegForm, value: string | null) =>
    setRegForm((p) => ({ ...p, [field]: value as any }));

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="animated-gradient" />

      <Card className="relative z-10 w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Panel Organizatora Wydarzeń
          </CardTitle>
          <CardDescription>
            Zarządzaj swoimi wydarzeniami i zarejestruj organizację
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Logowanie</TabsTrigger>
              <TabsTrigger value="register">Rejestracja</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="E-mail"
                    required
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Hasło</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Hasło"
                    required
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </Button>
              </form>
            </TabsContent>


            <TabsContent value="register">
              <form onSubmit={handleRegister} className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label>Nazwa organizacji</Label>
                      <Input
                        required
                        value={regForm.orgName}
                        onChange={(e) => updateReg("orgName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Krótki opis</Label>
                      <Textarea
                        value={regForm.description}
                        onChange={(e) => updateReg("description", e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Strona internetowa</Label>
                      <Input
                        type="url"
                        value={regForm.website}
                        onChange={(e) => updateReg("website", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>NIP / KRS</Label>
                      <Input
                        value={regForm.nipKrs}
                        onChange={(e) => updateReg("nipKrs", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Logo organizacji</Label>
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.svg"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start gap-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          {logoFileName || "Prześlij logo (.jpg, .png, .svg)"}
                        </Button>
                      </div>

                      {regForm.logoUrl && (
                        <div className="mt-2">
                          <img
                            src={regForm.logoUrl}
                            alt="logo preview"
                            className="h-16 w-16 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Osoba kontaktowa (imię i nazwisko)</Label>
                      <Input
                        required
                        value={regForm.fullName}
                        onChange={(e) => updateReg("fullName", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>E-mail osoby (login)</Label>
                      <Input
                        required
                        type="email"
                        value={regForm.email}
                        onChange={(e) => updateReg("email", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>E-mail kontaktowy organizacji (opcjonalnie)</Label>
                      <Input
                        type="email"
                        value={regForm.contactEmail}
                        onChange={(e) => updateReg("contactEmail", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Telefon</Label>
                      <Input
                        value={regForm.phone}
                        onChange={(e) => updateReg("phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Adres (ulica / numer)</Label>
                      <Input
                        value={regForm.address}
                        onChange={(e) => updateReg("address", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Miasto</Label>
                      <Input
                        value={regForm.city}
                        onChange={(e) => updateReg("city", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Hasło</Label>
                        <Input
                          required
                          type="password"
                          value={regForm.password}
                          onChange={(e) => updateReg("password", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Powtórz hasło</Label>
                        <Input
                          required
                          type="password"
                          value={regForm.confirmPassword}
                          onChange={(e) => updateReg("confirmPassword", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Rejestracja..." : "Zarejestruj się"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
