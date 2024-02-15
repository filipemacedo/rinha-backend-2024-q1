#!/bin/bash

docker-compose -f ./docker-compose.dev.yml down --volumes
docker-compose -f ./docker-compose.dev.yml up --build
