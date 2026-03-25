

                                                                                                                                                                           /**
 * AUTH LAYOUT COMPONENT
 *
 * Layout para páginas de autenticação (login, registro, recuperação de senha)
 *
 * RESPONSABILIDADE:
 * - Centralizar conteúdo na tela
 * - Aplicar background
 * - Exibir páginas não autenticadas
 *
 * ONDE USA:
 * - /login
 * - /register (futuro)
 * - /forgot-password (futuro)
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center" style="background-color: #EEF2F5;">
      <router-outlet />
    </div>
  `
})
export class AuthLayoutComponent {}
