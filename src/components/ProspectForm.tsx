import React, { useState, useEffect } from 'react';
import { MapPin, Star, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import type { Prospect } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProspectFormProps {
  initialData?: Prospect;
  onSubmit: (data: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProspectForm({ initialData, onSubmit, onCancel }: ProspectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [interestLevel, setInterestLevel] = useState(initialData?.interestLevel || 3);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(initialData?.appointmentDate || undefined);
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);
  const [tags, setTags] = useState(initialData?.tags.join(', ') || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);
        toast.success("Position capturée !");
      },
      (error) => {
        console.error(error);
        toast.error("Impossible de récupérer votre position.");
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !neighborhood) {
      toast.error("Veuillez remplir les champs obligatoires (Nom, Téléphone, Quartier).");
      return;
    }

    onSubmit({
      name,
      phone,
      neighborhood,
      description,
      interestLevel,
      appointmentDate: appointmentDate || null,
      latitude,
      longitude,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-20">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Jean Dupont" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone *</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +228 90 00 00 00" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="neighborhood">Quartier *</Label>
        <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ex: Adidogomé" />
      </div>

      <div className="space-y-2">
        <Label>Niveau d'intérêt</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setInterestLevel(level)}
              className="focus:outline-none"
            >
              <Star
                className={cn(
                  "w-8 h-8 transition-colors",
                  level <= interestLevel ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Localisation GPS</Label>
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="flex-1"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {latitude ? "Mettre à jour la position" : "Capturer ma position"}
          </Button>
          {latitude && (
            <div className="text-[10px] text-gray-500 font-mono">
              {latitude.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Date de rendez-vous</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !appointmentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {appointmentDate ? format(appointmentDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={appointmentDate}
              onSelect={setAppointmentDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
        <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex: Urgent, VIP, Nouveau" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description / Notes</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Notes libres sur le prospect..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex gap-3 pt-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
