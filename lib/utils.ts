import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Deeply serializes a Prisma object to be passed from a Server Component to a Client Component.
 * Specifically converts Decimal objects to strings and ensures Dates are valid.
 */
export function serializePrisma<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  // Handle Dates
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }

  // Handle BigInt
  if (typeof obj === "bigint") {
    return obj.toString() as any;
  }

  // Handle Functions (skip them as they can't be passed to Client Components)
  if (typeof obj === "function") {
    return undefined as any;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(serializePrisma) as any;
  }

  if (typeof obj !== "object") return obj;

  // Handle Decimal objects
  if (
    (obj as any).constructor?.name?.startsWith("Decimal") ||
    (obj as any)._isDecimal === true ||
    ((obj as any).d && (obj as any).e !== undefined && (obj as any).s !== undefined)
  ) {
    return (obj as any).toString() as any;
  }

  // Handle plain objects
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = serializePrisma((obj as any)[key]);
      if (val !== undefined) {
        result[key] = val;
      }
    }
  }

  return result;
}
