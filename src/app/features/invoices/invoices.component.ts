import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Invoice, Client, Product, CreateInvoice, CreateInvoiceItem, Branch } from '../../core/models/models';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <div class="page-header">
    <div>
      <h1>Facturación</h1>
      <p>{{ totalCount }} facturas en total</p>
    </div>
    <div style="display: flex; gap: 10px; align-items: center">
      <input type="text" [(ngModel)]="search" (keyup.enter)="load(1)" placeholder="Buscar # factura o cliente..." style="padding: 8px; width: 250px" />
      <button class="btn btn--secondary" (click)="load(1)">Buscar</button>
      <button class="btn btn--primary" (click)="openCreate()">+ Nueva Factura</button>
    </div>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <div class="card" *ngIf="!loading">
    <table class="data-table">
      <thead>
        <tr>
          <th># Factura</th>
          <th>Cliente</th>
          <th>Sucursal</th>
          <th>Fecha</th>
          <th>Subtotal</th>
          <th>ITBIS</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let inv of invoices">
          <td class="fw-bold font-mono text-accent">{{ inv.invoiceNumber }}</td>
          <td>{{ inv.clientName }}</td>
          <td>{{ inv.branchName || '—' }}</td>
          <td>{{ inv.invoiceDate | date:'dd/MM/yyyy' }}</td>
          <td>RD$ {{ inv.subtotal | number:'1.2-2' }}</td>
          <td>RD$ {{ inv.taxAmount | number:'1.2-2' }}</td>
          <td class="fw-bold text-success">RD$ {{ inv.total | number:'1.2-2' }}</td>
          <td><span class="badge badge--success">{{ inv.statusName }}</span></td>
          <td>
            <button class="btn btn--ghost btn--sm print-btn" (click)="printInvoice(inv)" title="Imprimir / Guardar PDF">
              🖨 Imprimir
            </button>
          </td>
        </tr>
        <tr *ngIf="invoices.length === 0">
          <td colspan="9" style="text-align:center;padding:40px" class="text-muted">Sin facturas registradas.</td>
        </tr>
      </tbody>
    </table>
    <div style="display: flex; justify-content: space-between; padding: 16px; align-items: center; border-top: 1px solid #ddd">
      <span class="text-muted" style="font-size: 0.9rem">Mostrando página {{ page }}</span>
      <div style="display: flex; gap: 8px">
        <button class="btn btn--secondary" style="padding: 6px 12px; font-size: 0.9rem" [disabled]="page === 1" (click)="load(page - 1)">Anterior</button>
        <button class="btn btn--secondary" style="padding: 6px 12px; font-size: 0.9rem" [disabled]="invoices.length < pageSize" (click)="load(page + 1)">Siguiente</button>
      </div>
    </div>
  </div>
</div>

