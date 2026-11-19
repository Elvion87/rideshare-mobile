# RideShare — Java 5 · Hyrja dhe lejet

## Çfarë ndërtova

Shtova hyrjen me GitHub OAuth dhe sesion server-side/JWT me afat dy orësh. ID-ja vjen nga identiteti i GitHub-it; emri dhe roli lexohen/ruhen veçmas në Neon. Profili i parë ka rolin `udhetar`. Ora mund të ndryshohet vetëm kur roli është `shofer` dhe udhëtimi është caktuar te ID-ja e sesionit. Kontrolli bëhet server-side në UPDATE, jo vetëm në pamjen e formularit.

## Provat që bëra

### Prova 1: Hyrja, rifreskimi dhe dalja

OAuth App dhe sekretet personale nuk ishin të konfiguruara gjatë ndryshimit të kodit, prandaj rrjedha me llogarinë reale nuk u pretendua si e provuar. Pas plotësimit të `.env.local`, provo `/panel` pa hyrë, hyr me GitHub, rifresko dhe dil. Paneli duhet të dallojë gjendjen pa hyrje dhe atë të sesionit.

### Prova 2: Shoferi ndryshon udhëtimin e vet

Prova me Neon nuk u krye pa kredencialet e pronarit. Pas hyrjes, ekzekuto udhëzimet e caktimit të profilit te README, ndrysho ID 2 në `08:25`, kontrollo listën/detajet dhe Neon, pastaj rikthe `08:15`.

### Prova 3: Veprimi pa leje refuzohet

Prova me dy përdorues realë nuk u krye. Pas caktimit të shoferit për ID 2, provo dërgimin e ID 1 përmes formularit/devtools. Veprimi duhet të refuzohet; UPDATE kërkon njëkohësisht identitetin e sesionit, rolin `shofer` dhe `shofer_id` përputhës.

## Ku gjendet puna

`src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/panel/`, `src/components/Hyrja.tsx`, `src/components/EditorOra.tsx`, `schema-java05.sql`, `schema.sql` dhe `.env.example`. Callback-u lokal: `/api/auth/callback/github`.

## Çfarë mbetet për përmirësim

Kërkesa për vend mbetet simulim. Duhet të plotësohen kredencialet OAuth/Neon, të caktohet një shofer prove dhe të bëhen provat me llogaritë e veta.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

AI ndihmoi me integrimin e Auth.js v4, validimin dhe kufizimin server-side të pronësisë. Ndërtimi dhe tipizimi verifikohen lokalisht; OAuth dhe SQL real duhet t'i provojë pronari i llogarisë.
