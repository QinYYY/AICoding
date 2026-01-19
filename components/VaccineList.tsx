import React, { useState } from 'react';
import { VaccineRecord } from '../types';
import { format } from 'date-fns';

interface VaccineListProps {
  records: VaccineRecord[];
  onDelete: (id: string) => void;
}

export const VaccineList: React.FC<VaccineListProps> = ({ records, onDelete }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Sort descending
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (records.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-teal-50 text-center p-6">
        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-3xl mb-4">
          💉
        </div>
        <p className="text-gray-800 font-semibold">还没有疫苗记录</p>
        <p className="text-gray-400 text-sm mt-1">在这里记录接种信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRecords.map((record) => {
        const dateObj = new Date(record.date.replace(/-/g, '/'));
        return (
          <div key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-teal-50 flex gap-4 hover:border-teal-100 transition-colors">
            {/* Date Box */}
            <div className="flex-shrink-0">
              <div className="bg-teal-50 w-14 h-14 rounded-xl flex items-center justify-center text-teal-600 font-bold text-xs flex-col">
                  <span className="text-gray-500 font-medium">{format(dateObj, 'M')}月</span>
                  <span className="text-lg text-teal-600">{format(dateObj, 'd')}</span>
                  <span className="text-gray-400 font-light scale-90">{format(dateObj, 'yyyy')}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg leading-tight">{record.vaccineName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-md font-medium">
                      {record.dose}
                    </span>
                    <span className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {record.location}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(record.id)}
                  className="bg-red-500 text-white hover:bg-red-600 transition-all p-2 rounded-xl -mr-2 active:scale-95 shadow-md shadow-red-500/20"
                  aria-label="删除疫苗记录"
                  title="删除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
              
              {record.photo && (
                <div className="mt-3">
                  <button 
                    onClick={() => setSelectedPhoto(record.photo!)}
                    className="relative group overflow-hidden rounded-lg w-20 h-20 border border-gray-100"
                  >
                    <img src={record.photo} alt="Vaccine record" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPhoto(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <img src={selectedPhoto} alt="Full view" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
};