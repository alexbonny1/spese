# Handoff: Saldo — app mobile spese, entrate, risparmi e investimenti

## Overview
App mobile (italiano, valuta €) che mostra in home il **saldo spendibile** del periodo: entrate del mese − spese fisse − spese già fatte − risparmi accantonati − investimenti del mese. Permette di registrare entrate/uscite, gestire entrate e spese fisse ricorrenti, salvadanai con obiettivo, e un portafoglio di investimenti (azioni, ETF, crypto, BTP, fondi) con rendimenti, prezzo medio di carico, tasse e dividendi.

## About the Design Files
I file in `prototype/` sono **riferimenti di design in HTML**: prototipi che mostrano aspetto e comportamento, non codice di produzione. Il compito è **ricrearli nell'ambiente del codebase di destinazione** (React Native/Expo, SwiftUI, Flutter…) con i suoi pattern. Se non esiste un codebase, scegliere il framework più adatto (consigliato: React Native + Expo, TypeScript).

Il prototipo si apre con `prototype/Saldo App v2.dc.html` (serve un server statico locale, es. `npx serve prototype`). Tutta la logica (calcoli, stato, dati di esempio) è nel blocco `class Component` dentro quel file: è la fonte più precisa per formule e testi.

## Fidelity
**Alta fedeltà**: colori, tipografia, spaziature, testi e interazioni sono definitivi. Ricreare l'interfaccia fedelmente.

## Screenshots
In `screenshots/`, in ordine di flusso (frame telefono 362×762 pt, ridimensionato):

| # | File | Stato |
|---|---|---|
| 01–02 | home, home-scroll | Home con barra del mese, griglia 2×2, ultimi movimenti |
| 03–05 | entrata-* | Sheet "+ Entrata": vuota, importo digitato, toggle "Entrata fissa mensile" |
| 06–07 | uscita-* | Sheet "− Uscita", categoria Investimento selezionata |
| 08 | cerca-titolo-da-home | Ricerca titoli con banner "Scegli dove investire € 80,00" |
| 09–10 | titolo-vwce-* | Dettaglio titolo posseduto: grafico, statistiche, posizione, acquisti |
| 11 | acquisto-importo-prefill | Sheet acquisto in modalità "Importo totale" precompilato |
| 12–14 | movimenti-* | Movimenti: Tutti / Entrate (vuoto) / Uscite con riga aperta (Elimina) |
| 15–18 | fisse-spese*, *-spesa-fissa | Fisse › Spese fisse, modifica e nuova voce fissa |
| 19–26 | risparmi*, salvadanaio-* | Fisse › Risparmi, dettaglio salvadanaio, Versa, Preleva, storico, modifica, nuovo |
| 27–28 | investimenti* | Fisse › Investimenti: riepilogo portafoglio, titoli, PAC |
| 29–31 | cerca-* | Ricerca: tutti, filtro Crypto, testo "apple" |
| 32–33 | titolo-aapl-* | Titolo in USD (prezzo $ + conversione €) |
| 34–36 | acquisto-* | Acquisto "Quote e prezzo", compilato, con PAC attivo |
| 37 | titolo-nvda-non-posseduto | Dettaglio senza posizione |
| 38–40 | impostazioni* | Impostazioni, soglia avviso impostata a € 60 |
| 41 | home-con-avviso | Home con banner di avviso sotto soglia |

## Navigazione
Tab bar fissa in basso, 4 voci (icona Lucide 22px, stroke 1.5, label 10px): **Home**, **Movimenti**, **Fisse**, **Impostazioni**. Attiva: `accent-700`; inattiva: `neutral-600`.

Overlay sopra le schede:
- **Bottom sheet** (backdrop `neutral-900` al 45%, foglio `bg`, bordo superiore hairline, `shadow-lg`, padding 18/20/24): Aggiungi movimento, Modifica fissa, Salvadanaio, Acquisto.
- **Schermate a tutto schermo** (push con back): Dettaglio salvadanaio, Ricerca titoli, Dettaglio titolo.

## Screens / Views

