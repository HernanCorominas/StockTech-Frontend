import { Component, OnInit, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, SystemSetting } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private toast = inject(ToastService);
  private sidebar = inject(SidebarService);

  @ViewChild('settingsSidebar', { static: true }) settingsSidebar!: TemplateRef<any>;

  loading = true;
  saving = false;
  profitMarginValue: number = 30;
  
  isTaxEnabled: boolean = true;
  defaultTaxRate: number = 18;

  showSecurityModal = false;
  confirmPassword = '';
  pendingSettingUpdate: { key: string, value: string } | null = null;

  ngOnInit() {
    this.sidebar.setTemplate(this.settingsSidebar);
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  loadSettings() {
    this.loading = true;
    this.settingsService.getAll().subscribe({
      next: (settings) => {
        const margin = settings.find(s => s.key === 'ExpectedProfitMargin');
        if (margin) this.profitMarginValue = parseFloat(margin.value);

        const taxEnabled = settings.find(s => s.key === 'IsTaxEnabled');
        if (taxEnabled) this.isTaxEnabled = taxEnabled.value.toLowerCase() === 'true';

        const taxRate = settings.find(s => s.key === 'DefaultTaxRate');
        if (taxRate) this.defaultTaxRate = parseFloat(taxRate.value);

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  saveProfitMargin() {
    if (this.profitMarginValue < 0) {
      this.toast.error('El margen no puede ser negativo.');
      return;
    }
    this.updateSetting('ExpectedProfitMargin', this.profitMarginValue.toString());
  }

  onTaxToggle(event: any) {
    const newValue = event.target.checked;
    if (!newValue && this.isTaxEnabled) {
      this.pendingSettingUpdate = { key: 'IsTaxEnabled', value: 'false' };
      this.showSecurityModal = true;
      event.target.checked = true;
      return;
    }
    this.updateSetting('IsTaxEnabled', newValue.toString());
  }

  saveTaxRate() {
    this.updateSetting('DefaultTaxRate', this.defaultTaxRate.toString());
  }

  private updateSetting(key: string, value: string, password?: string) {
    this.saving = true;
    this.settingsService.upsert(key, { value, password }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('Configuración persistida exitosamente.');
        this.loadSettings();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Error al persistir ajuste.');
      }
    });
  }

  confirmSecurityAction() {
    if (!this.confirmPassword || !this.pendingSettingUpdate) return;
    this.updateSetting(this.pendingSettingUpdate.key, this.pendingSettingUpdate.value, this.confirmPassword);
    this.showSecurityModal = false;
    this.confirmPassword = '';
    this.pendingSettingUpdate = null;
  }

  cancelSecurityAction() {
    this.showSecurityModal = false;
    this.confirmPassword = '';
    this.pendingSettingUpdate = null;
    this.loadSettings();
  }
}
