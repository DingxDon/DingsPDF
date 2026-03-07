import { create } from 'zustand';

export interface SavedComponent {
  id: string;
  name: string;
  category: string;
  htmlCode: string;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit_node' | 'edit_saved' | 'manage_data';
  initialName: string;
  initialCode: string;
  targetId: string | null; // Node ID or Saved Component ID
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST';
  headers: string;
  body: string;
}

export interface CustomVariable {
  id: string;
  name: string;
  type?: 'string' | 'array';
  value: any;
}

export interface EditorState {
  previewMode: boolean;
  dataSources: DataSource[];
  activeDataSourceId: string | null;
  activeResponseData: any | null;
  variables: string[]; // flattened dotted paths
  customVariables: CustomVariable[];
  savedComponents: SavedComponent[];
  modalState: ModalState;
  isDarkMode: boolean;
  isMobileDrawerOpen: boolean;

  setPreviewMode: (mode: boolean) => void;
  addSavedComponent: (component: SavedComponent) => void;
  updateSavedComponent: (id: string, name: string, htmlCode: string) => void;
  deleteSavedComponent: (id: string) => void;
  openModal: (mode: 'create' | 'edit_node' | 'edit_saved' | 'manage_data', initialName?: string, initialCode?: string, targetId?: string | null) => void;
  closeModal: () => void;

  addDataSource: (ds: DataSource) => void;
  updateDataSource: (id: string, ds: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  setActiveDataSourceId: (id: string | null) => void;
  setActiveResponseData: (data: any | null) => void;
  setVariables: (vars: string[]) => void;
  toggleDarkMode: () => void;
  setMobileDrawerOpen: (open: boolean) => void;

  addCustomVariable: (variable: CustomVariable) => void;
  updateCustomVariable: (id: string, name: string, type: 'string' | 'array', value: any) => void;
  deleteCustomVariable: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  previewMode: false,
  dataSources: [],
  activeDataSourceId: null,
  activeResponseData: null,
  variables: [],
  customVariables: [],
  savedComponents: [],
  modalState: {
    isOpen: false,
    mode: 'create',
    initialName: '',
    initialCode: '',
    targetId: null,
  },
  isDarkMode: false,
  isMobileDrawerOpen: false,

  setPreviewMode: (mode) => set({ previewMode: mode }),

  addSavedComponent: (component) => set((state) => ({ savedComponents: [...state.savedComponents, component] })),
  updateSavedComponent: (id, name, htmlCode) => set((state) => ({
    savedComponents: state.savedComponents.map(c => c.id === id ? { ...c, name, htmlCode } : c)
  })),
  deleteSavedComponent: (id) => set((state) => ({
    savedComponents: state.savedComponents.filter(c => c.id !== id)
  })),

  openModal: (mode, initialName = '', initialCode = '', targetId = null) => set({
    modalState: { isOpen: true, mode, initialName, initialCode, targetId }
  }),
  closeModal: () => set((state) => ({
    modalState: { ...state.modalState, isOpen: false }
  })),

  addDataSource: (ds) => set((state) => ({ dataSources: [...state.dataSources, ds] })),
  updateDataSource: (id, updates) => set((state) => ({
    dataSources: state.dataSources.map(ds => ds.id === id ? { ...ds, ...updates } : ds)
  })),
  deleteDataSource: (id) => set((state) => ({
    dataSources: state.dataSources.filter(ds => ds.id !== id),
    activeDataSourceId: state.activeDataSourceId === id ? null : state.activeDataSourceId,
    activeResponseData: state.activeDataSourceId === id ? null : state.activeResponseData,
    variables: state.activeDataSourceId === id ? [] : state.variables
  })),
  setActiveDataSourceId: (id) => set({ activeDataSourceId: id }),
  setActiveResponseData: (data) => set({ activeResponseData: data }),
  setVariables: (vars) => set({ variables: vars }),
  toggleDarkMode: () => set((state) => {
    const isDark = !state.isDarkMode;
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { isDarkMode: isDark };
  }),
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),

  addCustomVariable: (variable) => set((state) => ({ customVariables: [...state.customVariables, variable] })),
  updateCustomVariable: (id, name, type, value) => set((state) => ({
    customVariables: state.customVariables.map(v => v.id === id ? { ...v, name, type, value } : v)
  })),
  deleteCustomVariable: (id) => set((state) => ({
    customVariables: state.customVariables.filter(v => v.id !== id)
  }))
}));
