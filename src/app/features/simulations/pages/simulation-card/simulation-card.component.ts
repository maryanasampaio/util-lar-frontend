import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimulationService } from '../../services/simulation.service';
import {
  SimulationRequest,
  SimulationResponse,
  CardBrand,
  SimulationState,
} from '../../models/simulation.model';
import { AlertService } from '../../../../shared/services/alert.service';

@Component({
  selector: 'app-simulation-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './simulation-card.component.html',
  styles: [],
})
export class SimulationCardComponent implements OnInit {
  // Estado da simulação
  state: SimulationState = {
    amount: 1000,
    installments: 1,
    selectedCard: 'visa',
    repasse: false,
    result: null,
    loading: false,
    error: null,
  };

  // Bandeiras disponíveis
  cardBrands: CardBrand[] = [];

  // Opções de parcelas
  installmentOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Estado da comparação
  showComparison = false;
  comparisonData: {
    withRepasse: SimulationResponse | null;
    withoutRepasse: SimulationResponse | null;
  } = {
    withRepasse: null,
    withoutRepasse: null,
  };

  constructor(
    private readonly simulationService: SimulationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.cardBrands = this.simulationService.getCardBrands();
  }

  /**
   * Executar simulação
   */
  simulate(): void {
    // Validações
    if (this.state.amount <= 0) {
      this.state.error = 'O valor deve ser maior que zero';
      return;
    }

    if (this.state.installments < 1 || this.state.installments > 12) {
      this.state.error = 'O número de parcelas deve estar entre 1 e 12';
      return;
    }

    // Limpar erro e resultado anterior
    this.state.error = null;
    this.state.result = null;
    this.state.loading = true;
    this.showComparison = false;

    const request: SimulationRequest = {
      amount: this.state.amount,
      installments: this.state.installments,
      card_brand: this.state.selectedCard,
      repasse: this.state.repasse,
    };

    this.simulationService.calculate(request).subscribe({
      next: (result) => {
        this.state.result = result;
        this.state.loading = false;
        this.showComparison = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.state.error =
          error.message || 'Erro ao calcular simulação. Tente novamente.';
        this.state.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Comparar cenários (com e sem repasse)
   */
  compareScenarios(): void {
    if (this.state.amount <= 0) {
      this.state.error = 'O valor deve ser maior que zero';
      return;
    }

    this.state.error = null;
    this.state.loading = true;
    this.showComparison = false;

    this.simulationService
      .compareScenarios(
        this.state.amount,
        this.state.installments,
        this.state.selectedCard
      )
      .subscribe({
        next: (result) => {
          this.comparisonData = {
            withRepasse: result.withRepasse,
            withoutRepasse: result.withoutRepasse,
          };
          this.showComparison = true;
          this.state.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.state.error =
            error.message || 'Erro ao comparar cenários. Tente novamente.';
          this.state.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  /**
   * Imprimir comparação de cenários
   */
  printComparison(): void {
    if (!this.comparisonData.withRepasse || !this.comparisonData.withoutRepasse) {
      this.alertService.warning('Comparação Necessária', 'Execute uma comparação primeiro!');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.alertService.warning('Pop-ups Bloqueados', 'Habilite pop-ups para imprimir');
      return;
    }

    const withRepasse = this.comparisonData.withRepasse;
    const withoutRepasse = this.comparisonData.withoutRepasse;
    const difference = withRepasse.net_amount - withoutRepasse.net_amount;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comparação de Cenários - Simulação de Venda</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            max-width: 1000px;
            margin: 0 auto;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            text-align: center;
          }
          .header-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
          }
          .comparison-card {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
          }
          .comparison-header {
            padding: 20px;
            color: white;
            text-align: center;
          }
          .comparison-header.without-repasse {
            background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          }
          .comparison-header.with-repasse {
            background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
          }
          .comparison-header h2 {
            margin: 0 0 5px 0;
            font-size: 1.5em;
          }
          .comparison-header p {
            margin: 0;
            font-size: 0.9em;
            opacity: 0.9;
          }
          .comparison-details {
            padding: 20px;
          }
          .comparison-row {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          .comparison-row.highlight {
            background: #fff3cd;
            font-weight: bold;
          }
          .comparison-row.total {
            background: #d4edda;
            font-weight: bold;
            font-size: 1.2em;
            border-bottom: none;
          }
          .negative {
            color: #dc3545;
          }
          .info {
            color: #17a2b8;
          }
          .summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            font-size: 1.2em;
            font-weight: bold;
          }
          @media print {
            body { padding: 20px; }
            .comparison-grid { gap: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>📊 Comparação de Cenários - Simulação de Venda no Cartão</h1>
        
        <div class="header-info">
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Bandeira:</strong> ${this.getCardBrandName(withRepasse.card_brand)}</p>
          <p><strong>Valor Base:</strong> ${this.formatCurrency(withRepasse.base_amount)}</p>
          <p><strong>Parcelas:</strong> ${withRepasse.installments}x</p>
        </div>

        <div class="comparison-grid">
          <div class="comparison-card">
            <div class="comparison-header without-repasse">
              <h2>Sem Repasse</h2>
              <p>Vendedor absorve os juros</p>
            </div>
            <div class="comparison-details">
              <div class="comparison-row">
                <span>Cliente paga:</span>
                <strong>${this.formatCurrency(withoutRepasse.final_amount)}</strong>
              </div>
              <div class="comparison-row">
                <span>Parcela:</span>
                <strong>${this.formatCurrency(withoutRepasse.installment_value)}</strong>
              </div>
              <div class="comparison-row highlight">
                <span>Taxa Retida:</span>
                <strong class="negative">-${this.formatCurrency(withoutRepasse.operator_fee)}</strong>
              </div>
              <div class="comparison-row total">
                <span>Vendedor recebe:</span>
                <strong>${this.formatCurrency(withoutRepasse.net_amount)}</strong>
              </div>
            </div>
          </div>

          <div class="comparison-card">
            <div class="comparison-header with-repasse">
              <h2>Com Repasse</h2>
              <p>Cliente paga os juros</p>
            </div>
            <div class="comparison-details">
              <div class="comparison-row">
                <span>Cliente paga:</span>
                <strong>${this.formatCurrency(withRepasse.final_amount)}</strong>
              </div>
              <div class="comparison-row">
                <span>Parcela:</span>
                <strong>${this.formatCurrency(withRepasse.installment_value)}</strong>
              </div>
              <div class="comparison-row highlight">
                <span>Juros:</span>
                <strong class="info">+${this.formatCurrency(withRepasse.interest_total)}</strong>
              </div>
              <div class="comparison-row total">
                <span>Vendedor recebe:</span>
                <strong>${this.formatCurrency(withRepasse.net_amount)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="summary">
          💡 <strong>Diferença para o vendedor:</strong> 
          ${this.formatCurrency(difference)} a mais com repasse
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.documentElement.innerHTML = html;
    printWindow.document.close();
  }

  /**
   * Imprimir resultado da simulação
   */
  printResult(): void {
    if (!this.state.result) {
      this.alertService.warning('Simulação Necessária', 'Execute uma simulação primeiro!');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.alertService.warning('Pop-ups Bloqueados', 'Habilite pop-ups para imprimir');
      return;
    }

    const result = this.state.result;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Simulação de Venda no Cartão</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          .header-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .result-section {
            margin: 30px 0;
          }
          .result-row {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          .result-row.highlight {
            background: #fff3cd;
            font-weight: bold;
          }
          .result-row.highlight-success {
            background: #d4edda;
            font-weight: bold;
            font-size: 1.1em;
          }
          .result-row.highlight-info {
            background: #cce5ff;
          }
          .result-row.highlight-warning {
            background: #fff3cd;
          }
          .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
          }
          .badge-repasse {
            background: #28a745;
            color: white;
          }
          .badge-no-repasse {
            background: #ffc107;
            color: #333;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>💳 Simulação de Venda no Cartão</h1>
        
        <div class="header-info">
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Tipo:</strong> 
            <span class="badge ${result.repasse ? 'badge-repasse' : 'badge-no-repasse'}">
              ${result.repasse ? 'Com Repasse' : 'Sem Repasse'}
            </span>
          </p>
        </div>

        <div class="result-section">
          <h2>Detalhes da Simulação</h2>
          
          <div class="result-row">
            <span>Bandeira:</span>
            <span>${this.getCardBrandName(result.card_brand)}</span>
          </div>
          
          <div class="result-row">
            <span>Parcelas:</span>
            <span>${result.installments}x</span>
          </div>
          
          <div class="result-row highlight">
            <span>Valor Base:</span>
            <span>${this.formatCurrency(result.base_amount)}</span>
          </div>
          
          <div class="result-row highlight">
            <span>Valor Total:</span>
            <span>${this.formatCurrency(result.final_amount)}</span>
          </div>
          
          <div class="result-row">
            <span>Valor da Parcela:</span>
            <span>${this.formatCurrency(result.installment_value)}</span>
          </div>
          
          ${result.repasse ? `
            <div class="result-row highlight-info">
              <span>💰 Juros (pago pelo cliente):</span>
              <span>${this.formatCurrency(result.interest_total)}</span>
            </div>
          ` : `
            <div class="result-row highlight-warning">
              <span>💸 Taxa Retida (pela operadora):</span>
              <span>${this.formatCurrency(result.operator_fee)}</span>
            </div>
          `}
          
          <div class="result-row highlight-success">
            <span>✅ Valor Líquido (vendedor recebe):</span>
            <span>${this.formatCurrency(result.net_amount)}</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.documentElement.innerHTML = html;
    printWindow.document.close();
  }

  /**
   * Gerar imagem da simulação para o cliente
   * Mostra apenas informações essenciais para o comprador
   */
  async generateImage(): Promise<void> {
    if (!this.state.result) {
      this.alertService.warning('Simulação Necessária', 'Execute uma simulação primeiro!');
      return;
    }

    try {
      // Importar html-to-image dinamicamente
      const htmlToImage = await import(/* @vite-ignore */ 'html-to-image');
      
      const result = this.state.result;
      
      // Criar container temporário visível
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
      `;
      
      // Criar elemento com o conteúdo para o cliente
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        width: 600px;
        padding: 50px;
        background: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        border: 1px solid #e5e7eb;
        box-sizing: border-box;
      `;
      
      const hasInterest = result.repasse && result.interest_total > 0;
      
      tempDiv.innerHTML = `
        <div style="margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #d1d5db;">
          <div style="color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px;">
            Infinity Pay
          </div>
          <h1 style="color: #111827; font-size: 28px; margin: 0; font-weight: 600; letter-spacing: -0.5px;">
            Simulação de Pagamento
          </h1>
        </div>
        
        <div style="margin-bottom: 35px;">
          <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
              Valor Total a Pagar
            </p>
            <p style="color: #111827; font-size: 42px; margin: 0; font-weight: 700; letter-spacing: -1px;">
              ${this.formatCurrency(result.final_amount)}
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 16px 0; color: #6b7280; font-size: 15px;">Número de parcelas</td>
              <td style="padding: 16px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${result.installments}x</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 16px 0; color: #6b7280; font-size: 15px;">Valor de cada parcela</td>
              <td style="padding: 16px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${this.formatCurrency(result.installment_value)}</td>
            </tr>
            ${hasInterest ? `
              <tr>
                <td style="padding: 16px 0; color: #6b7280; font-size: 15px;">Juros inclusos</td>
                <td style="padding: 16px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${this.formatCurrency(result.interest_total)}</td>
              </tr>
            ` : `
              <tr>
                <td style="padding: 16px 0; color: #059669; font-size: 15px;" colspan="2">Parcelamento sem juros</td>
              </tr>
            `}
          </table>
        </div>
        
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.6; text-align: center;">
            Simulação gerada em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br/>
            Valores sujeitos a alteração conforme condições de pagamento
          </p>
        </div>
      `;
      
      container.appendChild(tempDiv);
      document.body.appendChild(container);
      
      // Aguardar renderização completa
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Gerar imagem
      const dataUrl = await htmlToImage.toPng(tempDiv, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      // Remover elementos temporários
      container.remove();
      
      // Download da imagem
      const filename = `simulacao-pagamento-${Date.now()}.png`;
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      // Em mobile, usar Web Share API para salvar na galeria
      if (isMobile && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Simulação de Pagamento' });
          this.alertService.success('Imagem Gerada', 'Imagem gerada com sucesso!');
          return;
        }
      }

      // Fallback: download tradicional (desktop ou mobile sem suporte)
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      this.alertService.success('Imagem Gerada', 'Imagem gerada com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao gerar imagem:', error);
      
      if (error.message?.includes('html-to-image') || error.code === 'ERR_MODULE_NOT_FOUND') {
        this.state.error = 
          'Para gerar imagens, instale o pacote: npm install html-to-image --save';
      } else {
        this.state.error = `Erro ao gerar imagem: ${error.message || 'Tente novamente'}`;
      }
    }
  }

  /**
   * Formatar valor em Real
   */
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  /**
   * Formatar percentual
   */
  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Obter nome da bandeira
   */
  getCardBrandName(id: string): string {
    const brand = this.cardBrands.find((b) => b.id === id);
    return brand ? brand.name : id;
  }

  /**
   * Resetar formulário
   */
  reset(): void {
    this.state = {
      amount: 1000,
      installments: 1,
      selectedCard: 'visa',
      repasse: false,
      result: null,
      loading: false,
      error: null,
    };
    this.showComparison = false;
    this.comparisonData = {
      withRepasse: null,
      withoutRepasse: null,
    };
  }
}
