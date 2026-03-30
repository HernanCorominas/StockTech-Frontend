import { Component, ElementRef, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-category-create-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flow-overlay" #overlay>
       <div class="flow-container" #container>
          <div class="flow-header">
             <div class="flex items-center gap-3">
                <span class="text-2xl">📁</span>
                <div>
                   <h3 class="font-black text-primary">Nueva Categoría</h3>
                   <p class="text-[10px] uppercase font-black tracking-widest text-muted">Micro-Flow Operativo</p>
                </div>
             </div>
             <button class="btn btn--ghost btn--sm" (click)="close()">✕</button>
          </div>

          <div class="flow-body p-8">
             <div class="form-group mb-8">
                <label class="text-[10px] uppercase font-black tracking-widest text-muted mb-2 block">Nombre de la Categoría</label>
                <input type="text" [(ngModel)]="categoryName" placeholder="Ej: Electrónica, Hogar..." class="flow-input" #nameInput />
             </div>

             <div class="tip-box p-6 rounded-[2rem] bg-[var(--primary-alpha)] border border-[var(--border-subtle)] mb-8">
                <p class="text-xs text-muted leading-relaxed">
                   Las categorías permiten organizar el inventario y automatizar la generación de SKU según el prefijo definido.
                </p>
             </div>
          </div>

          <div class="flow-footer p-8 flex gap-3">
             <button class="btn btn--ghost flex-1 font-bold" (click)="close()">Cancelar</button>
             <button class="btn btn--primary flex-1 py-4" [disabled]="!categoryName || loading" (click)="save()">
                {{ loading ? 'Sincronizando...' : 'Crear y Seleccionar' }}
             </button>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .flow-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
    }

    .flow-container {
      width: 400px;
      background: var(--bg-primary);
      border-radius: 3rem;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
    }

    .flow-header {
      padding: 2rem;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .flow-input {
      width: 100%;
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      padding: 1.25rem 1.5rem;
      border-radius: 1.5rem;
      color: white;
      font-weight: 700;
      font-size: 1.1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .flow-input:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--bg-primary);
      box-shadow: 0 0 0 4px var(--primary-alpha);
      transform: translateY(-2px);
    }
  `]
})
export class CategoryCreateFlowComponent {
  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('container') container!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;
  @Output() onCreated = new EventEmitter<string>(); // returns created category ID
  @Output() onCancel = new EventEmitter<void>();

  categoryName = '';
  loading = false;
  private categoryService = inject(CategoryService);

  open(originRect?: DOMRect) {
    this.overlay.nativeElement.style.visibility = 'visible';
    
    const tl = gsap.timeline();
    tl.to(this.overlay.nativeElement, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    tl.to(this.container.nativeElement, { scale: 1, y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.2');
    
    setTimeout(() => this.nameInput.nativeElement.focus(), 400);
  }

  close() {
    const tl = gsap.timeline({
      onComplete: () => {
        this.overlay.nativeElement.style.visibility = 'hidden';
        this.onCancel.emit();
      }
    });
    tl.to(this.container.nativeElement, { scale: 0.9, y: 20, opacity: 0, duration: 0.4, ease: 'power2.in' });
    tl.to(this.overlay.nativeElement, { opacity: 0, duration: 0.3 }, '-=0.2');
  }

  save() {
    if (!this.categoryName) return;
    this.loading = true;
    this.categoryService.create({ name: this.categoryName }).subscribe({
      next: (cat) => {
        this.loading = false;
        this.onCreated.emit(cat.id);
        this.close();
      },
      error: () => this.loading = false
    });
  }
}
