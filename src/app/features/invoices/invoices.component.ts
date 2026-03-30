import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Invoice, Product, CreateInvoice, Client, Branch, InvoiceStatus } from '../../core/models';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { BranchStateService } from '../../core/services/branch-state.service';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { toObservable } from '@angular/core/rxjs-interop';
import { SidebarService } from '../../core/services/sidebar.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipTriggerDirective],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private anime = inject(FlipAnimationService);
  public branchState = inject(BranchStateService);
  private sidebar = inject(SidebarService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  // Expose enum to template
  InvoiceStatus = InvoiceStatus;

  invoices: Invoice[] = [];
  clients: Client[] = [];
  products: Product[] = [];
  
  loading = true;
  showForm = false;
  saving = false;
  error = '';

  clientId = '';
  customerName = '';
  customerDocument = '';
  notes = '';
  subtotal = 0;
  taxAmount = 0;
  totalAmount = 0;
  items: any[] = [];
  stockWarnings: string[] = [];
  
  // Settings
  isTaxEnabled = true;
  defaultTaxRate = 0.18;

  cancellingIds = new Set<string>();
  pdfLoadingIds = new Set<string>();

  constructor() {
    toObservable(this.branchState.selectedBranchId).subscribe(() => {
      this.load();
    });
  }

  ngOnInit(): void {
    this.api.getClients().subscribe({ next: (c) => this.clients = c });
    this.api.getProducts().subscribe({ next: (res) => this.products = res.items });
    this.loadSettings();
    
    this.sidebar.setActions([
      { 
        label: 'Nueva Factura', 
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"></path></svg>',
        handler: () => this.openForm(),
        primary: true
      },
      {
        label: 'Exportar Excel',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line></svg>',
        handler: () => this.api.exportInvoicesExcel().subscribe(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url;
          a.download = `Facturas_${new Date().toISOString().slice(0,10)}.xlsx`;
          a.click(); URL.revokeObjectURL(url);
        }),
      }
    ]);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  load() {
    this.loading = true;
    this.api.getInvoices(1, 50, undefined, this.branchState.selectedBranchId() ?? undefined).subscribe({ 
      next: (res) => { 
        this.invoices = res.items; 
        this.loading = false; 
      }, 
      error: () => this.loading = false 
    });
  }

  loadSettings() {
    this.api.getSystemSettings().subscribe(settings => {
      const taxEnabled = settings.find(s => s.key === 'IsTaxEnabled');
      if (taxEnabled) this.isTaxEnabled = taxEnabled.value.toLowerCase() === 'true';

      const taxRate = settings.find(s => s.key === 'DefaultTaxRate');
      if (taxRate) this.defaultTaxRate = parseFloat(taxRate.value) / 100;
    });
  }


  openForm() {
    const trigger = document.querySelector('[data-flip-id="btn-new-invoice"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger);

    this.clientId = ''; 
    this.customerName = '';
    this.customerDocument = '';
    this.notes = ''; 
    this.items = [];
    this.subtotal = 0; this.taxAmount = 0; this.totalAmount = 0;
    this.stockWarnings = []; this.error = '';
    this.showForm = true;
    requestAnimationFrame(() => {
      if (state) this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  closeForm() {
    const state = this.anime.getState('[data-flip-id="btn-new-invoice"]');
    const panel = document.querySelector('.inline-form-panel') as HTMLElement;
    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.showForm = false;
      this.anime.from(state, { borderRadius: '20px' });
    });
  }

  addLine() { this.items.push({ productId: '', quantity: 1, unitPrice: 0 }); }
  removeLine(i: number) { this.items.splice(i, 1); this.updateTotal(); }
  
  onProductSelect(line: any) {
    const p = this.products.find(x => x.id === line.productId);
    if (p) {
      line.unitPrice = p.price;
      line.productStock = p.stock;
      this.updateTotal();
    }
  }

  updateTotal() {
    this.subtotal = this.items.reduce((sum, l) => sum + (l.quantity * l.unitPrice), 0);
    this.taxAmount = this.isTaxEnabled ? this.subtotal * this.defaultTaxRate : 0;
    this.totalAmount = this.subtotal + this.taxAmount;

    // Stock validation
    this.stockWarnings = this.items
      .filter(l => l.productId && l.productStock !== undefined && l.quantity > l.productStock)
      .map(l => {
        const p = this.products.find(x => x.id === l.productId);
        return `${p?.name ?? l.productId} (solicitado: ${l.quantity}, disponible: ${l.productStock})`;
      });
  }

  save() {
    if (this.items.length === 0 || this.stockWarnings.length > 0) return;
    this.saving = true;
    const data: CreateInvoice = { 
        clientId: this.clientId || null, 
        customerName: this.customerName || undefined,
        customerDocument: this.customerDocument || undefined,
        branchId: this.branchState.selectedBranchId() ?? undefined,
        items: this.items.map(x => ({ productId: x.productId, quantity: x.quantity })),
        taxRate: this.isTaxEnabled ? this.defaultTaxRate : 0,
        notes: this.notes || undefined
    };

    this.api.createInvoice(data).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Factura emitida correctamente');
        this.closeForm();
        this.load();
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Error al generar la factura';
      }
    });
  }

  async cancelInvoice(inv: Invoice) {
    const ok = await this.confirm.confirm(`¿Anular la factura ${inv.invoiceNumber}? Esta acción revertirá el stock.`);
    if (!ok) return;
    this.cancellingIds.add(inv.id);
    this.api.cancelInvoice(inv.id).subscribe({
      next: () => {
        this.cancellingIds.delete(inv.id);
        this.toast.success(`Factura ${inv.invoiceNumber} anulada. Stock revertido.`);
        this.load();
      },
      error: (err) => {
        this.cancellingIds.delete(inv.id);
        this.toast.error(err.error?.message || 'Error al anular la factura');
      }
    });
  }

  downloadPdf(inv: Invoice) {
    this.pdfLoadingIds.add(inv.id);
    this.api.getInvoicePdfUrl(inv.id).subscribe({
      next: (res) => {
        // Use the new DocumentsController to proxy the download
        this.api.downloadDocument(res.url).subscribe({
          next: (blob) => {
            this.pdfLoadingIds.delete(inv.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Factura_${inv.invoiceNumber}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: () => {
            this.pdfLoadingIds.delete(inv.id);
            this.toast.error('Error al descargar el archivo PDF');
          }
        });
      },
      error: () => {
        this.pdfLoadingIds.delete(inv.id);
        this.toast.error('Error al generar el PDF de la factura');
      }
    });
  }
}
