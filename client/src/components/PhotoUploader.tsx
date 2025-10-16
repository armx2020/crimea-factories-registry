import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUploaderProps {
  onPhotoUploaded: (photoUrl: string) => void;
  buttonText?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function PhotoUploader({ 
  onPhotoUploaded, 
  buttonText = "Загрузить фото",
  variant = "outline",
  className 
}: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Файл слишком большой. Максимальный размер: 10 МБ");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Пожалуйста, выберите изображение");
      return;
    }

    setIsUploading(true);
    try {
      const { uploadURL, filePath } = await apiRequest<{ uploadURL: string; filePath: string }>("POST", "/api/objects/upload");
      
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

      onPhotoUploaded(filePath);
    } catch (error) {
      console.error('Upload error:', error);
      alert("Ошибка при загрузке файла");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant={variant}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={className}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
    </>
  );
}
