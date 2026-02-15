import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [form, setForm] = useState({
    orgName: "",
    website: "",
    email: "",
    phone: "",
    logoUrl: "",
    fullName: "",
  });

  // Завантажуємо mock-дані з localStorage
  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("mockOrganization") || "null"
    );

    if (stored) {
      setForm(stored);
    }
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Тимчасово зберігаємо в localStorage
    localStorage.setItem(
      "mockOrganization",
      JSON.stringify(form)
    );

    toast({
      title: "Organization updated successfully!",
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                required
                value={form.orgName}
                onChange={(e) => update("orgName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                type="url"
                value={form.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
