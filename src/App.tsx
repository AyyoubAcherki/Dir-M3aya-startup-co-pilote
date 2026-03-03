import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  MessageSquare,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Loader2,
  ChevronRight,
  Download,
  Languages,
  BookOpen,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Invoice, Stats, DocType } from './types';

const translations = {
  fr: {
    dashboard: "Tableau de Bord",
    invoices: "Factures",
    documents: "Documents",
    rag: "RAG PDFs",
    assistant: "Assistant IA",
    welcome: "Bienvenue, voici ce qui se passe aujourd'hui.",
    revenue: "Chiffre d'Affaire",
    fiscal_year: "Année fiscale en cours",
    limit_ae: "Limite Auto-entrepreneur (Services)",
    used: "Utilisé",
    recent_invoices: "Factures Récentes",
    ai_insights: "Analyses IA",
    ask_anything: "Demandez n'importe quoi à Dir-M3aya",
    add_invoice: "Ajouter une Facture",
    compliance_ok: "Conformité: OK",
    type_question: "Posez votre question...",
    llama_thinking: "Llama réfléchit...",
    supports_langs: "Supporte Arabe, Anglais & Français",
    startup_copilot: "Co-pilote de Startup",
    rag_title: "RAG Llama 3.1 - Documents PDF",
    rag_desc: "Interrogez vos PDFs du dossier data avec Llama 3.1",
    index_pdfs: "Indexer les PDFs",
    indexing: "Indexation...",
    chunks_indexed: "chunks indexés",
    last_index_time: "dernière indexation",
    rag_placeholder: "Posez une question sur vos documents PDF...",
    search: "Rechercher",
    rag_answer_title: "Réponse (Llama 3.1)",
    delete: "Supprimer",
    amount: "Montant",
    date: "Date",
    client: "Client",
    category: "Catégorie",
    description: "Description",
    file: "Fichier",
    no_invoices: "Aucune facture trouvée.",
    generate: "Générer",
    legal_docs: "Documents Juridiques",
    contract: "Contrat",
    business_plan: "Business Plan",
    financial_report: "Rapport Financier",
    invoice_template: "Modèle de Facture",
    generate_ai_draft: "Générer un brouillon IA",
    generated_document: "Document Généré",
    download_pdf: "Télécharger PDF",
    near_limit_warning: "Vous approchez de votre plafond annuel. Pensez à planifier une transition vers une SARL ou à ajuster votre facturation.",
    no_invoices_yet: "Aucune facture enregistrée pour le moment.",
    growth_projection: "Basé sur votre croissance actuelle, vous atteindrez votre plafond dans environ 3 mois.",
    program_recommendation: "Je vous recommande de consulter le programme \"Intelaka\" pour un soutien à la croissance.",
    service_status: "Statut du service",
    analyzing_invoice: "Analyse de la facture en cours...",
    taxes: "Impôts à prévoir",
    tax_rate_info: "Calculé sur la base de 1% (Services) ou 0.5% (Commercial).",
  },
  en: {
    dashboard: "Dashboard",
    invoices: "Invoices",
    documents: "Documents",
    rag: "RAG PDFs",
    assistant: "AI Assistant",
    welcome: "Welcome back, here's what's happening today.",
    revenue: "Total Revenue",
    fiscal_year: "Current fiscal year",
    limit_ae: "Auto-entrepreneur Limit (Services)",
    used: "Used",
    recent_invoices: "Recent Invoices",
    ai_insights: "AI Insights",
    ask_anything: "Ask Dir-M3aya anything",
    add_invoice: "Add Invoice",
    compliance_ok: "Compliance: OK",
    type_question: "Type your question...",
    llama_thinking: "Llama is thinking...",
    supports_langs: "Supports Arabic, English & French",
    startup_copilot: "Startup Co-Pilot",
    rag_title: "RAG Llama 3.1 - PDF Documents",
    rag_desc: "Query your PDFs in the data folder with Llama 3.1",
    index_pdfs: "Index PDFs",
    indexing: "Indexing...",
    chunks_indexed: "chunks indexed",
    last_index_time: "last index",
    rag_placeholder: "Ask a question about your PDF documents...",
    search: "Search",
    rag_answer_title: "Answer (Llama 3.1)",
    delete: "Delete",
    amount: "Amount",
    date: "Date",
    client: "Client",
    category: "Category",
    description: "Description",
    file: "File",
    no_invoices: "No invoices found.",
    generate: "Generate",
    legal_docs: "Legal Documents",
    contract: "Contract",
    business_plan: "Business Plan",
    financial_report: "Financial Report",
    invoice_template: "Invoice Template",
    generate_ai_draft: "Generate AI Draft",
    generated_document: "Generated Document",
    download_pdf: "Download PDF",
    near_limit_warning: "You are approaching your annual limit. Consider planning for a transition to a SARL or adjusting your billing.",
    no_invoices_yet: "No invoices recorded yet.",
    growth_projection: "Based on your current growth, you'll reach your limit in approximately 3 months.",
    program_recommendation: "I recommend checking the \"Intelaka\" program for potential scaling support.",
    service_status: "Service Status",
    analyzing_invoice: "Invoice analysis in progress...",
    taxes: "Estimated Taxes",
    tax_rate_info: "Calculated based on 1% (Services) or 0.5% (Commercial).",
  },
  ar: {
    dashboard: "لوحة التحكم",
    invoices: "الفواتير",
    documents: "المستندات",
    rag: "البحث في الملفات",
    assistant: "مساعد المساعدة",
    welcome: "مرحباً بك، إليك ما يحدث اليوم.",
    revenue: "إجمالي الإيرادات",
    fiscal_year: "السنة المالية الحالية",
    limit_ae: "حد المقاول الذاتي (الخدمات)",
    used: "مستخدم",
    recent_invoices: "الفواتير الأخيرة",
    ai_insights: "تحليلات الذكاء الاصطناعي",
    ask_anything: "اسأل Dir-M3aya أي شيء",
    add_invoice: "إضافة فاتورة",
    compliance_ok: "الامتثال: جيد",
    type_question: "اكتب سؤالك...",
    llama_thinking: "يتم التفكير...",
    supports_langs: "يدعم العربية والإنجليزية والفرنسية",
    startup_copilot: "مساعد الشركات الناشئة",
    rag_title: "البحث في ملفات PDF - Llama 3.1",
    rag_desc: "استعلم عن ملفات PDF الخاصة بك في مجلد البيانات",
    index_pdfs: "فهرسة الملفات",
    indexing: "جاري الفهرسة...",
    chunks_indexed: "أجزاء مفهرسة",
    last_index_time: "آخر فهرسة",
    rag_placeholder: "اسأل سؤالاً عن ملفات PDF الخاصة بك...",
    search: "بحث",
    rag_answer_title: "الإجابة (Llama 3.1)",
    delete: "حذف",
    amount: "المبلغ",
    date: "التاريخ",
    client: "العميل",
    category: "الفئة",
    description: "الوصف",
    file: "الملف",
    no_invoices: "لم يتم العثور على فواتير.",
    generate: "توليد",
    legal_docs: "المستندات القانونية",
    contract: "عقد",
    business_plan: "خطة عمل",
    financial_report: "تقرير مالي",
    invoice_template: "نموذج فاتورة",
    generate_ai_draft: "توليد مسودة بالذكاء الاصطناعي",
    generated_document: "المستند المولد",
    download_pdf: "تحميل PDF",
    near_limit_warning: "أنت تقترب من حدك السنوي. فكر في التخطيط للانتقال إلى شركة ذات مسؤولية محدودة أو تعديل فواتيرك.",
    no_invoices_yet: "لم يتم تسجيل أي فواتير بعد.",
    growth_projection: "بناءً على نموك الحالي، ستصل إلى حدك خلال 3 أشهر تقريبًا.",
    program_recommendation: "أوصي بمراجعة برنامج \"انطلاقة\" للحصول على دعم محتمل للنمو.",
    service_status: "حالة الخدمة",
    analyzing_invoice: "جاري تحليل الفاتورة...",
    taxes: "الضرائب التقديرية",
    tax_rate_info: "محسوبة على أساس 1٪ (خدمات) أو 0.5٪ (تجاري).",
  }
};

