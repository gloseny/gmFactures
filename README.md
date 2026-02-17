# 🧾 GestionFactures

Application desktop complète de gestion et d'édition de factures développée avec Electron, React et SQLite.

## 🚀 Fonctionnalités

### 📊 Tableau de bord
- KPIs en temps réel (CA, factures en attente, clients actifs)
- Graphiques interactifs avec Recharts
- Vue d'ensemble de l'activité

### 🧾 Gestion des factures
- **Création** de factures avec calculs automatiques
- **Édition** et mise à jour des statuts
- **Visualisation** détaillée avec export PDF
- **Suppression** sécurisée
- Numérotation automatique (FAC-YYYY-XXXX)

### 👥 Gestion des clients
- **CRUD** complet des clients
- **Recherche** avancée
- **Historique** des factures par client
- **Statistiques** par client

### 📈 Rapports et export
- **Rapports** par période personnalisée
- **Export PDF** des factures et rapports
- **Export CSV** pour intégration comptable
- **Graphiques** d'évolution du CA

### ⚙️ Paramètres entreprise
- Configuration des informations de l'entreprise
- Personnalisation des mentions légales
- Gestion des coordonnées bancaires

## 🛠️ Technologies

- **Frontend**: React 18 + Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Graphiques**: Recharts
- **Desktop**: Electron
- **Base de données**: SQLite (better-sqlite3)
- **Export PDF**: jsPDF + jsPDF-autotable
- **Build**: Vite + Electron Builder

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Démarrage en développement
```bash
npm run dev
```

### Build pour production
```bash
npm run build
```

## 🗂️ Structure du projet

```
src/
├── main/                    # Processus principal Electron
│   ├── main.js            # Point d'entrée principal
│   ├── preload.js         # Bridge sécurisé IPC
│   └── database/         # Gestion de la base de données
│       ├── db.js         # Connexion et initialisation
│       ├── migrations.js  # Schéma de la base
│       └── queries/      # Requêtes SQL
├── renderer/              # Processus renderer (React)
│   ├── components/       # Composants React
│   │   ├── layout/      # Layout principal
│   │   ├── ui/          # Composants UI réutilisables
│   │   └── charts/      # Composants de graphiques
│   ├── pages/           # Pages de l'application
│   │   ├── Dashboard.jsx
│   │   ├── Invoices/
│   │   ├── Clients/
│   │   ├── Reports/
│   │   └── Settings.jsx
│   ├── hooks/           # Hooks personnalisés
│   ├── utils/           # Utilitaires (formatters, PDF)
│   ├── index.html       # Template HTML
│   ├── index.jsx        # Point d'entrée React
│   └── App.jsx          # App principale
```

## 🗄️ Base de données

La base de données SQLite est automatiquement créée au premier lancement dans le dossier de données de l'application.

### Tables principales
- `clients` - Informations des clients
- `factures` - Factures avec statuts et totaux
- `lignes_facture` - Lignes détaillées des factures
- `entreprise` - Paramètres de l'entreprise

## 🔧 Configuration

### Variables d'environnement
```bash
NODE_ENV=development  # ou production
```

### Personnalisation
Les couleurs et styles sont configurés via les variables CSS dans `src/renderer/index.css` :

```css
:root {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d27;
  --accent: #6366f1;
  /* ... */
}
```

## 📱 Utilisation

### Première utilisation
1. Lancez l'application
2. Configurez vos informations d'entreprise dans **Paramètres**
3. Ajoutez vos premiers clients
4. Créez vos premières factures

### Workflow typique
1. **Tableau de bord** - Vue d'ensemble de l'activité
2. **Clients** - Gestion de la base client
3. **Factures** - Création et suivi des factures
4. **Rapports** - Analyse périodique et export

## 🔒 Sécurité

- **Isolation de contexte** activée dans Electron
- **NodeIntegration** désactivé dans le renderer
- **Communication sécurisée** via contextBridge
- **Validation** des entrées utilisateur
- **Stockage local** des données sensibles

## 🚀 Déploiement

### Build pour Windows
```bash
npm run build
# Génère .exe dans dist/
```

### Build pour macOS
```bash
npm run build
# Génère .dmg dans dist/
```

### Build pour Linux
```bash
npm run build
# Génère .AppImage dans dist/
```

## 🐛 Dépannage

### Problèmes courants
1. **Base de données vide** - L'application crée automatiquement les tables au démarrage
2. **Erreur de dépendances** - Exécutez `npm install` à nouveau
3. **Problème de build** - Vérifiez que Node.js 18+ est installé

### Logs
Les logs de l'application sont disponibles dans la console de développement (F12) en mode développement.

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche de fonctionnalité
3. Committer les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour les détails.

## 📞 Support

Pour toute question ou problème :
- Email : lesprojetsdegloire@gmail.com
- Issues GitHub : [github.com/gloseny/gmFactures](https://github.com/gloseny/gmFactures)

---

**GestionFactures** - Simplifiez votre facturation ! 🚀
