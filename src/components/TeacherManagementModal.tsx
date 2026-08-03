import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, UserPlus, Users } from 'lucide-react';
import { TeacherAddForm, TeacherListItem } from './teacher/TeacherComponents';

interface TeacherManagementModalProps {
  allUsers: UserProfile[];
  onClose: () => void;
  onAddTeacher: (newTeacher: UserProfile) => void;
  onDeleteTeacher: (userId: string, fullName: string) => void;
}

export const TeacherManagementModal: React.FC<TeacherManagementModalProps> = ({
  allUsers, onClose, onAddTeacher, onDeleteTeacher
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  return (
    <div className="modal-backdrop">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '1.25rem', background: '#1c1c1e', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="var(--primary)" /> Kelola Akun Guru
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('list')} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px', background: activeTab === 'list' ? 'var(--primary-light)' : undefined, borderColor: activeTab === 'list' ? 'var(--primary)' : undefined }}>
            <Users size={14} /> Daftar Guru ({allUsers.length})
          </button>
          <button onClick={() => setActiveTab('add')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', flex: 1, minWidth: '130px' }}>
            <UserPlus size={14} /> Tambah Akun
          </button>
        </div>

        {activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
            {allUsers.map((u) => <TeacherListItem key={u.id} user={u} onDelete={onDeleteTeacher} />)}
          </div>
        )}

        {activeTab === 'add' && (
          <TeacherAddForm allUsers={allUsers} onAddTeacher={onAddTeacher} onBack={() => setActiveTab('list')} />
        )}
      </div>
    </div>
  );
};
