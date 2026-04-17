

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
    <div class="min-h-screen flex flex-col lg:flex-row">
      <!-- Painel de Marca (desktop) -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
           style="background: linear-gradient(135deg, #4A5E78 0%, #7588A8 50%, #95A7C1 100%);">
        <!-- Padrão decorativo -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-10 left-10 w-72 h-72 rounded-full" style="background: white; filter: blur(80px);"></div>
          <div class="absolute bottom-10 right-10 w-96 h-96 rounded-full" style="background: white; filter: blur(100px);"></div>
        </div>
        
        <div class="relative z-10 text-center px-12 max-w-lg">
          <div class="bg-white/15 backdrop-blur-sm rounded-3xl p-6 inline-block mb-8 shadow-2xl">
            <img src="logo-utilar.png" alt="Util Lar" class="w-28 h-28 object-contain">
          </div>
          <h1 class="text-4xl font-bold text-white mb-4 tracking-tight">Util Lar</h1>
          <p class="text-xl text-white/90 font-medium mb-3">Móveis e Eletrodomésticos</p>
          <div class="w-16 h-1 bg-white/40 rounded-full mx-auto mb-6"></div>
          <p class="text-white/75 text-base leading-relaxed">
            Qualidade e confiança para transformar sua casa em um lar acolhedor. Novos e seminovos com os melhores preços.
          </p>
        </div>
      </div>
      
      <!-- Painel do Formulário -->
      <div class="flex-1 flex items-center justify-center min-h-screen lg:min-h-0 px-4 py-8" style="background-color: #F8FAFB;">
        <router-outlet />
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