### 1. Home
- Header: periodo in Barlow Condensed 600 16px, maiuscolo, tracking .12em (es. "OTTOBRE 2026"); a destra tag outline "18 giorni rimasti".
- Hero centrato: "Puoi ancora spendere" (14px, `neutral-800`); importo "€ 363,62" (Barlow Condensed 600, 64px, line-height 1, tracking −0.03em); "circa € 20,20 al giorno" (13px, si può nascondere); link "Patrimonio totale € X ›" (11px `neutral-700`, apre Fisse › Investimenti).
- Banner avviso (condizionale): riquadro blueprint con bordo `accent`, testo 13px `accent-900`.
- **Barra del mese**: riquadro blueprint alto 34px, padding 3, gap 3. Segmenti con larghezza in % sulle entrate: Fisse `accent-800`, Speso `accent-500`, Risparmi `neutral-500`, Investito `neutral-300`; il resto è Disponibile, a righe diagonali 135° `accent-200` (4px) con bordo `accent-400`. Transizione width .4s. Sotto, una legenda a capo con quadratini 9px e "Disponibile N%".
- Griglia 2×2 con hairline (bordi interni a 1px `divider`): Entrate, Fisse, Speso, Risparmi + investiti. Label in stile card-kicker `accent-700`, valore Barlow Condensed 600 22px. Al tocco: Entrate/Speso → Movimenti, Fisse → Spese fisse, Risparmi → Risparmi. Hover `accent-100`.
- "Ultimi movimenti" (h5) + "Tutti" (ghost): ultime 4 righe con nome 14px, sotto "Categoria · data" 11px, importo a destra (entrate `accent-700` con "+", uscite `text` con "−").
- Footer: due bottoni da 48px affiancati (gap 12): "+ Entrata" (secondario blueprint) e "− Uscita" (primario blueprint, pieno `accent`).

### 2. Sheet Aggiungi movimento (`AddSheet.dc.html`)
- Segmentato "− Uscita" / "+ Entrata" (attivo con fondo `accent`, testo `bg`); "Annulla" ghost.
- Importo: segno + "€" a 28px `accent-700`, cifra a 56px Barlow Condensed 600.
- Chip categoria (12px, bordo `divider`; selezionato: fondo `accent-100`, bordo `accent`, testo `accent-800`):
  - Uscita: Spesa, Ristoranti, Trasporti, Svago, Casa, Investimento, Altro
  - Entrata: Stipendio, Extra, Rimborso, Regalo
