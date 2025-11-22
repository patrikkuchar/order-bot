# my-template

Template pre projekty postavené na Angulari a Spring Boot backendoch. Repo obsahuje pripravené skripty, generovaný OpenAPI klient pre frontend a ukážkové domény (autentifikácia, konfigurácia a testovacia sekcia), ktoré demonštrujú prepojenie FE/BE.

- [Štruktúra repozitára](#štruktúra-repozitára)
- [Ako založiť nový projekt z template](#ako-založiť-nový-projekt-z-template)
- [Lokálne spustenie](#lokálne-spustenie)
- [Dokumentácia codebase](#dokumentácia-codebase)
- [PrimeNG](#primeng)
- [Testing](#testing)
- [Lokálny Kubernetes test](#lokálny-kubernetes-test)

## Štruktúra repozitára
- `backend/` – Spring Boot aplikácia (autentifikácia, doménové API, data-seeding). 
- `frontend/` – Angular aplikácia s PrimeNG a generovaným OpenAPI klientom.
- `charts/` – Helm chart pre nasadenie.
- `scripts/` – pomocné skripty (preimenovanie template, lokálny k8s).
- `docker-compose.yml` – jednoduchý PostgreSQL pre lokálny vývoj.

## Ako založiť nový projekt z template
1. **Premenovanie projektu a balíkov** – spusti `scripts/rename-template.sh <novy-nazov> [<java-balík>]`.
   - Prvý parameter nastaví názov aplikácie v Helm chart skriptoch (nahradí `my-template`).
   - Druhý parameter je voliteľný a zmení základný balík backendu (predvolene `kuhcorp.template`).
   - Skript pri hromadnej náhrade preskočí adresáre `.git`, `.idea`, `frontend/node_modules`, `frontend/dist` a `backend/target`, aby nerozbil cache ani IDE konfigurácie.
   - Hlavná Spring Boot trieda `DemoApplication` sa premenuje na `<NovyNazov>Application` (napr. `my-service` -> `MyServiceApplication`) spolu s testom, takže názov aplikácie bude konzistentný s novým slugom.
2. **Základná konfigurácia** – uprav secrets v `backend/src/main/resources/application.yaml` (`auth.secret`, `encryption.secret`, DB prístupy) a prípadné hodnoty v Helm chartoch.
3. **Inštalácia závislostí** – v `backend/` spusti `./mvnw clean install` (prípadne `npm install` pre e2e testy), vo `frontend/` `npm install`.

## Lokálne spustenie
1. Spusť databázu: `docker compose up -d postgres`.
2. Backend: v adresári `backend` spusti `./mvnw spring-boot:run` (potrebuje prístup k databáze a hodnoty z `application.yaml`).
3. Frontend: v `frontend` spusti `npm start` (Angular dev server na porte `4300` s proxy na backend).
4. Pri zmene konfigurácie alebo schém regeneruj OpenAPI klienta, aby FE a BE zostali zosúladené.

## Dokumentácia codebase
Detailný popis domén, prepojenia FE/BE a generovaných modulov nájdeš v:
- [`docs/README.md`](docs/README.md) – hlavný sprievodca codebase s prehľadom funkcií a dátových tokov.
- [`docs/backend.md`](docs/backend.md) – štruktúra backendu, konfigurácia a doménové API.
- [`docs/frontend.md`](docs/frontend.md) – Angular architektúra, služby a používanie OpenAPI klienta.

## PrimeNG

### Styling PrimeNG

PrimeNG používa vlastné témy, ktoré sa importujú v `styles.css` alebo `angular.json`. Príklad pre import v `styles.css`:

```css
@import 'primeng/resources/themes/lara-light-blue/theme.css';
@import 'primeng/resources/primeng.min.css';
@import 'primeicons/primeicons.css';
```

Štýlovanie PrimeNG komponentov je v tomto projekte definované v súbore `primeng.themepreset.ts`, kde nastavuješ požadovaný preset témy a ďalšie úpravy vzhľadu.

Zmeniť vzhľad komponentov môžeš výberom inej témy (napr. `lara-dark-blue`, `saga-blue`, atď.), úpravou presetov v `primeng.themepreset.ts` alebo vlastným CSS:

```css
/* Príklad vlastného štýlu pre PrimeNG button */
.p-button {
  background-color: #1976d2;
  color: #fff;
}
```

Viac informácií o témach a customizácii nájdeš v [PrimeNG dokumentácii](https://primefaces.org/primeng/theming).

## Testing

### Backend e2e tests (Vitest)
1. Spusti PostgreSQL a Spring Boot backend (napr. `docker compose up -d postgres` a `./mvnw spring-boot:run`).
2. V adresári `backend` nainštaluj závislosti (`npm install`).
3. Spusti Vitest e2e testy: `npm run test:e2e` (testy sa nachádzajú v priečinku `backend/e2e`).

Testy používajú endpointy `/api/auth` a vyžadujú seedované dáta (napr. používateľa `alice@email.com` s heslom `pass123`).

### Frontend Vitest unit testy
1. V adresári `frontend` nainštaluj závislosti (`npm install`).
2. Spusti kritické unit testy: `npm run test:vitest`.

Vitest konfigurácia používa Node prostredie a zameriava sa na `AuthService.restoreSession` a prácu so session dátami.

## Lokálny Kubernetes test

Pre rýchle overenie Helm chartu a kontajnerov je pripravený skript `scripts/local-k8s.sh`. Zabezpečí vytvorenie klastru (`kind` alebo `minikube`), build obrazov, nasadenie Helm chartu a čaká na rollout.

Pred spustením si priprav:
- nainštalované: Docker, Helm, Kubectl a Kind (alebo Minikube).
- prístup ku klastru so Sealed Secrets controllerom (kvôli vygenerovaniu tajomstiev).
- encryptnuté hodnoty pre `POSTGRES_USER` a `POSTGRES_PASSWORD`, ktoré skriptu odovzdáš cez `SEALED_POSTGRES_USER` a `SEALED_POSTGRES_PASSWORD`. Najjednoduchšie je vytvoriť dočasný Secret a prehnať ho `kubeseal`-om:

```bash
kubectl create secret generic db-credentials \
  --from-literal=POSTGRES_USER=user \
  --from-literal=POSTGRES_PASSWORD=secret \
  --dry-run=client -o json | \
  kubeseal --format=yaml --namespace my-template > /tmp/db-credentials-sealed.yaml

SEALED_POSTGRES_USER=$(yq '.spec.encryptedData.POSTGRES_USER' /tmp/db-credentials-sealed.yaml)
SEALED_POSTGRES_PASSWORD=$(yq '.spec.encryptedData.POSTGRES_PASSWORD' /tmp/db-credentials-sealed.yaml)
export SEALED_POSTGRES_USER SEALED_POSTGRES_PASSWORD
```

Základné použitie (kind, predvolený tag `local`):

```bash
SEALED_POSTGRES_USER="ENC[...]" \
SEALED_POSTGRES_PASSWORD="ENC[...]" \
scripts/local-k8s.sh --provider kind --port-forward
```

Funkcie skriptu:
- `--provider kind|minikube` vyberie runtime (default kind).
- `--skip-build` preskočí docker build a použije už existujúce značky.
- `--tag custom-tag` použije konkrétny tag pre backend/frontend obrazy.
- `--destroy` odstráni Helm release a (pri kind) aj lokálny cluster.

Po úspešnom spustení sa backend sprístupní na `http://localhost:18080`, frontend na `http://localhost:18081`. Logy podov vieš sledovať cez `kubectl logs -n my-template <pod>`.
