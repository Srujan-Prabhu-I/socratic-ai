'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PROBLEMS = [
  { 
    id: 0, 
    title: 'Fix TLE: Find Duplicate in Array', 
    difficulty: 'Medium', 
    topic: 'Arrays', 
    description: 'Your solution works but gets Time Limit Exceeded on large inputs. Given an array of n+1 integers where each integer is between 1 and n, find the duplicate number. Your current O(n²) nested loop solution is too slow. The AI will guide you to optimize it to O(n) in under 5 questions.' 
  },
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.' },
  { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks', description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.' },
  { id: 3, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked Lists', description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.' },
  { id: 4, title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', description: 'Given an array of integers nums sorted in ascending order, and an integer target, write a function to search target in nums.' },
  { id: 5, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Dynamic Programming', description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.' },
  { id: 6, title: 'Merge Intervals', difficulty: 'Medium', topic: 'Arrays', description: 'Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals.' },
  { id: 7, title: 'LRU Cache', difficulty: 'Medium', topic: 'Hashing', description: 'Design a data structure that follows the constraints of a Least Recently Used cache.' },
  { id: 8, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Trees', description: 'Given the root of a binary tree, return the level order traversal of its nodes values.' },
  { id: 9, title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', description: 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.' },
  { id: 10, title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'Dynamic Programming', description: 'Given a string s, return the longest palindromic substring in s.' },
  { id: 11, title: 'Word Search', difficulty: 'Medium', topic: 'Backtracking', description: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.' },
  { id: 12, title: 'Course Schedule', difficulty: 'Medium', topic: 'Graphs', description: 'There are numCourses courses to take. Given prerequisites array, determine if you can finish all courses.' },
  { id: 13, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?' },
  { id: 14, title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Trees', description: 'Given the root of a binary tree, determine if it is a valid binary search tree.' },
  { id: 15, title: 'Find Median from Data Stream', difficulty: 'Hard', topic: 'Heaps', description: 'Design a data structure that supports adding integers and finding the median of all elements so far.' },
  { id: 16, title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers', description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining.' },
  { id: 17, title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Sliding Window', description: 'Given an array nums and sliding window of size k, return max value in each window.' },
  { id: 18, title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', description: 'Given two strings text1 and text2, return the length of their longest common subsequence.' },
  { id: 19, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Trees', description: 'Design an algorithm to serialize and deserialize a binary tree.' },
  { id: 20, title: 'Word Ladder', difficulty: 'Hard', topic: 'Graphs', description: 'Given two words beginWord and endWord and a dictionary, return the length of the shortest transformation sequence.' },
]

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']
const TOPICS = ['All', 'Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Stacks', 'Binary Search', 'Hashing', 'Heaps', 'Backtracking', 'Two Pointers', 'Sliding Window']

const DIFF_COLORS: Record<string, string> = {
  Easy: '#34d399',
  Medium: '#f59e0b',
  Hard: '#ef4444',
}

export default function ProblemsPage() {
  const [difficulty, setDifficulty] = useState('All')
  const [topic, setTopic] = useState('All')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const filtered = PROBLEMS.filter(p => {
    const matchDiff = difficulty === 'All' || p.difficulty === difficulty
    const matchTopic = topic === 'All' || p.topic === topic
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.topic.toLowerCase().includes(search.toLowerCase())
    return matchDiff && matchTopic && matchSearch
  })

  const startProblem = async (problem: typeof PROBLEMS[0]) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push(`/auth?redirect=/problems`)
      return
    }
    const { data } = await supabase.from('sessions').insert({
      user_id: session.user.id,
      mode: 'review',
      status: 'active',
      problem_title: problem.title,
      problem_description: problem.description,
      language: 'javascript',
    }).select().single()
    if (data) router.push(`/session/${data.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'Inter,sans-serif', color: '#fff' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <svg width="32" height="32" viewBox="0 0 44 44">
            <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="1"/><stop offset="100%" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 35 11 A 17 17 0 1 0 35 33" fill="none" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="35" cy="11" r="2" fill="#fff" opacity="0.5"/>
            <circle cx="35" cy="33" r="2" fill="#fff" opacity="0.5"/>
          </svg>
          <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.4px' }}>SocraticAI</span>
        </div>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#666', padding: '7px 16px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>← Dashboard</button>
      </nav>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '88px 40px 60px', position: 'relative', zIndex: 5 }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '8px' }}>Problem Library</h1>
          <p style={{ fontSize: '13px', color: '#555' }}>20 curated DSA problems. Pick one and let SocraticAI guide you.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' as const }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search problems..."
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '13px', fontFamily: 'Inter,sans-serif', outline: 'none', width: '200px' }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{ background: difficulty === d ? 'rgba(255,255,255,0.1)' : 'transparent', border: `1px solid ${difficulty === d ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, color: difficulty === d ? '#fff' : '#555', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Topic pills */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' as const }}>
          {TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)} style={{ background: topic === t ? 'rgba(255,255,255,0.08)' : 'transparent', border: `1px solid ${topic === t ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`, color: topic === t ? '#e5e5e5' : '#444', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>{t}</button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '28px' }}>
          {[
            { label: 'Total', value: PROBLEMS.length },
            { label: 'Easy', value: PROBLEMS.filter(p => p.difficulty === 'Easy').length },
            { label: 'Medium', value: PROBLEMS.filter(p => p.difficulty === 'Medium').length },
            { label: 'Hard', value: PROBLEMS.filter(p => p.difficulty === 'Hard').length },
          ].map((s, i) => (
            <div key={i} style={{ background: '#080808', padding: '14px 24px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1px', textTransform: 'uppercase' as const }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Problem list */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => startProblem(p)}
              onMouseEnter={e => { e.currentTarget.style.background = '#0d0d0d' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#080808' }}
              style={{ background: '#080808', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.15s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#2a2a2a', fontWeight: 500, minWidth: '28px' }}>#{p.id}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#e5e5e5', marginBottom: '3px' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: '#444' }}>{p.description.slice(0, 80)}...</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: '#444', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: '100px' }}>{p.topic}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: DIFF_COLORS[p.difficulty], border: `1px solid ${DIFF_COLORS[p.difficulty]}33`, padding: '3px 10px', borderRadius: '100px' }}>{p.difficulty}</span>
                <span style={{ color: '#333', fontSize: '14px' }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#333', fontSize: '14px' }}>No problems match your filters</div>
        )}
      </main>
    </div>
  )
}
