// Gemini API Service for Rankify IIT JEE Companion

import { PriorityType } from '../types';

export interface GeminiTaskSuggestion {
  title: string;
  subject: string;
  priority: PriorityType;
}

export interface GeminiResponse {
  text: string;
  tasks?: GeminiTaskSuggestion[];
  modelUsed: string;
}

export interface StudyPlanParams {
  targetExam: string;
  aspirantType: string;
  dailyHours: number;
  durationDays: number;
  weakSubjects: string[];
  focusChapters: string;
  includeAppData?: boolean;
}

export interface AppDiagnosticContext {
  completedChaptersCount: number;
  totalChaptersCount: number;
  uncompletedHighWeightage: string[];
  pendingBacklogs: { title: string; subject: string; urgency: string }[];
  commonMistakeTypes: { type: string; count: number }[];
  trackedStudyHours: string;
}

// Model cascade: gemini-3.5-flash -> gemini-3.8-flash -> gemini-3.1-pro-preview
const MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-pro-preview'];

export function getGeminiApiKey(): string {
  // 1. Check user custom key saved in localStorage
  const customKey = localStorage.getItem('rankify_custom_gemini_key');
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }

  // 2. Check Vite defined process.env.GEMINI_API_KEY
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // ignore
  }

  // 3. Check import.meta.env
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY as string;
    }
  } catch (e) {
    // ignore
  }

  return '';
}

export function saveCustomGeminiApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem('rankify_custom_gemini_key', key.trim());
  } else {
    localStorage.removeItem('rankify_custom_gemini_key');
  }
}

const SYSTEM_INSTRUCTION_BASE = `You are "Rankify AI Guru", an elite IIT JEE Senior Faculty and All-India-Rank (AIR < 100) Mentor for Physics, Chemistry, and Mathematics.
Your mission is to guide serious JEE Main and JEE Advanced aspirants to academic mastery and maximum score efficiency.

Guidelines:
1. Provide accurate, mathematically rigorous, and crystal-clear explanations.
2. When solving numericals or conceptual doubts, highlight:
   - Core concept & governing principles
   - Step-by-step derivation / working
   - "IIT Examiner Traps": common mistakes students make that lead to -1 negative marking
   - Quick verification tricks or dimensional/limiting-case checks
3. Format formulas cleanly using plain text or LaTeX-like notation (e.g. \\Delta G = \\Delta H - T\\Delta S, F = ma, I = \\frac{1}{2}MR^2).
4. Tone: Encouraging, razor-sharp, analytical, focused on high-yield exam strategy.
5. If recommending actionable study tasks, format them at the very end in a special block:
[TASKS_START]
- [Subject: Physics | Priority: High] Title of task
- [Subject: Chemistry | Priority: Medium] Title of task
[TASKS_END]
`;

export async function executeGeminiRequest(
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[],
  systemInstructionText: string = SYSTEM_INSTRUCTION_BASE,
  preferredModel?: string
): Promise<GeminiResponse> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      'Gemini API key not detected. Please configure GEMINI_API_KEY in your AI Studio secrets or enter an API key in the AI Mentor settings.'
    );
  }

  const modelQueue = preferredModel ? [preferredModel, ...MODELS.filter((m) => m !== preferredModel)] : MODELS;
  let lastError: any = null;

  for (const model of modelQueue) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      };

      if (systemInstructionText) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstructionText }],
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP error ${response.status}: ${response.statusText}`;
        
        // If 503 (high demand) or 404, try next model
        if (response.status === 503 || response.status === 404 || response.status === 429) {
          lastError = new Error(`${model}: ${errMsg}`);
          continue;
        }

        throw new Error(errMsg);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Received empty response from Gemini API.');
      }

      // Parse tasks if present
      const { cleanedText, tasks } = parseExtractedTasks(rawText);

      return {
        text: cleanedText,
        tasks,
        modelUsed: model,
      };
    } catch (err: any) {
      lastError = err;
      // If it was an explicit auth error (400 / 403), do not cycle other models
      if (err.message && (err.message.includes('API key not valid') || err.message.includes('permission'))) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Failed to reach Gemini API after trying available models.');
}

function parseExtractedTasks(text: string): { cleanedText: string; tasks: GeminiTaskSuggestion[] } {
  const taskBlockRegex = /\[TASKS_START\]([\s\S]*?)\[TASKS_END\]/;
  const match = text.match(taskBlockRegex);

  if (!match) {
    return { cleanedText: text, tasks: [] };
  }

  const tasksRaw = match[1];
  const cleanedText = text.replace(taskBlockRegex, '').trim();
  const tasks: GeminiTaskSuggestion[] = [];

  const lines = tasksRaw.split('\n');
  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-*]\s*/, '');
    if (!trimmed) continue;

    // Pattern: [Subject: Physics | Priority: High] Title
    const headerMatch = trimmed.match(/\[Subject:\s*([A-Za-z]+)\s*\|\s*Priority:\s*([A-Za-z]+)\]\s*(.*)/i);
    if (headerMatch) {
      const subject = headerMatch[1].trim();
      const priorityRaw = headerMatch[2].trim().toLowerCase();
      const title = headerMatch[3].trim();

      const priority: PriorityType =
        priorityRaw === 'high' ? 'High' : priorityRaw === 'low' ? 'Low' : 'Medium';

      tasks.push({
        title,
        subject: ['Physics', 'Chemistry', 'Mathematics'].includes(subject) ? subject : 'General',
        priority,
      });
    } else if (trimmed.length > 5) {
      // Fallback simple task
      tasks.push({
        title: trimmed,
        subject: 'General',
        priority: 'Medium',
      });
    }
  }

  return { cleanedText, tasks };
}

/**
 * Ask a General Study Question or Numerical Doubt
 */
export async function askStudyQuestion(
  question: string,
  subject: string,
  history: { role: 'user' | 'model'; content: string }[] = []
): Promise<GeminiResponse> {
  const contents = history.map((item) => ({
    role: item.role,
    parts: [{ text: item.content }],
  }));

  const promptText = `[STUDENT QUERY - Subject: ${subject}]
