"use client";

import { useState, useEffect } from "react";

interface Task {
  id: number;
  text: string;
  done: boolean;
}

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function Home() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  const totalTime = mode === "focus" ? FOCUS_TIME : BREAK_TIME;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (mode === "focus") {
            setMode("break");
            setSessions((s) => s + 1);
            return BREAK_TIME;
          } else {
            setMode("focus");
            return FOCUS_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const switchMode = (newMode: "focus" | "break") => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), done: false }]);
    setNewTaskText("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((totalTime - timeLeft) / totalTime) * circumference;

  return (
    <main className="min-h-screen bg-rose-50/50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-rose-100 dark:shadow-none border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">Focus Timer</h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            {sessions} {sessions === 1 ? "session" : "sessions"}
          </span>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl text-sm font-medium">
          <button
            onClick={() => switchMode("focus")}
            className={`py-2 rounded-xl transition ${
              mode === "focus"
                ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Focus (25m)
          </button>
          <button
            onClick={() => switchMode("break")}
            className={`py-2 rounded-xl transition ${
              mode === "break"
                ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Break (5m)
          </button>
        </div>

        {/* Circular Progress & Clock */}
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-56 h-56 -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="text-zinc-100 dark:text-zinc-800 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="text-rose-500 stroke-current transition-all duration-500 ease-linear"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tighter font-mono">{formattedTime}</span>
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold mt-1">
              {isRunning ? mode : "Paused"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-3 px-4 rounded-2xl font-semibold text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.98] transition shadow-md shadow-rose-200 dark:shadow-none"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={resetTimer}
            className="px-5 py-3 rounded-2xl font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition"
          >
            Reset
          </button>
        </div>

        {/* Task List */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Current Session Tasks</h2>
          <form onSubmit={addTask} className="flex gap-2">
            <input
              type="text"
              placeholder="What are you working on?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition"
            >
              Add
            </button>
          </form>

          <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <li className="text-xs text-zinc-400 text-center py-2">No tasks added yet</li>
            ) : (
              tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-sm"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(task.id)}
                      className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`truncate ${task.done ? "line-through text-zinc-400" : ""}`}>
                      {task.text}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-zinc-400 hover:text-rose-500 px-1 transition text-base leading-none"
                    aria-label="Delete task"
                  >
                    ×
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
