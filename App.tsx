import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { GrowthChart } from './components/GrowthChart';
import { EntryForm } from './components/EntryForm';
import { HistoryList } from './components/HistoryList';
import { VaccineList } from './components/VaccineList';
import { VaccineForm } from './components/VaccineForm';
import { Button } from './components/Button';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ProfileEditModal } from './components/ProfileEditModal';
import { ChildProfile, GrowthRecord, VaccineRecord, Gender } from './types';
import { loadState, saveState, clearState } from './services/storageService';
import { analyzeGrowth } from './services/geminiService';
import { differenceInMonths } from 'date-fns';

type Tab = 'growth' | 'vaccines';
type ConfirmState = {
  isOpen: boolean;
  title: string;
  message: string;
  isDangerous: boolean;
  onConfirm: () => void;
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [vaccines, setVaccines] = useState<VaccineRecord[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('growth');

  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    isDangerous: false,
    onConfirm: () => {},
  });

  // Initialize from storage
  useEffect(() => {
    const loadedData = loadState();
    if (loadedData.profile) {
      setProfile(loadedData.profile);
      setRecords(loadedData.records);
      setVaccines(loadedData.vaccines || []);
    }
  }, []);

  // Save to storage on change
  useEffect(() => {
    if (profile) {
      saveState({ profile, records, vaccines });
    }
  }, [profile, records, vaccines]);

  const handleProfileCreate = (newProfile: ChildProfile) => {
    setProfile(newProfile);
  };

  const handleProfileUpdate = (updatedProfile: ChildProfile) => {
    setProfile(updatedProfile);
    setShowProfileEdit(false);
    // Recalculate AI analysis if profile changes (e.g. age changes affects context)
    setAiAnalysis(''); 
  };

  const handleSaveRecord = (record: GrowthRecord) => {
    setRecords(prev => {
      const existingIndex = prev.findIndex(r => r.id === record.id);
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...prev];
        updated[existingIndex] = record;
        return updated;
      }
      // Add new
      return [...prev, record];
    });
    setShowAddModal(false);
    setEditingRecord(null);
    setAiAnalysis('');
  };

  const handleEditRecord = (record: GrowthRecord) => {
    setEditingRecord(record);
    setShowAddModal(true);
  };

  const handleAddVaccine = (record: VaccineRecord) => {
    setVaccines(prev => [...prev, record]);
    setShowAddModal(false);
  };

  const handleDeleteRecord = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除记录',
      message: '确定要删除这条成长记录吗？此操作无法撤销。',
      isDangerous: true,
      onConfirm: () => {
        setRecords(prev => prev.filter(r => r.id !== id));
        setAiAnalysis('');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeleteVaccine = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '删除疫苗记录',
      message: '确定要删除这条疫苗记录吗？此操作无法撤销。',
      isDangerous: true,
      onConfirm: () => {
        setVaccines(prev => prev.filter(v => v.id !== id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleGetInsight = async () => {
    if (!profile || records.length === 0) return;
    
    setIsAnalyzing(true);
    const analysis = await analyzeGrowth(profile, records);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setShowSettings(false);
    setConfirmDialog({
      isOpen: true,
      title: '重置所有数据',
      message: '这将永久删除宝宝档案、所有成长记录和疫苗历史。此操作无法撤销。',
      isDangerous: true,
      onConfirm: () => {
        clearState();
        setProfile(null);
        setRecords([]);
        setVaccines([]);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const closeEntryModal = () => {
    setShowAddModal(false);
    setEditingRecord(null);
  };

  if (!profile) {
    return <Onboarding onComplete={handleProfileCreate} />;
  }

  const ageInMonths = differenceInMonths(new Date(), new Date(profile.birthDate));
  const ageDisplay = ageInMonths < 12 
    ? `${ageInMonths} 个月` 
    : `${Math.floor(ageInMonths / 12)}岁 ${ageInMonths % 12}个月`;
  
  const genderDisplay = profile.gender === Gender.BOY ? '男宝' : '女宝';

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-2 rounded-b-3xl shadow-sm border-b border-teal-50 sticky top-0 z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
            <p className="text-teal-600 font-medium">{ageDisplay}大 • {genderDisplay}</p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-2">
          <button 
            onClick={() => setActiveTab('growth')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'growth' 
                ? 'bg-white text-teal-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            成长记录
          </button>
          <button 
            onClick={() => setActiveTab('vaccines')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'vaccines' 
                ? 'bg-white text-teal-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            疫苗接种
          </button>
        </div>

        {showSettings && (
           <div className="absolute right-6 top-24 bg-white shadow-xl border border-gray-100 p-2 rounded-xl w-48 animate-fade-in z-20">
             <button 
                onClick={() => {
                  setShowSettings(false);
                  setShowProfileEdit(true);
                }}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors mb-1"
             >
               编辑档案
             </button>
             <button 
                onClick={handleReset}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
             >
               删除档案 & 数据
             </button>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 max-w-2xl mx-auto min-h-[60vh]">
        
        {activeTab === 'growth' ? (
          <>
            <GrowthChart records={records} profile={profile} />

            {/* AI Insight Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4 px-1">
                 <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                   <span>✨</span> AI 成长分析
                 </h3>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                 {/* Decorative circles */}
                 <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-white opacity-10"></div>
                 <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-20 h-20 rounded-full bg-white opacity-10"></div>

                 {aiAnalysis ? (
                   <div className="relative z-10">
                     <p className="leading-relaxed opacity-95 text-sm md:text-base">{aiAnalysis}</p>
                     <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                        <span className="text-xs opacity-70">由 Gemini AI 生成</span>
                        <button 
                          onClick={handleGetInsight} 
                          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                        >
                          刷新
                        </button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-4 relative z-10">
                     <p className="mb-4 text-indigo-100 text-sm">获取 {profile.name} 的个性化成长趋势分析。</p>
                     <Button 
                       onClick={handleGetInsight} 
                       isLoading={isAnalyzing}
                       className="w-full bg-white text-indigo-600 hover:bg-indigo-50 shadow-none border-none"
                       disabled={records.length === 0}
                     >
                       {records.length === 0 ? "请先添加数据" : "分析成长"}
                     </Button>
                   </div>
                 )}
              </div>
            </div>

            <HistoryList 
              records={records} 
              onDelete={handleDeleteRecord} 
              onEdit={handleEditRecord}
              profile={profile} 
            />
          </>
        ) : (
          <VaccineList records={vaccines} onDelete={handleDeleteVaccine} />
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowAddModal(true);
          }}
          className="bg-teal-500 hover:bg-teal-600 text-white w-14 h-14 rounded-full shadow-lg shadow-teal-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          aria-label={activeTab === 'growth' ? "添加成长记录" : "添加疫苗记录"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      {showAddModal && (
        activeTab === 'growth' ? (
          <EntryForm 
            onAdd={handleSaveRecord} 
            onCancel={closeEntryModal}
            initialData={editingRecord || undefined}
          />
        ) : (
          <VaccineForm
            onAdd={handleAddVaccine}
            onCancel={() => setShowAddModal(false)}
          />
        )
      )}

      {showProfileEdit && (
        <ProfileEditModal
          profile={profile}
          onSave={handleProfileUpdate}
          onCancel={() => setShowProfileEdit(false)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        isDangerous={confirmDialog.isDangerous}
      />
    </div>
  );
};

export default App;