import { useEffect, useRef } from "react";
import { Factory } from "@shared/schema";
import { CITY_COORDINATES } from "@shared/cityCoordinates";
import L from "leaflet";

interface FactoryMapProps {
  factories: Factory[];
  onFactoryClick: (factory: Factory) => void;
}

export function FactoryMap({ factories, onFactoryClick }: FactoryMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([44.9572, 34.1108], 9);
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, Maxar, Earthstar Geographics'
    });

    const baseMaps = {
      "Карта": osmLayer,
      "Спутник": satelliteLayer
    };

    osmLayer.addTo(map);

    L.control.layers(baseMaps).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const factoriesWithCoords = factories.map(factory => {
      let lat: number | null = null;
      let lng: number | null = null;

      if (factory.latitude && factory.longitude) {
        lat = parseFloat(factory.latitude);
        lng = parseFloat(factory.longitude);
      } else if (factory.city && CITY_COORDINATES[factory.city]) {
        lat = CITY_COORDINATES[factory.city].lat;
        lng = CITY_COORDINATES[factory.city].lng;
      }

      return { factory, lat, lng };
    }).filter(item => item.lat !== null && item.lng !== null);

    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    factoriesWithCoords.forEach(({ factory, lat, lng }) => {
      const marker = L.marker([lat!, lng!], { icon })
        .bindTooltip(factory.name, {
          permanent: true,
          direction: 'top',
          className: 'factory-label',
          offset: [0, -35]
        })
        .bindPopup(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-base mb-1">${factory.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${factory.city}</p>
            <div class="flex gap-2 text-xs">
              <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${factory.capacity} м³/ч</span>
            </div>
          </div>
        `)
        .on('click', () => onFactoryClick(factory))
        .addTo(mapRef.current!);
    });

    if (factoriesWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        factoriesWithCoords.map(({ lat, lng }) => [lat!, lng!])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [factories, onFactoryClick]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full min-h-[500px] rounded-md"
      data-testid="map-factories"
    />
  );
}
