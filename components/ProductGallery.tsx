"use client";

import { useState } from "react";
import type { ProductImage as Img } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function ProductGallery({ images, name, color }: { images: Img[]; name: string; color: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  return (
    <div>
      <ProductImage
        src={current?.url}
        alt={current?.alt || name}
        label={name}
        color={color}
        className="aspect-square w-full"
        sizes="(min-width: 768px) 50vw, 100vw"
        priority
      />
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3" aria-label="Fotos do produto">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={i === index}
                className={`block rounded-[10px] ring-2 ring-offset-2 ${i === index ? "ring-rose" : "ring-transparent"}`}
              >
                <ProductImage src={img.url} alt="" color={color} className="size-20 rounded-[10px]" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
