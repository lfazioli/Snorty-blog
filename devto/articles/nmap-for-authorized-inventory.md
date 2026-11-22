---
title: "Nmap per un inventario autorizzato: minimo impatto, dati utili"
published: false
description: "Come usare Nmap in modo misurato per censire servizi e validare una superficie esposta, sempre su sistemi propri o autorizzati."
tags: cybersecurity, nmap, networking, security
cover_image: ""
canonical_url: ""
---

# Nmap per un inventario autorizzato

Nmap può aiutare a capire quali porte e servizi sono raggiungibili all'interno di un perimetro autorizzato. Non va però considerato un semplice pulsante per scansionare Internet o reti altrui: la scansione deve essere autorizzata, documentata e proporzionata.

## Imposta il perimetro

Prima di eseguire qualsiasi comando:

1. Ottieni autorizzazione scritta.
2. Definisci IP, intervalli temporali e tecniche consentite.
3. Concorda tassi di scansione e finestre di manutenzione.
4. Stabilisci chi viene avvisato in caso di instabilità.

Nell'esempio seguente, `scanme.nmap.org` è descritto solo come esempio pubblico: non eseguire scansioni su bersagli senza permesso.

## Un'inventario conservativo

Per limitare il numero di richieste:

```bash
nmap -sT -sV --top-ports 100 --max-rate 20 192.0.2.0/24
```

Questa modalità usa TCP connect, rilevazione delle versioni e le porte principali. Il parametro `--max-rate` limita l'impatto, ma va comunque adattato alla rete reale.

Per verificare host già identificati:

```bash
nmap -Pn -p 22,80,443 --reason 192.0.2.10
```

## Cosa registrare

- Host raggiungibile o non raggiungibile
- Porte con risposte
- Stato TCP e motivazione
- Banner o nome del servizio solo se necessario
- Sistema di gestione dei risultati
- Timestamp e parametri della scansione

Non presumere che un banner identifichi la versione reale del software: trattalo come un indicatore da verificare con la documentazione e i controlli interni.

## Correlazione difensiva

Confronta l'inventario con:

- CMDB e registri asset
- Regole firewall
- Registri di deployment
- Segnalazioni vulnerabilità
- Baseline e policy aziendali

Le porte aperte non sono automaticamente vulnerabilità, ma servizi non autorizzati o senza proprietario possono rappresentare rischio operativo.

## Evitare l'invasivo

Sconsigliate senza un'esplicita autorizzazione:

- Script NSE aggressivi
- Enumerazione ad alto volume
- Scan su interi range pubblici
- Evasion techniques
- Vulnerability exploitation

Una buona scansione produce un inventario verificabile, non rumore o disservizi.

## Checklist

- [ ] Permesso scritto
- [ ] Target autorizzati
- [ ] Volume limitato
- [ ] Contatti di escalation
- [ ] Risultati protetti
- [ ] Asset inattesi verificati manualmente

Nmap è efficace quando viene integrato in un processo autorizzato e misurato, non usato come ricognizione indiscriminata.
