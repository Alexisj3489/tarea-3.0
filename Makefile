STACK_NAME=appstack
COMPOSE_FILE=stack.yml
ENV_FILE=.env

.PHONY: init-swarm deploy ps services logs rm status

## Inicializa Docker Swarm en el VPS (ejecutar una sola vez)
init-swarm:
	@docker info --format '{{.Swarm.LocalNodeState}}' | grep -q active \
		&& echo "Swarm ya esta activo" \
		|| docker swarm init

## Despliega o actualiza el stack completo usando las variables de .env
deploy:
	set -a; . ./$(ENV_FILE); set +a; \
	docker stack deploy -c $(COMPOSE_FILE) $(STACK_NAME)

## Lista los servicios del stack y su estado
ps:
	docker stack services $(STACK_NAME)

## Lista los contenedores (tasks) del stack
services:
	docker stack ps $(STACK_NAME)

## Muestra logs de un servicio: make logs SERVICE=backend
logs:
	docker service logs -f $(STACK_NAME)_$(SERVICE)

## Elimina el stack completo del VPS
rm:
	docker stack rm $(STACK_NAME)

## Resumen rapido de contenedores en ejecucion
status:
	docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
