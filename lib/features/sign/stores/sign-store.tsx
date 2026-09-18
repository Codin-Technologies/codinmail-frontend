'use client';

import React, { createContext, useContext, useMemo, useReducer, Dispatch } from 'react';
import type { WorkflowMode, RecipientRole } from '@/lib/features/sign/api/sign.types';

export interface DraftRecipient {
  id: string;
  name: string;
  email: string;
  role: RecipientRole;
  recipientType: 'internal' | 'external';
  signingOrder: number;
  workspaceUserId?: string | null;
}

export interface SignWizardState {
  step: number;
  selectedFileId: string | null;
  selectedVersionId: string | null;
  selectedFileName: string | null;
  selectedMimeType: string | null;
  selectedSizeBytes: number | null;
  title: string;
  description: string;
  recipients: DraftRecipient[];
  workflowMode: WorkflowMode;
  expiresAt: string | null;
  deliverySubject: string;
  deliveryMessage: string;
}

type SignWizardAction =
  | { type: 'setStep'; payload: number }
  | { type: 'selectFile'; payload: { id: string; name: string; mimeType: string; sizeBytes: number } }
  | { type: 'selectVersion'; payload: { versionId: string | null; fileId: string } }
  | { type: 'setTitle'; payload: string }
  | { type: 'setDescription'; payload: string }
  | { type: 'setWorkflowMode'; payload: WorkflowMode }
  | { type: 'setExpiresAt'; payload: string | null }
  | { type: 'setDeliverySubject'; payload: string }
  | { type: 'setDeliveryMessage'; payload: string }
  | { type: 'addRecipient'; payload: DraftRecipient }
  | { type: 'removeRecipient'; payload: string }
  | { type: 'updateRecipient'; payload: { id: string; field: string; value: unknown } }
  | { type: 'setRecipients'; payload: DraftRecipient[] }
  | { type: 'reset' };

const initialState: SignWizardState = {
  step: 0,
  selectedFileId: null,
  selectedVersionId: null,
  selectedFileName: null,
  selectedMimeType: null,
  selectedSizeBytes: null,
  title: '',
  description: '',
  recipients: [],
  workflowMode: 'parallel',
  expiresAt: null,
  deliverySubject: 'Please sign: {documentTitle}',
  deliveryMessage: '',
};

