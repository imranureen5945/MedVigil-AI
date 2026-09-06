import React, { createContext, useContext, useState, useEffect } from 'react';
import { familyService } from '../services/familyService';
import { useAuth } from './AuthContext';

const FamilyContext = createContext(null);

export const FamilyProvider = ({ children }) => {
  const { isAuthenticated, isPatient } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    if (!isAuthenticated || !isPatient) return;
    setLoading(true);
    try {
      const members = await familyService.getMembers();
      if (members && members.length > 0) {
        setFamilyMembers(members);
        const storedActiveId = localStorage.getItem('activeMemberId');
        const found = members.find(m => String(m.id) === String(storedActiveId)) || members[0];
        setActiveMember(found);
      } else {
        // No family members yet — leave arrays empty for clean state
        setFamilyMembers([]);
        setActiveMember(null);
      }
    } catch (e) {
      console.error('Failed to load family members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [isAuthenticated, isPatient]);

  const selectActiveMember = (member) => {
    setActiveMember(member);
    if (member?.id) {
      localStorage.setItem('activeMemberId', member.id);
    }
  };

  const addMember = async (memberData) => {
    try {
      const newMember = await familyService.addMember(memberData);
      setFamilyMembers(prev => [...prev, newMember]);
      if (!activeMember || familyMembers.length === 0) {
        selectActiveMember(newMember);
      }
      return newMember;
    } catch (e) {
      // Fallback local addition
      const localMember = { ...memberData, id: Date.now() };
      setFamilyMembers(prev => [...prev, localMember]);
      if (!activeMember) selectActiveMember(localMember);
      return localMember;
    }
  };

  const updateMember = async (id, data) => {
    try {
      await familyService.updateMember(id, data);
      setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
      if (activeMember?.id === id) {
        setActiveMember(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      setFamilyMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
    }
  };

  const removeMember = async (id) => {
    try {
      await familyService.deleteMember(id);
    } catch (e) {
      console.warn('API delete failed, updating local state:', e);
    }
    setFamilyMembers(prev => {
      const updated = prev.filter(m => m.id !== id);
      if (activeMember?.id === id && updated.length > 0) {
        selectActiveMember(updated[0]);
      }
      return updated;
    });
  };

  return (
    <FamilyContext.Provider value={{
      familyMembers,
      activeMember,
      setActiveMember: selectActiveMember,
      addMember,
      updateMember,
      removeMember,
      refreshMembers: fetchMembers,
      loading
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => useContext(FamilyContext);
