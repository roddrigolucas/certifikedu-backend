# Deploy Script para o Backend do CertifikEDU
Write-Host "Iniciando processo de Deploy Local para VPS..." -ForegroundColor Cyan

# Passo 1: Compilar o código TypeScript para JavaScript (dist/)
Write-Host "1. Compilando o projeto (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro na compilação. Deploy cancelado." -ForegroundColor Red
    exit 1
}

# Passo 2: Copiar a pasta 'dist' compilada para a VPS
Write-Host "2. Copiando arquivos compilados para a VPS via SCP..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -r dist root@31.97.91.29:/root/deploy/backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao copiar arquivos. Deploy cancelado." -ForegroundColor Red
    exit 1
}

# Passo 3: Puxar atualizações no Git, construir o container Docker (agora super leve) e reiniciar
Write-Host "3. Iniciando container na VPS (Pull + Docker Build)..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no root@31.97.91.29 "cd /root/deploy/backend && git pull && docker compose -f docker-compose.vps.yml build backend && docker compose -f docker-compose.vps.yml up -d"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao iniciar o container. Deploy cancelado." -ForegroundColor Red
    exit 1
}

Write-Host "✅ DEPLOY DO BACKEND CONCLUÍDO COM SUCESSO! A VPS não vai mais travar." -ForegroundColor Green
