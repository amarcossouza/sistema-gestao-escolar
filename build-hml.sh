#!/bin/bash

TAG=$1

if [ -z "$TAG" ]; then
    echo "Informe a TAG"
    exit 1
fi

docker build \
-t frontend-react-hml:$TAG .
