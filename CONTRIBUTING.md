# Linee Guida per Contribuire

Quando contribuisci a `kubb-gen-scribe-cli`:

- Prima di aprire una nuova pull request, prova a cercare nell'[issue tracker](https://https://github.com/Samuele-Barbiera/kubb-gen-scribe-cli/issues) eventuali problemi noti o correzioni.
- Se desideri apportare modifiche al codice basate sulle tue opinioni personali, assicurati di aprire prima un problema descrivendo le modifiche che desideri apportare e apri una pull request solo quando le tue proposte vengono approvate dagli amministratori.

## Come Contribuire

### Prerequisiti

Per evitare di sprecare il tuo tempo implementando un cambiamento che è già stato rifiutato o che non è generalmente necessario, inizia aprendo una [nuova issue](https://https://github.com/Samuele-Barbiera/kubb-gen-scribe-cli/issues/new/choose) descrivendo il problema che vorresti risolvere.

### Configura l'ambiente localmente

_Alcuni comandi presuppongono che tu abbia installato GitHub CLI, se non l'hai fatto, considera l'opzione di [installarlo](https://github.com/cli/cli#installation), ma puoi sempre utilizzare l'interfaccia utente Web se preferisci._

Per contribuire a questo progetto, dovrai fare il fork della repo:

```bash
gh repo fork Samuele-Barbiera/kubb-gen-scribe-cli
```

poi, clonare il progetto:

```bash
gh repo clone <tuo-nome-github>/kubb-gen-scribe-cli
```

Questo progetto utilizza [pnpm](https://pnpm.io) come gestore di pacchetti. Installalo se non l'hai già fatto:

```bash
npm install -g pnpm
```

Quindi, installa le dipendenze del progetto:

```bash
pnpm install
```

### Implementa le tue modifiche

Il codice per l'app web si trova nella directory `src`. Ora sei pronto e puoi iniziare a implementare le tue modifiche.

Ecco alcuni script utili quando stai sviluppando:

| Comando            | Descrizione                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `pnpm dev`         | Costruisce e avvia la CLI in modalità di monitoraggio               |
| `pnpm build`       | Costruisce l'app web                                                |
| `pnpm check`       | Controlla il tuo codice per errori di tipo, formattazione e linting |
| `pnpm start`       | Avvia la build del pannello web, ideale per la produzione           |
| `pnpm update-deps` | Tieni aggiornate le devDep e le dipendenze del progetto             |
| `pnpm commit`      | Per effettuare un commit convenzionale come descritto di seguito    |

Quando effettui commit, assicurati di seguire le linee guida del [commit convenzionale](https://www.conventionalcommits.org/en/v1.0.0/), cioè anteporre il messaggio con `feat:`, `fix:`, `chore:`, `docs:`, ecc... Puoi usare `pnpm commit` per fare un commit convenzionale di una nuova funzionalità:

```bash
pnpm commit
```

### Quando hai finito

Verifica che il tuo codice segua le linee guida stilistiche del progetto eseguendo:

```bash
pnpm check
```

Quando tutto è fatto, è ora di inviare una pull request al repository principale o utilizzare l'interfaccia utente di VSCode per farlo:

```bash
gh pr create --web
```

e compila il titolo e il corpo in modo appropriato. Di nuovo, assicurati di seguire le linee guida del [commit convenzionale](https://www.conventionalcommits.org/en/v1.0.0/) per il tuo titolo.
