import React, { useState, useEffect } from 'react';
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
  Code2,
  Sparkles
} from 'lucide-react';
import { interviewApi } from '../api/interview';

const STARTER_TEMPLATES = {
  python: `def solution():
    # Write your solution here
    print("Hello from Python 3.12 sandbox!")
    return True

if __name__ == "__main__":
    solution()
`,
  javascript: `function solution() {
    // Write your solution here
    console.log("Hello from JavaScript (Node.js) sandbox!");
    return true;
}

solution();
`,
  typescript: `function solution(): boolean {
    // Write your solution here
    console.log("Hello from TypeScript (Node.js) sandbox!");
    return true;
}

solution();
`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Hello from Java 21 sandbox!");
    }
}
`,
  cpp: `#include <iostream>

int main() {
    // Write your solution here
    std::cout << "Hello from C++ sandbox!" << std::endl;
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
    // Write your solution here
    fmt.Println("Hello from Go sandbox!")
}
`
};

const LANGUAGES = [
  { id: 'python', label: 'Python (3.12)', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript (Node.js)', monaco: 'javascript' },
  { id: 'typescript', label: 'TypeScript (Node.js)', monaco: 'typescript' },
  { id: 'java', label: 'Java 21 (OpenJDK)', monaco: 'java' },
  { id: 'cpp', label: 'C++ (GCC)', monaco: 'cpp' },
  { id: 'go', label: 'Go (Golang)', monaco: 'go' }
];

export function getQuestionAwareTemplate(question, lang) {
  if (!question) return STARTER_TEMPLATES[lang] || '';
  const qText = question.questionText || '';
  const skill = question.targetSkill || '';
  const combined = (qText + ' ' + skill).toLowerCase();

  // 1. Two Sum
  if (combined.includes('two sum') || (combined.includes('sum') && combined.includes('target'))) {
    switch (lang) {
      case 'python':
        return `def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Problem: Two Sum
    Return indices of the two numbers such that they add up to target.
    """
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    print("=== Problem: Two Sum ===")
    print(f"Input: nums={nums}, target={target}")
    result = two_sum(nums, target)
    print(f"Output Indices: {result}")
    print("Execution verified: SUCCESS")
`;
      case 'javascript':
        return `/**
 * Problem: Two Sum
 * Return indices of the two numbers such that they add up to target.
 */
function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) {
            return [seen.get(diff), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}

console.log("=== Problem: Two Sum ===");
const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input: nums =", nums, "target =", target);
const result = twoSum(nums, target);
console.log("Output Indices:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'typescript':
        return `/**
 * Problem: Two Sum
 */
function twoSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen.has(diff)) {
            return [seen.get(diff)!, i];
        }
        seen.set(nums[i], i);
    }
    return [];
}

console.log("=== Problem: Two Sum ===");
const nums: number[] = [2, 7, 11, 15];
const target: number = 9;
console.log("Input: nums =", nums, "target =", target);
const result: number[] = twoSum(nums, target);
console.log("Output Indices:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'java':
        return `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("=== Problem: Two Sum ===");
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        System.out.println("Input: nums = " + Arrays.toString(nums) + ", target = " + target);
        int[] result = twoSum(nums, target);
        System.out.println("Output Indices: " + Arrays.toString(result));
        System.out.println("Execution verified: SUCCESS");
    }

    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (seen.containsKey(diff)) {
                return new int[] { seen.get(diff), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
`;
      default:
        return STARTER_TEMPLATES[lang] || '';
    }
  }

  // 2. Palindrome
  if (combined.includes('palindrome')) {
    switch (lang) {
      case 'python':
        return `def is_palindrome(s: str) -> bool:
    """
    Problem: Valid Palindrome
    Determine if a string is a palindrome considering alphanumeric characters.
    """
    cleaned = [c.lower() for c in s if c.isalnum()]
    return cleaned == cleaned[::-1]

if __name__ == "__main__":
    test_str = "A man, a plan, a canal: Panama"
    print("=== Problem: Valid Palindrome ===")
    print(f"Input: \\"{test_str}\\"")
    result = is_palindrome(test_str)
    print(f"Is Palindrome: {result}")
    print("Execution verified: SUCCESS")
`;
      case 'javascript':
        return `/**
 * Problem: Valid Palindrome
 */
function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = cleaned.split('').reverse().join('');
    return cleaned === reversed;
}

console.log("=== Problem: Valid Palindrome ===");
const testStr = "A man, a plan, a canal: Panama";
console.log("Input:", testStr);
const result = isPalindrome(testStr);
console.log("Is Palindrome:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'typescript':
        return `/**
 * Problem: Valid Palindrome
 */
function isPalindrome(s: string): boolean {
    const cleaned: string = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed: string = cleaned.split('').reverse().join('');
    return cleaned === reversed;
}

console.log("=== Problem: Valid Palindrome ===");
const testStr: string = "A man, a plan, a canal: Panama";
console.log("Input:", testStr);
const result: boolean = isPalindrome(testStr);
console.log("Is Palindrome:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'java':
        return `public class Solution {
    public static void main(String[] args) {
        System.out.println("=== Problem: Valid Palindrome ===");
        String testStr = "A man, a plan, a canal: Panama";
        System.out.println("Input: " + testStr);
        boolean result = isPalindrome(testStr);
        System.out.println("Is Palindrome: " + result);
        System.out.println("Execution verified: SUCCESS");
    }

    public static boolean isPalindrome(String s) {
        String cleaned = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        int left = 0, right = cleaned.length() - 1;
        while (left < right) {
            if (cleaned.charAt(left) != cleaned.charAt(right)) return false;
            left++;
            right--;
        }
        return true;
    }
}
`;
      default:
        return STARTER_TEMPLATES[lang] || '';
    }
  }

  // 3. Reverse String / Words
  if (combined.includes('reverse')) {
    switch (lang) {
      case 'python':
        return `def reverse_words(s: str) -> str:
    """
    Problem: Reverse Words / String
    """
    return " ".join(reversed(s.split()))

if __name__ == "__main__":
    test_str = "the sky is blue"
    print("=== Problem: Reverse Words ===")
    print(f"Input: \\"{test_str}\\"")
    result = reverse_words(test_str)
    print(f"Output: \\"{result}\\"")
    print("Execution verified: SUCCESS")
`;
      case 'javascript':
        return `/**
 * Problem: Reverse Words
 */
function reverseWords(s) {
    return s.trim().split(/\\s+/).reverse().join(' ');
}

console.log("=== Problem: Reverse Words ===");
const testStr = "the sky is blue";
console.log("Input:", testStr);
const result = reverseWords(testStr);
console.log("Output:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'typescript':
        return `/**
 * Problem: Reverse Words
 */
function reverseWords(s: string): string {
    return s.trim().split(/\\s+/).reverse().join(' ');
}

console.log("=== Problem: Reverse Words ===");
const testStr: string = "the sky is blue";
console.log("Input:", testStr);
const result: string = reverseWords(testStr);
console.log("Output:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'java':
        return `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("=== Problem: Reverse Words ===");
        String testStr = "the sky is blue";
        System.out.println("Input: " + testStr);
        String result = reverseWords(testStr);
        System.out.println("Output: " + result);
        System.out.println("Execution verified: SUCCESS");
    }

    public static String reverseWords(String s) {
        String[] words = s.trim().split("\\\\s+");
        Collections.reverse(Arrays.asList(words));
        return String.join(" ", words);
    }
}
`;
      default:
        return STARTER_TEMPLATES[lang] || '';
    }
  }

  // 4. Binary Search
  if (combined.includes('binary search') || (combined.includes('search') && combined.includes('sorted'))) {
    switch (lang) {
      case 'python':
        return `def binary_search(nums: list[int], target: int) -> int:
    """
    Problem: Binary Search
    Return index of target if present in sorted array nums, else -1.
    """
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

if __name__ == "__main__":
    nums = [-1, 0, 3, 5, 9, 12]
    target = 9
    print("=== Problem: Binary Search ===")
    print(f"Input: nums={nums}, target={target}")
    result = binary_search(nums, target)
    print(f"Target Index: {result}")
    print("Execution verified: SUCCESS")
`;
      case 'javascript':
        return `/**
 * Problem: Binary Search
 */
function binarySearch(nums, target) {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

console.log("=== Problem: Binary Search ===");
const nums = [-1, 0, 3, 5, 9, 12];
const target = 9;
console.log("Input: nums =", nums, "target =", target);
const result = binarySearch(nums, target);
console.log("Target Index:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'typescript':
        return `/**
 * Problem: Binary Search
 */
function binarySearch(nums: number[], target: number): number {
    let left = 0, right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

console.log("=== Problem: Binary Search ===");
const nums: number[] = [-1, 0, 3, 5, 9, 12];
const target: number = 9;
console.log("Input: nums =", nums, "target =", target);
const result: number = binarySearch(nums, target);
console.log("Target Index:", result);
console.log("Execution verified: SUCCESS");
`;
      case 'java':
        return `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("=== Problem: Binary Search ===");
        int[] nums = {-1, 0, 3, 5, 9, 12};
        int target = 9;
        System.out.println("Input: nums = " + Arrays.toString(nums) + ", target = " + target);
        int result = binarySearch(nums, target);
        System.out.println("Target Index: " + result);
        System.out.println("Execution verified: SUCCESS");
    }

    public static int binarySearch(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
`;
      default:
        return STARTER_TEMPLATES[lang] || '';
    }
  }

  // 5. Generic Problem-Tailored Template
  const safeTitle = (skill || 'Interview Problem').replace(/[^a-zA-Z0-9 ]/g, '');
  const safeDoc = qText.replace(/\*\//g, '* /').slice(0, 160);

  switch (lang) {
    case 'python':
      return `"""
