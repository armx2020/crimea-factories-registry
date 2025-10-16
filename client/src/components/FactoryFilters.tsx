import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Factory, Network } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface FactoryFiltersProps {
  factories: Factory[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  cities: string[];
  networks: string[];
}

export function FactoryFilters({ factories, onFilterChange }: FactoryFiltersProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);

  const { data: networks = [] } = useQuery<Network[]>({
    queryKey: ["/api/networks"],
  });

  const cityStats = useMemo(() => {
    const stats = new Map<string, number>();
    factories.forEach((factory) => {
      const city = factory.city;
      if (city && city.trim() !== "") {
        stats.set(city, (stats.get(city) || 0) + 1);
      }
    });
    return Array.from(stats.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [factories]);

  const networkStats = useMemo(() => {
    const stats = new Map<string, { name: string; count: number }>();
    
    factories.forEach((factory) => {
      if (factory.networkId) {
        const network = networks.find(n => n.id === factory.networkId);
        if (network) {
          const existing = stats.get(factory.networkId);
          stats.set(factory.networkId, {
            name: network.name,
            count: (existing?.count || 0) + 1,
          });
        }
      }
    });
    
    return Array.from(stats.entries())
      .map(([id, { name, count }]) => ({ id, name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [factories, networks]);

  const handleCityToggle = (city: string) => {
    const newCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];
    
    setSelectedCities(newCities);
    onFilterChange({
      cities: newCities,
      networks: selectedNetworks,
    });
  };

  const handleNetworkToggle = (networkId: string) => {
    const newNetworks = selectedNetworks.includes(networkId)
      ? selectedNetworks.filter(n => n !== networkId)
      : [...selectedNetworks, networkId];
    
    setSelectedNetworks(newNetworks);
    onFilterChange({
      cities: selectedCities,
      networks: newNetworks,
    });
  };

  const handleReset = () => {
    setSelectedCities([]);
    setSelectedNetworks([]);
    onFilterChange({
      cities: [],
      networks: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Города
        </Label>
        <div className="space-y-2">
          {cityStats.map(({ city, count }) => (
            <div
              key={city}
              className="flex items-center justify-between gap-2"
              data-testid={`city-filter-${city}`}
            >
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  id={`city-${city}`}
                  checked={selectedCities.includes(city)}
                  onCheckedChange={() => handleCityToggle(city)}
                  data-testid={`checkbox-city-${city}`}
                />
                <label
                  htmlFor={`city-${city}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {city}
                </label>
              </div>
              <span className="text-sm text-muted-foreground font-mono">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {networkStats.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Сети
          </Label>
          <div className="space-y-2">
            {networkStats.map(({ id, name, count }) => (
              <div
                key={id}
                className="flex items-center justify-between gap-2"
                data-testid={`network-filter-${id}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Checkbox
                    id={`network-${id}`}
                    checked={selectedNetworks.includes(id)}
                    onCheckedChange={() => handleNetworkToggle(id)}
                    data-testid={`checkbox-network-${id}`}
                  />
                  <label
                    htmlFor={`network-${id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {name}
                  </label>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={handleReset}
        className="w-full"
        data-testid="button-reset-filters"
      >
        <X className="h-4 w-4 mr-2" />
        Сбросить фильтры
      </Button>
    </div>
  );
}