- Toggle "Spesa/Entrata fissa mensile" (38×20, quadrato) con sottotitolo. È nascosto quando la categoria è Investimento.
- Tastierino 3×4 con griglia hairline, tasti alti 46px, Barlow Condensed 22px: 1–9, ",", 0, ⌫. Al massimo 2 decimali e 7 cifre.
- CTA primaria 48px. Testo: "Inserisci un importo" (disabilitata), "Salva uscita/entrata", oppure "Continua: scegli il titolo" con categoria Investimento (apre la Ricerca con l'importo precompilato).
- Salvataggio:
  - fissa → aggiunge alle entrate/spese fisse con giorno = oggi;
  - altrimenti → movimento datato oggi.

### 3. Movimenti
- h3 "Movimenti"; segmentato 3 voci (Tutti/Entrate/Uscite); riga totali "Entrate + X" / "Uscite − Y" sul filtro attivo.
- Gruppi per giorno (intestazione 11px maiuscolo, tracking .08em: "Oggi", "Ieri", "12 ottobre"; totale del giorno a destra).
- Il tocco su una riga la espande con "Chiudi" ed "Elimina". Per un movimento Investimento compare una nota: eliminarlo rimuove anche l'acquisto dal portafoglio.
- Stato vuoto: "Nessun movimento." CTA in basso: "+ Aggiungi movimento".

### 4. Fisse (3 sotto-schede, segmentato: Spese fisse / Risparmi / Investimenti)

**4a. Spese fisse**
- Testo di spiegazione (12px). Sezione "Entrate fisse" con il totale `accent-700`, poi "Spese fisse" con il totale.
- Riga: box giorno 38px (numero Barlow Condensed 17px + "GIORNO" 9px), nome, stato ("Già addebitata" / "Domani" / "Tra N giorni"), importo, chevron.
- I PAC compaiono qui come "PAC VWCE" con stato "Investimento ricorrente" (il tocco porta agli Investimenti).
- Ghost "+ Aggiungi entrata fissa" / "+ Aggiungi spesa fissa" → sheet con Nome, Importo (€), Giorno del mese (1–31), "Salva", "Elimina" (solo in modifica). Salva è disabilitato se manca il nome, l'importo è ≤ 0 o il giorno è fuori 1–31.

**4b. Risparmi (salvadanai)**
- Griglia 2 celle: "Nei salvadanai" (totale), "Tolti questo mese" (quote + versamenti − prelievi del mese).
- Card blueprint per salvadanaio:
  - nome (Barlow Condensed 18px) con la % a destra;
  - "€ salvato" a 26px + "di € obiettivo";
  - barra alta 6px (`accent-200` / `accent-700`);
  - "€ quota/mese · entro mmm aaaa";
  - un suggerimento colorato a seconda del caso:
    - "Con questa quota arrivi in tempo (servono € X/mese)" (`accent-700`)
    - "Servono € X/mese: la quota è sotto di € Y" (`accent-800`)
    - "Obiettivo raggiunto"
    - "Data obiettivo passata: aggiornala"
- "+ Nuovo salvadanaio" → sheet con Nome, Obiettivo (€), Entro (MM/AAAA), Quota mensile (€).
- **Dettaglio salvadanaio** (tutto schermo):
  - back "‹ Risparmi" e "Modifica";
  - h3 con il nome, importo a 48px, barra blueprint alta 14px, "N% raggiunto · mancano € X";
  - griglia "Quota attuale" / "Servono per mmm aaaa";
  - bottoni "+ Versa" / "− Preleva" (si attivano a toggle, fondo `accent-100`): mostrano un campo importo con "Conferma" e una nota sull'effetto sullo spendibile. Il prelievo non può superare il saldo;
  - "Storico": quota del mese, versamenti e prelievi.

**4c. Investimenti**
- Card riepilogo blueprint:
  - "Valore attuale" (36px) con G/P % accanto;
  - righe: Investito (con commissioni), Guadagno/perdita, Tasse se vendi oggi, Dividendi annui stimati (netti);
  - totale tratteggiato "Netto se vendi oggi".
- "Titoli": box ticker 52px, nome (troncato), "N quote · PMC $/€ X", valore € e G/P % (positivo `accent-700`, negativo `text` con "−"). Ordinati per valore.
- "Piani di accumulo (PAC)": riga con "Ogni mese il giorno N · conta nelle spese fisse" e il bottone "Ferma".
- CTA "Cerca e compra" (icona search).

### 5. Ricerca titoli (tutto schermo)
- Back + input "Cerca titolo, ticker o ISIN" (filtra su ticker e nome, senza distinguere maiuscole).
- Banner opzionale "Scegli dove investire € X" (`accent-100` / `accent-900`) se arrivi dalla Home.
- Chip tipo: Tutti, Azioni, ETF, Crypto, Obbligazioni, Fondi.
- Riga risultato: ticker, nome, "Tipo · Borsa · in portafoglio", prezzo nella valuta originale, rendimento a 1 anno.
- Piè di pagina: "Prezzi e rendimenti di esempio, non aggiornati."

### 6. Dettaglio titolo (tutto schermo)
- Meta "TICKER · Tipo · Borsa" (11px maiuscolo), h3 con il nome, prezzo a 40px nella valuta originale, "+X% in 1 anno". Per i titoli in USD: "≈ € X al cambio 1,08".
- Grafico a 1 anno: riquadro blueprint, SVG 320×120, area `accent-100`, linea `accent-700` 1.5px, 3 linee guida hairline. Sotto: "ott 2025 · min/max · oggi".
- Griglia 2×2: Rendimento 1 anno, Da inizio anno, Dividendo annuo / Cedola annua, Tasse sul guadagno (26% oppure 12,5%).
- Se posseduto, card "La tua posizione":
  - valore e G/P %;
  - Quote;
  - Prezzo medio di carico (per i titoli USD anche in €);
  - Investito (commissioni € X);
  - Guadagno/perdita;
  - Tasse se vendi;
  - Dividendi/Cedole annui stimati lordi → netti;
  - Netto se vendi oggi.

  Sotto, la lista "Acquisti": "N quote a P", data, commissioni, totale.
- Nota se c'è un PAC attivo. CTA fissa "Compra TICKER".

### 7. Sheet Acquisto
- Segmentato "Quote e prezzo" / "Importo totale".
  - Quote e prezzo: campi Quote e Prezzo (precompilato con il prezzo attuale, nella valuta del titolo).
  - Importo totale: "Importo da investire (€, commissioni incluse)". Le quote si calcolano come (importo − commissioni) / prezzo in €.
- Campo Commissioni (€).
- Toggle "Ripeti ogni mese (PAC)" → campo "Giorno del mese" (1–28).
- Riepilogo tratteggiato "N quote · € totale" e una nota: "Tolto dallo spendibile di questo mese." oppure "Poi € X ogni mese il giorno N, conteggiati nelle spese fisse."
- "Conferma acquisto":
  - crea un lotto nel portafoglio;
  - senza PAC aggiunge anche il movimento "TICKER · N quote" con categoria Investimento;
  - con PAC crea o sostituisce il PAC di quel titolo, senza movimento, perché l'importo è già nelle spese fisse;
  - poi porta a Fisse › Investimenti con il dettaglio del titolo aperto.

### 8. Impostazioni
- **Calcolo dello spendibile**:
  - Giorno dello stipendio, stepper 1–28: cambia il periodo ("14 ott – 13 nov") e i giorni rimasti;
  - toggle "Conta le entrate extra";
  - riga "Quote di risparmio € X/mese ›" che porta a Risparmi.
- **Home**: toggle "Mostra quanto puoi spendere al giorno"; stepper "Avviso sotto i … al giorno" (0 = "No", passi da € 5, fino a 200).
- **Investimenti**: tasse (informativa: 12,5% sui titoli di Stato, 26% sul resto); cambio USD/EUR 1,08.
- **Dati**: Valuta Euro; "Ripristina dati di esempio".

## Formule (fonte: `renderVals()` nel prototipo)
```
entrate      = Σ entrate fisse + (contaExtra ? Σ movimenti positivi : 0)
fisse        = Σ spese fisse + Σ PAC
speso        = −Σ movimenti negativi con categoria ≠ Investimento
investito    = −Σ movimenti con categoria Investimento (mese corrente)
risparmiMese = Σ quote salvadanai + Σ versamenti del mese − Σ prelievi del mese
spendibile   = entrate − fisse − speso − investito − risparmiMese
alGiorno     = max(0, spendibile) / giorniRimasti
giorniRimasti= payday ≤ oggi ? 31 − oggi + payday : payday − oggi   (da sostituire con una vera logica di calendario)
patrimonio   = spendibile + Σ saldo salvadanai + Σ valore investimenti

salvadanaio.saldo   = base (incl. quota del mese) + Σ movimenti manuali del mese
mesiAlTarget        = (annoTarget − annoCorrente)·12 + (meseTarget − meseCorrente)
servonoAlMese       = max(0, obiettivo − saldo) / mesiAlTarget

per titolo (lotti aggregati):
  costo €   = Σ(quote·prezzo)/cambio + Σ commissioni      (cambio solo per USD)
  PMC       = Σ(quote·prezzo) / Σ quote                   (valuta originale)
  valore €  = quote·prezzoAttuale/cambio
  G/P       = valore − costo;  G/P% = G/P / costo
  aliquota  = Obbligazioni ? 12,5% : 26%
  tasse     = max(0, G/P)·aliquota;  netto = valore − tasse
  dividendi = valore·rendimentoDividendo%;  netti = dividendi·(1 − aliquota)
```
Note: nel prototipo il cambio è fisso, quindi non c'è effetto cambio tra acquisto e oggi. In produzione va salvato il cambio al momento dell'acquisto.

## State Management
Persistito (il prototipo usa la chiave localStorage `saldo-app-v2`; in produzione usare un DB locale o un backend):
- `incomes[]` {id, name, amt, day}
- `fixed[]` {id, name, amt, day}
- `tx[]` {id, name, cat, amt (±), day, lotId?}
- `piggies[]` {id, name, goal, tm, ty, quota, base, hist[] {id, date, label, amt ±, cur?}}
- `lots[]` {id, sym, qty, price (valuta originale), fee €, date}
- `pacs[]` {id, sym, amt €, day}
- `payday`, `alert`, `perDay`, `extra`

UI (non persistito): tab attiva, sotto-scheda di Fisse, filtro movimenti, riga aperta, overlay aperti (sheet, editor fissa, salvadanaio + modalità versa/preleva, editor salvadanaio, ricerca + query + tipo + importo precompilato, titolo aperto, bozza di acquisto).

Da implementare per la produzione (nel prototipo non ci sono):
- prezzi in tempo reale e ricerca titoli da un'API di mercato;
- cambio reale;
- più mesi e storico, con chiusura del mese e nuova quota automatica;
- vendita dei titoli;
- categorie personalizzabili.

## Interactions & Behavior
- Hover/pressed: tinta `accent-100` sulle righe e sulle celle; tasti del tastierino premuti in `accent-100`. Focus: `outline 2px solid accent; offset 2px`. Elementi disabilitati al 45% di opacità.
- Transizioni: width .4s sulle barre, left .2s sul knob dei toggle. Gli sheet in produzione: slide-up da 250–300ms ease-out.
- Validazione: importi > 0, giorno 1–31 per le voci fisse e 1–28 per il PAC, data salvadanaio nel formato MM/AAAA con mese 1–12, prelievo ≤ saldo.
- Formattazione: italiana, "1.234,56" (punto per le migliaia, virgola per i decimali), "€ " davanti, "−" tipografico (U+2212) per i negativi, percentuali "+14,8%".

## Design Tokens (design system "Industry")
- Colori:
  - bg `#f2f2f3`, surface `#e9e9ea`, text `#1d1f20`, accent `#5980a6`, divider = text al 16%;
  - accent 100–900: `#eef6ff #d6ebff #b5d9fd #94bce3 #749dc4 #597ea3 #416180 #2c455d #1d2d3d`;
  - neutral 100–900: `#f5f5f8 #e7e7ea #d4d4d7 #b7b7ba #98989b #7a7a7d #5d5d60 #424244 #2b2b2d`.
- Font:
  - Titoli: **Barlow Condensed** 600, tracking −0.015em. Scala: h3 25px, h4 20px, h5 16px; h6 13px maiuscolo con tracking .08em.
  - Corpo: **Barlow** 400/500, 15px, line-height 1.55.
  - Testo secondario: 11–13px.
- Spaziature: 3.4 / 6.8 / 10.2 / 13.6 / 20.4 / 27.2. Padding orizzontale delle schermate 20px.
- Raggi: **0**, tutto squadrato.
- Ombre: sm `0 1px 2px` / md `0 3px 10px` / lg `0 12px 32px`, in neutral-900 al 14/16/22%.
- **Blueprint**: bordo hairline 1px `divider`, angoli squadrati, crocette "+" di 11px sui 4 angoli (offset −6px, colore text al 55%). La usano card, bottone primario, barre e riquadri. Il bottone primario è l'unico oggetto pieno (`accent`).
- Icone: Lucide, stroke 1.5.

## Assets
Nessuna immagine. Icone Lucide: home, list, repeat, sliders-vertical, chevron-left/right, search, plus. Font da Google Fonts (Barlow, Barlow Condensed).

## Files
- `prototype/Saldo App v2.dc.html`: il prototipo completo (template + logica + dati di esempio e catalogo titoli).
- `prototype/AddSheet.dc.html`: lo sheet Aggiungi movimento.
- `prototype/_ds/…/styles.css`: token e classi del design system (`.blueprint`, `.btn`, `.card`, `.tag`, `.field`, `.input`).
- `prototype/support.js`, `_ds_bundle.js`: runtime del prototipo (non serve in produzione).
- `screenshots/`: 41 stati, vedi la tabella sopra.
