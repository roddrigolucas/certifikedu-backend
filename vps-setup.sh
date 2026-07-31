#!/bin/bash
# ============================================================
# CertifikEDU — Script de Bootstrap da VPS Hostinger
# Executa UMA VEZ para configurar o ambiente de produção
# Uso: bash vps-setup.sh
# ============================================================

set -e  # Aborta em caso de erro

VPS_USER="root"
DEPLOY_DIR="/root/deploy"
BACKEND_REPO="git@github.com:roddrigolucas/certifikedu-backend.git"
FRONTEND_REPO="git@github.com:roddrigolucas/certifikedu-frontend.git"
WEBSITE_REPO="git@github.com:roddrigolucas/site.git"

echo "======================================================"
echo "  CertifikEDU — VPS Bootstrap"
echo "======================================================"

# 1. Instalar Docker (se não instalado)
if ! command -v docker &> /dev/null; then
  echo "[+] Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  echo "[+] Docker instalado com sucesso"
else
  echo "[~] Docker já está instalado"
fi

# 2. Verificar Docker Compose Plugin
if ! docker compose version &> /dev/null; then
  echo "[+] Instalando Docker Compose Plugin..."
  apt-get update -y && apt-get install -y docker-compose-plugin
fi
echo "[~] Docker Compose: $(docker compose version --short)"

# 3. Criar estrutura de diretórios
echo "[+] Criando estrutura de diretórios em $DEPLOY_DIR..."
mkdir -p "$DEPLOY_DIR"

# 4. Clonar repositórios (ou fazer pull se já existirem)
clone_or_pull() {
  local repo=$1
  local dir=$2
  local name=$3
  
  if [ -d "$dir/.git" ]; then
    echo "[~] $name: fazendo git pull..."
    git -C "$dir" pull
  else
    echo "[+] $name: clonando..."
    git clone "$repo" "$dir"
  fi
}

clone_or_pull "$BACKEND_REPO"  "$DEPLOY_DIR/backend"  "Backend"
clone_or_pull "$FRONTEND_REPO" "$DEPLOY_DIR/frontend" "Frontend"
clone_or_pull "$WEBSITE_REPO"  "$DEPLOY_DIR/website"  "Website"

# 5. Criar .env de produção no backend (se não existir)
ENV_FILE="$DEPLOY_DIR/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "[!] ATENÇÃO: Arquivo .env não encontrado em $ENV_FILE"
  echo "[!] Copie o arquivo .env.vps do seu computador para a VPS:"
  echo "    scp .env.vps root@31.97.91.29:$ENV_FILE"
  echo ""
  echo "    Pressione ENTER após copiar o arquivo..."
  read -r
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[ERRO] .env não encontrado. Abortando."
  exit 1
fi

echo "[~] .env encontrado em $ENV_FILE"

# 6. Subir todos os containers
echo "[+] Iniciando todos os containers Docker..."
cd "$DEPLOY_DIR/backend"
docker compose -f docker-compose.vps.yml up -d --build

# 7. Aguardar banco de dados ficar pronto
echo "[+] Aguardando banco de dados..."
sleep 15

# 8. Rodar migrações do Prisma
echo "[+] Rodando prisma db push..."
docker compose -f docker-compose.vps.yml exec -T backend npx prisma db push --accept-data-loss

# 9. Rodar seed de habilidades (se tabela estiver vazia)
echo "[+] Verificando seed de habilidades..."
ABILITY_COUNT=$(docker compose -f docker-compose.vps.yml exec -T database psql -U postgres -d certifikedu -t -c "SELECT COUNT(*) FROM \"Abilities\";" 2>/dev/null | tr -d ' ')

if [ "$ABILITY_COUNT" = "0" ] || [ -z "$ABILITY_COUNT" ]; then
  echo "[+] Populando habilidades..."
  docker compose -f docker-compose.vps.yml exec -T backend node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
const abs = [
  { tema: 'Tecnologia', habilidade: 'JavaScript' },
  { tema: 'Tecnologia', habilidade: 'TypeScript' },
  { tema: 'Tecnologia', habilidade: 'Python' },
  { tema: 'Tecnologia', habilidade: 'Node.js' },
  { tema: 'Tecnologia', habilidade: 'React' },
  { tema: 'Gestao', habilidade: 'Gestao de Projetos' },
  { tema: 'Gestao', habilidade: 'Lideranca' },
  { tema: 'Marketing', habilidade: 'Marketing Digital' },
  { tema: 'Design', habilidade: 'UX/UI Design' },
  { tema: 'Dados', habilidade: 'Analise de Dados' },
];
Promise.all(abs.map(a => p.abilities.upsert({ where: { habilidade: a.habilidade }, update: {}, create: a }))).then(() => { console.log('Habilidades OK'); p.\$disconnect(); }).catch(e => { console.error(e); p.\$disconnect(); });
"
else
  echo "[~] Habilidades já populadas ($ABILITY_COUNT registros)"
fi

# 10. Criar usuário admin
echo "[+] Criando usuário admin (admin@certifikedu.com)..."
docker compose -f docker-compose.vps.yml exec -T backend node create-admin.js 2>/dev/null || echo "[~] Admin pode já existir"

# 11. Status final
echo ""
echo "======================================================"
echo "  Deploy Concluído!"
echo "======================================================"
docker compose -f docker-compose.vps.yml ps
echo ""
echo "  Plataforma:  http://31.97.91.29:3000"
echo "  Backend API: http://31.97.91.29:3001"
echo "  Website:     http://31.97.91.29"
echo ""
echo "  Login: admin@certifikedu.com / Admin123!"
echo "======================================================"