<!-- Create Invoice Modal -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal($event)">
  <div class="modal" style="max-width:680px" (click)="$event.stopPropagation()">
    <h3>Nueva Factura</h3>
    <div *ngIf="error" class="alert alert--error">{{ error }}</div>

    <div class="form-row">
      <div class="form-group">
        <label>Cliente *</label>
        <select [(ngModel)]="selectedClientId">
          <option value="">-- Selecciona cliente --</option>
          <option *ngFor="let c of clients" [value]="c.id">{{ c.name }} ({{ c.document }})</option>
        </select>
      </div>
      <div class="form-group">
        <label>Sucursal (Opcional)</label>
        <select [(ngModel)]="branchId">
          <option value="">-- Selecciona sucursal --</option>
          <option *ngFor="let b of branches" [value]="b.id">{{ b.name }}</option>
        </select>
      </div>
    </div>

    <div class="form-row" style="margin-top: 12px">
      <div class="form-group">
        <label>ITBIS (%)</label>
        <select [(ngModel)]="taxRate">
          <option [value]="0">0% (Exento)</option>
          <option [value]="0.18">18% (ITBIS)</option>
        </select>
      </div>
      <div class="form-group"></div> <!-- Spacer -->
    </div>

    <!-- Product Lines -->
    <div class="invoice-items">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;margin-top:12px">
        <label style="font-size:0.8rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--text-secondary)">Productos</label>
        <button class="btn btn--secondary" style="padding:6px 12px;font-size:0.8rem" (click)="addLine()">+ Agregar</button>
      </div>

      <div *ngFor="let line of lines; let i = index" class="invoice-line">
        <select [(ngModel)]="line.productId" (ngModelChange)="onProductChange(i)" style="flex:2;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text-primary)">
          <option value="">-- Producto --</option>
          <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Stock: {{ p.stock }}) — RD$ {{ p.price | number:'1.2-2' }}</option>
        </select>
        <input type="number" [(ngModel)]="line.quantity" placeholder="Cant." min="1" (ngModelChange)="calcTotal()"
          style="flex:0.5;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text-primary)" />
        <div style="flex:1;padding:8px;color:var(--success);font-weight:700">
          RD$ {{ getLineTotal(i) | number:'1.2-2' }}
        </div>
        <button class="btn btn--danger" style="padding:6px 10px;font-size:0.8rem" (click)="removeLine(i)">✕</button>
      </div>
    </div>

    <!-- Totals -->
    <div class="invoice-totals" *ngIf="lines.length > 0">
      <div class="total-row"><span>Subtotal:</span><span>RD$ {{ subtotal | number:'1.2-2' }}</span></div>
      <div class="total-row"><span>ITBIS ({{ taxRate * 100 }}%):</span><span>RD$ {{ taxAmount | number:'1.2-2' }}</span></div>
      <div class="total-row total-row--final"><span>TOTAL:</span><span>RD$ {{ total | number:'1.2-2' }}</span></div>
    </div>

    <div class="form-group" style="margin-top:16px">
      <label>Notas</label>
      <input [(ngModel)]="notes" placeholder="Notas opcionales..." />
    </div>

    <div class="modal__footer">
      <button class="btn btn--secondary" (click)="showModal = false">Cancelar</button>
      <button class="btn btn--primary" (click)="create()" [disabled]="saving">
        {{ saving ? 'Creando...' : '🖨 Crear e Imprimir' }}
      </button>
    </div>
  </div>
