import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  url: string;
  organizer: string;
  address: string;
  city: string;
  lat: string;
  lon: string;
  start_time: string;
  end_time: string;
  capacity: string;
  is_free: boolean;
}

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<EventFormData>({
    title: "",
    description: "",
    event_type: "",
    url: "",
    organizer: "",
    address: "",
    city: "",
    lat: "",
    lon: "",
    start_time: "",
    end_time: "",
    capacity: "",
    is_free: true,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (checked: boolean) => {
    setForm((prev) => ({ ...prev, is_free: checked }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/events", {
        ...form,
        lat: form.lat ? Number(form.lat) : null,
        lon: form.lon ? Number(form.lon) : null,
        capacity: form.capacity ? Number(form.capacity) : null,
        metadata: {},
      });

      toast({
        title: "Wydarzenie wysłane do zatwierdzenia",
        description: "Administrator musi zatwierdzić wydarzenie przed publikacją.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Błąd",
        description:
          error?.response?.data?.message ||
          "Nie udało się utworzyć wydarzenia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Utwórz nowe wydarzenie</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Nazwa wydarzenia</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Opis</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Typ wydarzenia</Label>
              <Input
                name="event_type"
                value={form.event_type}
                onChange={handleChange}
                placeholder="np. sport, koncert, konferencja"
              />
            </div>

            <div>
              <Label>Strona internetowa (URL)</Label>
              <Input
                name="url"
                value={form.url}
                onChange={handleChange}
                type="url"
              />
            </div>

            <div>
              <Label>Organizator</Label>
              <Input
                name="organizer"
                value={form.organizer}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Adres</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Miasto</Label>
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Szerokość geograficzna (Lat)</Label>
                <Input
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  type="number"
                  step="any"
                  required
                />
              </div>
              <div>
                <Label>Długość geograficzna (Lon)</Label>
                <Input
                  name="lon"
                  value={form.lon}
                  onChange={handleChange}
                  type="number"
                  step="any"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data rozpoczęcia</Label>
                <Input
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Data zakończenia</Label>
                <Input
                  type="datetime-local"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Liczba miejsc</Label>
              <Input
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                type="number"
                min="0"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_free}
                onCheckedChange={handleSwitch}
                className="data-[state=checked]:bg-orange-600"/>

              <Label>Wydarzenie bezpłatne</Label>
            </div>

            <Button disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium">
                {loading ? "Wysyłanie..." : "Wyślij do zatwierdzenia"}
            </Button>


          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventPage;
