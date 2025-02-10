import { createContext, useContext,  Dispatch } from 'react';
import { Resume } from '@/lib/types';

interface ResumeState {
  resume: Resume;
  isSaving: boolean;
  isDeleting: boolean;
  hasUnsavedChanges: boolean;
}

type ResumeAction = 
  | { type: 'UPDATE_FIELD'; field: keyof Resume; value: Resume[keyof Resume] }
  | { type: 'SET_SAVING'; value: boolean }
  | { type: 'SET_DELETING'; value: boolean }
  | { type: 'SET_HAS_CHANGES'; value: boolean };

const ResumeContext = createContext<{
  state: ResumeState;
  dispatch: Dispatch<ResumeAction>;
} | null>(null);

function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      const newState = {
        ...state,
        resume: {
          ...state.resume,
          [action.field]: action.value
        }
      };
      return newState;


      
    case 'SET_SAVING':
      // console.log('Resume Editor Context - Saving State:', action.value);
      return { ...state, isSaving: action.value };
    case 'SET_DELETING':
      // console.log('Resume Editor Context - Deleting State:', action.value);
      return { ...state, isDeleting: action.value };
    case 'SET_HAS_CHANGES':
      // console.log('Resume Editor Context - Unsaved Changes:', action.value);
      return { ...state, hasUnsavedChanges: action.value };
    default:
      return state;
  }
}

export function useResumeContext() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
}

export { ResumeContext, resumeReducer }; 