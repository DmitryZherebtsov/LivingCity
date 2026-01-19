import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { fetchEventById, updateEvent } from "@/services/tableManage";

type Props = {
  eventId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export function EditEventModal({ eventId, open, onClose, onUpdated }: Props) {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId && open) {
      fetchEventById(eventId).then(setForm);
    }
  }, [eventId, open]);

  if (!form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await updateEvent(eventId!, form);
    setLoading(false);
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
          <Input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" />
          <Input name="event_type" value={form.event_type} onChange={handleChange} placeholder="Event type" />
          <Input name="city" value={form.city ?? ""} onChange={handleChange} placeholder="City" />
          <Input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
          <Input name="url" value={form.url} onChange={handleChange} placeholder="URL" />
          <Input name="lat" value={form.lat} onChange={handleChange} placeholder="Latitude" />
          <Input name="lon" value={form.lon} onChange={handleChange} placeholder="Longitude" />

          <Input
            type="datetime-local"
            name="start_time"
            value={form.start_time?.slice(0, 16)}
            onChange={handleChange}
          />

          <Input
            type="datetime-local"
            name="end_time"
            value={form.end_time?.slice(0, 16)}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
