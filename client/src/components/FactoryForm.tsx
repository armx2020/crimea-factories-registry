import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Factory, insertFactorySchema } from "@shared/schema";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";

const formSchema = insertFactorySchema.extend({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  photo1: z.string().optional(),
  photo2: z.string().optional(),
  photo3: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FactoryFormProps {
  factory?: Factory | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  isPending: boolean;
}

export function FactoryForm({
  factory,
  open,
  onClose,
  onSubmit,
  isPending,
}: FactoryFormProps) {
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: factory?.name || "",
      city: factory?.city || "",
      model: factory?.model || "",
      address: factory?.address || "",
      capacity: factory?.capacity || 0,
      yearlyOutput: factory?.yearlyOutput || 0,
      description: factory?.description || "",
      latitude: factory?.latitude || "",
      longitude: factory?.longitude || "",
      photo1: factory?.photo1 || "",
      photo2: factory?.photo2 || "",
      photo3: factory?.photo3 || "",
    },
  });

  const handlePhotoUpload = async () => {
    const response = await apiRequest<{ uploadURL: string }>("POST", "/api/objects/upload");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handlePhotoComplete = (photoNum: number, result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      if (uploadURL) {
        const objectPath = `/objects/${uploadURL.split('/').slice(-1)[0]}`;
        form.setValue(`photo${photoNum}` as "photo1" | "photo2" | "photo3", objectPath);
      }
    }
    setUploadingPhoto(null);
  };

  const handleRemovePhoto = (photoNum: number) => {
    form.setValue(`photo${photoNum}` as "photo1" | "photo2" | "photo3", "");
  };

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
    form.reset();
  };

  const photo1 = form.watch("photo1");
  const photo2 = form.watch("photo2");
  const photo3 = form.watch("photo3");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-factory-form">
        <DialogHeader>
          <DialogTitle data-testid="text-form-title">
            {factory ? "Редактировать завод" : "Добавить завод"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название завода</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ООО 'БетонСтрой'" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Симферополь" data-testid="input-city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Модель завода</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="HZS75" data-testid="input-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ул. Промышленная, 5" data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Мощность (м³/ч)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="75"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-capacity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearlyOutput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Выпуск по году (м³/год)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="150000"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-yearly-output"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Широта (опционально)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="44.9572" data-testid="input-latitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Долгота (опционально)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="34.1108" data-testid="input-longitude" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Описание завода, особенности производства..."
                      className="min-h-32"
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormLabel>Фотографии (до 3 шт.)</FormLabel>
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((num) => {
                  const photoValue = num === 1 ? photo1 : num === 2 ? photo2 : photo3;

                  return (
                    <div key={num} className="space-y-2">
                      {photoValue ? (
                        <div className="relative aspect-square rounded-md overflow-hidden border">
                          <img
                            src={photoValue}
                            alt={`Фото ${num}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => handleRemovePhoto(num)}
                            data-testid={`button-remove-photo-${num}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          onGetUploadParameters={handlePhotoUpload}
                          onComplete={(result) => handlePhotoComplete(num, result)}
                          buttonVariant="outline"
                          buttonClassName="w-full aspect-square"
                        >
                          {uploadingPhoto === num ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-8 w-8" />
                              <span className="text-xs">Фото {num}</span>
                            </div>
                          )}
                        </ObjectUploader>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                data-testid="button-cancel"
              >
                Отменить
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {factory ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
