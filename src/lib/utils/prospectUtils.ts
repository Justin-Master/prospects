import type { Prospect } from '@/types';

export const formatWhatsAppLink = (phone: string, name: string) => {
  // Remove non-numeric characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const message = encodeURIComponent(`Bonjour ${name}, je vous contacte suite à notre rencontre.`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

export const exportToCSV = (prospects: Prospect[]) => {
  const headers = ['Nom', 'Téléphone', 'Quartier', 'Description', 'Latitude', 'Longitude', 'Niveau d\'intérêt', 'Rendez-vous', 'Tags', 'Créé le'];
  const rows = prospects.map(p => [
    p.name,
    p.phone,
    p.neighborhood,
    p.description.replace(/\n/g, ' '),
    p.latitude || '',
    p.longitude || '',
    p.interestLevel,
    p.appointmentDate ? p.appointmentDate.toLocaleString() : '',
    p.tags.join(', '),
    p.createdAt.toLocaleString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `prospects_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
