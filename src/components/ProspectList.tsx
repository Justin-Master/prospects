import React, { useState } from 'react';
import { Search, ArrowUpDown, Filter } from 'lucide-react';
import type { Prospect, SortField, SortOrder } from '@/types';
import { ProspectCard } from '@/components/ProspectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProspectListProps {
  prospects: Prospect[];
  onEdit: (prospect: Prospect) => void;
  onDelete: (id: number) => void;
  onView: (prospect: Prospect) => void;
}

export function ProspectList({ prospects, onEdit, onDelete, onView }: ProspectListProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredProspects = prospects
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'neighborhood') {
        comparison = a.neighborhood.localeCompare(b.neighborhood);
      } else if (sortField === 'interestLevel') {
        comparison = a.interestLevel - b.interestLevel;
      } else if (sortField === 'createdAt') {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher..."
            className="pl-9 bg-gray-50 border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 border-gray-200">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Trier par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <DropdownMenuRadioItem value="createdAt">Date d'ajout</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="neighborhood">Quartier</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="interestLevel">Niveau d'intérêt</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Ordre</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
              <DropdownMenuRadioItem value="asc">Croissant</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">Décroissant</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredProspects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Aucun prospect trouvé.</p>
        </div>
      ) : (
        <div className="grid gap-4 pb-20">
          {filteredProspects.map((prospect, index) => (
            <ProspectCard
              key={prospect.id || index}
              prospect={prospect}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
