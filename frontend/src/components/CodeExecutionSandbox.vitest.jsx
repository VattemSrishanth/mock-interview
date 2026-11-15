import { describe, it, expect } from 'vitest';
import { getQuestionAwareTemplate } from './CodeExecutionSandbox';

describe('CodeExecutionSandbox Question Template Engine', () => {
  const languages = ['python', 'javascript', 'typescript', 'java'];

  it('generates compilable Two Sum templates for all core languages', () => {
    const question = {
      id: 1,
      questionText: 'Implement Two Sum: Given an array of integers nums and an integer target, return indices.',
      targetSkill: 'Algorithms',
      category: 'Coding'
    };

    languages.forEach((lang) => {
      const code = getQuestionAwareTemplate(question, lang);
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThan(50);
      expect(code.toLowerCase()).toContain('two sum');

      if (lang === 'python') {
        expect(code).toContain('def two_sum');
        expect(code).toContain('if __name__ == "__main__":');
      } else if (lang === 'javascript') {
        expect(code).toContain('function twoSum');
        expect(code).toContain('console.log');
      } else if (lang === 'typescript') {
        expect(code).toContain('function twoSum(nums: number[]');
        expect(code).toContain('console.log');
      } else if (lang === 'java') {
        expect(code).toContain('public class Solution');
        expect(code).toContain('public static void main(String[] args)');
        expect(code).toContain('public static int[] twoSum');
      }
    });
  });

  it('generates compilable Palindrome templates for all core languages', () => {
    const question = {
      id: 2,
      questionText: 'Determine if a given string is a valid palindrome ignoring non-alphanumeric characters.',
      targetSkill: 'Strings',
      category: 'Coding'
    };

    languages.forEach((lang) => {
      const code = getQuestionAwareTemplate(question, lang);
      expect(code).toBeDefined();
      expect(code.toLowerCase()).toContain('palindrome');

      if (lang === 'python') {
        expect(code).toContain('def is_palindrome');
      } else if (lang === 'javascript') {
        expect(code).toContain('function isPalindrome');
      } else if (lang === 'typescript') {
        expect(code).toContain('function isPalindrome(s: string): boolean');
      } else if (lang === 'java') {
        expect(code).toContain('public class Solution');
        expect(code).toContain('public static boolean isPalindrome');
      }
    });
  });

  it('generates compilable Binary Search templates for all core languages', () => {
    const question = {
      id: 3,
      questionText: 'Given a sorted array of integers nums and a target value, write a binary search algorithm.',
      targetSkill: 'Searching',
      category: 'Coding'
    };

    languages.forEach((lang) => {
      const code = getQuestionAwareTemplate(question, lang);
      expect(code).toBeDefined();
      expect(code.toLowerCase()).toContain('binary search');

      if (lang === 'python') {
        expect(code).toContain('def binary_search');
      } else if (lang === 'javascript') {
        expect(code).toContain('function binarySearch');
      } else if (lang === 'typescript') {
        expect(code).toContain('function binarySearch');
      } else if (lang === 'java') {
        expect(code).toContain('public class Solution');
        expect(code).toContain('public static int binarySearch');
      }
    });
  });

  it('generates structured problem-tailored boilerplate for generic interview questions', () => {
    const question = {
      id: 4,
      questionText: 'How would you build a thread-safe cache in Java with LRU eviction policy?',
      targetSkill: 'Java Concurrency',
      category: 'Technical'
    };

    languages.forEach((lang) => {
      const code = getQuestionAwareTemplate(question, lang);
      expect(code).toBeDefined();
      expect(code).toContain('Java Concurrency');

      if (lang === 'python') {
        expect(code).toContain('def solve');
        expect(code).toContain('if __name__ == "__main__":');
      } else if (lang === 'javascript') {
        expect(code).toContain('function solve');
      } else if (lang === 'typescript') {
        expect(code).toContain('function solve');
      } else if (lang === 'java') {
        expect(code).toContain('public class Solution');
        expect(code).toContain('public static void main(String[] args)');
      }
    });
  });

  it('falls back to default templates when question is null or undefined', () => {
    languages.forEach((lang) => {
      const code = getQuestionAwareTemplate(null, lang);
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThan(20);
    });
  });
});
