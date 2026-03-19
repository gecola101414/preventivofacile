import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  FileText, 
  MapPin, 
  Ruler, 
  Send, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  FolderOpen,
  Search,
  X,
  Edit2,
  Mic,
  MicOff,
  Upload,
  Volume2,
  Briefcase,
  Calendar,
  Settings,
  Shield,
  Wrench
} from 'lucide-react';
import { cn } from './lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI, Type } from "@google/genai";

import { RENOVATION_SECTORS, RenovationSector, SectorSubOption } from './constants';
import * as Icons from 'lucide-react';

// Component for adding a new sector to avoid full-app re-renders on every keystroke
const AddSectorForm = ({ onAdd, onCancel, isGenerating }: { onAdd: (name: string) => void, onCancel: () => void, isGenerating: boolean }) => {
  const [name, setName] = useState('');
  return (
    <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 mb-8 w-full">
      <h4 className="text-sm font-bold text-emerald-800 mb-4 uppercase tracking-wider">Nuovo Settore Personalizzato</h4>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es: Domotica, Giardino, Piscina..."
          className="flex-1 bg-white border-emerald-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={() => onAdd(name)}
            disabled={isGenerating || !name.trim()}
            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generazione...
              </>
            ) : (
              'Crea Settore'
            )}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-white text-emerald-600 border border-emerald-100 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-all"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkGroupModal = ({ 
  isOpen, 
  onClose, 
  categories, 
  onUpdate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  categories: string[]; 
  onUpdate: (newCategories: string[]) => void;
}) => {
  const [localCategories, setLocalCategories] = useState<string[]>(categories);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (isOpen) setLocalCategories(categories);
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const addCategory = () => {
    if (newCategory.trim() && !localCategories.includes(newCategory.trim())) {
      setLocalCategories([...localCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const removeCategory = (index: number) => {
    setLocalCategories(localCategories.filter((_, i) => i !== index));
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newArr = [...localCategories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newArr.length) {
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      setLocalCategories(newArr);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-6 bg-emerald-600 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Gestione Gruppi di Lavoro</h3>
            <p className="text-emerald-100/80 text-xs font-medium">Organizza l'ordine e le categorie del preventivo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="flex gap-2">
            <input 
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              placeholder="Aggiungi nuovo gruppo (es: Opere Esterne)..."
              className="flex-1 bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
            <button 
              onClick={addCategory}
              className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {localCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => moveCategory(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                  >
                    <Icons.ChevronUp size={14} />
                  </button>
                  <button 
                    onClick={() => moveCategory(idx, 'down')}
                    disabled={idx === localCategories.length - 1}
                    className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-20"
                  >
                    <Icons.ChevronDown size={14} />
                  </button>
                </div>
                <span className="flex-1 text-sm font-bold text-slate-700">{cat}</span>
                <button 
                  onClick={() => removeCategory(idx)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-sm"
          >
            Annulla
          </button>
          <button 
            onClick={() => {
              onUpdate(localCategories);
              onClose();
            }}
            className="flex-[2] py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-sm shadow-lg shadow-emerald-600/20"
          >
            Salva Ordinamento
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SubGroupModal = ({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (label: string) => void;
}) => {
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6 bg-slate-800 text-white flex items-center justify-between">
          <h3 className="text-lg font-bold">Nuovo Sottogruppo</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <input 
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && label.trim() && (onAdd(label.trim()), setLabel(''), onClose())}
            placeholder="Nome del sottogruppo..."
            className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            autoFocus
          />
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
            >
              Annulla
            </button>
            <button 
              onClick={() => {
                if (label.trim()) {
                  onAdd(label.trim());
                  setLabel('');
                  onClose();
                }
              }}
              className="flex-[2] py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-sm shadow-lg shadow-emerald-600/20"
            >
              Aggiungi
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  wbs: string;
  safetyInfo?: string;
  installationInfo?: string;
}

export interface PaymentTerm {
  label: string;
  percentage: number;
  amount: number;
}

export interface SiteDetails {
  floor: string;
  accessibility: string;
  siteStatus: string;
  liftAvailable: boolean;
  ztl: string;
  sqm?: string;
  bathrooms?: string;
  doors?: string;
  windows?: string;
  otherInfo: string;
  selectedSectors?: string[];
  sectorChoices?: Record<string, Record<string, any>>;
  siteNotes?: string;
}

export interface QuoteData {
  clientInfo: {
    name: string;
    address: string;
  };
  province: string;
  jobTitle: string;
  specifications: string;
  items: QuoteItem[];
  notes: string;
  estimatedDimensionsExplanation: string;
  totalAmount: number;
  siteDetails?: SiteDetails;
  paymentTerms?: PaymentTerm[];
  posGeneralInfo?: string;
  pdfData?: {
    jobTitle: string;
    specifications: string;
    items: QuoteItem[];
    notes: string;
    estimatedDimensionsExplanation: string;
    paymentTerms?: PaymentTerm[];
    posGeneralInfo?: string;
  };
}

export interface PriceReference {
  description: string;
  unitPrice: number;
  unit: string;
}

interface CompanyData {
  name: string;
  address: string;
  vatNumber: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  iban?: string;
}

interface SavedQuote {
  id: string;
  shortCode?: string; // e.g. "1/2024"
  name: string;
  date: string;
  data: QuoteData;
  inputs?: {
    siteAddress: string;
    description: string;
    dimensions?: string; // Legacy
    customPrompt?: string;
    clientName: string;
    wbsCategories?: string[];
    wbsDescriptions?: Record<string, string>;
    siteDetails?: SiteDetails;
  };
}

async function generateQuote(description: string, siteAddress: string, siteDetails: SiteDetails, customPrompt?: string, priceHistory?: any[], files?: any[], parsedFilesText?: string, customSectors?: RenovationSector[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chiave API mancante. Verifica la configurazione nelle impostazioni.");
  }
  const ai = new GoogleGenAI({ apiKey: (apiKey as string) });
  const model = "gemini-3-flash-preview";
  
  const historyContext = priceHistory && priceHistory.length > 0 
    ? `\n\nRIFERIMENTI PREZZI STORICI (Usa questi prezzi se le voci sono simili a quelle richieste):\n${priceHistory.map((h: any) => `- ${h.description}: €${h.unitPrice}/${h.unit}`).join('\n')}`
    : "";

  const parsedFilesContext = parsedFilesText 
    ? `\n\nDATI ESTRATTI DAI FILE CARICATI:\n${parsedFilesText}`
    : "";

  const sectorsToUse = customSectors || RENOVATION_SECTORS;
  const selectedSectorsData = sectorsToUse.filter(s => siteDetails.selectedSectors?.includes(s.id));
  const sectorNotes = selectedSectorsData.map(s => {
    const choices = siteDetails.sectorChoices?.[s.id];
    let details = "";
    if (choices && s.subOptions) {
      details = s.subOptions.map(opt => {
        const choice = choices[opt.id];
        if (!choice || !choice.enabled) return null;
        const val = choice.value;
        if (opt.type === 'checkbox') return opt.label;
        if (opt.type === 'number' && (val === 0 || val === '')) return `${opt.label}: (Quantità da stimare)`;
        return `${opt.label}: ${val}${opt.unit ? ' ' + opt.unit : ''}`;
      }).filter(Boolean).join(', ');
    }
    return `- ${s.name}: ${s.conditionalNote}${details ? ` (Dettagli: ${details})` : ""}`;
  }).join('\n');

  const siteDetailsContext = `
    DATI GENERALI DEL CANTIERE:
    - Piano: ${siteDetails.floor}
    - Accessibilità: ${siteDetails.accessibility}
    - Stato del cantiere: ${siteDetails.siteStatus}
    - Ascensore disponibile: ${siteDetails.liftAvailable ? "Sì" : "No"}
    - ZTL: ${siteDetails.ztl}
    - Misure: ${siteDetails.sqm ? `${siteDetails.sqm} mq` : "Non specificato"}, ${siteDetails.bathrooms ? `${siteDetails.bathrooms} bagni` : ""}, ${siteDetails.doors ? `${siteDetails.doors} porte` : ""}, ${siteDetails.windows ? `${siteDetails.windows} finestre` : ""}
    - Settori di Intervento Selezionati:
${sectorNotes}
    - Note Aggiuntive Inquadramento: ${siteDetails.siteNotes || "Nessuna"}
    - Altre informazioni: ${siteDetails.otherInfo}
  `;

  const textPart = {
    text: `
      Sei un esperto geometra e computista italiano. 
      Il tuo compito è generare un preventivo professionale e dettagliato per un lavoro edile.
      ${description ? `Basati su questa descrizione fornita: "${description}".` : "Basati sui dati estratti dai file allegati."}
      L'indirizzo del cantiere è: "${siteAddress}".

      ${siteDetailsContext}
      
      MANDATORIO - DATI ATTIVI SETTORI:
      I "Dettagli" forniti per ogni settore di intervento (es. "Demolizione Tramezzi: 15 mq", "Punti Luce: 25 cad") sono DATI ATTIVI E REALI.
      DEVI generare le relative voci di computo metrico basandoti su queste quantità precise, anche se l'utente non ha scritto nulla nelle descrizioni WBS.
      Questi dati hanno la precedenza sulle stime generiche.

      IMPORTANTE: Analizza l'indirizzo fornito ("${siteAddress}") per determinarne la provincia e il comune. 
      Usa i prezzi medi di mercato coerenti con quella specifica area geografica (riferimento Prezziari Regionali o DEI).
      ${historyContext}
      ${parsedFilesContext}

      ${customPrompt ? `PRESCRIZIONI SPECIFICHE DELL'UTENTE PER QUESTO PREVENTIVO (MANDATORIE):\n"${customPrompt}"\nSegui rigorosamente queste istruzioni aggiuntive.` : ""}

      REGOLE SUI FILE CARICATI (PDF):
      Se è stato caricato un file PDF:
      1. DEVI considerare TUTTE le voci presenti nel documento.
      2. Crea il preventivo tenendo conto delle quantità indicate nel file e applicando un prezzo di mercato tale da garantire un utile del 20%.
      3. Eventuali integrazioni o descrizioni aggiuntive fornite dall'utente (es. tramite le categorie WBS) devono essere considerate come elementi aggiuntivi rispetto a quelli estratti dal PDF.

      REGOLE DI STRUTTURA (WBS):
      Usa PRIORITARIAMENTE le categorie WBS fornite nelle intestazioni "### Categoria" nel testo della descrizione. 
      Se l'utente ha rinominato le categorie, DEVI usare esattamente i nomi forniti nelle intestazioni.
      Mantieni l'ordine delle categorie così come appaiono nella descrizione.
      
      MANDATORIO - DIVISIONE IMPIANTI E ASSISTENZE:
      Se sono presenti lavori di impiantistica, NON usare una categoria generica "Impianti". 
      DEVI dividerli in:
      1. "Impianti Elettrici"
      2. "Impianti Idraulici e Riscaldamento"
      
      REGOLE AUTOMATICHE PER IMPIANTI:
      - Per OGNI categoria di impianto (Elettrico o Idraulico), DEVI SEMPRE aggiungere una voce separata ed esplicita riguardante le "assistenze murarie" (tracce, chiusura tracce, fori, ecc.) necessarie per la posa.
      - Per TUTTE le voci di impianto, DEVI indicare specifiche tecniche dettagliate dei materiali (es. marca/modello se possibile o caratteristiche tecniche precise come sezione cavi, tipologia tubazioni, ecc.).

      REGOLE DI NUMERAZIONE E ORDINE:
      Se la descrizione di una voce inizia con un numero seguito da un punto (es. "1. Demolizione...", "2. Rifacimento..."), 
      DEVI rispettare rigorosamente questa numerazione e l'ordine indicato nel preventivo finale.
      
      REGOLE DI CONTENUTO:
      1. Genera un "Capitolato Descrittivo" (campo 'specifications') estremamente tecnico e professionale. 
         Suddividilo internamente per categorie WBS (es. "IMPIANTO DI CANTIERE: ...", "DEMOLIZIONI: ...").
         Ogni punto o descrizione di lavoro deve iniziare su una NUOVA RIGA (usa il carattere \n).
         Se l'utente ha fornito una numerazione nelle descrizioni, riportala anche nel capitolato.
      2. Suddividi il lavoro in voci di computo metrico chiare, assegnando a ciascuna la relativa categoria 'wbs'.
      3. Per OGNI voce di computo metrico (array 'items'), DEVI generare:
         - 'description': Descrizione tecnica estremamente dettagliata, professionale e rigorosa della lavorazione. Includi specifiche sui materiali, fasi di esecuzione e riferimenti a standard di qualità. Evita assolutamente descrizioni brevi o generiche (es. NON scrivere "Rifacimento bagno", MA scrivi una descrizione tecnica completa di ogni fase). Sii prolisso e tecnico come se stessi scrivendo un capitolato d'appalto.
         - 'safetyInfo': Spiegazione tecnica MOLTO DETTAGLIATA dei rischi specifici e delle misure di sicurezza (DPI, apprestamenti, procedure) per quella lavorazione. Sii prolisso e tecnico.
         - 'installationInfo': Spiegazione tecnica MOLTO DETTAGLIATA della corretta posa in opera a regola d'arte per quella specifica voce, citando norme tecniche se applicabili. Sii prolisso e tecnico.
      4. Genera un campo 'posGeneralInfo' che contenga le informazioni generali di sicurezza del cantiere (organizzazione, recinzione, gestione emergenze, inquadramento normativo D.Lgs 81/08).
      5. Se hai stimato le misure, spiega brevemente i criteri di stima nel campo 'estimatedDimensionsExplanation'.
         Tieni conto dei DATI GENERALI DEL CANTIERE (piano, accessibilità, misure significative) per calcolare eventuali maggiorazioni per trasporto al piano o difficoltà di accesso.
         Le "Misure significative" fornite nei dati generali NON devono essere ripetute inutilmente nelle singole voci WBS se sono già state usate come base di calcolo generale.
      6. PRIORITÀ PREZZI (MANDATORIA): Se nel "RIFERIMENTI PREZZI STORICI" trovi voci identiche o molto simili, DEVI USARE QUEI PREZZI.
      7. Restituisci i dati in formato JSON.

      Il JSON deve avere questa struttura:
      {
        "jobTitle": "Titolo sintetico del lavoro",
        "province": "Provincia rilevata",
        "specifications": "Breve capitolato descrittivo dei lavori...",
        "posGeneralInfo": "Informazioni generali POS (organizzazione cantiere, rischi generali, emergenze)...",
        "items": [
          {
            "description": "Descrizione tecnica estremamente dettagliata e professionale della voce",
            "quantity": 10.5,
            "unit": "mq/mc/cad/m",
            "unitPrice": 25.0,
            "total": 262.5,
            "wbs": "Categoria WBS di appartenenza",
            "safetyInfo": "Dettagli sicurezza tecnici e specifici per questa voce...",
            "installationInfo": "Dettagli tecnici per la corretta posa a regola d'arte per questa voce..."
          }
        ],
        "notes": "Note legali standard, validità preventivo, esclusione IVA, ecc.",
        "estimatedDimensionsExplanation": "Spiegazione di come sono state calcolate le quantità stimate",
        "totalAmount": 0
      }
    `
  };

  const parts: any[] = [textPart];
  
  if (files && files.length > 0) {
    files.forEach((f: any) => {
      parts.push({
        inlineData: {
          mimeType: f.mimeType,
          data: f.data
        }
      });
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          province: { type: Type.STRING },
          specifications: { type: Type.STRING },
          posGeneralInfo: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING, description: "Descrizione tecnica estremamente dettagliata e professionale della voce" },
                quantity: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                unitPrice: { type: Type.NUMBER },
                total: { type: Type.NUMBER },
                wbs: { type: Type.STRING },
                safetyInfo: { type: Type.STRING },
                installationInfo: { type: Type.STRING }
              },
              required: ["description", "quantity", "unit", "unitPrice", "total", "wbs", "safetyInfo", "installationInfo"]
            }
          },
          notes: { type: Type.STRING },
          estimatedDimensionsExplanation: { type: Type.STRING },
          totalAmount: { type: Type.NUMBER }
        },
        required: ["jobTitle", "province", "specifications", "posGeneralInfo", "items", "notes", "estimatedDimensionsExplanation", "totalAmount"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response");
  }

  try {
    return JSON.parse(response.text);
  } catch (parseError) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Failed to parse AI response as JSON");
  }
}

const DictationButton = ({ onAppendText, isListening, onToggle }: { onAppendText: (text: string) => void, isListening: boolean, onToggle: () => void }) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "p-2 rounded-lg transition-all flex items-center justify-center shrink-0 h-10 w-10",
        isListening 
          ? "bg-red-100 text-red-600 shadow-sm shadow-red-500/20" 
          : "bg-black/5 text-black/40 hover:bg-emerald-100 hover:text-emerald-600"
      )}
      title={isListening ? "Ferma dettatura" : "Avvia dettatura vocale (rileva automaticamente la lingua)"}
    >
      {isListening ? (
        <div className="flex items-center justify-center gap-[3px] h-4 w-4">
          <div className="w-[3px] bg-red-600 rounded-full animate-eq"></div>
          <div className="w-[3px] bg-red-600 rounded-full animate-eq-delay-1"></div>
          <div className="w-[3px] bg-red-600 rounded-full animate-eq-delay-2"></div>
        </div>
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Qualcosa è andato storto</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            L'applicazione ha riscontrato un errore imprevisto. Prova a ricaricare la pagina o a ripristinare l'app se il problema persiste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
            >
              Ricarica Pagina
            </button>
            <button
              onClick={() => {
                if (confirm("Attenzione: questo cancellerà tutti i preventivi salvati localmente. Vuoi procedere?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors"
            >
              Ripristina App
            </button>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-gray-100 text-gray-900 px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Riprova
            </button>
          </div>
          {this.state.error && (
            <pre className="mt-8 p-4 bg-gray-50 rounded-lg text-left text-xs text-gray-500 max-w-full overflow-auto border border-gray-100">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

const ConfirmModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Conferma",
  cancelText = "Annulla",
  type = "danger"
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "primary" | "success";
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="bg-gray-50 p-4 flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 rounded-lg font-medium text-white transition-colors",
              type === "danger" ? "bg-red-600 hover:bg-red-700" : 
              type === "success" ? "bg-emerald-600 hover:bg-emerald-700" : 
              "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const InfoModal = ({ 
  title, 
  content, 
  type, 
  onClose,
  onSave
}: { 
  title: string; 
  content: string; 
  type: 'safety' | 'installation'; 
  onClose: () => void; 
  onSave?: (newContent: string) => void;
}) => {
  const [localContent, setLocalContent] = useState(content);
  
  useEffect(() => {
    setLocalContent(content);
  }, [content]);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col"
      >
        <div className={cn(
          "p-8 text-white flex items-center gap-5 shrink-0",
          type === 'safety' ? "bg-red-600" : "bg-blue-600"
        )}>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            {type === 'safety' ? <Icons.Shield size={28} /> : <Icons.Wrench size={28} />}
          </div>
          <div className="flex-1">
            <h4 className="font-black text-xl leading-tight uppercase tracking-tight">{title}</h4>
            <p className="text-white/80 text-sm font-medium">
              {type === 'safety' ? "Norme di Sicurezza e POS" : "Linee Guida Corretta Posa"}
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all">
            <Icons.X size={24} />
          </button>
        </div>
        
        <div className="p-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="prose prose-slate max-w-none">
            <div 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setLocalContent(e.currentTarget.innerText)}
              className="text-slate-700 leading-relaxed text-lg font-medium whitespace-pre-wrap focus:outline-none focus:bg-slate-50 rounded p-2 min-h-[100px]"
            >
              {localContent || "Informazioni non disponibili per questa voce."}
            </div>
          </div>
          
          {type === 'safety' && (
            <div className="mt-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
              <Icons.AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
              <p className="text-sm text-red-800 font-bold leading-snug">
                Queste informazioni verranno automaticamente integrate nel Piano Operativo di Sicurezza (POS) allegato al preventivo.
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              if (onSave) onSave(localContent);
              onClose();
            }}
            className="px-8 py-4 rounded-2xl font-black bg-slate-900 text-white hover:bg-black transition-all text-sm uppercase tracking-widest shadow-xl"
          >
            Salva e Chiudi
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SectorDetailsSubModal = ({ 
  sector, 
  initialChoices, 
  onSave, 
  onRemove, 
  onClose,
  onAddSubGroup
}: { 
  sector: any; 
  initialChoices: any; 
  onSave: (choices: any) => void; 
  onRemove: () => void; 
  onClose: () => void; 
  onAddSubGroup: (sectorId: string) => void;
}) => {
  const [localChoices, setLocalChoices] = useState(initialChoices || {});
  const [infoModal, setInfoModal] = useState<{ title: string; content: string; type: 'safety' | 'installation' } | null>(null);
  const Icon = (Icons as any)[sector.icon] || Icons.HelpCircle;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <AnimatePresence>
        {infoModal && (
          <InfoModal 
            title={infoModal.title}
            content={infoModal.content}
            type={infoModal.type}
            onClose={() => setInfoModal(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        <div className={cn(
          "p-6 text-white flex items-center gap-4 shrink-0",
          sector.type === 'internal' ? "bg-emerald-600" : "bg-blue-600"
        )}>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Icon size={24} />
          </div>
          <div>
            <h4 className="font-black text-lg leading-tight uppercase tracking-tight">{sector.name}</h4>
            <p className="text-white/70 text-xs font-medium">Configura i dettagli e consulta le schede tecniche</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 hover:bg-white/20 rounded-xl transition-all">
            <Icons.X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-blue-600/20"></span>
              Voci di Capitolato e Sicurezza
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              {sector.subOptions?.map((opt: any) => {
                const choice = localChoices[opt.id];
                const isEnabled = choice?.enabled ?? false;
                const value = choice?.value ?? opt.defaultValue;

                return (
                  <div 
                    key={opt.id} 
                    className={cn(
                      "flex flex-col gap-4 p-5 rounded-[2rem] border-2 transition-all duration-300",
                      isEnabled ? "bg-white border-emerald-500 shadow-xl shadow-emerald-100/50" : "bg-slate-50 border-slate-100 opacity-70 grayscale-[0.5]"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setLocalChoices((prev: any) => ({
                            ...prev,
                            [opt.id]: {
                              enabled: !isEnabled,
                              value: value
                            }
                          }));
                        }}
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 mt-1",
                          isEnabled ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-white border-2 border-slate-200 text-transparent"
                        )}
                      >
                        <Icons.Check size={18} strokeWidth={4} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <label className={cn(
                          "block text-base font-black truncate transition-colors mb-1",
                          isEnabled ? "text-slate-900" : "text-slate-400"
                        )}>
                          {opt.label}
                        </label>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => setInfoModal({ title: opt.label, content: opt.safetyInfo || '', type: 'safety' })}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                              isEnabled ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                            disabled={!isEnabled}
                          >
                            <Icons.Shield size={12} />
                            Sicurezza
                          </button>
                          <button
                            type="button"
                            onClick={() => setInfoModal({ title: opt.label, content: opt.installationInfo || '', type: 'installation' })}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                              isEnabled ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            )}
                            disabled={!isEnabled}
                          >
                            <Icons.Wrench size={12} />
                            Corretta Posa
                          </button>
                        </div>
                      </div>

                      {isEnabled && opt.type === 'number' && (
                        <div className="w-32 shrink-0">
                          <div className="relative">
                            <input
                              type="number"
                              placeholder="0"
                              value={value === 0 ? '' : value}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                setLocalChoices((prev: any) => ({
                                  ...prev,
                                  [opt.id]: { enabled: true, value: val }
                                }));
                              }}
                              className="w-full p-3 rounded-2xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring-0 text-sm font-black bg-emerald-50/30 pr-10"
                            />
                            {opt.unit && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-500 uppercase">
                                {opt.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {isEnabled && opt.type === 'select' && (
                      <div className="pl-12">
                        <select
                          value={value}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLocalChoices((prev: any) => ({
                              ...prev,
                              [opt.id]: { enabled: true, value: val }
                            }));
                          }}
                          className="w-full p-3 rounded-2xl border-2 border-emerald-100 focus:border-emerald-500 focus:ring-0 text-sm font-bold bg-emerald-50/30"
                        >
                          {opt.options?.map((o: string) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => onAddSubGroup(sector.id)}
            className="w-full p-5 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest"
          >
            <Icons.Plus size={20} />
            Aggiungi Voce Personalizzata
          </button>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onRemove}
            className="flex-1 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            <Icons.Trash2 size={16} />
            Rimuovi
          </button>
          <button
            type="button"
            onClick={() => onSave(localChoices)}
            className="flex-[2] py-3 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-900 transition-all text-sm shadow-lg shadow-slate-200"
          >
            Salva Dettagli
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const FormInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  className,
  required,
  id,
  autoFocus,
  onKeyDown
}: { 
  label?: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  type?: string;
  className?: string;
  required?: boolean;
  id?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={cn("space-y-1 w-full", !label && "space-y-0")}>
      {label && <label className="text-[10px] font-medium text-black/40 ml-1">{label}</label>}
      <input 
        id={id}
        type={type}
        placeholder={placeholder}
        value={localValue}
        autoFocus={autoFocus}
        required={required}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onChange(localValue)}
        onKeyDown={onKeyDown}
        className={className}
      />
    </div>
  );
};

const FormTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  id
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  className?: string;
  id?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <textarea 
      id={id}
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onChange(localValue)}
      className={className}
    />
  );
};

async function generateSingleItem(description: string, wbs: string, province: string): Promise<QuoteItem> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3-flash-preview";

  const response = await ai.models.generateContent({
    model,
    contents: [{
      parts: [{
        text: `
          Sei un esperto geometra italiano. 
          Genera una voce di computo metrico completa per la categoria WBS "${wbs}" basandoti su questa descrizione: "${description}".
          La provincia di riferimento è "${province}".
          Usa prezzi di mercato realistici per la zona indicata.
          Restituisci i dati in formato JSON con questa struttura:
          {
            "description": "Descrizione tecnica dettagliata e professionale",
            "quantity": 10.5,
            "unit": "mq/mc/cad/m",
            "unitPrice": 25.0,
            "total": 262.5,
            "wbs": "${wbs}",
            "safetyInfo": "Dettagli sicurezza tecnici e specifici per questa lavorazione...",
            "installationInfo": "Dettagli tecnici per la corretta posa in opera a regola d'arte..."
          }
        `
      }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          unitPrice: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
          wbs: { type: Type.STRING },
          safetyInfo: { type: Type.STRING },
          installationInfo: { type: Type.STRING }
        },
        required: ["description", "quantity", "unit", "unitPrice", "total", "wbs", "safetyInfo", "installationInfo"]
      }
    }
  });

  if (!response.text) throw new Error("AI returned empty response");
  return JSON.parse(response.text);
}

const AddItemAiModal = ({ 
  wbs, 
  province,
  onClose, 
  onAdd 
}: { 
  wbs: string; 
  province: string;
  onClose: () => void; 
  onAdd: (item: QuoteItem) => void;
}) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItem, setGeneratedItem] = useState<QuoteItem | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const item = await generateSingleItem(description, wbs, province);
      setGeneratedItem(item);
    } catch (error) {
      console.error("Failed to generate item", error);
      alert("Errore durante la generazione della voce. Riprova.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col"
      >
        <div className="p-8 bg-emerald-600 text-white flex items-center gap-5 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <Plus size={28} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-xl leading-tight uppercase tracking-tight text-white">Nuova Voce AI</h4>
            <p className="text-white/80 text-sm font-medium">Genera una voce completa per {wbs}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/20 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Descrizione Lavoro</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Es: Rifacimento intonaco pareti interne con malta cementizia..."
              className="w-full bg-slate-50 border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all min-h-[120px] resize-none"
            />
          </div>

          {!generatedItem && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="w-full py-4 rounded-2xl font-black bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <Icons.Sparkles size={20} />
                  Genera con AI
                </>
              )}
            </button>
          )}

          {generatedItem && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm font-bold text-emerald-900 leading-relaxed">{generatedItem.description}</p>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{generatedItem.quantity} {generatedItem.unit}</p>
                    <p className="text-lg font-black text-emerald-900">€ {generatedItem.total.toLocaleString('it-IT')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200/50">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/60 mb-1">Sicurezza</p>
                    <p className="text-[10px] text-emerald-800/70 line-clamp-2 italic">{generatedItem.safetyInfo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/60 mb-1">Posa</p>
                    <p className="text-[10px] text-emerald-800/70 line-clamp-2 italic">{generatedItem.installationInfo}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setGeneratedItem(null)}
                  className="flex-1 py-4 rounded-2xl font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
                >
                  Riprova
                </button>
                <button
                  onClick={() => onAdd(generatedItem)}
                  className="flex-[2] py-4 rounded-2xl font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20"
                >
                  Aggiungi al Preventivo
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [siteAddress, setSiteAddress] = useState('');
  const [siteDetails, setSiteDetails] = useState<SiteDetails>({
    floor: '',
    accessibility: '',
    siteStatus: '',
    liftAvailable: false,
    ztl: 'No',
    sqm: '',
    bathrooms: '',
    doors: '',
    windows: '',
    otherInfo: '',
    selectedSectors: [],
    sectorChoices: {},
    siteNotes: ''
  });
  const [description, setDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [addItemAiModal, setAddItemAiModal] = useState<{ isOpen: boolean; wbs: string }>({ isOpen: false, wbs: '' });
  console.log('App Render - Quote Items Length:', quote?.items?.length);
  const [error, setError] = useState<string | null>(null);
  
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [quoteName, setQuoteName] = useState<string>('');
  const [wbsCategories, setWbsCategories] = useState<string[]>([]);
  const [wbsDescriptions, setWbsDescriptions] = useState<Record<string, string>>({});
  const [vatRate, setVatRate] = useState<number>(22);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([
    { label: "Acconto alla firma", percentage: 30, amount: 0 },
    { label: "Stato Avanzamento Lavori (SAL)", percentage: 40, amount: 0 },
    { label: "Saldo alla chiusura", percentage: 30, amount: 0 }
  ]);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeDictationField, setActiveDictationField] = useState<string | null>(null);
  const activeFieldRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastProcessedResultIndex = useRef(0);
  const lastTranscriptRef = useRef("");

  useEffect(() => {
    activeFieldRef.current = activeDictationField;
    if (!activeDictationField) {
      lastTranscriptRef.current = "";
    }
  }, [activeDictationField]);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    address: '',
    vatNumber: '',
    phone: '',
    email: '',
    website: ''
  });

  const [renovationSectors, setRenovationSectors] = useState<RenovationSector[]>([]);
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [isGeneratingSubGroups, setIsGeneratingSubGroups] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    type: 'safety' | 'installation';
    itemIndex?: number;
  }>({
    isOpen: false,
    title: '',
    content: '',
    type: 'safety'
  });

  useEffect(() => {
    const loadedSectors = localStorage.getItem('customRenovationSectors');
    if (loadedSectors) {
      try {
        const parsed = JSON.parse(loadedSectors);
        // Start with default sectors to preserve their order
        const merged = [...RENOVATION_SECTORS];
        
        // Merge saved data into defaults or add as new custom sectors
        parsed.forEach((saved: RenovationSector) => {
          const index = merged.findIndex(s => s.id === saved.id);
          if (index !== -1) {
            // Replace default with saved (to keep custom subgroups)
            merged[index] = saved;
          } else {
            // Add custom sector at the end
            merged.push(saved);
          }
        });
        
        setRenovationSectors(merged);
      } catch (e) {
        console.error("Failed to parse custom sectors", e);
        setRenovationSectors(RENOVATION_SECTORS);
      }
    } else {
      setRenovationSectors(RENOVATION_SECTORS);
    }
  }, []);

  useEffect(() => {
    const hasSectors = siteDetails.selectedSectors && siteDetails.selectedSectors.length > 0;
    const hasMeasurements = siteDetails.sqm || siteDetails.bathrooms || siteDetails.doors || siteDetails.windows;
    
    if (siteAddress && hasSectors && hasMeasurements && !isLoading && !quote && !isTemplateModalOpen) {
      const timer = setTimeout(() => {
        handleGenerate(new Event('submit') as any);
      }, 3000); // 3 second delay to avoid premature generation
      return () => clearTimeout(timer);
    }
  }, [siteDetails, siteAddress, isLoading, quote, isTemplateModalOpen]);

  const saveCustomSectors = (sectors: RenovationSector[]) => {
    localStorage.setItem('customRenovationSectors', JSON.stringify(sectors));
  };

  const handleAddSector = async (name: string) => {
    if (!name.trim()) return;
    
    setIsGeneratingSubGroups(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");
      
      const ai = new GoogleGenAI({ apiKey: (apiKey as string) });
      const model = "gemini-3-flash-preview";
      
      const prompt = `Sei un esperto computista. Genera esattamente 10 sottogruppi di lavoro per il nuovo settore edile: "${name}".
      Ogni sottogruppo deve essere una voce di lavoro specifica che un utente può selezionare e quantificare.
      
      Restituisci un array JSON di oggetti con questa struttura:
      {
        "id": "stringa-univoca",
        "label": "Descrizione voce",
        "type": "number" | "checkbox" | "select",
        "unit": "mq" | "cad" | "ml" | "n°" (solo se type è number),
        "defaultValue": 0 (per number) o false (per checkbox) o stringa (per select),
        "options": ["opzione1", "opzione2"] (solo se type è select)
      }
      
      Assicurati che le voci siano realistiche e tecniche.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['number', 'checkbox', 'select'] },
                unit: { type: Type.STRING },
                defaultValue: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["id", "label", "type"]
            }
          }
        }
      });

      const subOptions = JSON.parse(response.text).map((opt: any) => ({
        ...opt,
        defaultValue: opt.type === 'number' ? 0 : (opt.type === 'checkbox' ? false : opt.defaultValue)
      }));

      const newSector: RenovationSector = {
        id: `custom-${Date.now()}`,
        name: name,
        icon: 'Wrench',
        type: 'internal',
        description: `Settore personalizzato: ${name}`,
        defaultWbs: [name],
        conditionalNote: `Intervento nel settore ${name}.`,
        subOptions
      };

      const updatedSectors = [...renovationSectors, newSector];
      setRenovationSectors(updatedSectors);
      saveCustomSectors(updatedSectors);
      setIsAddingSector(false);
    } catch (e) {
      console.error("Error adding sector", e);
      setError("Errore nella generazione automatica dei sottogruppi. Riprova.");
    } finally {
      setIsGeneratingSubGroups(false);
    }
  };

  const addCustomSubGroup = (sectorId: string, label: string) => {
    const updatedSectors = renovationSectors.map(s => {
      if (s.id === sectorId) {
        const newSub: SectorSubOption = {
          id: `sub-custom-${Date.now()}`,
          label,
          type: 'number',
          unit: 'mq',
          defaultValue: 0
        };
        return {
          ...s,
          subOptions: [...(s.subOptions || []), newSub]
        };
      }
      return s;
    });

    setRenovationSectors(updatedSectors);
    saveCustomSectors(updatedSectors);
    
    // Also update current choices if sector is selected
    if (siteDetails.selectedSectors?.includes(sectorId)) {
      setSiteDetails(prev => ({
        ...prev,
        sectorChoices: {
          ...prev.sectorChoices,
          [sectorId]: {
            ...(prev.sectorChoices?.[sectorId] || {}),
            [`sub-custom-${Date.now()}`]: { enabled: true, value: 0 }
          }
        }
      }));
    }
  };

  useEffect(() => {
    const loaded = localStorage.getItem('savedQuotes');
    if (loaded) {
      try {
        const parsed = JSON.parse(loaded);
        if (Array.isArray(parsed)) {
          setSavedQuotes(parsed);
        } else {
          console.warn("Saved quotes in localStorage is not an array");
          setSavedQuotes([]);
        }
      } catch (e) {
        console.error("Failed to parse saved quotes", e);
        setSavedQuotes([]);
      }
    }

    const loadedCompany = localStorage.getItem('companyData');
    if (loadedCompany) {
      try {
        setCompanyData(JSON.parse(loadedCompany));
      } catch (e) {
        console.error("Failed to parse company data", e);
      }
    }
  }, []);

  const toggleSector = (sector: RenovationSector) => {
    setSiteDetails(prev => {
      const selectedSectors = prev.selectedSectors || [];
      const isSelected = selectedSectors.includes(sector.id);
      
      if (isSelected) {
        setEditingSectorId(sector.id);
        return prev;
      } else {
        setEditingSectorId(sector.id);
        
        const sectorChoices = { ...(prev.sectorChoices || {}) };
        if (!sectorChoices[sector.id] && sector.subOptions) {
          sectorChoices[sector.id] = {};
          sector.subOptions.forEach(opt => {
            sectorChoices[sector.id][opt.id] = { enabled: false, value: opt.defaultValue };
          });
        }

        return {
          ...prev,
          selectedSectors: [...selectedSectors, sector.id],
          sectorChoices
        };
      }
    });
  };

  const applySectors = () => {
    const selectedSectorsData = renovationSectors.filter(s => siteDetails.selectedSectors?.includes(s.id));
    
    const detailedNotes: string[] = [];
    selectedSectorsData.forEach(sector => {
      const choices = siteDetails.sectorChoices?.[sector.id];
      if (choices && sector.subOptions) {
        const details = sector.subOptions.map(opt => {
          const choice = choices[opt.id];
          if (!choice || !choice.enabled) return null;
          const val = choice.value;
          if (opt.type === 'checkbox') return opt.label;
          if (opt.type === 'number' && (val === 0 || val === '')) return `${opt.label}: (Stima)`;
          return `${opt.label}: ${val}${opt.unit ? ' ' + opt.unit : ''}`;
        }).filter(Boolean).join(', ');
        
        if (details) {
          detailedNotes.push(`${sector.name} (${details})`);
        }
      }
    });

    const allWbs = selectedSectorsData.flatMap(s => s.defaultWbs);
    // Rebuild WBS categories based on selected sectors to follow their order
    // but keep any existing custom categories that might have items
    const uniqueWbs = Array.from(new Set(allWbs));
    setWbsCategories(uniqueWbs);
    
    if (detailedNotes.length > 0) {
      const detailedStr = detailedNotes.join('\n');
      setSiteDetails(prev => ({
        ...prev,
        siteNotes: prev.siteNotes ? `${prev.siteNotes}\n\nDETTAGLI INTERVENTI:\n${detailedStr}` : `DETTAGLI INTERVENTI:\n${detailedStr}`
      }));
    }

    setIsTemplateModalOpen(false);
  };

  // Automatic Quote Trigger
  useEffect(() => {
    const hasSectors = siteDetails.selectedSectors && siteDetails.selectedSectors.length > 0;
    const hasMeasurements = Boolean(siteDetails.sqm || siteDetails.bathrooms || siteDetails.doors || siteDetails.windows);
    const hasAddress = siteAddress.trim().length > 5;
    
    if (hasSectors && hasMeasurements && hasAddress && !isLoading && !quote && !isTemplateModalOpen && !editingSectorId) {
      const timer = setTimeout(() => {
        handleGenerate({ preventDefault: () => {} } as React.FormEvent);
      }, 2000); // 2 second delay to ensure user finished basic input
      return () => clearTimeout(timer);
    }
  }, [siteDetails.selectedSectors, siteDetails.sqm, siteDetails.bathrooms, siteDetails.doors, siteDetails.windows, siteAddress, isLoading, quote, isTemplateModalOpen, editingSectorId]);

  const [isWorkGroupModalOpen, setIsWorkGroupModalOpen] = useState(false);
  const [isSubGroupModalOpen, setIsSubGroupModalOpen] = useState(false);
  const [activeSectorForSubGroup, setActiveSectorForSubGroup] = useState<string | null>(null);

  const TemplateModal = () => {
    if (!isTemplateModalOpen) return null;

    // Combine all sectors into one block as requested
    const allSectors = renovationSectors;

    return (
      <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
            <div>
              <h3 className="text-xl font-black tracking-tight">Inquadramento del Cantiere</h3>
              <p className="text-emerald-100/80 text-xs font-medium">Configura i dettagli per ogni settore di intervento</p>
            </div>
            <button 
              onClick={() => setIsTemplateModalOpen(false)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div className="space-y-8">
              {/* All Sectors Unified Block */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Icons.LayoutGrid size={16} />
                  </div>
                  <h4 className="text-md font-bold text-slate-800">Settori di Intervento</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {allSectors.map(sector => {
                    const Icon = (Icons as any)[sector.icon] || Icons.HelpCircle;
                    const isSelected = siteDetails.selectedSectors?.includes(sector.id);
                    const isExternal = sector.type === 'external';
                    
                    return (
                      <button
                        key={sector.id}
                        onClick={() => toggleSector(sector)}
                        className={cn(
                          "relative flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all duration-300 group",
                          isSelected 
                            ? (isExternal ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]" : "bg-emerald-600 border-emerald-600 text-white shadow-md scale-[1.02]")
                            : "bg-white border-slate-100 text-blue-600/80 hover:border-emerald-200 hover:bg-emerald-50/30"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors",
                          isSelected ? "bg-white/20" : (isExternal ? "bg-blue-50 text-blue-400 group-hover:text-blue-600" : "bg-slate-50 group-hover:bg-emerald-100 text-blue-400 group-hover:text-blue-600")
                        )}>
                          <Icon size={20} />
                        </div>
                        <span className="text-[12px] font-bold leading-tight">{sector.name}</span>
                        {isSelected && (
                          <>
                            <div className={cn(
                              "absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm",
                              isExternal ? "text-blue-600" : "text-emerald-600"
                            )}>
                              <Icons.Check size={10} strokeWidth={4} />
                            </div>
                            {(() => {
                              const choices = siteDetails.sectorChoices?.[sector.id];
                              if (choices) {
                                const activeCount = sector.subOptions?.filter(opt => {
                                  const choice = choices[opt.id];
                                  return choice?.enabled === true;
                                }).length || 0;
                                
                                if (activeCount > 0) {
                                  return (
                                    <div className={cn(
                                      "absolute -bottom-1 -right-1 bg-white text-[8px] font-black px-1.5 py-0.5 rounded-full border shadow-sm",
                                      isExternal ? "text-blue-600 border-blue-100" : "text-emerald-600 border-emerald-100"
                                    )}>
                                      {activeCount}
                                    </div>
                                  );
                                }
                              }
                              return null;
                            })()}
                          </>
                        )}
                      </button>
                    );
                  })}

                  {/* Add Sector Button */}
                  {isAddingSector ? (
                    <div className="col-span-full">
                      <AddSectorForm 
                        onAdd={handleAddSector} 
                        onCancel={() => setIsAddingSector(false)} 
                        isGenerating={isGeneratingSubGroups} 
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingSector(true)}
                      className="flex flex-col items-center justify-center text-center p-3 rounded-2xl border-2 border-dashed border-slate-200 text-blue-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-slate-50 group-hover:bg-emerald-100 transition-colors">
                        <Icons.Plus size={20} />
                      </div>
                      <span className="text-[12px] font-bold leading-tight">Aggiungi Settore</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Free Text Area */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <Icons.MessageSquare size={14} className="text-blue-400" />
                  Note Aggiuntive e Personalizzazioni
                </label>
                <textarea
                  value={siteDetails.siteNotes || ''}
                  onChange={(e) => setSiteDetails(prev => ({ ...prev, siteNotes: e.target.value }))}
                  placeholder="Inserisci qui eventuali dettagli specifici..."
                  className="w-full h-24 p-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 focus:ring-0 transition-all text-xs resize-none bg-white text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xs text-blue-400 font-medium">
                {siteDetails.selectedSectors?.length || 0} settori configurati
              </div>
              <button 
                onClick={() => setIsWorkGroupModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-all border border-emerald-100"
              >
                <Icons.Settings size={14} />
                Gestisci Gruppi di Lavoro
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all text-sm"
              >
                Annulla
              </button>
              <button 
                onClick={applySectors}
                disabled={!siteDetails.selectedSectors?.length && !siteDetails.siteNotes}
                className="px-8 py-2 rounded-xl font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all text-sm flex items-center gap-2"
              >
                <Icons.CheckCircle2 size={18} />
                Conferma e Applica
              </button>
            </div>
          </div>

          {/* Sub-modal for Sector Details */}
          <AnimatePresence>
            {editingSectorId && (
              <SectorDetailsSubModal
                sector={renovationSectors.find(s => s.id === editingSectorId)!}
                initialChoices={siteDetails.sectorChoices?.[editingSectorId] || {}}
                onSave={(choices) => {
                  setSiteDetails(prev => ({
                    ...prev,
                    sectorChoices: {
                      ...prev.sectorChoices,
                      [editingSectorId]: choices
                    }
                  }));
                  setEditingSectorId(null);
                }}
                onRemove={() => {
                  setSiteDetails(prev => ({
                    ...prev,
                    selectedSectors: (prev.selectedSectors || []).filter(id => id !== editingSectorId)
                  }));
                  setEditingSectorId(null);
                }}
                onClose={() => setEditingSectorId(null)}
                onAddSubGroup={(sectorId) => {
                  setActiveSectorForSubGroup(sectorId);
                  setIsSubGroupModalOpen(true);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  };

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "danger" | "primary" | "success";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: "danger" | "primary" | "success" = "danger") => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
      type
    });
  };

  const resetForm = () => {
    const performReset = () => {
      setSiteAddress('');
      setSiteDetails({
        floor: '',
        accessibility: '',
        siteStatus: '',
        liftAvailable: false,
        ztl: 'No',
        sqm: '',
        bathrooms: '',
        doors: '',
        windows: '',
        otherInfo: '',
        selectedSectors: [],
        siteNotes: ''
      });
      setDescription('');
      setCustomPrompt('');
      setClientName('');
      setQuote(null);
      setQuoteId(null);
      setQuoteName('');
      setError(null);
      setWbsDescriptions({});
      setWbsCategories([]);
      setPaymentTerms([
        { label: "Acconto alla firma", percentage: 30, amount: 0 },
        { label: "Stato Avanzamento Lavori (SAL)", percentage: 40, amount: 0 },
        { label: "Saldo alla chiusura", percentage: 30, amount: 0 }
      ]);
      setUploadedFiles([]);
      setIsModalOpen(false);
      setIsCompanyModalOpen(false);
    };

    if (quote || siteAddress || description) {
      showConfirm(
        "Nuovo Preventivo",
        "Sei sicuro di voler iniziare un nuovo preventivo? I dati non salvati andranno persi.",
        performReset
      );
    } else {
      performReset();
    }
  };

  const saveCompanyData = (data: CompanyData) => {
    setCompanyData(data);
    localStorage.setItem('companyData', JSON.stringify(data));
    setIsCompanyModalOpen(false);
  };

  useEffect(() => {
    if (quote) {
      const uniqueWbs = Array.from(new Set<string>(quote.items.map(item => item.wbs || 'Altro')));
      setWbsCategories(prev => {
        const combined = Array.from(new Set<string>([...prev, ...uniqueWbs]));
        return combined;
      });
    }
  }, [quote]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const currentField = activeFieldRef.current;
        if (!currentField) return;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal && i >= lastProcessedResultIndex.current) {
            lastProcessedResultIndex.current = i + 1;
            const transcript = result[0].transcript.trim();
            if (!transcript || transcript === lastTranscriptRef.current) continue;
            
            lastTranscriptRef.current = transcript;
            
            if (currentField === 'customPrompt') {
              setCustomPrompt(prev => {
                const currentText = prev || '';
                const formatted = `- ${transcript};`;
                const separator = currentText && !currentText.endsWith('\n') ? '\n' : '';
                const newText = currentText + separator + formatted + '\n';
                return newText;
              });
            } else if (currentField?.startsWith('wbs_')) {
              const wbsName = currentField.replace('wbs_', '');
              setWbsDescriptions(prev => {
                const currentText = prev[wbsName] || '';
                const formatted = `- ${transcript};`;
                const separator = currentText && !currentText.endsWith('\n') ? '\n' : '';
                const newText = currentText + separator + formatted + '\n';

                return {
                  ...prev,
                  [wbsName]: newText
                };
              });
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setActiveDictationField(null);
      };

      recognitionRef.current.onend = () => {
        lastProcessedResultIndex.current = 0;
        // Only set to null if we aren't starting a new field
        setActiveDictationField(current => {
          if (recognitionRef.current && current) {
            // If it ended naturally, we might want to restart it if it's continuous,
            // but standard behavior is to let it stop.
            return null;
          }
          return current;
        });
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-resize all textareas when content changes
  useEffect(() => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }, [customPrompt, wbsDescriptions, wbsCategories]);

  const toggleDictation = (fieldId: string) => {
    if (!recognitionRef.current) {
      setError("Il riconoscimento vocale non è supportato in questo browser o richiede permessi aggiuntivi.");
      return;
    }
    
    if (activeDictationField === fieldId) {
      recognitionRef.current.stop();
      setActiveDictationField(null);
    } else {
      if (activeDictationField) {
        recognitionRef.current.stop();
        // Wait a bit for the previous session to fully stop before starting a new one
        setTimeout(() => {
          setActiveDictationField(fieldId);
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error(e);
          }
        }, 300);
      } else {
        setActiveDictationField(fieldId);
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const printRef = useRef<HTMLDivElement>(null);

  const getPriceHistory = (): PriceReference[] => {
    const history: Map<string, PriceReference> = new Map();
    
    // Process quotes from oldest to newest so that newer ones overwrite older ones,
    // ensuring the most recent price is the one preserved in the Map.
    savedQuotes.forEach(quote => {
      quote.data.items.forEach(item => {
        // Use description as key to keep the most recent price for each unique item
        history.set(item.description.toLowerCase().trim(), {
          description: item.description,
          unitPrice: item.unitPrice,
          unit: item.unit
        });
      });
    });
    
    return Array.from(history.values());
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine all WBS descriptions into one string with headers for the AI
    const combinedDescription = Object.entries(wbsDescriptions)
      .filter(([_, text]) => text.trim().length > 0)
      .map(([wbs, text]) => `### ${wbs}\n${text}`)
      .join('\n\n') || description;

    if (!siteAddress || (!combinedDescription && uploadedFiles.length === 0 && (!siteDetails.selectedSectors || siteDetails.selectedSectors.length === 0))) return;

    setIsLoading(true);
    setError(null);
    try {
      const priceHistory = getPriceHistory();
      
      const processedFiles: { mimeType: string, data: string }[] = [];
      let parsedFilesText = '';

      for (const file of uploadedFiles) {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const base64String = (reader.result as string).split(',')[1];
              resolve(base64String);
            };
          });
          reader.readAsDataURL(file);
          const base64Data = await base64Promise;
          processedFiles.push({ mimeType: file.type, data: base64Data });
        }
      }

      const data = await generateQuote(combinedDescription, siteAddress, siteDetails, customPrompt, priceHistory, processedFiles, parsedFilesText, renovationSectors);
      
      if (!data) {
        throw new Error("L'AI non ha restituito alcun dato. Riprova.");
      }

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error("I dati restituiti dall'AI non sono validi (mancano le voci del preventivo).");
      }

      // Ensure all items have necessary fields to prevent render crashes
      data.items = data.items.map((item: any) => ({
        description: item.description || 'Nessuna descrizione',
        quantity: typeof item.quantity === 'number' ? item.quantity : 0,
        unit: item.unit || 'cad',
        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
        total: typeof item.total === 'number' ? item.total : 0,
        wbs: item.wbs || 'Altro',
        safetyInfo: item.safetyInfo || '',
        installationInfo: item.installationInfo || ''
      }));

      data.clientInfo = { name: clientName || 'Spett.le Cliente', address: siteAddress };
      data.siteDetails = siteDetails;
      
      // Calculate initial payment amounts
      const totalWithVat = data.totalAmount * (1 + vatRate / 100);
      const initialPaymentTerms = paymentTerms.map(term => ({
        ...term,
        amount: (totalWithVat * term.percentage) / 100
      }));
      data.paymentTerms = initialPaymentTerms;
      setPaymentTerms(initialPaymentTerms);

      setQuote(data);
      setQuoteId(null);
      const defaultName = clientName ? `${clientName} - ${data.jobTitle}` : data.jobTitle;
      setQuoteName(defaultName || 'Nuovo Preventivo');

      // Scroll to result on mobile
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      if (err.message === "RATE_LIMIT") {
        setError("Hai superato il limite di richieste gratuite. Riprova più tardi o controlla la tua quota API.");
      } else if (err.message === "INVALID_DATA" || err.name === "SyntaxError") {
        setError("L'Intelligenza Artificiale ha restituito dati non validi. Prova a riformulare la richiesta o a caricare file più piccoli.");
      } else {
        // Show the actual error message from the server if available
        const errorMessage = err.message || "Si è verificato un errore durante la generazione del preventivo. Riprova.";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Check file sizes (max 3MB per file to avoid Vercel payload limits and browser crashes)
      const MAX_SIZE = 3 * 1024 * 1024;
      const oversizedFiles = filesArray.filter(f => f.size > MAX_SIZE);
      
      if (oversizedFiles.length > 0) {
        alert(`Alcuni file sono troppo grandi (massimo 3MB per file). Riduci le dimensioni o dividi i PDF.`);
        const validFiles = filesArray.filter(f => f.size <= MAX_SIZE);
        setUploadedFiles(prev => [...prev, ...validFiles]);
      } else {
        setUploadedFiles(prev => [...prev, ...filesArray]);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    if (!quote) return;
    
    if (field === 'wbs' && value === 'NEW') {
      const newCat = prompt("Inserisci il nome della nuova categoria WBS:");
      if (newCat && newCat.trim()) {
        const trimmed = newCat.trim();
        setWbsCategories(prev => Array.from(new Set<string>([...prev, trimmed])));
        value = trimmed;
      } else {
        return; // Cancel
      }
    }

    const newItems = [...quote.items];
    const item = { ...newItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    
    newItems[index] = item;
    
    // Recalculate grand total
    const totalAmount = newItems.reduce((acc, curr) => acc + curr.total, 0);
    
    let updatedPdfData = quote.pdfData;
    if (updatedPdfData && updatedPdfData.items && updatedPdfData.items[index]) {
      const newPdfItems = [...updatedPdfData.items];
      const pdfItem = { ...newPdfItems[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        pdfItem.total = Number(pdfItem.quantity) * Number(pdfItem.unitPrice);
      }
      newPdfItems[index] = pdfItem;
      updatedPdfData = { ...updatedPdfData, items: newPdfItems };
    }

    setQuote({ ...quote, items: newItems, totalAmount, pdfData: updatedPdfData });
  };

  const addItem = (wbs?: string) => {
    console.log("Adding item to WBS:", wbs);
    if (!quote) {
      console.error("Cannot add item: quote is null");
      return;
    }
    
    const newItem: QuoteItem = {
      description: 'Nuova voce',
      quantity: 1,
      unit: 'cad',
      unitPrice: 0,
      total: 0,
      wbs: wbs || wbsCategories[0] || 'Altro',
      safetyInfo: '',
      installationInfo: ''
    };
    
    const newItems = [...quote.items, newItem];
    
    // Recalculate grand total
    const totalAmount = newItems.reduce((acc, curr) => acc + curr.total, 0);
    
    let updatedPdfData = quote.pdfData;
    if (updatedPdfData && updatedPdfData.items) {
      updatedPdfData = {
        ...updatedPdfData,
        items: [...updatedPdfData.items, { ...newItem }]
      };
    }

    console.log("Setting new quote state with", newItems.length, "items");
    setQuote({
      ...quote,
      items: newItems,
      totalAmount,
      pdfData: updatedPdfData
    });
  };

  const removeItem = (index: number) => {
    if (!quote) return;
    const newItems = quote.items.filter((_, i) => i !== index);
    const totalAmount = newItems.reduce((acc, curr) => acc + curr.total, 0);
    
    let updatedPdfData = quote.pdfData;
    if (updatedPdfData && updatedPdfData.items) {
      updatedPdfData = {
        ...updatedPdfData,
        items: updatedPdfData.items.filter((_, i) => i !== index)
      };
    }

    setQuote({ ...quote, items: newItems, totalAmount, pdfData: updatedPdfData });
  };

  const saveQuote = (asNew: boolean = false) => {
    if (!quote) return;
    let name = quoteName || quote.jobTitle;
    
    const isNew = asNew || !quoteId;
    const id = isNew ? `PRV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}` : quoteId;
    
    let shortCode = '';
    if (isNew) {
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString();
      const quotesThisYear = savedQuotes.filter(q => {
        const qDate = new Date(q.date);
        return qDate.getFullYear() === currentYear;
      });
      
      let maxNum = 0;
      quotesThisYear.forEach(q => {
        if (q.shortCode && q.shortCode.includes('/')) {
          const num = parseInt(q.shortCode.split('/')[0]);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      shortCode = `${maxNum + 1}/${yearSuffix}`;
    } else {
      const existing = savedQuotes.find(q => q.id === quoteId);
      shortCode = existing?.shortCode || '';
    }

    const newQuote: SavedQuote = {
      id,
      shortCode,
      name,
      date: new Date().toISOString(),
      data: {
        ...quote,
        paymentTerms
      },
      inputs: {
        siteAddress,
        description,
        customPrompt,
        clientName,
        wbsCategories,
        wbsDescriptions,
        siteDetails
      }
    };

    // Update wbsCategories if there are new ones in the quote
    const uniqueWbs = Array.from(new Set<string>(quote.items.map(item => item.wbs || 'Altro')));
    setWbsCategories(prev => Array.from(new Set<string>([...prev, ...uniqueWbs])));

    let updated;
    if (isNew) {
      updated = [...savedQuotes, newQuote];
      setQuoteId(id);
    } else {
      updated = savedQuotes.map(q => q.id === quoteId ? newQuote : q);
    }
      
    setSavedQuotes(updated);
    localStorage.setItem('savedQuotes', JSON.stringify(updated));
    alert(asNew ? "Copia salvata con successo!" : "Preventivo salvato con successo!");
  };

  const loadQuote = (saved: SavedQuote) => {
    setQuote(saved.data);
    setQuoteId(saved.id);
    setQuoteName(saved.name);
    if (saved.data.paymentTerms) {
      setPaymentTerms(saved.data.paymentTerms);
    }
    if (saved.inputs) {
      setSiteAddress(saved.inputs.siteAddress || '');
      setSiteDetails(saved.inputs.siteDetails || {
        floor: '',
        accessibility: '',
        siteStatus: '',
        liftAvailable: false,
        ztl: 'No',
        sqm: '',
        bathrooms: '',
        doors: '',
        windows: '',
        otherInfo: '',
        selectedSectors: [],
        siteNotes: ''
      });
      setDescription(saved.inputs.description || '');
      setCustomPrompt(saved.inputs.customPrompt || saved.inputs.dimensions || '');
      setClientName(saved.inputs.clientName || '');
      if (saved.inputs.wbsCategories) {
        setWbsCategories(saved.inputs.wbsCategories);
      }
      if (saved.inputs.wbsDescriptions) {
        setWbsDescriptions(saved.inputs.wbsDescriptions);
      }
    }
    setIsModalOpen(false);
  };
  
  const deleteQuote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm(
      "Elimina Preventivo",
      "Sei sicuro di voler eliminare questo preventivo?",
      () => {
        const updated = savedQuotes.filter(q => q.id !== id);
        setSavedQuotes(updated);
        localStorage.setItem('savedQuotes', JSON.stringify(updated));
        if (quoteId === id) {
          setQuoteId(null);
          setQuoteName('');
        }
      }
    );
  };

  const exportDatabase = () => {
    const data = {
      savedQuotes,
      companyData,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `database_preventivi_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.savedQuotes && Array.isArray(json.savedQuotes)) {
          // Proceed with import without blocking confirm for better compatibility in iframe
          setSavedQuotes(json.savedQuotes);
          localStorage.setItem('savedQuotes', JSON.stringify(json.savedQuotes));
          
          if (json.companyData) {
            setCompanyData(json.companyData);
            localStorage.setItem('companyData', JSON.stringify(json.companyData));
          }
          
          setError(null);
          // We use a temporary state or just console log since alert might be blocked
          console.log("Database importato con successo!");
          // Force a small notification in the UI if possible, or just close modal
          setIsModalOpen(false);
          resetForm(); // Reset to clear any stale state
        } else {
          setError("File non valido. Assicurati di caricare un file esportato correttamente.");
        }
      } catch (err) {
        console.error("Import error", err);
        setError("Errore durante la lettura del file JSON. Verifica il formato.");
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = async (type: 'quote' | 'pos' = 'quote') => {
    if (!quote) return;
    
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const pdfQuote = (quote as any).pdfData || quote;
      
      if (type === 'quote') {
        // Header
        doc.setFontSize(22);
        doc.setTextColor(5, 150, 105); // Emerald 600
        doc.text("PREVENTIVO", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const currentSaved = savedQuotes.find(q => q.id === quoteId);
        const displayCode = currentSaved?.shortCode ? `${currentSaved.shortCode} (${quoteId})` : (quoteId || 'NUOVO');
        doc.text(`Codice: ${displayCode}`, 14, 28);
        doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 14, 33);
        doc.text(`Provincia (rilevata): ${quote.province}`, 14, 38);
        
        // Esecutore & Destinatario
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("Esecutore:", 14, 50);
        doc.setFont("helvetica", "normal");
        
        const companyInfoLines = [];
        if (companyData.name) {
          companyInfoLines.push(companyData.name);
          if (companyData.vatNumber) companyInfoLines.push(`P.IVA/C.F.: ${companyData.vatNumber}`);
          if (companyData.address) companyInfoLines.push(companyData.address);
          if (companyData.phone) companyInfoLines.push(`Tel: ${companyData.phone}`);
          if (companyData.email) companyInfoLines.push(`Email: ${companyData.email}`);
          if (companyData.website) companyInfoLines.push(`Web: ${companyData.website}`);
        } else {
          companyInfoLines.push("Impresa Edile / Professionista");
          companyInfoLines.push("P.IVA: 00000000000");
          companyInfoLines.push("Indirizzo sede legale");
        }
        
        doc.text(companyInfoLines.join('\n'), 14, 55);
        
        doc.setFont("helvetica", "bold");
        doc.text("Destinatario:", 110, 50);
        doc.setFont("helvetica", "normal");
        const clientNameForPdf = quote.clientInfo?.name || 'Spett.le Cliente';
        let siteInfo = `Indirizzo cantiere: ${siteAddress}`;
        if (quote.siteDetails) {
          const details = [];
          if (quote.siteDetails.floor) details.push(`Piano: ${quote.siteDetails.floor}`);
          if (quote.siteDetails.accessibility) details.push(`Accesso: ${quote.siteDetails.accessibility}`);
          if (quote.siteDetails.siteStatus) details.push(`Stato: ${quote.siteDetails.siteStatus}`);
          if (quote.siteDetails.liftAvailable) details.push(`Ascensore: Sì`);
          if (quote.siteDetails.ztl && quote.siteDetails.ztl !== 'No') details.push(`ZTL: ${quote.siteDetails.ztl}`);
          
          const measurements = [];
          if (quote.siteDetails.sqm) measurements.push(`${quote.siteDetails.sqm} mq`);
          if (quote.siteDetails.bathrooms) measurements.push(`${quote.siteDetails.bathrooms} bagni`);
          if (quote.siteDetails.doors) measurements.push(`${quote.siteDetails.doors} porte`);
          if (quote.siteDetails.windows) measurements.push(`${quote.siteDetails.windows} finestre`);
          
          if (quote.siteDetails.siteNotes) siteInfo += `\nNote Inquadramento: ${quote.siteDetails.siteNotes}`;
          if (quote.siteDetails.otherInfo) siteInfo += `\nAltre Info: ${quote.siteDetails.otherInfo}`;
        }
        doc.text(`${clientNameForPdf}\n${siteInfo}`, 110, 55);
        
        // Oggetto
        doc.setFont("helvetica", "bold");
        doc.text("Oggetto: ", 14, 90);
        const labelWidth = doc.getTextWidth("Oggetto: ");
        doc.setFont("helvetica", "normal");
        const objectText = quoteName || pdfQuote.jobTitle;
        const splitTitle = doc.splitTextToSize(objectText, 180 - labelWidth);
        doc.text(splitTitle, 14 + labelWidth, 90);
        
        let currentY = 90 + (splitTitle.length * 5) + 5;

        // Capitolato Descrittivo
        if (pdfQuote.specifications) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text("Capitolato Descrittivo dei Lavori:", 14, currentY);
          currentY += 5;
          
          const specLines = pdfQuote.specifications.split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0);

          autoTable(doc, {
            startY: currentY,
            body: specLines.map((line: string) => [line]),
            theme: 'plain',
            styles: { 
              fontSize: 9, 
              cellPadding: 1, 
              halign: 'justify',
              textColor: [50, 50, 50],
              font: 'helvetica',
              fontStyle: 'normal'
            },
            margin: { left: 14, right: 14 }
          });
          currentY = (doc as any).lastAutoTable.finalY + 15;
        }
        
        // Group items by WBS
        const groupedItems: { [key: string]: QuoteItem[] } = {};
        pdfQuote.items.forEach((item: QuoteItem) => {
          const category = item.wbs || 'Altro';
          if (!groupedItems[category]) groupedItems[category] = [];
          groupedItems[category].push(item);
        });

        const allWbsInQuote = Array.from(new Set<string>(pdfQuote.items.map((item: QuoteItem) => item.wbs || 'Altro')));
        const displayCategories: string[] = Array.from(new Set<string>([...wbsCategories, ...allWbsInQuote]));

        const tableColumn = ["#", "Descrizione", "Quantità", "Unità", "Prezzo Un.", "Totale"];
        
        let globalItemCounter = 0;
        let groupCounter = 0;
        
        displayCategories.forEach((wbs: string) => {
          const items = groupedItems[wbs];
          if (!items || items.length === 0) return;

          groupCounter++;
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(5, 150, 105);
          doc.text(`${groupCounter}. ${wbs.toUpperCase()}`, 14, currentY);
          currentY += 8;

          const tableRows = items.map((item) => {
            globalItemCounter++;
            return [
              globalItemCounter,
              item.description,
              item.quantity.toLocaleString('it-IT'),
              item.unit,
              `€ ${item.unitPrice.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
              `€ ${item.total.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
            ];
          });

          autoTable(doc, {
            startY: currentY,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [5, 150, 105] },
            styles: { fontSize: 8, cellPadding: 3, halign: 'justify' },
            columnStyles: {
              0: { cellWidth: 10, halign: 'left' },
              1: { cellWidth: 'auto', halign: 'justify' },
              2: { cellWidth: 20, halign: 'right' },
              3: { cellWidth: 15, halign: 'center' },
              4: { cellWidth: 25, halign: 'right' },
              5: { cellWidth: 25, halign: 'right' },
            },
            margin: { left: 14, right: 14 }
          });

          currentY = (doc as any).lastAutoTable.finalY + 10;
        });

        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }
        const finalY = currentY;
        
        const imponibile = quote.totalAmount;
        const iva = imponibile * (vatRate / 100);
        const totale = imponibile + iva;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Imponibile:`, 140, finalY + 10);
        doc.text(`€ ${imponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, 196, finalY + 10, { align: 'right' });
        
        doc.text(`IVA (${vatRate}%):`, 140, finalY + 16);
        doc.text(`€ ${iva.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, 196, finalY + 16, { align: 'right' });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Totale:`, 140, finalY + 24);
        doc.text(`€ ${totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, 196, finalY + 24, { align: 'right' });
        
        currentY = finalY + 40;

        // Payment Terms
        if (paymentTerms && paymentTerms.length > 0) {
          if (currentY > 230) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text("Modalità di Pagamento:", 14, currentY);
          currentY += 6;

          const paymentRows = paymentTerms.map(term => [
            term.label,
            `${term.percentage}%`,
            `€ ${term.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
          ]);

          autoTable(doc, {
            startY: currentY,
            body: paymentRows,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
              0: { cellWidth: 'auto' },
              1: { cellWidth: 30, halign: 'center' },
              2: { cellWidth: 40, halign: 'right' },
            },
            margin: { left: 14, right: 14 }
          });
          currentY = (doc as any).lastAutoTable.finalY + 10;

          if (companyData.iban) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text(`IBAN per il bonifico: ${companyData.iban}`, 14, currentY);
            currentY += 10;
          }
        }

        // Notes
        if (pdfQuote.estimatedDimensionsExplanation) {
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("Nota sulle quantità stimate:", 14, currentY);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100, 100, 100);
          const splitNotes = doc.splitTextToSize(pdfQuote.estimatedDimensionsExplanation, 180);
          doc.text(splitNotes, 14, currentY + 5);
          currentY += splitNotes.length * 5 + 15;
        }

        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Note e Condizioni:", 14, currentY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        const splitConditions = doc.splitTextToSize(pdfQuote.notes, 180);
        doc.text(splitConditions, 14, currentY + 5);
        
        currentY += splitConditions.length * 5 + 20;
        
        // Signatures
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text("Firma del Professionista", 14, currentY);
        doc.line(14, currentY + 15, 70, currentY + 15);
        
        doc.text("Firma per Accettazione", 110, currentY);
        doc.line(110, currentY + 15, 166, currentY + 15);
      } else {
        // POS ONLY
        let currentY = 20;
        
        doc.setFontSize(18);
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
        doc.text("PIANO OPERATIVO DI SICUREZZA (P.O.S.)", 14, currentY);
        currentY += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(`Cantiere: ${siteAddress}`, 14, currentY);
        currentY += 5;
        doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 14, currentY);
        currentY += 15;

        // General POS Info
        if (pdfQuote.posGeneralInfo) {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text("1. INFORMAZIONI GENERALI E ORGANIZZAZIONE DEL CANTIERE", 14, currentY);
          currentY += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          const splitGeneral = doc.splitTextToSize(pdfQuote.posGeneralInfo, 180);
          doc.text(splitGeneral, 14, currentY);
          currentY += (splitGeneral.length * 5) + 15;
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text("2. ANALISI DEI RISCHI E PROCEDURE PER SINGOLA LAVORAZIONE", 14, currentY);
          currentY += 10;
        }

        const itemsWithInfo = pdfQuote.items.filter((item: QuoteItem) => item.safetyInfo || item.installationInfo);
        
        if (itemsWithInfo.length === 0) {
          doc.setFontSize(12);
          doc.setTextColor(220, 38, 38);
          doc.text("Nessuna informazione tecnica disponibile per questo preventivo.", 14, currentY);
        } else {
          itemsWithInfo.forEach((item: QuoteItem, index: number) => {
            if (currentY > 250) {
              doc.addPage();
              currentY = 20;
            }
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text(`${index + 1}. ${item.description}`, 14, currentY);
            currentY += 6;
            
            if (item.safetyInfo) {
              doc.setFontSize(8);
              doc.setTextColor(180, 83, 9); // Amber 700
              doc.text("SICUREZZA:", 14, currentY);
              currentY += 4;
              doc.setTextColor(60, 60, 60);
              doc.setFont("helvetica", "normal");
              const splitSafety = doc.splitTextToSize(item.safetyInfo, 180);
              doc.text(splitSafety, 14, currentY);
              currentY += (splitSafety.length * 4) + 4;
            }
            
            if (item.installationInfo) {
              if (currentY > 260) {
                doc.addPage();
                currentY = 20;
              }
              doc.setFontSize(8);
              doc.setTextColor(29, 78, 216); // Blue 700
              doc.setFont("helvetica", "bold");
              doc.text("CORRETTA POSA IN OPERA:", 14, currentY);
              currentY += 4;
              doc.setTextColor(60, 60, 60);
              doc.setFont("helvetica", "normal");
              const splitInstall = doc.splitTextToSize(item.installationInfo, 180);
              doc.text(splitInstall, 14, currentY);
              currentY += (splitInstall.length * 4) + 8;
            }
            currentY += 2;
          });
        }
      }

      // Add page numbers and branding
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`Pagina ${i} di ${pageCount}`, 105, 288, { align: 'center' });
        doc.text("Software di ARTERNA © 2026 @ Tutti i diritti riservati", 105, 293, { align: 'center' });
      }
      
      const safeTitle = quoteName ? quoteName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'documento';
      doc.save(`${type === 'quote' ? 'preventivo' : 'pos'}_${safeTitle}.pdf`);
    } catch (err) {
      console.error(err);
      setError("Si è verificato un errore durante la generazione del PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-emerald-100">
        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          type={confirmConfig.type}
        />
        <TemplateModal />
        
        <WorkGroupModal 
          isOpen={isWorkGroupModalOpen}
          onClose={() => setIsWorkGroupModalOpen(false)}
          categories={wbsCategories}
          onUpdate={setWbsCategories}
        />

        <SubGroupModal 
          isOpen={isSubGroupModalOpen}
          onClose={() => {
            setIsSubGroupModalOpen(false);
            setActiveSectorForSubGroup(null);
          }}
          onAdd={(label) => {
            if (activeSectorForSubGroup) {
              addCustomSubGroup(activeSectorForSubGroup, label);
            }
          }}
        />

        <AnimatePresence>
          {infoModal.isOpen && (
            <InfoModal 
              onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
              onSave={(newContent) => {
                if (infoModal.itemIndex !== undefined) {
                  updateItem(infoModal.itemIndex, infoModal.type === 'safety' ? 'safetyInfo' : 'installationInfo', newContent);
                }
              }}
              title={infoModal.title}
              content={infoModal.content}
              type={infoModal.type}
            />
          )}
        </AnimatePresence>
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-50 print:hidden overflow-x-auto no-scrollbar">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between min-w-max sm:min-w-0">
          <div className="flex items-center gap-2 mr-4 sm:mr-0">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0">
              <Calculator size={18} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">Preventivo Facile AI</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={exportDatabase}
              className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-2"
              title="Esporta Database"
            >
              <Download size={14} /> <span className="hidden md:inline">Esporta</span>
            </button>
            <label className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black hover:bg-black/5 px-2 sm:px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 sm:gap-2 cursor-pointer" title="Importa Database">
              <Upload size={14} /> <span className="hidden md:inline">Importa</span>
              <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
            </label>
            <div className="h-6 w-px bg-black/5 mx-1 sm:mx-2 shrink-0"></div>
            <button 
              onClick={resetForm}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 sm:gap-2 transition-colors bg-emerald-50 px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Nuovo Preventivo</span>
            </button>
            <button 
              onClick={() => setIsCompanyModalOpen(true)}
              className="text-sm font-medium text-black/60 hover:text-black flex items-center gap-1 sm:gap-2 transition-colors p-2 sm:p-0 rounded-lg hover:bg-black/5 sm:hover:bg-transparent"
              title="Dati Impresa"
            >
              <Settings size={18} /> <span className="hidden sm:inline">Dati Impresa</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium text-black/60 hover:text-black flex items-center gap-1 sm:gap-2 transition-colors p-2 sm:p-0 rounded-lg hover:bg-black/5 sm:hover:bg-transparent"
              title="I miei preventivi"
            >
              <FolderOpen size={18} /> <span className="hidden sm:inline">I miei preventivi</span>
            </button>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider hidden lg:inline-block">
              AI Powered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-start">
          
          {/* Input Section - Left Column */}
          <div className="lg:col-span-4 print:hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-2 custom-scrollbar pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-light tracking-tight mb-2">Crea il tuo preventivo</h2>
                <p className="text-black/50 text-sm">Inserisci l'indirizzo del cantiere e i dettagli del lavoro. L'AI stimerà i costi in base alla zona.</p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
                      <MapPin size={12} /> Indirizzo del cantiere (Via e Comune)
                    </label>
                    <FormInput 
                      placeholder="es. Via Roma 10, Milano..."
                      value={siteAddress}
                      onChange={(val) => setSiteAddress(val)}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
                      <FileText size={12} /> Nome Cliente (Opzionale)
                    </label>
                    <FormInput 
                      placeholder="es. Mario Rossi, Condominio Roma..."
                      value={clientName}
                      onChange={(val) => setClientName(val)}
                      className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(true)}
                    className={cn(
                      "w-full rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm",
                      siteDetails.selectedSectors?.length 
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-100" 
                        : "bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                    )}
                  >
                    <Briefcase size={20} /> 
                    {siteDetails.selectedSectors?.length 
                      ? `${siteDetails.selectedSectors.length} Settori Selezionati` 
                      : "Inquadramento Cantiere"}
                  </button>

                  {/* Active Sector Data Summary */}
                  {siteDetails.selectedSectors && siteDetails.selectedSectors.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                          <Icons.Activity size={12} /> Dati Attivi per Preventivo
                        </h3>
                        <span className="text-[10px] font-medium text-black/30 italic">Dati estratti dall'inquadramento</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {RENOVATION_SECTORS.filter(s => siteDetails.selectedSectors?.includes(s.id)).map(sector => {
                          const choices = siteDetails.sectorChoices?.[sector.id];
                          if (!choices) return null;
                          
                          const activeChoices = sector.subOptions?.filter(opt => {
                            const choice = choices[opt.id];
                            return choice?.enabled === true;
                          }) || [];

                          if (activeChoices.length === 0) return null;

                          const Icon = (Icons as any)[sector.icon] || Icons.HelpCircle;

                          return (
                            <div key={sector.id} className="bg-white border border-emerald-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all">
                              <div className="flex items-center gap-2 mb-2 border-b border-emerald-50 pb-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Icon size={14} />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-700">{sector.name}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                {activeChoices.map(opt => {
                                  const choice = choices[opt.id];
                                  const val = choice.value;
                                  return (
                                    <div key={opt.id} className="flex flex-col">
                                      <span className="text-[9px] text-slate-400 font-medium leading-tight">{opt.label}</span>
                                      <span className="text-[11px] font-bold text-emerald-700">
                                        {opt.type === 'checkbox' ? 'Sì' : (val === 0 || val === '' ? 'Stima' : `${val}${opt.unit ? ' ' + opt.unit : ''}`)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Site Details Section */}
                  <div className="bg-white/50 border border-black/5 p-4 rounded-2xl space-y-4">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                      <Settings size={12} /> Dati Generali del Cantiere
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-black/40 ml-1">Piano</label>
                        <select 
                          value={siteDetails.floor}
                          onChange={(e) => setSiteDetails({...siteDetails, floor: e.target.value})}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Seleziona...</option>
                          <option value="Piano Terra">Piano Terra</option>
                          <option value="1° Piano">1° Piano</option>
                          <option value="2° Piano">2° Piano</option>
                          <option value="3° Piano">3° Piano</option>
                          <option value="4° Piano">4° Piano</option>
                          <option value="5° Piano o superiore">5° Piano o superiore</option>
                          <option value="Seminterrato">Seminterrato</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-black/40 ml-1">Accessibilità</label>
                        <select 
                          value={siteDetails.accessibility}
                          onChange={(e) => setSiteDetails({...siteDetails, accessibility: e.target.value})}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Seleziona...</option>
                          <option value="Facile (Strada ampia)">Facile (Strada ampia)</option>
                          <option value="Media (Centro urbano)">Media (Centro urbano)</option>
                          <option value="Difficile (ZTL / Vicolo)">Difficile (ZTL / Vicolo)</option>
                          <option value="Cantiere in quota">Cantiere in quota</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-black/40 ml-1">Stato Cantiere</label>
                        <select 
                          value={siteDetails.siteStatus}
                          onChange={(e) => setSiteDetails({...siteDetails, siteStatus: e.target.value})}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="">Seleziona...</option>
                          <option value="Libero (Vuoto)">Libero (Vuoto)</option>
                          <option value="Abitato">Abitato</option>
                          <option value="In corso di ristrutturazione">In corso di ristrutturazione</option>
                          <option value="Nuova costruzione">Nuova costruzione</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-black/40 ml-1">ZTL</label>
                        <select 
                          value={siteDetails.ztl}
                          onChange={(e) => setSiteDetails({...siteDetails, ztl: e.target.value})}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          <option value="No">No</option>
                          <option value="Sì (Sempre)">Sì (Sempre)</option>
                          <option value="Sì (Fasce orarie)">Sì (Fasce orarie)</option>
                          <option value="Sì (Solo residenti)">Sì (Solo residenti)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 pt-2">
                        <input 
                          type="checkbox"
                          id="liftAvailable"
                          checked={siteDetails.liftAvailable}
                          onChange={(e) => setSiteDetails({...siteDetails, liftAvailable: e.target.checked})}
                          className="w-4 h-4 rounded border-black/10 text-emerald-600 focus:ring-emerald-500/20"
                        />
                        <label htmlFor="liftAvailable" className="text-[10px] font-medium text-black/60">Ascensore disponibile</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput 
                        label="Mq Intervento"
                        placeholder="es. 80"
                        value={siteDetails.sqm}
                        onChange={(val) => setSiteDetails({...siteDetails, sqm: val})}
                        className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <FormInput 
                        label="N. Bagni"
                        placeholder="es. 2"
                        value={siteDetails.bathrooms}
                        onChange={(val) => setSiteDetails({...siteDetails, bathrooms: val})}
                        className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormInput 
                        label="Porte Interne"
                        placeholder="es. 6"
                        value={siteDetails.doors}
                        onChange={(val) => setSiteDetails({...siteDetails, doors: val})}
                        className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <FormInput 
                        label="Finestre"
                        placeholder="es. 4"
                        value={siteDetails.windows}
                        onChange={(val) => setSiteDetails({...siteDetails, windows: val})}
                        className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-black/40 ml-1">Altre Info Logistiche</label>
                      <FormTextarea 
                        placeholder="es. Orari limitati, difficoltà parcheggio..."
                        value={siteDetails.otherInfo}
                        onChange={(val) => setSiteDetails({...siteDetails, otherInfo: val})}
                        className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-16"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
                        <FileText size={12} /> Istruzioni Aggiuntive e Note
                      </label>
                    </div>

                    <div className="relative">
                      <FormTextarea 
                        placeholder="Inserisci qui eventuali istruzioni specifiche, materiali preferiti o note particolari..."
                        value={customPrompt}
                        onChange={(val) => setCustomPrompt(val)}
                        className="w-full bg-white border border-black/10 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[120px]"
                      />
                      <div className="absolute top-3 right-3">
                        <DictationButton 
                          isListening={activeDictationField === 'customPrompt'}
                          onToggle={() => toggleDictation('customPrompt')}
                          onAppendText={() => {}}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-black/40 flex items-center gap-1.5">
                      <Upload size={12} /> Documenti (Solo PDF)
                    </label>
                    <div className="border-2 border-dashed border-black/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all bg-white/50">
                      <input 
                        type="file" 
                        multiple 
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-medium text-black/60 text-center">
                          Clicca per caricare file o trascinali qui
                        </p>
                        <p className="text-[10px] text-black/40 text-center">
                          Solo PDF supportati
                        </p>
                      </label>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white border border-black/5 rounded-lg p-2 text-xs">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText size={14} className="text-emerald-600 shrink-0" />
                              <span className="truncate text-black/70 font-medium">{f.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeFile(idx)}
                              className="text-black/30 hover:text-red-500 p-1 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.98]",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generazione in corso...
                    </>
                  ) : (
                    <>
                      Genera Preventivo
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="bg-white/50 border border-black/5 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-black/30">Come funziona</h3>
                <ul className="space-y-3">
                  {[
                    "L'AI analizza la tua descrizione",
                    "Stima le quantità necessarie se mancanti",
                    "Applica i prezzi medi della provincia indicata",
                    "Genera un documento professionale modificabile"
                  ].map((step, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-black/60">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Preview Section - Right Column */}
          <div className="lg:col-span-8 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-2 custom-scrollbar pb-12">
            <AnimatePresence mode="wait">
              {quote ? (
                <motion.div
                  key="quote-preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                    <div className="flex flex-col gap-1 flex-1 max-w-md">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/30">Nome del Preventivo</h3>
                      <div className="relative group">
                        <FormInput 
                          value={quoteName}
                          onChange={(val) => setQuoteName(val)}
                          placeholder="Inserisci un nome per il preventivo..."
                          className="w-full bg-emerald-50 text-emerald-900 px-3 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border border-emerald-100 transition-all"
                        />
                        <Edit2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 group-hover:text-emerald-600 transition-colors pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => saveQuote(false)}
                        className="p-2 hover:bg-white rounded-lg border border-black/5 transition-colors text-black/60 hover:text-black flex items-center gap-2 text-sm px-3"
                      >
                        <Save size={16} /> {quoteId ? 'Aggiorna' : 'Salva'}
                      </button>
                      {quoteId && (
                        <button 
                          onClick={() => saveQuote(true)}
                          className="p-2 hover:bg-white rounded-lg border border-black/5 transition-colors text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm px-3"
                          title="Salva come nuovo preventivo"
                        >
                          <Plus size={16} /> Salva come copia
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrint('quote')}
                        disabled={isGeneratingPdf}
                        className="p-2 hover:bg-white rounded-lg border border-black/5 transition-colors text-black/60 hover:text-black flex items-center gap-2 text-sm px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                        {isGeneratingPdf ? 'Generazione...' : 'Scarica Preventivo'}
                      </button>
                      <button 
                        onClick={() => handlePrint('pos')}
                        disabled={isGeneratingPdf}
                        className="p-2 hover:bg-white rounded-lg border border-black/5 transition-colors text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm px-3 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                      >
                        {isGeneratingPdf ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} 
                        {isGeneratingPdf ? 'Generazione...' : 'Scarica POS'}
                      </button>
                    </div>
                  </div>

                  {/* The actual document */}
                  <div 
                    ref={printRef}
                    className="bg-white shadow-2xl shadow-black/5 border border-black/5 rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none"
                  >
                    {/* Document Header */}
                    <div className="p-8 border-b border-black/5 bg-neutral-50/50">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                              <FileText size={20} />
                            </div>
                            <span className="text-xl font-bold tracking-tighter">PREVENTIVO</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-black/30">Oggetto:</p>
                            <h4 
                              contentEditable 
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                if (quote) {
                                  const newTitle = e.currentTarget.innerText;
                                  let updatedPdfData = quote.pdfData;
                                  if (updatedPdfData) {
                                    updatedPdfData = { ...updatedPdfData, jobTitle: newTitle };
                                  }
                                  setQuote({ ...quote, jobTitle: newTitle, pdfData: updatedPdfData });
                                }
                              }}
                              className="text-xl font-medium focus:outline-none focus:bg-emerald-50 rounded px-1 -ml-1 flex-1"
                            >
                              {quote.jobTitle}
                            </h4>
                          </div>
                        </div>
                        <div className="text-right space-y-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Codice</p>
                            <p className="text-sm font-mono font-bold text-emerald-600">
                              {(() => {
                                const currentSaved = savedQuotes.find(q => q.id === quoteId);
                                return currentSaved?.shortCode ? `${currentSaved.shortCode}` : (quoteId ? 'SALVA PER GENERARE' : 'NUOVO');
                              })()}
                            </p>
                            {quoteId && (
                              <p className="text-[9px] font-mono text-black/20 mt-0.5">{quoteId}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Data</p>
                            <p className="text-sm font-medium">{new Date().toLocaleDateString('it-IT')}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Provincia (rilevata)</p>
                            <p className="text-sm font-medium">{quote.province}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Esecutore</p>
                          <div className="text-sm space-y-1 text-black/70">
                            <p className="font-bold text-black">{companyData.name || 'Impresa Edile / Professionista'}</p>
                            <p>P.IVA/C.F.: {companyData.vatNumber || '00000000000'}</p>
                            <p>{companyData.address || 'Indirizzo sede legale'}</p>
                            {companyData.phone && <p>Tel: {companyData.phone}</p>}
                            {companyData.email && <p>Email: {companyData.email}</p>}
                            {companyData.website && <p>Web: {companyData.website}</p>}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Destinatario</p>
                          <div className="text-sm space-y-1 text-black/70">
                            <p 
                              contentEditable 
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                if (quote) {
                                  setQuote({
                                    ...quote,
                                    clientInfo: { ...quote.clientInfo, name: e.currentTarget.innerText }
                                  });
                                }
                              }}
                              className="font-bold text-black focus:outline-none focus:bg-emerald-50 rounded px-1 -ml-1"
                            >
                              {quote.clientInfo?.name || 'Spett.le Cliente'}
                            </p>
                            <p>Indirizzo cantiere: {siteAddress}</p>
                            {quote.siteDetails && (
                              <div className="mt-2 p-2 bg-neutral-50 rounded-lg border border-black/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">Dettagli Cantiere</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                  {quote.siteDetails.floor && <div><span className="text-black/40">Piano:</span> {quote.siteDetails.floor}</div>}
                                  {quote.siteDetails.accessibility && <div><span className="text-black/40">Accesso:</span> {quote.siteDetails.accessibility}</div>}
                                  {quote.siteDetails.siteStatus && <div><span className="text-black/40">Stato:</span> {quote.siteDetails.siteStatus}</div>}
                                  {quote.siteDetails.liftAvailable && <div><span className="text-black/40">Ascensore:</span> Sì</div>}
                                  {quote.siteDetails.ztl && quote.siteDetails.ztl !== 'No' && <div><span className="text-black/40">ZTL:</span> {quote.siteDetails.ztl}</div>}
                                  
                                  {quote.siteDetails.siteNotes && (
                                    <div className="col-span-2 mt-1 pt-1 border-t border-black/5">
                                      <span className="text-black/40 mr-1">Note Inquadramento:</span>
                                      <span className="italic">{quote.siteDetails.siteNotes}</span>
                                    </div>
                                  )}

                                  {(quote.siteDetails.sqm || quote.siteDetails.bathrooms || quote.siteDetails.doors || quote.siteDetails.windows) && (
                                    <div className="col-span-2 mt-1 pt-1 border-t border-black/5">
                                      <span className="text-black/40 mr-1">Misure:</span>
                                      <span className="inline-flex flex-wrap gap-2">
                                        {quote.siteDetails.sqm && <span>{quote.siteDetails.sqm} mq</span>}
                                        {quote.siteDetails.bathrooms && <span>{quote.siteDetails.bathrooms} bagni</span>}
                                        {quote.siteDetails.doors && <span>{quote.siteDetails.doors} porte</span>}
                                        {quote.siteDetails.windows && <span>{quote.siteDetails.windows} finestre</span>}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Capitolato Descrittivo */}
                    {quote.specifications && (
                      <div className="px-8 py-6 border-b border-black/5 bg-neutral-50/30">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-3">Capitolato Descrittivo dei Lavori</p>
                        <div 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            if (quote) {
                              const newSpec = e.currentTarget.innerText;
                              let updatedPdfData = quote.pdfData;
                              if (updatedPdfData) {
                                updatedPdfData = { ...updatedPdfData, specifications: newSpec };
                              }
                              setQuote({ ...quote, specifications: newSpec, pdfData: updatedPdfData });
                            }
                          }}
                          className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap italic focus:outline-none focus:bg-emerald-50 rounded px-1 -ml-1"
                        >
                          {quote.specifications}
                        </div>
                      </div>
                    )}

                    {/* Informazioni Generali POS */}
                    {quote.posGeneralInfo && (
                      <div className="px-8 py-6 border-b border-black/5 bg-amber-50/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Icons.Shield size={14} className="text-amber-600" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700/60">Informazioni Generali Sicurezza (POS)</p>
                        </div>
                        <div 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            if (quote) {
                              const newPosInfo = e.currentTarget.innerText;
                              let updatedPdfData = quote.pdfData;
                              if (updatedPdfData) {
                                updatedPdfData = { ...updatedPdfData, posGeneralInfo: newPosInfo };
                              }
                              setQuote({ ...quote, posGeneralInfo: newPosInfo, pdfData: updatedPdfData });
                            }
                          }}
                          className="text-sm text-amber-900/70 leading-relaxed whitespace-pre-wrap italic focus:outline-none focus:bg-amber-50 rounded px-1 -ml-1"
                        >
                          {quote.posGeneralInfo}
                        </div>
                      </div>
                    )}

                    {/* Table Grouped by WBS */}
                    <div className="p-8">
                      {(() => {
                        const grouped: { [key: string]: QuoteItem[] } = {};
                        quote.items.forEach(item => {
                          const category = item.wbs || 'Altro';
                          if (!grouped[category]) grouped[category] = [];
                          grouped[category].push(item);
                        });

                        let globalCounter = 0;
                        let visibleGroupCounter = 0;
                        
                        // Use wbsCategories as the primary source of truth for ordering
                        // Filter out empty categories unless they were explicitly added by the user
                        const displayCategories = wbsCategories.filter(cat => {
                          const hasItems = (grouped[cat] || []).length > 0;
                          return hasItems;
                        });

                        // Add any categories from items that are NOT in wbsCategories (fallback)
                        const extraCategories = Array.from(new Set<string>(quote.items.map(item => item.wbs || 'Altro')))
                          .filter(cat => !wbsCategories.includes(cat));
                        
                        const finalCategories = [...displayCategories, ...extraCategories];

                        return finalCategories.map((wbs) => {
                          const items = grouped[wbs] || [];
                          if (items.length === 0) return null;
                          
                          visibleGroupCounter++;

                          return (
                            <div key={wbs} className={visibleGroupCounter > 1 ? "mt-20" : "mt-8"}>
                              <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-600/20">
                                  {visibleGroupCounter}
                                </div>
                                <div className="flex-1 flex items-center justify-between gap-4">
                                  <h3 
                                    contentEditable 
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                      const newName = e.currentTarget.innerText.trim();
                                      if (!newName || newName === wbs) return;
                                      
                                      // Update categories list
                                      setWbsCategories(prev => prev.map(c => c === wbs ? newName : c));
                                      
                                      // Update items in quote
                                      if (quote) {
                                        let updatedPdfData = quote.pdfData;
                                        if (updatedPdfData && updatedPdfData.items) {
                                          updatedPdfData = {
                                            ...updatedPdfData,
                                            items: updatedPdfData.items.map(item => item.wbs === wbs ? { ...item, wbs: newName } : item)
                                          };
                                        }
                                        setQuote({
                                          ...quote,
                                          items: quote.items.map(item => item.wbs === wbs ? { ...item, wbs: newName } : item),
                                          pdfData: updatedPdfData
                                        });
                                      }
                                    }}
                                    className="text-2xl font-black uppercase tracking-tight text-emerald-600 focus:outline-none focus:bg-emerald-50 rounded px-2 py-1"
                                  >
                                    {wbs}
                                  </h3>
                                  <div className="flex items-center gap-2 print:hidden hide-in-pdf">
                                    <button 
                                      onClick={() => setIsWorkGroupModalOpen(true)}
                                      className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                      title="Gestisci gruppi di lavoro"
                                    >
                                      <Settings size={18} />
                                    </button>
                                    <button 
                                      onClick={() => setAddItemAiModal({ isOpen: true, wbs })}
                                      className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 rounded-full transition-all shadow-lg shadow-emerald-600/20 shrink-0"
                                      title={`Aggiungi voce a ${wbs}`}
                                    >
                                      <Plus size={20} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-1 h-px bg-emerald-600/10"></div>
                              </div>

                              <table className="w-full text-left border-collapse mb-8">
                                <thead>
                                  <tr className="border-b border-black/10">
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30 w-12">#</th>
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30">Descrizione</th>
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30 text-right w-20">Quantità</th>
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30 text-center w-16">Unità</th>
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30 text-right w-24">Prezzo Un.</th>
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30 text-right w-24">Totale</th>
                                    <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-black/30 w-10 print:hidden hide-in-pdf"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((item, idx) => {
                                    const originalIdx = quote.items.findIndex(i => i === item);
                                    globalCounter++;
                                    return (
                                      <tr key={idx} className="group border-b border-black/5 hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 text-sm text-black/40">{globalCounter}</td>
                                        <td className="py-4 min-w-[400px]">
                                          <div className="space-y-2">
                                            <div 
                                              contentEditable 
                                              suppressContentEditableWarning
                                              onBlur={(e) => updateItem(originalIdx, 'description', e.currentTarget.innerText)}
                                              className="text-sm font-medium focus:outline-none focus:bg-emerald-50 rounded px-1 -ml-1 whitespace-pre-wrap break-words leading-relaxed w-full text-justify"
                                            >
                                              {item.description}
                                            </div>
                                            <div className="flex items-center gap-2 print:hidden hide-in-pdf">
                                              <select
                                                value={item.wbs}
                                                onChange={(e) => updateItem(originalIdx, 'wbs', e.target.value)}
                                                className="text-[9px] font-bold uppercase tracking-widest bg-black/5 border-none rounded px-2 py-1 focus:ring-0 text-black/40 hover:text-emerald-600 transition-colors cursor-pointer"
                                              >
                                                {wbsCategories.map(cat => (
                                                  <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                                <option value="NEW">+ Nuova Categoria...</option>
                                              </select>

                                              <button 
                                                onClick={() => setInfoModal({
                                                  isOpen: true,
                                                  title: `Sicurezza: ${item.description}`,
                                                  content: item.safetyInfo || '',
                                                  type: 'safety',
                                                  itemIndex: originalIdx
                                                })}
                                                className={cn(
                                                  "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border rounded-lg px-3 py-1.5 transition-all shadow-sm",
                                                  item.safetyInfo 
                                                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 ring-1 ring-amber-200" 
                                                    : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                                )}
                                                title="Informazioni sulla sicurezza e POS"
                                              >
                                                <Shield size={12} className={item.safetyInfo ? "text-amber-600" : "text-slate-400"} /> 
                                                Sicurezza/POS
                                              </button>
                                              
                                              <button 
                                                onClick={() => setInfoModal({
                                                  isOpen: true,
                                                  title: `Corretta Posa: ${item.description}`,
                                                  content: item.installationInfo || '',
                                                  type: 'installation',
                                                  itemIndex: originalIdx
                                                })}
                                                className={cn(
                                                  "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border rounded-lg px-3 py-1.5 transition-all shadow-sm",
                                                  item.installationInfo 
                                                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 ring-1 ring-blue-200" 
                                                    : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                                )}
                                                title="Informazioni sulla corretta posa"
                                              >
                                                <Wrench size={12} className={item.installationInfo ? "text-blue-600" : "text-slate-400"} /> 
                                                Posa
                                              </button>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-4 text-right">
                                          <div 
                                            contentEditable 
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                              const val = e.currentTarget.innerText.replace(/\./g, '').replace(',', '.');
                                              updateItem(originalIdx, 'quantity', parseFloat(val) || 0);
                                            }}
                                            className="w-full text-right text-sm bg-transparent focus:outline-none focus:bg-emerald-50 rounded px-1"
                                          >
                                            {item.quantity.toLocaleString('it-IT')}
                                          </div>
                                        </td>
                                        <td className="py-4 text-center">
                                          <div 
                                            contentEditable 
                                            suppressContentEditableWarning
                                            onBlur={(e) => updateItem(originalIdx, 'unit', e.currentTarget.innerText)}
                                            className="text-sm text-black/60 focus:outline-none focus:bg-emerald-50 rounded px-1"
                                          >
                                            {item.unit}
                                          </div>
                                        </td>
                                        <td className="py-4 text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            <span className="text-xs text-black/40">€</span>
                                            <div 
                                              contentEditable 
                                              suppressContentEditableWarning
                                              onBlur={(e) => {
                                                const val = e.currentTarget.innerText.replace(/\./g, '').replace(',', '.');
                                                updateItem(originalIdx, 'unitPrice', parseFloat(val) || 0);
                                              }}
                                              className="min-w-[60px] text-right text-sm bg-transparent focus:outline-none focus:bg-emerald-50 rounded px-1"
                                            >
                                              {item.unitPrice.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-4 text-right text-sm font-semibold">
                                          € {item.total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-4 text-right print:hidden hide-in-pdf">
                                          <button 
                                            onClick={() => removeItem(originalIdx)}
                                            className="p-1 text-black/20 hover:text-red-500 transition-all"
                                            title="Elimina voce"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        });
                      })()}


                       {/* Summary */}
                       <div className="mt-12 flex justify-end">
                         <div className="w-72 space-y-3 bg-neutral-50 p-6 rounded-2xl border border-black/5">
                           <div className="flex justify-between text-sm text-black/60">
                             <span>Imponibile</span>
                             <span className="font-medium text-black">€ {quote.totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm text-black/60">
                             <div className="flex items-center gap-2">
                               <span>IVA</span>
                               <div className="flex items-center bg-white border border-black/10 rounded px-1.5 py-0.5">
                                 <input 
                                   type="number"
                                   defaultValue={vatRate}
                                   onBlur={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                                   className="w-8 text-center text-xs bg-transparent focus:outline-none"
                                 />
                                 <span className="text-[10px] font-bold">%</span>
                               </div>
                             </div>
                             <span className="font-medium text-black">€ {(quote.totalAmount * (vatRate / 100)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="pt-4 border-t border-black/10 flex justify-between items-center">
                             <span className="text-sm font-bold uppercase tracking-widest">Totale</span>
                             <span className="text-2xl font-bold tracking-tighter text-emerald-600">
                               € {(quote.totalAmount * (1 + vatRate / 100)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                             </span>
                           </div>
                         </div>
                       </div>
                    </div>

                    {/* Payment Terms & IBAN */}
                    <div className="px-8 py-6 border-t border-black/5 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Modalità di Pagamento</h3>
                        {companyData.iban && (
                          <div className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">
                            IBAN: {companyData.iban}
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-hidden border border-black/5 rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-black/30">
                              <th className="px-4 py-2 text-left">Descrizione Pagamento</th>
                              <th className="px-4 py-2 text-center w-24">%</th>
                              <th className="px-4 py-2 text-right w-32">Importo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5">
                            {paymentTerms.map((term, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2">
                                  <input 
                                    type="text"
                                    value={term.label}
                                    onChange={(e) => {
                                      const newTerms = [...paymentTerms];
                                      newTerms[idx].label = e.target.value;
                                      setPaymentTerms(newTerms);
                                    }}
                                    className="w-full bg-transparent focus:outline-none focus:bg-emerald-50 rounded px-1"
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <input 
                                      type="number"
                                      value={term.percentage}
                                      onChange={(e) => {
                                        const newPct = parseFloat(e.target.value) || 0;
                                        const newTerms = [...paymentTerms];
                                        newTerms[idx].percentage = newPct;
                                        const totalWithVat = quote.totalAmount * (1 + vatRate / 100);
                                        newTerms[idx].amount = totalWithVat * (newPct / 100);
                                        setPaymentTerms(newTerms);
                                      }}
                                      className="w-12 text-center bg-transparent focus:outline-none focus:bg-emerald-50 rounded px-1"
                                    />
                                    <span className="text-[10px] font-bold text-black/30">%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                  € {term.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-3 text-[10px] text-black/30 italic">
                        * Le percentuali possono essere variate manualmente. Il totale deve corrispondere al 100%.
                      </p>
                    </div>

                    {/* Footer / Notes */}
                    <div className="p-8 bg-neutral-50/50 border-t border-black/5 space-y-6">
                      {quote.estimatedDimensionsExplanation && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Nota sulle quantità stimate</p>
                          <p 
                            contentEditable 
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              if (quote) {
                                const newExp = e.currentTarget.innerText;
                                let updatedPdfData = quote.pdfData;
                                if (updatedPdfData) {
                                  updatedPdfData = { ...updatedPdfData, estimatedDimensionsExplanation: newExp };
                                }
                                setQuote({ ...quote, estimatedDimensionsExplanation: newExp, pdfData: updatedPdfData });
                              }
                            }}
                            className="text-xs text-black/50 italic leading-relaxed focus:outline-none focus:bg-emerald-50 rounded p-1 -ml-1"
                          >
                            {quote.estimatedDimensionsExplanation}
                          </p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Note e Condizioni</p>
                        <div 
                          contentEditable 
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            if (quote) {
                              const newNotes = e.currentTarget.innerText;
                              let updatedPdfData = quote.pdfData;
                              if (updatedPdfData) {
                                updatedPdfData = { ...updatedPdfData, notes: newNotes };
                              }
                              setQuote({ ...quote, notes: newNotes, pdfData: updatedPdfData });
                            }
                          }}
                          className="text-xs text-black/60 leading-relaxed focus:outline-none focus:bg-emerald-50 rounded p-1 -ml-1"
                        >
                          {quote.notes}
                        </div>
                      </div>
                      <div className="pt-8 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Firma del Professionista</p>
                          <div className="h-12 w-48 border-b border-black/10"></div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Firma per Accettazione</p>
                          <div className="h-12 w-48 border-b border-black/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/5 rounded-3xl bg-white/30"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black/20 mb-6">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Nessun preventivo generato</h3>
                  <p className="text-black/40 text-sm max-w-xs">
                    Compila il modulo a sinistra per generare un preventivo professionale basato sull'intelligenza artificiale.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-12 px-4 border-t border-black/5 bg-white print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
              A
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-slate-900">ARTERNA</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-center">
            Software di ARTERNA © 2026 @ Tutti i diritti riservati
          </p>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-0 md:p-6 print:hidden"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white w-full h-full md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center justify-between w-full sm:w-auto">
                    <h2 className="text-lg sm:text-xl font-semibold">I miei preventivi</h2>
                    <button onClick={() => setIsModalOpen(false)} className="sm:hidden p-2 hover:bg-black/5 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 sm:border-l sm:border-black/10 sm:pl-4 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <button 
                      onClick={exportDatabase}
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all whitespace-nowrap"
                      title="Esporta tutto il database in un file JSON"
                    >
                      <Download size={14} /> Esporta DB
                    </button>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black hover:bg-black/5 px-3 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap" title="Importa un database da un file JSON">
                      <Upload size={14} /> Importa DB
                      <input type="file" accept=".json" onChange={importDatabase} className="hidden" />
                    </label>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="hidden sm:block p-2 hover:bg-black/5 rounded-full transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-6 border-b border-black/5 bg-neutral-50/50">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
                  <input 
                    type="text"
                    placeholder="Cerca per nome o cliente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-black/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {(() => {
                  const filtered = savedQuotes
                    .filter(q => {
                      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
                      if (searchTerms.length === 0 || (searchTerms.length === 1 && searchTerms[0] === '')) return true;

                      const client = (q.inputs?.clientName || q.data.clientInfo?.name || '').toLowerCase();
                      const job = q.data.jobTitle.toLowerCase();
                      const location = (q.inputs?.siteAddress || q.data.province || '').toLowerCase();
                      const date = new Date(q.date).toLocaleDateString('it-IT').toLowerCase();
                      const quoteName = q.name.toLowerCase();
                      const shortCode = (q.shortCode || '').toLowerCase();
                      const longId = q.id.toLowerCase();
                      
                      const combinedText = `${client} ${job} ${location} ${date} ${quoteName} ${shortCode} ${longId}`;
                      
                      // Every search term must be found in the combined text (AND logic)
                      return searchTerms.every(term => combinedText.includes(term));
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center text-black/40 py-12">
                        Nessun preventivo trovato.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filtered.map(q => (
                        <div key={q.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-black/5 hover:border-emerald-500/30 hover:bg-emerald-50/30 transition-all group relative overflow-hidden gap-4">
                          <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1 cursor-pointer w-full" onClick={() => loadQuote(q)}>
                            {/* Reference Index on the left */}
                            <div className="flex flex-col items-center justify-center bg-emerald-600 text-white rounded-xl w-14 h-14 sm:w-16 sm:h-16 shrink-0 shadow-lg shadow-emerald-600/20">
                              <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">N.</span>
                              <span className="text-base sm:text-lg font-black leading-none">{q.shortCode?.split('/')[0] || '-'}</span>
                              <span className="text-[10px] font-bold opacity-70 mt-0.5">{q.shortCode?.split('/')[1] || '-'}</span>
                            </div>

                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-2 gap-1 sm:gap-4">
                                <h4 className="font-bold text-black text-base sm:text-lg leading-tight truncate">
                                  <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest block mb-0.5">Committente</span>
                                  {q.inputs?.clientName || q.data.clientInfo?.name || 'N/D'}
                                </h4>
                                <div className="sm:text-right shrink-0">
                                  <p className="text-[10px] font-black uppercase text-black/30 tracking-widest leading-none mb-1">Totale</p>
                                  <p className="text-base sm:text-lg font-black text-emerald-600">€ {q.data.totalAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 sm:gap-y-4">
                                <div className="flex items-center gap-3 text-xs text-black/60">
                                  <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                                    <Briefcase size={14} className="text-black/40" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="font-bold uppercase text-[10px] text-black/30 leading-none mb-1">Lavoro</p>
                                    <p className="truncate font-medium text-sm text-black/80">{q.data.jobTitle}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xs text-black/60">
                                  <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                                    <MapPin size={14} className="text-black/40" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="font-bold uppercase text-[10px] text-black/30 leading-none mb-1">Località</p>
                                    <p className="truncate font-medium text-sm text-black/80">{q.inputs?.siteAddress || q.data.province}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-black/60">
                                  <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                                    <Calendar size={14} className="text-black/40" />
                                  </div>
                                  <div>
                                    <p className="font-bold uppercase text-[10px] text-black/30 leading-none mb-1">Data</p>
                                    <p className="font-medium text-sm text-black/80">{new Date(q.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:ml-4 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); loadQuote(q); }} 
                              className="w-10 h-10 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors shadow-sm"
                              title="Apri"
                            >
                              <FolderOpen size={18} />
                            </button>
                            <button 
                              onClick={(e) => deleteQuote(q.id, e)} 
                              className="w-10 h-10 flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm"
                              title="Elimina"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Data Modal */}
      <AnimatePresence>
        {isCompanyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCompanyModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Dati della tua Impresa</h3>
                    <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Configurazione intestazione preventivi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-black/40 hover:text-black transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">Nome Impresa / Professionista</label>
                    <input 
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                      placeholder="Es: Edilizia Moderna S.r.l."
                      className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">Partita IVA / Codice Fiscale</label>
                    <input 
                      type="text"
                      value={companyData.vatNumber}
                      onChange={(e) => setCompanyData({...companyData, vatNumber: e.target.value})}
                      placeholder="Es: 01234567890"
                      className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">Indirizzo Sede Legale</label>
                  <input 
                    type="text"
                    value={companyData.address}
                    onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                    placeholder="Via, Civico, CAP, Città (Prov)"
                    className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">Telefono / Cellulare</label>
                    <input 
                      type="text"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                      placeholder="Es: +39 012 3456789"
                      className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">Email di contatto</label>
                    <input 
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      placeholder="Es: info@impresa.it"
                      className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">Sito Web (Opzionale)</label>
                    <input 
                      type="text"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                      placeholder="Es: www.impresa.it"
                      className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">IBAN per Pagamenti (Opzionale)</label>
                    <input 
                      type="text"
                      value={companyData.iban || ''}
                      onChange={(e) => setCompanyData({...companyData, iban: e.target.value})}
                      placeholder="IT00 X 00000 00000 000000000000"
                      className="w-full bg-neutral-50 border border-black/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 flex items-start gap-3 border border-emerald-100">
                  <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Questi dati verranno inseriti automaticamente nell'intestazione di ogni nuovo preventivo generato. Puoi modificarli in qualsiasi momento.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-black/5 bg-neutral-50 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-6 py-3 rounded-2xl text-sm font-bold text-black/40 hover:text-black transition-all"
                >
                  Annulla
                </button>
                <button 
                  onClick={() => saveCompanyData(companyData)}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> Salva Dati Impresa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .lg\\:col-span-7 { width: 100% !important; }
        }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
      `}} />

      {addItemAiModal.isOpen && (
        <AddItemAiModal
          wbs={addItemAiModal.wbs}
          province={quote?.province || ''}
          onClose={() => setAddItemAiModal({ isOpen: false, wbs: '' })}
          onAdd={(item) => {
            if (quote) {
              setQuote({
                ...quote,
                items: [...quote.items, item]
              });
            }
            setAddItemAiModal({ isOpen: false, wbs: '' });
          }}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}
