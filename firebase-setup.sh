#!/bin/bash
# Firebase Setup Script - 2048 Fusion
# 
# Instruções para configurar Firebase no projeto
# 
# ANTES DE COMEÇAR:
# 1. Ter conta Google
# 2. npm e node instalados
# 3. Este projeto clonado

echo "🚀 Firebase Setup para 2048 Fusion"
echo "===================================="
echo ""

# Passo 1
echo "📋 PASSO 1: Criar projeto Firebase"
echo "1. Acesse https://console.firebase.google.com"
echo "2. Clique 'Criar projeto'"
echo "3. Nome: fusion2048"
echo "4. Desabilitar Google Analytics (opcional)"
echo "5. Criar"
echo ""
read -p "Pressione ENTER quando terminar..."

# Passo 2
echo ""
echo "📋 PASSO 2: Enable Realtime Database"
echo "1. No Firebase Console → Build → Realtime Database"
echo "2. Create Database"
echo "3. Localização: us-central1 (ou sua região)"
echo "4. Start in test mode"
echo "5. Ativar"
echo ""
read -p "Pressione ENTER quando terminar..."

# Passo 3
echo ""
echo "📋 PASSO 3: Enable Authentication"
echo "1. Build → Authentication"
echo "2. Sign-in method"
echo "3. Enable 'Anonymous'"
echo "4. Salvar"
echo ""
read -p "Pressione ENTER quando terminar..."

# Passo 4
echo ""
echo "📋 PASSO 4: Copiar Security Rules"
echo "1. Build → Realtime Database → Rules"
echo "2. Copiar o conteúdo de FIREBASE_SETUP.md"
echo "3. Colar no editor"
echo "4. Publish"
echo ""
read -p "Pressione ENTER quando terminar..."

# Passo 5
echo ""
echo "📋 PASSO 5: Configuração Local"
echo "Firebase config já está em src/services/firebase.ts"
echo "Nada mais a fazer!"
echo ""

# Test
echo ""
echo "🧪 Testando setup..."
npm run dev &
sleep 3

echo ""
echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "1. npm run dev        # Iniciar dev server"
echo "2. Abrir http://localhost:3001"
echo "3. Jogar e ver dados sincronizarem"
echo "4. Verificar Firebase Console → Realtime Database"
echo ""
echo "Documentação:"
echo "- FIREBASE_SETUP.md           # Setup detalhado"
echo "- FIREBASE_INTEGRATION.md     # Guia técnico"
echo "- FIREBASE_DATA_FLOW.md       # Diagramas de fluxo"
echo "- FIREBASE_CHECKLIST.md       # Checklist completo"
