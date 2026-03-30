import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'checkbox' | 'range' | 'date' | 'text';
  options?: { value: any, label: string }[];
  min?: number;
  max?: number;
  value?: any;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss']
})
export class FilterPanelComponent {
  @Input() isVisible = false;
  @Input() filters: FilterOption[] = [];
  @Output() onApply = new EventEmitter<any>();
  @Output() onClear = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  isArray(val: any): boolean { return Array.isArray(val); }

  toggleCheckbox(filter: FilterOption, value: any) {
    if (!Array.isArray(filter.value)) filter.value = [];
    const idx = filter.value.indexOf(value);
    if (idx > -1) filter.value.splice(idx, 1);
    else filter.value.push(value);
  }

  apply() {
    const results: any = {};
    this.filters.forEach(f => {
      if (f.value !== undefined && f.value !== null && f.value !== '' && (!Array.isArray(f.value) || f.value.length > 0)) {
        results[f.id] = f.value;
      }
    });
    this.onApply.emit(results);
    this.close();
  }

  clear() {
    this.filters.forEach(f => f.value = Array.isArray(f.value) ? [] : undefined);
    this.onClear.emit();
  }

  close() {
    this.onClose.emit();
  }
}
