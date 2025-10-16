import { useState } from "react";
import { Factory } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FactoryFiltersProps {
  factories: Factory[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  city: string;
  minCapacity: number;
  maxCapacity: number;
}

export function FactoryFilters({ factories, onFilterChange }: FactoryFiltersProps) {
  const cities = Array.from(new Set(factories.map(f => f.city).filter(c => c && c.trim() !== ""))).sort();
  const capacities = factories.map(f => f.capacity);
  const minCap = Math.min(...capacities, 0);
  const maxCap = Math.max(...capacities, 1000);

  const [city, setCity] = useState<string>("all");
  const [capacityRange, setCapacityRange] = useState<[number, number]>([minCap, maxCap]);

  const handleCityChange = (value: string) => {
    setCity(value);
    onFilterChange({
      city: value,
      minCapacity: capacityRange[0],
      maxCapacity: capacityRange[1],
    });
  };

  const handleCapacityChange = (values: number[]) => {
    const range: [number, number] = [values[0], values[1]];
    setCapacityRange(range);
    onFilterChange({
      city,
      minCapacity: range[0],
      maxCapacity: range[1],
    });
  };

  const handleReset = () => {
    setCity("all");
    setCapacityRange([minCap, maxCap]);
    onFilterChange({
      city: "all",
      minCapacity: minCap,
      maxCapacity: maxCap,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="city-filter" className="text-sm font-medium">
          Город
        </Label>
        <Select value={city} onValueChange={handleCityChange}>
          <SelectTrigger id="city-filter" data-testid="select-city-filter">
            <SelectValue placeholder="Все города" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все города</SelectItem>
            {cities.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
