// GM ONLY — never render this content in player display

export type GmScriptScene = {
  id: string;
  title: string;
  duration: string;
  sceneFunction: string;
  readAloud: string[];
  gmObjective: string[];
  visibleInfo: string[];
  possibleComplications: string[];
  controlSuggestions: string[];
  secretNotes: string[];
  reminder: string;
};

export const mission01GmScript: GmScriptScene[] = [
  {
    id: "reveil-aletheia",
    title: "RÉVEIL — ALETHEIA",
    duration: "15–25 min",
    sceneFunction: "Installer Tau Ceti IV, Aletheia, le réveil cryo et le malaise doux.",
    readAloud: [
      "Le bruit vient avant la lumière.",
      "Une vibration sourde traverse votre capsule cryogénique.",
      "Puis la sensation de tomber.",
      "Vos yeux s’ouvrent difficilement. Liquide froid. Respiration artificielle. Alarmes étouffées.",
      "Des silhouettes bougent derrière une vitre couverte de condensation.",
      "Une voix calme résonne dans la pièce :",
      "« Bienvenue sur Tau Ceti IV. »",
      "« Le réveil s’est déroulé avec succès. »",
      "« L’humanité vous remercie. »",
      "Puis, après une légère pause :",
      "« Veuillez signaler tout rêve persistant au personnel médical. »",
    ],
    gmObjective: [
      "Présenter une colonie crédible, froide, administrative.",
      "Faire comprendre qu’Aletheia est utile, calme, omniprésente.",
      "Faire présenter rapidement chaque PJ.",
      "Demander un détail personnel : rêve, malaise, réflexe au réveil, objet cher.",
    ],
    visibleInfo: [
      "Les PJ sont des colons actifs de première ligne.",
      "Ils viennent d’être réveillés ou remis en service actif.",
      "New Carthage est encore fragile et en construction.",
      "Tau Ceti IV est hostile, mais officiellement rationnelle.",
    ],
    possibleComplications: [
      "Un PJ garde une sensation étrange du sommeil cryo.",
      "Un moniteur affiche brièvement une anomalie puis revient à la normale.",
      "Aletheia corrige une phrase trop vite, comme si elle anticipait une question.",
    ],
    controlSuggestions: [
      "Lieu : New Carthage",
      "Ambiance : Calme",
      "Afficher escouade PJ",
      "Ne pas activer Signal Instable trop tôt",
    ],
    secretNotes: [
      "Ne pas rendre Aletheia inquiétante trop frontalement.",
      "Elle doit d’abord être pratique, rassurante et presque maternelle.",
      "Les rêves persistants peuvent être notés, mais ne pas les expliquer.",
    ],
    reminder: "Le début doit sembler rationnel. Le malaise doit être discret.",
  },

  {
    id: "briefing-rowe",
    title: "BRIEFING — COMMANDER ROWE",
    duration: "10–20 min",
    sceneFunction: "Donner une mission claire et cadrer l’opération comme une récupération terrain.",
    readAloud: [
      "Commander Elias Rowe vous attend dans un module opérationnel encore couvert de poussière rouge.",
      "Il a l’air fatigué, mais sa voix reste nette.",
      "« Delta-6 inspectait un site géologique à quarante kilomètres au sud-est. »",
      "« Plus de signal depuis six heures. »",
      "« Probablement une panne radio, un incident mécanique ou une tempête locale. »",
      "« Votre mission est simple : vous localisez l’équipe, vous récupérez les survivants, vous sécurisez les données géologiques, et vous ramenez le rover si possible. »",
      "« Pas de héros. Pas de panique. Pas de théorie bizarre dans les canaux publics. »",
      "« On construit une colonie, pas une légende. »",
    ],
    gmObjective: [
      "Donner les objectifs visibles.",
      "Installer Rowe comme professionnel, pas comme méchant.",
      "Faire sentir que l’UESC veut garder le contrôle de l’information.",
      "Laisser les joueurs poser 2 ou 3 questions avant de partir.",
    ],
    visibleInfo: [
      "Delta-6 a cessé de répondre.",
      "La cause officielle est probablement météo, radio ou mécanique.",
      "Les objectifs : survivants, données, rover.",
      "La mission doit rester discrète.",
    ],
    possibleComplications: [
      "Rowe coupe court aux spéculations.",
      "Aletheia fournit une météo trop rassurante.",
      "Une donnée du briefing semble incomplète ou classée.",
    ],
    controlSuggestions: [
      "Lieu : New Carthage",
      "Ambiance : Calme",
      "Scène : Briefing",
      "Préparer choix équipement après cette scène",
    ],
    secretNotes: [
      "Rowe ne doit pas donner l’impression de tout savoir.",
      "Il protège surtout l’ordre et la stabilité.",
      "S’il est interrogé finement, il peut admettre que la panne radio n’explique peut-être pas tout.",
    ],
    reminder: "La mission doit être claire. Le mystère vient après.",
  },

  {
    id: "preparation",
    title: "PRÉPARATION — ROVER BAY",
    duration: "10–20 min",
    sceneFunction: "Faire choisir quelques ressources utiles avant le départ.",
    readAloud: [
      "Le rover attend dans la baie extérieure, massif, bas, couvert d’une fine couche de poussière rouge.",
      "Des techniciens vérifient les joints, les batteries, les pneus et les antennes.",
      "Aletheia annonce calmement :",
      "« Équipement préparé selon les paramètres standards de mission extérieure. »",
      "« Fenêtre météo acceptable. »",
      "« Risque opérationnel : modéré. »",
    ],
    gmObjective: [
      "Faire choisir 3 à 5 ressources d’équipe.",
      "Ne pas transformer la scène en inventaire interminable.",
      "Faire comprendre que chaque choix pourra compter plus tard.",
    ],
    visibleInfo: [
      "Ressources possibles : drone, kit médical renforcé, batterie, scanner portable, caisse de réparation.",
      "Armes légères possibles si justifiées.",
      "Équipement lourd refusé sauf excellente raison.",
    ],
    possibleComplications: [
      "Un équipement utile est laissé en arrière.",
      "Aletheia suggère une option très prudente.",
      "Un joueur demande un matériel impossible à obtenir.",
    ],
    controlSuggestions: [
      "Lieu : New Carthage",
      "Ambiance : Calme",
      "Afficher PJ / ressources",
      "Ne pas encore baisser les ressources sauf choix risqué",
    ],
    secretNotes: [
      "Les équipements actifs pourront attirer des complications plus tard.",
      "Ne pas expliquer cette logique trop tôt.",
      "Laisser les joueurs découvrir par l’expérience.",
    ],
    reminder: "Trois bons choix valent mieux qu’un catalogue de vaisseau spatial.",
  },

  {
    id: "traversee-plaines-rouges",
    title: "TRAVERSÉE — PLAINES ROUGES",
    duration: "30–45 min",
    sceneFunction: "Faire découvrir Tau Ceti IV et installer l’isolement.",
    readAloud: [
      "Le rover quitte New Carthage dans un grondement sourd.",
      "Le ciel est immense. Gris pâle. Presque métallique.",
      "Le soleil semble lointain.",
      "Les plaines rouges s’étendent jusqu’à l’horizon.",
      "Des formations rocheuses noires émergent au loin comme des os gigantesques.",
      "Par moments, le vent transporte un son qui pourrait être une vibration de coque.",
      "Ou pas.",
    ],
    gmObjective: [
      "Faire sentir la taille de Tau Ceti IV.",
      "Installer le voyage comme dangereux mais encore rationnel.",
      "Dégrader doucement la radio ou la visibilité si nécessaire.",
      "Préparer l’anomalie radio.",
    ],
    visibleInfo: [
      "La route est exposée.",
      "Le terrain devient plus difficile à mesure qu’ils approchent des Black Arches.",
      "Les communications restent possibles mais imparfaites.",
    ],
    possibleComplications: [
      "Rafale de poussière : Visibilité ↓.",
      "Crevasse masquée : jet Technique ou Physique.",
      "Trace de Hound : menace annoncée sans combat.",
      "Panne mineure rover : occasion de réparation.",
    ],
    controlSuggestions: [
      "Lieu : Plaines Rouges",
      "Ambiance : Calme ou Tension",
      "Ressource : Visibilité Dégradée si besoin",
      "Ressource : Signal Radio Dégradé si besoin",
    ],
    secretNotes: [
      "Ne pas faire surgir l’étrange trop vite.",
      "Les joueurs doivent encore pouvoir croire à une sortie terrain normale.",
      "Garder les Black Arches comme silhouette inquiétante, pas comme révélation.",
    ],
    reminder: "Le voyage doit faire respirer la mission avant la première anomalie.",
  },

  {
    id: "anomalie-radio",
    title: "ANOMALIE RADIO",
    duration: "5–10 min",
    sceneFunction: "Premier malaise impossible à classer.",
    readAloud: [
      "Une communication banale passe dans le canal UESC.",
      "Puis quelque chose accroche.",
      "Un léger grésillement.",
      "Une phrase revient dans le casque.",
      "La même phrase.",
      "Mais deux secondes avant d’être prononcée.",
      "Le rover affiche simplement : INTERFÉRENCE LOCALE DÉTECTÉE.",
    ],
    gmObjective: [
      "Créer un silence à table.",
      "Ne pas expliquer.",
      "Proposer des explications techniques floues si les joueurs insistent.",
      "Donner +1 Stress ou +1 Bruit au PJ concerné selon le ton voulu.",
    ],
    visibleInfo: [
      "La radio a produit une anomalie.",
      "Les instruments ne savent pas classer clairement l’événement.",
      "Aletheia ou le rover parle d’interférence locale.",
    ],
    possibleComplications: [
      "Signal Radio ↓.",
      "Un PJ gagne +1 Stress.",
      "Un PJ gagne +1 Bruit.",
      "La phrase semble légèrement différente à la seconde écoute.",
    ],
    controlSuggestions: [
      "Ambiance : Signal Instable",
      "Ressource : Signal Radio Dégradé",
      "Ne pas afficher HOLLOW",
      "Utiliser audio glitch radio si disponible",
    ],
    secretNotes: [
      "Ne jamais dire que l’anomalie a une intention.",
      "Ne pas employer le vocabulaire du Signal comme explication.",
      "Laisser les joueurs produire leurs hypothèses.",
    ],
    reminder: "Une bonne anomalie n’explique rien. Elle rend le silence plus lourd.",
  },

  {
    id: "approche-arches-noires",
    title: "APPROCHE — ARCHES NOIRES",
    duration: "20–35 min",
    sceneFunction: "Faire basculer l’ambiance vers l’étrange sans quitter le hard sci-fi.",
    readAloud: [
      "Les Black Arches se dressent devant vous.",
      "Elles ne ressemblent pas à des ruines.",
      "Pas vraiment.",
      "Plutôt à de la roche volcanique tirée vers le ciel pendant qu’elle était encore molle.",
      "La surface absorbe la lumière.",
      "La radio gagne une latence irrégulière.",
      "Les voix semblent porter trop loin.",
    ],
    gmObjective: [
      "Rendre les arches ambiguës.",
      "Introduire des échos radio et des traces de faune.",
      "Préparer le site Delta-6.",
      "Ne jamais dire que les arches sont artificielles.",
    ],
    visibleInfo: [
      "Les arches perturbent les communications.",
      "Le terrain offre de la couverture et des angles morts.",
      "Des traces peuvent indiquer le passage d’une faune locale.",
    ],
    possibleComplications: [
      "Trace longue dans le sable.",
      "Voix qui revient déformée.",
      "Lampe qui baisse d’intensité.",
      "Mouvement bas dans la poussière.",
    ],
    controlSuggestions: [
      "Lieu : Arches Noires",
      "Ambiance : Signal Instable ou Tension",
      "Menace : Contact Hound si les joueurs font trop de bruit",
      "Ressource : Visibilité ou Radio ↓",
    ],
    secretNotes: [
      "Les arches doivent rester scientifiquement étranges.",
      "Ne pas les transformer en temple alien.",
      "L’ambiguïté est plus forte qu’une révélation.",
    ],
    reminder: "Naturel. Probablement. Voilà le malaise.",
  },

  {
    id: "arrivee-delta6",
    title: "ARRIVÉE — SITE DELTA-6",
    duration: "45–70 min",
    sceneFunction: "Enquête principale, fouille, indices et montée de tension.",
    readAloud: [
      "Le site Delta-6 apparaît entre deux vagues de poussière.",
      "Le rover est là.",
      "Incliné sur un côté.",
      "Une roue partiellement enterrée.",
      "Les projecteurs encore allumés, dirigés vers rien.",
      "Des caisses ouvertes roulent lentement dans le vent.",
      "Le scanner géologique continue de tourner.",
      "Aucun corps visible.",
    ],
    gmObjective: [
      "Laisser les PJ fouiller 2 à 4 éléments.",
      "Donner des indices fragmentaires.",
      "Faire des données Delta-6 un enjeu.",
      "Préparer Hounds, survivant ou tempête selon le rythme.",
    ],
    visibleInfo: [
      "Rover Delta-6 endommagé.",
      "Scanner encore actif.",
      "Matériel dispersé.",
      "Traces étranges dans le sable.",
      "Logs audio corrompus.",
    ],
    possibleComplications: [
      "Le scanner attire une pression.",
      "Les données deviennent instables.",
      "Le rover émet un signal involontaire.",
      "Un bruit de mouvement vient des arches.",
      "Temps avant tempête ↓.",
    ],
    controlSuggestions: [
      "Lieu : Site Delta-6",
      "Ambiance : Tension",
      "Afficher Data Package Delta-6 si branché",
      "Ressource : Données Delta-6 NON SÉCURISÉES",
    ],
    secretNotes: [
      "Ne pas donner tous les indices d’un coup.",
      "Les joueurs doivent choisir quoi inspecter en priorité.",
      "Plus ils restent, plus la situation doit se tendre.",
    ],
    reminder: "Le site doit sembler abandonné trop vite, pas détruit depuis longtemps.",
  },

  {
    id: "scanner-actif",
    title: "SCANNER ACTIF — DONNÉES DELTA-6",
    duration: "10–25 min",
    sceneFunction: "Transformer les données en enjeu concret.",
    readAloud: [
      "Le scanner géologique tourne encore.",
      "L’écran tremble sous les parasites.",
      "Des lignes de profondeur s’affichent, puis disparaissent.",
      "Un bloc de données reste ouvert : DATA PACKAGE DELTA-6.",
      "La barre d’intégrité oscille.",
      "Le système demande une action : copier, transférer, isoler ou abandonner.",
    ],
    gmObjective: [
      "Forcer un choix sur les données.",
      "Faire comprendre que l’information a un coût.",
      "Donner un indice technique sans expliquer sa cause profonde.",
      "Relier scanner actif, radio et danger potentiel.",
    ],
    visibleInfo: [
      "Les données sont incomplètes ou instables.",
      "Le scanner semble encore actif.",
      "La récupération peut prendre du temps.",
      "Certaines mesures semblent incohérentes.",
    ],
    possibleComplications: [
      "Données Delta-6 : PARTIELLES ou CORROMPUES.",
      "Signal Radio ↓.",
      "Temps avant tempête ↓.",
      "Contact Hound si activité prolongée.",
      "Bruit +1 pour le PJ qui pousse l’analyse.",
    ],
    controlSuggestions: [
      "Afficher Data Package Delta-6",
      "Ambiance : Signal Instable",
      "Ressource : Données Delta-6 TRANSFERT EN COURS",
      "Préparer Contact Hound ou Tempête EM",
    ],
    secretNotes: [
      "Ne pas expliquer pourquoi les données sont incohérentes.",
      "Éviter les termes trop révélateurs.",
      "Laisser les joueurs croire à corruption, panne, tempête ou erreur de mesure.",
    ],
    reminder: "Les données doivent être utiles, mais jamais gratuites.",
  },

  {
    id: "contact-hound",
    title: "CONTACT HOUND",
    duration: "20–40 min",
    sceneFunction: "Première vraie menace physique de la mission.",
    readAloud: [
      "Quelque chose bouge entre les arches.",
      "Bas. Rapide.",
      "Trop anguleux.",
      "Une silhouette quadrupède traverse la poussière, puis une deuxième.",
      "Elles n’ont pas d’yeux visibles.",
      "Leur tête ressemble à une plaque osseuse fermée.",
      "Elles ne regardent pas les humains.",
      "Elles se tournent vers les radios.",
    ],
    gmObjective: [
      "Créer une menace claire et lisible.",
      "Montrer que l’équipement actif peut devenir un problème.",
      "Ne pas massacrer les PJ.",
      "Faire bouger les ressources : radio, drone, rover, Stress, blessures.",
    ],
    visibleInfo: [
      "Les Hounds sont rapides.",
      "Ils semblent réagir à certains signaux ou mouvements.",
      "Ils attaquent volontiers l’équipement actif.",
      "Ils restent dangereux au contact.",
    ],
    possibleComplications: [
      "Drone attaqué.",
      "Radio endommagée.",
      "Rover touché.",
      "PJ isolé.",
      "Stress +1.",
      "1 blessure sur morsure sérieuse.",
    ],
    controlSuggestions: [
      "Menace : Contact Hound",
      "Ambiance : Tension",
      "Ressource : Radio / Rover / Calme du groupe ↓",
      "Afficher message court HOSTILE MOTION DETECTED si disponible",
    ],
    secretNotes: [
      "Ne pas expliquer immédiatement leur logique.",
      "Les joueurs doivent comprendre par observation.",
      "Faire attaquer d’abord un drone, une radio, une lampe ou le rover.",
    ],
    reminder: "La scène doit enseigner par l’action : technologie active = risque.",
  },

  {
    id: "survivant-velen",
    title: "SURVIVANT — DR VELEN",
    duration: "20–35 min",
    sceneFunction: "Humaniser l’incident et donner des fragments inquiétants.",
    readAloud: [
      "Vous trouvez un survivant à l’abri d’un ravin noir ou dans un compartiment du rover.",
      "Il est couvert de poussière.",
      "Sa respiration est faible, mais régulière.",
      "Il ne semble pas surpris de vous voir.",
      "Il évite de regarder les arches.",
      "Sa première phrase est presque un souffle :",
      "« Je veux rentrer. »",
    ],
    gmObjective: [
      "Faire de Velen un enjeu humain.",
      "Donner des phrases fragmentaires.",
      "Compliquer l’extraction.",
      "Éviter l’exposition explicative.",
    ],
    visibleInfo: [
      "Velen est traumatisé.",
      "Il réagit mal aux radios.",
      "Il a entendu ou vu quelque chose qu’il ne comprend pas.",
      "Il peut donner des indices s’il est traité avec douceur.",
    ],
    possibleComplications: [
      "Velen panique.",
      "Il refuse de bouger.",
      "Il répète une phrase inquiétante.",
      "Il met le groupe en retard.",
      "Survivant Delta-6 ↓.",
      "Temps avant tempête ↓.",
    ],
    controlSuggestions: [
      "Ressource : Survivant Delta-6",
      "Ambiance : Tension",
      "Préparer Tempête EM",
      "Ne pas afficher HOLLOW trop tôt sauf fin de scène forte",
    ],
    secretNotes: [
      "Velen ne doit pas expliquer la mission.",
      "Il est un témoin, pas un narrateur omniscient.",
      "Ses phrases doivent ouvrir des questions, pas fermer le mystère.",
    ],
    reminder: "Velen doit donner envie de le sauver, même s’il complique tout.",
  },

  {
    id: "tempete-em",
    title: "TEMPÊTE ÉLECTROMAGNÉTIQUE",
    duration: "35–60 min",
    sceneFunction: "Climax de survie, fuite et choix sous pression.",
    readAloud: [
      "Le ciel s’assombrit en quelques secondes.",
      "Pas comme un orage.",
      "Comme si quelqu’un avait baissé la lumière du monde.",
      "Des éclairs silencieux parcourent les nuages.",
      "Le sable rouge se soulève en nappes épaisses.",
      "Les radios hurlent une seconde, puis se noient dans le souffle blanc.",
    ],
    gmObjective: [
      "Forcer l’extraction.",
      "Empêcher les joueurs de tout sauver sans coût.",
      "Faire baisser plusieurs ressources.",
      "Créer un dernier moment d’anomalie ou de panique.",
    ],
    visibleInfo: [
      "La visibilité chute.",
      "La radio devient instable ou inutilisable.",
      "Le rover peut tomber en panne.",
      "Les données ou le survivant peuvent être menacés.",
    ],
    possibleComplications: [
      "Visibilité : Critique ou Perdue.",
      "Signal Radio : Critique ou Perdu.",
      "Rover : Dégradé ou Critique.",
      "Données corrompues.",
      "PJ isolé.",
      "Hound sur la coque.",
      "Bruit +1 pour un PJ exposé.",
    ],
    controlSuggestions: [
      "Activer mode Tempête EM global",
      "Ambiance : Tempête EM",
      "Ressources : Radio / Visibilité / Rover ↓",
      "Préparer Extraction",
    ],
    secretNotes: [
      "Une voix ou perception étrange peut apparaître, mais rester fragmentaire.",
      "Répondre par image ou sensation, pas par explication.",
      "Ne jamais clarifier ce qui parle ou d’où ça vient.",
    ],
    reminder: "La tempête n’est pas juste une météo : c’est une machine à décisions.",
  },

  {
    id: "extraction",
    title: "EXTRACTION",
    duration: "20–45 min",
    sceneFunction: "Retour sous pression avec sacrifice ou coût.",
    readAloud: [
      "Le rover gronde dans le mur rouge.",
      "Les phares découpent à peine la poussière.",
      "Chaque secousse ressemble à une erreur de trajectoire.",
      "Les alarmes se superposent.",
      "Derrière vous, le site Delta-6 disparaît dans la tempête.",
      "Ou peut-être qu’il disparaît autrement.",
    ],
    gmObjective: [
      "Faire trancher les priorités.",
      "Rendre impossible le retour parfait si les joueurs ont tout tenté.",
      "Donner une dernière complication utile.",
      "Ramener vers le calme administratif.",
    ],
    visibleInfo: [
      "Le retour est dangereux.",
      "Les communications sont instables.",
      "Le rover peut tenir, casser ou revenir endommagé.",
      "Les données / survivant / sécurité du groupe ne sont pas tous garantis.",
    ],
    possibleComplications: [
      "Panne rover.",
      "Roue bloquée.",
      "Données menacées.",
      "Survivant en crise.",
      "Blessure.",
      "Dernier contact Hound.",
      "Radio perdue.",
    ],
    controlSuggestions: [
      "Ambiance : Extraction",
      "Ressource : Rover / Données / Survivant selon choix",
      "Garder rythme rapide",
      "Ne pas relancer une longue enquête",
    ],
    secretNotes: [
      "L’extraction doit conclure les choix, pas ouvrir une nouvelle sous-mission.",
      "Si la table ralentit, baisse une ressource ou impose un choix binaire.",
    ],
    reminder: "Ils peuvent réussir. Mais pas tout garder intact.",
  },

  {
    id: "retour-new-carthage",
    title: "RETOUR — NEW CARTHAGE",
    duration: "15–25 min",
    sceneFunction: "Retour au contrôle, débrief, calme inquiétant.",
    readAloud: [
      "Les lumières de New Carthage apparaissent enfin dans la poussière.",
      "Le sas du rover s’ouvre sur des projecteurs blancs.",
      "Des techniciens courent vers vous.",
      "Des médecins prennent le relais.",
      "Des formulaires s’ouvrent sur des tablettes.",
      "La colonie absorbe l’horreur dans de l’administratif.",
      "Et c’est presque pire.",
    ],
    gmObjective: [
      "Faire le bilan sans traîner.",
      "Noter ce qui a été sauvé ou perdu.",
      "Faire intervenir Rowe ou Aletheia si nécessaire.",
      "Installer une méfiance douce.",
    ],
    visibleInfo: [
      "Rowe veut savoir qui est vivant.",
      "L’UESC veut récupérer les données.",
      "Les blessés sont pris en charge.",
      "Les anomalies sont classées prudemment.",
    ],
    possibleComplications: [
      "Aletheia isole ou filtre les données.",
      "Rowe demande un rapport fermé.",
      "Velen est placé en observation.",
      "Un PJ refuse de remettre les données.",
      "La confiance envers l’UESC ou Aletheia baisse.",
    ],
    controlSuggestions: [
      "Lieu : New Carthage",
      "Ambiance : Calme, mais tension possible",
      "Ressource : Données Delta-6 état final",
      "Préparer Finale Terminal",
    ],
    secretNotes: [
      "Le calme doit paraître presque trop propre.",
      "Aletheia doit rester utile et polie.",
      "Ne pas confirmer qu’elle cache volontairement quelque chose.",
    ],
    reminder: "Après le chaos, l’administration froide devient inquiétante.",
  },

  {
    id: "finale-terminal",
    title: "FINALE — TERMINAL",
    duration: "2–5 min",
    sceneFunction: "Image finale, mystère, accroche Mission 02.",
    readAloud: [
      "Plus tard.",
      "Très tard.",
      "New Carthage dort enfin.",
      "Les vents frappent les structures modulaires de la colonie.",
      "Les lumières du Marathon brillent dans le ciel.",
      "Immenses. Immobiles.",
      "Puis, dans un terminal de maintenance oublié, une ligne apparaît.",
      "Sans explication.",
      "HOLLOW SIGNAL DETECTED",
      "SOURCE:",
      "BELOW SURFACE",
      "Puis l’écran s’éteint.",
    ],
    gmObjective: [
      "Finir sur une image froide.",
      "Ne pas répondre aux questions finales.",
      "Noter immédiatement les soupçons des joueurs.",
    ],
    visibleInfo: [
      "Un terminal affiche HOLLOW SIGNAL DETECTED.",
      "La source indiquée est sous la surface.",
      "Aucune explication n’est donnée.",
    ],
    possibleComplications: [
      "Aucune complication : c’est une scène de clôture.",
      "Laisser le silence faire le travail.",
    ],
    controlSuggestions: [
      "Scène : Finale Terminal",
      "Afficher écran final HOLLOW",
      "Ambiance : Signal Instable ou silence",
      "Puis Écran Noir",
    ],
    secretNotes: [
      "Ne pas expliquer HOLLOW.",
      "Ne pas teaser verbalement la suite.",
      "Laisser les joueurs combler le vide eux-mêmes.",
    ],
    reminder: "Terminer net. Si quelqu’un demande “ça veut dire quoi ?”, sourire et couper.",
  },
];

