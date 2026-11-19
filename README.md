# Rruga — Udhëtime për në AAB

Projekt mësimor për bashkudhëtimet studentore, i ndërtuar me Next.js App Router, TypeScript dhe Neon PostgreSQL. Udhëtimet janë të dhëna fiktive; kërkesat ruhen si demonstrim në Neon, pa njoftuar shoferin ose krijuar udhëtim real. Vendtakimi i zgjedhur lokalisht nuk i dërgohet shoferit.

## Nisja lokale

Kërkohen Node.js 20.9+ dhe npm.

```bash
npm install
```

Nëse nuk ke `.env.local`, kopjo `.env.example` me atë emër. Nëse e ke tashmë, ruaje `DATABASE_URL` ekzistues dhe shto vetëm vlerat e munguara. Plotëso kredencialet private te `.env.local`; mos e publiko dhe mos përdor prefiksin `NEXT_PUBLIC_`.

Variablat:

- `DATABASE_URL`: connection string i Neon PostgreSQL.
- `GITHUB_ID`, `GITHUB_SECRET`: kredencialet e GitHub OAuth App.
- `NEXTAUTH_SECRET`: sekret i rastësishëm për nënshkrimin e sesionit.
- `NEXTAUTH_URL`: `http://localhost:3000` për zhvillim lokal.

Për GitHub OAuth App përdor:

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Konfigurimi në Vercel

Përdor një GitHub OAuth App të veçantë për prodhim, që hyrja lokale të vazhdojë të përdorë callback-un `localhost`:

- Homepage URL: `https://rideshare-mobile-beta.vercel.app`
- Authorization callback URL: `https://rideshare-mobile-beta.vercel.app/api/auth/callback/github`

Në Vercel Project Settings → Environment Variables cakto për Production `DATABASE_URL` të së njëjtës bazë Neon ku janë ekzekutuar skemat, kredencialet `GITHUB_ID` dhe `GITHUB_SECRET` të aplikacionit OAuth të prodhimit, një `NEXTAUTH_SECRET` të rastësishëm dhe `NEXTAUTH_URL=https://rideshare-mobile-beta.vercel.app`. Pas ndryshimit të variablave, publiko një deployment të ri që ato të hyjnë në fuqi. Mos i vendos sekretet në Git.

Në Neon SQL Editor ekzekuto `schema.sql` për një bazë të re ose ekzekuto migrimet `schema-java05.sql`, `schema-java09.sql` dhe `schema-java10.sql` me radhë në bazën ekzistuese. Java 10 ruan një kërkesë për përdorues/udhëtim dhe e pranon në një veprim atomik që ul vendet vetëm një herë.

```bash
npm run dev
```

