export function uid(): string {
  return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
