import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import type { Prospect } from '@/types';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, Crosshair, Map as MapIcon, Star } from 'lucide-react';
import { formatWhatsAppLink } from '@/lib/utils/prospectUtils';

// Custom icons based on interest level
const createCustomIcon = (interestLevel: number) => {
  let color = '#ef4444'; // Red for low interest (1-2)
  if (interestLevel === 3) color = '#f59e0b'; // Amber for medium (3)
  if (interestLevel >= 4) color = '#22c55e'; // Green for high (4-5)

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${interestLevel}</div>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to handle map bounds and centering
function MapController({ prospects, userLocation }: { prospects: Prospect[], userLocation: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (prospects.length > 0) {
      const bounds = L.latLngBounds(prospects.map(p => [p.latitude!, p.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [prospects, map]);

  return null;
}

interface MapViewProps {
  prospects: Prospect[];
}

export function MapView({ prospects }: MapViewProps) {
  const prospectsWithLocation = prospects.filter(p => p.latitude !== null && p.longitude !== null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Default center (Lomé, Togo)
  const defaultCenter: [number, number] = [6.1375, 1.2125];

  return (
    <div className="h-[calc(100vh-180px)] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative group">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController prospects={prospectsWithLocation} userLocation={userLocation} />

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
        >
          {prospectsWithLocation.map(prospect => (
            <Marker 
              key={prospect.id} 
              position={[prospect.latitude!, prospect.longitude!]}
              icon={createCustomIcon(prospect.interestLevel)}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">{prospect.name}</h3>
                      <p className="text-xs text-blue-600 font-medium">{prospect.neighborhood}</p>
                    </div>
                    <div className="flex items-center bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 text-[10px] font-bold">
                      <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />
                      {prospect.interestLevel}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 italic">
                    {prospect.description || "Pas de description"}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-[11px] border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => window.location.href = `tel:${prospect.phone}`}
                    >
                      <Phone className="w-3 h-3 mr-1.5" /> Appeler
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 text-[11px] bg-green-600 hover:bg-green-700 text-white border-none"
                      onClick={() => window.open(formatWhatsAppLink(prospect.phone, prospect.name), '_blank')}
                    >
                      <MessageSquare className="w-3 h-3 mr-1.5" /> WhatsApp
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {userLocation && (
          <Marker 
            position={userLocation} 
            icon={L.divIcon({
              html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
              className: '',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          />
        )}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button
          size="icon"
          variant="secondary"
          className="bg-white shadow-md hover:bg-gray-50 rounded-full w-10 h-10 border border-gray-100"
          onClick={handleLocateMe}
          disabled={isLocating}
        >
          <Crosshair className={`w-5 h-5 text-gray-700 ${isLocating ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {prospectsWithLocation.length === 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center text-center p-8">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <MapIcon className="w-8 h-8 text-blue-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Carte vide</h4>
          <p className="text-gray-600 max-w-[240px]">
            Aucun prospect avec localisation GPS trouvé. Capturez la position lors de l'ajout d'un prospect pour les voir ici.
          </p>
        </div>
      )}
    </div>
  );
}
