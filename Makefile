SHELL             := /bin/bash
ROOT_MAKEFILE_DIR := $(realpath $(dir $(realpath $(lastword $(MAKEFILE_LIST)))))
ENV_FILE          := $(ROOT_MAKEFILE_DIR)/scripts/env_setup.sh
INSTALL_INDICATOR := .installed

.DEFAULT_GOAL := dev

$(INSTALL_INDICATOR): package.json Gemfile
	@source $(ENV_FILE) && \
	gem install \
	jekyll \
	bundler && \
	bundle install && \
	npm install -g gulp && \
	npm install
	@touch .installed

install: $(INSTALL_INDICATOR)

dev: $(INSTALL_INDICATOR)
	@source $(ENV_FILE) && \
	bundle exec gulp

prod: $(INSTALL_INDICATOR)
	@source $(ENV_FILE) && \
	bundle exec gulp prod

post:
	@title="$(TITLE)"; \
	if [[ -z "$$title" ]]; then \
		echo 'Usage: make post TITLE="Post title"'; \
		exit 1; \
	fi; \
	date=$$(date +"%Y-%m-%d"); \
	time=$$(date +"%H:%M"); \
	filename="_posts/$${date}-$${title}.md"; \
	printf '%s\n' \
		'---' \
		'layout: post' \
		"title: \"$$title\"" \
		"date: $$date $$time" \
		'categories: [News]' \
		'tags: [news]' \
		'image: "post_default_header.jpg"' \
		'comments: true' \
		'---' \
		'' > "$$filename"; \
	echo "Created $$filename"

.PHONY: install dev prod post
