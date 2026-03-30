import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service'; 
import { ApiService } from '../../../../core/services/api.service';
import { Product, Supplier, Branch } from '../../../../core/models';
import { Category } from '../../../../core/models/category.models';
import { FlipAnimationService } from '../../../../core/services/flip-animation.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { CategoryService } from '../../../../core/services/category.service';
import { ProductLivePreviewComponent } from '../../components/product-live-preview/product-live-preview.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductLivePreviewComponent],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() flipId: string = 'product-action';
  @Input() isActive: boolean = false;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  productForm: FormGroup;
  isEdit = false;
  loading = false;
  submitted = false;
  isGlobalAdmin = false;
  branches: any[] = [];
  suppliers: Supplier[] = [];
  categories: Category[] = [];
  
  targetMargin: number = 30; // default 30%
  currentStep = signal(1);
  imageUrl = signal<string | null>(null);

  currentMargin = computed(() => {
    const cost = this.productForm.get('cost')?.value || 0;
    const price = this.productForm.get('price')?.value || 0;
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  });

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private apiService: ApiService,
    private settingsService: SettingsService,
    private authState: AuthStateService,
    private categoryService: CategoryService,
  ) {
    const user = this.authState.currentUser();
    this.isGlobalAdmin = user?.role === 'SystemAdmin' || user?.role === 'Admin';

    this.productForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: [null, Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      cost: [0, [Validators.required, Validators.min(0.01)]],
      initialStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      supplierId: [null],
      branchId: [null, this.isGlobalAdmin ? Validators.required : []],
      image: [null]
    });
  }

  ngOnInit() {
    this.apiService.getSuppliers().subscribe(res => this.suppliers = res);
    this.categoryService.getAll().subscribe(res => this.categories = res);
    
    if (this.isGlobalAdmin) {
      this.apiService.getBranches().subscribe(res => this.branches = res);
    }

    this.settingsService.getByKey('ExpectedProfitMargin').subscribe(s => {
       if (s && s.value) {
         this.targetMargin = parseFloat(s.value);
       }
    });

    if (this.product) {
      this.isEdit = true;
      this.productForm.patchValue(this.product);
      if (this.product.image) this.imageUrl.set(this.product.image);
    }
  }

  nextStep() {
    if (this.isStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  close() {
    this.currentStep.set(1);
    this.onCancel.emit();
  }

  isStepValid(): boolean {
    const f = this.productForm;
    if (this.currentStep() === 1) {
      return f.get('name')!.valid && f.get('categoryId')!.valid;
    }
    if (this.currentStep() === 2) {
      return f.get('price')!.valid && f.get('cost')!.valid && f.get('minStock')!.valid;
    }
    return true;
  }

  getSelectedCategoryName(): string {
    const id = this.productForm.get('categoryId')?.value;
    return this.categories.find(c => c.id === id)?.name || '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        this.imageUrl.set(base64);
        this.productForm.patchValue({ image: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.productForm.invalid) return;

    this.loading = true;
    const data = this.productForm.value;
    
    const obs = this.isEdit && this.product
      ? this.productService.updateProduct(this.product.id, data)
      : this.productService.createProduct(data);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.currentStep.set(1);
        this.onSave.emit();
      },
      error: () => this.loading = false
    });
  }
}
