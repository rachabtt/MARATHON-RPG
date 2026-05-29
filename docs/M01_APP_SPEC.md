# M01 APP SPEC — SOL ROUGE

## Objectif de l’app

L’app sert de console MJ pour Mission 01 — SOL ROUGE.

- /control : télécommande MJ sur téléphone/tablette/ordinateur.
- /display : écran joueur sur TV/moniteur.
- Le MJ contrôle lieux, ambiances, ressources, interventions, sons et effets.
- /display ne doit jamais afficher les outils MJ ni les secrets profonds.

## Ton de Mission 01

La mission doit sembler rationnelle au début :
- récupération d’équipe disparue ;
- terrain dangereux ;
- panne radio ;
- tempête électromagnétique ;
- faune hostile ;
- logs corrompus.

Progression :
- 70% hard sci-fi crédible ;
- 30% étrange.

Ne jamais expliquer le Signal.
Ne jamais expliquer HOLLOW.
Ne jamais afficher SOURCE BELOW SURFACE sauf bouton final explicitement confirmé.

## Lieux

1. NEW CARTHAGE
id: new_carthage
fonction : départ, colonie UESC, briefing, retour.
ambiance : industrielle, contrôlée, administrative.

2. PLAINES ROUGES
id: red_plains
fonction : traversée, isolement, poussière, rover.
ambiance : horizon immense, radio instable, vent.

3. ARCHES NOIRES
id: black_arches
fonction : tension, échos radio, approche du mystère.
ambiance : roches noires, absorption lumineuse, ghosting subtil.

4. SITE DELTA-6
id: delta6
fonction : enquête principale, rover endommagé, scanner actif, survivant, Hounds.
ambiance : site abandonné, matériel dispersé, données instables.

## Story beats M01

Créer des boutons de régie pour ces scènes :

1. RÉVEIL — ALETHEIA
location: new_carthage
ambience: calme
speaker: aletheia
message: “Bienvenue sur Tau Ceti IV. Le réveil s’est déroulé avec succès.”

2. BRIEFING — ROWE
location: new_carthage
ambience: tension
speaker: rowe
message: “Delta-6 ne répond plus depuis six heures. Vous récupérez l’équipe, les données et le rover.”

3. TRAVERSÉE — PLAINES ROUGES
location: red_plains
ambience: tension
speaker: rowe
message: “Gardez le canal ouvert. Revenez avant que la météo se ferme.”

4. ANOMALIE RADIO
location: red_plains
ambience: signal
speaker: aletheia
message: “Interférence locale détectée. Aucune source hostile confirmée.”
quickAction: glitch_radio

5. APPROCHE — ARCHES NOIRES
location: black_arches
ambience: signal
speaker: delta6_log
message: “Latence radio variable. Échos multiples. Source non confirmée.”

6. ARRIVÉE — DELTA-6
location: delta6
ambience: tension
speaker: delta6_log
message: “Relevé actif. Données instables. Retour géologique incohérent.”

7. SCANNER ACTIF
location: delta6
ambience: signal
speaker: delta6_log
message: “Vous entendez ça ? Coupez le scanner. Coupez—”
quickAction: glitch_radio

8. CONTACT HOUND
location: delta6
ambience: tension
speaker: hound
message: “CONTACT FAUNE // ÉMISSION ACTIVE DÉTECTÉE”
quickAction: hound

9. SURVIVANT — VELEN
location: delta6
ambience: signal
speaker: velen
message: “Je veux rentrer. Il faut couper le scanner.”

10. TEMPÊTE EM
location: delta6
ambience: tempete
speaker: aletheia
message: “Signal dégradé. Restez groupés. Votre sécurité est prioritaire.”
quickAction: flash_em

11. EXTRACTION
location: red_plains
ambience: extraction
speaker: rowe
message: “Fenêtre de retour réduite. Rentrez maintenant.”

