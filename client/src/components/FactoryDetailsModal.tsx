import { Factory } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Factory as FactoryIcon, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface FactoryDetailsModalProps {
  factory: Factory | null;
  open: boolean;
  onClose: () => void;
  onEdit: (factory: Factory) => void;
  onDelete: (factory: Factory) => void;
}

export function FactoryDetailsModal({
  factory,
  open,
  onClose,
  onEdit,
  onDelete,
}: FactoryDetailsModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!factory) return null;

  const photos = [factory.photo1, factory.photo2, factory.photo3].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-factory-details">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2" data-testid="text-modal-factory-name">
                {factory.name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span data-testid="text-modal-factory-city">{factory.city}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(factory)}
                data-testid="button-modal-edit"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(factory)}
                data-testid="button-modal-delete"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {photos.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={photos[currentPhotoIndex] || ""}
                  alt={`Фото ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                  data-testid={`img-factory-photo-${currentPhotoIndex}`}
                />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2">
                  {photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`flex-1 aspect-video rounded-md overflow-hidden border-2 transition-all hover-elevate ${
                        idx === currentPhotoIndex
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      data-testid={`button-photo-thumbnail-${idx}`}
                    >
                      <img
                        src={photo || ""}
                        alt={`Миниатюра ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <FactoryIcon className="h-24 w-24 text-primary/30" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Модель завода</p>
              <p className="text-base" data-testid="text-modal-factory-model">{factory.model}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Адрес</p>
              <p className="text-base" data-testid="text-modal-factory-address">{factory.address}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Мощность</p>
              <Badge variant="secondary" className="font-mono text-base" data-testid="badge-modal-capacity">
                {factory.capacity} м³/ч
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Выпуск по году</p>
              <Badge variant="secondary" className="font-mono text-base" data-testid="badge-modal-output">
                {factory.yearlyOutput} м³/год
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Описание</p>
            <p className="text-base leading-relaxed" data-testid="text-modal-description">
              {factory.description}
            </p>
          </div>

          {factory.latitude && factory.longitude && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Координаты</p>
              <p className="text-sm font-mono" data-testid="text-modal-coordinates">
                {factory.latitude}, {factory.longitude}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
