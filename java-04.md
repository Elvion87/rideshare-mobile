# RideShare — Java 4 · Neon dhe PostgreSQL

## Çfarë ndërtova

Lista, detajet dhe faqja e kërkesës lexojnë të dhënat fiktive nga Neon përmes paketës `@neondatabase/serverless`. Lidhja ruhet vetëm në `DATABASE_URL` në server; kodi i databazës mbrohet me `server-only`. Leximet parametrizohen dhe bëhen në çdo kërkesë që ndryshimet në Neon të shfaqen pas rifreskimit. Skema dhe tri udhëtimet fillestare gjenden te [schema.sql](./schema.sql). Kërkesa vazhdon të jetë demonstrim dhe nuk ruhet.

## Provat që bëra

### Prova 1: Ndryshimi në databazë shfaqet në aplikacion

Nuk u ekzekutua në këtë mjedis: nuk ka `DATABASE_URL` të konfiguruar dhe nuk kam qasje te llogaria/databaza Neon. Për ta provuar, ndrysho orën e udhëtimit `2` nga `08:15` në `08:25` në Neon SQL Editor, rifresko listën dhe `/udhetimi/2`, pastaj rikthe orën në `08:15`. Rezultati i pritur: të dy faqet tregojnë orën e re pa ndryshim kodi.

### Prova 2: Lista bosh dhe rikthimi

Nuk u provua kundrejt Neon-it. Në `lexoUdhetimet`, provo përkohësisht `FROM udhetimet WHERE false ORDER BY id`; faqja duhet të tregojë “Nuk ka udhëtime për momentin.” Hiqe `WHERE false`; tri kartat duhet të kthehen.

### Prova 3: Lidhja mungon, rikthimi dhe siguria

Nuk u provua me një databazë reale, sepse mungon `DATABASE_URL`. E nisa build-in e prodhimit pa atë variabël dhe kontrollova `/`, `/udhetimi/2` dhe `/udhetimi/2/kerkesa`: secila u përgjigj me mesazhin “Nuk u lidhëm me databazën. Provo përsëri.” dhe gabimi teknik regjistrohet në server. Për provën e rikthimit, konfiguro `DATABASE_URL` në `.env.local`, rinis serverin dhe verifiko që udhëtimet lexohen. `.env.local` përputhet me rregullin `.env*` në `.gitignore`; mos e publiko.

## Ku gjendet puna

- Skema SQL: [schema.sql](./schema.sql)
- Lidhja private: `src/lib/db.ts`
- Leximet nga databaza: `src/lib/udhetimet.ts`
- Faqet: `src/app/page.tsx`, `src/app/udhetimi/[id]/page.tsx` dhe `src/app/udhetimi/[id]/kerkesa/page.tsx`
- Repository: https://github.com/elvion87/rideshare-mobile

## Çfarë mbetet për përmirësim

Duhet konfiguruar një databazë Neon dhe të ekzekutohen tri provat me kredencialet e pronarit. Kërkesa “Në pritje” mbetet simulim; nuk ka rezervim real.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

Përdora AI për të lidhur faqet me Neon, për të përgatitur skemën dhe për të përditësuar udhëzimet. Verifikova tipizimin dhe ndërtimin lokal. Nuk pretendova se provat kundrejt një databaze reale u kryen, sepse kredencialet Neon nuk ishin të konfiguruara.