12. RETOUR — NEW CARTHAGE
location: new_carthage
ambience: tension
speaker: aletheia
message: “Certaines données récupérées semblent corrompues. Je recommande une mise en quarantaine.”

13. FINALE — TERMINAL
location: new_carthage
ambience: signal
speaker: unknown_radio
message: “HOLLOW SIGNAL DETECTED”
requiresConfirmation: true

## Personnages / sources

rowe:
label: COMMANDER ELIAS ROWE
role: COMMANDEMENT UESC
asset: src/assets/portraits/rowe.png
fallback: waveform UESC commandement

aletheia:
label: ALETHEIA
role: ASSISTANCE COLONIALE
asset: src/assets/portraits/aletheia.png
fallback: avatar IA / waveform propre

velen:
label: DR ISAAC VELEN
role: SURVIVANT DELTA-6
asset: src/assets/portraits/velen.png
fallback: transmission faible

delta6_log:
label: LOG DELTA-6
role: ENREGISTREMENT CORROMPU
asset: fallback waveform

unknown_radio:
label: RADIO INCONNUE
role: SOURCE NON CLASSÉE
asset: fallback sombre

hound:
label: HOUND CONTACT
role: FAUNE HOSTILE
asset: src/assets/hounds/hound-profile.png
fallback: silhouette warning UESC

## Hounds

Les Hounds sont :
- rapides ;
- quadrupèdes ;
- presque aveugles ;
- attirés par l’activité électronique ;
- plus intéressés par radios, drones, lampes, rover, scanner que par humains immobiles.

Action HOUND :
- red_plains : silhouette basse au loin dans la poussière ;
- black_arches : ombre latérale entre les arches ;
- delta6 : ombre proche du rover/scanner ;
- new_carthage : alerte UESC seulement, pas de créature visible.

Ne jamais afficher le Hound comme une grosse fiche bestiaire plein écran sauf bouton ANALYSE HOUND.

## Ressources

Ressources à suivre :
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

Effets suggérés :
- Radio Critique : plus de glitch, radio audio plus sale.
- Visibilité Critique : poussière plus dense.
- Tempête Critique : flashs EM, audio tempête.
- Rover Critique : alarmes et flicker.
- Données Critique : terminal instable.
- Survivant Critique : intervention Velen possible.
- Groupe Critique : tension audio discrète.

## Cartes événement rapides

Ajouter un panneau compact “ÉVÉNEMENTS” :

1. ÉCHO TROP TÔT
Effet : glitch radio + message Aletheia.

2. POUSSIÈRE ROUGE
Effet : visibilité baisse, poussière forte.

3. VOYANT MOTEUR
Effet : rover/énergie sous tension.

4. QUELQUE CHOSE COURT
Effet : Hound furtif.

5. DONNÉES INSTABLES
Effet : intervention Delta-6 log.

6. SURVIVANT EN CRISE
Effet : intervention Velen.

7. SILENCE COMPLET
Effet : couper audio 3 secondes, tension.

8. FRONT DE TEMPÊTE
Effet : ambiance tempête, flash EM.

## Audio

Prévoir manifest audio, mais ne pas crasher si les fichiers n’existent pas.

Dossier :
src/assets/audio/interventions/

Fallback synthétique :
- Rowe : bip radio court.
- Aletheia : bip doux propre.
- Velen : souffle radio faible.
- Delta-6 log : glitch audio.
- Unknown radio : burst court + silence.
- Hound : griffe, souffle, impact basse.

## Règles de sécurité /display

Ne jamais afficher :
- explication du Signal ;
- vraie nature de HOLLOW ;
- SOURCE BELOW SURFACE sauf confirmation finale explicite ;
- secrets IA ;
- texte MJ long ;
- logs complets secrets.

## Tests attendus

Le développeur doit pouvoir tester :
- chaque lieu ;
- chaque ambiance ;
- chaque story beat ;
- chaque personnage ;
- Hound action ;
- finale avec confirmation ;
- synchro téléphone / display ;
- absence de crash si asset ou audio manquant.
