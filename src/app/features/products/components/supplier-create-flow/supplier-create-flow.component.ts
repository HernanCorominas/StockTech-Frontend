import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CreateSupplier } from '../../../../core/models';
import { gsap } from 'gsap';

@Component({
  selector: 'app-supplier-create-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flow-overlay" #overlay>
       <div class="flow-container" #container>
          <div class="flow-header">
             <div class="flex items-center gap-3">
                <span class="text-2xl">🚚</span>
                <div>
                   <h3 class="font-black text-primary">Nuevo Suplidor</h3>
                   <p class="text-[10px] uppercase font-black tracking-widest text-muted">Micro-Flow de Abastecimiento</p>
                </div>
             </div>
             <button class="btn btn--ghost btn--sm" (click)="close()">✕</button>
          </div>

          <div class="flow-body p-8">
             <div class="form-group mb-4">
                <label class="text-[10px] uppercase font-black tracking-widest text-muted mb-2 block">Nombre Comercial</label>
                <input type="text" [(ngModel)]="supplier.name" placeholder="Ej: Tech Logistics S.A." class="flow-input" #nameInput />
             </div>
             
             <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="form-group">
                   <label class="wizard-label">Contacto</label>
                   <input type="text" [(ngModel)]="supplier.contactName" placeholder="Nombre..." class="flow-input" />
                </div>
                <div class="form-group">
                   <label class="wizard-label">Teléfono</label>
                   <input type="text" [(ngModel)]="supplier.phone" placeholder="809-xxx-xxx" class="flow-input" />
                </div>
             </div>

             <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="form-group">
                   <label class="wizard-label">Email</label>
                   <input type="email" [(ngModel)]="supplier.email" placeholder="email@ejemplo.com" class="flow-input" />
                </div>
                <div class="form-group">
                   <label class="wizard-label">RNC / Tax ID</label>
                   <input type="text" [(ngModel)]="supplier.taxId" placeholder="101-xxxxx-x" class="flow-input" />
                </div>
             </div>
          </div>

          <div class="flow-footer p-8 flex gap-3">
             <button class="btn btn--ghost flex-1 font-bold" (click)="close()">Cancelar</button>
             <button class="btn btn--primary flex-1 py-4" [disabled]="!supplier.name || loading" (click)="save()">
                {{ loading ? 'Sincronizando...' : 'Registrar Suplidor' }}
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
      width: 550px;
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
      padding: 1rem 1.25rem;
      border-radius: 1.25rem;
      color: var(--text-primary);
      font-weight: 700;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .wizard-label {
      display: block;
      font-size: 9px;
      font-weight: 950;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }

    .flow-input:focus {
      outline: none;
      border-color: var(--accent);
      background: var(--bg-primary);
    }
  `]
})
export class SupplierCreateFlowComponent {
  @Input() branchId: string | null = null;
  @ViewChild('overlay') overlay!: ElementRef;
  @ViewChild('container') container!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;
  @Output() onCreated = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  supplier: CreateSupplier = { 
    name: '', 
    contactName: '', 
    phone: '', 
    email: '', 
    taxId: '' 
  };
  loading = false;
  private apiService = inject(ApiService);

  open() {
    this.overlay.nativeElement.style.visibility = 'visible';
    const tl = gsap.timeline();
    tl.to(this.overlay.nativeElement, { opacity: 1, duration: 0.4 });
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
    tl.to(this.container.nativeElement, { scale: 0.9, y: 20, opacity: 0, duration: 0.4 });
    tl.to(this.overlay.nativeElement, { opacity: 0, duration: 0.3 }, '-=0.2');
  }

  save() {
    if (!this.supplier.name) return;
    this.loading = true;
    
    // Ensure branchId is set from parent if missing
    const supplierToCreate: any = { 
      ...this.supplier, 
      branchId: this.supplier.branchId || this.branchId || undefined
    };

    this.apiService.createSupplier(supplierToCreate).subscribe({
      next: (sup) => {
        this.loading = false;
        this.onCreated.emit(sup.id);
        this.close();
      },
      error: () => this.loading = false
    });
  }
}
