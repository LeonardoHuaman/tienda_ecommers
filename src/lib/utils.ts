import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImage(product: { image?: any, images?: any } | null | undefined): string | undefined {
  if (!product) return undefined;

  // If 'image' is a valid string/URL
  if (typeof product.image === 'string' && (product.image.startsWith('http') || product.image.startsWith('/'))) {
    return product.image;
  }

  // If 'images' is an array and has items
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }

  // If 'images' is a JSON string of an array
  if (typeof product.images === 'string' && product.images.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (e) { }
  }

  // If 'image' is a JSON string of an array
  if (typeof product.image === 'string' && product.image.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(product.image);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (e) { }
  }

  return product.image || undefined;
}
