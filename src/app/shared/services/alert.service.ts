import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { AlertModalComponent, AlertConfig } from '../components/alert-modal/alert-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private componentRef: ComponentRef<AlertModalComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  private ensureComponent(): AlertModalComponent {
    if (!this.componentRef) {
      // Criar o componente dinamicamente
      this.componentRef = createComponent(AlertModalComponent, {
        environmentInjector: this.injector
      });

      // Anexar à aplicação
      this.appRef.attachView(this.componentRef.hostView);

      // Adicionar ao DOM
      const domElem = (this.componentRef.hostView as any).rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
    }

    return this.componentRef.instance;
  }

  /**
   * Exibe um modal de sucesso
   */
  success(title: string, message: string): void {
    const component = this.ensureComponent();
    component.show({
      title,
      message,
      type: 'success'
    });
  }

  /**
   * Exibe um modal de erro
   */
  error(title: string, message: string): void {
    const component = this.ensureComponent();
    component.show({
      title,
      message,
      type: 'error'
    });
  }

  /**
   * Exibe um modal de aviso/warning
   */
  warning(title: string, message: string): void {
    const component = this.ensureComponent();
    component.show({
      title,
      message,
      type: 'warning'
    });
  }

  /**
   * Exibe um modal de informação
   */
  info(title: string, message: string): void {
    const component = this.ensureComponent();
    component.show({
      title,
      message,
      type: 'info'
    });
  }

  /**
   * Exibe um modal de confirmação com callbacks
   */
  confirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ): void {
    const component = this.ensureComponent();
    component.show({
      title,
      message,
      type: 'confirm',
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
  }

  /**
   * Exibe um modal customizado
   */
  show(config: AlertConfig): void {
    const component = this.ensureComponent();
    component.show(config);
  }
}