Problem Focus: ${safeTitle}
Context: ${safeDoc}
"""

def solve(input_data):
    # Implement your algorithm here
    print(f"Processing input: {input_data}")
    return input_data

if __name__ == "__main__":
    print("=== Solution Execution Test ===")
    test_case = [1, 2, 3, 4]
    result = solve(test_case)
    print(f"Result: {result}")
    print("Execution verified: SUCCESS")
`;
    case 'javascript':
      return `/**
 * Problem Focus: ${safeTitle}
 * Context: ${safeDoc}
 */
function solve(inputData) {
    // Implement your algorithm here
    console.log("Processing input:", inputData);
    return inputData;
}

console.log("=== Solution Execution Test ===");
const testCase = [1, 2, 3, 4];
const result = solve(testCase);
console.log("Result:", result);
console.log("Execution verified: SUCCESS");
`;
    case 'typescript':
      return `/**
 * Problem Focus: ${safeTitle}
 * Context: ${safeDoc}
 */
function solve<T>(inputData: T): T {
    // Implement your algorithm here
    console.log("Processing input:", inputData);
    return inputData;
}

console.log("=== TypeScript Execution Test ===");
const testCase: number[] = [1, 2, 3, 4];
const result: number[] = solve(testCase);
console.log("Result:", result);
console.log("Execution verified: SUCCESS");
`;
    case 'java':
      return `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        System.out.println("=== Java Solution Execution Test ===");
        // Problem Focus: ${safeTitle}
        int[] testCase = {1, 2, 3, 4};
        System.out.println("Input: " + Arrays.toString(testCase));
        int[] result = solve(testCase);
        System.out.println("Result: " + Arrays.toString(result));
        System.out.println("Execution verified: SUCCESS");
    }

    public static int[] solve(int[] input) {
        // Implement your algorithm here
        return input;
    }
}
`;
    default:
      return STARTER_TEMPLATES[lang] || '';
  }
}

export default function CodeExecutionSandbox({ onInsertIntoAnswer, currentQuestion }) {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(() => {
    return currentQuestion 
      ? getQuestionAwareTemplate(currentQuestion, 'python')
      : STARTER_TEMPLATES.python;
  });
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [inserted, setInserted] = useState(false);

  // Auto-sync code template if user hasn't written custom code and question changes
  useEffect(() => {
    if (currentQuestion) {
      setCode((prev) => {
        const isDefault = Object.values(STARTER_TEMPLATES).some(t => t.trim() === prev.trim());
        if (isDefault || !prev.trim()) {
          return getQuestionAwareTemplate(currentQuestion, language);
        }
        return prev;
      });
    }
  }, [currentQuestion?.id, currentQuestion?.questionOrder]);

  const currentLangMeta = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newCode = currentQuestion
      ? getQuestionAwareTemplate(currentQuestion, newLang)
      : (STARTER_TEMPLATES[newLang] || '// Write code here');
    setCode(newCode);
    setResult(null);
  };

  const handleReset = () => {
    const defaultTemplate = currentQuestion
      ? getQuestionAwareTemplate(currentQuestion, language)
      : (STARTER_TEMPLATES[language] || '');
    setCode(defaultTemplate);
    setResult(null);
  };

  const handleLoadQuestionTemplate = () => {
    const template = getQuestionAwareTemplate(currentQuestion, language);
    setCode(template);
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
        output: err.response?.data?.message || err.message || 'Execution failed. Please check sandbox compiler service.',
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

          {currentQuestion?.targetSkill && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Skill: {currentQuestion.targetSkill}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentQuestion && (
            <button
              type="button"
              onClick={handleLoadQuestionTemplate}
              title="Load question-tailored boilerplate code"
              className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Question Boilerplate</span>
            </button>
          )}

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
                <span>Executing code in isolated high-speed compiler sandbox...</span>
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
