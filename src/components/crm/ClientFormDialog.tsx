
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCrm } from "@/lib/crm/store";
import { Btn, Field, TextInput, SelectInput } from "./kit";

const SERVICES = [
  "Gestion mensuelle Google Ads",
  "Audit Google Ads – Consultation stratégique (1h)",
  "Gestion des réseaux sociaux (2027)",
];

export function ClientFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { update } = useCrm();

  const [company, setCompany] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [siret, setSiret] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("prospect");
  const [services, setServices] = useState<string[]>([]);

  const toggleService = (service: string) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service]
    );
  };

  const resetForm = () => {
    setCompany("");
    setFirstName("");
    setLastName("");
    setRole("");
    setEmail("");
    setPhone("");
    setSiret("");
    setWebsite("");
    setStatus("prospect");
    setServices([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim() || !firstName.trim() ||
        !lastName.trim() || !email.trim()) return;

    const id = `${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const contact = `${firstName.trim()} ${lastName.trim()}`;

    update((d) => ({
      ...d,
      clients: [
        {
          id,
          name: company.trim(),
          legalName: company.trim(),
          contact,
          representative: contact,
          contactRole: role,
          email: email.trim(),
          phone: phone.trim(),
          siret: siret.trim(),
          address: "",
          website: website.trim(),
          links: { ads: "", looker: "", drive: "" },
          status: status as "prospect" | "audit" | "onboarding" | "actif" | "pause",
          formule: services.join(", ") || "—",
          channel: services.includes(SERVICES[2]) ? "social" : "google",
          budgets: {
            search: 0,
            pmax: 0,
            shopping: 0,
            display: 0,
            demandgen: 0,
            remarketing: 0,
          },
          fee: 0,
          contract: null,
          notes: [],
          appointments: [],
          tasks: [],
          emails: [],
          createdAt: new Date().toISOString(),
        },
        ...d.clients,
      ],
    }));

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">

          {/* ENTREPRISE */}
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold">Informations entreprise</h3>

            <Field label="Nom de l'entreprise *">
              <TextInput
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nom de l'entreprise"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="SIRET">
                <TextInput
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="14 chiffres"
                />
              </Field>

              <Field label="Site internet">
                <TextInput
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.exemple.fr"
                />
              </Field>
            </div>
          </section>

          <div className="border-t border-border" />

          {/* CONTACT */}
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold">Contact principal</h3>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prénom *">
                <TextInput
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  required
                />
              </Field>

              <Field label="Nom *">
                <TextInput
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  required
                />
              </Field>
            </div>

            <Field label="Fonction">
              <TextInput
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex. Directeur marketing"
              />
            </Field>

            <Field label="Email professionnel *">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@entreprise.fr"
                required
              />
            </Field>

            <Field label="Téléphone">
              <TextInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+33 6..."
              />
            </Field>
          </section>

          <div className="border-t border-border" />

          {/* COMMERCIAL */}
          <section className="grid gap-3">
            <h3 className="text-sm font-semibold">Informations commerciales</h3>

            <Field label="Statut du client">
              <SelectInput
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="prospect">Prospect</option>
                <option value="audit">En audit</option>
                <option value="onboarding">En onboarding</option>
                <option value="actif">Client actif</option>
                <option value="pause">En pause</option>
              </SelectInput>
            </Field>

            <Field label="Prestations souhaitées">
              <div className="grid gap-2">
                {SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(service)}
                      onChange={() => toggleService(service)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Plusieurs prestations peuvent être sélectionnées.
              </span>
            </Field>
          </section>

          <Btn type="submit" className="w-full">
            Ajouter le client
          </Btn>
        </form>
      </DialogContent>
    </Dialog>
  );
}
