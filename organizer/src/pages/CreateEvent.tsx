import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Check, Upload } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type FileWithPreview = {
  file: File;
  preview: string;
};

const mapContainerStyle = {
  width: "100%",
  height: "320px",
};

const centerDefault = { lat: 52.2297, lng: 21.0122 }; 

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "other",
    url: "",
    organizer: "",
    address: "",
    city: "",
    lon: "",
    lat: "",
    start_time: "",
    end_time: "",
    capacity: "",
    is_free: false,
    metadata: {},
  });

  const [firstImage, setFirstImage] = useState<FileWithPreview | null>(null);
  const [otherImages, setOtherImages] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "",
  });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setForm((p) => ({ ...p, lat: String(lat), lon: String(lng) }));
  }, []);

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFirstImage = (f?: File) => {
    if (!f) {
      setFirstImage(null);
      return;
    }
    setFirstImage({ file: f, preview: URL.createObjectURL(f) });
  };

  const handleOtherImagesAdd = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setOtherImages((prev) => [...prev, ...arr]);
  };

  const removeOtherImage = (idx: number) => {
    setOtherImages((p) => {
      URL.revokeObjectURL(p[idx].preview);
      const copy = [...p];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!form.title || !form.start_time || !form.lat || !form.lon) {
      toast({ title: "Błąd", description: "Uzupełnij tytuł, datę i współrzędne.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        url: form.url || null,
        organizer: form.organizer || null,
        address: form.address || null,
        city: form.city || null,
        lon: parseFloat(form.lon),
        lat: parseFloat(form.lat),
        start_time: form.start_time,
        end_time: form.end_time || form.start_time,
        capacity: form.capacity ? Number(form.capacity) : null,
        is_free: Boolean(form.is_free),
        metadata: form.metadata || {},
        status: "pending",
      };

      const res = await api.post("/events", payload);
      const created = res.data;
      const eventId = created.id;

      const filesToUpload: File[] = [];
      if (firstImage) filesToUpload.push(firstImage.file);
      otherImages.forEach((it) => filesToUpload.push(it.file));

      if (filesToUpload.length) {
        const fd = new FormData();

        filesToUpload.forEach((f) => fd.append("images", f));

        await api.post(`/events/${eventId}/images?original_first=true`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      console.log("Created event", created);

      toast({ title: "Wysłano zgłoszenie", description: "Wydarzenie zostało wysłane do zatwierdzenia." });
      navigate("/organizer/waiting", { replace: true });
    } catch (err: any) {
      toast({ title: "Błąd tworzenia wydarzenia", description: err?.response?.data?.error || err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadError) {
    console.warn("Google maps load error", loadError);
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>Stwórz Wydarzenie</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tytuł</Label>
              <Input required value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea required value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data i godzina (początek)</Label>
                <Input type="datetime-local" required value={form.start_time} onChange={(e) => update("start_time", e.target.value)} />
              </div>
              <div>
                <Label>Data i godzina (koniec)</Label>
                <Input type="datetime-local" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Miasto</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <Label>Adres</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>

            <div>
              <Label>Wybierz pozycję na mapie (kliknij aby ustawić) — lub wpisz współrzędne</Label>
              <div className="rounded overflow-hidden border">
                {isLoaded ? (
                  <GoogleMap mapContainerStyle={mapContainerStyle} center={marker ?? centerDefault} zoom={marker ? 14 : 6} onClick={onMapClick}>
                    {marker && <Marker position={marker} />}
                  </GoogleMap>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">Mapa niedostępna — wpisz współrzędne ręcznie.</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Longitude (lon)</Label>
                <Input required value={form.lon} onChange={(e) => update("lon", e.target.value)} placeholder="e.g. 21.0122" />
              </div>
              <div>
                <Label>Latitude (lat)</Label>
                <Input required value={form.lat} onChange={(e) => update("lat", e.target.value)} placeholder="e.g. 52.2297" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pojemność</Label>
                <Input type="number" min="1" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
              </div>
              <div>
                <Label>Typ wydarzenia</Label>
                <Input value={form.event_type} onChange={(e) => update("event_type", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link do wydarzenia (url)</Label>
              <Input value={form.url} onChange={(e) => update("url", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Organizator (nazwa)</Label>
              <Input value={form.organizer} onChange={(e) => update("organizer", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Główne zdjęcie (oryginał, max 10MB)</Label>
              <div className="flex items-center gap-3">
                <input accept="image/*" type="file" onChange={(e) => handleFirstImage(e.target.files?.[0] ?? undefined)} />
                {firstImage && <img src={firstImage.preview} className="h-16 rounded" alt="preview" />}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dodatkowe zdjęcia (przetworzone)</Label>
              <div>
                <input ref={fileInputRef} accept="image/*" type="file" multiple onChange={(e) => handleOtherImagesAdd(e.target.files)} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {otherImages.map((it, idx) => (
                    <div key={idx} className="relative">
                      <img src={it.preview} className="h-16 rounded" alt={`img-${idx}`} />
                      <button type="button" onClick={() => removeOtherImage(idx)} className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button className="inline-flex items-center bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white shadow-md px-4 py-2" type="submit" disabled={loading}>
                <Check className="w-4 h-4 mr-2" />
                {loading ? "Wysyłam..." : "Wyślij do weryfikacji"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;
