"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, X, Sun, Moon, Check } from "lucide-react"
import Link from "next/link"

interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}

type FilterType = "all" | "active" | "completed"

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [darkMode, setDarkMode] = useState(false)
  const [showExpandedForm, setShowExpandedForm] = useState(false)
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTodoDueDate, setNewTodoDueDate] = useState("")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    const savedTheme = localStorage.getItem("theme")

    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        priority: (todo.priority as "low" | "medium" | "high") ?? "medium",
      }))
      setTodos(parsedTodos)
    }

    if (savedTheme === "dark") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  // Add new todo
  const addTodo = () => {
    if (inputValue.trim() !== "") {
      const newTodo: Todo = {
        id: Date.now(),
        title: inputValue.trim(),
        description: "",
        completed: false,
        priority: newTodoPriority,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: newTodoDueDate ? new Date(newTodoDueDate) : undefined,
      }
      setTodos([newTodo, ...todos])
      setInputValue("")
      setNewTodoPriority("medium")
      setNewTodoDueDate("")
      setShowExpandedForm(false)
    }
  }

  // Toggle todo completion
  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  // Delete todo
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  // Clear completed todos
  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case "active":
        return !todo.completed
      case "completed":
        return todo.completed
      default:
        return true
    }
  })

  // Count active todos
  const activeTodosCount = todos.filter((todo) => !todo.completed).length
  const completedTodosCount = todos.filter((todo) => todo.completed).length

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  // Close expanded form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showExpandedForm && !target.closest(".add-todo-form")) {
        setShowExpandedForm(false)
        setNewTodoPriority("medium")
        setNewTodoDueDate("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showExpandedForm])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Todo App</h1>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>

        {/* Add Todo Input */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm add-todo-form">
            <div className="flex gap-3 p-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setShowExpandedForm(true)}
                  placeholder="Add a new todo title..."
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
              <button
                onClick={addTodo}
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>

            {/* Expanded Form Options */}
            {showExpandedForm && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-4">
                  {/* Priority Pills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Priority</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setNewTodoPriority("high")}
                        className={`flex-1 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                          newTodoPriority === "high"
                            ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                        }`}
                      >
                        🔴 High
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTodoPriority("medium")}
                        className={`flex-1 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                          newTodoPriority === "medium"
                            ? "bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/25"
                            : "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
                        }`}
                      >
                        🟡 Medium
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTodoPriority("low")}
                        className={`flex-1 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
                          newTodoPriority === "low"
                            ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25"
                            : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                        }`}
                      >
                        🟢 Low
                      </button>
                    </div>
                  </div>

                  {/* Stylish Date Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Due Date (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newTodoDueDate}
                        onChange={(e) => setNewTodoDueDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                        min={new Date().toISOString().split("T")[0]}
                      />
                      {newTodoDueDate && (
                        <button
                          type="button"
                          onClick={() => setNewTodoDueDate("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                          aria-label="Clear date"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {newTodoDueDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Due:{" "}
                        {new Date(newTodoDueDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowExpandedForm(false)
                      setNewTodoPriority("medium")
                      setNewTodoDueDate("")
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTodo}
                    disabled={!inputValue.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 text-white rounded-lg transition-all duration-200 text-sm font-medium disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 disabled:shadow-none"
                  >
                    Add Todo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "active", "completed"] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                filter === filterType
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex gap-4">
            <span>{activeTodosCount} active</span>
            <span>{completedTodosCount} completed</span>
            <span>{todos.length} total</span>
          </div>
          {completedTodosCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
            >
              Clear completed
            </button>
          )}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-lg">
                {todos.length === 0
                  ? "No todos yet. Add one above!"
                  : filter === "active"
                    ? "No active todos!"
                    : "No completed todos!"}
              </div>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 ${
                  todo.completed ? "opacity-75" : ""
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    todo.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400"
                  }`}
                  aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {todo.completed && <Check className="w-4 h-4" />}
                </button>

                <Link href={`/todo/${todo.id}`} className="flex-1 min-w-0 cursor-pointer">
                  <p
                    className={`text-lg transition-all duration-200 ${
                      todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{todo.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        todo.priority === "high"
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                          : todo.priority === "medium"
                            ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {todo.priority === "high" ? "🔴" : todo.priority === "medium" ? "🟡" : "🟢"} {todo.priority}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {todo.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label="Delete todo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built with React & Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
