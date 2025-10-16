import { Factory } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Factory as FactoryIcon, ExternalLink, Search } from "lucide-react";

interface FactoryCardProps {
  factory: Factory;
  onEdit: (factory: Factory) => void;
}

export function FactoryCard({ factory, onEdit }: FactoryCardProps) {
  const photos = [factory.photo1, factory.photo2, factory.photo3].filter(Boolean);
  
  const getYandexSearchUrl = () => {
    const searchParts = [factory.name, factory.city];
    if (factory.website) {
      searchParts.push(factory.website);
    }
    const searchQuery = searchParts.join(" ");
    return `https://yandex.ru/search/?text=${encodeURIComponent(searchQuery)}`;
  };
  
  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 transition-all cursor-pointer w-full" 
      data-testid={`card-factory-${factory.id}`}
      onClick={() => onEdit(factory)}
    >
      <div className="flex flex-col sm:flex-row w-full">
        <div className="w-full sm:w-48 shrink-0">
          {photos.length > 0 ? (
            <div
              className="h-32 sm:h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${photos[0]})` }}
            />
          ) : (
            <div className="h-32 sm:h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <FactoryIcon className="h-12 w-12 text-primary/30" />
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-3 sm:p-4 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold leading-tight break-words" data-testid={`text-factory-name-${factory.id}`}>
                {factory.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span data-testid={`text-factory-city-${factory.id}`}>{factory.city}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="truncate" data-testid={`text-factory-model-${factory.id}`}>{factory.model}</span>
              </div>
            </div>
            {factory.ranking && factory.ranking > 0 && (
              <Badge variant="default" className="shrink-0" data-testid={`badge-ranking-${factory.id}`}>
                <span>#{factory.ranking}</span>
              </Badge>
            )}
          </div>
          
          {factory.director && (
            <p className="text-xs sm:text-sm text-muted-foreground break-words" data-testid={`text-director-${factory.id}`}>
              <span className="font-medium">Директор:</span> {factory.director}
            </p>
          )}
          
          {factory.inn && (
            <p className="text-xs sm:text-sm text-muted-foreground" data-testid={`text-inn-${factory.id}`}>
              <span className="font-medium">ИНН:</span> {factory.inn}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <Badge variant="secondary" className="text-xs" data-testid={`badge-capacity-${factory.id}`}>
              <span className="font-mono">{factory.capacity}</span>
              <span className="ml-1">м³/ч</span>
            </Badge>
            <Badge variant="secondary" className="text-xs" data-testid={`badge-output-${factory.id}`}>
              <span className="font-mono">{factory.yearlyOutput}</span>
              <span className="ml-1">м³/год</span>
            </Badge>
            {factory.website && (
              <a 
                href={factory.website} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex"
              >
                <Badge variant="outline" className="gap-1 sm:gap-1.5 hover:bg-accent text-xs" data-testid={`badge-website-${factory.id}`}>
                  <ExternalLink className="h-3 w-3" />
                  <span>Сайт</span>
                </Badge>
              </a>
            )}
            <a 
              href={getYandexSearchUrl()} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex"
            >
              <Badge variant="outline" className="gap-1 sm:gap-1.5 hover:bg-accent text-xs" data-testid={`badge-yandex-search-${factory.id}`}>
                <Search className="h-3 w-3" />
                <span className="hidden sm:inline">Поиск в Яндексе</span>
                <span className="sm:hidden">Яндекс</span>
              </Badge>
            </a>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 break-words" data-testid={`text-description-${factory.id}`}>
            {factory.description}
          </p>
        </CardContent>
      </div>
    </Card>
  );
}
