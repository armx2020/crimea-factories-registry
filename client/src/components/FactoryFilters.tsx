import { useState, useMemo } from "react";
import { Factory } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface FactoryFiltersProps {
  factories: Factory[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  cities: string[];
  minCapacity: number;
  maxCapacity: number;
}

export function FactoryFilters({ factories, onFilterChange }: FactoryFiltersProps) {
  const capacities = factories.map(f => f.capacity);
  const minCap = Math.min(...capacities, 0);
  const maxCap = Math.max(...capacities, 1000);

  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [capacityRange, setCapacityRange] = useState<[number, number]>([minCap, maxCap]);

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

  const handleCityToggle = (city: string) => {
    const newCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];
    
    setSelectedCities(newCities);
    onFilterChange({
      cities: newCities,
      minCapacity: capacityRange[0],
      maxCapacity: capacityRange[1],
    });
  };

  const handleCapacityChange = (values: number[]) => {
    const range: [number, number] = [values[0], values[1]];
    setCapacityRange(range);
    onFilterChange({
      cities: selectedCities,
      minCapacity: range[0],
      maxCapacity: range[1],
    });
  };

  const handleReset = () => {
    setSelectedCities([]);
    setCapacityRange([minCap, maxCap]);
    onFilterChange({
      cities: [],
      minCapacity: minCap,
      maxCapacity: maxCap,
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

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Мощность (м³/ч)
        </Label>
        <div className="pt-2">
          <Slider
            min={minCap}
            max={maxCap}
            step={10}
            value={capacityRange}
            onValueChange={handleCapacityChange}
            data-testid="slider-capacity"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground font-mono">
          <span data-testid="text-min-capacity">{capacityRange[0]}</span>
          <span data-testid="text-max-capacity">{capacityRange[1]}</span>
        </div>
      </div>

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
