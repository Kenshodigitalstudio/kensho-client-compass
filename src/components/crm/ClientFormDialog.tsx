import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrm } from "@/lib/crm/store";
import { Btn, Field, TextInput } from "./kit";

export function ClientFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { update } = useCrm();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
            update((d) => ({
              ...d,
              clients: [
                { id, name, legalName: name, contact, representative: contact, email, phone: "", siret: "", address: "", website: "",
                  links: { ads: "", looker: "", drive: "" }, status: "prospect", formule: "—", channel: "google",
                  budgets: { search: 0, pmax: 0, shopping: 0, display: 0, demandgen: 0, remarketing: 0 }, fee: 0, contract: null,
                  notes: [], appointments: [], tasks: [], emails: [], createdAt: new Date().toISOString() },
                ...d.clients,
              ],
            }));
            setName(""); setContact(""); setEmail(""); onOpenChange(false);
          }}
        >
          <Field label="Entreprise"><TextInput value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Contact principal"><TextInput value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
          <Field label="Email"><TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Btn type="submit">Ajouter le client</Btn>
        </form>
      </DialogContent>
    </Dialog>
  );
}
