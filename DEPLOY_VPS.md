# Guia de Deployment - VPS Hostinger CertifikEdu

Este guia explica como subir todo o ecossistema (Website, Frontend, Backend e Banco) na sua VPS Hostinger.

## 1. Requisitos na VPS

Garante que o Docker e o Docker Compose estejam instalados:

```bash
# Instalar Docker (exemplo Ubuntu)
sudo apt-get update
sudo apt-get install docker.io docker-compose-v2 -y
```

## 2. Estratégia de Pastas

Para que o `docker-compose.vps.yml` funcione corretamente, os projetos devem ser clonados na mesma pasta pai:

Estrutura recomendada:

- `/home/user/deploy/`
  - `backend/` (Contendo `docker-compose.vps.yml` e `.env`)
  - `frontend/` (O projeto Vite, renomeado para "frontend" ou "tes")
  - `website/` (O projeto Next.js)

## 3. Configuração do `.env`

No arquivo `.env` dentro da pasta `backend/`, certifique-se de ajustar os caminhos de contexto para os nomes reais das pastas na VPS:

```dotenv
CONTEXT_FRONTEND=../frontend
CONTEXT_WEBSITE=../website
```

## 4. Executando o Deploy

Entre na pasta do backend e execute o script de automação ou o comando direto:

**Opção A: Script de Automação**

```bash
chmod +x deploy_vps.sh
./deploy_vps.sh
```

**Opção B: Comando Docker Direto**

```bash
docker compose -f docker-compose.vps.yml up -d --build
```

## 5. Verificação

Após o comando terminar, os serviços estarão disponíveis em:

- **Website**: `http://31.97.91.29`
- **Frontend**: `http://31.97.91.29:3000`
- **Backend API**: `http://31.97.91.29:3001`