const gmScriptSceneAliases: Record<string, string> = {
  depart_new_carthage: "reveil-aletheia",
  intro_aletheia: "reveil-aletheia",
  reveil_aletheia: "reveil-aletheia",
  "reveil-aletheia": "reveil-aletheia",
  briefing_rowe: "briefing-rowe",
  "briefing-rowe": "briefing-rowe",
  preparation: "preparation",
  traversee: "traversee-plaines-rouges",
  traversee_plaines_rouges: "traversee-plaines-rouges",
  "traversee-plaines-rouges": "traversee-plaines-rouges",
  anomalie_radio: "anomalie-radio",
  "anomalie-radio": "anomalie-radio",
  approche_arches_noires: "approche-arches-noires",
  "approche-arches-noires": "approche-arches-noires",
  arches_noires: "approche-arches-noires",
  arrivee_delta6: "arrivee-delta6",
  "arrivee-delta6": "arrivee-delta6",
  site_delta6: "arrivee-delta6",
  scanner_actif: "scanner-actif",
  "scanner-actif": "scanner-actif",
  contact_hound: "contact-hound",
  "contact-hound": "contact-hound",
  survivant_velen: "survivant-velen",
  "survivant-velen": "survivant-velen",
  tempete_em: "tempete-em",
  "tempete-em": "tempete-em",
  extraction: "extraction",
  retour_new_carthage: "retour-new-carthage",
  "retour-new-carthage": "retour-new-carthage",
  finale_terminal: "finale-terminal",
  final_terminal: "finale-terminal",
  "finale-terminal": "finale-terminal",
};

export function getGmScriptSceneIdForStoryBeat(id?: string | null): string {
  if (!id) return mission01GmScript[0].id;
  return gmScriptSceneAliases[id] ?? id;
}

export function getGmScriptSceneById(id?: string | null): GmScriptScene {
  const normalizedId = getGmScriptSceneIdForStoryBeat(id);
  return (
    mission01GmScript.find((scene) => scene.id === normalizedId) ??
    mission01GmScript[0]
  );
}

export function getGmScriptSceneIndex(id?: string | null): number {
  const normalizedId = getGmScriptSceneIdForStoryBeat(id);
  const index = mission01GmScript.findIndex((scene) => scene.id === normalizedId);
  return index >= 0 ? index : 0;
}

export const defaultGmScriptScene = mission01GmScript[0];
