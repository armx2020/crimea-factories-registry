import { Factory } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Factory as FactoryIcon } from "lucide-react";

interface FactoryCardProps {
  factory: Factory;
  onView: (factory: Factory) => void;
}

export function FactoryCard({ factory, onView }: FactoryCardProps) {
  const photos = [factory.photo1, factory.photo2, factory.photo3].filter(Boolean);
  
  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer" 
      data-testid={`card-factory-${factory.id}`}
      onClick={() => onView(factory)}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 shrink-0">
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5 h-32 sm:h-full bg-muted">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${photo})` }}
                />
              ))}
              {photos.length < 3 && Array.from({ length: 3 - photos.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className="w-full h-full bg-muted flex items-center justify-center">
                  <FactoryIcon className="h-6 w-6 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 sm:h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <FactoryIcon className="h-12 w-12 text-primary/30" />
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-4 space-y-2">
          <div>
            <h3 className="text-lg font-semibold leading-tight" data-testid={`text-factory-name-${factory.id}`}>
              {factory.name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span data-testid={`text-factory-city-${factory.id}`}>{factory.city}</span>
              <span className="mx-1">•</span>
              <span data-testid={`text-factory-model-${factory.id}`}>{factory.model}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" data-testid={`badge-capacity-${factory.id}`}>
              <span className="font-mono">{factory.capacity}</span>
              <span className="ml-1">м³/ч</span>
            </Badge>
            <Badge variant="secondary" data-testid={`badge-output-${factory.id}`}>
              <span className="font-mono">{factory.yearlyOutput}</span>
              <span className="ml-1">м³/год</span>
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-description-${factory.id}`}>
            {factory.description}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
