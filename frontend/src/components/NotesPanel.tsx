import { useState } from "react";
import { useNotes } from "../hooks/useNotes";

function NotesPanel() {
  const {
    notes,
    isLoading,
    error,
    fetchNotes,
    addNote,
  } = useNotes();

  const [noteText, setNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [submitError, setSubmitError] =
    useState("");

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const trimmedText = noteText.trim();

    if (!trimmedText) {
      setSubmitError(
        "Please enter some text for the note."
      );
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await addNote(trimmedText);

      setNoteText("");
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError(
          "Unable to create the note. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Add a Note
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Save information that your AI assistant can
            later search and use to answer questions.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="note-text"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Note
          </label>

          <textarea
            id="note-text"
            value={noteText}
            onChange={(event) => {
              setNoteText(event.target.value);

              if (submitError) {
                setSubmitError("");
              }
            }}
            disabled={isSubmitting}
            placeholder="e.g. We decided to use JWT authentication for the login flow..."
            rows={5}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          {submitError && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
            >
              <span className="font-semibold">!</span>

              <p className="m-0">
                {submitError}
              </p>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={
                !noteText.trim() || isSubmitting
              }
              className="!m-0 !rounded-lg !bg-gray-900 !px-5 !py-2.5 !text-sm !font-medium !text-white transition hover:!bg-gray-800 disabled:!cursor-not-allowed disabled:!opacity-50"
            >
              {isSubmitting
                ? "Adding..."
                : "Add Note"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            My Notes
          </h2>

          <p className="text-sm text-gray-500">
            Notes available for retrieval by your AI
            assistant.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

            <p className="mt-4 text-sm font-medium text-gray-700">
              Loading your notes...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-red-800">
                  Unable to load notes
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
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

        {!isLoading &&
          !error &&
          notes.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-medium text-gray-600">
                +
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No notes yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Add your first note to give your AI
                assistant information it can search.
              </p>
            </div>
          )}

        {!isLoading &&
          !error &&
          notes.length > 0 && (
            <div className="space-y-4">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                    {note.text}
                  </p>
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

export default NotesPanel;