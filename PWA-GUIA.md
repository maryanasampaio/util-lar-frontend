# 📱 Guia PWA - Util Lar

O Util Lar agora é um **Progressive Web App (PWA)**, permitindo que usuários instalem o aplicativo em seus dispositivos!

## ✅ O que foi configurado

### 1. Service Worker
- Cache de assets para funcionar offline
- Cache de produtos da API (1 hora)
- Cache de imagens do Firebase (7 dias)
- Atualizações automáticas em background

### 2. Manifest
- Nome: **Util Lar - Móveis e Eletrodomésticos**
- Cores do tema: `#7588A8` (primary) e `#EEF2F5` (background)
- Ícones em todos os tamanhos necessários
- Modo standalone (sem barra do navegador)

### 3. Meta Tags
- PWA meta tags para iOS e Android
- SEO otimizado
- Open Graph para compartilhamento
- Apple Touch Icons

## 🚀 Como Testar

### Build de Produção
O PWA **só funciona em produção**. Para testar:

```bash
# 1. Build de produção
npm run build

# 2. Servir com http-server
npx http-server dist/product-frontend/browser -p 8080

# 3. Abrir no navegador
# http://localhost:8080
```

### Testar em Dispositivo Real

#### Opção 1: Usando ngrok (Recomendado)
```bash
# 1. Instalar ngrok
npm install -g ngrok

# 2. Com app rodando na porta 8080
ngrok http 8080

# 3. Acessar URL gerada no celular
# Ex: https://abc123.ngrok.io
```

#### Opção 2: Rede Local
```bash
# 1. Descobrir IP local
ipconfig
# Procure por "Endereço IPv4" (ex: 192.168.1.100)

# 2. Servir na porta 8080
npx http-server dist/product-frontend/browser -p 8080

# 3. No celular (mesma rede Wi-Fi)
# http://192.168.1.100:8080
```

## 📲 Como Instalar (Usuário Final)

### Android (Chrome/Samsung)
1. Abrir o site no navegador
2. Mensagem "Adicionar à tela inicial" aparecerá automaticamente
3. **OU** Menu ⋮ → "Instalar app"
4. Confirmar instalação
5. App aparece na tela inicial! 🎉

### iPhone/iPad (Safari)
1. Abrir o site no Safari
2. Tocar no botão **Compartilhar** (📤)
3. Rolar e selecionar **"Adicionar à Tela de Início"**
4. Editar nome se desejar
5. Tocar em **"Adicionar"**
6. Ícone aparece na tela inicial! 🎉

### Desktop (Chrome/Edge)
1. Ícone de instalação (➕) aparece na barra de endereço
2. Clicar em **"Instalar"**
3. App abre em janela separada
4. Atalho criado no menu iniciar

## 🎨 Personalizando Ícones

Os ícones padrão foram criados automaticamente. Para personalizar:

1. Criar uma imagem quadrada do logo (512x512px)
2. Usar ferramenta online para gerar todos os tamanhos:
   - https://tools.pwabuilder.com/imageGenerator
   - https://www.pwabuilder.com/
3. Substituir arquivos em `public/icons/`

### Tamanhos necessários:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

## 🔄 Atualizações do App

### Estratégia de Atualização
- Service Worker verifica atualizações a cada visita
- Atualização em background (não interrompe usuário)
- Nova versão carrega no próximo refresh

### Forçar Atualização Imediata
Adicione este código em `app.component.ts`:

```typescript
import { ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

constructor(
  private swUpdate: SwUpdate,
  private appRef: ApplicationRef
) {
  if (this.swUpdate.isEnabled) {
    this.swUpdate.versionUpdates.subscribe(event => {
      if (event.type === 'VERSION_READY') {
        if (confirm('Nova versão disponível! Atualizar agora?')) {
          window.location.reload();
        }
      }
    });
  }
}
```

## 📊 Estatísticas do PWA

### Desempenho
- **Tamanho inicial**: ~500KB (gzip)
- **Offline**: ✅ Funciona após primeira visita
- **Instalável**: ✅ Em todos os dispositivos
- **Push Notifications**: ✅ Já implementado

### Comparação com App Nativo
| Recurso | PWA | App Nativo |
|---------|-----|------------|
| Tamanho | 1-2 MB | 30-50 MB |
| Instalação | Instantânea | Play Store/App Store |
| Atualizações | Automáticas | Manual (aprovação loja) |
| Funciona offline | ✅ | ✅ |
| Push notifications | ✅ | ✅ |
| Acesso câmera/GPS | ✅ | ✅ |

## 🧪 Testar PWA Score

Use o Lighthouse (Chrome DevTools):

1. Abrir Chrome DevTools (F12)
2. Aba **"Lighthouse"**
3. Selecionar **"Progressive Web App"**
4. Clicar em **"Analyze page load"**
5. Meta: **90+ pontos**

## 🐛 Troubleshooting

### "App não aparece para instalar"
- ✅ Verifique se está em **HTTPS** (ou localhost)
- ✅ Confirme que service worker está registrado
- ✅ Garanta que manifest.webmanifest está acessível
- ✅ Todos os ícones devem existir

### "Service Worker não atualiza"
```bash
# Limpar cache do service worker
# Chrome DevTools → Application → Service Workers → Unregister
```

### "Funciona no desktop mas não no celular"
- ✅ Verifique se dispositivo está na mesma rede
- ✅ Use HTTPS (ngrok) ao invés de HTTP
- ✅ Limpe cache do navegador mobile

## 🔐 HTTPS em Produção

Para produção, você **precisa** de HTTPS. Opções:

1. **Netlify** (gratuito, recomendado)
   - Deploy automático do GitHub
   - HTTPS automático
   - CDN global

2. **Vercel** (gratuito)
   - Similar ao Netlify
   - Build otimizado

3. **Firebase Hosting** (gratuito)
   - Integra com Firebase Storage (já usado)

### Deploy Rápido (Netlify)
```bash
# 1. Build
npm run build

# 2. Instalar Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist/product-frontend/browser
```

## 📱 Recursos PWA Disponíveis

### Já Implementados
- ✅ Instalável em todos os dispositivos
- ✅ Funciona offline (cache inteligente)
- ✅ Push Notifications (navegador)
- ✅ Ícones e splash screens
- ✅ Tema personalizado

### Próximos Passos (Opcional)
- 📸 Integração com câmera para fotos
- 📍 Geolocalização
- 💾 Sincronização em background
- 🔔 Badge notifications no ícone

## 🎯 Checklist Pré-Deploy

- [ ] Build de produção sem erros
- [ ] Lighthouse score > 90
- [ ] Testado em Android
- [ ] Testado em iOS
- [ ] Ícones personalizados (logo da Util Lar)
- [ ] HTTPS configurado
- [ ] Domain configurado

## 📞 Suporte

Dúvidas sobre PWA? Consulte:
- [Documentação Angular PWA](https://angular.dev/ecosystem/service-workers)
- [web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/pt-BR/docs/Web/Progressive_web_apps)

---

**🎉 Parabéns! Seu app agora pode ser instalado como um aplicativo nativo!**
