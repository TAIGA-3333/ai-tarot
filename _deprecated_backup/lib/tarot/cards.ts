import { TarotCard } from '@/types'

export const TAROT_CARDS: TarotCard[] = [
  { id: 0, name: 'The Fool', nameJa: '愚者', arcana: 'major', upright: '新しい始まり、自由、冒険', reversed: '無謀、リスク、不注意', imageKeyword: 'fool cliff adventure' },
  { id: 1, name: 'The Magician', nameJa: '魔術師', arcana: 'major', upright: '意志力、スキル、集中', reversed: '操作、未活用の才能', imageKeyword: 'magician wand power' },
  { id: 2, name: 'The High Priestess', nameJa: '女教皇', arcana: 'major', upright: '直感、神秘、潜在意識', reversed: '秘密、表面的知識', imageKeyword: 'high priestess moon mystery' },
  { id: 3, name: 'The Empress', nameJa: '女帝', arcana: 'major', upright: '豊かさ、愛、美', reversed: '依存、創造性の欠如', imageKeyword: 'empress nature abundance' },
  { id: 4, name: 'The Emperor', nameJa: '皇帝', arcana: 'major', upright: '権威、安定、支配', reversed: '支配、柔軟性の欠如', imageKeyword: 'emperor throne authority' },
  { id: 5, name: 'The Hierophant', nameJa: '教皇', arcana: 'major', upright: '伝統、信仰、制度', reversed: '反抗、自由', imageKeyword: 'hierophant wisdom tradition' },
  { id: 6, name: 'The Lovers', nameJa: '恋人', arcana: 'major', upright: '愛、調和、選択', reversed: '不和、価値観の違い', imageKeyword: 'lovers hearts connection' },
  { id: 7, name: 'The Chariot', nameJa: '戦車', arcana: 'major', upright: '勝利、意志、前進', reversed: '方向性の欠如、攻撃性', imageKeyword: 'chariot victory triumph' },
  { id: 8, name: 'Strength', nameJa: '力', arcana: 'major', upright: '内なる力、勇気、忍耐', reversed: '自信の欠如、弱さ', imageKeyword: 'strength lion courage' },
  { id: 9, name: 'The Hermit', nameJa: '隠者', arcana: 'major', upright: '内省、孤独、真実の探求', reversed: '孤立、引きこもり', imageKeyword: 'hermit lantern solitude' },
  { id: 10, name: 'Wheel of Fortune', nameJa: '運命の輪', arcana: 'major', upright: '運命、転機、チャンス', reversed: '不運、抵抗', imageKeyword: 'wheel fortune destiny cycle' },
  { id: 11, name: 'Justice', nameJa: '正義', arcana: 'major', upright: '公正、真実、法則', reversed: '不公正、回避', imageKeyword: 'justice scales balance' },
  { id: 12, name: 'The Hanged Man', nameJa: '吊るされた男', arcana: 'major', upright: '一時停止、視点の変化、受容', reversed: '抵抗、遅延', imageKeyword: 'hanged man sacrifice surrender' },
  { id: 13, name: 'Death', nameJa: '死神', arcana: 'major', upright: '変容、終わりと始まり、変化', reversed: '抵抗、停滞', imageKeyword: 'death transformation renewal' },
  { id: 14, name: 'Temperance', nameJa: '節制', arcana: 'major', upright: 'バランス、忍耐、調和', reversed: '不均衡、過剰', imageKeyword: 'temperance balance harmony water' },
  { id: 15, name: 'The Devil', nameJa: '悪魔', arcana: 'major', upright: '束縛、執着、物質主義', reversed: '解放、解放', imageKeyword: 'devil chains bondage shadow' },
  { id: 16, name: 'The Tower', nameJa: '塔', arcana: 'major', upright: '突然の変化、崩壊、啓示', reversed: '災難の回避、恐れ', imageKeyword: 'tower lightning chaos collapse' },
  { id: 17, name: 'The Star', nameJa: '星', arcana: 'major', upright: '希望、インスピレーション、平和', reversed: '絶望、信仰の喪失', imageKeyword: 'star hope light sky' },
  { id: 18, name: 'The Moon', nameJa: '月', arcana: 'major', upright: '幻想、恐れ、無意識', reversed: '混乱の解放、真実', imageKeyword: 'moon night mystery illusion' },
  { id: 19, name: 'The Sun', nameJa: '太陽', arcana: 'major', upright: '喜び、成功、活力', reversed: '悲観主義、過度の楽観', imageKeyword: 'sun joy radiance success' },
  { id: 20, name: 'Judgement', nameJa: '審判', arcana: 'major', upright: '反省、内なる呼びかけ、覚醒', reversed: '自己疑念、拒絶', imageKeyword: 'judgement awakening rebirth' },
  { id: 21, name: 'The World', nameJa: '世界', arcana: 'major', upright: '完成、達成、統合', reversed: '未完成、遅延', imageKeyword: 'world completion wholeness' },
  // ワンドのスート（一部）
  { id: 22, name: 'Ace of Wands', nameJa: 'ワンドのエース', arcana: 'minor', suit: 'wands', upright: '新しいベンチャー、情熱、創造性', reversed: '遅延、欲求不満', imageKeyword: 'wand flame creative spark' },
  { id: 23, name: 'Two of Wands', nameJa: 'ワンドの2', arcana: 'minor', suit: 'wands', upright: '計画、前進、決断', reversed: '恐れ、決意の欠如', imageKeyword: 'wands planning future vision' },
  { id: 24, name: 'Three of Wands', nameJa: 'ワンドの3', arcana: 'minor', suit: 'wands', upright: '拡張、予見、機会', reversed: '障害、遅延', imageKeyword: 'wands expansion horizon ships' },
  { id: 25, name: 'Six of Wands', nameJa: 'ワンドの6', arcana: 'minor', suit: 'wands', upright: '成功、公認、進歩', reversed: '自信の欠如、失敗', imageKeyword: 'wands victory parade success' },
  // カップのスート（一部）
  { id: 30, name: 'Ace of Cups', nameJa: 'カップのエース', arcana: 'minor', suit: 'cups', upright: '新しい感情、直感、霊性', reversed: '感情の抑圧、空虚', imageKeyword: 'cup water emotion love overflow' },
  { id: 31, name: 'Two of Cups', nameJa: 'カップの2', arcana: 'minor', suit: 'cups', upright: '統一、パートナーシップ、相互引力', reversed: '不和、別離', imageKeyword: 'cups partnership union toast' },
  { id: 36, name: 'Seven of Cups', nameJa: 'カップの7', arcana: 'minor', suit: 'cups', upright: '選択肢、幻想、夢想', reversed: '整列、目的の明確化', imageKeyword: 'cups fantasy dreams choices' },
  { id: 37, name: 'Ten of Cups', nameJa: 'カップの10', arcana: 'minor', suit: 'cups', upright: '幸福、家族、内なる平和', reversed: '不調和、断絶', imageKeyword: 'cups family happiness rainbow' },
  // ソードのスート（一部）
  { id: 40, name: 'Ace of Swords', nameJa: 'ソードのエース', arcana: 'minor', suit: 'swords', upright: '明晰さ、突破口、新しい考え', reversed: '混乱、残酷さ', imageKeyword: 'sword clarity truth breakthrough' },
  { id: 44, name: 'Five of Swords', nameJa: 'ソードの5', arcana: 'minor', suit: 'swords', upright: '葛藤、不一致、敗北', reversed: '和解、解決', imageKeyword: 'swords conflict battle defeat' },
  // ペンタクルのスート（一部）
  { id: 50, name: 'Ace of Pentacles', nameJa: 'ペンタクルのエース', arcana: 'minor', suit: 'pentacles', upright: '新しい財政、機会、安定', reversed: '機会の喪失、スカーシティ', imageKeyword: 'pentacle gold wealth prosperity' },
  { id: 55, name: 'Six of Pentacles', nameJa: 'ペンタクルの6', arcana: 'minor', suit: 'pentacles', upright: '寛大さ、与える、受け取る', reversed: '不公平、自己中心的', imageKeyword: 'pentacles generosity giving coins' },
  { id: 60, name: 'Ten of Pentacles', nameJa: 'ペンタクルの10', arcana: 'minor', suit: 'pentacles', upright: '豊かさ、遺産、家族', reversed: '金融的失敗、不安定', imageKeyword: 'pentacles wealth legacy family' },
]

export function drawCards(count: number = 3): { card: TarotCard; isReversed: boolean; position: string }[] {
  const positions3 = ['過去', '現在', '未来']
  const positions5 = ['現状', '課題', '潜在意識', 'アドバイス', '結果']
  const positions = count === 5 ? positions5 : positions3

  const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5)
  const drawn = shuffled.slice(0, count)

  return drawn.map((card, i) => ({
    card,
    isReversed: Math.random() > 0.7,
    position: positions[i],
  }))
}
