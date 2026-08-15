import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, UserPlus, Users, Edit2 } from 'lucide-react';
import { TeacherAddForm, TeacherEditForm, TeacherListItem } from './teacher/TeacherComponents';

interface TeacherManagementModalProps {
  allUsers: UserProfile[];
  onClose: () => void;
  onAddTeacher: (newTeacher: UserProfile) => void;
  onDeleteTeacher: (userId: string, fullName: string) => void;
  onEditTeacher: (updatedTeacher: UserProfile) => void;
  onResetFace?: (userId: string, fullName: string) => void;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  allUsers, onClose, onAddTeacher, onDeleteTeacher, onEditTeacher, onResetFace
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);

  const handleStartEdit = (user: UserProfile) => {
    setEditingTeacher(user);
    setActiveTab('edit');
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '1.25rem', background: '#1c1c1e', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--primary)" /> Kelola Akun Guru
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}><X size={20} /></button>
        </div>

        {/* Tab Menu Header */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('list'); setEditingTeacher(null); }} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px', background: activeTab === 'list' ? 'var(--primary-light)' : undefined, borderColor: activeTab === 'list' ? 'var(--primary)' : undefined }}>
            <Users size={14} /> Daftar Guru ({allUsers.length})
          </button>
          <button onClick={() => { setActiveTab('add'); setEditingTeacher(null); }} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px', background: activeTab === 'add' ? 'var(--primary)' : undefined }}>
            <UserPlus size={14} /> Tambah Akun
          </button>
          {activeTab === 'edit' && (
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px', background: 'var(--primary-light)', borderColor: 'var(--primary)', color: '#fff', cursor: 'default' }} disabled>
              <Edit2 size={14} /> Edit Guru
            </button>
          )}
        </div>

        {/* Tab Content Rendering */}
        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
            {allUsers.map((u) => (
              <TeacherListItem 
                key={u.id} 
                user={u} 
                onDelete={onDeleteTeacher} 
                onEditClick={handleStartEdit} 
                onResetFace={onResetFace}
              />
            ))}
          </div>
        )}

        {activeTab === 'add' && (
          <TeacherAddForm allUsers={allUsers} onAddTeacher={onAddTeacher} onBack={() => setActiveTab('list')} />
        )}

        {activeTab === 'edit' && editingTeacher && (
          <TeacherEditForm 
            user={editingTeacher} 
            onEditTeacher={onEditTeacher} 
            onBack={() => { setActiveTab('list'); setEditingTeacher(null); }} 
          />
        )}
      </div>
    </div>
  );
};
