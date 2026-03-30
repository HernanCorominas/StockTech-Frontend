import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../../core/models';

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-selector.component.html',
  styleUrl: './client-selector.component.scss'
})
export class ClientSelectorComponent {
  @Input() isExpress: boolean = true;
  @Input() clients: Client[] = [];
  
  @Output() toggleExpress = new EventEmitter<void>();
  @Output() clientChange = new EventEmitter<Client | null>();
  @Output() expressNameChange = new EventEmitter<string>();
  @Output() expressDocumentChange = new EventEmitter<string>();

  selectedClientId: string = '';
  tempExpressName: string = '';
  tempExpressDocument: string = '';

  onClientSelect() {
    if (!this.selectedClientId) {
       this.clientChange.emit(null);
       return;
    }
    const c = this.clients.find(x => x.id === this.selectedClientId);
    this.clientChange.emit(c || null);
  }

  onNameChange(val: string) {
    this.tempExpressName = val;
    this.expressNameChange.emit(val);
  }

  onDocumentChange(val: string) {
    this.tempExpressDocument = val;
    this.expressDocumentChange.emit(val);
  }
}
