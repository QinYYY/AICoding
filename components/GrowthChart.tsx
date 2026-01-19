import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { differenceInDays } from 'date-fns';
import { GrowthRecord, ChildProfile } from '../types';
import { getStandardCurveData } from '../services/growthStandards';

interface GrowthChartProps {
  records: GrowthRecord[];
  profile: ChildProfile;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ records, profile }) => {
  const [metric, setMetric] = useState<'height' | 'weight'>('height');

  const { chartData, userData, maxAge } = useMemo(() => {
    // 1. Process User Data to get Age in Months
    const birthDateObj = new Date(profile.birthDate.replace(/-/g, '/'));
    
    let processedUserRecords: any[] = [];
    
    if (records.length > 0) {
      processedUserRecords = records
        .map(record => {
          const dateObj = new Date(record.date.replace(/-/g, '/'));
          // Calculate age in months accurately (floating point)
          const daysDiff = differenceInDays(dateObj, birthDateObj);
          const ageInMonths = Math.max(0, daysDiff / 30.4375); // Average days in month
          
          return {
            ...record,
            age: ageInMonths,
            userValue: metric === 'height' ? record.height : record.weight
          };
        })
        .sort((a, b) => a.age - b.age);
    }

    const maxRecordAge = processedUserRecords.length > 0 
      ? processedUserRecords[processedUserRecords.length - 1].age 
      : 0;
      
    // Ensure chart goes at least to 12 months or slightly beyond last record
    const targetMaxAge = Math.min(60, Math.max(12, Math.ceil(maxRecordAge + 2)));

    // 2. Get Standard Curve Data
    const standardCurve = getStandardCurveData(profile.gender, metric, targetMaxAge);

    return { 
      chartData: standardCurve, 
      userData: processedUserRecords,
      maxAge: targetMaxAge
    };
  }, [records, profile, metric]);

  // Custom Tick Formatter for Age
  const formatXAxis = (ageMonths: number) => {
    if (ageMonths < 12) return `${Math.round(ageMonths)}个月`;
    const years = Math.floor(ageMonths / 12);
    const months = Math.round(ageMonths % 12);
    return months === 0 ? `${years}岁` : `${years}岁${months}个月`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the user value payload if it exists
      const userPoint = payload.find((p: any) => p.dataKey === 'userValue');
      const p50 = payload.find((p: any) => p.dataKey === 'p50');

      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-xs">
          <p className="font-bold text-gray-700 mb-1">{formatXAxis(label)}大</p>
          {userPoint && (
            <p className="text-teal-600 font-bold text-sm mb-1">
              您的宝宝: {userPoint.value} {metric === 'height' ? 'cm' : 'kg'}
            </p>
          )}
          {p50 && (
            <div className="text-gray-400 space-y-0.5">
              <p>标准 (50%): {parseFloat(p50.value).toFixed(1)}</p>
              <p>范围 (3%-97%): {parseFloat(payload.find((p: any) => p.dataKey === 'p3')?.value).toFixed(1)} - {parseFloat(payload.find((p: any) => p.dataKey === 'p97')?.value).toFixed(1)}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-teal-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">生长曲线</h3>
        <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
          <button
            onClick={() => setMetric('height')}
            className={`px-3 py-1 rounded-md transition-all ${
              metric === 'height' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            身高
          </button>
          <button
            onClick={() => setMetric('weight')}
            className={`px-3 py-1 rounded-md transition-all ${
              metric === 'weight' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            体重
          </button>
        </div>
      </div>

      <div className="h-64 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f9ff" />
            <XAxis 
              dataKey="age" 
              type="number" 
              domain={[0, maxAge]}
              tickFormatter={formatXAxis}
              stroke="#94a3b8"
              tickMargin={10}
              allowDecimals={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              domain={['auto', 'auto']}
              unit={metric === 'height' ? ' cm' : ' kg'}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Standard Curves */}
            {/* P97 & P3 - Outer Bounds */}
            <Line data={chartData} type="monotone" dataKey="p97" stroke="#e5e7eb" strokeWidth={1} dot={false} activeDot={false} name="97%" />
            <Line data={chartData} type="monotone" dataKey="p3" stroke="#e5e7eb" strokeWidth={1} dot={false} activeDot={false} name="3%" />
            
            {/* P50 - Median */}
            <Line data={chartData} type="monotone" dataKey="p50" stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} name="50%" />

            {/* User Data */}
            <Line
              data={userData}
              type="monotone"
              dataKey="userValue"
              name="您的宝宝"
              stroke={metric === 'height' ? '#14b8a6' : '#f59e0b'}
              strokeWidth={2}
              connectNulls
              dot={{ 
                r: 4, 
                fill: metric === 'height' ? '#14b8a6' : '#f59e0b', 
                strokeWidth: 2, 
                stroke: '#fff' 
              }}
              activeDot={{ r: 6 }}
            />
            
            <Legend 
              payload={[
                { value: '您的宝宝', type: 'circle', color: metric === 'height' ? '#14b8a6' : '#f59e0b' },
                { value: '标准范围 (P3-P97)', type: 'line', color: '#d1d5db' }
              ]} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};