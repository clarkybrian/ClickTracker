# 📋 Guide d'Exécution des Scripts SQL - ClickTracker

## 🎯 Ordre d'Exécution (IMPORTANT)

### **ÉTAPE 1 : Script Principal** ⭐ **OBLIGATOIRE**
**Fichier :** `database_setup.sql`
**Action :** Exécuter TOUT le contenu d'un coup

```sql
-- 1. Ouvrez Supabase Dashboard
-- 2. Allez dans "SQL Editor" (sidebar)
-- 3. Créez un nouveau query
-- 4. COPIEZ TOUT le contenu de database_setup.sql
-- 5. COLLEZ dans l'éditeur
-- 6. Cliquez sur "Run" ▶️
```

**✅ Résultat attendu :**
- 7 tables créées
- Politiques RLS activées
- Fonctions et triggers créés
- Vues analytiques disponibles

---

### **ÉTAPE 2 : Index de Performance** 🚀 **OPTIONNEL**
**Fichier :** `database_index_concurrent.sql`
**Action :** Exécuter séparément APRÈS l'étape 1

```sql
-- 1. Dans Supabase SQL Editor
-- 2. Créez un NOUVEAU query (onglet séparé)
-- 3. Copiez le contenu de database_index_concurrent.sql
-- 4. Cliquez sur "Run" ▶️
```

**✅ Résultat attendu :**
- Index de performance créé en arrière-plan
- Redirections plus rapides

---

## 📝 Contenu de Chaque Script

### **Script 1: `database_setup.sql`** (467 lignes)
```
✅ Extensions PostgreSQL (uuid-ossp, pg_stat_statements)
✅ Table user_profiles (profils utilisateur)
✅ Table custom_domains (domaines personnalisés)
✅ Table campaigns (organisation des liens)
✅ Table links (liens raccourcis)
✅ Table clicks (tracking des clics)
✅ Table link_daily_stats (statistiques quotidiennes)
✅ Table user_daily_stats (statistiques utilisateur)
✅ Fonctions utilitaires (generate_short_code, update_daily_stats, etc.)
✅ Triggers automatiques (profil auto, updated_at)
✅ Politiques RLS (sécurité par utilisateur)
✅ Vues analytiques (link_stats, top_referers)
✅ Index de base pour performance
```

### **Script 2: `database_index_concurrent.sql`** (19 lignes)
```
✅ Index concurrent pour redirections ultra-rapides
✅ Optimisation spécifique pour table links
✅ Création en arrière-plan sans blocage
```

---

## ⚠️ Points Importants

### **DO ✅**
- ✅ Exécuter `database_setup.sql` EN PREMIER et ENTIÈREMENT
- ✅ Attendre que l'étape 1 soit 100% terminée
- ✅ Puis exécuter `database_index_concurrent.sql` séparément
- ✅ Vérifier qu'aucune erreur n'apparaît

### **DON'T ❌**
- ❌ NE PAS exécuter les scripts par morceaux
- ❌ NE PAS inverser l'ordre
- ❌ NE PAS exécuter les deux en même temps
- ❌ NE PAS ignorer les erreurs

---

## 🔍 Vérifications Post-Installation

### **1. Vérifier les Tables**
```sql
-- Copiez-collez dans SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Résultat attendu : 7 tables
-- campaigns, clicks, custom_domains, link_daily_stats, 
-- links, user_daily_stats, user_profiles
```

### **2. Vérifier RLS (Sécurité)**
```sql
-- Vérifier que Row Level Security est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Résultat attendu : 7 tables avec rowsecurity = true
```

### **3. Vérifier les Fonctions**
```sql
-- Vérifier les fonctions utilitaires
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Résultat attendu : 4+ fonctions incluant :
-- generate_short_code, handle_new_user, update_daily_stats, etc.
```

### **4. Vérifier les Vues**
```sql
-- Vérifier les vues analytiques
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW';

-- Résultat attendu : 2 vues
-- link_stats, top_referers
```

---

## 🚨 En Cas d'Erreur

### **Erreurs Possibles et Solutions**

1. **Extension déjà existante**
   ```
   ERROR: extension "uuid-ossp" already exists
   ```
   ✅ **Solution :** Ignorez, c'est normal

2. **Table déjà existante**
   ```
   ERROR: relation "user_profiles" already exists
   ```
   ✅ **Solution :** Supprimez les tables et recommencez

3. **Trigger déjà existant**
   ```
   ERROR: trigger "on_auth_user_created" already exists
   ```
   ✅ **Solution :** Utilisez `DROP TRIGGER IF EXISTS` avant

### **Script de Nettoyage (si besoin)**
```sql
-- ATTENTION : Ceci supprime TOUTES les données !
-- Utilisez seulement pour recommencer à zéro

DROP VIEW IF EXISTS public.top_referers CASCADE;
DROP VIEW IF EXISTS public.link_stats CASCADE;
DROP TABLE IF EXISTS public.user_daily_stats CASCADE;
DROP TABLE IF EXISTS public.link_daily_stats CASCADE;
DROP TABLE IF EXISTS public.clicks CASCADE;
DROP TABLE IF EXISTS public.links CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.custom_domains CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.generate_short_code(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.update_daily_stats(DATE) CASCADE;
```

---

## ✅ Checklist Finale

Avant de passer à l'étape suivante (configuration OAuth), vérifiez :

- [ ] ✅ Script `database_setup.sql` exécuté sans erreur
- [ ] ✅ 7 tables créées dans l'onglet "Table Editor"
- [ ] ✅ RLS activé sur toutes les tables
- [ ] ✅ Fonctions visibles dans l'onglet "Functions"
- [ ] ✅ (Optionnel) Index concurrent créé
- [ ] ✅ Aucun message d'erreur critique

---

## 🎉 Prochaines Étapes

Une fois la base de données configurée :

1. **Configuration OAuth Google** (Supabase Dashboard)
2. **Variables d'environnement** (.env.local)
3. **Connexion du Dashboard** (données réelles)
4. **API de redirection** (endpoint de tracking)

**La base de données est le fondement - assurez-vous qu'elle soit parfaite ! 🎯**
