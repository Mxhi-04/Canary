.PHONY: install dev build start test clean

install:
	cd frontend && npm install

dev:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

start:
	cd frontend && npm run start

test:
	cd frontend && npm run build

clean:
	rm -rf frontend/.next frontend/node_modules

