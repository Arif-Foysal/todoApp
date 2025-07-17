"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash2, Calendar, Flag } from "lucide-react"

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

export default function TodoDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      const todos: Todo[] = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        priority: (todo.priority as "low" | "medium" | "high") ?? "medium",
      }))

      const foundTodo = todos.find((t) => t.id === Number.parseInt(params.id))
      if (foundTodo) {
        setTodo(foundTodo)
        setEditForm({
          title: foundTodo.title,
          description: foundTodo.description,
          priority: (foundTodo.priority as "low" | "medium" | "high") ?? "medium",
          dueDate: foundTodo.dueDate ? foundTodo.dueDate.toISOString().split("T")[0] : "",
        })
      }
    }
  }, [params.id])

  const updateTodo = () => {
    if (!todo) return

    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      const todos: Todo[] = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }))

      const updatedTodos = todos.map((t) =>
        t.id === todo.id
          ? {
              ...t,
              title: editForm.title,
              description: editForm.description,
              priority: editForm.priority,
              dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
              updatedAt: new Date(),
            }
          : t,
      )

      localStorage.setItem("todos", JSON.stringify(updatedTodos))

      const updatedTodo = updatedTodos.find((t) => t.id === todo.id)
      if (updatedTodo) {
        setTodo(updatedTodo)
      }
      setIsEditing(false)
    }
  }

  const deleteTodo = () => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      const todos: Todo[] = JSON.parse(savedTodos)
      const filteredTodos = todos.filter((t) => t.id !== Number.parseInt(params.id))
      localStorage.setItem("todos", JSON.stringify(filteredTodos))
      router.push("/")
    }
  }

  const toggleComplete = () => {
    if (!todo) return

    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      const todos: Todo[] = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }))

      const updatedTodos = todos.map((t) =>
        t.id === todo.id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t,
      )

      localStorage.setItem("todos", JSON.stringify(updatedTodos))

      const updatedTodo = updatedTodos.find((t) => t.id === todo.id)
      if (updatedTodo) {
        setTodo(updatedTodo)
      }
    }
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Todo not found</h1>
          <Link href="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Go back to todos
          </Link>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const prioritySafe = (todo.priority ?? "medium") as "low" | "medium" | "high"
  const priorityLabel = prioritySafe.charAt(0).toUpperCase() + prioritySafe.slice(1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to todos
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={deleteTodo}
              className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
              aria-label="Delete todo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Todo Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isEditing ? (
            /* Edit Form */
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Add a description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priority: e.target.value as "low" | "medium" | "high" })
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={updateTodo}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="p-8">
              {/* Status and Priority */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleComplete}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      todo.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400"
                    }`}
                  >
                    {todo.completed && <span className="text-sm">✓</span>}
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      todo.completed ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {todo.completed ? "Completed" : "Active"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-400" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(prioritySafe)}`}>
                    {priorityLabel} Priority
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1
                className={`text-3xl font-bold mb-4 ${
                  todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
                }`}
              >
                {todo.title}
              </h1>

              {/* Description */}
              {todo.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Description</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {todo.description}
                  </p>
                </div>
              )}

              {/* Due Date */}
              {todo.dueDate && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Due:</span>
                    <span
                      className={`${
                        new Date(todo.dueDate) < new Date() && !todo.completed
                          ? "text-red-500 dark:text-red-400 font-medium"
                          : ""
                      }`}
                    >
                      {todo.dueDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-medium">Created:</span> {todo.createdAt.toLocaleDateString()} at{" "}
                    {todo.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span> {todo.updatedAt.toLocaleDateString()} at{" "}
                    {todo.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
