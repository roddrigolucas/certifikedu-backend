#!/bin/bash

# Script de Deploy CertifikEdu - VPS Hostinger
# IP: 31.97.91.29

echo "--- Iniciando Deploy CertifikEdu ---"

# 1. Garantir que estamos na pasta correta
# Recomenda-se: /home/user/deploy/backend
cd "$(dirname "$0")"

# 2. Atualizar código (opcional, se estiver usando git)
# git pull origin main

# 3. Rodar o Docker Compose
echo "Limpando containers antigos e reconstruindo imagens..."
docker compose -f docker-compose.vps.yml down
docker compose -f docker-compose.vps.yml up -d --build

echo "--- Deploy concluído com sucesso! ---"
echo "Website: http://31.97.91.29"
echo "Frontend: http://31.97.91.29:3000"
echo "Backend: http://31.97.91.29:3001"
