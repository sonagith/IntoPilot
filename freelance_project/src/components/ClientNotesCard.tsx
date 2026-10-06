import React, { useState, useEffect } from 'react';
import { fetchPlotNotesAPI, addPlotNoteAPI, updatePlotNoteAPI } from '../services/api';
import { fmtDate } from '../utils/helpers';
import { Send, Edit2, Check, X } from 'lucide-react';

export const ClientNotesCard = ({ caseData }: { caseData: any }) => {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // 🔴 Popup/Modal atan state thar
  const [viewNote, setViewNote] = useState<any>(null);

  const loadNotes = async () => {
    try {
      const res = await fetchPlotNotesAPI(caseData.id);
      if (res.status === 'success') {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  useEffect(() => {
    if (caseData?.id) loadNotes();
  }, [caseData?.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      await addPlotNoteAPI({ plot_id: caseData.id, note_text: newNote });
      setNewNote('');
      loadNotes(); 
    } catch (err) {
      alert("Failed to add note");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (note: any) => {
    setEditingId(note.id);
    setEditText(note.note_text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editText.trim()) return;
    try {
      await updatePlotNoteAPI(noteId, { note_text: editText });
      setEditingId(null);
      loadNotes(); 
    } catch (err) {
      alert("Failed to update note");
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '420px', padding: '20px', position: 'relative' }}>
      
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#0D3613' }}>
          Client Notes & Follow-ups
        </h3>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Record call updates, promises, and internal notes
        </div>
      </div>
      
      {/* NOTES LIST */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px', marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '30px' }}>
            No notes added yet.
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              
              {/* EDIT MODE */}
              {editingId === note.id ? (
                <div>
                  <textarea 
                    className="inp" 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    style={{ width: '100%', minHeight: '60px', marginBottom: '8px', fontSize: '13.5px', padding: '8px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={cancelEdit} className="btn btn-sm" style={{ padding: '4px 8px', background: '#f4f5f9', border: 'none', color: '#0D3613' }}><X size={14}/></button>
                    <button onClick={() => handleUpdateNote(note.id)} className="btn btn-sm btn-navy" style={{ padding: '4px 8px' }}><Check size={14}/></button>
                  </div>
                </div>
              ) : (
                /* VIEW MODE */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    
                    {/* 🔴 TEXT FIX: wordBreak aur Line Clamp */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: '#0D3613', 
                        fontSize: '13.5px', 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word', /* 🔴 Hei hian design a tih chhiat tur a veng ang */
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 2, /* 🔴 Tlar hnih chauh a lang ang */
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {note.note_text}
                      </div>
                      
                      {/* 🔴 Read more hmeh tur */}
                      {note.note_text.length > 80 && (
                        <button onClick={() => setViewNote(note)} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '12px', padding: '4px 0', cursor: 'pointer' }}>
                          Read more...
                        </button>
                      )}
                    </div>

                    <button onClick={() => startEdit(note)} style={{ background: 'none', border: '1px solid #eaeaea', borderRadius: '4px', cursor: 'pointer', color: 'var(--muted)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit Note">
                      <Edit2 size={12} color="#0D3613" />
                    </button>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '6px' }}>
                    {fmtDate(note.created_at)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD NOTE INPUT */}
      <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
        <input 
          type="text" 
          className="inp" 
          placeholder="Add a new note..." 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{ flex: 1, fontSize: '13.5px', padding: '10px 12px' }}
        />
        <button type="submit" className="btn btn-navy" disabled={loading || !newNote.trim()} style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Send size={16} /> <span style={{ fontSize: '13px' }}>Add</span>
        </button>
      </form>

      {/* 🔴 POPUP MODAL (Read More) */}
      {viewNote && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, borderRadius: '12px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxHeight: '85%', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0D3613' }}>Full Note</h3>
              <button onClick={() => setViewNote(null)} style={{ background: '#f4f5f9', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: '4px', display: 'flex' }}><X size={16} color="#0D3613" /></button>
            </div>
            <div style={{ color: '#0D3613', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
              {viewNote.note_text}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '20px', textAlign: 'right' }}>
              Added on: {fmtDate(viewNote.created_at)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};