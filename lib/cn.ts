// Simple utility to merge class names without external dependencies
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs
    .filter((input) => typeof input === 'string' && input.length > 0)
    .join(' ')
    .trim()
}

