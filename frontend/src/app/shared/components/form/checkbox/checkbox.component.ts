import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormsModule} from '@angular/forms';
import {Checkbox} from 'primeng/checkbox';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'form-checkbox',
  imports: [
    Checkbox,
    TranslatePipe,
    FormsModule
  ],
  template: `
    <div class="flex items-center">
      <p-checkbox [(ngModel)]="val" (ngModelChange)="valueChanged()" [inputId]="id" [binary]="true"/>
      <label [for]="id" class="ml-2">{{label | translate}}</label>
    </div>
  `
})
export class CheckboxComponent implements OnInit {
  @Input({required: true}) id: string;
  @Input({required: true}) control: FormControl<boolean>;
  @Input({required: true}) label: string;

  val = false;

  ngOnInit() {
    this.val = this.control.value;
    this.control.valueChanges
      .subscribe(value => this.val = value)
  }

  valueChanged() {
    this.control.setValue(this.val);
  }
}
