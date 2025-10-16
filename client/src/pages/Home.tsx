import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Factory } from "@shared/schema";
import { FactoryCard } from "@/components/FactoryCard";
import { FactoryFilters, FilterState } from "@/components/FactoryFilters";
import { FactoryMap } from "@/components/FactoryMap";
import { FactoryDetailsModal } from "@/components/FactoryDetailsModal";
import { FactoryForm } from "@/components/FactoryForm";
import { EmptyState } from "@/components/EmptyState";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Factory as FactoryIcon, Plus, Filter, List, Map, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ViewMode = "list" | "map";

export default function Home() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  const [deletingFactory, setDeletingFactory] = useState<Factory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    cities: [],
    minCapacity: 0,
    maxCapacity: 10000,
  });

  const { data: factories = [], isLoading } = useQuery<Factory[]>({
    queryKey: ["/api/factories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/factories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      setIsFormOpen(false);
      toast({
        title: "Успешно",
        description: "Завод добавлен в реестр",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить завод",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/factories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      setIsFormOpen(false);
      setEditingFactory(null);
      toast({
        title: "Успешно",
        description: "Информация о заводе обновлена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить информацию",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/factories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/factories"] });
      setDeletingFactory(null);
      toast({
        title: "Успешно",
        description: "Завод удален из реестра",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить завод",
        variant: "destructive",
      });
    },
  });

  const filteredFactories = factories
    .filter((factory) => {
      if (filters.cities.length > 0 && !filters.cities.includes(factory.city)) return false;
      if (factory.capacity < filters.minCapacity || factory.capacity > filters.maxCapacity)
        return false;
      return true;
    })
    .sort((a, b) => {
      const aRanking = a.ranking || 0;
      const bRanking = b.ranking || 0;
      
      if (aRanking > 0 && bRanking > 0) {
        return aRanking - bRanking;
      }
      
      if (aRanking > 0) return -1;
      if (bRanking > 0) return 1;
      
      return 0;
    });

  const handleFormSubmit = async (data: any) => {
    if (editingFactory) {
      await updateMutation.mutateAsync({ id: editingFactory.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleAddFactory = () => {
    setEditingFactory(null);
    setIsFormOpen(true);
  };

  const handleEditFactory = (factory: Factory) => {
    setEditingFactory(factory);
    setIsFormOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewFactory = (factory: Factory) => {
    setSelectedFactory(factory);
    setIsDetailsOpen(true);
  };

  const handleDeleteFactory = (factory: Factory) => {
    setDeletingFactory(factory);
  };

  const confirmDelete = () => {
    if (deletingFactory) {
      deleteMutation.mutate(deletingFactory.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
              <FactoryIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight" data-testid="text-app-title">
                Реестр Бетонных Заводов
              </h1>
              <p className="text-xs text-muted-foreground">Крым</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList data-testid="tabs-view-mode">
                <TabsTrigger value="list" className="gap-2" data-testid="tab-list">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Список</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2" data-testid="tab-map">
                  <Map className="h-4 w-4" />
                  <span className="hidden sm:inline">Карта</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={handleAddFactory} data-testid="button-add-factory">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Добавить завод</span>
              <span className="sm:hidden">Добавить</span>
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Фильтры</h2>
                <span className="text-sm text-muted-foreground" data-testid="text-factory-count">
                  {filteredFactories.length} {filteredFactories.length === 1 ? "завод" : "заводов"}
                </span>
              </div>
              <FactoryFilters factories={factories} onFilterChange={setFilters} />
              
              <div className="rounded-lg border bg-card p-4 space-y-3" data-testid="summary-stats">
                <h3 className="font-semibold text-sm text-muted-foreground">Сводка</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Всего заводов:</span>
                    <span className="text-lg font-semibold" data-testid="text-total-factories">
                      {filteredFactories.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Суммарная мощность:</span>
                    <span className="text-lg font-semibold" data-testid="text-total-capacity">
                      {filteredFactories.reduce((sum, f) => sum + (f.capacity || 0), 0).toLocaleString('ru-RU')} м³/ч
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full" data-testid="button-mobile-filters">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры ({filteredFactories.length})
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FactoryFilters factories={factories} onFilterChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20" data-testid="loading-state">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : factories.length === 0 ? (
              <EmptyState onAddFactory={handleAddFactory} />
            ) : (
              <>
                {viewMode === "list" ? (
                  filteredFactories.length > 0 ? (
                    <div className="space-y-4">
                      {filteredFactories.map((factory) => (
                        <FactoryCard
                          key={factory.id}
                          factory={factory}
                          onEdit={handleEditFactory}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20" data-testid="no-results">
                      <p className="text-muted-foreground">
                        Заводов по выбранным фильтрам не найдено
                      </p>
                    </div>
                  )
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <FactoryMap
                      factories={filteredFactories}
                      onFactoryClick={handleViewFactory}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <FactoryForm
        factory={editingFactory}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFactory(null);
        }}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <FactoryDetailsModal
        factory={selectedFactory}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedFactory(null);
        }}
        onEdit={handleEditFactory}
        onDelete={handleDeleteFactory}
      />

      <AlertDialog
        open={!!deletingFactory}
        onOpenChange={(open) => !open && setDeletingFactory(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить завод?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить "{deletingFactory?.name}" из реестра? Это действие
              нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Отменить</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
