import { useState, useEffect } from "react";
import {
  fetchOrganization,
  updateOrganization,
  uploadOrganizationLogo,
  deleteOrganizationLogo,
  OrganizationForm,
} from "@/services/organizationService";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [form, setForm] = useState<OrganizationForm>({
    name: "",
    website: "",
    contact_email: "",
    phone: "",
    address: "",
    city: "",
    nip_krs: "",
    logo_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const data = await fetchOrganization();
        setForm(data);
      } catch (err) {
        toast({
          title: "Błąd",
          description: getErrorMessage(err, "Nie udało się pobrać danych organizacji"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, []);

  const update = (field: keyof OrganizationForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateOrganization(form);

      toast({
        title: "Zapisano zmiany",
        description: "Dane organizacji zostały zaktualizowane.",
      });
    } catch (err) {
      toast({
        title: "Błąd zapisu",
        description: getErrorMessage(err, "Nie udało się zapisać zmian"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Ładowanie danych organizacji...</div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Card className="shadow-2xl border border-gray-800/20 rounded-2xl">
        <CardHeader className="px-6 py-5">
          <CardTitle>Ustawienia organizacji</CardTitle>
          <CardDescription>
            Zarządzaj informacjami swojej organizacji
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Nazwa organizacji</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Strona internetowa</Label>
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email kontaktowy</Label>
                <Input
                  type="email"
                  required
                  value={form.contact_email}
                  onChange={(e) => update("contact_email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Miasto</Label>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Adres</Label>
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>NIP / KRS</Label>
                <Input
                  value={form.nip_krs}
                  onChange={(e) => update("nip_krs", e.target.value)}
                />
              </div>

             <div className="space-y-2">
              <Label>Logo organizacji</Label>

              {form.logo_url && (
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/organizations/${form.id}/iq_logo.png`}
                    alt="Logo"
                    className="h-24 object-contain rounded-lg border shadow bg-white p-2"
                  />


                  <Button
                    type="button"
                    variant="destructive"
                    onClick={async () => {
                      await deleteOrganizationLogo();
                      update("logo_url", "");
                      toast({ title: "Usunięto logo" });
                    }}
                  >
                    Usuń
                  </Button>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const { logo_url } = await uploadOrganizationLogo(file);

                  update("logo_url", logo_url);
                  toast({ title: "Logo zaktualizowane" });
                }}
              />
            </div>


            </div>

            <div className="mt-2">
              <Button
                type="submit"
                className="w-full mt-2 bg-orange-500 hover:bg-orange-600 shadow-xl"
                disabled={saving}
              >
                {saving ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
