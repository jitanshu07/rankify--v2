import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  Brain, 
  HelpCircle, 
  CalendarRange, 
  Lightbulb, 
  Settings, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Trash2, 
  Plus, 
  Layers, 
  ArrowRight, 
  BookOpen, 
  Compass, 
  X,
  ExternalLink,
  Flame,
  Activity
} from 'lucide-react';
import { FormattedAIResponse } from '../components/FormattedAIResponse';
import { 
  getGeminiApiKey, 
  saveCustomGeminiApiKey, 
  askStudyQuestion, 
  clarifyConcept, 
  generatePersonalizedStudyPlan,
  GeminiTaskSuggestion,
  AppDiagnosticContext
} from '../services/geminiService';
import { AIMessage, PriorityType } from '../types';

type AIMentorTab = 'doubts' | 'study_plan' | 'concept_clarifier';

export const AIMentorScreen: React.FC = () => {
  const { 
    chapters, 
    trackingStateMap, 
    sessions, 
    backlogs, 
    errors, 
    profile, 
    addTodo, 
    addMultipleTodos, 
    setCurrentTab,
    addFormula 
  } = useApp();

  const [activeTab, setActiveTab] = useState<AIMentorTab>('doubts');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Doubt Solving State
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtSubject, setDoubtSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'General'>('Physics');
  const [isDoubtLoading, setIsDoubtLoading] = useState(false);
  const [doubtHistory, setDoubtHistory] = useState<AIMessage[]>(() => {
    const saved = localStorage.getItem('rankify_ai_doubts_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'msg_welcome',
        role: 'model',
        content: `👋 **Namaste ${profile.name}! I am your Rankify AI Study Guru.**\n\nI am configured specifically for **IIT JEE (Main & Advanced)** preparation. Here is how I can accelerate your rank:\n\n- **Doubt Clearance**: Ask any Physics derivation, Chemistry reaction mechanism, or Math problem.\n- **Examiner Trap Alerts**: I point out tricky negative-marking pitfalls set by IIT/NTA paper-setters.\n- **Personalized Study Plans**: Generate day-by-day timetables incorporating your real Rankify chapter progress and backlogs.\n- **Concept Breakdowns**: Get intuitive analogies, core formulas, and memory anchors.\n\nChoose a starter prompt below or enter your question to begin!`,
        timestamp: Date.now(),
        category: 'question'
      }
    ];
  });
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 2. Study Plan Generator State
  const [targetExam, setTargetExam] = useState(profile.targetExam || 'JEE Advanced 2026 (AIR < 500)');
  const [aspirantType, setAspirantType] = useState<'Class 11' | 'Class 12' | 'Dropper / Repeater'>('Class 12');
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [planDuration, setPlanDuration] = useState<number>(14);
  const [weakSubjects, setWeakSubjects] = useState<string[]>(['Mathematics']);
  const [focusChapters, setFocusChapters] = useState('');
  const [includeAppData, setIncludeAppData] = useState(true);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [planResult, setPlanResult] = useState<string | null>(() => {
    return localStorage.getItem('rankify_latest_study_plan') || null;
  });
  const [planTasks, setPlanTasks] = useState<GeminiTaskSuggestion[]>(() => {
    const saved = localStorage.getItem('rankify_latest_study_plan_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });
  const [tasksAddedNotice, setTasksAddedNotice] = useState<boolean>(false);

  // 3. Concept Clarifier State
  const [conceptSubject, setConceptSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [conceptName, setConceptName] = useState('');
  const [conceptConfusion, setConceptConfusion] = useState('');
  const [isConceptLoading, setIsConceptLoading] = useState(false);
  const [conceptResult, setConceptResult] = useState<string | null>(null);

  // Check API key presence
  useEffect(() => {
    const key = getGeminiApiKey();
    setHasApiKey(Boolean(key && key.trim()));
    setApiKeyInput(localStorage.getItem('rankify_custom_gemini_key') || '');
  }, [showSettingsModal]);

  // Save doubt history in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rankify_ai_doubts_history', JSON.stringify(doubtHistory));
    } catch (e) {
      // ignore
    }
  }, [doubtHistory]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'doubts') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [doubtHistory, isDoubtLoading, activeTab]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveApiKey = () => {
    saveCustomGeminiApiKey(apiKeyInput);
    const key = getGeminiApiKey();
    setHasApiKey(Boolean(key && key.trim()));
    setShowSettingsModal(false);
  };

  // Pre-configured questions
  const starterQuestions = [
    {
      subject: 'Physics' as const,
      text: "Why is Lenz's law considered a direct consequence of the principle of conservation of energy?",
    },
    {
      subject: 'Physics' as const,
      text: 'In pure rolling on a rough horizontal surface with no external force, why does friction do zero work?',
    },
    {
      subject: 'Chemistry' as const,
      text: 'How do I predict whether a reaction undergoes SN1, SN2, E1, or E2 elimination/substitution?',
    },
    {
      subject: 'Chemistry' as const,
      text: 'Explain Crystal Field Splitting (CFSE) in octahedral vs tetrahedral coordination complexes with pairing energy rules.',
    },
    {
      subject: 'Mathematics' as const,
      text: 'What are the classic traps in Integration by Parts when applying the ILATE rule?',
    },
    {
      subject: 'Mathematics' as const,
      text: 'How to use Cauchy-Schwarz and AM-GM inequalities effectively in JEE Advanced algebra questions?',
    },
  ];

  // Curated Concept Clarification Topics
  const curatedConcepts = [
    { subject: 'Physics' as const, name: 'Rolling without Slipping on Incline' },
    { subject: 'Physics' as const, name: 'SHM Phasor Representation & Damped Oscillations' },
    { subject: 'Physics' as const, name: 'Carnot Engine Efficiency & Entropy Change' },
    { subject: 'Chemistry' as const, name: 'Aldol vs Cannizzaro Reaction Conditions' },
    { subject: 'Chemistry' as const, name: 'Electrochemical Nernst Equation & Concentration Cells' },
    { subject: 'Chemistry' as const, name: 'Inert Pair Effect & Backbonding' },
    { subject: 'Mathematics' as const, name: "L'Hopital Rule Indeterminate Forms & Traps" },
    { subject: 'Mathematics' as const, name: 'Bayes Theorem & Total Probability Law' },
    { subject: 'Mathematics' as const, name: 'Condition of Tangency to Conics (Circle, Parabola, Ellipse)' },
  ];

  // Ask Question / Submit Doubt
  const handleAskDoubt = async (e?: React.FormEvent, customQuery?: string, customSub?: 'Physics' | 'Chemistry' | 'Mathematics' | 'General') => {
    if (e) e.preventDefault();
    const query = (customQuery || doubtQuestion).trim();
    const sub = customSub || doubtSubject;
    if (!query || isDoubtLoading) return;

    const userMessage: AIMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
      category: 'question',
    };

    setDoubtHistory((prev) => [...prev, userMessage]);
    setDoubtQuestion('');
    setIsDoubtLoading(true);

    try {
      // Build conversation history for context (last 6 messages)
      const historyContext = doubtHistory
        .filter((m) => m.id !== 'msg_welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await askStudyQuestion(query, sub, historyContext);

      const modelMessage: AIMessage = {
        id: 'bot_' + Date.now(),
        role: 'model',
        content: response.text,
        timestamp: Date.now(),
        category: 'question',
        extractedTasks: response.tasks,
      };

      setDoubtHistory((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: AIMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        content: `⚠️ **Error Generating AI Response**\n\n${err.message || 'Unable to connect to Gemini API. Please verify network connection or API Key settings.'}\n\n*Click the Settings icon at the top right to verify or update your Gemini API key.*`,
        timestamp: Date.now(),
        category: 'question',
      };
      setDoubtHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsDoubtLoading(false);
    }
  };

  // Generate Personalized Study Plan
  const handleGeneratePlan = async () => {
    if (isPlanLoading) return;
    setIsPlanLoading(true);
    setTasksAddedNotice(false);

    try {
      // Aggregate live Rankify data
      const totalHours = (sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600).toFixed(1);
      const uncompletedHighWeightage = chapters
        .filter((c) => c.weightage === 'High' && !c.isCompleted)
        .map((c) => `${c.name} (${c.subject})`);

      const mistakeMap: Record<string, number> = {};
      errors.forEach((err) => {
        mistakeMap[err.mistakeType] = (mistakeMap[err.mistakeType] || 0) + 1;
      });
      const commonMistakeTypes = Object.entries(mistakeMap).map(([type, count]) => ({ type, count }));

      const appDiagnostic: AppDiagnosticContext = {
        completedChaptersCount: chapters.filter((c) => c.isCompleted).length,
        totalChaptersCount: chapters.length,
        uncompletedHighWeightage,
        pendingBacklogs: backlogs.filter((b) => !b.isCompleted).map((b) => ({
          title: b.title,
          subject: b.subject,
          urgency: b.urgency,
        })),
        commonMistakeTypes,
        trackedStudyHours: totalHours,
      };

      const response = await generatePersonalizedStudyPlan(
        {
          targetExam,
          aspirantType,
          dailyHours,
          durationDays: planDuration,
          weakSubjects,
          focusChapters: focusChapters.trim(),
          includeAppData,
        },
        includeAppData ? appDiagnostic : undefined
      );

      setPlanResult(response.text);
      localStorage.setItem('rankify_latest_study_plan', response.text);

      if (response.tasks && response.tasks.length > 0) {
        setPlanTasks(response.tasks);
        localStorage.setItem('rankify_latest_study_plan_tasks', JSON.stringify(response.tasks));
      } else {
        setPlanTasks([]);
      }
    } catch (err: any) {
      setPlanResult(`⚠️ **Error Generating Study Plan**\n\n${err.message || 'Failed to call Gemini API.'}`);
    } finally {
      setIsPlanLoading(false);
    }
  };

  // Add all extracted tasks to Rankify To-Do
  const handleAddAllTasksToTodo = () => {
    if (planTasks.length === 0) return;
    addMultipleTodos(planTasks);
    setTasksAddedNotice(true);
    setTimeout(() => setTasksAddedNotice(false), 5000);
  };

  // Clarify Concept
  const handleClarifyConceptSubmit = async (conceptOverride?: string, subjectOverride?: 'Physics' | 'Chemistry' | 'Mathematics') => {
    const cName = (conceptOverride || conceptName).trim();
    const cSub = subjectOverride || conceptSubject;
    if (!cName || isConceptLoading) return;

    setIsConceptLoading(true);
    setConceptResult(null);

    try {
      const response = await clarifyConcept(cName, cSub, conceptConfusion.trim());
      setConceptResult(response.text);
    } catch (err: any) {
      setConceptResult(`⚠️ **Error Clarifying Concept**\n\n${err.message || 'Failed to call Gemini API.'}`);
    } finally {
      setIsConceptLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/50 via-[#121A27] to-blue-950/40 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Powered by Google Gemini 3.5 Flash</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Brain className="w-7 h-7 text-cyan-400" />
              Rankify AI Study Mentor
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Ask complex numerical and conceptual doubts, generate personalized study roadmaps synced with your live chapter progress, and dissect high-yield JEE exam traps.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-medium ${
                hasApiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{hasApiKey ? 'Gemini Ready' : 'Key Detected via Secret'}</span>
            </div>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-2xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-500/50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="AI API Settings"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Feature Subtabs */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'doubts'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ask Doubts & Q&A</span>
          </button>

          <button
            onClick={() => setActiveTab('study_plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'study_plan'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Personalized Study Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('concept_clarifier')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'concept_clarifier'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Concept Clarifier & Traps</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: ASK DOUBTS & Q&A */}
      {/* ========================================================= */}
      {activeTab === 'doubts' && (
        <div className="space-y-4">
          {/* Quick Starter Pills */}
          <div className="p-4 rounded-2xl bg-[#121A27] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Popular High-Yield JEE Questions (1-Click to Ask)
              </span>
              <button
                onClick={() => {
                  setDoubtHistory([
                    {
                      id: 'msg_welcome',
                      role: 'model',
                      content: `👋 Chat cleared. Ready for your next JEE doubt!`,
                      timestamp: Date.now(),
                      category: 'question',
                    },
                  ]);
                }}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Chat</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskDoubt(undefined, q.text, q.subject)}
                  disabled={isDoubtLoading}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-xs text-slate-300 hover:text-cyan-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      q.subject === 'Physics'
                        ? 'bg-blue-400'
                        : q.subject === 'Chemistry'
                        ? 'bg-pink-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="truncate max-w-xs sm:max-w-md">{q.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History Container */}
          <div className="rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[460px] max-h-[640px]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {doubtHistory.map((msg) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isUser
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-gradient-to-tr from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/20'
                      }`}
                    >
                      {isUser ? profile.name.charAt(0) : <Brain className="w-4 h-4 text-cyan-200" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                          : 'bg-slate-900/95 border border-slate-800/90 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.content}</p>
                      ) : (
                        <div className="space-y-3">
                          <FormattedAIResponse
                            content={msg.content}
                            onCopy={() => handleCopyText(msg.content, msg.id)}
                            isCopied={copiedId === msg.id}
                          />

                          {/* Actionable tasks if extracted */}
                          {msg.extractedTasks && msg.extractedTasks.length > 0 && (
                            <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Suggested Action Items
                                </span>
                                <button
                                  onClick={() => {
                                    if (msg.extractedTasks) {
                                      addMultipleTodos(msg.extractedTasks);
                                      setTasksAddedNotice(true);
                                      setTimeout(() => setTasksAddedNotice(false), 4000);
                                    }
                                  }}
                                  className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition cursor-pointer"
                                >
                                  Add All to To-Do
                                </button>
                              </div>
                              <div className="space-y-1">
                                {msg.extractedTasks.map((task, tIdx) => (
                                  <div
                                    key={tIdx}
                                    className="flex items-center justify-between text-xs text-slate-300 py-0.5"
                                  >
                                    <span className="truncate mr-2">• {task.title}</span>
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 flex-shrink-0">
                                      {task.subject}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-1.5 text-right ${
                          isUser ? 'text-blue-200' : 'text-slate-500'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isDoubtLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-700 flex items-center justify-center text-white">
                    <Brain className="w-4 h-4 text-cyan-200 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none p-4 bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Rankify AI is analyzing principles, equations, and examiner traps...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => handleAskDoubt(e)}
              className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2"
            >
              {/* Subject Tag Selector */}
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <select
                  value={doubtSubject}
                  onChange={(e) => setDoubtSubject(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General">All / General</option>
                </select>
              </div>

              {/* Question Text Box */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Ask a question, formula derivation, or conceptual doubt..."
                  value={doubtQuestion}
                  onChange={(e) => setDoubtQuestion(e.target.value)}
                  disabled={isDoubtLoading}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-60 pr-10"
                />
                {doubtQuestion && (
                  <button
                    type="button"
                    onClick={() => setDoubtQuestion('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!doubtQuestion.trim() || isDoubtLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: PERSONALIZED STUDY PLAN GENERATOR */}
      {/* ========================================================= */}
      {activeTab === 'study_plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarRange className="w-5 h-5 text-purple-400" />
                  Study Plan Parameters
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Customize target exam, timeline, daily hours, and incorporate your live Rankify progress.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Exam Goal</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="JEE Advanced 2026 (AIR < 500)">JEE Advanced 2026 (AIR &lt; 500)</option>
                    <option value="JEE Main 2026 Session 1 (99.5+ Percentile)">JEE Main 2026 Session 1 (99.5+ Percentile)</option>
                    <option value="JEE Main + Advanced Dual Target">JEE Main + Advanced Dual Target</option>
                    <option value="BITSAT + JEE Main Crash Schedule">BITSAT + JEE Main Crash Schedule</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Student Category</label>
                    <select
                      value={aspirantType}
                      onChange={(e) => setAspirantType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Class 11">Class 11 Aspirant</option>
                      <option value="Class 12">Class 12 Boards + JEE</option>
                      <option value="Dropper / Repeater">Dropper / Full Time</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Plan Horizon</label>
                    <select
                      value={planDuration}
                      onChange={(e) => setPlanDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value={7}>7 Days Quick Sprint</option>
                      <option value={14}>14 Days Deep Drill</option>
                      <option value={30}>30 Days Mastery</option>
                      <option value={60}>60 Days Comprehensive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1.5">
                    <span className="text-slate-300">Daily Study Capacity</span>
                    <span className="text-purple-400 font-mono font-bold">{dailyHours} Hours/Day</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={14}
                    step={1}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>4 hrs (Light)</span>
                    <span>8 hrs (Standard)</span>
                    <span>14 hrs (Hardcore)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Subjects Requiring Special Focus
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => {
                      const isSelected = weakSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            setWeakSubjects((prev) =>
                              isSelected ? prev.filter((s) => s !== sub) : [...prev, sub]
                            );
                          }}
                          className={`py-2 px-2 text-center rounded-xl font-bold border transition cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Specific Priority Chapters / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rotational Motion, Thermodynamics, Organic Reaction Mechanisms"
                    value={focusChapters}
                    onChange={(e) => setFocusChapters(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Live App Sync Toggle */}
                <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="includeAppDataCheck"
                    checked={includeAppData}
                    onChange={(e) => setIncludeAppData(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700 cursor-pointer accent-purple-500"
                  />
                  <label htmlFor="includeAppDataCheck" className="text-xs cursor-pointer">
                    <span className="font-bold text-purple-300 block">
                      Include My Live Rankify Data
                    </span>
                    <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                      Gemini will analyze your actual syllabus coverage ({chapters.filter((c) => c.isCompleted).length}/{chapters.length} ch), {backlogs.filter((b) => !b.isCompleted).length} pending backlogs, and logged test mistakes.
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isPlanLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPlanLoading ? (
                  <>
                    <Brain className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Synthesizing Tailored Timetable...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Personalized Study Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Card */}
          <div className="lg:col-span-7 space-y-4">
            {/* Extracted Tasks Card */}
            {planTasks.length > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-[#121A27] to-slate-900 border border-purple-500/40 shadow-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      Extracted Actionable Tasks ({planTasks.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Instantly turn this AI schedule into your Rankify To-Do checklist.
                    </p>
                  </div>

                  <button
                    onClick={handleAddAllTasksToTodo}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add All to My Tasks</span>
                  </button>
                </div>

                {tasksAddedNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                    <span>✓ Successfully added {planTasks.length} tasks to your To-Do list!</span>
                    <button
                      onClick={() => setCurrentTab('todo')}
                      className="underline text-[11px] text-emerald-200 hover:text-white"
                    >
                      View Tasks
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {planTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              t.subject === 'Physics'
                                ? 'bg-blue-500/20 text-blue-300'
                                : t.subject === 'Chemistry'
                                ? 'bg-pink-500/20 text-pink-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {t.subject}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              t.priority === 'High'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-200 line-clamp-2">{t.title}</p>
                      </div>

                      <button
                        onClick={() => {
                          addTodo(t.title, t.subject, t.priority);
                          setTasksAddedNotice(true);
                          setTimeout(() => setTasksAddedNotice(false), 3000);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition flex-shrink-0"
                        title="Add single task"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan Content */}
            <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl min-h-[400px]">
              {planResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <h4 className="font-bold text-white text-sm">Personalized Strategic Roadmap</h4>
                    </div>

                    <button
                      onClick={() => handleCopyText(planResult, 'study_plan')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
                    >
                      {copiedId === 'study_plan' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Plan</span>
                        </>
                      )}
                    </button>
                  </div>

                  <FormattedAIResponse content={planResult} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
                  <CalendarRange className="w-12 h-12 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-300">No Study Plan Generated Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Configure your daily hours and target exam on the left, then click "Generate Personalized Study Plan" to create an AIR timetable.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: CONCEPT CLARIFIER & TRAPS */}
      {/* ========================================================= */}
      {activeTab === 'concept_clarifier' && (
        <div className="space-y-6">
          {/* Quick Select Curated Concepts */}
          <div className="p-5 rounded-3xl bg-[#121A27] border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              High-Yield JEE Concepts Infamous for Negative Marking Traps (1-Click)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {curatedConcepts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setConceptName(item.name);
                    setConceptSubject(item.subject);
                    handleClarifyConceptSubmit(item.name, item.subject);
                  }}
                  disabled={isConceptLoading}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition flex items-center justify-between group cursor-pointer disabled:opacity-50"
                >
                  <div className="min-w-0 pr-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded mb-1 inline-block ${
                        item.subject === 'Physics'
                          ? 'bg-blue-500/20 text-blue-300'
                          : item.subject === 'Chemistry'
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {item.subject}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                      {item.name}
                    </h4>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Concept Input Form */}
          <div className="p-6 rounded-3xl bg-[#121A27] border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Dissect Any JEE Concept
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Get core physical insight, equations, top 3 examiner traps, and a high-yield practice archetype.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setConceptSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      conceptSubject === sub
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Concept / Theory Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rolling without Slipping, Aldol vs Cannizzaro, Bayes Theorem"
                  value={conceptName}
                  onChange={(e) => setConceptName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Confusion or Tricky Subtopic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Direction of static friction on inclined plane"
                  value={conceptConfusion}
                  onChange={(e) => setConceptConfusion(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleClarifyConceptSubmit()}
                disabled={!conceptName.trim() || isConceptLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs sm:text-sm hover:opacity-95 transition shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isConceptLoading ? (
                  <>
                    <Brain className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Concept & Traps...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Clarify Concept</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Concept Clarification Output */}
          {conceptResult && (
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#121A27] to-slate-900 border border-amber-500/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-base">
                    Concept Breakdown: {conceptName} ({conceptSubject})
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      addFormula({
                        title: conceptName,
                        subject: conceptSubject,
                        chapter: 'Key Concept Review',
                        formulaText: conceptResult.slice(0, 150) + '...',
                        applicationTip: 'Reviewed via AI Concept Clarifier',
                      });
                      alert('Saved concept note outline to Formula Vault!');
                    }}
                    className="text-xs text-amber-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save to Formula Vault</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(conceptResult, 'concept_result')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    {copiedId === 'concept_result' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <FormattedAIResponse content={conceptResult} />
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* GEMINI SETTINGS MODAL */}
      {/* ========================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121A27] border border-slate-700 p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini AI Configuration</h3>
                <p className="text-xs text-slate-400">Manage your Google AI Studio API integration</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Status:</span>
                  <span className={`font-bold flex items-center gap-1 ${hasApiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {hasApiKey ? '✓ Active & Ready' : '⚠️ Key Required'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Default Model:</span>
                  <span className="font-mono text-cyan-400 font-bold">gemini-3.5-flash</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Fallback Models:</span>
                  <span className="font-mono text-slate-400">gemini-3.8-flash, gemini-3.1-pro-preview</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Custom Gemini API Key (Optional Override)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (leave blank to use auto-injected project key)"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  In Google AI Studio, the API key is automatically injected via the Secrets panel. You only need to enter a key here if running standalone or testing with a personal Google AI key.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