Hap adresën që shfaq terminali, zakonisht [http://localhost:3000](http://localhost:3000).

## Aktivizimi i panelit të shoferit

Identiteti vjen nga sesioni i verifikuar GitHub; roli dhe pronësia vijnë nga Neon. Përdoruesit e rinj krijohen fillimisht si udhëtarë. Hyr me GitHub dhe hap `/panel` një herë që profili yt të krijohet. Në Neon gjej ID-në numerike me:

```sql
SELECT github_id, emri, roli FROM profilet ORDER BY emri;
```

Cakto rolin dhe udhëtimin e provës te ID-ja jote, duke zëvendësuar tekstin e shembullit me ID-në tënde:

```sql
UPDATE profilet
SET roli = 'shofer'
WHERE github_id = 'VENDOS_ID_GITHUB';

UPDATE udhetimet
SET shofer_id = 'VENDOS_ID_GITHUB'
WHERE id = '2';

-- Për provën e Javës 10, përdor udhëtim fiktiv me të paktën dy vende.
UPDATE udhetimet
SET vende = 2
WHERE id = '2';
```

Rifresko `/panel`. Vetëm udhëtimet që Neon cakton te shoferi i kyçur mund të ndryshohen ose të menaxhojnë kërkesat. ID 1 i caktohet shoferit fiktiv `DEMO-SHOFER-2` për provën e refuzimit. Mos ndrysho rolin ose pronarin përmes kodit të shfletuesit.

## Rrugët dhe veçoritë

- `/`: lista e udhëtimeve publike nga Neon.
- `/udhetimi/[id]`: detajet, zgjedhja lokale e vendtakimit dhe ruajtja e preferimit.
- `/udhetimi/[id]/kerkesa`: kërkesë e ruajtur në Neon dhe status personal me përditësim automatik.
- `/panel`: hyrja me GitHub, ndryshimi i orës dhe pranimi i kërkesave vetëm për udhëtimet e shoferit.
- `/java-08-test`: faqe e pavarur për provat e vendtakimit; nuk kërkon hyrje, Neon apo sekrete.
- `/api/udhetimet`: vetëm të dhënat publike të udhëtimeve; endpoint-i nuk kthen profile ose kredenciale.
- `/api/udhetimet/[id]/gjendja`: vende dhe kërkesa për sesionin e kyçur; përgjigjja nuk ruhet në cache.
- `/offline.html`: lexues i kopjes publike të ruajtur në pajisje.

Service worker-i ruan vetëm `/offline.html`, ikonat dhe përgjigjen publike të `/api/udhetimet`. Nuk ruan panelin, hyrjen, sesionet apo kërkesat. Të dhënat offline mund të jenë të vjetruara dhe nuk provojnë disponueshmërinë e vendeve.

Vendtakimi mund të shkruhet manualisht ose mund të kërkohet vendndodhja pas klikimit dhe lejes së shfletuesit. Aplikacioni shfaq vetëm saktësinë e pozicionit; koordinatat nuk ruhen dhe nuk dërgohen. Preferimi dhe kërkesa kërkojnë hyrje e ruhen në Neon, nga një rresht për përdorues/udhëtim. Gjendja personale nuk ruhet offline; leximi rifillon automatikisht kur rikthehet rrjeti.

## Provat

1. Hape listën dhe `/udhetimi/2`; `/udhetimi/3` duhet të ketë veprimin e çaktivizuar, ndërsa `/udhetimi/99` duhet të shfaqë faqen e mungesës.
2. Te `/java-08-test`, provo Biblioteka → Parkingu pa konfirmim, tekst vetëm me hapësira, refuzimin, suksesin dhe skadimin e lejes. Automatizimi i Javës 8 kërkon 37 m si vlerë të simuluar; prova reale varet nga shfletuesi/pajisja.
3. Hape një herë `/` me internet, pastaj çaktivizo rrjetin për tab-in, rifresko dhe kontrollo kohën/burimin e kopjes offline.
4. Hyr në GitHub, cakto ID-në e shoferit në Neon, ndrysho orën e udhëtimit 2 dhe provo që ndryshimi i ID-së në 1 refuzohet.
5. Hyr dhe ruaj një udhëtim te të preferuarat. Rifresko; provo serverin e paarritshëm dhe klikimet e shpejta. Tabela SQL pengon kopjet.
6. Për Javën 10, cakto një udhëtim me dy vende te shoferi yt, hap `/panel` si shofer dhe `/udhetimi/ID/kerkesa` si udhëtar në sesion tjetër. Provo kërkesën, pranimin dhe rilidhjen sipas [raportit Java 10](./java-10.md).
7. Përfundimi teknik:

```bash
npm run build
```

Provat që kërkojnë kredenciale GitHub ose lidhje reale Neon nuk mund të kryhen pa vlerat e tua private.

## Raportet javore

- [Java 3](./java-03.md)
- [Java 4](./java-04.md)
- [Java 5](./java-05.md)
- [Java 6](./java-06.md)
- [Java 7](./java-07.md)
- [Java 8](./java-08.md)
- [Java 9](./java-09.md)
- [Java 10](./java-10.md)

Raportet dallojnë qartë kontrollet e kodit nga provat që duhen kryer me OAuth/Neon real. Përfundimet e provave fizike ose online plotësohen pasi të konfigurohen kredencialet.
