# Backend (Spring Boot)

- [Moduly a balíky](#moduly-a-baliky)
- [Konfigurácia a spúšťanie](#konfigurácia-a-spúšťanie)
- [Autentifikácia](#autentifikácia)
- [API](#api-vrstvy)
- [Dáta a persistencia](#dáta-a-persistencia)
  - [Migrácie s Liquibase](#migrácie-s-liquibase)
- [OpenAPI generovanie a validácie](#openapi-generovanie-a-validácie)
- [Domény](#domény)
  - [User](#user) 
  - [Konfigurácia](#konfigurácia)
  - [Test](#test)
- [Testovanie](#testovanie)
  - [E2E testy s Vitest](#e2e-testy-s-vitest)
  - [Unit a integračné testy](#unit-a-integračné-testy)

## Moduly a balíky
- `kuhcorp.dataseeding` – CLI aplikácia (`DataSeedingApp`) pre seedovanie dát a služby pre generovanie datasetov. Dataseed sa spustí v prípade že verzia dát definovaná v `DatasetVersion` neodpovedá verzii v DB (tabuľká `config_attributes`).【F:backend/src/main/java/kuhcorp/dataseeding/DataSeedingApp.java†L17-L34】【F:backend/src/main/java/kuhcorp/dataseeding/DatasetVersion.java†L5-L32】
- `kuhcorp.template` – hlavná Spring Boot aplikácia (`DemoApplication`)
- `kuhcorp.template.api` - OpenAPI konfigurácia, spoločné DTO (`PageReq`, `PageDto`) a error handling (`ApiExceptionHandler`, `BadRequestApiError`).
- `kuhcorp.template.auth` – autentifikácia a správa prihláseného používateľa.
- `kuhcorp.template.db` – JPA repository a audit metadata. Taktiež implemntácia QueryDSL helperov a vlasnej `Repo` triedy.
- `kuhcorp.template.data` – utility pre šifrovanie a hash
- `kuhcorp.template.domain` – doménové API moduly (napr. `configuration`, `test`).
- `resources` - konfigurácia aplikácie (DB pripojenie, tajné kľúče), Liquibase migrácie.

## Konfigurácia a spúšťanie
- Základná konfigurácia je v `backend/src/main/resources/application.yaml` (DB pripojenie, `auth.secret`, `auth.session.ttl-seconds`, šifrovací kľúč).【F:backend/src/main/resources/application.yaml†L1-L22】
- Lokálne spustenie: `./mvnw spring-boot:run` s bežiacim Postgresom (pozri `docker-compose.yml`). CLI režim pre seedovanie: `./mvnw spring-boot:run -Dspring-boot.run.arguments=--seed-data` (spustí `DataSeedingApp`).【F:backend/src/main/java/kuhcorp/template/DemoApplication.java†L12-L29】【F:docker-compose.yml†L1-L17】
- OpenAPI generovanie je konfigurované v `openapitools.json` a `OpenApiConfig`; výstup sa používa na generovanie Angular klienta a e2e axios klienta. Spusti `./mvnw -Popenapi -DskipTests generate-sources` na aktualizáciu po zmenách kontraktu.【F:backend/src/main/java/kuhcorp/template/api/OpenApiConfig.java†L17-L80】【F:backend/openapitools.json†L1-L45】

## Autentifikácia
- `AuthRestApi` poskytuje endpoint `/api/auth/login`, ktorý overuje prihlasovacie údaje cez `AuthService`, generuje `AuthToken` s rolou používateľa a zakóduje ho pomocou `TokenCodec`. Token má TTL podľa `auth.session.ttl-seconds`.【F:backend/src/main/java/kuhcorp/template/auth/provider/custom/AuthRestApi.java†L19-L36】【F:backend/src/main/java/kuhcorp/template/auth/provider/custom/AuthService.java†L20-L72】
- `AuthTokenFilter` spracováva `Authorization: Bearer` hlavičku, dekóduje token a sprístupňuje prihláseného používateľa cez `RequestUserHolder`, ktorý poskytuje informácie o rolách a ID používateľa.【F:backend/src/main/java/kuhcorp/template/auth/AuthTokenFilter.java†L21-L78】【F:backend/src/main/java/kuhcorp/template/auth/userHolder/RequestUserHolder.java†L18-L65】
- `AuthConfig` nastavuje bezpečnostné pravidlá pre endpointy (public prístup, prístup iba s určitou rolou - `UserRole`, ...) pomocou Spring Security.【F:backend/src/main/java/kuhcorp/template/auth/AuthConfig.java†L15-L72】
- `provider` - obsahuje implementácie pre autentifikácie. Malo by byť možné jednoducho pridať externého providera, napríklad Keycloak, OAuth2, atď.
  - `custom` – vlastná implementácia autentifikácie s používateľmi v DB (napr. `AuthRestApi`, `AuthService`).

## API
- **Custom Exception handling**: `ApiExceptionHandler` mapuje výnimky na štruktúrované API chyby s kódmi a správami. Používa sa naprieč doménami. V prípade vlastnej výnimky stačí vytvoriť novú triedu a pridať handler metódu s anotáciou `@HttpApiError`. Existujú už preddefinované anótácie, ktoré vyplnia Status kód (napr. `@BadRequestApiException`)
- **Spoločné DTO**: `PageReq` a `PageDto` pre stránkované zoznamy s metadátami (celkový počet, počet stránok). Používa sa v rôznych doménach.【F:backend/src/main/java/kuhcorp/template/api/ApiExceptionHandler.java†L17-L78】【F:backend/src/main/java/kuhcorp/template/api/dto/PageReq.java†L6-L26】【F:backend/src/main/java/kuhcorp/template/api/dto/PageDto.java†L6-L30】
- **OpenAPI konfigurácia**: `OpenApiConfig` nastavuje základné informácie o API, generuje OpenAPI špecifikáciu a mapuje vlastné validátory (napr. `@Email`) do schémy (pattern, example, lokalizačný kľúč).【F:backend/src/main/java/kuhcorp/template/api/OpenApiConfig.java†L17-L80】

## Dáta a persistencia
- `kuhcorp.template.db` poskytuje základ pre JPA repository (`Repo` s QueryDSL helpermi) a entity s auditnými metadátmi (`EntityWithMetadata`, `EntityWithStatus`).【F:backend/src/main/java/kuhcorp/template/db/Repo.java†L9-L63】【F:backend/src/main/java/kuhcorp/template/db/EntityWithMetadata.java†L6-L36】
- QueryDSL obsahuje metamodely generované počas build procesu (napr. `QTestEntity` pre `TestEntity`). Test sa používa pri tvorbe typovo bezpečných dotazov v Repo triedach.
- Funkcia filtrovania: `kuhcorp.template.db.filter` poskytuje základ pre filtrované dotazy v Repo vrstvách. Pre aplikovanie filtra je potrebné vytvoriť DTO triedu s požadovanými poľami, ktorá extenduje `ListtFilter`. V triede okrem polí, ktoré budú zobrezené v API schéme je potrebné definovať `Fields` - query dsl types, ktoré budú mapované na polia v DTO. Taktiež je potrebné overridnuť metodu `apply` v ktorej premapuješ DTO polia na query dsl polia pomocou potrebnej logiky (napr. like, equals, in, atď.) - tieto metódu sú definované v `ListFilter`. V Repo triede je potom možné injectnuť tento filter do *where* pomocou `filter.toPredicate(builder)`.【F:backend/src/main/java/kuhcorp/template/db/filter/ListFilter.java†L7-L78】【F:backend/src/main/java/kuhcorp/template/db/filter/Field.java†L6-L26】
- Funkcia stránkovania: `PageReq` DTO obsahuje polia pre stránkovanie (page, size, sort) a `Repo` trieda poskytuje metódu `getPage` na získanie stránkovaných výsledkov z dotazu. Výsledok je zabalený v `Page`, ktorý obsahuje zoznam výsledkov a metadáta o stránkovaní (totalElements, totalPages).【F:backend/src/main/java/kuhcorp/template/api/dto/PageReq.java†L6-L26】【F:backend/src/main/java/kuhcorp/template/api/dto/PageDto.java†L6-L30】【F:backend/src/main/java/kuhcorp/template/db/Repo.java†L9-L63】
- Šifrovanie/hashe: `HashEncoder` pre heslá, `EncryptedDataConverter` + `EncryptionEncoder` pre stĺpce šifrované v DB (kľúč v `encryption.secret`).【F:backend/src/main/java/kuhcorp/template/data/HashEncoder.java†L5-L26】【F:backend/src/main/java/kuhcorp/template/data/EncryptedDataConverter.java†L7-L44】
- Seedovanie: `UserDataSeeder` generuje demo používateľov a TEST dáta; `DataGenerator`/`DatasetVersion` riešia opakovateľné datasety a verziu seedov pre CI alebo lokálne prostredie.【F:backend/src/main/java/kuhcorp/dataseeding/domain/user/UserDataSeeder.java†L17-L41】【F:backend/src/main/java/kuhcorp/dataseeding/DatasetVersion.java†L5-L32】

### Migrácie s Liquibase
- Migrácie sú v `backend/src/main/resources/db/changelog/` a spúšťajú sa automaticky pri štarte aplikácie. Hlavný changelog je `db.changelog-master.yaml`, ktorý importuje ďalšie changelogy (napr. `001-initial-schema.yaml`).【F:backend/src/main/resources/db/changelog/db.changelog-master.yaml†L1-L10】
- V prípade novo vytvorenej aplikácie, keď budeš mať nejakú prvú verziu entít a chceš vytvoriť počiatočnú schému: 
  1. vymaž starý changelog vytvorený v tomto template, 
  2. spusti aplikáciu s prázdnou databázou a nastavením `spring.jpa.hibernate.ddl-auto=create`,
  3. vygeneruj nový changelog príkazom `mvn liquibase:generateChangeLog -Dliquibase.changeLogFile=src/main/resources/db/changelog/001-initial-schema.yaml`,
  4. uprav nový changelog podľa potreby (napr. odstráň zbytočné indexy, ktoré Hibernate vytvoril automaticky),
  5. nastav `spring.jpa.hibernate.ddl-auto=none` späť do `application.yaml`.
- Ďalšie migrácie pridávaj vytvorením nového changelogu (napr. `002-add-new-column.yaml`) a jeho importom v `db.changelog-master.yaml`. Pri spustení aplikácie sa migrácie aplikujú automaticky.【F:backend/src/main/resources/application.yaml†L10-L14】【F:backend/src/main/resources/db/changelog/db.changelog-master.yaml†L1-L10】

## OpenAPI generovanie a validácie
- **Maven profil `openapi`**: plugin `openapi-generator-maven-plugin` má tri exekúcie – generuje Angular klienta (`typescript-angular` do `frontend/src/app/api`), uloží OpenAPI JSON (`openapi.json` do `frontend/src/app/api/spec`) a e2e axios klient (`backend/e2e/client/generated`). Spusť `./mvnw -Popenapi -DskipTests generate-sources` na aktualizáciu po zmenách kontraktu.【F:backend/pom.xml†L303-L355】
- **Custom validátory v schéme**: anotácia `@Email` a ďalšie budúce validátory sú registrované v `ValidationProps`; `OpenApiConfig` ich premieta do OpenAPI cez `PropertyCustomizer` (pattern, example, default message, `x-localization-key`). FE builder podľa toho doplní Angular validátory a lokalizačný kľúč pre chyby (pozri `docs/README.md` a `docs/frontend.md`).【F:backend/src/main/java/kuhcorp/template/domain/etc/validation/ValidationProps.java†L13-L33】【F:backend/src/main/java/kuhcorp/template/api/OpenApiConfig.java†L25-L62】
- **Rozšírenie validatorov**: nový validator pridáš vytvorením anotácie + `ConstraintValidator`, registráciou v `ValidationProps` (pattern, lokalizačný kľúč, príklad) a (ak treba) doplnením popisu do `OpenApiConfig`. Generator následne prenesie pattern do FE schémy a do Angular form buildera bez ďalšieho kódu.【F:backend/src/main/java/kuhcorp/template/domain/etc/validation/Email.java†L1-L18】【F:backend/src/main/java/kuhcorp/template/domain/etc/validation/EmailValidator.java†L1-L18】【F:backend/src/main/java/kuhcorp/template/api/OpenApiConfig.java†L25-L62】

## Domény
### User
- Správa používateľov, ich rolí a autentifikácie. Obsahuje `UserEntity`, `UserRepo`, `UserService` a `AuthService` pre overovanie hesiel a generovanie tokenov.【F:backend/src/main/java/kuhcorp/template/domain/user/entity/UserEntity.java†L6-L50】【F:backend/src/main/java/kuhcorp/template/domain/user/repo/UserRepo.java†L6-L26】【F:backend/src/main/java/kuhcorp/template/domain/user/service/UserService.java†L18-L72】
- Podporované role sú definované v `UserRole` enum.【F:backend/src/main/java/kuhcorp/template/domain/user/UserRole.java†L5-L20】
- Seedovanie používateľov je v `UserDataSeeder` (admin, bežní používatelia, testovací používatelia).【F:backend/src/main/java/kuhcorp/dataseeding/domain/user/UserDataSeeder.java†L17-L41】
- API pre správu používateľov je možné pridať podľa potreby (napr. registrácia, zmena hesla, zoznam používateľov).

### Konfigurácia
- `ConfigurationRestApi` na `/api/public/config/` vracia verziu aplikácie, interval pre reload a domény povolené pre aktuálneho používateľa. Doménové povolenia vyhodnocuje `DomainGuardRegistry`, ktorý hľadá beany s anotáciou `@DomainMapping`. Príkladom je `TestService`, ktorý povoľuje TEST doménu len pre určitých používateľov - pravidlá je možné určiť v override metóde `isDomainAllowed`.【F:backend/src/main/java/kuhcorp/template/domain/configuration/ConfigurationRestApi.java†L17-L30】【F:backend/src/main/java/kuhcorp/template/domain/configuration/domain/DomainGuardRegistry.java†L10-L38】【F:backend/src/main/java/kuhcorp/template/domain/test/TestService.java†L18-L50】
- `DomainMapping` anotácia označuje služby, ktoré majú doménové povolenia. Každá služba musí implementovať `DomainGuard` rozhranie s metódou `isDomainAllowed`, ktorá rozhoduje o povolení domény pre prihláseného používateľa.【F:backend/src/main/java/kuhcorp/template/domain/configuration/domain/DomainMapping.java†L5-L22】【F:backend/src/main/java/kuhcorp/template/domain/configuration/domain/DomainGuard.java†L5-L20】
- `AppConfig` poskytuje základné konfiguračné hodnoty aplikácie (verzia, reload interval).【F:backend/src/main/java/kuhcorp/template/domain/configuration/AppConfig.java†L6-L26】
- Konfiguračné atribúty sú uložené v tabuľke `config_attributes` s entitou `ConfigAttributeEntity` a spravované cez `ConfigAttributeRepo`.【F:backend/src/main/java/kuhcorp/template/domain/configuration/entity/ConfigAttributeEntity.java†L6-L36】【F:backend/src/main/java/kuhcorp/template/domain/configuration/repo/ConfigAttributeRepo.java†L6-L26】
- Seedovanie konfiguračných dát je možné pridať podľa potreby.

### Test
- Jednoduchá doména pre demonštráciu CRUD operácií, filtrovaných zoznamov a doménových povolení.

## Testovanie
### E2E testy s Vitest
- E2E testy sú v `backend/e2e/` a používajú Vitest s axios klientom generovaným z OpenAPI špecifikácie. Testy sa spúšťajú cez `npm run test:e2e` v `backend/` s bežiacim Postgresom a backendom (využívajú seedované účty ako `alice`/`pass123`).【F:backend/e2e/tests/auth.e2e.ts†L1-L60】【F:backend/e2e/client/generated/README.md†L1-L20】
- Testy pokrývajú autentifikáciu, autorizáciu, CRUD operácie a filtrované zoznamy v TEST doméne. Pri potrebe je možné pridať ďalšie testy.【F:backend/e2e/tests/test-domain.e2e.ts†L1-L120】
### Unit a integračné testy
- Spúšťajú sa cez `./mvnw clean verify` (pokrývajú unit aj integračné testy).
- Momentálne nie sú setupnuté žiadne testy, je potrebné ich pridať podľa potreby.