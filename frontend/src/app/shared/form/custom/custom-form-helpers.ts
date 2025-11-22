import {AbstractControl} from '@angular/forms';
import {CustomFormNode} from './custom-form-types';

export type CustomFormNodeData = {
  key: string | number;
  node: CustomFormNode<any>;
};

export const enumerateCustomFormNodes = (
  controls: readonly AbstractControl[] | Record<string, AbstractControl>
): CustomFormNodeData[] => {
  if (Array.isArray(controls)) {
    return controls.map((control, index) => ({
      key: index,
      node: control as unknown as CustomFormNode<any>
    }));
  }

  return Object.entries(controls).map(([key, control]) => ({
    key,
    node: control as unknown as CustomFormNode<any>
  }));
};
