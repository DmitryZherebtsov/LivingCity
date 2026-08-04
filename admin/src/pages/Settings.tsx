import { useEffect, useState } from "react";
import { Save, Trash2, User, Mail, Image as ImgIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMyProfile, updateMyProfile, deleteMyAccount, MyProfile } from "@/services/profileService";
import { cn, getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [userSettings, setUser] = useState<MyProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  const isAdmin = role === "admin";
  const isModerator = role === "moderator";

  const { toast } = useToast();



  useEffect(() => {
    (async () => {
      try {
        const profile = await fetchMyProfile();
        setUser(profile);
        setName(profile.name || "");
        setEmail(profile.email || "");
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    })();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (profileFile) fd.append("profile_image", profileFile);

      await updateMyProfile(fd);

      toast({
        title: "Profil zaktualizowany",
        description: "Twoje dane zostały zapisane pomyślnie.",
      });

    } catch (err) {
      console.error(err);

      toast({
        title: "Błąd aktualizacji",
        description: getErrorMessage(err, "Nie udało się zaktualizować profilu."),
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Podaj hasło aby usunąć konto:");
    if (!password) return;

    try {
      await deleteMyAccount(password);

      toast({
        title: "Konto usunięte",
        description: "Twoje konto zostało trwale usunięte.",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch (err) {
      console.error(err);

      toast({
        title: "Nie udało się usunąć konta",
        description: getErrorMessage(err, "Spróbuj ponownie później."),
        variant: "destructive",
      });
    }
  };


  const isAdminEmail = user?.email?.toLowerCase() === "admin@example.com";

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <h1 className="page-header">Ustawienia konta</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dane profilu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="space-y-2">
            <Label>Imię</Label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zdjęcie profilowe</Label>
            <div className="flex items-center gap-2">
              <ImgIcon className="w-4 h-4" />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            className={cn(
              "text-white",
              isAdmin && "", 
              isModerator && "bg-green-600 hover:bg-green-700"
            )}>
            <Save className="w-4 h-4 mr-2" />
            Zapisz zmiany
          </Button>

        </CardContent>
      </Card>

    {!isAdminEmail ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Usuwanie konta</CardTitle>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń konto
            </Button>

        </CardContent>
      </Card>
      ) : null}

    </div>
  );
}
