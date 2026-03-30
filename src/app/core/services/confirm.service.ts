import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  show: boolean;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  state = signal<ConfirmState>({
    show: false,
    title: 'Confirmar',
    message: ''
  });

  confirm(message: string, title: string = 'Confirmar acción'): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        show: true,
        title,
        message,
        resolve
      });
    });
  }

  handle(value: boolean) {
    const currentState = this.state();
    if (currentState.resolve) {
      currentState.resolve(value);
    }
    this.state.set({ ...currentState, show: false, resolve: undefined });
  }
}
