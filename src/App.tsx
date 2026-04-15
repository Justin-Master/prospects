import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Users, 
  Map as MapIcon, 
  Plus, 
  Download, 
  Bell, 
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';
import { db } from './lib/db';
import type { Prospect } from './types';
import { ProspectList } from '@/components/ProspectList';
import { ProspectForm } from '@/components/ProspectForm';
import { MapView } from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Toaster, toast } from 'sonner';
import { exportToCSV } from './lib/utils/prospectUtils';
import { motion, AnimatePresence } from 'motion/react';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function App() {
  const prospects = useLiveQuery(() => db.prospects.toArray()) || [];
  const [activeTab, setActiveTab] = useState('list');
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [viewingProspect, setViewingProspect] = useState<Prospect | null>(null);
  const [prospectToDelete, setProspectToDelete] = useState<number | null>(null);

  // Check for upcoming appointments
  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      const oneHourLater = addHours(now, 1);
      
      prospects.forEach(p => {
        if (p.appointmentDate) {
          const apptDate = new Date(p.appointmentDate);
          if (isAfter(apptDate, now) && isBefore(apptDate, oneHourLater)) {
            toast.info(`Rappel: Rendez-vous avec ${p.name} dans moins d'une heure !`, {
              description: format(apptDate, "HH:mm", { locale: fr }),
              duration: 10000,
            });
          }
        }
      });
    };

    const interval = setInterval(checkAppointments, 60000 * 5); // Check every 5 mins
    checkAppointments();
    return () => clearInterval(interval);
  }, [prospects.length]);

  const handleAddProspect = async (data: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProspect?.id) {
        await db.prospects.update(editingProspect.id, {
          ...data,
          updatedAt: new Date(),
        });
        toast.success("Prospect mis à jour !");
      } else {
        await db.prospects.add({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.success("Prospect ajouté avec succès !");
      }
      setIsAdding(false);
      setEditingProspect(null);
      setActiveTab('list');
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue.");
    }
  };

  const handleDeleteProspect = (id: number) => {
    setProspectToDelete(id);
  };

  const confirmDelete = async () => {
    if (prospectToDelete !== null) {
      await db.prospects.delete(prospectToDelete);
      toast.success("Prospect supprimé.");
      setProspectToDelete(null);
      if (viewingProspect?.id === prospectToDelete) {
        setViewingProspect(null);
      }
    }
  };

  const handleExport = () => {
    if (prospects.length === 0) {
      toast.error("Aucun prospect à exporter.");
      return;
    }
    exportToCSV(prospects);
    toast.success("Exportation réussie !");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 sticky top-0 z-30 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-lg">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Prospéctor</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-blue-600"
            onClick={handleExport}
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-blue-600"
            onClick={() => setActiveTab('reminders')}
          >
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        <AnimatePresence mode="wait">
          {isAdding || editingProspect ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditingProspect(null); }}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold text-blue-900">
                  {editingProspect ? "Modifier le prospect" : "Nouveau prospect"}
                </h2>
              </div>
              <ProspectForm 
                initialData={editingProspect || undefined} 
                onSubmit={handleAddProspect} 
                onCancel={() => { setIsAdding(false); setEditingProspect(null); }} 
              />
            </motion.div>
          ) : viewingProspect ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
               <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="icon" onClick={() => setViewingProspect(null)}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold text-blue-900">Détails du prospect</h2>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-blue-900">{viewingProspect.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Users key={i} className={`w-4 h-4 ${i < viewingProspect.interestLevel ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Téléphone</p>
                    <p className="font-medium text-blue-700">{viewingProspect.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quartier</p>
                    <p className="font-medium text-blue-700">{viewingProspect.neighborhood}</p>
                  </div>
                </div>

                {viewingProspect.appointmentDate && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Rendez-vous</p>
                    <p className="font-bold text-blue-800">
                      {format(viewingProspect.appointmentDate, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</p>
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {viewingProspect.description || "Aucune description fournie."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {viewingProspect.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-blue-600"
                    onClick={() => { setEditingProspect(viewingProspect); setViewingProspect(null); }}
                  >
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => { handleDeleteProspect(viewingProspect.id!); }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="list">
                  <ProspectList 
                    prospects={prospects} 
                    onEdit={setEditingProspect} 
                    onDelete={handleDeleteProspect}
                    onView={setViewingProspect}
                  />
                </TabsContent>
                
                <TabsContent value="map">
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-blue-900">Carte des prospects</h2>
                    <MapView prospects={prospects} />
                  </div>
                </TabsContent>

                <TabsContent value="reminders">
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-blue-900">Rappels de rendez-vous</h2>
                    <div className="space-y-3">
                      {prospects
                        .filter(p => p.appointmentDate && isAfter(new Date(p.appointmentDate), new Date()))
                        .sort((a, b) => new Date(a.appointmentDate!).getTime() - new Date(b.appointmentDate!).getTime())
                        .map(p => (
                          <div key={p.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex justify-between items-center">
                            <div>
                              <p className="font-bold text-blue-900">{p.name}</p>
                              <p className="text-sm text-blue-600">
                                {format(new Date(p.appointmentDate!), "d MMM 'à' HH:mm", { locale: fr })}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setViewingProspect(p)}>
                              Voir
                            </Button>
                          </div>
                        ))}
                      {prospects.filter(p => p.appointmentDate && isAfter(new Date(p.appointmentDate), new Date())).length === 0 && (
                        <p className="text-center py-10 text-slate-400">Aucun rendez-vous à venir.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {!isAdding && !editingProspect && !viewingProspect && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn("flex flex-col items-center gap-1", activeTab === 'list' ? "text-blue-600" : "text-slate-400")}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Liste</span>
          </button>
          
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-lg border-4 border-slate-50 active:scale-95 transition-transform"
          >
            <Plus className="w-8 h-8" />
          </button>

          <button 
            onClick={() => setActiveTab('map')}
            className={cn("flex flex-col items-center gap-1", activeTab === 'map' ? "text-blue-600" : "text-slate-400")}
          >
            <MapIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Carte</span>
          </button>
        </nav>
      )}

      <Dialog open={prospectToDelete !== null} onOpenChange={(open) => !open && setProspectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le prospect</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce prospect ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProspectToDelete(null)}>Annuler</Button>
            <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
