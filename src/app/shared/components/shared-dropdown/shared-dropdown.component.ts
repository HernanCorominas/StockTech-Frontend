import { Component, Input, Output, EventEmitter, ElementRef, HostListener, ViewChild, ChangeDetectionStrategy, signal, computed, model, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { gsap } from 'gsap';

export interface DropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

@Component({
  selector: 'app-shared-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shared-dropdown.component.html',
  styleUrls: ['./shared-dropdown.component.scss']
})
export class SharedDropdownComponent {
  @Input() label = '';
  @Input() placeholder = 'Seleccionar opción';
  @Input() disabled = false;
  
  items = input<DropdownItem[]>([]);
  
  // Use model() for two-way binding and signal reactivity
  value = model<string | undefined>(undefined);
  
  @Output() selectionChange = new EventEmitter<DropdownItem>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('panel') panel!: ElementRef<HTMLElement>;

  isOpen = signal(false);
  searchTerm = signal('');

  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const currItems = this.items();
    if (!term) return currItems;
    return currItems.filter(i => 
      i.label.toLowerCase().includes(term) || 
      i.sublabel?.toLowerCase().includes(term)
    );
  });

  selectedItem = computed(() => {
    const val = this.value();
    const currItems = this.items();
    return currItems.find(i => i.id === val);
  });

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const container = (event.target as HTMLElement).closest('.dropdown-container');
    if (!container && this.isOpen()) {
      this.close();
    }
  }

  toggle(event: MouseEvent) {
    event.stopPropagation();
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen.set(true);
    this.searchTerm.set('');
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 100);
  }

  close() {
    this.isOpen.set(false);
  }

  select(item: DropdownItem) {
    this.value.set(item.id);
    this.selectionChange.emit(item);
    this.close();
  }
}
