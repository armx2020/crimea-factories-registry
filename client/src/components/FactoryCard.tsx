import { Factory } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Pencil, Trash2, Factory as FactoryIcon } from "lucide-react";

interface FactoryCardProps {
  factory: Factory;
  onView: (factory: Factory) => void;
  onEdit: (factory: Factory) => void;
  onDelete: (factory: Factory) => void;
}

export function FactoryCard({ factory, onView, onEdit, onDelete }: FactoryCardProps) {
  const photos = [factory.photo1, factory.photo2, factory.photo3].filter(Boolean);
  
  return (
    <Card className="overflow-hidden hover-elevate transition-all" data-testid={`card-factory-${factory.id}`}>
      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 aspect-[3/1] bg-muted">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${photo})` }}
            />
          ))}
          {photos.length < 3 && Array.from({ length: 3 - photos.length }).map((_, idx) => (
            <div key={`empty-${idx}`} className="w-full h-full bg-muted flex items-center justify-center">
              <FactoryIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-[3/1] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <FactoryIcon className="h-16 w-16 text-primary/30" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold leading-tight" data-testid={`text-factory-name-${factory.id}`}>
            {factory.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span data-testid={`text-factory-city-${factory.id}`}>{factory.city}</span>
          <span className="mx-1">•</span>
          <span data-testid={`text-factory-model-${factory.id}`}>{factory.model}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 space-y-3">
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
      
      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="default"
          size="sm"
          onClick={() => onView(factory)}
          className="flex-1"
          data-testid={`button-view-${factory.id}`}
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Просмотр
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(factory)}
          data-testid={`button-edit-${factory.id}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(factory)}
          data-testid={`button-delete-${factory.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
