import {AfterViewInit, Component} from '@angular/core';
import {Button} from 'primeng/button';
import {Tag} from 'primeng/tag';
import {BadgeDirective} from 'primeng/badge';
import {Chip} from 'primeng/chip';
import {Divider} from 'primeng/divider';
import {Message} from 'primeng/message';
import {Card} from 'primeng/card';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {InputText} from 'primeng/inputtext';
import {InputNumber} from 'primeng/inputnumber';
import {Textarea} from 'primeng/textarea';
import {Password} from 'primeng/password';
import {DatePicker} from 'primeng/datepicker';
import {Checkbox} from 'primeng/checkbox';
import {FormsModule} from '@angular/forms';
import {TableModule} from 'primeng/table';
import {InputTextComponent} from '../../shared/components/form/inputtext.component';
import {CustomFormControl} from '../../shared/form/custom/custom-form-controls';

@Component({
  selector: 'app-component-shows',
  imports: [
    Button,
    Tag,
    BadgeDirective,
    Chip,
    Divider,
    Message,
    Card,
    PrimeTemplate,
    InputText,
    InputNumber,
    Textarea,
    Password,
    DatePicker,
    Checkbox,
    FormsModule,
    TableModule,
    InputTextComponent
  ],
  templateUrl: './component-shows.component.html',
  styleUrl: './component-shows.component.scss'
})
export class ComponentShowsComponent implements AfterViewInit {

  editedControl = CustomFormControl.create('val', undefined, true);

  constructor(private messageService: MessageService) { }

  ngAfterViewInit() {
    this.editedControl.setValue('This is edited value', {emitEvent: true});
  }

  showToast(severity: string) {
    this.messageService.add({
      severity,
      summary: severity.toUpperCase(),
      detail: `This is a ${severity} toast`
    });
  }

  products = [
    { code: 'P100', name: 'Product A', category: 'Category 1', price: 29.99 },
    { code: 'P101', name: 'Product B', category: 'Category 1', price: 39.99 },
    { code: 'P102', name: 'Product C', category: 'Category 2', price: 19.99 },
    { code: 'P103', name: 'Product D', category: 'Category 3', price: 49.99 },
    { code: 'P104', name: 'Product E', category: 'Category 2', price: 9.99 },
    { code: 'P105', name: 'Product F', category: 'Category 3', price: 14.99 },
    { code: 'P106', name: 'Product G', category: 'Category 1', price: 59.99 },
    // ...môžeš pridať ďalšie
  ];
}
