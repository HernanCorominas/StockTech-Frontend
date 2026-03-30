import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-live-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-live-preview.component.html',
  styleUrls: ['./product-live-preview.component.scss']
})
export class ProductLivePreviewComponent {
  @Input() name: string = '';
  @Input() categoryName: string = '';
  @Input() price: number = 0;
  @Input() margin: number = 0;
  @Input() targetMargin: number = 30;
  @Input() step: number = 1;
  @Input() imageUrl: string | null = null;
}
