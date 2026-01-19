import { Gender } from '../types';

// Simplified WHO Child Growth Standards (LMS Parameters)
// Data points selected for interpolation: 0, 3, 6, 12, 24, 36, 48, 60 months
// L: Box-Cox power, M: Median, S: Coefficient of Variation

type LMSPoint = { m: number; l: number; v: number; s: number }; // m=month, l, v(M), s
type GrowthTable = LMSPoint[];

// Boys Length/Height (0-60 months)
const BOYS_HEIGHT_LMS: GrowthTable = [
  { m: 0, l: 1, v: 49.88, s: 0.038 },
  { m: 3, l: 1, v: 61.4, s: 0.038 },
  { m: 6, l: 1, v: 67.6, s: 0.036 },
  { m: 12, l: 1, v: 75.7, s: 0.035 },
  { m: 24, l: 1, v: 87.8, s: 0.035 },
  { m: 36, l: 1, v: 96.1, s: 0.036 },
  { m: 48, l: 1, v: 103.3, s: 0.038 },
  { m: 60, l: 1, v: 110.0, s: 0.040 }
];

// Boys Weight (0-60 months)
const BOYS_WEIGHT_LMS: GrowthTable = [
  { m: 0, l: 0.3487, v: 3.346, s: 0.146 },
  { m: 3, l: 0.1748, v: 6.421, s: 0.134 },
  { m: 6, l: 0.0543, v: 7.936, s: 0.126 },
  { m: 12, l: -0.158, v: 9.648, s: 0.119 },
  { m: 24, l: -0.127, v: 12.15, s: 0.115 },
  { m: 36, l: -0.127, v: 14.34, s: 0.117 },
  { m: 48, l: -0.127, v: 16.33, s: 0.120 },
  { m: 60, l: -0.127, v: 18.31, s: 0.124 }
];

// Girls Length/Height (0-60 months)
const GIRLS_HEIGHT_LMS: GrowthTable = [
  { m: 0, l: 1, v: 49.1, s: 0.038 },
  { m: 3, l: 1, v: 59.8, s: 0.039 },
  { m: 6, l: 1, v: 65.7, s: 0.038 },
  { m: 12, l: 1, v: 74.0, s: 0.036 },
  { m: 24, l: 1, v: 86.4, s: 0.036 },
  { m: 36, l: 1, v: 95.1, s: 0.037 },
  { m: 48, l: 1, v: 102.7, s: 0.039 },
  { m: 60, l: 1, v: 109.4, s: 0.041 }
];

// Girls Weight (0-60 months)
const GIRLS_WEIGHT_LMS: GrowthTable = [
  { m: 0, l: 0.3809, v: 3.232, s: 0.141 },
  { m: 3, l: 0.2307, v: 5.842, s: 0.132 },
  { m: 6, l: 0.1068, v: 7.297, s: 0.125 },
  { m: 12, l: -0.105, v: 8.948, s: 0.118 },
  { m: 24, l: -0.063, v: 11.48, s: 0.118 },
  { m: 36, l: -0.063, v: 13.93, s: 0.123 },
  { m: 48, l: -0.063, v: 16.12, s: 0.129 },
  { m: 60, l: -0.063, v: 18.23, s: 0.136 }
];

// Standard Normal Cumulative Distribution Function
function cdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

// Linear Interpolation for LMS parameters
function getLMS(table: GrowthTable, ageMonths: number): { l: number; m: number; s: number } {
  // Clamp age
  if (ageMonths < 0) ageMonths = 0;
  if (ageMonths > 60) ageMonths = 60;

  // Find surrounding points
  let lower = table[0];
  let upper = table[table.length - 1];

  for (let i = 0; i < table.length - 1; i++) {
    if (ageMonths >= table[i].m && ageMonths <= table[i+1].m) {
      lower = table[i];
      upper = table[i+1];
      break;
    }
  }

  if (lower.m === upper.m) {
    return { l: lower.l, m: lower.v, s: lower.s };
  }

  const factor = (ageMonths - lower.m) / (upper.m - lower.m);
  
  const l = lower.l + (upper.l - lower.l) * factor;
  const m = lower.v + (upper.v - lower.v) * factor; // v is Median (M)
  const s = lower.s + (upper.s - lower.s) * factor;

  return { l, m, s };
}

export const calculatePercentile = (
  gender: Gender,
  ageMonths: number,
  type: 'height' | 'weight',
  value: number
): number | null => {
  if (ageMonths < 0 || value <= 0) return null;

  let table: GrowthTable;
  if (gender === Gender.BOY) {
    table = type === 'height' ? BOYS_HEIGHT_LMS : BOYS_WEIGHT_LMS;
  } else {
    table = type === 'height' ? GIRLS_HEIGHT_LMS : GIRLS_WEIGHT_LMS;
  }

  const { l, m, s } = getLMS(table, ageMonths);

  // Z-score formula: Z = ((X/M)^L - 1) / (L * S)
  let zScore = 0;
  if (l !== 0) {
    zScore = (Math.pow(value / m, l) - 1) / (l * s);
  } else {
    zScore = Math.log(value / m) / s;
  }

  const percentile = cdf(zScore) * 100;
  return Math.round(percentile);
};

// Calculate value for a given Z-score (Inverse of calculatePercentile)
// X = M * (1 + L * S * Z)^(1/L)  if L != 0
// X = M * exp(S * Z)             if L == 0
const calculateValueForZScore = (l: number, m: number, s: number, z: number): number => {
  if (l !== 0) {
    return m * Math.pow(1 + l * s * z, 1 / l);
  } else {
    return m * Math.exp(s * z);
  }
};

export interface CurvePoint {
  age: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export const getStandardCurveData = (
  gender: Gender,
  type: 'height' | 'weight',
  maxAgeMonths: number = 60
): CurvePoint[] => {
  let table: GrowthTable;
  if (gender === Gender.BOY) {
    table = type === 'height' ? BOYS_HEIGHT_LMS : BOYS_WEIGHT_LMS;
  } else {
    table = type === 'height' ? GIRLS_HEIGHT_LMS : GIRLS_WEIGHT_LMS;
  }

  const points: CurvePoint[] = [];
  // Z-scores for percentiles: 3rd (-1.881), 15th (-1.036), 50th (0), 85th (1.036), 97th (1.881)
  const zScores = {
    p3: -1.881,
    p15: -1.036,
    p50: 0,
    p85: 1.036,
    p97: 1.881
  };

  // Generate data points every month
  for (let age = 0; age <= maxAgeMonths; age++) {
    const { l, m, s } = getLMS(table, age);
    points.push({
      age,
      p3: calculateValueForZScore(l, m, s, zScores.p3),
      p15: calculateValueForZScore(l, m, s, zScores.p15),
      p50: calculateValueForZScore(l, m, s, zScores.p50),
      p85: calculateValueForZScore(l, m, s, zScores.p85),
      p97: calculateValueForZScore(l, m, s, zScores.p97),
    });
  }

  return points;
};

export const getPercentileLabel = (percentile: number): { text: string; color: string } => {
  if (percentile < 3 || percentile > 97) return { text: `${percentile}%`, color: 'text-red-600 bg-red-50' };
  if (percentile < 15 || percentile > 85) return { text: `${percentile}%`, color: 'text-orange-600 bg-orange-50' };
  return { text: `${percentile}%`, color: 'text-teal-600 bg-teal-50' };
};
