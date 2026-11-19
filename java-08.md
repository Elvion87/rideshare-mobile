# RideShare — Java 8

## Çfarë ndërtova

Shtova zgjedhjen e vendtakimit manual dhe kërkesën e vendndodhjes vetëm pas klikimit. Teksti i shtypur dhe vendtakimi i konfirmuar janë gjendje të ndara. Refuzimi, gabimi i leximit dhe timeout-i nuk bllokojnë zgjedhjen manuale. Shfaqet vetëm saktësia; koordinatat nuk ruhen ose dërgohen.

## Provat që bëra

### Prova 1: Leja nuk kërkohet sapo hapet faqja

Hapat: hapa `/java-08-test` në prodhim dhe kontrollova para klikimit. Pritshmëria: gjendja `idle` dhe pa leje të kërkuar. Vëzhgimi: gjendja ishte `idle`; kodi thërret Geolocation vetëm nga butoni.

### Prova 2: Refuzimi i lejes nuk e bllokon përdoruesin

Hapat: simulova refuzimin me kodin 1, pastaj shkrova dhe konfirmova Biblioteka. Pritshmëria: pritja përfundon dhe zgjedhja manuale punon. Vëzhgimi: gjendja u bë `denied`, butoni u riaktivizua dhe Biblioteka u konfirmua.

### Prova 3: Dëshmitë në GitHub nuk tregojnë adresën time reale

Hapat: kontrollova implementimin dhe përdora vetëm pozicion të simuluar në shfletues. Pritshmëria: asnjë koordinatë nuk ruhet ose dërgohet. Vëzhgimi: komponenti lexon vetëm saktësinë dhe nuk bën kërkesë rrjeti për vendndodhjen.

## Ku gjendet puna

Faqja reale: `src/app/udhetimi/[id]/page.tsx`. Komponenti i përbashkët: `src/components/Vendtakimi.tsx`. Faqja e provës: `src/app/java-08-test/page.tsx`. Konfigurimi i testit: `mobile-week08.json` (`/java-08-test`).

## Çfarë mbetet për përmirësim

Emri i vendit nuk mund të nxirret vetëm nga koordinatat dhe vendtakimi nuk i dërgohet shoferit; ky është kufizim i qëllimshëm i demonstrimit.

## Ndihma nga AI

AI ndihmoi me ndarjen e tekstit të shkruar nga ai i konfirmuar dhe me trajtimin e kodeve të Geolocation. Në shfletuesin e prodhimit verifikova të tetë sjelljet; suksesi, refuzimi, timeout-i dhe mungesa e mbështetjes u simulua, jo me GPS real.

## Prova me një hyrje të re

- Hyrja që provova: hapësira bosh pas konfirmimit të Bibliotekës.
- Parashikimi im para klikimit: shfaqet gabim dhe Biblioteka mbetet zgjedhja e konfirmuar.
- Çfarë pashë realisht: u shfaq gabimi dhe Biblioteka mbeti e konfirmuar.
- Skedari dhe funksioni që e shpjegojnë: `src/components/Vendtakimi.tsx`, funksioni `konfirmo`.
- Çfarë kuptova ose korrigjova: teksti në fushë nuk duhet të zëvendësojë vendtakimin e konfirmuar pa një klikim të qartë.
