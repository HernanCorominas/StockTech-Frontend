import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActiveFilter {
  id: string;
  label: string;
  displayValue: string;
}

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-chips-wrapper" *ngIf="chips.length > 0">
      <div class="chips-container">
        <div *ngFor="let chip of chips" class="filter-chip slide-in">
          <span class="chip-label">{{ chip.label }}:</span>
          <span class="chip-value">{{ chip.displayValue }}</span>
          <button class="chip-remove" (click)="remove.emit(chip.id)">✕</button>
        </div>
        
        <button class="clear-all-btn" (click)="clearAll.emit()">
          Limpiar todos
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filter-chips-wrapper { margin-bottom: 1.5rem; }
    .chips-container { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    
    .filter-chip {
      display: flex; align-items: center; gap: 6px; padding: 4px 12px;
      background: var(--accent-dim); border: 1px solid var(--accent-alpha);
      border-radius: 20px; font-size: 0.75rem; color: var(--accent);
      animation: chipIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chip-label { font-weight: 800; text-transform: uppercase; opacity: 0.7; font-size: 9px; }
    .chip-value { font-weight: 700; }
    
    .chip-remove {
      background: none; border: none; color: var(--accent); cursor: pointer;
      padding: 0 0 0 4px; font-weight: 900; opacity: 0.5; transition: 0.2s;
    }
    .chip-remove:hover { opacity: 1; transform: scale(1.2); }
    
    .clear-all-btn {
      background: none; border: none; color: var(--text-muted); font-size: 11px;
      font-weight: 700; cursor: pointer; text-decoration: underline; padding: 4px 8px;
      transition: 0.2s;
    }
    .clear-all-btn:hover { color: var(--danger); }
    
    @keyframes chipIn {
      from { opacity: 0; transform: scale(0.8) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class FilterChipsComponent {
  @Input() chips: ActiveFilter[] = [];
  @Output() remove = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
}