function reducer(state: SignWizardState, action: SignWizardAction): SignWizardState {
  switch (action.type) {
    case 'setStep':
      return { ...state, step: action.payload };
    case 'selectFile':
      return {
        ...state,
        selectedFileId: action.payload.id,
        selectedFileName: action.payload.name,
        selectedMimeType: action.payload.mimeType,
        selectedSizeBytes: action.payload.sizeBytes,
        selectedVersionId: action.payload.id.replace('file-', 'ver-'),
      };
    case 'selectVersion':
      return {
        ...state,
        selectedVersionId: action.payload.versionId,
        selectedFileId:
          action.payload.fileId !== state.selectedFileId
            ? action.payload.fileId
            : state.selectedFileId,
      };
    case 'setTitle':
      return { ...state, title: action.payload };
    case 'setDescription':
      return { ...state, description: action.payload };
    case 'setWorkflowMode':
      return { ...state, workflowMode: action.payload };
    case 'setExpiresAt':
      return { ...state, expiresAt: action.payload };
    case 'setDeliverySubject':
      return { ...state, deliverySubject: action.payload };
    case 'setDeliveryMessage':
      return { ...state, deliveryMessage: action.payload };
    case 'addRecipient':
      return {
        ...state,
        recipients: [...state.recipients, action.payload],
      };
    case 'removeRecipient':
      return {
        ...state,
        recipients: state.recipients.filter((r) => r.id !== action.payload),
      };
    case 'updateRecipient': {
      const { id, field, value } = action.payload;
      return {
        ...state,
        recipients: state.recipients.map((r) =>
          r.id === id ? { ...r, [field]: value } : r
        ),
      };
    }
    case 'setRecipients':
      return { ...state, recipients: action.payload };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

interface SignStoreContextValue extends SignWizardState {
  setStep: (step: number) => void;
  selectFile: (id: string, name: string, mimeType: string, sizeBytes: number) => void;
  selectVersion: (versionId: string | null, fileId: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setWorkflowMode: (mode: WorkflowMode) => void;
  setExpiresAt: (expiresAt: string | null) => void;
  setDeliverySubject: (subject: string) => void;
  setDeliveryMessage: (message: string) => void;
  addRecipient: (recipient: Partial<DraftRecipient> & { name: string; email: string }) => void;
  removeRecipient: (id: string) => void;
  updateRecipient: (id: string, field: string, value: unknown) => void;
  setRecipients: (recipients: DraftRecipient[]) => void;
  reset: () => void;
}

const SignStoreContext = createContext<SignStoreContextValue | undefined>(undefined);
const SignStoreDispatchContext = createContext<Dispatch<SignWizardAction> | undefined>(undefined);

export function SignStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<SignStoreContextValue>(
    () => ({
      ...state,
      setStep: (step: number) => dispatch({ type: 'setStep', payload: step }),
      selectFile: (id, name, mimeType, sizeBytes) =>
        dispatch({ type: 'selectFile', payload: { id, name, mimeType, sizeBytes } }),
      selectVersion: (versionId, fileId) =>
        dispatch({ type: 'selectVersion', payload: { versionId, fileId } }),
      setTitle: (title) => dispatch({ type: 'setTitle', payload: title }),
      setDescription: (description) => dispatch({ type: 'setDescription', payload: description }),
      setWorkflowMode: (mode) => dispatch({ type: 'setWorkflowMode', payload: mode }),
      setExpiresAt: (expiresAt) => dispatch({ type: 'setExpiresAt', payload: expiresAt }),
      setDeliverySubject: (subject) => dispatch({ type: 'setDeliverySubject', payload: subject }),
      setDeliveryMessage: (message) => dispatch({ type: 'setDeliveryMessage', payload: message }),
      addRecipient: (recipient) => {
        const order = recipient.signingOrder ?? state.recipients.length;
        const newRecipient: DraftRecipient = {
          id: recipient.id ?? `temp_${Date.now()}`,
          name: recipient.name ?? '',
          email: recipient.email ?? '',
          role: recipient.role ?? 'signer',
          recipientType: recipient.recipientType ?? 'external',
          signingOrder: order,
          workspaceUserId: recipient.workspaceUserId ?? null,
        };
        dispatch({ type: 'addRecipient', payload: newRecipient });
      },
      removeRecipient: (id) => dispatch({ type: 'removeRecipient', payload: id }),
      updateRecipient: (id, field, value) =>
        dispatch({ type: 'updateRecipient', payload: { id, field, value } }),
      setRecipients: (recipients) => dispatch({ type: 'setRecipients', payload: recipients }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state]
  );

  return (
    <SignStoreContext.Provider value={value}>
      <SignStoreDispatchContext.Provider value={dispatch}>
        {children}
      </SignStoreDispatchContext.Provider>
    </SignStoreContext.Provider>
  );
}

export function SignStoreProviderInline({
  initialState: initial,
  children,
}: {
  initialState?: Partial<SignWizardState>;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, { ...initialState, ...initial });

  const value = useMemo<SignStoreContextValue>(
    () => ({
      ...state,
      setStep: (step: number) => dispatch({ type: 'setStep', payload: step }),
      selectFile: (id, name, mimeType, sizeBytes) =>
        dispatch({ type: 'selectFile', payload: { id, name, mimeType, sizeBytes } }),
      selectVersion: (versionId, fileId) =>
        dispatch({ type: 'selectVersion', payload: { versionId, fileId } }),
      setTitle: (title) => dispatch({ type: 'setTitle', payload: title }),
      setDescription: (description) => dispatch({ type: 'setDescription', payload: description }),
      setWorkflowMode: (mode) => dispatch({ type: 'setWorkflowMode', payload: mode }),
      setExpiresAt: (expiresAt) => dispatch({ type: 'setExpiresAt', payload: expiresAt }),
      setDeliverySubject: (subject) => dispatch({ type: 'setDeliverySubject', payload: subject }),
      setDeliveryMessage: (message) => dispatch({ type: 'setDeliveryMessage', payload: message }),
      addRecipient: (recipient) => {
        const order = recipient.signingOrder ?? state.recipients.length;
        const newRecipient: DraftRecipient = {
          id: recipient.id ?? `temp_${Date.now()}`,
          name: recipient.name ?? '',
          email: recipient.email ?? '',
          role: recipient.role ?? 'signer',
          recipientType: recipient.recipientType ?? 'external',
          signingOrder: order,
          workspaceUserId: recipient.workspaceUserId ?? null,
        };
        dispatch({ type: 'addRecipient', payload: newRecipient });
      },
      removeRecipient: (id) => dispatch({ type: 'removeRecipient', payload: id }),
      updateRecipient: (id, field, value) =>
        dispatch({ type: 'updateRecipient', payload: { id, field, value } }),
      setRecipients: (recipients) => dispatch({ type: 'setRecipients', payload: recipients }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state]
  );

  return (
    <SignStoreContext.Provider value={value}>
      <SignStoreDispatchContext.Provider value={dispatch}>
        {children}
      </SignStoreDispatchContext.Provider>
    </SignStoreContext.Provider>
  );
}

export function useSignStore() {
  const ctx = useContext(SignStoreContext);
  if (!ctx) {
    throw new Error('useSignStore must be used within SignStoreProvider');
  }
  return ctx;
}

export function useSignStoreDispatch() {
  const dispatch = useContext(SignStoreDispatchContext);
  if (!dispatch) {
    throw new Error('useSignStoreDispatch must be used within SignStoreProvider');
  }
  return dispatch;
}
