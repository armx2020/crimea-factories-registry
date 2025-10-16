import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Factory, insertFactorySchema, type Network } from "@shared/schema";
import { CITY_COORDINATES } from "@shared/cityCoordinates";
import { z } from "zod";
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X, MapPin, ExternalLink } from "lucide-react";
import { PhotoUploader } from "@/components/PhotoUploader";
import { LocationPicker } from "@/components/LocationPicker";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const CRIMEA_CITIES = Object.keys(CITY_COORDINATES);

const formSchema = insertFactorySchema.extend({
  director: z.string().optional(),
  inn: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  website: z.string().optional(),
  networkId: z.string().optional(),
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
  const { data: networks = [], isLoading: networksLoading } = useQuery<Network[]>({
    queryKey: ["/api/networks"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      city: "",
      model: "",
      address: "",
      capacity: 0,
      yearlyOutput: 0,
      description: "",
      director: "",
      inn: "",
      website: "",
      ranking: 0,
      networkId: "",
      latitude: "",
      longitude: "",
      photo1: "",
      photo2: "",
      photo3: "",
    },
  });

  const photo1 = form.watch("photo1");
  const photo2 = form.watch("photo2");
  const photo3 = form.watch("photo3");
  const city = form.watch("city");
  const address = form.watch("address");
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");
  
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    if (factory) {
      form.reset({
        name: factory.name || "",
        city: factory.city || "",
        model: factory.model || "",
        address: factory.address || "",
        capacity: factory.capacity || 0,
        yearlyOutput: factory.yearlyOutput || 0,
        description: factory.description || "",
        director: factory.director || "",
        inn: factory.inn || "",
        website: factory.website || "",
        ranking: factory.ranking || 0,
        networkId: factory.networkId || "",
        latitude: factory.latitude || "",
        longitude: factory.longitude || "",
        photo1: factory.photo1 || "",
        photo2: factory.photo2 || "",
        photo3: factory.photo3 || "",
      });
    } else {
      form.reset({
        name: "",
        city: "",
        model: "",
        address: "",
        capacity: 0,
        yearlyOutput: 0,
        description: "",
        director: "",
        inn: "",
        website: "",
        ranking: 0,
        networkId: "",
        latitude: "",
        longitude: "",
        photo1: "",
        photo2: "",
        photo3: "",
      });
    }
  }, [open, factory]);

  useEffect(() => {
    if (!open) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const photos = [photo1, photo2, photo3];
          const emptyPhotoIndex = photos.findIndex(p => !p);
          
          if (emptyPhotoIndex === -1) {
            alert("Все слоты для фотографий заняты");
            return;
          }

          try {
            const { uploadURL, filePath } = await fetch("/api/objects/upload", {
              method: "POST",
            }).then(r => r.json());

            const uploadResponse = await fetch(uploadURL, {
              method: 'PUT',
              body: file,
              headers: {
                'Content-Type': file.type,
              },
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload file');
            }

            form.setValue(`photo${emptyPhotoIndex + 1}` as "photo1" | "photo2" | "photo3", filePath);
          } catch (error) {
            console.error('Upload error:', error);
            alert("Ошибка при загрузке фото из буфера обмена");
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [open, photo1, photo2, photo3, form]);

  const handlePhotoUploaded = (photoNum: number, photoUrl: string) => {
    form.setValue(`photo${photoNum}` as "photo1" | "photo2" | "photo3", photoUrl);
  };

  const handleRemovePhoto = (photoNum: number) => {
    form.setValue(`photo${photoNum}` as "photo1" | "photo2" | "photo3", "");
  };

  const searchAddress = useCallback(async (query: string, cityName: string) => {
    if (!query || query.length < 3 || !cityName) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const searchQuery = `${query}, ${cityName}`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `limit=5&` +
        `viewbox=32.5,44.4,36.7,46.2&` +
        `bounded=1&` +
        `addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Factory Registry App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Address search results:', data);
        setAddressSuggestions(data);
        setShowAddressSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (address && city) {
        searchAddress(address, city);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, city, searchAddress]);

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    form.setValue("address", suggestion.display_name);
    form.setValue("latitude", suggestion.lat);
    form.setValue("longitude", suggestion.lon);
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleLocationSelect = (lat: string, lng: string) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
  };

  const handleSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };

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
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const coords = CITY_COORDINATES[value];
                        if (coords && !form.getValues("latitude") && !form.getValues("longitude")) {
                          form.setValue("latitude", coords.lat.toString());
                          form.setValue("longitude", coords.lng.toString());
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-city">
                          <SelectValue placeholder="Выберите город" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CRIMEA_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="relative">
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ул. Промышленная, 5" 
                          data-testid="input-address"
                        />
                      </FormControl>
                      {isSearchingAddress && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {!isSearchingAddress && addressSuggestions.length > 0 && showAddressSuggestions && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                          <div className="p-2 space-y-1">
                            {addressSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleSelectAddress(suggestion)}
                                className="w-full flex items-start gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                              >
                                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                                <span className="text-left">{suggestion.display_name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сайт (опционально)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com" data-testid="input-website" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ranking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Место в рейтинге (опционально)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        data-testid="input-ranking"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="networkId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сеть заводов (опционально)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value || undefined)} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-network">
                          <SelectValue placeholder={networksLoading ? "Загрузка..." : "Выберите сеть (опционально)"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {networks.map((network) => (
                          <SelectItem key={network.id} value={network.id}>
                            {network.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Местоположение на карте</FormLabel>
                {latitude && longitude && (
                  <a
                    href={`https://yandex.ru/maps/?ll=${longitude},${latitude}&z=17&l=sat`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      data-testid="button-open-yandex-maps"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Открыть в Яндекс.Картах</span>
                    </Button>
                  </a>
                )}
              </div>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                city={city}
                onLocationSelect={handleLocationSelect}
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

            <FormField
              control={form.control}
              name="director"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Директор (опционально)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Иванов Иван Иванович" data-testid="input-director" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ИНН (опционально)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="9102003456" data-testid="input-inn" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Фотографии (до 3 шт.)</FormLabel>
                <p className="text-xs text-muted-foreground">Совет: используйте Ctrl+V для вставки из буфера</p>
              </div>
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
                        <PhotoUploader
                          onPhotoUploaded={(url) => handlePhotoUploaded(num, url)}
                          buttonText={`Фото ${num}`}
                          variant="outline"
                          className="w-full aspect-square"
                        />
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
