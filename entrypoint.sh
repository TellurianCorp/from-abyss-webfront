#!/bin/sh
# Script de inicialização para substituir variáveis no nginx.conf
# Permite usar RAILWAY_API_URL para configurar a URL da API dinamicamente

# URL padrão da API
API_URL=${RAILWAY_API_URL:-https://api.fromabyss.com}

# Porta do Railway (padrão 80, mas Railway pode injetar PORT)
PORT=${PORT:-80}

# Substituir a URL da API no arquivo de configuração do nginx
# Usar formato compatível com Alpine Linux (busybox sed)
sed -i "s|https://api.fromabyss.com|${API_URL}|g" /etc/nginx/conf.d/default.conf

# Substituir a porta no nginx.conf (se necessário)
sed -i "s|listen 80|listen ${PORT}|g" /etc/nginx/conf.d/default.conf

# Validar configuração do nginx antes de iniciar
nginx -t || {
    echo "ERROR: Nginx configuration is invalid!"
    echo "API_URL: ${API_URL}"
    echo "PORT: ${PORT}"
    cat /etc/nginx/conf.d/default.conf
    exit 1
}

echo "Starting nginx with:"
echo "  API_URL: ${API_URL}"
echo "  PORT: ${PORT}"

# Iniciar nginx
exec nginx -g "daemon off;"
