import { useMemo, useState } from "react";
import { useTasks } from "./hooks/useTasks";
import { useNotes } from "./hooks/useNotes";

import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import SearchBar from "./components/SearchBar";
import ChatPage from "./components/Chat/ChatPage";

type StatusFilter = "all" | "pending" | "completed";

function App() {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
  } = useTasks();

  const {
    notes,
    isLoading: isNotesLoading,
    error: notesError,
    fetchNotes,
    addNote,
  } = useNotes();

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [page, setPage] = useState<
    "tasks" | "chat" | "notes"
  >("tasks");

  const [noteText, setNoteText] = useState("");

  const [isAddingNote, setIsAddingNote] =
    useState(false);

  const [noteFormError, setNoteFormError] =
    useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" &&
          task.completed) ||
        (statusFilter === "pending" &&
          !task.completed);

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all";

  const handleAddNote = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const trimmedText = noteText.trim();

    if (!trimmedText) {
      setNoteFormError(
        "Please enter some text for your note."
      );

      return;
    }

    setNoteFormError(null);
    setIsAddingNote(true);

    try {
      await addNote(trimmedText);

      setNoteText("");
    } catch (error) {
      if (error instanceof Error) {
        setNoteFormError(error.message);
      } else {
        setNoteFormError(
          "Unable to create the note. Please try again."
        );
      }
    } finally {
      setIsAddingNote(false);
    }
  };

  const renderTaskContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading your tasks...
          </p>
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-medium text-gray-600">
            +
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            No tasks yet
          </h3>

          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Create your first task to get started.
          </p>
        </div>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center shadow-sm">
          <h3 className="font-semibold text-gray-900">
            No matching tasks
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Try changing your search or filter.
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="!m-0 !mt-4 !rounded-lg !bg-gray-900 !px-4 !py-2 !text-sm !font-medium !text-white hover:!bg-gray-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      );
    }

    return (
      <TaskList
        tasks={filteredTasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onEdit={editTask}
      />
    );
  };

  const renderNotesContent = () => {
    if (isNotesLoading) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Loading your notes...
          </p>
        </div>
      );
    }

    if (notes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600">
            +
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-900">
            No notes yet
          </h3>

          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Add a note and your AI assistant will be able
            to use it when answering relevant questions.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
              {note.text}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Task Manager
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your tasks, notes, and AI assistant
            </p>
          </div>

          <nav className="flex w-fit flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">

            <button
              type="button"
              onClick={() => setPage("tasks")}
              className={`!m-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                page === "tasks"
                  ? "!bg-gray-900 !text-white shadow-sm"
                  : "!bg-transparent !text-gray-600 hover:!bg-gray-100 hover:!text-gray-900"
              }`}
            >
              Tasks
            </button>

            <button
              type="button"
              onClick={() => setPage("notes")}
              className={`!m-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                page === "notes"
                  ? "!bg-gray-900 !text-white shadow-sm"
                  : "!bg-transparent !text-gray-600 hover:!bg-gray-100 hover:!text-gray-900"
              }`}
            >
              Notes
            </button>

            <button
              type="button"
              onClick={() => setPage("chat")}
              className={`!m-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                page === "chat"
                  ? "!bg-gray-900 !text-white shadow-sm"
                  : "!bg-transparent !text-gray-600 hover:!bg-gray-100 hover:!text-gray-900"
              }`}
            >
              AI Assistant
            </button>

          </nav>
        </header>

        {page === "tasks" ? (
          <>
            <section className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Overview
                </h2>

                <p className="text-sm text-gray-500">
                  A quick summary of your tasks
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Total Tasks
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {totalTasks}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Pending
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {pendingTasks}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">
                    Completed
                  </p>

                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {completedTasks}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  My Tasks
                </h2>

                <p className="text-sm text-gray-500">
                  View and manage your tasks
                </p>
              </div>

              <TaskForm onAddTask={addTask} />

              {!isLoading && tasks.length > 0 && (
                <div className="mb-5">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                </div>
              )}

              {!isLoading && tasks.length > 0 && (
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex flex-wrap items-center gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter("all")
                      }
                      className={`!m-0 !rounded-lg !px-4 !py-2 !text-sm !font-medium transition ${
                        statusFilter === "all"
                          ? "!bg-gray-900 !text-white"
                          : "!bg-white !text-gray-600 !ring-1 !ring-inset !ring-gray-200 hover:!bg-gray-50"
                      }`}
                    >
                      All
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter("pending")
                      }
                      className={`!m-0 !rounded-lg !px-4 !py-2 !text-sm !font-medium transition ${
                        statusFilter === "pending"
                          ? "!bg-gray-900 !text-white"
                          : "!bg-white !text-gray-600 !ring-1 !ring-inset !ring-gray-200 hover:!bg-gray-50"
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter("completed")
                      }
                      className={`!m-0 !rounded-lg !px-4 !py-2 !text-sm !font-medium transition ${
                        statusFilter === "completed"
                          ? "!bg-gray-900 !text-white"
                          : "!bg-white !text-gray-600 !ring-1 !ring-inset !ring-gray-200 hover:!bg-gray-50"
                      }`}
                    >
                      Completed
                    </button>

                  </div>

                  <p className="text-sm text-gray-500">
                    {hasActiveFilters
                      ? `Showing ${filteredTasks.length} of ${totalTasks} tasks`
                      : `${totalTasks} ${
                          totalTasks === 1
                            ? "task"
                            : "tasks"
                        }`}
                  </p>

                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="font-medium text-red-800">
                        Unable to load tasks
                      </p>

                      <p className="mt-1 text-sm text-red-600">
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={fetchTasks}
                      className="!m-0 !rounded-lg !bg-red-600 !px-4 !py-2 !text-sm !font-medium !text-white hover:!bg-red-700"
                    >
                      Retry
                    </button>

                  </div>

                </div>
              )}

              {renderTaskContent()}
            </section>
          </>
        ) : page === "notes" ? (
          <section>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                My Notes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Save information that your AI assistant can
                retrieve when answering relevant questions.
              </p>
            </div>

            <form
              onSubmit={handleAddNote}
              className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >

              <div className="mb-4">
                <label
                  htmlFor="note-text"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Add a new note
                </label>

                <textarea
                  id="note-text"
                  value={noteText}
                  onChange={(event) => {
                    setNoteText(event.target.value);

                    if (noteFormError) {
                      setNoteFormError(null);
                    }
                  }}
                  disabled={isAddingNote}
                  rows={5}
                  placeholder="e.g. We decided to use JWT authentication for the login flow..."
                  className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {noteFormError && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {noteFormError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isAddingNote ||
                    !noteText.trim()
                  }
                  className="!m-0 !rounded-lg !bg-gray-900 !px-5 !py-2.5 !text-sm !font-medium !text-white transition hover:!bg-gray-800 disabled:!cursor-not-allowed disabled:!opacity-50"
                >
                  {isAddingNote
                    ? "Adding..."
                    : "Add Note"}
                </button>
              </div>

            </form>

            {notesError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="font-medium text-red-800">
                      Unable to load notes
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {notesError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchNotes}
                    className="!m-0 !rounded-lg !bg-red-600 !px-4 !py-2 !text-sm !font-medium !text-white hover:!bg-red-700"
                  >
                    Retry
                  </button>

                </div>

              </div>
            )}

            {renderNotesContent()}
          </section>
        ) : (
          <ChatPage
            onTasksChanged={fetchTasks}
          />
        )}

      </div>
    </div>
  );
}

export default App;