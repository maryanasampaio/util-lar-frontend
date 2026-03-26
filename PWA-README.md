# 📱 Quick Start - PWA Util Lar

## ✅ PWA Configurado com Sucesso!

Seu app agora pode ser instalado em celulares, tablets e desktops!

## 🚀 Como Testar

### 1. Build de Produção
```bash
npm run build
```

### 2. Servir Localmente
```bash
npx http-server dist/product-frontend/browser -p 8080
```

### 3. Testar no Celular

**Opção A - ngrok (Mais fácil):**
```bash
npm install -g ngrok
ngrok http 8080
# Acesse a URL gerada no celular
```

**Opção B - IP Local:**
```bash
ipconfig  # Windows
# Acesse http://SEU_IP:8080 no celular (mesma rede Wi-Fi)
```

## 📲 Como Instalar

### Android
1. Abra no Chrome/Samsung Internet
2. Verá mensagem "Adicionar à tela inicial"
3. Ou menu ⋮ → "Instalar app"

### iOS
1. Abra no Safari
2. Botão Compartilhar 📤
3. "Adicionar à Tela de Início"

### Desktop
1. Ícone ➕ na barra de endereço
2. Clicar em "Instalar"

## 🎯 Recursos PWA

✅ Instalável em todos dispositivos
✅ Funciona offline
✅ Notificações push
✅ Banner de instalação automático
✅ Cache inteligente de produtos
✅ Atualizações automáticas

## 📖 Documentação Completa

Veja [PWA-GUIA.md](./PWA-GUIA.md) para documentação detalhada.

## 🔥 Deploy em Produção

### Netlify (Recomendado)
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist/product-frontend/browser
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

---

**🎉 Pronto! Seu app está pronto para ser instalado!**
