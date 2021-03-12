CONTAINER_PREFIX ?= # yourname/
API_VERSION = 1.3.2
FRONTEND_VERSION = 1.3.2

PROJECT_NAME=summarizer
API_NAME=$(PROJECT_NAME)-api
FRONTEND_NAME=$(PROJECT_NAME)-frontend

ifndef CONTAINER_PREFIX
  $(error CONTAINER_PREFIX is not set)
endif

api: build_api push_api

build_api:
	docker build backend/api -t $(CONTAINER_PREFIX)$(API_NAME):$(API_VERSION)

push_api:
	docker push $(CONTAINER_PREFIX)$(API_NAME):$(API_VERSION)

build_frontend:
	docker build frontend -t $(CONTAINER_PREFIX)$(FRONTEND_NAME):$(FRONTEND_VERSION)

push_frontend:
	docker push $(CONTAINER_PREFIX)$(FRONTEND_NAME):$(FRONTEND_VERSION)

frontend: build_frontend push_frontend

all: frontend api
