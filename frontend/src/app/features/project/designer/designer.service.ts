import {Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DesignerService {

  selectedNodeId = signal<string | null>(null);
}
