import Image from "next/image";

/** Foto do produto ou o bloco de cor do Figma enquanto não houver fotografia. */
export function ProductImage({
  src,
  alt,
  color,
  label,
  className = "",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority = false,
}: {
  src?: string | null;
  alt: string;
  color: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[14px] ${className}`} style={{ backgroundColor: color }}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" unoptimized={src.startsWith("/api/")} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-[12px] uppercase text-ink">
          {label ?? alt}
        </span>
      )}
    </div>
  );
}
