---
title: "Security Headers Checker: una prima verifica rapida degli header HTTP"
published: false
description: "Come usare uno scanner di header HTTP per migliorare la postura del tuo sito senza confondere baseline, rischio reale e configurazione completa."
tags: cybersecurity, webdev, security, opensource
cover_image: ""
canonical_url: ""
---

# Security Headers Checker

[Security Headers Checker](https://github.com/lfazioli/security-headers-checker) è un piccolo tool Python che verifica alcuni degli header di sicurezza HTTP più rilevanti. È adatto a una prima review di siti propri o autorizzati e può essere integrato in una procedura manuale o CI.

## Cosa controlla

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Cross-Origin-Embedder-Policy`

Lo scanner evidenzia header assenti e configurazioni deboli, offrendo una baseline iniziale. Non sostituisce un test applicativo completo né un assessment professionale.

## Installazione

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Su Windows, attiva l'ambiente con:

```powershell
.venv\Scripts\Activate.ps1
```

## Uso

Verificare un singolo sito:

```bash
python3 security_headers_checker.py https://www.example.com
```

O ottenere JSON leggibile da script:

```bash
python3 security_headers_checker.py https://www.example.com --json
```

Sostituisci `example.com` con un dominio che possiedi o per il quale hai autorizzazione.

## Interpretare i risultati

Un header assente può essere un problema reale, ma non tutte le politiche sono valide per ogni applicazione. Per esempio:

- HSTS dovrebbe essere applicato solo dopo aver verificato supporto HTTPS e sottodomini.
- CSP richiede una configurazione coerente con script, worker, iframe e font usati.
- CORP e COEP possono cambiare il comportamento di risorse cross-origin.
- COOP può influire su popup e flussi OAuth.

Il risultato deve quindi essere letto insieme ad autenticazione, routing, cookie, caching e Content Security Policy dell'applicazione.

## Raccomandazione operativa

1. Definisci una baseline per ambiente.
2. Verifica in staging.
3. Rendi il controllo ripetibile.
4. Avvia con avvisi non bloccanti.
5. Mantieni eccezioni motivate.
6. Evolvi verso test automatici più completi.

## Limiti

Questo tool osserva le risposte HTTP. Non trova vulnerabilità lato server, bug applicativi, segreti esposti o autenticazioni non configurate. Non è una prova di conformità completa.

Un header corretto è un passo utile, non una garanzia di sicurezza. L'integrazione migliore combina verifiche HTTP, code review, test applicativi e gestione delle dipendenze.
