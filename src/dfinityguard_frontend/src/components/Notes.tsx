import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Note {
  id: bigint;
  title: string;
  content: string;
  createdAt: bigint;
  updatedAt: bigint;
}

const Notes: React.FC = () => {
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notesActor, setNotesActor] = useState<any>(null);

  useEffect(() => {
    const loadNotesActor = async () => {
      try {
        const notesModule = await import('../../../declarations/notes');
        setNotesActor(notesModule.notes);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading notes actor:', error);
        setIsLoading(false);
      }
    };

    loadNotesActor();
  }, []);

  useEffect(() => {
    if (notesActor) {
      fetchNotes();
    }
  }, [notesActor]);

  const fetchNotes = async () => {
    if (!notesActor) return;
    setIsLoading(true);
    try {
      const fetchedNotes = await notesActor.getUserNotes();
      setUserNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      alert(`Error fetching notes: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!notesActor) return;
    if (!title.trim() || !content.trim()) {
      alert('Please enter both title and content for the note.');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Creating note with title:', title, 'and content:', content);
      const result = await notesActor.createNote(title, content);
      console.log('Create note result:', result);
      if ('ok' in result) {
        await fetchNotes();
        setTitle('');
        setContent('');
      } else {
        console.error('Error creating note:', result.err);
        alert(`Failed to create note. Error: ${result.err}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert(`An error occurred while creating the note: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!notesActor || !selectedNote) return;
    setIsLoading(true);
    try {
      const result = await notesActor.updateNote(selectedNote.id, title, content);
      if ('ok' in result) {
        await fetchNotes();
        setSelectedNote(null);
        setTitle('');
        setContent('');
      } else {
        console.error('Error updating note:', result.err);
        alert(`Failed to update note. Error: ${result.err}`);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert(`An error occurred while updating the note: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: bigint) => {
    if (!notesActor) return;
    setIsLoading(true);
    try {
      const result = await notesActor.deleteNote(noteId);
      if ('ok' in result) {
        await fetchNotes();
        if (selectedNote && selectedNote.id === noteId) {
          setSelectedNote(null);
          setTitle('');
          setContent('');
        }
      } else {
        console.error('Error deleting note:', result.err);
        alert(`Failed to delete note. Error: ${result.err}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(`An error occurred while deleting the note: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-300"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-500">My Notes</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-yellow-500">Notes List</h3>
          <ul className="space-y-2">
            {userNotes.map((note) => (
              <li 
                key={note.id.toString()} 
                className="flex items-center justify-between bg-gray-600 p-2 rounded cursor-pointer hover:bg-gray-500"
                onClick={() => handleNoteSelect(note)}
              >
                <span className="text-white truncate">{note.title}</span>
                <TrashIcon 
                  className="h-5 w-5 text-red-500 hover:text-red-600" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                />
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              setSelectedNote(null);
              setTitle('');
              setContent('');
            }}
            className="mt-4 bg-yellow-500 text-black p-2 rounded flex items-center hover:bg-yellow-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Note
          </button>
        </div>
        <div className="col-span-2 bg-gray-700 p-4 rounded-lg">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full p-2 mb-4 bg-gray-600 text-white rounded"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note Content"
            className="w-full p-2 mb-4 bg-gray-600 text-white rounded h-64 resize-none"
          />
          <button
            onClick={selectedNote ? handleUpdateNote : handleCreateNote}
            className="bg-yellow-500 text-black p-2 rounded flex items-center hover:bg-yellow-600"
          >
            {selectedNote ? (
              <>
                <PencilIcon className="h-5 w-5 mr-2" />
                Update Note
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notes;