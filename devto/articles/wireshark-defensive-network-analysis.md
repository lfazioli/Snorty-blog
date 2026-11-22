---
title: "Wireshark per l'analisi difensiva: leggere il traffico senza indovinare"
published: false
description: "Una guida pratica e responsabile per usare Wireshark nel troubleshooting e nella rilevazione di problemi di rete su sistemi propri o autorizzati."
tags: cybersecurity, networking, wireshark, devops
cover_image: ""
canonical_url: ""
---

# Wireshark per l'analisi difensiva

Wireshark trasforma il traffico di rete in dati osservabili. È utile per diagnosticare timeout, configurazioni DNS errate, certificati non validi e comunicazioni anomale, ma va usato solo su reti proprie o per le quali si ha autorizzazione esplicita.

## Prima di iniziare

- Definisci obiettivo, perimetro e finestra temporale.
- Usa una cattura limitata e scarta i dati sensibili.
- Verifica la policy aziendale e le normative applicabili.
- Evita password, sessioni e dati personali nei pacchetti esportati.

## Cosa osservare

Iniziare con una cattura breve, poi isolare il problema con filtri di visualizzazione:

```text
# Solo traffico verso o da un host
ip.addr == 192.0.2.10

# DNS
udp.port == 53 || tcp.port == 53

# Traffico HTTP non cifrato
http

# Handshake e problemi TCP
tcp.flags.syn == 1 || tcp.analysis.retransmission
```

In ambiente di laboratorio usa indirizzi di esempio come `192.0.2.10`. Quando possibile, concentrati su handshake TLS, restituzioni DNS, risposte HTTP, retransmission e reset.

## Un flusso di lavoro difensivo

1. Riproduci il problema una sola volta.
2. Filtra il traffico pertinente.
3. Segui il flusso TCP o il stream HTTP.
4. Cerca risposte anomale, ritardi o protocolli inattesi.
5. Correla la cattura con log dell'applicazione e dell'infrastruttura.
6. Conserva solo il minimo necessario, con regole di retention.

## Errori comuni

- Catturare tutto senza limitazioni.
- Interpretare un pacchetto isolato come prova conclusiva.
- Condividere `.pcap` contenenti credenziali o dati cliente.
- Confondere strumenti di osservazione con strumenti di intrusione.

## Checklist finale

- [ ] Autorizzazione documentata
- [ ] Ambito e durata definita
- [ ] Dati sensibili esclusi o anonimizzati
- [ ] Correlazione con log
- [ ] Evidenze salvate in modo controllato
- [ ] Incidenti segnalati tramite i canali appropriati

Usare Wireshark significa capire cosa comunica un sistema. La parte più importante resta l'autorizzazione e la protezione dei dati catturati.
