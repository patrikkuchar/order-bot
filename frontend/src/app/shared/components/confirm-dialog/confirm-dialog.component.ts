import {Component} from '@angular/core';
import {ConfirmDialog} from 'primeng/confirmdialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialog],
  template: `<p-confirmDialog></p-confirmDialog>`
})
export class ConfirmDialogComponent {
}
