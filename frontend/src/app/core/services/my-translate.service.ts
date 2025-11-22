import {Injectable} from '@angular/core';
import {InterpolationParameters, TranslateService, Translation} from '@ngx-translate/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MyTranslateService {
  constructor(private svc: TranslateService) {
    console.log('MyTranslateService initialized', svc.getLangs(), svc.getBrowserLang(), svc.getCurrentLang(), svc.getBrowserCultureLang());
  }

  get(key: string | string[], interpolateParams?: Object): string {
    return this.svc.instant(key, interpolateParams);
  }

  getWithInfo(key: string | string[], interpolateParams?: Object): { val: Translation, type: 'string' | 'array' | 'object' | 'unknown' } {
    const val = this.svc.instant(key, interpolateParams);
    let type: 'string' | 'array' | 'object' | 'unknown' = 'unknown';
    if (typeof val === 'string') {
      type = 'string';
    } else if (Array.isArray(val)) {
      type = 'array';
    } else if (typeof val === 'object' && val !== null) {
      type = 'object';
    }
    return {val, type};
  }

  get$(key: string | string[], interpolateParams?: InterpolationParameters): Observable<Translation> {
    return this.svc.get(key, interpolateParams);
  }

  exists(key: string): boolean {
    return this.svc.instant(key) !== key;
  }

  /**
   * Typovo bezpečné získanie prekladu podľa očakávaného typu hodnoty.
   * @param key kľúč prekladu
   * @param valueType očakávaný typ hodnoty ('string', 'array', 'object')
   * @param interpolateParams parametre interpolácie
   */
  getBy<T>(key: string, valueType: 'string' | 'array' | 'object', interpolateParams?: Object): T | undefined {
    const val = this.getWithInfo(key, interpolateParams);
    console.log('getBy', key, val, 'expected type:', valueType);
    if (val.type === 'unknown') {
      return undefined;
    }

    if (valueType === 'string') {
      if (val.type === 'string') {
        return val.val as T;
      } else {
        console.warn(`Type mismatch in MyTranslateService.getBy<string>('${key}'): got ${val.type}`);
        return undefined;
      }
    }

    if (valueType === 'array') {
      if (val.type === 'array') {
        return val.val as T;
      } else {
        console.warn(`Type mismatch in MyTranslateService.getBy<array>('${key}'): got ${val.type}`);
        return undefined;
      }
    }

    if (valueType === 'object') {
      if (val.type === 'object' && typeof val.val === 'object' && val.val !== null) {
        // Voliteľne: porovnať kľúče T s kľúčmi val.val
        // const tKeys = Object.keys({} as T);
        // const vKeys = Object.keys(val.val);
        // const missingKeys = tKeys.filter(k => !vKeys.includes(k));
        // if (missingKeys.length > 0) {
        //   console.warn(`Type mismatch in MyTranslateService.getBy<object>('${key}'): missing keys [${missingKeys.join(', ')}]`);
        //   return undefined;
        // }
        return val.val as T;
      } else {
        console.warn(`Type mismatch in MyTranslateService.getBy<object>('${key}'): got ${val.type}`);
        return undefined;
      }
    }

    return undefined;
  }
}
