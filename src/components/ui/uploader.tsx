import { cn } from "@/libs/tailwind/utils";
import {
  File as FileIcon,
  Image as ImageIcon,
  Info,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { Input } from "./input";

export type UploaderProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // bytes
  disabled?: boolean;
  showPreview?: boolean;
  label?: string;
  description?: string;
  className?: string;
  error?: string;
  helperText?: string;
};

const DEFAULT_ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const Uploader: React.FC<UploaderProps> = ({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  showPreview = true,
  label = "Upload File",
  description = "Drag and drop or click to select a file.",
  className,
  error,
  helperText,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (value && value.type.startsWith("image/") && showPreview) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [value, showPreview]);

  const handleFile = (file: File | null) => {
    setInternalError(null);
    if (!file) {
      onChange(null);
      return;
    }
    if (maxSize && file.size > maxSize) {
      setInternalError(
        `File is too large. Max size is ${Math.round(maxSize / 1024 / 1024)}MB.`
      );
      return;
    }
    if (accept && !file.type.match(accept.replace(/\./g, ""))) {
      setInternalError("Invalid file type.");
      return;
    }
    onChange(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemove = () => {
    setInternalError(null);
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const showImagePreview =
    value && value.type.startsWith("image/") && previewUrl && showPreview;
  const showFileIcon = value && !showImagePreview;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer group",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/60",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        tabIndex={0}
        role="button"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnd={onDragLeave}
      >
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={onInputChange}
        />
        {showImagePreview ? (
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={previewUrl!} alt="Preview" />
            <AvatarFallback>
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        ) : showFileIcon ? (
          <div className="flex flex-col items-center mb-2">
            <FileIcon className="h-10 w-10 text-muted-foreground" />
            <span className="text-xs mt-1 max-w-[120px] truncate">
              {value?.name}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {value ? value.name : description}
          </span>
        </div>
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            aria-label="Remove file"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {dragActive && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg pointer-events-none animate-pulse" />
        )}
      </div>
      {(internalError || error) && (
        <Alert variant="destructive" className="mt-2">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{internalError || error}</AlertDescription>
        </Alert>
      )}
      {helperText && !internalError && !error && (
        <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
};
