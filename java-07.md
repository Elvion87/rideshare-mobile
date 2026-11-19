# RideShare · Java 7

## Rasti im

GitHub: https://github.com/Elvion87/rideshare-mobile
Kodi P7 personal: nuk u gjenerua për këtë mjedis; plotësoje nga gjeneratori i kursit.
Skenari i zgjedhur: Rasti 2 · Udhëtimi pa vende
ID i udhëtimit në projekt: `3`
Të dhënat fiktive: Lipjan → AAB, ora 07:45, 0 vende.

## Parashikimi

Kur hapet ID 3, detajet tregojnë se nuk ka vende dhe nuk ofrojnë kërkesë aktive. Lista dhe detajet duhet të mbeten të përdorshme; ID 99 duhet të shfaqë faqen e mungesës.

## Dy probleme

1. Lista kishte etiketë fikse “E mërkurë · 7 tetor”, e cila mund të bëhej e pasaktë dhe sugjeronte datë reale. E hoqa dhe e zëvendësova me “Udhëtime publike”.
2. Kopja offline mund të jetë e vjetruar kur databaza ndryshon pa rrjet. Lexuesi i Javës 6 e shënon qartë burimin dhe kohën e kopjes; nuk e paraqet si konfirmim të vendeve.

## Korrigjimi

Skedari: `src/app/page.tsx`. Faqja e listës lexon udhëtimet nga Neon dhe shfaq numrin e tyre. Heqja e datës së ngurtësuar shmang informacionin e pasaktë pa ndryshuar rrjedhën e kërkimit.

## Versionet

Para: https://github.com/Elvion87/rideshare-mobile/commit/1bae4345a392182bc64605441609074a2c963bd6
Pas: URL-ja do të shtohet pasi ndryshimet të bëhen commit dhe push; nuk është krijuar commit nga ky ndryshim.

## Provat që bëra

### Prova 1

Hapat: ndërtimi i prodhimit me `npm run build`.
Pritshmëria: faqet dhe komponentët të kompilohen.
Vëzhgimi: build-i i prodhimit përfundoi me sukses dhe TypeScript nuk raportoi gabime.

### Prova 2

Hapat: hap ID 3 dhe ID 99 në shfletues.
Pritshmëria: udhëtimi plot nuk ofron rezervim; ID 99 shfaq faqen not-found.
Vëzhgimi: prova interaktive nuk u krye në këtë mjedis.

### Prova 3

Hapat: hap `/` me Neon të konfiguruar.
Pritshmëria: shfaqet lista pa datë fikse.
Vëzhgimi: faqja publike nuk u provua me të dhëna reale Neon; ndryshimi i etiketës u verifikua në kod.

## Ndryshimi i ri

Hyrja e re: vizitor pa internet me një kopje të ruajtur më herët. Parashikimi: udhëtimet shfaqen me etiketën e kopjes dhe kohën e ruajtjes, por jo si të dhëna të konfirmuara.

## Ndihma nga AI

AI ndihmoi të identifikohej data fikse dhe u përgatit një korrigjim i vogël. Prova me Neon dhe koleg duhet të plotësohet nga studenti; service worker-i dhe lexuesi offline u provuan në shfletues.
