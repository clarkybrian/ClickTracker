# ClickTracker 🔗

> Un raccourcisseur d'URL moderne avec analytics avancés et interface intuitive

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)
- [API](#api)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)

## 🎯 Aperçu

ClickTracker est une application web moderne de raccourcissement d'URLs avec des fonctionnalités d'analytics avancées. Elle permet aux utilisateurs de créer des liens courts personnalisés, de suivre les clics en temps réel et d'analyser les performances de leurs liens.

### ✨ Démonstration

- **Interface utilisateur intuitive** avec design responsive
- **Mode démo** pour les utilisateurs non connectés
- **Dashboard complet** avec analytics détaillés
- **PWA** (Progressive Web App) pour une expérience mobile optimale

## 🚀 Fonctionnalités

### 🔗 Raccourcissement d'URLs
- Génération automatique de codes courts
- Alias personnalisés pour les liens
- Validation d'URLs en temps réel
- Copie en un clic

### 📊 Analytics & Suivi
- Suivi des clics en temps réel
- Graphiques de performance avec Recharts
- Statistiques détaillées par période
- Géolocalisation des clics
- Données d'utilisation par appareil

### 👤 Gestion des utilisateurs
- Authentification avec Supabase Auth
- Dashboard personnel
- Gestion des liens utilisateur
- Activation/désactivation des liens

### 📱 Experience utilisateur
- Interface responsive (mobile-first)
- PWA avec manifest et service worker
- Mode sombre/clair
- Notifications en temps réel

## 🛠 Technologies

### Frontend
- **React 18** - Bibliothèque UI moderne
- **TypeScript** - Typage statique pour plus de sécurité
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes

### Backend & Base de données
- **Supabase** - Backend-as-a-Service
  - Authentification
  - Base de données PostgreSQL
  - APIs REST automatiques
  - Subscriptions temps réel

### Analytics & Charts
- **Recharts** - Bibliothèque de graphiques React
- **Date-fns** - Manipulation de dates

### Routing & Navigation
- **React Router DOM** - Routing côté client

## 📦 Installation

### Prérequis
- Node.js (v18+)
- npm ou yarn
- Compte Supabase

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/clarkybrian/ClickTracker.git
cd ClickTracker
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration (optionnel)
VITE_APP_NAME=ClickTracker
VITE_APP_DOMAIN=clt.kr
```

### Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com/)
2. Configurez les tables nécessaires :

```sql
-- Table des liens
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  custom_alias VARCHAR(50),
  title TEXT,
  description TEXT,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des clics pour analytics
CREATE TABLE clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(2),
  city VARCHAR(100),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎮 Utilisation

### Interface principale

1. **Accueil** : Raccourcissement rapide d'URLs
2. **Authentification** : Connexion/Inscription
3. **Dashboard** : Gestion des liens et analytics

### Raccourcir un lien

```typescript
// Exemple d'utilisation
const shortLink = await createLink('https://example.com', 'mon-alias');
console.log(shortLink); // https://clt.kr/mon-alias
```

### Dashboard utilisateur

- **Mes liens** : Liste des liens créés
- **Analytics** : Graphiques et statistiques
- **Upgrade** : Plans premium (à venir)

## 📁 Structure du projet

```
ClickTracker/
├── public/
│   ├── manifest.json      # Configuration PWA
│   └── sw.js             # Service Worker
├── src/
│   ├── components/       # Composants React
│   │   ├── Auth/         # Authentification
│   │   ├── Dashboard/    # Dashboard utilisateur
│   │   ├── Header/       # En-tête navigation
│   │   └── LinkShortener/ # Raccourcisseur principal
│   ├── hooks/            # Hooks personnalisés
│   │   ├── useAuth.ts    # Gestion authentification
│   │   └── useLinks.ts   # Gestion des liens
│   ├── lib/              # Utilitaires
│   │   ├── supabase.ts   # Configuration Supabase
│   │   └── utils.ts      # Fonctions utilitaires
│   ├── types/            # Types TypeScript
│   └── App.tsx           # Composant principal
├── .env                  # Variables d'environnement
├── package.json          # Dépendances et scripts
└── README.md            # Documentation
```

## 🔌 API

### Endpoints principaux

L'application utilise les APIs Supabase auto-générées :

- `GET /links` - Récupérer les liens utilisateur
- `POST /links` - Créer un nouveau lien
- `PUT /links/:id` - Modifier un lien
- `DELETE /links/:id` - Supprimer un lien
- `GET /clicks` - Analytics des clics

### Hooks personnalisés

```typescript
// useLinks Hook
const { links, loading, createLink, deleteLink } = useLinks(userId);

// useAuth Hook
const { user, loading, signIn, signOut } = useAuth();
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
# ou
yarn build
```

### Déploiement Vercel (recommandé)

1. Connectez votre repository GitHub
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Déploiement manuel

```bash
# Build
npm run build

# Servir les fichiers statiques
npm run preview
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** sur la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Standards de code

- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les conventions ESLint configurées
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les APIs publiques

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Clark Brian** - [@clarkybrian](https://github.com/clarkybrian) - Développeur principal

## 🙏 Remerciements

- [Supabase](https://supabase.com/) pour le backend
- [Lucide](https://lucide.dev/) pour les icônes
- [TailwindCSS](https://tailwindcss.com/) pour le styling
- [React](https://reactjs.org/) pour l'interface utilisateur

---

<div align="center">
  <p>Fait avec ❤️ par <a href="https://github.com/clarkybrian">Clark Brian</a></p>
  <p>
    <a href="https://github.com/clarkybrian/ClickTracker/issues">🐛 Signaler un bug</a> •
    <a href="https://github.com/clarkybrian/ClickTracker/issues">💡 Proposer une fonctionnalité</a>
  </p>
</div>