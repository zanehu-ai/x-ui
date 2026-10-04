.PHONY: typecheck clean check-r2

typecheck:
	npx tsc --noEmit

check-r2:
	bash scripts/check-r2-web-release.sh

clean:
	rm -rf dist/ *.tsbuildinfo
