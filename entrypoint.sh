#!/bin/sh
# Script de inicialização para substituir variáveis no nginx.conf
# Permite usar RAILWAY_API_URL para configurar a URL da API dinamicamente

# URL padrão da API
API_URL=${RAILWAY_API_URL:-https://api.fromabyss.com}

# Substituir a URL da API no arquivo de configuração do nginx
# Usar formato compatível com Alpine Linux (busybox sed)
sed -i "s|https://api.fromabyss.com|${API_URL}|g" /etc/nginx/conf.d/default.conf

# Validar configuração do nginx antes de iniciar
nginx -t || {
    echo "ERROR: Nginx configuration is invalid!"
    exit 1
}

# Iniciar nginx
exec nginx -g "daemon off;"
