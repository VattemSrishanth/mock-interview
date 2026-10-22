import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Terminal, 
  RotateCcw, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Code2
} from 'lucide-react';
import { interviewApi } from '../api/interview';

const STARTER_TEMPLATES = {
  python: `def solution():
    # Write your solution here
    print("Hello from Python!")

solution()
`,
  javascript: `function solution() {
    // Write your solution here
    console.log("Hello from JavaScript!");
}

solution();
`,
  typescript: `function solution(): void {
    // Write your solution here
    console.log("Hello from TypeScript!");
}

solution();
`,
  java: `public class Main {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Hello from Java!");
    }
}
`,
  cpp: `#include <iostream>

int main() {
    // Write your solution here
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
    // Write your solution here
    fmt.Println("Hello from Go!")
}
`
};

const LANGUAGES = [
  { id: 'python', label: 'Python (3.10)', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript (Node.js)', monaco: 'javascript' },
  { id: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { id: 'java', label: 'Java (OpenJDK)', monaco: 'java' },
  { id: 'cpp', label: 'C++ (GCC)', monaco: 'cpp' },
  { id: 'go', label: 'Go (Golang)', monaco: 'go' }
];

export default function CodeExecutionSandbox({ onInsertIntoAnswer }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(STARTER_TEMPLATES.python);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  const currentLangMeta = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(STARTER_TEMPLATES[newLang] || '// Write code here');
    setResult(null);
  };

  const handleReset = () => {
    setCode(STARTER_TEMPLATES[language] || '');
    setResult(null);
  };

  const handleRunCode = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setResult(null);
    try {
      const res = await interviewApi.executeCode({
        language,
        code,
        stdin: stdin.trim() ? stdin : undefined
      });
      setResult(res);
    } catch (err) {
      setResult({
        status: 'ERROR',
        output: err.response?.data?.message || err.message || 'Execution failed. Please check network/Piston service.',
        executionTimeMs: 0,
        exitCode: -1
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleInsert = () => {
    if (!onInsertIntoAnswer) return;
    const codeSnippet = `\`\`\`${language}\n${code}\n\`\`\``;
    const formatted = result && result.output 
      ? `${codeSnippet}\n\n*Code Execution Output:*\n\`\`\`\n${result.output.trim()}\n\`\`\`` 
      : codeSnippet;
    onInsertIntoAnswer(formatted);
    setInserted(true);
    setTimeout(() => setInserted(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Code2 className="w-4 h-4" />
            <span>Interactive Code Sandbox</span>
          </div>
          
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStdin(!showStdin)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 font-medium ${
              showStdin 
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Input (stdin)</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Reset code template"
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy code"
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onInsertIntoAnswer && (
            <button
              type="button"
              onClick={handleInsert}
              title="Insert into your interview response"
              className="text-xs px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-1.5 font-semibold"
            >
              {inserted ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <CornerDownLeft className="w-3.5 h-3.5" />}
              <span>{inserted ? 'Inserted!' : 'Insert in Answer'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="text-xs px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stdin Drawer (if opened) */}
      {showStdin && (
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex flex-col gap-1.5">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span>Standard Input (stdin)</span>
          </div>
          <textarea
            rows={2}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Type any stdin input here (passed to your program during execution)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Editor & Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[350px]">
        {/* Left: Monaco Editor (7 cols) */}
        <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-800 relative bg-[#1e1e1e]">
          <Editor
            height="350px"
            language={currentLangMeta.monaco}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              lineNumbers: 'on',
              padding: { top: 12, bottom: 12 }
            }}
          />
        </div>

        {/* Right: Execution Terminal / Output Console (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 flex flex-col h-[350px]">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Terminal Output</span>
            </div>

            {result && (
              <div className="flex items-center gap-2 text-[11px]">
                {result.executionTimeMs > 0 && (
                  <span className="flex items-center gap-1 text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {result.executionTimeMs}ms
                  </span>
                )}
                {result.status === 'SUCCESS' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Passed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    <AlertCircle className="w-3 h-3" />
                    {result.status || 'Error'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-3.5 font-mono text-xs overflow-y-auto leading-relaxed select-text">
            {isRunning ? (
              <div className="flex items-center gap-2 text-slate-400 h-full justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Executing code in isolated Piston sandbox...</span>
              </div>
            ) : result ? (
              <div>
                {result.output ? (
                  <pre className={`whitespace-pre-wrap ${
                    result.status === 'SUCCESS' ? 'text-slate-200' : 'text-rose-300'
                  }`}>
                    {result.output}
                  </pre>
                ) : (
                  <span className="text-slate-500 italic">Program completed with no console output.</span>
                )}

                {result.exitCode !== null && result.exitCode !== undefined && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                    <span>Exit code: {result.exitCode}</span>
                    {result.version && <span>Runtime: {result.language} {result.version}</span>}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic flex flex-col items-center justify-center h-full text-center px-4">
                <Play className="w-6 h-6 text-slate-700 mb-2" />
                <p>Click <strong className="text-emerald-400">Run Code</strong> to execute your solution live in the sandbox.</p>
                <p className="text-[11px] text-slate-600 mt-1">Supports stdin, multi-language runtimes, and instant stdout/stderr reporting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

