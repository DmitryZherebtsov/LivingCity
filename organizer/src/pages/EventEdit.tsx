import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Trash2, Upload } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type ImageItem = {
  id: number | string;
  filename: string;
  position?: number;
};


const mapContainerStyle = { width: "100%", height: "260px" };
const centerDefault = { lat: 52.2297, lng: 21.0122 };

function EventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    status: ""
  });

  const [images, setImages] = useState<ImageItem[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || "" });

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm((p) => ({ ...p, lat: String(lat), lon: String(lng) }));
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/${id}`);
        const data = res.data;
        setForm({
          title: data.title || "",
          description: data.description || "",
          event_type: data.event_type || "other",
          url: data.url || "",
          organizer: data.organizer || "",
          address: data.address || "",
          city: data.city || "",
          lon: data.lon != null ? String(data.lon) : "",
          lat: data.lat != null ? String(data.lat) : "",
          start_time: data.start_time || "",
          end_time: data.end_time || "",
          capacity: data.capacity != null ? String(data.capacity) : "",
          is_free: !!data.is_free,
          metadata: data.metadata || {},
          status: data.status || ""
        });

        setImages(Array.isArray(data.images) ? data.images : []);
      } catch (err: any) {
        toast({ title: "Błąd", description: err?.response?.data?.error || "Nie można pobrać wydarzenia", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const update = (field: string, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        event_type: form.event_type,
        url: form.url || null,
        organizer: form.organizer || null,
        address: form.address || null,
        city: form.city || null,
        lon: form.lon ? parseFloat(form.lon) : null,
        lat: form.lat ? parseFloat(form.lat) : null,
        start_time: form.start_time,
        end_time: form.end_time || form.start_time,
        capacity: form.capacity ? Number(form.capacity) : null,
        is_free: Boolean(form.is_free),
        metadata: form.metadata,
        status: form.status
      };

      await api.patch(`/events/${id}`, payload);
      toast({ title: "Zapisano", description: "Dane wydarzenia zostały zaktualizowane." });
    } catch (err: any) {
      toast({ title: "Błąd zapisu", description: err?.response?.data?.error || "Nie udało się zapisać", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFilesAdd = (files: FileList | null) => {
    if (!files) return;
    setNewFiles((p) => [...p, ...Array.from(files)]);
  };

  const handleUploadFiles = async () => {
    if (!newFiles.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      newFiles.forEach((f) => fd.append("images", f));
      const res = await api.post(`/events/${id}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setImages(res.data.images ?? res.data ?? []);
      setNewFiles([]);
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: "Wgrano", description: "Zdjęcia zostały dodane." });
    } catch (err: any) {
      toast({ title: "Błąd uploadu", description: err?.response?.data?.error || "Nie udało się wgrać", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (img: ImageItem) => {
    if (!confirm("Usunąć zdjęcie?")) return;
    try {
      await api.delete(`/events/images/${img.id}`);
      setImages((p) => p.filter((i) => i.id !== img.id));
      toast({ title: "Usunięto", description: "Zdjęcie usunięto." });
    } catch (err: any) {
      toast({ title: "Błąd", description: err?.response?.data?.error || "Nie można usunąć", variant: "destructive" });
    }
  };

    const handleDeleteEvent = async () => {
    if (!id) return;

    const confirmed = confirm("Czy na pewno chcesz usunąć to wydarzenie?");
    if (!confirmed) return;

    try {
      await api.delete(`/events/${id}`);
      toast({ title: "Usunięto", description: "Wydarzenie zostało usunięte." });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Błąd usuwania",
        description: err?.response?.data?.error || "Nie udało się usunąć wydarzenia",
        variant: "destructive",
      });
    }
  };


  if (loading) return <div className="p-8">Ładowanie wydarzenia...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card className="shadow-2xl border border-gray-800/20 rounded-2xl">
        <CardHeader className="px-6 py-5">
          <CardTitle>Podgląd i edycja wydarzenia</CardTitle>
        </CardHeader>

        <CardContent className="px-6 py-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label>Tytuł</Label>
                <Input required value={form.title} onChange={(e) => update("title", e.target.value)} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Opis</Label>
                <Textarea className="min-h-[120px]" value={form.description} onChange={(e) => update("description", e.target.value)} />
              </div>

              <div>
                <Label>Data start</Label>
                <Input type="datetime-local" value={form.start_time} onChange={(e) => update("start_time", e.target.value)} />
              </div>
              <div>
                <Label>Data koniec</Label>
                <Input type="datetime-local" value={form.end_time} onChange={(e) => update("end_time", e.target.value)} />
              </div>

              <div>
                <Label>Miasto</Label>
                <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <Label>Adres</Label>
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <Label>Pozycja na mapie</Label>
                <div className="rounded-xl overflow-hidden border shadow-lg mt-2">
                  {isLoaded ? (
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={form.lat && form.lon ? { lat: parseFloat(form.lat), lng: parseFloat(form.lon) } : centerDefault} zoom={form.lat ? 14 : 6} onClick={onMapClick}>
                      {form.lat && form.lon && <Marker position={{ lat: parseFloat(form.lat), lng: parseFloat(form.lon) }} />}
                    </GoogleMap>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">Mapa niedostępna</div>
                  )}
                </div>
              </div>

              <div>
                <Label>Longitude (lon)</Label>
                <Input value={form.lon} onChange={(e) => update("lon", e.target.value)} />
              </div>
              <div>
                <Label>Latitude (lat)</Label>
                <Input value={form.lat} onChange={(e) => update("lat", e.target.value)} />
              </div>

              <div>
                <Label>Pojemność</Label>
                <Input type="number" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
              </div>
              <div>
                <Label>Typ</Label>
                <Input value={form.event_type} onChange={(e) => update("event_type", e.target.value)} />
              </div>

              <div>
                <Label>Link</Label>
                <Input value={form.url} onChange={(e) => update("url", e.target.value)} />
              </div>
              <div>
                <Label>Organizator</Label>
                <Input value={form.organizer} onChange={(e) => update("organizer", e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Zdjęcia (istniejące)</Label>
              <div className="flex gap-3 flex-wrap">
                {images.length === 0 && (
                  <div className="text-sm text-muted-foreground">Brak zdjęć</div>
                )}

                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={`${BASE_URL}/${img.filename}`}
                      alt="event"
                      className="h-28 w-44 object-cover rounded-lg shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dodaj nowe zdjęcia</Label>
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handleFilesAdd(e.target.files)} />
                <Button type="button" onClick={handleUploadFiles} disabled={uploading || newFiles.length === 0} className="inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" /> {uploading ? "Wysyłanie..." : `Wgraj (${newFiles.length})`}
                </Button>
              </div>
              {newFiles.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {newFiles.map((f, i) => (
                    <div key={i} className="p-1 bg-white/60 rounded">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="h-20 rounded" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 shadow-xl" disabled={saving}>
                {saving ? "Zapisuję..." : "Zapisz zmiany"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Anuluj</Button>
              <Button type="button" variant="destructive" onClick={handleDeleteEvent}>Usuń wydarzenie</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


export default EventEdit;