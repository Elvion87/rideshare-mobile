# RideShare — Java 10

## Qëllimi

Kërkesat e udhëtarit, përgjigjja e shoferit dhe vendet e lira lexohen nga Neon dhe përditësohen në ekran çdo pesë sekonda, pa rifreskim manual. Këto janë të dhëna fiktive të projektit mësimor; nuk dërgohet njoftim jashtë aplikacionit.

## Çfarë u ndërtua

- Tabela `kerkesat` ruan udhëtimin, udhëtarin, statusin dhe kohët; një kufizim unik lejon vetëm një kërkesë për përdorues/udhëtim.
- Udhëtari krijon kërkesë pasi kyçet me GitHub. Kërkesa ekzistuese kthehet përsëri pa krijuar kopje, edhe kur vendet janë shteruar ndërkohë.
- Shoferi sheh kërkesat vetëm për udhëtimet që i përkasin dhe mund t'i pranojë nga `/panel`.
- Pranimi kontrollon pronësinë, statusin dhe vendet në server. Një pyetje atomike e Neon-it e kalon kërkesën në “pranuar” dhe zbret një vend; ripërsëritja nuk zbret vendin sërish dhe numri nuk bëhet negativ.
- `/udhetimi/[id]/kerkesa` dhe paneli rilexojnë gjendjen personale çdo pesë sekonda. Ka vetëm një lexim paralel; timer-i pastrohet kur largohet faqja. Përgjigjet personale nuk ruhen në cache.
- Në mungesë rrjeti, vlerat e fundit mbeten në ekran, veprimet bllokohen dhe shfaqet paralajmërimi i rilidhjes. Pas rikthimit të rrjetit lexohet menjëherë gjendja nga serveri.

## Skedarët kryesorë

- Skema e migrimit: `schema-java10.sql`; skema për instalim të ri: `schema.sql`.
- Leximi dhe shkrimi i kërkesave: `src/lib/kerkesat.ts`.
- API-të për gjendjen, kërkesën dhe pranimin: `src/app/api/udhetimet/[id]/`.
- Përditësimi i ekranit: `src/components/SinkronizimiUdhetimit.tsx`.
- Faqet: `src/app/udhetimi/[id]/kerkesa/page.tsx` dhe `src/app/panel/page.tsx`.

## Konfigurimi i provës me dy llogari

Ekzekuto `schema-java10.sql` në të njëjtën bazë Neon që përdor aplikacioni. Ky migration nuk fshin dhe nuk mbishkruan kërkesa ekzistuese.

Hyr një herë në `/panel` me llogarinë e shoferit që të krijohet profili. Në Neon, cakto ID-në e asaj llogarie si shofer dhe pronar të udhëtimit fiktiv, duke vendosur dy vende:

```sql
UPDATE profilet SET roli = 'shofer' WHERE github_id = 'ID_E_SHOFERIT';
UPDATE udhetimet
SET shofer_id = 'ID_E_SHOFERIT', vende = 2
WHERE id = 'ID_E_UDHETIMIT';
```

Në dritare të veçantë kyçu me llogarinë e udhëtarit, hap të njëjtin udhëtim dhe dërgo kërkesën. Mos përdor dy skeda që ndajnë të njëjtin sesion kur po provon role të ndryshme.

## Provat

`npm run build` dhe migrimi i Neon-it u verifikuan teknikisht. Provat më poshtë kërkojnë dy sesione OAuth reale dhe një udhëtim prove me shofer të caktuar; ato nuk shënohen si të kryera pa u provuar në shfletues:

1. **Kërkesa në pritje:** me dy vende fillestare, dërgo kërkesën si udhëtar. Pa rifreskim manual, shoferi duhet ta shohë në panel; udhëtari duhet ta shohë si “Në pritje” dhe vendet duhet të mbeten dy.
2. **Pranimi i vetëm:** pranoje si shofer. Të dy ekranet duhet të shfaqin “U pranua” dhe një vend. Ripërsërite pranimin me të njëjtën kërkesë; vendet duhet të mbeten një. Kur vendet janë zero, pranimi tjetër duhet të refuzohet.
3. **Offline dhe rilidhja:** dërgo një kërkesë të re në një udhëtim prove, vendose vetëm dritaren e udhëtarit offline dhe pranoje nga dritarja e shoferit. Udhëtari duhet të mbajë vlerat e fundit me paralajmërim; pas rilidhjes duhet të shfaqë statusin e pranuar dhe një vend pa rifreskim manual.

Asistenti ndihmoi me migrimin, leximin periodik dhe përditësimin atomik të kërkesës/vendeve. Kërkesat e udhëtarëve nuk ekzekutohen ose imitohen gjatë renderimit të serverit.
