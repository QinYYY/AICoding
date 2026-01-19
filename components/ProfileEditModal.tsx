import React, { useState } from 'react';
import { Button } from './Button';
import { ChildProfile, Gender } from '../types';

interface ProfileEditModalProps {
  profile: ChildProfile;
  onSave: (profile: ChildProfile) => void;
  onCancel: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ profile, onSave, onCancel }) => {
  const [name, setName] = useState(profile.name);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const [gender, setGender] = useState<Gender>(profile.gender);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthDate) {
      onSave({ ...profile, name, birthDate, gender });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 animate-scale-in shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">编辑档案</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">宝宝姓名</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">出生日期</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-5 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-teal-500 focus:bg-white transition-all outline-none"
            />
            <p className="text-xs text-orange-500 mt-1">修改出生日期将重新计算所有生长百分位。</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">性别</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender(Gender.BOY)}
                className={`p-3 rounded-xl border-2 font-medium transition-all ${
                  gender === Gender.BOY
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-teal-200'
                }`}
              >
                👦 男宝
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.GIRL)}
                className={`p-3 rounded-xl border-2 font-medium transition-all ${
                  gender === Gender.GIRL
                    ? 'border-pink-400 bg-pink-50 text-pink-700'
                    : 'border-gray-100 bg-white text-gray-500 hover:border-pink-200'
                }`}
              >
                👧 女宝
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full">
              保存更改
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};