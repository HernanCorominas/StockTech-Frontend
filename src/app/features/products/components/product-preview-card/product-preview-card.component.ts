import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCreationService } from '../../services/product-creation.service';

@Component({
  selector: 'app-product-preview-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-preview-stage">
      <!-- Glow effects behind -->
      <div class="glow glow--1"></div>
      <div class="glow glow--2"></div>

      <!-- Main Card -->
      <div class="preview-card" [class.has-image]="creationService.hasImage()">
        <div class="preview-card__glass"></div>
        
        <!-- Media Area -->
        <div class="preview-card__media">
          @if (creationService.productDraft().image) {
            <img [src]="creationService.productDraft().image" class="preview-card__img" />
          } @else {
            <div class="preview-card__placeholder">
              <span class="text-4xl opacity-20">📦</span>
              <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-4">Visualizando Prototipo</p>
            </div>
          }
          
          <div class="preview-card__badge" *ngIf="creationService.productDraft().categoryId">
             {{ getCategoryInitial() }}
          </div>
        </div>

        <!-- Content Area -->
        <div class="preview-card__content">
           <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                 <p class="text-[9px] font-black uppercase tracking-widest text-accent mb-1">Activo Digital</p>
                 <h2 class="preview-card__title">
                   {{ creationService.productDraft().name || 'Nuevo Producto' }}
                 </h2>
              </div>
              <div class="text-right">
                 <p class="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Precio PVP</p>
                 <p class="preview-card__price">RD$ {{ creationService.productDraft().price | number:'1.2-2' }}</p>
              </div>
           </div>

           <div class="grid grid-cols-2 gap-4">
              <div class="stat-pill">
                 <span class="stat-pill__label">Stock Operativo</span>
                 <span class="stat-pill__value">{{ creationService.productDraft().initialStock || 0 }} <small class="text-[9px] opacity-40">UND</small></span>
              </div>
              <div class="stat-pill">
                 <span class="stat-pill__label">Margen Bruto</span>
                 <span class="stat-pill__value" [class.text-amber-500]="creationService.margin() < 30">
                    {{ creationService.margin() | number:'1.1-1' }}%
                 </span>
              </div>
           </div>
           
           <!-- Skeleton bars when empty -->
           <div class="mt-6 flex flex-col gap-2" *ngIf="!creationService.productDraft().name">
              <div class="h-1.5 w-full bg-slate-200/10 rounded-full"></div>
              <div class="h-1.5 w-2/3 bg-slate-200/10 rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-preview-stage {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      perspective: 1000px;
    }

    .glow {
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      filter: blur(80px);
      z-index: 0;
      opacity: 0.15;
    }
    .glow--1 { background: var(--accent); top: 10%; right: 10%; }
    .glow--2 { background: var(--primary); bottom: 10%; left: 10%; }

    .preview-card {
      position: relative;
      width: 320px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 2.5rem;
      overflow: hidden;
      box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);
      z-index: 1;
      backdrop-filter: blur(20px);
      transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    }

    .preview-card:hover {
      transform: translateY(-10px) rotateX(2deg);
      box-shadow: 0 50px 120px -30px rgba(0,0,0,0.6);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .preview-card__glass {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
      pointer-events: none;
    }

    .preview-card__media {
      position: relative;
      height: 200px;
      background: rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .preview-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      animation: reveal 0.8s ease-out;
    }

    @keyframes reveal {
      from { opacity: 0; transform: scale(1.1); }
      to { opacity: 1; transform: scale(1); }
    }

    .preview-card__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .preview-card__badge {
      position: absolute;
      top: 20px;
      left: 20px;
      width: 32px;
      height: 32px;
      background: var(--accent);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 14px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }

    .preview-card__content {
      padding: 2rem;
    }

    .preview-card__title {
      font-size: 1.25rem;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .preview-card__price {
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--accent);
    }

    .stat-pill {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .stat-pill__label {
      display: block;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 2px;
    }

    .stat-pill__value {
      font-size: 0.9rem;
      font-weight: 900;
      color: white;
    }
  `]
})
export class ProductPreviewCardComponent {
  creationService = inject(ProductCreationService);

  getCategoryInitial(): string {
    return 'C'; // This would be the first letter of the category name
  }
}
