#!/bin/bash

# =====================================
# Autor: Antonio Marcos de Souza Santos
# Cargo: Developer Full Stack
# Data: 08/05/2026
# =====================================

TAG=$1

if [ -z "$TAG" ]; then
    echo "ERRO: informe a TAG"
    echo "Exemplo:"
    echo "./deploy-hml.sh 202605080300"
    exit 1
fi

echo "====================================="
echo "DEPLOY FRONTEND REACT"
echo "TAG: $TAG"
echo "====================================="

echo "EXPORTANDO IMAGEM..."

docker save frontend-react-hml:$TAG | gzip > frontend-react-hml.tar.gz

if [ $? -ne 0 ]; then
    echo "ERRO AO EXPORTAR IMAGEM"
    exit 1
fi

echo "ENVIANDO IMAGEM PARA SERVIDOR..."

scp frontend-react-hml.tar.gz root@134.209.164.87:/opt/docker/

if [ $? -ne 0 ]; then
    echo "ERRO SCP"
    exit 1
fi

echo "EXECUTANDO DEPLOY REMOTO..."

ssh root@134.209.164.87 << EOF

docker stop frontend-react-hml || true

docker rm frontend-react-hml || true

gunzip -c /opt/docker/frontend-react-hml.tar.gz | docker load

docker run -d \
--name frontend-react-hml \
-p 7001:80 \
--restart always \
frontend-react-hml:$TAG

EOF

echo "====================================="
echo "DEPLOY FINALIZADO"
echo "====================================="
