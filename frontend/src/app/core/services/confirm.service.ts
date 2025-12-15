import {Injectable} from '@angular/core';
import {Confirmation, ConfirmationService} from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor(private confirmation: ConfirmationService) {}

  confirm(options: Confirmation & { tone?: 'primary' | 'danger' }): void {
    const tones: Record<'primary' | 'danger', { accept: string; reject: string }> = {
      primary: { accept: 'p-button-primary', reject: 'p-button-text' },
      danger: { accept: 'p-button-danger', reject: 'p-button-secondary' }
    };

    const tone = options.tone ?? 'primary';
    const toneClasses = tones[tone];

    this.confirmation.confirm({
      header: 'Potvrdenie',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Áno',
      rejectLabel: 'Nie',
      acceptButtonStyleClass: options.acceptButtonStyleClass ?? toneClasses.accept,
      rejectButtonStyleClass: options.rejectButtonStyleClass ?? toneClasses.reject,
      ...options
    });
  }
}
