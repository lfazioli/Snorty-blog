# 📝 Snorty Blog

Un blog moderno e elegante costruito con TypeScript, progettato per condividere articoli e contenuti in modo professionale.

🌐 **Live**: [snorty.vercel.app](https://snorty.vercel.app/)

---

## ✨ Caratteristiche

- 🎨 **Design Moderno**: Interfaccia intuitiva e responsive
- ⚡ **Performance Ottimizzate**: Velocità di caricamento superiore
- 📱 **Mobile First**: Perfettamente ottimizzato per dispositivi mobile
- 🔍 **SEO Friendly**: Optimizzato per i motori di ricerca
- 💻 **TypeScript**: Codice type-safe e mantenibile
- 🎯 **Facile da Usare**: Interfaccia semplice per la creazione e gestione di articoli
- 🌙 **Dark Mode**: Supporto per tema scuro (se implementato)

---

## 🚀 Stack Tecnologico

- **Linguaggio**: TypeScript
- **Runtime**: Node.js
- **Hosting**: Vercel
- **Package Manager**: npm
- **Gestione Dipendenze**: Babel per transpilazione

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** (v16 o superiore)
- **npm** (v7 o superiore)

---

## 🔧 Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/lfazioli/Snorty-blog.git
   cd Snorty-blog
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente** (se necessario)
   ```bash
   cp .env.example .env.local
   ```

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri il browser**
   Accedi a `http://localhost:3000` (o alla porta indicata dal tuo server)

---

## 📁 Struttura del Progetto

```
Snorty-blog/
├── src/                    # Codice sorgente
│   ├── components/        # Componenti React/Vue
│   ├── pages/            # Pagine del blog
│   ├── styles/           # Stili CSS/SCSS
│   └── utils/            # Funzioni di utilità
├── public/               # File statici
├── node_modules/         # Dipendenze
├── package.json          # Configurazione npm
├── tsconfig.json         # Configurazione TypeScript
├── .env.example          # Variabili d'ambiente di esempio
└── README.md             # Questo file
```

---

## 📚 Comandi Disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Crea una build di produzione |
| `npm start` | Avvia il server di produzione |
| `npm run lint` | Esegui linting del codice |
| `npm run test` | Esegui i test |
| `npm run format` | Formatta il codice |

> **Nota**: I comandi disponibili possono variare in base alla configurazione del tuo `package.json`

---

## 🎬 Come Usare

### Creare un nuovo articolo

1. Accedi al dashboard del blog
2. Fai clic su "Nuovo Articolo"
3. Compila il titolo, il contenuto e altri dettagli
4. Pubblica l'articolo

### Modificare un articolo

1. Accedi al dashboard
2. Seleziona l'articolo da modificare
3. Apporta le modifiche desiderate
4. Salva le modifiche

### Eliminare un articolo

1. Vai al dashboard
2. Seleziona l'articolo da eliminare
3. Conferma l'eliminazione

---

## 🔐 Variabili d'Ambiente

Copia il file `.env.example` in `.env.local` e configura le seguenti variabili (se necessario):

```env
# Database
DATABASE_URL=your_database_url

# API Keys
API_KEY=your_api_key

# Other configurations
APP_ENV=development
```

---

## 🧪 Test

Esegui la suite di test:

```bash
npm run test
```

Per il coverage:

```bash
npm run test:coverage
```

---

## 🚀 Deployment

### Deploy su Vercel (Consigliato)

Il progetto è già configurato per Vercel. Semplicemente:

1. Connetti il tuo repository GitHub a Vercel
2. Seleziona il branch da deployare
3. Vercel costruirà e deployerà automaticamente il tuo progetto

```bash
# Deploy manuale
npm run build
vercel --prod
```

### Deploy su altri host

Consulta la documentazione del tuo provider di hosting per istruzioni specifiche.

---

## 📖 Documentazione

Per una documentazione più dettagliata:

- 📘 [TypeScript Docs](https://www.typescriptlang.org/)
- 📗 [Node.js Docs](https://nodejs.org/docs/)
- 📙 [Vercel Docs](https://vercel.com/docs)

---

## 🤝 Contribuire

Le contribuzioni sono benvenute! Per contribuire:

1. **Fork il repository**
   ```bash
   git clone https://github.com/lfazioli/Snorty-blog.git
   ```

2. **Crea un branch per la tua feature**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit le tue modifiche**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push al branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Apri una Pull Request**

---

## 📝 Linee Guida di Coding

- Usa TypeScript per la type safety
- Segui le convenzioni di naming camelCase
- Commenta il codice complesso
- Esegui i test prima di fare commit
- Utilizza Prettier per la formattazione del codice

---

## 🐛 Bug Report

Se trovi un bug, per favore:

1. Controlla che il bug non sia già stato segnalato
2. Apri un nuovo issue su GitHub
3. Includi:
   - Una descrizione chiara del problema
   - Passi per riprodurre il bug
   - Il comportamento atteso e quello effettivo
   - Screenshot (se applicabile)
   - Informazioni sul tuo ambiente (OS, browser, versione Node.js)

---

## 💡 Suggerimenti e Richieste di Feature

Hai un'idea per migliorare il blog? Apri un issue con il label `enhancement` e descrivi la tua idea!

---

## 📄 Licenza

Questo progetto è fornito senza una licenza specifica. Per ulteriori dettagli, consulta il file LICENSE (se presente).

---

## 👤 Autore

**Leonardo Fazioli**

- GitHub: [@lfazioli](https://github.com/lfazioli)
- Website: [snorty.vercel.app](https://snorty.vercel.app/)

---

## 🙏 Ringraziamenti

Grazie a tutti coloro che hanno contribuito a questo progetto e a chi lo supporta!

---

## 📞 Supporto

Se hai domande o hai bisogno di aiuto:

1. Controlla la sezione FAQ
2. Apri un issue su GitHub
3. Contatta l'autore via GitHub

---

**Ultimo aggiornamento**: Settembre 2026

---

<div align="center">

⭐ Se ti piace questo progetto, lascia una stella! ⭐

</div>
