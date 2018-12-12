LEVEL ?= development
PROJECT = soundboost
ENV = venv
FLAKE8 = $(ENV)/bin/flake8
DJANGO_SHELL ?= shell_plus
PYTHON = $(ENV)/bin/python
GUNICORN = $(ENV)/bin/gunicorn
ANSIBLE = $(ENV)/bin/ansible-playbook
SERVER_HOST = 0.0.0.0
SERVER_PORT = 8000

manage:
	$(PYTHON) ./$(PROJECT)/manage.py $(COMMAND)

run:
	COMMAND=runserver\ 0.0.0.0:7000 make manage
	npm run watch

install:
	[ ! -d "$(ENV)/" ] && virtualenv $(ENV)/ || :
	$(ENV)/bin/pip install -r requirements.txt
	npm install

migrate:
	COMMAND=migrate make manage

migrations:
	COMMAND=makemigrations make manage

lint:
	$(FLAKE8) $(PROJECT)
	npm run lint

watch:
	npm run watch

shell:
	COMMAND=$(DJANGO_SHELL) make manage

deploy:
	$(ANSIBLE) -i ansible/$(LEVEL).ini ansible/deploy.yml

server:
	LEVEL=$(LEVEL) PYTHONPATH=$(PROJECT) $(GUNICORN) -b $(SERVER_HOST):$(SERVER_PORT) $(PROJECT).wsgi:application

build:
	LEVEL=$(LEVEL) npm run build

test: lint
	COMMAND=test make manage