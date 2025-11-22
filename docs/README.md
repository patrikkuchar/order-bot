# Sprievodca codebase

Prehľad architektúry, domén a väzieb medzi Angular frontend aplikáciou a Spring Boot backendom. Podrobné informácie pre jednotlivé vrstvy sú v [backend](backend.md) a [frontend](frontend.md) sprievodcoch.

- [Architektúra a tooling](#architektúra-a-tooling)
- [Funkcionality a väzby FE/BE](#funkcionality-a-väzby-febe)
  - [Autentifikácia a session](#autentifikácia-a-session)
  - [Konfigurácia aplikácie a doménové guardy](#konfigurácia-aplikácie-a-doménové-guardy)
  - [Testovacia doména](#testovacia-doména)
  - [Formuláre a validácie naprieč FE/BE](#formuláre-a-validácie-naprieč-febe)
  - [Seedovanie dát a režim CLI](#seedovanie-dát-a-režim-cli)

## Architektúra a tooling
- **Backend**: Spring Boot aplikácia s modulmi pre autentifikáciu (JWT tokeny), doménové API a generovanie seedovacích dát. `DemoApplication` rozpozná prepínač `--seed-data` pre spustenie CLI módu namiesto web servera.
- **Frontend**: Angular 20 s PrimeNG a Tailwind CSS. API klient je generovaný z Backend pomocou Maven scriptu a uložený v `frontend/src/app/api`.
- **Infra tooling**: `docker-compose.yml` pre Postgres, `scripts/local-k8s.sh` pre rýchly kind/minikube deployment vrátane buildov a port-forwardu。【F:docker-compose.yml†L1-L17】【F:README.md†L74-L101】

## Funkcionality a väzby FE/BE

### Autentifikácia a session
- **Backend**: `AuthRestApi` poskytuje `/api/auth/login`. `AuthService` overuje heslo, generuje `AuthToken` s rolou používateľa a zakóduje ho pomocou `TokenCodec` a TTL z `auth.session` konfigurácie.【F:backend/src/main/java/kuhcorp/template/auth/provider/custom/AuthRestApi.java†L19-L36】【F:backend/src/main/java/kuhcorp/template/auth/provider/custom/AuthService.java†L20-L72】
- **Request kontext**: `AuthTokenFilter` parsuje `Authorization: Bearer` hlavičku a sprístupňuje používateľa cez `RequestUserHolder`, ktorý vie o rolách a ID používateľa.【F:backend/src/main/java/kuhcorp/template/auth/AuthTokenFilter.java†L21-L78】【F:backend/src/main/java/kuhcorp/template/auth/userHolder/RequestUserHolder.java†L18-L65】
- **Frontend**: `AuthService` ukladá `LoginRes` do `localStorage`, sleduje expirácie JWT (`jwt-decode`) a ponúka computed signály pre rolu a profil. `AuthInterceptor` pridáva bearer token k požiadavkám (okrem `/api/auth`) a pri 401 automaticky odhlasuje.【F:frontend/src/app/core/services/auth.service.ts†L1-L67】【F:frontend/src/app/core/interceptors/auth.interceptor.ts†L15-L44】
- **UI**: komponent `LoginComponent` používa `AuthService.login` a po prihlásení presmeruje na `home`; ak BE vráti 401, interceptor vyčistí session.

### Konfigurácia aplikácie a doménové guardy
- **Backend**: `ConfigurationRestApi` na `/api/public/config/` vracia verziu aplikácie, interval pre reload a domény povolené pre aktuálneho používateľa. Doménové povolenia vyhodnocuje `DomainGuardRegistry`, ktorý hľadá beany s anotáciou `@DomainMapping`; napr. `TestService` povoľuje TEST doménu len pre určitých používateľov - pravidlá je možné určiť v override metóde `isDomainAllowed`.【F:backend/src/main/java/kuhcorp/template/domain/configuration/ConfigurationRestApi.java†L17-L30】【F:backend/src/main/java/kuhcorp/template/domain/configuration/domain/DomainGuardRegistry.java†L10-L38】【F:backend/src/main/java/kuhcorp/template/domain/test/TestService.java†L18-L50】
- **Frontend**: `ConfigurationService` cyklicky volá `ConfigApi.getConfig`, cacheuje `enabledDomains` a verziu a poskytuje `Signal` na zistenie, či je doména povolená. Komponenty (napr. `HomeComponent`) podľa toho zobrazujú odkazy alebo časti UI.【F:frontend/src/app/core/services/configuration.service.ts†L1-L48】【F:frontend/src/app/features/home/home.component.ts†L1-L26】

### Testovacia doména
- Zobrazuje základne POC funkcie, ktoré tento template projekt podporuje (CRUD operácie, filtrované zoznamy, admin/public endpointy).

### Formuláre a validácie naprieč FE/BE
- **OpenAPI generovanie**: backend profil `openapi` v `pom.xml` generuje frontend klienta aj surový `openapi.json` cez Maven plugin (`typescript-angular` a `openapi` generátory). Spúšťaj `./mvnw -Popenapi -DskipTests generate-sources` pri zmene kontraktu; výstup sa uloží do `frontend/src/app/api` a `frontend/src/app/api/spec/openapi.json`.【F:backend/pom.xml†L303-L355】
- **Vlastné validácie**: anotácie ako `@Email` majú validator a popis v `ValidationProps`, ktoré `OpenApiConfig` premieta do schémy (`pattern`, `example`, `x-localization-key`). FE builder tieto metadáta preberá a pridáva Angular validátory s lokalizačným kľúčom v `openapi-form-builder.ts`, aby chyby z backendu sedeli so schémou.【F:backend/src/main/java/kuhcorp/template/domain/etc/validation/ValidationProps.java†L13-L33】【F:backend/src/main/java/kuhcorp/template/api/OpenApiConfig.java†L25-L62】【F:frontend/src/app/shared/form/openapi/openapi-form-builder.ts†L23-L71】. Pri vytvorení nového validátora treba pridať anotáciu, a rozšíriť zoznam v `ValidationProps`.
- **Formulárová vrstva**: komponent `FormComponent` stavia formuláre z OpenAPI špecifikácie cez helper `buildForm`, používa `ApiHandlingService` na jednotné oznamy/redirecty a podporuje `dataFetcher` pre predvyplnenie dát (napr. editácia entity). Custom form controls (`CustomFormGroup`, `CustomFormArray`) sledujú zmeny a vedia aplikovať nové initial values podľa OpenAPI schémy.【F:frontend/src/app/shared/components/form/wrapper/form/form.component.ts†L1-L84】【F:frontend/src/app/shared/form/openapi/openapi-form-builder.ts†L8-L89】【F:frontend/src/app/shared/form/custom/custom-form-array.ts†L11-L99】

### Seedovanie dát a režim CLI
- **CLI režim**: spustením backendu s argumentom `--seed-data` sa spustí `DataSeedingApp`, ktorý vytvorí kontext bez web servera a seedne základné datasety. Výsledok vypíše na STDOUT.【F:backend/src/main/java/kuhcorp/template/DemoApplication.java†L12-L29】【F:backend/src/main/java/kuhcorp/dataseeding/DataSeedingApp.java†L17-L34】
- **Dostupné seedy**: `UserDataSeeder` vytvára adminov, používateľov a testovacích používateľov viazaných na TEST entitu (počet závisí od profilu). Pomocné triedy ako `DataSeedingProfile` a `DatasetVersion` pomáhajú meniť objem dát medzi minimal/full režimom.【F:backend/src/main/java/kuhcorp/dataseeding/domain/user/UserDataSeeder.java†L17-L41】【F:backend/src/main/java/kuhcorp/dataseeding/DataSeedingProfile.java†L5-L20】

### CI pipeline
- GitHub Actions workflow `.github/workflows/ci.yml` sa spúšťa na `push`, `pull_request` aj manuálne cez `workflow_dispatch` s voliteľným suffixom verzie pre backend/frontend.【F:.github/workflows/ci.yml†L1-L188】
- `backend-build` job beží na JDK 21 a spúšťa `./mvnw clean verify`, čím pokrýva unit aj integračné testy v Maven profile.【F:.github/workflows/ci.yml†L18-L33】
- `frontend-build` používa Node 22 a buildí Angular aplikáciu v production konfigurácii (`npm ci` + `npm run build -- --configuration production`).【F:.github/workflows/ci.yml†L34-L48】
- `e2e` job (po `backend-build`) spustí Postgres službu, postaví backend Docker image, seedne DB pomocou `--seed-data`, naštartuje kontajner a beží Vitest e2e (`npm run test:e2e`). Pri páde pribalí backend logy ako artefakt.【F:.github/workflows/ci.yml†L49-L142】
- `deploy` sa spustí iba na `main` po úspechu všetkých jobov, vytvorí verziu z prefixov vo `backend/VERSION` a `frontend/VERSION` plus run number/manual suffix, buildne a pushne Docker obrazy (aj `latest`). Helm deploy je zatiaľ vykomentovaný/TODO.【F:.github/workflows/ci.yml†L143-L220】

### Testovanie
- **Backend**: `./mvnw clean verify` (spúšťané aj v CI) pokryje unit/integration; e2e Vitest testy spustíš v `backend/` cez `npm run test:e2e` s bežiacim Postgresom a backendom (využívajú seedované účty ako `alice@email.com`/`pass123`).【F:.github/workflows/ci.yml†L18-L124】【F:README.md†L65-L78】
- **Frontend**: kritické unit testy bežia cez `npm run test:vitest` po `npm install` v `frontend/`; CI pipeline buildí appku v production móde, testy sa spúšťajú lokálne pri potrebe validácie session logiky.【F:.github/workflows/ci.yml†L34-L48】【F:README.md†L74-L78】
