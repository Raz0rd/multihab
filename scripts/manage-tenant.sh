#!/bin/bash

# Script para gerenciar tenants do multihab
# Uso:
#   ./manage-tenant.sh --domain example.com --layout b
#   ./manage-tenant.sh --domain example.com --ads-id AW-123456789
#   ./manage-tenant.sh --domain example.com --conversion AW-123456789/XXXXX
#   ./manage-tenant.sh --domain example.com --layout c --ads-id AW-123 --conversion AW-123/XXX
#   ./manage-tenant.sh --list
#   ./manage-tenant.sh --get example.com

TENANTS_FILE="/var/www/multihab/public/tenants.json"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parse argumentos
DOMAIN=""
LAYOUT=""
ADS_ID=""
CONVERSION=""
ACTION=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --domain|-d)
            DOMAIN="$2"
            shift 2
            ;;
        --layout|-l)
            LAYOUT="$2"
            shift 2
            ;;
        --ads-id|-a)
            ADS_ID="$2"
            shift 2
            ;;
        --conversion|-c)
            CONVERSION="$2"
            shift 2
            ;;
        --list)
            ACTION="list"
            shift
            ;;
        --get|-g)
            ACTION="get"
            DOMAIN="$2"
            shift 2
            ;;
        --add)
            ACTION="add"
            shift
            ;;
        --delete)
            ACTION="delete"
            shift
            ;;
        --help|-h)
            echo "Uso: $0 [opções]"
            echo ""
            echo "Opções:"
            echo "  --domain, -d     Domínio do tenant"
            echo "  --layout, -l     Layout (a, b ou c)"
            echo "  --ads-id, -a     Google Ads ID"
            echo "  --conversion, -c Google Ads Conversion Label"
            echo "  --list           Lista todos os tenants"
            echo "  --get DOMAIN     Mostra config de um tenant"
            echo "  --add            Adiciona novo tenant (requer --domain)"
            echo "  --delete         Remove tenant (requer --domain)"
            echo ""
            echo "Exemplos:"
            echo "  $0 --domain meusite.com --layout b"
            echo "  $0 --domain meusite.com --ads-id AW-123456789"
            echo "  $0 --list"
            exit 0
            ;;
        *)
            echo -e "${RED}Argumento desconhecido: $1${NC}"
            exit 1
            ;;
    esac
done

# Verifica se jq está instalado
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Erro: jq não está instalado. Instale com: apt install jq${NC}"
    exit 1
fi

# Verifica se arquivo existe
if [ ! -f "$TENANTS_FILE" ]; then
    echo -e "${RED}Erro: Arquivo $TENANTS_FILE não encontrado${NC}"
    exit 1
fi

# Ação: Listar
if [ "$ACTION" == "list" ]; then
    echo -e "${GREEN}Tenants configurados:${NC}"
    jq -r '.tenants | keys[]' "$TENANTS_FILE"
    exit 0
fi

# Ação: Get
if [ "$ACTION" == "get" ]; then
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}Erro: --domain é obrigatório${NC}"
        exit 1
    fi
    echo -e "${GREEN}Config do tenant $DOMAIN:${NC}"
    jq ".tenants[\"$DOMAIN\"]" "$TENANTS_FILE"
    exit 0
fi

# Ação: Delete
if [ "$ACTION" == "delete" ]; then
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}Erro: --domain é obrigatório${NC}"
        exit 1
    fi
    jq "del(.tenants[\"$DOMAIN\"])" "$TENANTS_FILE" > /tmp/tenants_tmp.json
    mv /tmp/tenants_tmp.json "$TENANTS_FILE"
    echo -e "${GREEN}Tenant $DOMAIN removido${NC}"
    exit 0
fi

# Ação: Add novo tenant
if [ "$ACTION" == "add" ]; then
    if [ -z "$DOMAIN" ]; then
        echo -e "${RED}Erro: --domain é obrigatório${NC}"
        exit 1
    fi
    
    NEW_LAYOUT="${LAYOUT:-a}"
    NEW_ADS="${ADS_ID:-}"
    NEW_CONV="${CONVERSION:-}"
    
    jq ".tenants[\"$DOMAIN\"] = {\"layout\": \"$NEW_LAYOUT\", \"googleAdsId\": \"$NEW_ADS\", \"googleAdsConversionLabel\": \"$NEW_CONV\"}" "$TENANTS_FILE" > /tmp/tenants_tmp.json
    mv /tmp/tenants_tmp.json "$TENANTS_FILE"
    echo -e "${GREEN}Tenant $DOMAIN adicionado${NC}"
    exit 0
fi

# Atualizar tenant existente
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Erro: --domain é obrigatório para atualizar${NC}"
    exit 1
fi

# Verifica se tenant existe
EXISTS=$(jq -r ".tenants[\"$DOMAIN\"]" "$TENANTS_FILE")
if [ "$EXISTS" == "null" ]; then
    echo -e "${YELLOW}Tenant $DOMAIN não existe. Use --add para criar.${NC}"
    exit 1
fi

# Atualiza campos fornecidos
TEMP_FILE="/tmp/tenants_tmp.json"
cp "$TENANTS_FILE" "$TEMP_FILE"

if [ -n "$LAYOUT" ]; then
    jq ".tenants[\"$DOMAIN\"].layout = \"$LAYOUT\"" "$TEMP_FILE" > /tmp/t2.json && mv /tmp/t2.json "$TEMP_FILE"
    echo -e "${GREEN}Layout atualizado para: $LAYOUT${NC}"
fi

if [ -n "$ADS_ID" ]; then
    jq ".tenants[\"$DOMAIN\"].googleAdsId = \"$ADS_ID\"" "$TEMP_FILE" > /tmp/t2.json && mv /tmp/t2.json "$TEMP_FILE"
    echo -e "${GREEN}Google Ads ID atualizado para: $ADS_ID${NC}"
fi

if [ -n "$CONVERSION" ]; then
    jq ".tenants[\"$DOMAIN\"].googleAdsConversionLabel = \"$CONVERSION\"" "$TEMP_FILE" > /tmp/t2.json && mv /tmp/t2.json "$TEMP_FILE"
    echo -e "${GREEN}Conversion Label atualizado para: $CONVERSION${NC}"
fi

mv "$TEMP_FILE" "$TENANTS_FILE"
echo -e "${GREEN}Tenant $DOMAIN atualizado com sucesso!${NC}"