${question}

Please provide a detailed, concept-first, exam-oriented response. Include step-by-step logic, relevant formulas, key traps to avoid, and a quick self-check tip.`;

  contents.push({
    role: 'user',
    parts: [{ text: promptText }],
  });

  return executeGeminiRequest(contents);
}

/**
 * Clarify a Challenging JEE Concept
 */
export async function clarifyConcept(
  conceptName: string,
  subject: string,
  specificFocus?: string
): Promise<GeminiResponse> {
  const prompt = `[CONCEPT CLARIFICATION REQUEST]
Subject: ${subject}
Concept: ${conceptName}
${specificFocus ? `Specific student doubt/confusion: ${specificFocus}` : ''}

Please break this concept down with the depth and precision required for IIT JEE (Main & Advanced):
1. **Core Intuition & Physical/Chemical/Mathematical Meaning**: Explain the fundamental principle simply with a clear analogy or geometric/physical picture.
2. **Key Formulas, Equations & Sign Conventions**: List the vital relations, definitions of every variable, and standard units/conventions.
3. **The Top 3 Examiner Traps**: What specific assumptions or tricky edge-cases cause negative marks in JEE tests?
4. **Standard High-Yield Problem Archetype**: Provide one classic JEE-standard problem illustrating this concept, followed by a crisp step-by-step solution.
5. **Memory Anchor (3-Line Summary)**: A memorable golden rule to recall under pressure.
`;

  return executeGeminiRequest([
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ]);
}

/**
 * Generate a Personalized Study Plan with optional live app data context
 */
export async function generatePersonalizedStudyPlan(
  params: StudyPlanParams,
  appContext?: AppDiagnosticContext
): Promise<GeminiResponse> {
  let contextSnippet = '';

  if (params.includeAppData && appContext) {
    contextSnippet = `
STUDENT'S LIVE RANKIFY PROGRESS DATA:
- Overall Syllabus Coverage: ${appContext.completedChaptersCount} of ${appContext.totalChaptersCount} chapters completed.
- Logged Study Time: ${appContext.trackedStudyHours} hours recorded.
- High-Weightage Chapters Still Pending: ${
      appContext.uncompletedHighWeightage.length > 0
        ? appContext.uncompletedHighWeightage.slice(0, 8).join(', ')
        : 'All core high-weightage chapters covered!'
    }
- Urgent Backlogs to Clear: ${
      appContext.pendingBacklogs.length > 0
        ? appContext.pendingBacklogs.map((b) => `${b.title} (${b.subject} - ${b.urgency})`).join('; ')
        : 'None currently logged'
    }
- Frequent Mock Mistakes: ${
      appContext.commonMistakeTypes.length > 0
        ? appContext.commonMistakeTypes.map((m) => `${m.type}: ${m.count}`).join(', ')
        : 'None recorded'
    }
`;
  }

  const prompt = `[PERSONALIZED STUDY PLAN GENERATION]
Target Exam: ${params.targetExam}
Student Category: ${params.aspirantType}
Daily Study Capacity: ${params.dailyHours} hours/day
Plan Horizon: Next ${params.durationDays} Days
Weak / Priority Subjects: ${params.weakSubjects.join(', ') || 'Balanced across Physics, Chemistry, Math'}
Focus Chapters / Notes: ${params.focusChapters || 'All key syllabus topics'}
${contextSnippet}

Please construct an intensive, highly realistic, and actionable study timetable.
Structure your plan as follows:
1. **Strategic Overview & Daily Hour Allocation**: How to split the ${params.dailyHours} hours across Theory Revision (25%), High-Yield Problem Solving (50%), and Error/Formula Consolidation (25%).
2. **Day-by-Day or Phase-by-Phase Roadmap**: Specific chapter targets, recommended question counts (e.g. 30 PYQs/day), and revision slots. Give special priority to fixing the weak areas and pending backlogs.
3. **Error Elimination Strategy**: Targeted advice for avoiding negative marking.
4. **Mock Test & Revision Cadence**: When to write tests and analyze mistakes.

At the very end, provide 4 to 6 immediate actionable study tasks for the student in the [TASKS_START] format:
[TASKS_START]
- [Subject: Physics | Priority: High] Complete 25 PYQs on ...
- [Subject: Chemistry | Priority: High] Revise notes and mechanisms for ...
- [Subject: Mathematics | Priority: Medium] Clear backlog on ...
[TASKS_END]
`;

  return executeGeminiRequest([
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ]);
}
