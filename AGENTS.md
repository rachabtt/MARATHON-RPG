# MARATHON-RPG — CONTEXTE AGENT

## Objectif de l’app

Cette app React/Vite sert de console MJ interactive pour MARATHON JDR — Mission 01 : SOL ROUGE.

Usage prévu :
- `/control` : interface MJ sur ordinateur, tablette ou téléphone.
- `/display` : écran joueur affiché sur TV, moniteur ou second écran.
- Le MJ contrôle les lieux, ambiances, ressources, effets et audio.
- Les joueurs ne doivent jamais voir les contrôles MJ.

## Mission 01 — SOL ROUGE

Les joueurs sont envoyés depuis New Carthage pour retrouver l’équipe géologique Delta-6, disparue à environ 40 km au sud-est.

Objectifs visibles :
- localiser Delta-6
- récupérer les survivants
- récupérer les données
- ramener le rover si possible
- revenir avant aggravation météo

Ne jamais afficher de spoilers sur `/display`.

## Lieux principaux

L’app doit gérer 4 lieux :

1. NEW CARTHAGE
- id: `new_carthage`
- image: `src/assets/locations/new-carthage.png`
- rôle : base UESC de départ, colonie en construction

2. PLAINES ROUGES
- id: `red_plains`
- image: `src/assets/locations/red-plains.png`
- rôle : traversée exposée vers Delta-6

3. ARCHES NOIRES
- id: `black_arches`
- image: `src/assets/locations/black-arches.png`
- rôle : formations rocheuses noires, échos radio, tension

4. SITE DELTA-6
- id: `delta6`
- image: `src/assets/locations/delta6-site.png`
- rôle : site géologique abandonné, rover endommagé, scanner actif, matériel dispersé

## Règle importante images

Les images doivent être importées depuis `src/assets/locations` via Vite.

Ne PAS utiliser :
- `/assets/locations/...`
- chemins publics
- noms avec espaces
- URL encodées `%20`

Le fichier `src/utils/locations.ts` doit importer les images comme modules.

## Direction artistique

Style obligatoire :
- hard sci-fi crédible
- UESC
- rétrofuturisme NASA brutaliste
- interfaces CRT vert/orange
- poussière rouge
- métal blanc sale, gris froid, noir technique
- ambiance Alien / Marathon / Dead Space
- interface sobre et militaire

À éviter :
- fantasy
- look Apple glossy
- UI jeu mobile flashy
- couleurs saturées
- monstres trop visibles
- gore
- dashboard de debug visible en partie

## Spoilers interdits sur /display

Ne jamais afficher :
- vraie nature du Signal
- explication de HOLLOW
- SOURCE BELOW SURFACE
- secrets IA
- révélations futures
- manuel MJ secret
- logs trop explicites

## Hounds

Les Hounds sont des prédateurs quadrupèdes rapides, presque aveugles, attirés par l’activité électronique.

Visuellement :
- les suggérer par ombres basses, poussière, mouvements furtifs
- ne jamais les montrer clairement sur `/display`

## Ressources M01

Le MJ suit 8 ressources :
- Rover
- Énergie
- Radio
- Visibilité
- Tempête
- Données
- Survivant
- Groupe

États :
- Stable
- Dégradé
- Critique
- Perdu

## UX /control

`/control` doit rester simple et mobile-first.

Structure recommandée :
1. Header compact
2. Cartes de lieux
3. Boutons d’ambiance
4. Badges ressources
5. Actions rapides
6. Audio
7. Avancé replié

Ne pas rajouter de sliders ou boutons inutiles.

## UX /display

`/display` doit être immersif :
- image plein écran du lieu actif
- overlays UESC discrets
- aucun bouton
- aucun panneau MJ
- aucun debug
- aucun spoiler

## Ambiances

Ambiances disponibles :
- CALME
- TENSION
- SIGNAL INSTABLE
- TEMPÊTE EM
- EXTRACTION

Les ambiances doivent être des overlays/effets au-dessus de l’image du lieu actif.
Elles ne doivent pas changer l’image de fond.

## Règle code

Le lieu actif choisit l’image.
L’ambiance active choisit les effets.
Ne jamais mélanger les deux.

## Sync

LocalStorage/BroadcastChannel ne synchronisent que des onglets sur la même machine.

Pour téléphone `/control` vers ordinateur `/display`, il faut une vraie synchro réseau :
- WebSocket ou SSE local
- serveur séparé possible
- pas de Supabase nécessaire

## Avant chaque patch

Toujours :
1. Lire ce fichier.
2. Modifier le moins de fichiers possible.
3. Ne pas réécrire toute l’app sans nécessité.
4. Lancer `npm run build`.
5. Donner la liste des fichiers modifiés.
