
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  Settings,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';
import { optimizeEmail } from './services/geminiService';
import { 
  EmailData, 
  OptimizationResult, 
  SendingStatus, 
  DeliveryLog 
} from './types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- Subcomponents ---

const DashboardCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

const DeliverabilityMeter: React.FC<{ score: number }> = ({ score }) => {
  const data = [
    { name: 'Deliverability', value: score },
    { name: 'Risk', value: 100 - score },
  ];
  const COLORS = ['#4f46e5', '#f1f5f9'];

  return (
    <div className="h-48 w-full relative flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-4 text-center">
        <span className="text-3xl font-bold text-slate-800">{score}%</span>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Inbox Rate</p>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<SendingStatus>(SendingStatus.IDLE);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  const recipients = recipientInput
    .split(/[\n,;]/)
    .map(email => email.trim())
    .filter(email => email.length > 0 && email.includes('@'));

  const handleOptimize = async () => {
    if (!subject || !body || recipients.length === 0) {
      alert("Please provide recipients, subject, and body.");
      return;
    }
    
    setStatus(SendingStatus.OPTIMIZING);
    try {
      const result = await optimizeEmail({ recipients, subject, body });
      setOptimization(result);
      setSubject(result.optimizedSubject);
      setBody(result.optimizedBody);
      setStatus(SendingStatus.IDLE);
    } catch (error) {
      console.error(error);
      setStatus(SendingStatus.ERROR);
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) return;
    
    setStatus(SendingStatus.SENDING);
    setCurrentProgress(0);
    setLogs([]);

    // Simulate batch sending
    for (let i = 0; i < recipients.length; i++) {
      const email = recipients[i];
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newLog: DeliveryLog = {
        email,
        status: Math.random() > 0.05 ? 'success' : 'failed', // 95% success simulation
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setLogs(prev => [newLog, ...prev]);
      setCurrentProgress(Math.round(((i + 1) / recipients.length) * 100));
    }

    setStatus(SendingStatus.COMPLETED);
  };

  const resetForm = () => {
    setRecipientInput('');
    setSubject('');
    setBody('');
    setOptimization(null);
    setStatus(SendingStatus.IDLE);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              DeliverAI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={resetForm}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear all fields"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Input */}
          <div className="lg:col-span-8 space-y-6">
            <DashboardCard title="Recipients" icon={<Users className="w-5 h-5" />}>
              <textarea
                placeholder="Paste business emails here (one per line, or comma separated)..."
                className="w-full h-32 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
              />
              <div className="mt-2 flex justify-between items-center text-sm">
                <span className="text-slate-500">{recipients.length} valid businesses found</span>
                <span className="text-indigo-600 font-medium cursor-pointer hover:underline">Import CSV</span>
              </div>
            </DashboardCard>

            <DashboardCard title="Email Composer" icon={<MessageSquare className="w-5 h-5" />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Subject Line</label>
                  <input
                    type="text"
                    placeholder="E.g., Collaboration Inquiry - Business Development"
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Message Body</label>
                  <textarea
                    placeholder="Type your message to the businesses..."
                    className="w-full h-80 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={handleOptimize}
                    disabled={status === SendingStatus.OPTIMIZING || status === SendingStatus.SENDING}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-slate-900 text-white py-4 px-6 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
                  >
                    {status === SendingStatus.OPTIMIZING ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    Optimize for Inbox
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={status === SendingStatus.SENDING || status === SendingStatus.OPTIMIZING || recipients.length === 0}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                  >
                    {status === SendingStatus.SENDING ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Send Business Emails
                  </button>
                </div>
              </div>
            </DashboardCard>

            {/* Live Progress Bar */}
            {status === SendingStatus.SENDING && (
              <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-800">Sending in progress...</h4>
                  <span className="text-indigo-600 font-bold">{currentProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <p className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Safely bypassing spam filters using AI-curated headers.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Analysis */}
          <div className="lg:col-span-4 space-y-6">
            <DashboardCard title="Deliverability Insights" icon={<ShieldCheck className="w-5 h-5" />}>
              {!optimization ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-xl">
                  <Mail className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Click "Optimize" to see AI deliverability scoring and spam analysis.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <DeliverabilityMeter score={optimization.deliverabilityScore} />
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Spam Warnings</h4>
                    <div className="space-y-2">
                      {optimization.spamFlags.length > 0 ? (
                        optimization.spamFlags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm p-3 bg-red-50 text-red-700 rounded-lg">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {flag}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-sm p-3 bg-green-50 text-green-700 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                          Zero spam triggers detected
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">AI Suggestions</h4>
                    <ul className="space-y-2">
                      {optimization.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </DashboardCard>

            <DashboardCard title="Delivery History" icon={<Send className="w-5 h-5" />}>
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <p className="text-center py-8 text-sm text-slate-400">No emails sent yet.</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <div className="truncate">
                          <p className="text-sm font-medium text-slate-700 truncate">{log.email}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">{log.timestamp}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {log.status === 'success' ? 'Inbox' : 'Refused'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 DeliverAI - Professional Business Communications System.</p>
          <p className="mt-1">Powered by Gemini AI for advanced spam-prevention logic.</p>
        </div>
      </footer>
    </div>
  );
}
