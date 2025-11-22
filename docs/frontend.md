# Frontend (Angular)

- [Architektúra a knižnice](#architektúra-a-knižnice)
- [PrimeNG](#primeng)
- [Routing](#routing)
- [Služby a dátové toky](#služby-a-dátové-toky)
- [Práca s OpenAPI klientom](#práca-s-openapi-klientom)
- [Formy a validácie](#formy-a-validácie)
- [List view](#list-view)
- [Pomocné utility pre vývoj](#pomocné-utility-pre-vývoj)

## Architektúra a knižnice
- Angular 20 s PrimeNG a Tailwind (globálne štýly definované v `angular.json`, `styles.css` a presetoch v `primeng.themepreset.ts`). Proxy na backend je nastavená v `proxy.conf.json`; dev server beží cez `npm start` na porte `4300`.【F:frontend/package.json†L1-L23】【F:frontend/README.md†L5-L31】
- OpenAPI klient a modely sú v `src/app/api`; generované triedy sú izolované od zvyšku appky cez `ApiModule` a injektované služby (`AuthApi`, `ConfigApi`, `TestApi`).【F:frontend/src/app/api/api/api.ts†L1-L29】【F:frontend/src/app/api/api.module.ts†L1-L23】

## PrimeNG
- PrimeNG komponenty používame naprieč celou appkou (tabuľky, gridy, formulárové inputy). Tému injektujeme v `app.config.ts` cez `providePrimeNG` a nastavíme vlastný preset `MyPreset`, ktorý vychádza z predlohy Lara a zapína aj dark mode selector pre `.dark-mode-toggle`.【F:frontend/src/app/app.config.ts†L8-L31】
- Farebný základ je v `primeng.themepreset.ts`: upravuje semantické `primary` odtiene a highlighty pre light/dark schemu, ktoré PrimeNG prebublá do CSS premenných (`--p-primary-color`, `--p-surface-100`, `--p-text-color`, ...). Ak potrebuješ zmeniť brand farbu, stačí prehodiť hodnoty v `semantic.primary` alebo `colorScheme`.【F:frontend/src/assets/config/primeng.themepreset.ts†L4-L49】
- Premenné vieš použiť aj mimo komponentov; v `styles.scss` ich kombinujeme s Tailwind utility (`@apply`) a natívnym CSS (`var(--p-primary-color)`) na texty, pozadia či scrollbar. Rovnaký pattern použi pri vlastných komponentoch, aby si zachoval konzistentný look & feel.【F:frontend/src/styles.scss†L4-L55】
- Konfigurácia farieb si vieš skontrolovať v komponente `component-shows`

## Routing
- Routing je type-safe: `AppRoutes` definuje funkcie `to()` pre každú cestu a `RoutePath` (v `routes/types.ts`) z nich vytvorí union. Tým pádom kompilátor skontroluje aj argumenty parametrov (`detail(id: number)` a pod.).【F:frontend/src/app/app.routes.ts†L8-L60】【F:frontend/src/app/app/routes/types.ts†L3-L15】
- Nový modul pridaj tak, že vytvoríš vlastný `feature.routes.ts` s `XyzRoutes` (rovnaký pattern ako `TestRoutes`) a voliteľným `XyzRoutesContext` na prefix (napr. pre lazy modul). Exportnuté `Routes` pole (`testRouting`) vlož do hlavného `routes` zoznamu a `XyzRoutes` pridaj do `AppRoutes`, aby bol dostupný všade cez typované `to()` helpery.【F:frontend/src/app/features/test/test.routes.ts†L11-L70】【F:frontend/src/app/app.routes.ts†L6-L60】
- Navigáciu používaj cez `RedirectService.to()`/`store()`; berú typované `RoutePath` funkcie a voliteľné parametre, takže sa nedá zavolať neexistujúca cesta. `RedirectDirective` (`[appRedirect]`) to ešte zjednodušuje v šablónach – stačí odovzdať `RouteArgs` alebo priamo `AppRoutes.foo` a klik prenaviguje podľa type-safe helpera.【F:frontend/src/app/core/services/redirect.service.ts†L14-L70】【F:frontend/src/app/shared/directives/redirect.directive.ts†L1-L36】

## Loading
- **Global loading**: `LoadingService` drží sadu aktívnych požiadaviek a cez debounced `showLoading` signal (300 ms) zapína globálny spinner v `app.html`. `GlobalLoadingInterceptor` ho volá pre každý HTTP request (show/hide), takže nie je potrebné riešiť loader v každej službe zvlášť.【F:frontend/src/app/core/services/loading.service.ts†L7-L47】【F:frontend/src/app/core/interceptors/global-loading.interceptor.ts†L8-L25】【F:frontend/src/app/app.html†L1-L6】
- **Vypnutie/global lock**: `withLoading` (v `loading-pipe.ts`) vie pri lokálnom loade zamknúť globálny overlay (`lockAll/unlockAll`) a paralelne obslúžiť vlastný `BehaviorSubject`, čo je už zapojené vo formulároch a list view orchestrátoroch. Použi `source$.pipe(withLoading(localLoading$, loadingSvc))`, keď chceš namiesto globálneho spinnera zobraziť lokálny skeleton/spinner.【F:frontend/src/app/shared/loading-pipe.ts†L1-L19】【F:frontend/src/app/shared/components/form/wrapper/form/form.component.ts†L34-L86】【F:frontend/src/app/shared/components/list-view/list-view.orchestrator.ts†L178-L214】
- **Lokálne spinnery/skeletony**: `LoadingDirective` (`*appLoading="loading$; skeleton: MySkeleton; buttonLoading: true"`) prepína skeleton alebo default spinner podľa `loading$`. Vieš jej podať vlastný skeleton komponent (napr. jednoduchý komponent s [`<p-skeleton>`](https://primeng.org/skeleton)) a bude ho renderovať počas loadingu; pri `buttonLoading` prepojí stav na PrimeNG `p-button`. Hodí sa na partial loading bez globálneho overlay, najmä v kombinácii s `withLoading`。【F:frontend/src/app/shared/directives/loading.directive.ts†L1-L104】
- **Formuláre**: `FormComponent` automaticky obalí `dataFetcher` cez `withLoading`, takže init načítanie detailu nastaví lokálny loading subject a pritom zamkne globálny spinner, aby sa overlay nezobrazoval pri každom načítaní formulára.【F:frontend/src/app/shared/components/form/wrapper/form/form.component.ts†L62-L86】

## Služby a dátové toky
- **MyStorage**: abstrakcia nad `localStorage`/`sessionStorage` s JSON serializáciou a expiráciou kľúčov. Používa ju `AuthService` na ukladanie session dát. Ukladá verziu schéme z `openapi.json`, v prípade zmeny schémy vyčistí storage.【F:frontend/src/app/core/services/my-storage.service.ts†L1-L40】【F:frontend/src/app/core/services/auth.service.ts†L25-L35】
- **AuthService**: spravuje session (`LoginRes`), ukladá do `localStorage` cez `MyStorage`, vyhodnocuje expiráciu JWT a poskytuje computed signály na rolu/používateľa. Pri odhlásení vyčistí storage a presmeruje na login.【F:frontend/src/app/core/services/auth.service.ts†L1-L67】
- **AuthInterceptor**: pridáva `Authorization` hlavičku s tokenom pre ne-auth požiadavky a pri 401 spúšťa logout – netreba tento header riešiť manuálne.【F:frontend/src/app/core/interceptors/auth.interceptor.ts†L15-L44】
- **ConfigurationService**: periodicky získava `/api/public/config/`, ukladá `enabledDomains` a verziu a vystavuje `Signal` pre feature toggling. Po zmene prihlásenia vyvolá reload (subscribe na `AuthService.isLoggedIn`).【F:frontend/src/app/core/services/configuration.service.ts†L1-L48】【F:frontend/src/app/core/services/auth.service.ts†L15-L45】
  - **Domain guards**: `DomainGuard` implementácie (napr. `TestDomainGuard`) používajú `ConfigurationService` na povolenie/zakázanie prístupu k doménam. Pridaj nový guard pre každú novú doménu, ktorú chceš chrániť.【F:frontend/src/app/features/test/guards/test-domain.guard.ts†L1-L30. Použiješ to pomocou `canMatch[domainEnabledGuard(ConfigurationResEnabledDomainsEnum)]` v routingu.】
- **RedirectService**: centralizuje navigáciu a pamätá poslednú stránku (napr. po úspešnom logine). Používa ju login/guard komponenty. 【F:frontend/src/app/core/services/redirect.service.ts†L5-L36】
- **ApiHandlingService**: univerzálny observer pre HTTP volania (success toast, mapovanie chýb podľa kódu, voliteľný redirect). `FormComponent` ho využíva ako predvolený `submitHandler`, aby bola UX/redirect logika konzistentná naprieč formulármi.【F:frontend/src/app/core/services/api-handling.service.ts†L11-L48】【F:frontend/src/app/shared/components/form/wrapper/form/form.component.ts†L43-L71】
- **ToastService**: zobrazuje toast notifikácie (úspech, chyba, info) cez PrimeNG `MessageService`. Používa ho `ApiHandlingService` a môžeš ho využiť aj inde.【F:frontend/src/app/core/services/notification.service.ts†L1-L30】
- **MyTranslateService**: wrapper nad `@ngx-translate/core`, ktorý pridáva podporu pre fallback jazyky (napr. angličtina, ak chýba lokalizácia v slovenčine). Používa sa v celom projekte na preklady.【F:frontend/src/app/core/services/my-translate.service.ts†L1-L40】
- **DarkModeService**: spravuje prepínanie dark mode cez `localStorage` a pridávanie/odstraňovanie `.dark-mode` triedy na `<body>`. Používa ho `DarkModeToggleComponent` v headeri.【F:frontend/src/app/core/services/dark-mode.service.ts†L1-L30】【F:frontend/src/app/shared/components/dark-mode-toggle/dark-mode-toggle.component.ts†L1-L40】

## Práca s OpenAPI klientom
- Generovaná schéma je v `src/app/api/spec/openapi.json`; pri zmene backendu aktualizuj schému (napr. stiahnutím z `/api-docs`) a postupuj podľa `src/app/api/README.md` na regeneráciu klienta.【F:frontend/src/app/api/spec/openapi.json†L1-L34】【F:frontend/src/app/api/README.md†L1-L26】
- Každý API modul (napr. `TestApi`) má vlastnú službu s metódami pre endpointy; používa RxJS `Observable` a generované modely (napr. `TestEntity`, `CreateTestReq`).【F:frontend/src/app/api/api/test-api.service.ts†L1-L150】【F:frontend/src/app/api/models/test-entity.ts†L1-L45】
- Typy a služby importuj z barrel súboru `src/app/api/index.ts` a injektuj ich do komponentov/služieb; konfiguráciu base URL rieši `Configuration` trieda alebo `proxy.conf.json` v dev móde.【F:frontend/src/app/api/index.ts†L1-L22】【F:frontend/src/app/api/configuration.ts†L37-L113】

## Formy a validácie
- **OpenAPI form builder**: `buildForm(spec, fields, initial, trackChanges)` vytvorí type-safe `CustomFormGroup<T>` z OpenAPI schémy (aj s `$ref`). Validátory berie z `required`, `pattern`, min/max, minLength/maxLength a vie pridať custom sync/async validátory z parametra `fields`. Príklad: 
  ```ts
  const form = buildForm<CreateTestReq>(
    OPENAPI_SCHEMA.TestCreateReq,
    { name: { validators: [Validators.required] } },
    { name: 'Default' },
    true // trackChanges zapne indikáciu zmien
  );
  ```
  `ControlsOf<T>` zaručí, že `form.controls.name` sedí na typ z modelu.【F:frontend/src/app/shared/form/openapi/openapi-form-builder.ts†L8-L90】
- **Custom form nodes**: wrappery `CustomFormControl`, `CustomFormGroup`, `CustomFormArray` sú type-safe (generiká viazané na model) a uchovávajú `initialValue`. `isChanged`/`changed$` signalizujú zmeny hodnoty; `updateInitialValue` nastaví baseline (napr. po fetchi detailu) a `resetToInitial` vráti formulár do pôvodného stavu. Tieto triedy sú základ pre všetky formové komponenty.【F:frontend/src/app/shared/form/custom/custom-form-group.ts†L1-L116】【F:frontend/src/app/shared/form/custom/custom-form-array.ts†L1-L196】
- **OpenAPI validátory a lokalizácia**: builder generuje `openapiError` s `x-localization-key` podľa backend `ValidationProps`, takže FE chyby kopírujú BE lokalizačné kľúče. Navyše môžeš pridať vlastný async validator cez `createAsyncValidator` z `form.service.ts` priamo v `fields`: 
  ```ts
  import {createAsyncValidator} from './form.service';
  const uniqueEmail = createAsyncValidator((val) => api.checkEmail(val), 'emailTaken');
  const form = buildForm<UserReq>(schema, { email: { asyncValidators: [uniqueEmail] } });
  ```
  【F:frontend/src/app/shared/form/openapi/openapi-form-builder.ts†L95-L143】【F:frontend/src/app/shared/form/form.service.ts†L1-L22】【F:backend/src/main/java/kuhcorp/template/api/OpenApiConfig.java†L25-L62】
- **FormComponent**: layout wrapper pre `<form>`. Prijíma `form` (`CustomFormGroup`), povinné `onSubmit` (Observable/Promise), voliteľný `submitHandler` (Observer), `redirectOnSuccess`, `dataFetcher` (naplní formulár + nastaví initial), `resetOnSubmit`, `shouldSubmit`, `dataPrepareBeforeSubmit`, a aj loading signály (`initDataLoadingSubject` + `initDataLoading` output). Pri submite validuje, scrollne na prvý error a vie auto-resetovať alebo redirectnúť.【F:frontend/src/app/shared/components/form/wrapper/form/form.component.ts†L1-L120】
- **Form field wrappery**: základné input komponenty (InputText, Number, Password, atď.) wrapujú PrimeNG a používajú `FormFieldComponent`, ktorý rieši label/tooltip/help text, required status, chybové správy a zvýraznenie zmenených polí (`isChanged` -> `is-edited` CSS). Vie tiež počúvať `loading$` a dočasne disableovať control.【F:frontend/src/app/shared/components/form/wrapper/form-field/form-field.component.ts†L1-L77】
- **FormObjectArrayComponent**: wrapper nad `CustomFormArray` objektov; cez `itemTemplate` definuješ layout jednej položky a pomocou `add()`/`remove(i)` (prístupné ako `addFn`/`removeFn` v template kontexte) pridávaš/odoberáš prvky. Podporuje vlastné templaty pre add/remove/no-items a horizontálny/vertikálny layout, takže vieš rýchlo poskladať dynamické polia komplexných objektov.【F:frontend/src/app/shared/components/form/wrapper/form-object-array/form-object-array.component.ts†L1-L61】

## List view
- **Prehľad**: rieši paginované/nekonečné zoznamy s filtrom, cache stránok a perzistenciou stavu. Vyberáš medzi číselným paginatorom alebo „load more“ (button/scroll) a dáta môžeš filtrovať cez typovaný form builder.【F:frontend/src/app/shared/components/list-view/list-view.orchestrator.ts†L1-L214】
- **ListViewOrchestrator**: prijme `fetcher` (`simple`, `filtered`, `paginated`, `paginatedFiltered`), `numberPageConf` alebo `nextPageConf`, voliteľný `filterConf` s `CustomFormGroup`, `LoadingService` a nastavenie perzistencie (`route`/`localStorage`/`sessionStorage`). `updateFilter` resetuje stránku, syncne filter form; `updatePageReq` obsluhuje čísla aj „load more“ s cache page; `withLoading` integruje lokálny loading cez `withLoading` pipe.【F:frontend/src/app/shared/components/list-view/list-view.orchestrator.ts†L20-L214】【F:frontend/src/app/shared/components/list-view/list-view.orchestrator.ts†L214-L360】
- **Perzistencia**: aktuálny filter a stránku vieš ukladať buď do URL (`mode: 'route'`), alebo do `MyStorage` (lokálne/session). Stačí nastaviť `statePersistence: { mode: 'localStorage', key: 'tests-list', persistFilter: true, persistPage: true }` pri vytváraní orchestrátora, prípadne `mode: 'route'` ak chceš sharovateľný filter v linku.【F:frontend/src/app/shared/components/list-view/list-view.orchestrator.ts†L214-L360】
- **Príklad vytvorenia orchestrátora**:
  ```ts
  const orc = new ListViewOrchestrator<TestEntity, TestFilter>({
    fetcher: { type: 'paginatedFiltered', fn: (f, p) => api.adminTestList(f, p) },
    numberPageConf: { pageSize: 10, pageSizes: [10, 20, 50] },
    filterConf: { form: buildForm<TestFilter>(OPENAPI_SCHEMA.TestFilter, {}, {}, true), emitOnChange: true },
    loadingSvc,
    statePersistence: { mode: 'route', key: 'test-list', persistFilter: true, persistPage: true }
  });
  ```
- **ListViewComponent**: renderuje `itemsTemplate` s dátami a stavom `isLoading`, voliteľne zobrazí `skeletonTemplate`. `detailRedirect` využije `RedirectService` a type-safe route na klik itemu.【F:frontend/src/app/shared/components/list-view/list-view.component.ts†L1-L60】
- **Pohľady**: `LayoutViewComponent` skladá grid/flex layout s item templatom, skeletonmi, empty templatom, filtrom a paginatorom; `TableViewComponent` robí to isté pre `p-table` (caption/header/body/footer/empty/loading templaty), podporuje redirect na detail a mód scroll/stack.【F:frontend/src/app/shared/components/list-view/views/layout-view.component.ts†L1-L140】【F:frontend/src/app/shared/components/list-view/views/table-view.component.ts†L1-L160】
- **Paginátory**: `ListNumberPaginatorComponent` používa PrimeNG paginator, dá sa prebiť vlastným templatom; `ListNextPaginatorComponent` prepína medzi `NextButtonPaginatorComponent` (tlačidlo „load more“) a `NextScrollPaginatorComponent` (infinite scroll) podľa konfigurácie alebo vstupu `mode`. Obe volajú `updatePageReq`/`loadMore` orchestrátora.【F:frontend/src/app/shared/components/list-view/paginator/list-number-paginator.component.ts†L1-L50】【F:frontend/src/app/shared/components/list-view/paginator/list-next-paginator.component.ts†L1-L70】【F:frontend/src/app/shared/components/list-view/paginator/paginators/next-button-paginator.component.ts†L1-L40】【F:frontend/src/app/shared/components/list-view/paginator/paginators/next-scroll-paginator.component.ts†L1-L60】
- **Filter**: `ListFilterComponent` vezme `filterTemplate` a `CustomFormGroup` z orchestrátora, pri submit/clear volá `updateFilter`; ak `emitOnChange`, posiela filter s debounce. Hodí sa na text/enum/date filtre nad OpenAPI typmi.【F:frontend/src/app/shared/components/list-view/filter/list-filter.component.ts†L1-L60】

## Pomocné utility pre vývoj
- **dataFetcher**: RxJS helper, ktorý uloží výsledok prvého fetchu a pri ďalších `subscribe` ho emitne bez ďalšieho HTTP volania; hodí sa pre `FormComponent` pri editácii detailu alebo opakované čítanie konfigurácie.【F:frontend/src/app/shared/api/data-fetcher.ts†L1-L19】
- **NullifyEmptyStringsInterceptor**: pred odoslaním požiadavky transformuje prázdne stringy na `null` (okrem `FormData`), aby backend správne rozlíšil nezadané vs. prázdne hodnoty.【F:frontend/src/app/core/interceptors/nullify-empty-strings.interceptor.ts†L1-L18】
- **DestroyableDirective**: poskytuje `untilDestroy` pre RxJS subscribe v komponentoch/direktívach, aby sa pri destroy unsubscribovalo; dedí z nej napr. `FormArrayDirective` pre multiselect/FormArray wrappery.【F:frontend/src/app/shared/directives/destroyable.directive.ts†L1-L18】【F:frontend/src/app/shared/components/form/wrapper/form-array/form-array.directive.ts†L1-L23】
- **FormArrayDirective & FormObjectArrayComponent**: helpery pre prácu s OpenAPI array fieldami, synchronizujú `selectedValues` s `CustomFormArray` a používajú sa v multiselectoch alebo poli embedded objektov (`test` feature).【F:frontend/src/app/shared/components/form/wrapper/form-array/form-array.directive.ts†L1-L23】【F:frontend/src/app/shared/components/form/wrapper/form-object-array/form-object-array.component.ts†L1-L75】