export default function App() {
  const [lang, setLang] = useState<'fr' | 'en' | 'ar'>('fr');
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'documents' | 'assistant' | 'rag'>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragIndexing, setRagIndexing] = useState(false);
  const [ragStatus, setRagStatus] = useState<{ indexed: number; lastIndex: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'rag') fetchRagStatus();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [invRes, statsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/stats')
      ]);
      setInvoices(await invRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ai/analyze-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mimeType: file.type })
        });
        const analysis = await res.json();
        if (!res.ok) throw new Error(analysis.error || 'Erreur analyse');

        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...analysis, file_path: file.name })
        });

        fetchData();
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing invoice:', error);
      setIsAnalyzing(false);
    }
  };

  const deleteInvoice = async (id: number) => {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    const historyBeforeUpdate = [...chatHistory];

    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    // Add empty AI message placeholder
    setChatHistory(prev => [...prev, { role: 'ai', text: '' }]);

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 min max

    try {
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: historyBeforeUpdate }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('API Error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        setLoading(false); // Stop loading animation once stream starts
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          setChatHistory(prev => {
            const newHistory = [...prev];
            const lastIndex = newHistory.length - 1;
            if (newHistory[lastIndex].role === 'ai') {
              newHistory[lastIndex] = { ...newHistory[lastIndex], text: newHistory[lastIndex].text + text };
            }
            return newHistory;
          });
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Chat error:', error);
      const msg = error instanceof Error && error.name === 'AbortError'
        ? 'Délai dépassé (5 min). Llama peut être lent au premier lancement. Réessayez.'
        : 'Erreur de connexion. Vérifiez qu\'Ollama tourne (ollama list).';
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        if (newHistory[lastIndex].role === 'ai') {
          newHistory[lastIndex] = { ...newHistory[lastIndex], text: msg };
        }
        return newHistory;
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRagStatus = async () => {
    try {
      const res = await fetch('/api/rag/status');
      setRagStatus(await res.json());
    } catch (e) {
      console.error('RAG status:', e);
    }
  };

  const handleRagIndex = async () => {
    setRagIndexing(true);
    try {
      const res = await fetch('/api/rag/index', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchRagStatus();
      }
    } catch (e) {
      console.error('RAG index:', e);
    } finally {
      setRagIndexing(false);
    }
  };

  const handleRagQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuestion.trim()) return;
    setRagLoading(true);
    setRagAnswer('');

    try {
      const res = await fetch('/api/rag/query/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: ragQuestion }),
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        setRagLoading(false); // Hide spinner when stream starts
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          setRagAnswer(prev => (prev || '') + text);
        }
      }
    } catch (e) {
      setRagAnswer('Erreur de connexion au serveur RAG.');
    } finally {
      // Ensure loading state is reset even if stream fails early
      setRagLoading(false);
    }
  };

  const generateDoc = async (type: DocType) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data: { language: 'French', invoices: invoices.slice(0, 5) }
        })
      });
      const data = await res.json();
      setGeneratedDoc(res.ok ? (data.document || '') : (data.error || ''));
      setActiveTab('documents');
    } catch (error) {
      console.error('Doc generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (!stats) return null;
    const progress = (stats.total / stats.limits.limit_service) * 100;
    const isNearLimit = progress > 80;

    return (
      <div className={`space-y-6 ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100"
          >
            <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.revenue}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats.total.toLocaleString()} MAD</div>
            <div className="mt-2 text-sm text-slate-500">{t.fiscal_year}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100"
          >
            <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Receipt className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.taxes}</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {(stats.total_services * 0.01 + stats.total_commercial * 0.005).toFixed(2)} MAD
            </div>
            <div className="mt-2 text-[10px] text-slate-400 leading-tight">{t.tax_rate_info}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100"
          >
            <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-900">{t.limit_ae}</span>
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {Math.round(progress)}% {t.used}
              </span>
            </div>
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                className={`h-full rounded-full ${isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'} ${isRtl ? 'absolute right-0' : ''}`}
              />
            </div>
            <div className={`flex justify-between mt-2 text-xs font-medium text-slate-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <span>0 MAD</span>
              <span>{stats.limits.limit_service.toLocaleString()} MAD</span>
            </div>
            {isNearLimit && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  {t.near_limit_warning}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t.recent_invoices}</h3>
            <div className="space-y-4">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className={`flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Receipt className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className={isRtl ? 'text-right' : ''}>
                      <div className="text-sm font-semibold text-slate-900">{inv.client}</div>
                      <div className="text-xs text-slate-500">{inv.date}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">+{inv.amount} MAD</div>
                </div>
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">{t.no_invoices_yet}</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
            <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              {t.ai_insights}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                <p className={`text-sm leading-relaxed opacity-90 ${isRtl ? 'text-right' : ''}`}>
                  {t.growth_projection}
                  <br />
                  {t.program_recommendation}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {t.ask_anything}
                <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoices = () => (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="p-6 border-bottom border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{t.invoices}</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {t.add_invoice}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,application/pdf"
        />
      </div>
      <div className="overflow-x-auto">
        <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">{t.date}</th>
              <th className="px-6 py-4 font-semibold">{t.client}</th>
              <th className="px-6 py-4 font-semibold">{t.category}</th>
              <th className="px-6 py-4 font-semibold">{t.amount}</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isAnalyzing && (
              <tr className="bg-emerald-50/30 animate-pulse">
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-3 text-emerald-600 font-medium text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.analyzing_invoice}
                  </div>
                </td>
              </tr>
            )}
            {invoices.length === 0 && !isAnalyzing && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                  {t.no_invoices}
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">{inv.client}</div>
                  <div className="text-xs text-slate-500">{inv.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${inv.category === 'Services' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                    {inv.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.amount} MAD</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => deleteInvoice(inv.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAssistant = () => (
    <div className={`flex flex-col h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-bold text-slate-900">Dir-M3aya AI Assistant</span>
        </div>
        <div className={`flex items-center gap-2 text-xs text-slate-500 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Languages className="w-3 h-3" />
          {t.supports_langs}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">How can I help you today?</h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              Ask about Moroccan taxes, business registration, or government grants.
            </p>
          </div>
        )}
        {chatHistory.map((chat, i) => (
          <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${chat.role === 'user'
              ? 'bg-emerald-600 text-white rounded-tr-none'
              : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
              {chat.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-slate-500">Llama réfléchit... (peut prendre 1-2 min)</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleChat} className="p-4 bg-slate-50 border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder={t.type_question}
            className={`w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${isRtl ? 'text-right' : ''}`}
          />
          <button
            type="submit"
            disabled={loading || !chatMessage.trim()}
            className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1.5 p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50`}
          >
            <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </form>
    </div>
  );

  const renderRag = () => (
    <div className={`space-y-6 ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.rag_title}</h3>
              <p className="text-sm text-slate-500">{t.rag_desc}</p>
            </div>
          </div>
          <button
            onClick={handleRagIndex}
            disabled={ragIndexing}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {ragIndexing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {ragIndexing ? t.indexing : t.index_pdfs}
          </button>
        </div>
        {ragStatus && (
          <div className="text-xs text-slate-500 mb-4">
            {ragStatus.indexed} {t.chunks_indexed}
            {ragStatus.lastIndex > 0 && ` (${t.last_index_time}: ${new Date(ragStatus.lastIndex).toLocaleString(lang === 'ar' ? 'ar-MA' : 'fr-FR')})`}
          </div>
        )}
        <form onSubmit={handleRagQuery} className="flex gap-3">
          <input
            type="text"
            value={ragQuestion}
            onChange={(e) => setRagQuestion(e.target.value)}
            placeholder={t.rag_placeholder}
            className={`flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 ${isRtl ? 'text-right' : ''}`}
          />
          <button
            type="submit"
            disabled={ragLoading || !ragQuestion.trim()}
            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {ragLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t.search}
          </button>
        </form>
      </div>
      {ragAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <h4 className={`text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <BookOpen className="w-4 h-4 text-violet-600" />
            {t.rag_answer_title}
          </h4>
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {ragAnswer}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderDocuments = () => {
    const docTypes: { id: DocType; key: keyof typeof t }[] = [
      { id: 'Contract', key: 'contract' },
      { id: 'Business Plan', key: 'business_plan' },
      { id: 'Financial Report', key: 'financial_report' },
      { id: 'Invoice Template', key: 'invoice_template' }
    ];

    return (
      <div className={`space-y-6 ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {docTypes.map((doc) => (
            <button
              key={doc.id}
              onClick={() => generateDoc(doc.id)}
              disabled={loading}
              className={`p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group ${isRtl ? 'text-right' : 'text-left'}`}
            >
              <div className={`p-2 bg-slate-50 rounded-lg w-fit mb-3 group-hover:bg-emerald-50 transition-colors ${isRtl ? 'mr-0 ml-auto' : ''}`}>
                <FileText className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-slate-900">{t[doc.key]}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{t.generate_ai_draft}</div>
            </button>
          ))}
        </div>

        {generatedDoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{t.generated_document}</span>
              <button className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                <Download className="w-4 h-4" />
                {t.download_pdf}
              </button>
            </div>
            <div className="p-8 prose prose-slate max-w-none" dir="auto">
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                {generatedDoc}
              </pre>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col ${isRtl ? 'md:order-last' : ''}`}>
        <div className={`flex items-center gap-3 mb-10 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl">D</div>
          <div>
            <h1 className="text-lg font-bold leading-none">Dir-M3aya</h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase mt-1">{t.startup_copilot}</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
            { id: 'invoices', icon: Receipt, label: t.invoices },
            { id: 'documents', icon: FileText, label: t.documents },
            { id: 'rag', icon: BookOpen, label: t.rag },
            { id: 'assistant', icon: MessageSquare, label: t.assistant },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isRtl ? 'flex-row-reverse text-right' : ''} ${activeTab === item.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          <div className={`flex items-center gap-2 justify-center bg-white/5 p-2 rounded-xl`}>
            {(['fr', 'en', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === l ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={`flex items-center gap-3 p-3 bg-white/5 rounded-xl ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Languages className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={isRtl ? 'text-right' : ''}>
              <div className="text-xs font-bold">Auto-entrepreneur</div>
              <div className="text-[10px] text-slate-500">{t.service_status}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 md:p-10 overflow-y-auto ${isRtl ? 'text-right' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{t[activeTab as keyof typeof t] || activeTab}</h2>
            <p className="text-sm text-slate-500">{t.welcome}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t.compliance_ok}
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'invoices' && renderInvoices()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'rag' && renderRag()}
            {activeTab === 'assistant' && renderAssistant()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
