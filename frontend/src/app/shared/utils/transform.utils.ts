export class TransformUtils {
  static transformEmptyStringsToNull(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(TransformUtils.transformEmptyStringsToNull);
    } else if (obj instanceof Date) {
      return obj;
    } else if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        // @ts-ignore
        acc[key] = TransformUtils.transformEmptyStringsToNull(value);
        return acc;
      }, {});
    } else if (obj === '') {
      return null;
    }
    return obj;
  }

  static getEnumValues<T extends object>(enumObj: T): string[] {
    return Object.values(enumObj).filter(value => isNaN(Number(value))) as string[];
  }

  static getEnumValuesAsEnum<T extends object>(enumObj: T): T[keyof T][] {
    return Object.values(enumObj).filter(value => isNaN(Number(value))) as T[keyof T][];
  }

  static removeWhitespaceFromString(inputString: string): string {
    return inputString?.replace(/\s/g, '');
  }

  static toSlug(inputString: string): string {
    return inputString
      .toLowerCase()
      .trim()
      .replaceAll(/[\s\W-]+/g, '-') // Nahradí medzery a nealfanumerické znaky pomlčkami
      .replaceAll(/^-+|-+$/g, '');  // Odstráni vedúce a koncové pomlčky
  }
}
