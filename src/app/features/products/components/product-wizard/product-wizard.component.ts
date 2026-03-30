import { Component, Input, Output, EventEmitter, OnInit, signal, inject, ViewChild, ElementRef, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService as ProductApiService } from '../../services/product.service';
import { ProductCreationService as StateService } from '../../services/product-creation.service';
import { Product, Supplier, Branch } from '../../../../core/models';
import { Category } from '../../../../core/models/category.models';
import { CategoryService } from '../../../../core/services/category.service';
import { ApiService } from '../../../../core/services/api.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { ProductPreviewCardComponent } from '../product-preview-card/product-preview-card.component';
import { CategoryCreateFlowComponent } from '../category-create-flow/category-create-flow.component';
import { SupplierCreateFlowComponent } from '../supplier-create-flow/supplier-create-flow.component';
import { BranchStateService } from '../../../../core/services/branch-state.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-product-wizard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ProductPreviewCardComponent, 
    CategoryCreateFlowComponent,
    SupplierCreateFlowComponent
  ],
  templateUrl: './product-wizard.component.html',
  styleUrls: ['./product-wizard.component.scss']
})
export class ProductWizardComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Input() product: Product | null = null;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  @ViewChild('panel') panel!: ElementRef;
  @ViewChild('categoryFlow') categoryFlow!: CategoryCreateFlowComponent;
  @ViewChild('supplierFlow') supplierFlow!: SupplierCreateFlowComponent;

  private fb = inject(FormBuilder);
  private productApiService = inject(ProductApiService);
  state = inject(StateService);
  private categoryService = inject(CategoryService);
  private apiService = inject(ApiService);
  private authState = inject(AuthStateService);
  private branchState = inject(BranchStateService);

  form: FormGroup;
  loading = false;
  currentStep = signal(1);
  categories: Category[] = [];
  suppliers: Supplier[] = [];
  branches: Branch[] = [];
  isGlobalAdmin = false;

  constructor() {
    this.isGlobalAdmin = this.authState.isAdmin() || this.authState.currentUser()?.role === 'SystemAdmin';
    this.form = this.fb.group({
      name: ['', Validators.required],
      categoryId: [null, Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0.01)]],
      cost: [0, [Validators.required, Validators.min(0.01)]],
      initialStock: [0, [Validators.required, Validators.min(0)]],
      minStock: [0, [Validators.required, Validators.min(0)]],
      supplierId: [null],
      branchId: [null],
      image: [null]
    });
  }

  ngOnInit() {
    this.loadData();
    if (this.product) {
       this.state.setFromProduct(this.product);
       this.form.patchValue(this.product);
    } else {
       this.state.reset();
       // Auto-set branch if not admin
       if (!this.isGlobalAdmin) {
          const branches = this.branchState.authorizedBranches();
          if (branches.length === 1) {
             this.form.get('branchId')?.setValue(branches[0].branchId);
             this.onBranchChange();
          }
       }
    }
  }

  ngOnChanges() {
    if (this.isActive) {
       this.openAnimation();
       if (this.product) {
          this.state.setFromProduct(this.product);
          this.form.patchValue(this.product);
       } else if (this.form.get('name')?.value === '' && !this.product) {
           this.state.reset();
       }
    } else {
       this.closeAnimation();
    }
  }

  private loadData() {
    this.categoryService.getAll().subscribe(res => this.categories = res);
    this.apiService.getSuppliers().subscribe(res => this.suppliers = res);
    
    if (this.isGlobalAdmin) {
       this.apiService.getBranches().subscribe(res => this.branches = res);
    } else {
       // For managers, we show their authorized branches
       this.apiService.getBranches().subscribe(allBranches => {
          const authIds = this.branchState.authorizedBranches().map(b => b.branchId);
          this.branches = allBranches.filter(b => authIds.includes(b.id));
       });
    }
  }

  private openAnimation() {
     gsap.to(this.panel.nativeElement, { x: 0, duration: 0.8, ease: 'expo.out' });
  }

  private closeAnimation() {
     if (this.panel) {
        gsap.to(this.panel.nativeElement, { x: '110%', duration: 0.6, ease: 'expo.in' });
     }
  }

  onBranchChange() {
    this.syncState();
    // Refresh suppliers when branch changes to ensure consistency
    this.apiService.getSuppliers().subscribe(res => {
       const branchId = this.form.get('branchId')?.value;
       this.suppliers = branchId ? res.filter(s => s.branchId === branchId) : res;
    });
  }

  syncState() {
     const val = this.form.value;
     Object.keys(val).forEach(key => {
        this.state.updateField(key as any, val[key]);
     });
  }

  nextStep() {
    if (this.isStepValid()) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  isStepValid(): boolean {
    const f = this.form;
    if (this.currentStep() === 1) return f.get('name')!.valid && f.get('categoryId')!.valid;
    if (this.currentStep() === 2) return f.get('price')!.valid && f.get('cost')!.valid;
    return true;
  }

  onCategoryCreated(id: string) {
     this.categoryService.getAll().subscribe(res => {
        this.categories = res;
        this.form.get('categoryId')?.setValue(id);
        this.syncState();
     });
  }

  onSupplierCreated(id: string) {
     this.apiService.getSuppliers().subscribe(res => {
        this.suppliers = res;
        this.form.get('supplierId')?.setValue(id);
        this.syncState();
     });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result;
        this.form.patchValue({ image: base64 });
        this.syncState();
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const data = this.form.value;
    const obs = this.product ? this.productApiService.updateProduct(this.product.id, data) : this.productApiService.createProduct(data);
    
    obs.subscribe({
      next: () => {
        this.loading = false;
        this.onSave.emit();
        this.close();
      },
      error: () => this.loading = false
    });
  }

  close() {
     this.currentStep.set(1);
     this.onCancel.emit();
  }
}
