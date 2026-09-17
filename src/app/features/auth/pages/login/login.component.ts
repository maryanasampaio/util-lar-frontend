/**
 * LOGIN COMPONENT
 *
 * Responsabilidade: Interface de login (Camada de Apresentação)
 *
 * O QUE FAZ:
 * ✅ Captura username e password do usuário
 * ✅ Valida campos obrigatórios
 * ✅ Controla estados da UI (loading, erro)
 * ✅ Chama AuthService.login()
 * ✅ Exibe mensagens de erro
 * ✅ Gerencia navegação (Router)
 *
 * O QUE NÃO FAZ:
 * ❌ Comunicação com API (responsabilidade do Repository)
 * ❌ Salvar token (responsabilidade do Service)
 * ❌ Lógica de negócio (responsabilidade do Service)
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Estados locais da UI
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * ON SUBMIT
   *
   * Handler do formulário de login
   * - Valida campos
   * - Chama service
   * - Trata sucesso/erro
   * - Gerencia navegação
   */
  onSubmit() {
    // 1. Validação de campos vazios
    if (!this.username || !this.password) {
      this.errorMessage = 'Preencha todos os campos';
      return;
    }

    // 2. Inicia loading e limpa erro anterior
    this.isLoading = true;
    this.errorMessage = '';

    // 3. Chama service de autenticação
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        // ✅ SUCESSO
        this.isLoading = false;
        
        // Component decide para onde navegar
        this.router.navigate(['/dashboard']);
        
        // Opcional: Exibir mensagem de sucesso
        console.log('Login realizado com sucesso!', response);
      },
      error: (error) => {
        // ❌ ERRO
        this.isLoading = false;
        
        // Component decide como exibir o erro
        this.errorMessage = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
        
        console.error('Erro no login:', error);
      }
    });
  }
}
