import React from 'react';
import { GrowthRecord, ChildProfile } from '../types';
import { format, differenceInMonths } from 'date-fns';
import { calculatePercentile, getPercentileLabel } from '../services/growthStandards';

interface HistoryListProps {
  records: GrowthRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: GrowthRecord) => void;
  profile: ChildProfile;
}

export const HistoryList: React.FC<HistoryListProps> = ({ records, onDelete, onEdit, profile }) => {
  // Sort descending
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (records.length === 0) return null;

  const renderPercentile = (type: 'height' | 'weight', value: number, age: number) => {
    const p = calculatePercentile(profile.gender, age, type, value);
    if (p === null) return null;
    const { text, color } = getPercentileLabel(p);
    return (
      <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap ${color}`}>
        P{text.replace('%','')}
      </span>
    );
  };

  return (
    <div className="mt-8 pb-10">
      <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">历史记录</h3>
      <div className="space-y-3">
        {sortedRecords.map((record) => {
          // Use replace to ensure local time parsing (YYYY/MM/DD)
          const dateObj = new Date(record.date.replace(/-/g, '/'));
          const ageInMonths = differenceInMonths(dateObj, new Date(profile.birthDate.replace(/-/g, '/')));

          return (
            <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-teal-50 flex justify-between items-start group hover:border-teal-100 transition-colors">
              {/* Left Side: Date and Data */}
              <div className="flex gap-4 items-start flex-grow min-w-0">
                
                {/* Date Box */}
                <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center text-teal-600 font-bold text-xs flex-col flex-shrink-0 mt-0.5">
                   <span>{format(dateObj, 'M')}月</span>
                   <span className="text-sm">{format(dateObj, 'd')}</span>
                </div>

                {/* Measurements */}
                <div className="flex-grow min-w-0 pr-2">
                  <div className="flex flex-col gap-1.5 text-sm font-semibold text-gray-800">
                    
                    {/* Height Row */}
                    <div className="flex justify-between items-center w-full max-w-[200px]">
                       <div className="flex items-center text-gray-600">
                         <span className="w-14 text-xs font-normal text-gray-400">身高</span>
                         <span className="text-gray-800">{record.height} cm</span>
                       </div>
                       {renderPercentile('height', record.height, ageInMonths)}
                    </div>

                    {/* Weight Row */}
                    <div className="flex justify-between items-center w-full max-w-[200px]">
                      <div className="flex items-center text-gray-600">
                         <span className="w-14 text-xs font-normal text-gray-400">体重</span>
                         <span className="text-gray-800">{record.weight} kg</span>
                       </div>
                      {renderPercentile('weight', record.weight, ageInMonths)}
                    </div>

                  </div>
                  
                  {record.notes && (
                    <p className="text-xs text-gray-400 mt-2 truncate max-w-[90%]">{record.notes}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button 
                  onClick={() => onEdit(record)}
                  className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-100 hover:text-teal-700 rounded-xl transition-all active:scale-95"
                  aria-label="编辑记录"
                  title="编辑"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                </button>
                <button 
                  onClick={() => onDelete(record.id)}
                  className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all active:scale-95 shadow-md shadow-red-500/20"
                  aria-label="删除记录"
                  title="删除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};