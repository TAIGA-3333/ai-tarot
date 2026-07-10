export const ZODIAC_DATA = {
  aries: { name: '牡羊座', en: 'Aries', emoji: '♈', color: '#FF4D4D' },
  taurus: { name: '牡牛座', en: 'Taurus', emoji: '♉', color: '#4CAF50' },
  gemini: { name: '双子座', en: 'Gemini', emoji: '♊', color: '#FFEB3B' },
  cancer: { name: '蟹座', en: 'Cancer', emoji: '♋', color: '#E1E1E1' },
  leo: { name: '獅子座', en: 'Leo', emoji: '♌', color: '#FF9800' },
  virgo: { name: '乙女座', en: 'Virgo', emoji: '♍', color: '#8BC34A' },
  libra: { name: '天秤座', en: 'Libra', emoji: '♎', color: '#F06292' },
  scorpio: { name: '蠍座', en: 'Scorpio', emoji: '♏', color: '#B71C1C' },
  sagittarius: { name: '射手座', en: 'Sagittarius', emoji: '♐', color: '#9C27B0' },
  capricorn: { name: '山羊座', en: 'Capricorn', emoji: '♑', color: '#795548' },
  aquarius: { name: '水瓶座', en: 'Aquarius', emoji: '♒', color: '#03A9F4' },
  pisces: { name: '魚座', en: 'Pisces', emoji: '♓', color: '#00BCD4' },
} as const;

export type ZodiacId = keyof typeof ZODIAC_DATA;

export function getZodiac(id: string) {
  return ZODIAC_DATA[id as ZodiacId];
}
