

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
    <div class="min-h-screen flex flex-col lg:flex-row bg-brand-100">
      <!-- Painel de marca (desktop) -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400">
        <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div class="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-brand-800/30 blur-3xl"></div>
          <div class="absolute inset-0 opacity-[0.07]"
               style="background-image: linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px); background-size: 48px 48px;"></div>
        </div>

        <div class="relative z-10 text-center px-12 max-w-lg animate-fade-up">
          <div class="glass rounded-3xl p-6 inline-block mb-8 shadow-2xl">
            <img src="logo-branca.png" alt="Util Lar" class="w-28 h-28 object-contain drop-shadow-xl">
          </div>
          <h1 class="text-5xl font-extrabold text-white mb-3 tracking-tight">Util Lar</h1>
          <p class="text-xl text-white/90 font-medium mb-5">Móveis e Eletrodomésticos</p>
          <div class="w-12 h-1 bg-white/40 rounded-full mx-auto mb-6"></div>
          <p class="text-white/75 text-base leading-relaxed">
            Qualidade e confiança para transformar sua casa em um lar acolhedor. Novos e seminovos com os melhores preços.
          </p>
        </div>
      </div>

      <!-- Painel do formulário -->
      <div class="flex-1 flex items-center justify-center min-h-screen lg:min-h-0 px-4 py-8">
        <router-outlet />
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
