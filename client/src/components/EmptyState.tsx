import { Factory as FactoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddFactory: () => void;
}

export function EmptyState({ onAddFactory }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4" data-testid="empty-state">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <FactoryIcon className="h-12 w-12 text-primary/60" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Нет заводов в реестре</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Начните добавлять информацию о бетонных заводах Крыма для создания полного реестра
      </p>
      <Button onClick={onAddFactory} size="lg" data-testid="button-add-first-factory">
        <FactoryIcon className="h-5 w-5 mr-2" />
        Добавить первый завод
      </Button>
    </div>
  );
}
