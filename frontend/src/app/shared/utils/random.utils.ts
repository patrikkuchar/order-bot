export class RandomUtils {
  static uuid(): string {
    return crypto.randomUUID();
  }
}
