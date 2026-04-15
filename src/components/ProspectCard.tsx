import React from 'react';
import { Star, Phone, MessageSquare, MapPin, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Prospect } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatWhatsAppLink } from '@/lib/utils/prospectUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProspectCardProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: number) => void;
  onView: (prospect: Prospect) => void;
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onEdit, onDelete, onView }) => {
  const renderStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(prospect)}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
        <div className="flex-1">
          <CardTitle className="text-lg font-bold text-blue-900">{prospect.name}</CardTitle>
          <div className="flex items-center mt-1 space-x-1">
            {renderStars(prospect.interestLevel)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger 
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(prospect); }}>
              <Edit2 className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={(e) => { e.stopPropagation(); if (prospect.id) onDelete(prospect.id); }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="w-4 h-4 mr-2 text-blue-500" />
          {prospect.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
          {prospect.neighborhood}
        </div>
        {prospect.appointmentDate && (
          <div className="flex items-center text-sm font-medium text-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            {format(prospect.appointmentDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-2">
          {prospect.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `tel:${prospect.phone}`;
          }}
        >
          <Phone className="w-4 h-4 mr-2" /> Appeler
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 bg-green-600 hover:bg-green-700"
          onClick={(e) => {
            e.stopPropagation();
            window.open(formatWhatsAppLink(prospect.phone, prospect.name), '_blank');
          }}
        >
          <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
        </Button>
      </CardFooter>
    </Card>
  );
}
