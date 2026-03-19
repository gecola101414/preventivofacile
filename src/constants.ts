export interface SectorSubOption {
  id: string;
  label: string;
  type: 'select' | 'number' | 'text' | 'checkbox';
  options?: string[];
  defaultValue?: string | number | boolean;
  unit?: string;
  safetyInfo?: string;
  installationInfo?: string;
}

export interface RenovationSector {
  id: string;
  name: string;
  icon: string;
  type: 'internal' | 'external';
  description: string;
  defaultWbs: string[];
  conditionalNote: string;
  subOptions?: SectorSubOption[];
}

export const RENOVATION_SECTORS: RenovationSector[] = [
  {
    id: 'safety-site',
    name: 'Sicurezza e Cantierizzazione',
    icon: 'ShieldAlert',
    type: 'internal',
    description: 'Apprestamenti di sicurezza, recinzioni, bagni chimici e gestione del cantiere.',
    defaultWbs: ["Oneri della sicurezza non soggetti a ribasso", "Allestimento cantiere e segnaletica"],
    conditionalNote: "L'intervento prevede l'attuazione di tutte le misure di sicurezza previste dal D.Lgs 81/08 per la tutela dei lavoratori.",
    subOptions: [
      { id: 'saf-fence', label: 'Recinzione di Cantiere', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'saf-toilet', label: 'Bagno Chimico (Noleggio/Pulizia)', type: 'number', unit: 'sett', defaultValue: 4 },
      { id: 'saf-scaffold', label: 'Ponteggio Metallico Fisso', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'saf-tower', label: 'Trabattello Mobile', type: 'number', unit: 'giorni', defaultValue: 0 },
      { id: 'saf-signs', label: 'Cartellonistica di Sicurezza', type: 'checkbox', defaultValue: true },
      { id: 'saf-extinguisher', label: 'Estintori di Cantiere', type: 'number', unit: 'cad', defaultValue: 2 },
      { id: 'saf-firstaid', label: 'Kit Pronto Soccorso', type: 'checkbox', defaultValue: true },
      { id: 'saf-grounding', label: 'Impianto di Messa a Terra Cantiere', type: 'checkbox', defaultValue: true },
      { id: 'saf-lighting', label: 'Illuminazione di Emergenza', type: 'checkbox', defaultValue: false },
      { id: 'saf-guardrails', label: 'Protezioni Collettive (Parapetti)', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'saf-lifeline', label: 'Linee Vita Temporanee', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'saf-walkways', label: 'Passerelle e Rampe di Accesso', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'saf-road-signs', label: 'Segnaletica Stradale Temporanea', type: 'checkbox', defaultValue: false },
      { id: 'saf-sheds', label: 'Baraccamenti/Uffici di Cantiere', type: 'checkbox', defaultValue: false },
      { id: 'saf-flammable', label: 'Deposito Materiali Infiammabili', type: 'checkbox', defaultValue: false },
      { id: 'saf-dpi', label: 'Dispositivi Protezione Individuale (DPI)', type: 'checkbox', defaultValue: true },
      { id: 'saf-training', label: 'Formazione e Informazione Lavoratori', type: 'checkbox', defaultValue: true },
      { id: 'saf-psc', label: 'Piano di Sicurezza e Coordinamento (PSC)', type: 'checkbox', defaultValue: true },
      { id: 'saf-pos', label: 'Piano Operativo di Sicurezza (POS)', type: 'checkbox', defaultValue: true },
      { id: 'saf-cse', label: 'Coordinatore Sicurezza (CSE)', type: 'checkbox', defaultValue: true },
      { id: 'saf-cleaning', label: 'Pulizia e Sgombero Aree Lavoro', type: 'checkbox', defaultValue: true },
      { id: 'saf-emergency', label: 'Gestione Emergenze e Antincendio', type: 'checkbox', defaultValue: true }
    ]
  },
  // INTERNAL (14)
  {
    id: 'int-demolition',
    name: 'Demolizioni e Rimozioni',
    icon: 'Hammer',
    type: 'internal',
    description: 'Rimozione di pareti, pavimenti, rivestimenti e vecchi impianti.',
    defaultWbs: ["Demolizioni e rimozioni", "Smaltimento macerie a discarica"],
    conditionalNote: "L'intervento prevede la demolizione totale o parziale di tramezzature interne e la rimozione dei rivestimenti esistenti.",
    subOptions: [
      { id: 'dem-walls', label: 'Demolizione Tramezzi', type: 'number', unit: 'mq', defaultValue: 0, 
        safetyInfo: 'Utilizzo obbligatorio di DPI: occhiali, guanti, scarpe antinfortunistiche e mascherina FFP3. Verificare l\'assenza di impianti sottotraccia (elettrici/idrici) prima di iniziare. Puntellamento se necessario.',
        installationInfo: 'Demolizione controllata dall\'alto verso il basso. Bagnare le macerie per limitare la polvere. Separazione dei materiali per lo smaltimento differenziato.'
      },
      { id: 'dem-floors', label: 'Rimozione Pavimenti', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Pericolo di schegge: occhiali protettivi e guanti antitaglio obbligatori. Attenzione alle posture durante il lavoro manuale.',
        installationInfo: 'Rimozione completa fino al massetto. Pulizia accurata del supporto per la successiva posa.'
      },
      { id: 'dem-screed', label: 'Rimozione Massetto', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dem-tiles', label: 'Rimozione Rivestimenti Bagno/Cucina', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dem-plaster', label: 'Scrostatura Intonaci', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dem-doors', label: 'Rimozione Porte Interne', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dem-windows', label: 'Rimozione Infissi Esterni', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dem-sanitary', label: 'Rimozione Sanitari', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dem-electric', label: 'Rimozione Impianto Elettrico', type: 'checkbox', defaultValue: false },
      { id: 'dem-plumbing', label: 'Rimozione Impianto Idraulico', type: 'checkbox', defaultValue: false }
    ]
  },
  {
    id: 'int-masonry',
    name: 'Opere Murarie',
    icon: 'BrickWall',
    type: 'internal',
    description: 'Costruzione di nuove pareti, tramezzi e assistenze murarie.',
    defaultWbs: ["Opere edili e tramezzature", "Assistenze murarie agli impianti"],
    conditionalNote: "Si prevede la realizzazione di nuove partizioni interne in laterizio o cartongesso e relative opere di finitura.",
    subOptions: [
      { id: 'mas-brick-8', label: 'Tramezzi Forati (8cm)', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Movimentazione carichi: attenzione al peso dei pacchi di mattoni. Utilizzo di guanti e scarpe antinfortunistiche.',
        installationInfo: 'Posa perfettamente a piombo e in bolla. Utilizzo di malta cementizia idonea. Inserimento di connettori metallici alle pareti esistenti ogni 3-4 corsi.'
      },
      { id: 'mas-screed', label: 'Realizzazione Massetto', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Contatto con cemento: utilizzare guanti impermeabili per evitare dermatiti. Protezione degli occhi durante la miscelazione.',
        installationInfo: 'Verifica delle quote e delle pendenze. Inserimento di rete elettrosaldata se necessario. Giunti di dilatazione per superfici > 30mq.'
      },
      { id: 'mas-self-level', label: 'Autolivellante', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'mas-lintels', label: 'Posa Architravi', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'mas-holes', label: 'Carotaggi/Fori ventilazione', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'mas-assist-ele', label: 'Assistenze Murarie Elettriche', type: 'checkbox', defaultValue: true },
      { id: 'mas-assist-plu', label: 'Assistenze Murarie Idrauliche', type: 'checkbox', defaultValue: true },
      { id: 'mas-insulation', label: 'Isolamento Intercapedine', type: 'number', unit: 'mq', defaultValue: 0 }
    ]
  },
  {
    id: 'int-electric',
    name: 'Impianto Elettrico',
    icon: 'Zap',
    type: 'internal',
    description: 'Rifacimento completo o parziale dell\'impianto elettrico e domotica.',
    defaultWbs: ["Impianto Elettrico a norma", "Punti luce e frutti", "Quadro elettrico generale"],
    conditionalNote: "L'impianto elettrico sarà rifatto integralmente secondo le normative vigenti, inclusa la predisposizione per domotica.",
    subOptions: [
      { id: 'ele-points', label: 'Punti Luce/Prese', type: 'number', unit: 'cad', defaultValue: 0,
        safetyInfo: 'Lavorare in assenza di tensione. Utilizzo di attrezzi isolati (1000V). Verifica della messa a terra.',
        installationInfo: 'Posa dei corrugati sottotraccia. Cablaggio con cavi di sezione adeguata (1.5mmq per luci, 2.5mmq per prese). Chiusura scatole portafrutti.'
      },
      { id: 'ele-lan', label: 'Punti Rete LAN', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'ele-tv', label: 'Punti TV', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'ele-board', label: 'Quadro Elettrico (Moduli)', type: 'number', unit: 'n°', defaultValue: 12,
        safetyInfo: 'Installazione da parte di personale qualificato. Protezione contro i contatti diretti. Etichettatura chiara degli interruttori.',
        installationInfo: 'Montaggio su guida DIN. Collegamento differenziali e magnetotermici. Test di scatto del salvavita.'
      },
      { id: 'ele-intercom', label: 'Citofono/Videocitofono', type: 'select', options: ['Nessuno', 'Citofono', 'Videocitofono'], defaultValue: 'Videocitofono' },
      { id: 'ele-alarm', label: 'Predisposizione Allarme', type: 'checkbox', defaultValue: false },
      { id: 'ele-ac-prep', label: 'Predisposizione Clima (Elettr.)', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'ele-induction', label: 'Linea Induzione Cucina', type: 'checkbox', defaultValue: true },
      { id: 'ele-ground', label: 'Impianto di Terra', type: 'checkbox', defaultValue: true },
      { id: 'ele-series', label: 'Serie Frutti', type: 'select', options: ['Standard', 'Media', 'Prestige'], defaultValue: 'Media' }
    ]
  },
  {
    id: 'int-plumbing',
    name: 'Impianto Idraulico',
    icon: 'Droplets',
    type: 'internal',
    description: 'Rifacimento tubazioni idriche, scarichi e impianto gas.',
    defaultWbs: ["Impianto Idrico-Sanitario", "Scarichi e collettori", "Impianto Gas certificato"],
    conditionalNote: "Si prevede la sostituzione completa delle tubazioni di carico e scarico e il rifacimento dei punti acqua.",
    subOptions: [
      { id: 'plu-points-water', label: 'Punti Acqua (Carico/Scarico)', type: 'number', unit: 'cad', defaultValue: 0,
        safetyInfo: 'Attenzione alle polveri durante le tracce. Utilizzo di guanti e occhiali. Verifica stabilità delle pareti.',
        installationInfo: 'Posa tubazioni in multistrato o polipropilene. Rispetto delle pendenze per gli scarichi (min 1%). Prove di tenuta in pressione prima della chiusura tracce.'
      },
      { id: 'plu-gas-points', label: 'Punti Gas', type: 'number', unit: 'cad', defaultValue: 0,
        safetyInfo: 'Normativa UNI 7129. Prova di tenuta obbligatoria con manometro. Ventilazione dei locali.',
        installationInfo: 'Utilizzo di tubazioni in rame o acciaio inox. Posa sottotraccia con guaina ventilata se necessario.'
      },
      { id: 'plu-manifold', label: 'Collettore Idrico', type: 'number', unit: 'cad', defaultValue: 1 },
      { id: 'plu-drain-main', label: 'Colonna di Scarico Principale', type: 'checkbox', defaultValue: false },
      { id: 'plu-kitchen-prep', label: 'Predisposizione Cucina', type: 'checkbox', defaultValue: true },
      { id: 'plu-laundry-prep', label: 'Predisposizione Lavanderia', type: 'checkbox', defaultValue: false },
      { id: 'plu-external-tap', label: 'Rubinetto Esterno', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'plu-softener', label: 'Predisposizione Addolcitore', type: 'checkbox', defaultValue: false },
      { id: 'plu-autoclave', label: 'Predisposizione Autoclave', type: 'checkbox', defaultValue: false },
      { id: 'plu-material', label: 'Materiale Tubazioni', type: 'select', options: ['Multistrato', 'Rame', 'Polipropilene'], defaultValue: 'Multistrato' }
    ]
  },
  {
    id: 'int-heating',
    name: 'Riscaldamento e Clima',
    icon: 'Thermometer',
    type: 'internal',
    description: 'Installazione caldaie, condizionatori, radiatori o radiante.',
    defaultWbs: ["Impianto di Riscaldamento", "Climatizzazione estiva", "Caldaia/Pompa di calore"],
    conditionalNote: "L'intervento include l'adeguamento o il rifacimento del sistema di climatizzazione e riscaldamento.",
    subOptions: [
      { id: 'heat-radiators', label: 'Numero Radiatori', type: 'number', unit: 'cad', defaultValue: 0,
        safetyInfo: 'Attenzione al peso dei radiatori (ghisa/acciaio). Utilizzo di scarpe antinfortunistiche e guanti.',
        installationInfo: 'Posa a piombo. Collegamento valvole e detentori. Prova di tenuta dell\'impianto prima della messa in funzione.'
      },
      { id: 'heat-boiler', label: 'Sostituzione Caldaia', type: 'select', options: ['Nessuna', 'Condensazione', 'Pompa di Calore', 'Ibrida'], defaultValue: 'Condensazione',
        safetyInfo: 'Verifica corretta evacuazione fumi. Collegamento elettrico a norma. Verifica assenza perdite gas.',
        installationInfo: 'Installazione secondo manuale produttore. Lavaggio impianto obbligatorio. Prima accensione da tecnico autorizzato.'
      },
      { id: 'heat-ac-split', label: 'Unità Interne Clima (Split)', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'heat-ac-ext', label: 'Unità Esterna Clima', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'heat-thermostat', label: 'Cronotermostati Smart', type: 'number', unit: 'cad', defaultValue: 1 },
      { id: 'heat-valves', label: 'Valvole Termostatiche', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'heat-flush', label: 'Lavaggio Impianto', type: 'checkbox', defaultValue: true },
      { id: 'heat-material', label: 'Materiale Tubazioni', type: 'select', options: ['Multistrato', 'Rame Coibentato'], defaultValue: 'Multistrato' }
    ]
  },
  {
    id: 'int-floors',
    name: 'Pavimenti e Rivestimenti',
    icon: 'LayoutGrid',
    type: 'internal',
    description: 'Posa di ceramiche, parquet, laminati o resine.',
    defaultWbs: ["Posa pavimenti", "Rivestimenti bagno e cucina", "Battiscopa"],
    conditionalNote: "Si prevede la fornitura e posa di nuovi pavimenti e rivestimenti, inclusa la preparazione dei sottofondi.",
    subOptions: [
      { id: 'flo-area', label: 'Superficie Pavimento', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Movimentazione manuale dei carichi (pacchi piastrelle). Utilizzo di ginocchiere protettive. Attenzione ai tagli con la taglierina.',
        installationInfo: 'Verifica planarità del massetto. Posa con collante idoneo. Rispetto della fuga minima prevista dal produttore.'
      },
      { id: 'flo-tiles-bath', label: 'Rivestimento Bagni', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Utilizzo di occhiali durante il taglio delle piastrelle. Guanti protettivi.',
        installationInfo: 'Posa a colla. Verifica del piombo delle pareti. Stuccatura delle fughe con sigillante idrorepellente.'
      },
      { id: 'flo-tiles-kit', label: 'Rivestimento Cucina', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'flo-skirting', label: 'Battiscopa', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'flo-thresholds', label: 'Soglie Marmo/Pietra', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'flo-large-format', label: 'Grandi Formati (>60x60)', type: 'checkbox', defaultValue: false },
      { id: 'flo-parquet-glue', label: 'Incollatura Parquet', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'flo-laminate', label: 'Posa Laminato', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'flo-primer', label: 'Primer Consolidante', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'flo-joints', label: 'Giunti di Dilatazione', type: 'number', unit: 'cad', defaultValue: 0 }
    ]
  },
  {
    id: 'int-plaster',
    name: 'Intonaci e Rasature',
    icon: 'Paintbrush',
    type: 'internal',
    description: 'Ripristino pareti, intonaci deumidificanti e rasature a gesso.',
    defaultWbs: ["Intonaci interni", "Rasatura pareti e soffitti"],
    conditionalNote: "Le pareti saranno trattate con rasatura a gesso o intonaco civile per una finitura liscia e pronta alla pittura.",
    subOptions: [
      { id: 'pla-walls', label: 'Intonaco Pareti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-ceilings', label: 'Intonaco Soffitti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-skim-walls', label: 'Rasatura Pareti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-skim-ceil', label: 'Rasatura Soffitti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-corners', label: 'Paraspigoli Zincati', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'pla-mesh', label: 'Rete in Fibra di Vetro', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-dehumid', label: 'Intonaco Deumidificante', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-gypsum', label: 'Intonaco a Gesso', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-cement', label: 'Intonaco Cementizio', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pla-scaffold', label: 'Ponteggio Interno (>3m)', type: 'checkbox', defaultValue: false }
    ]
  },
  {
    id: 'int-painting',
    name: 'Tinteggiatura e Decori',
    icon: 'Palette',
    type: 'internal',
    description: 'Pittura pareti, smalti, decorazioni e carte da parati.',
    defaultWbs: ["Pittura pareti e soffitti", "Opere di decorazione"],
    conditionalNote: "Si prevede la tinteggiatura di tutti gli ambienti con pittura lavabile o traspirante di alta qualità.",
    subOptions: [
      { id: 'pai-area-walls', label: 'Pittura Pareti', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Ventilazione dei locali durante e dopo l\'applicazione. Utilizzo di scale a norma. Protezione delle vie respiratorie se necessario.',
        installationInfo: 'Preparazione del supporto (stuccatura e carteggiatura). Applicazione di fissativo. Almeno due mani di pittura di qualità.'
      },
      { id: 'pai-area-ceil', label: 'Pittura Soffitti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pai-primer', label: 'Fissativo/Primer', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pai-mould', label: 'Trattamento Antimuffa', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pai-enamel', label: 'Smalto Murale', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pai-wallpaper', label: 'Carta da Parati', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pai-stucco', label: 'Stucco Veneziano/Decorativo', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'pai-radiators', label: 'Verniciatura Radiatori', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'pai-pipes', label: 'Verniciatura Tubazioni', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'pai-protection', label: 'Protezione Pavimenti/Arredi', type: 'checkbox', defaultValue: true }
    ]
  },
  {
    id: 'int-drywall',
    name: 'Cartongesso e Controsoffitti',
    icon: 'Layers',
    type: 'internal',
    description: 'Velette estetiche, controsoffitti tecnici e isolamenti.',
    defaultWbs: ["Controsoffitti in cartongesso", "Velette e nicchie estetiche"],
    conditionalNote: "Realizzazione di controsoffittature per alloggiamento impianti o fini estetici con lastre in cartongesso.",
    subOptions: [
      { id: 'dry-ceil-flat', label: 'Controsoffitto Piano', type: 'number', unit: 'mq', defaultValue: 0,
        safetyInfo: 'Lavoro in quota: utilizzo di trabattelli o scale a norma. Occhiali protettivi per il fissaggio a soffitto.',
        installationInfo: 'Tracciamento quote con laser. Fissaggio pendini a interasse corretto. Doppia orditura metallica. Stuccatura dei giunti con rete.'
      },
      { id: 'dry-ceil-hydro', label: 'Controsoffitto Idro (Bagni)', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dry-walls', label: 'Contropareti Isolanti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dry-velette', label: 'Velette Lineari', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'dry-velette-curved', label: 'Velette Curve', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'dry-led', label: 'Gole per LED', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'dry-insulation', label: 'Lana di Roccia Interna', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dry-double-plate', label: 'Doppia Lastra', type: 'checkbox', defaultValue: false },
      { id: 'dry-fire', label: 'Lastre Ignifughe (REI)', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'dry-structure', label: 'Struttura Rinforzata', type: 'checkbox', defaultValue: false }
    ]
  },
  {
    id: 'int-doors',
    name: 'Porte e Infissi Interni',
    icon: 'DoorOpen',
    type: 'internal',
    description: 'Sostituzione porte a battente, scorrevoli o a libro.',
    defaultWbs: ["Fornitura e posa porte interne", "Controtelai per scorrevoli"],
    conditionalNote: "Sostituzione integrale delle porte interne con nuovi modelli coordinati all'arredo.",
    subOptions: [
      { id: 'doo-swing', label: 'Porte a Battente', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'doo-slide-int', label: 'Porte Scorrevoli Interno Muro', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'doo-slide-ext', label: 'Porte Scorrevoli Esterno Muro', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'doo-folding', label: 'Porte a Libro', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'doo-scrigno', label: 'Posa Controtelai (Scrigno)', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'doo-armored', label: 'Porta Blindata Ingresso', type: 'checkbox', defaultValue: true },
      { id: 'doo-handles', label: 'Maniglie Premium', type: 'checkbox', defaultValue: false },
      { id: 'doo-trim', label: 'Mostrine/Coprifili', type: 'checkbox', defaultValue: true },
      { id: 'doo-adjust', label: 'Rifilatura Porte Esistenti', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'doo-material', label: 'Materiale', type: 'select', options: ['Laminato', 'Legno', 'Vetro'], defaultValue: 'Laminato' }
    ]
  },
  {
    id: 'int-bathroom-full',
    name: 'Rifacimento Bagno Completo',
    icon: 'Bath',
    type: 'internal',
    description: 'Intervento chiavi in mano per il bagno.',
    defaultWbs: ["Sanitari e rubinetterie", "Box doccia/Vasca", "Accessori bagno"],
    conditionalNote: "Ristrutturazione integrale del locale bagno, inclusi impianti, rivestimenti e montaggio sanitari.",
    subOptions: [
      { id: 'bat-wc', label: 'Vaso (WC)', type: 'select', options: ['A terra', 'Filo muro', 'Sospeso'], defaultValue: 'Filo muro',
        safetyInfo: 'Attenzione alla movimentazione di ceramiche pesanti. Utilizzo di guanti.',
        installationInfo: 'Posa con silicone sigillante alla base. Per i sospesi, verifica tenuta della staffa a muro. Collegamento cassetta di scarico.'
      },
      { id: 'bat-shower-tray', label: 'Piatto Doccia', type: 'select', options: ['Standard', 'Filo Pavimento', 'Walk-in'], defaultValue: 'Standard',
        safetyInfo: 'Superficie scivolosa durante la posa. Attenzione agli spigoli.',
        installationInfo: 'Verifica pendenza verso lo scarico. Sigillatura perimetrale con silicone antimuffa. Impermeabilizzazione sottostante.'
      },
      { id: 'bat-shower-box', label: 'Box Doccia (Cristallo)', type: 'checkbox', defaultValue: true },
      { id: 'bat-tub', label: 'Vasca da Bagno', type: 'checkbox', defaultValue: false },
      { id: 'bat-taps', label: 'Rubinetteria (Set)', type: 'number', unit: 'n°', defaultValue: 1 },
      { id: 'bat-waterproof', label: 'Impermeabilizzazione (Mapelastic)', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'bat-mirror', label: 'Specchio e Illuminazione', type: 'checkbox', defaultValue: true },
      { id: 'bat-accessories', label: 'Set Accessori (Portasciugamani, ecc.)', type: 'checkbox', defaultValue: true }
    ]
  },
  {
    id: 'int-kitchen-full',
    name: 'Rifacimento Cucina',
    icon: 'ChefHat',
    type: 'internal',
    description: 'Adeguamento impianti e finiture per la zona cottura.',
    defaultWbs: ["Impianti cucina", "Rivestimento paraschizzi"],
    conditionalNote: "Adeguamento tecnico e formale della cucina per l'installazione di nuovi arredi ed elettrodomestici.",
    subOptions: [
      { id: 'kit-water-points', label: 'Punti Acqua Cucina', type: 'number', unit: 'cad', defaultValue: 1 },
      { id: 'kit-gas-point', label: 'Punto Gas Cucina', type: 'checkbox', defaultValue: true },
      { id: 'kit-ele-points', label: 'Punti Elettrici Dedicati', type: 'number', unit: 'cad', defaultValue: 4 },
      { id: 'kit-tiles', label: 'Rivestimento Paraschizzi', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'kit-drain', label: 'Spostamento Scarichi', type: 'checkbox', defaultValue: false },
      { id: 'kit-hood', label: 'Foro Cappa Aspirante', type: 'checkbox', defaultValue: true },
      { id: 'kit-dishwasher', label: 'Attacco Lavastoviglie', type: 'checkbox', defaultValue: true },
      { id: 'kit-fridge', label: 'Punto Acqua Frigo Side-by-Side', type: 'checkbox', defaultValue: false },
      { id: 'kit-lighting', label: 'Illuminazione Sottopensile', type: 'checkbox', defaultValue: false },
      { id: 'kit-layout', label: 'Configurazione', type: 'select', options: ['Lineare', 'Angolare', 'Isola'], defaultValue: 'Lineare' }
    ]
  },
  {
    id: 'int-insulation',
    name: 'Isolamento Interno',
    icon: 'ShieldCheck',
    type: 'internal',
    description: 'Cappotto interno o isolamento acustico pareti.',
    defaultWbs: ["Isolamento termico interno", "Isolamento acustico"],
    conditionalNote: "Miglioramento del comfort termo-acustico tramite l'applicazione di pannelli isolanti interni.",
    subOptions: [
      { id: 'ins-term-walls', label: 'Cappotto Termico Pareti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'ins-term-ceil', label: 'Isolamento Soffitto', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'ins-acoustic-walls', label: 'Isolamento Acustico Pareti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'ins-acoustic-ceil', label: 'Isolamento Acustico Soffitto', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'ins-material', label: 'Materiale', type: 'select', options: ['Lana di Roccia', 'Sughero', 'Polistirene', 'Fibra di Legno'], defaultValue: 'Lana di Roccia' },
      { id: 'ins-vapor', label: 'Barriera al Vapore', type: 'checkbox', defaultValue: true },
      { id: 'ins-finish', label: 'Finitura Cartongesso', type: 'checkbox', defaultValue: true },
      { id: 'ins-thickness', label: 'Spessore Pannelli', type: 'number', unit: 'mm', defaultValue: 40 },
      { id: 'ins-mould', label: 'Trattamento Antimuffa Preventivo', type: 'checkbox', defaultValue: false },
      { id: 'ins-corners', label: 'Nastri Sigillanti Angoli', type: 'checkbox', defaultValue: true }
    ]
  },
  {
    id: 'int-domotics',
    name: 'Domotica e Smart Home',
    icon: 'Cpu',
    type: 'internal',
    description: 'Automazione luci, tapparelle, clima e sicurezza.',
    defaultWbs: ["Sistema domotico integrato", "Configurazione e collaudo"],
    conditionalNote: "Integrazione di sistemi intelligenti per il controllo remoto e l'automazione dell'abitazione.",
    subOptions: [
      { id: 'dom-hub', label: 'Centrale/Hub Domotico', type: 'checkbox', defaultValue: true },
      { id: 'dom-lights', label: 'Controllo Luci Smart', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dom-shutters', label: 'Controllo Tapparelle Smart', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dom-climate', label: 'Controllo Clima Smart', type: 'checkbox', defaultValue: true },
      { id: 'dom-security', label: 'Sistema Antifurto Integrato', type: 'checkbox', defaultValue: false },
      { id: 'dom-cameras', label: 'Telecamere IP', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dom-voice', label: 'Integrazione Assistenti Vocali', type: 'checkbox', defaultValue: true },
      { id: 'dom-sensors', label: 'Sensori Allagamento/Fumo', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'dom-energy', label: 'Monitoraggio Consumi', type: 'checkbox', defaultValue: false },
      { id: 'dom-protocol', label: 'Protocollo', type: 'select', options: ['Zigbee', 'Z-Wave', 'KNX', 'Wi-Fi'], defaultValue: 'Zigbee' }
    ]
  },

  // EXTERNAL (6)
  {
    id: 'ext-facade-restoration',
    name: 'Restauro Facciata',
    icon: 'Home',
    type: 'external',
    description: 'Pulizia, ripristino intonaci e pittura esterna.',
    defaultWbs: ["Allestimento ponteggio", "Ripristino intonaci esterni", "Pittura facciata"],
    conditionalNote: "Intervento di manutenzione straordinaria delle facciate esterne con ripristino delle parti ammalorate.",
    subOptions: [
      { id: 'fac-area', label: 'Superficie Facciata', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'fac-cleaning', label: 'Idrolavaggio/Pulizia', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'fac-plaster-fix', label: 'Ripristino Intonaco Ammalorato', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'fac-cracks', label: 'Sigillatura Crepe', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'fac-painting', label: 'Pittura al Quarzo/Silossanica', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'fac-scaffold', label: 'Noleggio Ponteggio', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'fac-balconies', label: 'Ripristino Frontalini Balconi', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'fac-sills', label: 'Pulizia Davanzali', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'fac-downspouts', label: 'Sostituzione Pluviali', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'fac-base', label: 'Zoccolatura in Pietra', type: 'number', unit: 'mq', defaultValue: 0 }
    ]
  },
  {
    id: 'ext-thermal-coat',
    name: 'Cappotto Termico Esterno',
    icon: 'ThermometerSnowflake',
    type: 'external',
    description: 'Isolamento termico a cappotto certificato.',
    defaultWbs: ["Posa pannelli isolanti", "Rasatura armata esterna", "Finitura a spessore"],
    conditionalNote: "Efficientamento energetico dell'edificio tramite l'applicazione di sistema a cappotto esterno.",
    subOptions: [
      { id: 'coa-area', label: 'Superficie Cappotto', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'coa-material', label: 'Materiale Isolante', type: 'select', options: ['EPS Bianco', 'EPS Grafite', 'Lana di Roccia', 'Sughero'], defaultValue: 'EPS Grafite' },
      { id: 'coa-thick', label: 'Spessore Pannello', type: 'number', unit: 'mm', defaultValue: 120 },
      { id: 'coa-mesh', label: 'Rete di Rinforzo', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'coa-anchors', label: 'Tassellatura Meccanica', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'coa-corners', label: 'Angolari con Rete', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'coa-finish', label: 'Rivestimento Silossanico', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'coa-sills-ext', label: 'Allungamento Davanzali', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'coa-fixtures', label: 'Spostamento Cardini/Pluviali', type: 'checkbox', defaultValue: true },
      { id: 'coa-scaffold', label: 'Ponteggio Esterno', type: 'number', unit: 'mq', defaultValue: 0 }
    ]
  },
  {
    id: 'ext-roof-renovation',
    name: 'Rifacimento Tetto',
    icon: 'ArrowUpFromLine',
    type: 'external',
    description: 'Sostituzione tegole, guaine e lattoneria.',
    defaultWbs: ["Rimozione vecchia copertura", "Nuova impermeabilizzazione tetto", "Posa tegole/coppi"],
    conditionalNote: "Rifacimento integrale della copertura per garantire impermeabilità e isolamento del sottotetto.",
    subOptions: [
      { id: 'roo-area', label: 'Superficie Tetto', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'roo-removal', label: 'Rimozione Vecchia Copertura', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'roo-insulation', label: 'Pannelli Isolanti Tetto', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'roo-membrane', label: 'Guaina Impermeabilizzante', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'roo-tiles', label: 'Posa Tegole/Coppi', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'roo-gutters', label: 'Canaline/Grondaie', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'roo-flashing', label: 'Lattoneria/Scossaline', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'roo-chimney', label: 'Ripristino Comignoli', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'roo-skylight', label: 'Posa Lucernari (Velux)', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'roo-lifeline', label: 'Linea Vita Certificata', type: 'checkbox', defaultValue: true }
    ]
  },
  {
    id: 'ext-balconies-restoration',
    name: 'Rifacimento Balconi',
    icon: 'SquareDashedBottom',
    type: 'external',
    description: 'Impermeabilizzazione e pavimentazione balconi.',
    defaultWbs: ["Impermeabilizzazione balconi", "Posa pavimenti esterni"],
    conditionalNote: "Ripristino funzionale ed estetico dei balconi, inclusa la tenuta idraulica e i frontalini.",
    subOptions: [
      { id: 'bal-qty', label: 'Numero Balconi', type: 'number', unit: 'cad', defaultValue: 1 },
      { id: 'bal-area', label: 'Superficie Totale', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'bal-removal', label: 'Rimozione Pavimento Esistente', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'bal-waterproof', label: 'Guaina Liquida Elastica', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'bal-tiles', label: 'Posa Pavimento Esterno', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'bal-fronts', label: 'Ripristino Frontalini', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'bal-drip', label: 'Gocciolatoi/Profili', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'bal-railings', label: 'Verniciatura Ringhiere', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'bal-underside', label: 'Pittura Sottobalconi', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'bal-thresholds', label: 'Sostituzione Soglie', type: 'number', unit: 'cad', defaultValue: 0 }
    ]
  },
  {
    id: 'ext-external-windows',
    name: 'Infissi Esterni e Persiane',
    icon: 'Window',
    type: 'external',
    description: 'Sostituzione finestre, persiane e avvolgibili.',
    defaultWbs: ["Sostituzione infissi esterni", "Persiane e sistemi oscuranti"],
    conditionalNote: "Sostituzione dei serramenti esterni per il miglioramento del risparmio energetico e della sicurezza.",
    subOptions: [
      { id: 'win-qty-windows', label: 'Numero Finestre', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-qty-doors', label: 'Numero Porte-Finestre', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-material', label: 'Materiale Infissi', type: 'select', options: ['PVC', 'Alluminio', 'Legno', 'Legno/Alluminio'], defaultValue: 'PVC' },
      { id: 'win-glass', label: 'Tipo Vetro', type: 'select', options: ['Doppio Vetro', 'Triplo Vetro', 'Antisfondamento'], defaultValue: 'Doppio Vetro' },
      { id: 'win-shutters', label: 'Persiane/Scuri', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-rollers', label: 'Avvolgibili (Tapparelle)', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-motors', label: 'Motorizzazione Tapparelle', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-mosquito', label: 'Zanzariere', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-boxes', label: 'Coibentazione Cassonetti', type: 'number', unit: 'cad', defaultValue: 0 },
      { id: 'win-sill-ext', label: 'Posa Nuovi Davanzali', type: 'number', unit: 'cad', defaultValue: 0 }
    ]
  },
  {
    id: 'ext-waterproofing',
    name: 'Impermeabilizzazioni Terrazzi',
    icon: 'Umbrella',
    type: 'external',
    description: 'Trattamenti contro infiltrazioni su terrazzi piani.',
    defaultWbs: ["Rimozione pavimentazione", "Guaine bituminose/liquide", "Nuovo massetto e posa"],
    conditionalNote: "Intervento radicale per la risoluzione di infiltrazioni d'acqua da terrazzi o lastrici solari.",
    subOptions: [
      { id: 'wat-area', label: 'Superficie Terrazzo', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-removal', label: 'Demolizione Totale', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-screed', label: 'Massetto di Pendenza', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-membrane-1', label: 'Primo Strato Guaina', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-membrane-2', label: 'Secondo Strato Guaina', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-tiles-ext', label: 'Posa Pavimento Galleggiante/Incollato', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-drains', label: 'Bocchettoni di Scarico', type: 'number', unit: 'cad', defaultValue: 2 },
      { id: 'wat-perimeter', label: 'Risvolti Perimetrali', type: 'number', unit: 'ml', defaultValue: 0 },
      { id: 'wat-insulation', label: 'Pannelli Termoisolanti', type: 'number', unit: 'mq', defaultValue: 0 },
      { id: 'wat-test', label: 'Prova di Allagamento', type: 'checkbox', defaultValue: true }
    ]
  }
];

