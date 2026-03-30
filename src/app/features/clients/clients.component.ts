import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { ToastService } from '../../core/services/toast.service';
import { Client, CreateClient } from '../../core/models';
import { FlipTriggerDirective } from '../../shared/directives/flip-trigger.directive';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, FlipTriggerDirective],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private anime = inject(FlipAnimationService);
  private toast = inject(ToastService);
  private sidebar = inject(SidebarService);

  @ViewChildren('row') rows!: QueryList<ElementRef>;

  clients: Client[] = [];
  loading = true;
  showForm = false;
  selectedClient: Client | null = null;
  saving = false;
  submitted = false;


  form: CreateClient = { name: '', document: '', clientType: 0, email: '', phone: '', address: '' };

  ngOnInit(): void { 
    this.load(); 
    this.sidebar.setActions([
      {
        label: 'Nuevo Cliente',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>',
        handler: () => this.openForm(),
        primary: true
      }
    ]);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  load(): void {
    this.loading = true;
    this.api.getClients().subscribe({
      next: (res) => { 
        this.clients = res; 
        this.loading = false; 
        requestAnimationFrame(() => {
          this.anime.staggerIn(this.rows.map(r => r.nativeElement));
        });
      },
      error: () => this.loading = false
    });
  }

  openForm() {
    const trigger = document.querySelector('[data-flip-id="client-action"]') as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger);

    this.selectedClient = null;
    this.submitted = false;
    this.form = { name: '', document: '', clientType: 0, email: '', phone: '', address: '' };
    this.showForm = true;

    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  editClient(c: Client) {
    const trigger = document.querySelector(`[appFlipTrigger="client-row-${c.id}"]`) as HTMLElement;
    const triggerRect = trigger?.getBoundingClientRect();
    const state = this.anime.getState(trigger || '[data-flip-id="client-action"]');

    this.selectedClient = c;
    this.submitted = false;
    this.form = { 
      name: c.name, 
      document: c.document, 
      clientType: c.clientType, 
      email: c.email || '', 
      phone: c.phone || '', 
      address: c.address || '' 
    };
    this.showForm = true;
    requestAnimationFrame(() => {
      this.anime.from(state, { borderRadius: '20px' });
      const panel = document.querySelector('.inline-form-panel') as HTMLElement;
      
      if (panel) {
        this.anime.animateModal(panel, triggerRect);
        setTimeout(() => this.anime.animateContent(panel), 100);
      }
    });
  }

  closeForm() {
    const state = this.anime.getState('[data-flip-id="client-action"]');
    const panel = document.querySelector('.inline-form-panel') as HTMLElement;

    this.anime.animateModalOut(panel)?.eventCallback('onComplete', () => {
      this.showForm = false;
      this.selectedClient = null;
      this.anime.from(state, { borderRadius: '20px' });
    });
  }

  save(): void {
    this.submitted = true;
    if (!this.form.name || !this.form.document) return;
    this.saving = true;
    const obs$ = this.selectedClient 
      ? this.api.updateClient(this.selectedClient.id, this.form)
      : this.api.createClient(this.form);

    (obs$ as any).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(this.selectedClient ? 'Cliente actualizado' : 'Cliente creado');
        this.closeForm();
        this.load();
      },
      error: (err: any) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Error al guardar cliente');
      }
    });
  }
}
