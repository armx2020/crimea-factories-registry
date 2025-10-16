import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Network, type InsertNetwork, insertNetworkSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Networks() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);

  const { data: networks = [], isLoading } = useQuery<Network[]>({
    queryKey: ["/api/networks"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertNetwork) =>
      apiRequest("/api/networks", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      toast({
        title: "Успешно",
        description: "Сеть создана",
      });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать сеть",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertNetwork> }) =>
      apiRequest(`/api/networks/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      toast({
        title: "Успешно",
        description: "Сеть обновлена",
      });
      setIsFormOpen(false);
      setEditingNetwork(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сеть",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/networks/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/networks"] });
      toast({
        title: "Успешно",
        description: "Сеть удалена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сеть",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertNetwork>({
    resolver: zodResolver(insertNetworkSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleOpenForm = (network?: Network) => {
    if (network) {
      setEditingNetwork(network);
      form.reset({
        name: network.name,
        description: network.description || "",
      });
    } else {
      setEditingNetwork(null);
      form.reset({
        name: "",
        description: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingNetwork(null);
    form.reset();
  };

  const handleSubmit = async (data: InsertNetwork) => {
    if (editingNetwork) {
      await updateMutation.mutateAsync({ id: editingNetwork.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту сеть?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Сети заводов
          </h1>
          <p className="text-muted-foreground">
            Управление сетями бетонных заводов
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          data-testid="button-add-network"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Добавить сеть
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {networks.map((network) => (
          <Card
            key={network.id}
            className="p-4 space-y-3"
            data-testid={`card-network-${network.id}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg" data-testid="text-network-name">
                  {network.name}
                </h3>
                {network.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {network.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenForm(network)}
                data-testid="button-edit-network"
                className="gap-2 flex-1"
              >
                <Edit className="h-3.5 w-3.5" />
                Редактировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(network.id)}
                data-testid="button-delete-network"
                className="gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {networks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Нет сетей заводов</p>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="h-4 w-4" />
            Добавить первую сеть
          </Button>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent data-testid="modal-network-form">
          <DialogHeader>
            <DialogTitle>
              {editingNetwork ? "Редактировать сеть" : "Добавить сеть"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название сети</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Например: ИРБИС"
                        data-testid="input-network-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (опционально)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Краткое описание сети"
                        value={field.value || ""}
                        data-testid="input-network-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-network"
                  className="flex-1"
                >
                  {editingNetwork ? "Сохранить" : "Создать"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  data-testid="button-cancel-network"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
