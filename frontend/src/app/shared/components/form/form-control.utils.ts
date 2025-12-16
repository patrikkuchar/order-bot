import {MyTranslateService} from '../../../core/services/my-translate.service';

export type TranslatedValue<T> = {
  label: string;
  value: T;
}

export const getTranslatedValuesForSelect = <T>(
  svc: MyTranslateService,
  values: T[],
  prefix: string
): TranslatedValue<T>[] => {
  return values.map(v => ({
    label: svc.get(`${prefix}.${v}`),
    value: v
  }));
}
