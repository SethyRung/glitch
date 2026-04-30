export function useUser() {
  return useState<User | null>("user", () => null);
}