</div>
  `,
  styles: [`
    .invoice-line {
      display: flex; gap: 8px; align-items: center;
      margin-bottom: 8px; padding: 8px;
      background: var(--glass); border-radius: 8px;
    }
    .invoice-totals {
      margin-top: 16px; padding: 16px;
      background: var(--bg-secondary); border-radius: 8px;
      border: 1px solid var(--border);
    }
    .total-row {
      display: flex; justify-content: space-between;
      padding: 6px 0; color: var(--text-secondary); font-size: 0.9rem;
      &--final { color: var(--text-primary); font-weight: 700; font-size: 1.1rem; border-top: 1px solid var(--border); margin-top: 8px; padding-top: 8px; }
    }
    .print-btn {
      font-size: 0.8rem;
      padding: 5px 10px;
      white-space: nowrap;
    }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  clients: Client[] = [];
  products: Product[] = [];
  branches: Branch[] = [];
  loading = true;
  showModal = false;
  saving = false;
  error = '';

  selectedClientId = '';
  branchId = '';
  taxRate = 0.18;
  notes = '';
  lines: { productId: string; quantity: number }[] = [];
  subtotal = 0;
  taxAmount = 0;
  total = 0;

  page = 1;
  pageSize = 10;
  search = '';
  totalCount = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
    this.api.getClients().subscribe({ next: (c) => this.clients = c });
    this.api.getProducts().subscribe({ next: (p) => this.products = p.items });
    this.api.getBranches().subscribe({ next: (b) => this.branches = b });
  }

  load(pageIndex?: number): void {
    if (pageIndex) this.page = pageIndex;
    this.loading = true;
    this.api.getInvoices(this.page, this.pageSize, this.search).subscribe({ 
        next: (p) => { 
            this.invoices = p.items; 
            this.totalCount = p.totalCount;
            this.loading = false; 
        }, 
        error: () => this.loading = false 
    });
  }

  openCreate(): void {
    this.selectedClientId = ''; this.branchId = ''; this.taxRate = 0.18; this.notes = ''; this.lines = []; this.error = '';
    this.subtotal = 0; this.taxAmount = 0; this.total = 0;
    this.showModal = true;
  }

  addLine(): void { this.lines.push({ productId: '', quantity: 1 }); }
  removeLine(i: number): void { this.lines.splice(i, 1); this.calcTotal(); }

  onProductChange(i: number): void { this.calcTotal(); }

  getLineTotal(i: number): number {
    const line = this.lines[i];
    const prod = this.products.find(p => p.id === line.productId);
    return prod ? prod.price * (line.quantity || 0) : 0;
  }

  calcTotal(): void {
    this.subtotal = this.lines.reduce((sum, _, i) => sum + this.getLineTotal(i), 0);
    this.taxAmount = this.subtotal * Number(this.taxRate);
    this.total = this.subtotal + this.taxAmount;
  }

  create(): void {
    if (!this.selectedClientId) { this.error = 'Selecciona un cliente.'; return; }
    const validLines = this.lines.filter(l => l.productId && l.quantity > 0);
    if (validLines.length === 0) { this.error = 'Agrega al menos un producto.'; return; }

    this.saving = true; this.error = '';
    const payload: CreateInvoice = {
      clientId: this.selectedClientId,
      branchId: this.branchId || undefined,
      items: validLines.map(l => ({ productId: l.productId, quantity: l.quantity })),
      taxRate: Number(this.taxRate),
      notes: this.notes
    };

    this.api.createInvoice(payload).subscribe({
      next: (inv) => {
        this.invoices.unshift(inv);
        this.showModal = false;
        this.saving = false;
        this.api.getProducts().subscribe(p => this.products = p.items); // refresh stock
        // Auto-open print dialog after invoice is created
        setTimeout(() => this.printInvoice(inv), 300);
      },
      error: (e) => { this.error = e.error?.message ?? 'Error al crear factura.'; this.saving = false; }
    });
  }

  closeModal(e: Event): void { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false; }

  // ─── Invoice Print ────────────────────────────────────────────────────────────
  printInvoice(inv: Invoice): void {
    const client = this.clients.find(c => c.id === inv.clientId);
    const clientAddress = client?.address ?? '';
    const clientPhone   = client?.phone   ?? '';
    const clientEmail   = client?.email   ?? '';

    const itemsHtml = (inv.items && inv.items.length > 0)
      ? inv.items.map(item => `
          <tr>
            <td>${item.productName}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">RD$ ${this.fmt(item.unitPrice)}</td>
            <td style="text-align:right"><strong>RD$ ${this.fmt(item.lineTotal)}</strong></td>
          </tr>`).join('')
      : `<tr><td colspan="4" style="text-align:center;color:#999">Sin ítems</td></tr>`;

    const notesHtml = inv.notes
      ? `<div class="notes-box"><strong>Notas:</strong> ${inv.notes}</div>`
      : '';

    const printDate = new Date().toLocaleDateString('es-DO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Factura ${inv.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 2.5px solid #f59e0b;
    }

    .brand { display: flex; flex-direction: column; gap: 4px; }
    .brand-name {
      font-size: 26px;
      font-weight: 800;
      color: #0a0e17;
      letter-spacing: -0.03em;
    }
    .brand-name span { color: #f59e0b; }
    .brand-tagline { font-size: 11px; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; }

    .invoice-meta { text-align: right; }
    .invoice-number {
      font-size: 22px;
      font-weight: 700;
      color: #f59e0b;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.02em;
    }
    .invoice-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .invoice-date { font-size: 12px; color: #4b5563; margin-top: 6px; }
    .status-badge {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 10px;
      background: #d1fae5;
      color: #065f46;
      border-radius: 99px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ── Parties ── */
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .party-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px 18px;
    }
    .party-box.client-box { border-left: 3px solid #f59e0b; }
    .party-box.company-box { border-left: 3px solid #06b6d4; }

    .party-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9ca3af;
      margin-bottom: 10px;
    }
    .party-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .party-detail { font-size: 11.5px; color: #4b5563; margin-bottom: 2px; }

    /* ── Items Table ── */
    .items-section { margin-bottom: 28px; }
    .section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9ca3af;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead tr {
      background: #0a0e17;
      color: #fff;
    }

    thead th {
      padding: 10px 14px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      text-align: left;
    }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }

    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr:hover { background: #fff8e7; }

    tbody td {
      padding: 10px 14px;
      font-size: 12.5px;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    tbody tr:last-child td { border-bottom: none; }

    /* ── Totals ── */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    .totals-box {
      width: 280px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 9px 16px;
      font-size: 12.5px;
      color: #4b5563;
    }
    .totals-row + .totals-row { border-top: 1px solid #f3f4f6; }
    .totals-row.total-final {
      background: #0a0e17;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
    }
    .totals-row.total-final span:last-child { color: #f59e0b; }

    /* ── Notes ── */
    .notes-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
      color: #92400e;
      margin-bottom: 24px;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-left { font-size: 11px; color: #6b7280; }
    .footer-right { font-size: 11px; color: #9ca3af; text-align: right; }
    .footer-thanks { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 3px; }

    /* ── Print styles ── */
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <div class="brand-name">Stock<span>Tech</span></div>
      <div class="brand-tagline">Sistema de Facturación &amp; Inventario</div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-label">Comprobante Fiscal</div>
      <div class="invoice-number">${inv.invoiceNumber}</div>
      <div class="invoice-date">📅 ${new Date(inv.invoiceDate).toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      <div class="status-badge">✓ ${inv.statusName}</div>
    </div>
  </div>

  <!-- PARTIES -->
  <div class="parties">
    <div class="party-box company-box">
      <div class="party-title">Emisor</div>
      <div class="party-name">StockTech S.R.L.</div>
      <div class="party-detail">📍 Sucursal: ${inv.branchName || 'Principal'}</div>
      <div class="party-detail">🏢 República Dominicana</div>
      <div class="party-detail">🌐 stocktech.app</div>
    </div>
    <div class="party-box client-box">
      <div class="party-title">Facturado a</div>
      <div class="party-name">${inv.clientName}</div>
      <div class="party-detail">📋 ${inv.clientDocument}</div>
      ${clientPhone   ? `<div class="party-detail">📞 ${clientPhone}</div>` : ''}
      ${clientEmail   ? `<div class="party-detail">✉️ ${clientEmail}</div>` : ''}
      ${clientAddress ? `<div class="party-detail">📍 ${clientAddress}</div>` : ''}
    </div>
  </div>

  <!-- ITEMS -->
  <div class="items-section">
    <div class="section-title">Detalle de Productos / Servicios</div>
    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Cant.</th>
          <th>Precio Unit.</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
  </div>

  <!-- TOTALS -->
  <div class="totals-wrapper">
    <div class="totals-box">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>RD$ ${this.fmt(inv.subtotal)}</span>
      </div>
      <div class="totals-row">
        <span>ITBIS (${Math.round(inv.taxRate * 100)}%)</span>
        <span>RD$ ${this.fmt(inv.taxAmount)}</span>
      </div>
      <div class="totals-row total-final">
        <span>TOTAL</span>
        <span>RD$ ${this.fmt(inv.total)}</span>
      </div>
    </div>
  </div>

  <!-- NOTES -->
  ${notesHtml}

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-left">
      <div class="footer-thanks">¡Gracias por su preferencia!</div>
      <div>Este documento fue generado el ${printDate}</div>
    </div>
    <div class="footer-right">
      <div>StockTech — Sistema de Gestión Empresarial</div>
      <div>República Dominicana</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (printWin) {
      printWin.document.write(html);
      printWin.document.close();
    }
  }

  private fmt(n: number): string {
    return (n ?? 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
