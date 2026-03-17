import { isHighEnergyMoon } from '@/lib/moonphase';

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
  number: number; // 0-21 for major, 1-14 for minor (14=King)
  uprightMeaning: string;
  reversedMeaning: string;
  keywords: string[];
}

export const TAROT_DECK: TarotCard[] = [
  // ─── MAJOR ARCANA ───────────────────────────────────────────────────────────
  {
    id: 'major-0',
    name: 'The Fool',
    arcana: 'major',
    suit: null,
    number: 0,
    uprightMeaning:
      'A leap of faith into new beginnings; pure potential and innocent adventure await those who trust the journey. The Fool invites you to embrace spontaneity and step boldly into the unknown.',
    reversedMeaning:
      'Recklessness, naivety, or fear of taking the first step holds you back from growth. Examine whether impulsiveness is masking a deeper reluctance to commit.',
    keywords: ['new beginnings', 'innocence', 'spontaneity', 'free spirit', 'adventure'],
  },
  {
    id: 'major-1',
    name: 'The Magician',
    arcana: 'major',
    suit: null,
    number: 1,
    uprightMeaning:
      'You possess all the tools, talents, and willpower needed to manifest your desires into reality. Channel focused intention and act with confidence — transformation is within your reach.',
    reversedMeaning:
      'Manipulation, trickery, or wasted potential warn of skills being misused or left undeveloped. Reconnect with authentic purpose before directing your considerable power.',
    keywords: ['manifestation', 'willpower', 'skill', 'resourcefulness', 'action'],
  },
  {
    id: 'major-2',
    name: 'The High Priestess',
    arcana: 'major',
    suit: null,
    number: 2,
    uprightMeaning:
      'Deep intuition, sacred mystery, and inner knowing guide you beyond the veil of surface reality. Trust the wisdom that arises in silence and stillness rather than seeking only external answers.',
    reversedMeaning:
      'Secrets withheld, disconnection from intuition, or repressed inner voice create confusion and poor judgment. Return to quiet contemplation to restore your inner compass.',
    keywords: ['intuition', 'mystery', 'inner knowing', 'subconscious', 'divine feminine'],
  },
  {
    id: 'major-3',
    name: 'The Empress',
    arcana: 'major',
    suit: null,
    number: 3,
    uprightMeaning:
      'Abundance, fertility, and nurturing creative energy flow freely, bringing growth to all you tend with love. The Empress encourages you to connect with nature, sensuality, and the generative power within you.',
    reversedMeaning:
      'Creative blocks, codependency, or neglect of self-care undermine your natural abundance and vitality. Cultivate self-worth and allow yourself to receive as generously as you give.',
    keywords: ['abundance', 'fertility', 'nurturing', 'nature', 'creativity'],
  },
  {
    id: 'major-4',
    name: 'The Emperor',
    arcana: 'major',
    suit: null,
    number: 4,
    uprightMeaning:
      'Structure, authority, and disciplined leadership establish the stable foundation from which lasting achievement grows. Embrace your capacity to set boundaries, take responsibility, and build with steady intention.',
    reversedMeaning:
      'Domination, rigidity, or abuse of authority erodes trust and stifles those under your care. Examine whether control has become a substitute for genuine security and inner strength.',
    keywords: ['authority', 'structure', 'stability', 'leadership', 'discipline'],
  },
  {
    id: 'major-5',
    name: 'The Hierophant',
    arcana: 'major',
    suit: null,
    number: 5,
    uprightMeaning:
      'Tradition, spiritual guidance, and established wisdom offer a reliable path through ritual and community. Seek a trusted mentor or institution that aligns with your deeper values and sacred calling.',
    reversedMeaning:
      'Dogma, blind conformity, or rebellion against hollow tradition signal a need to forge your own spiritual path. Question inherited beliefs with compassion and discern what truly serves your soul.',
    keywords: ['tradition', 'spiritual guidance', 'conformity', 'institutions', 'beliefs'],
  },
  {
    id: 'major-6',
    name: 'The Lovers',
    arcana: 'major',
    suit: null,
    number: 6,
    uprightMeaning:
      'Sacred union, aligned values, and choices made from the heart lead to harmony and authentic partnership. This card calls you to honor your deepest values when making significant life decisions.',
    reversedMeaning:
      'Disharmony, value conflicts, or avoiding a necessary choice creates inner and relational discord. Honest self-examination about what you truly desire is the first step toward resolution.',
    keywords: ['love', 'union', 'choices', 'alignment', 'relationships'],
  },
  {
    id: 'major-7',
    name: 'The Chariot',
    arcana: 'major',
    suit: null,
    number: 7,
    uprightMeaning:
      'Determination, focused willpower, and disciplined momentum carry you toward victory over obstacles. Harness opposing forces within yourself and advance with confident control.',
    reversedMeaning:
      'Lack of direction, aggression, or losing control of competing drives derails progress and scatters energy. Slow down, realign your intention, and reclaim purposeful forward motion.',
    keywords: ['determination', 'control', 'victory', 'willpower', 'momentum'],
  },
  {
    id: 'major-8',
    name: 'Strength',
    arcana: 'major',
    suit: null,
    number: 8,
    uprightMeaning:
      'Inner courage, compassionate patience, and gentle mastery over raw instinct reveal true and lasting power. You have the quiet fortitude to face any challenge without force or aggression.',
    reversedMeaning:
      'Self-doubt, insecurity, or repressed emotions drain your natural vitality and undermine resilience. Reconnect with your inner lion through self-compassion rather than self-criticism.',
    keywords: ['inner strength', 'courage', 'patience', 'compassion', 'self-mastery'],
  },
  {
    id: 'major-9',
    name: 'The Hermit',
    arcana: 'major',
    suit: null,
    number: 9,
    uprightMeaning:
      'Solitary introspection, inner guidance, and the wisdom earned through deep reflection illuminate your true path. Withdraw from the noise of the world to reconnect with your essential self.',
    reversedMeaning:
      'Isolation becoming withdrawal, loneliness, or rejecting the guidance of others impedes your growth. Examine whether solitude has curdled into avoidance or spiritual arrogance.',
    keywords: ['introspection', 'solitude', 'inner guidance', 'wisdom', 'contemplation'],
  },
  {
    id: 'major-10',
    name: 'Wheel of Fortune',
    arcana: 'major',
    suit: null,
    number: 10,
    uprightMeaning:
      'Cycles of fate, fortunate turning points, and the ever-revolving nature of destiny bring change and opportunity. Align with life\'s rhythms and trust that even difficult turns serve your highest evolution.',
    reversedMeaning:
      'Resistance to change, bad luck, or clinging to a past cycle prolongs suffering and delays necessary transformation. Release what no longer serves and open to the new cycle beginning.',
    keywords: ['fate', 'cycles', 'luck', 'turning points', 'destiny'],
  },
  {
    id: 'major-11',
    name: 'Justice',
    arcana: 'major',
    suit: null,
    number: 11,
    uprightMeaning:
      'Truth, fairness, and the law of cause and effect restore balance and deliver impartial outcomes. Act with integrity in all matters and trust that honest efforts are recognized and rewarded.',
    reversedMeaning:
      'Injustice, dishonesty, or avoiding accountability for past actions creates imbalance and karmic debt. Examine where you have been unfair — to others or to yourself — and make amends.',
    keywords: ['justice', 'truth', 'fairness', 'balance', 'karma'],
  },
  {
    id: 'major-12',
    name: 'The Hanged Man',
    arcana: 'major',
    suit: null,
    number: 12,
    uprightMeaning:
      'Willing surrender, a new perspective gained through pause, and enlightened sacrifice open doors that force cannot. Let go of the need to control and allow insight to arrive in the stillness of suspension.',
    reversedMeaning:
      'Stalling, martyrdom, or refusing to release an outdated attachment keeps you painfully stuck. Ask honestly whether your waiting is sacred surrender or merely fear dressed as patience.',
    keywords: ['surrender', 'new perspective', 'pause', 'sacrifice', 'enlightenment'],
  },
  {
    id: 'major-13',
    name: 'Death',
    arcana: 'major',
    suit: null,
    number: 13,
    uprightMeaning:
      'Profound transformation, necessary endings, and the clearing of what no longer serves make way for powerful new beginnings. Embrace this transition with courage — what dies now feeds what wants to be born.',
    reversedMeaning:
      'Resistance to change, fear of endings, or clinging to the familiar prolongs decay and prevents renewal. The transformation is inevitable; your only choice is whether to meet it with openness or suffering.',
    keywords: ['transformation', 'endings', 'transition', 'letting go', 'renewal'],
  },
  {
    id: 'major-14',
    name: 'Temperance',
    arcana: 'major',
    suit: null,
    number: 14,
    uprightMeaning:
      'Moderation, patience, and the alchemical blending of opposites create profound inner peace and divine balance. Flow between extremes with graceful adaptability and trust the slow alchemy of healing.',
    reversedMeaning:
      'Imbalance, excess, or impatience disrupt the gentle alchemy needed for lasting harmony. Identify where you are forcing outcomes rather than allowing the sacred process to unfold in its own time.',
    keywords: ['balance', 'moderation', 'patience', 'alchemy', 'harmony'],
  },
  {
    id: 'major-15',
    name: 'The Devil',
    arcana: 'major',
    suit: null,
    number: 15,
    uprightMeaning:
      'Shadow self, bondage to materialism or addictive patterns, and the illusion of powerlessness demand honest confrontation. Recognize that the chains binding you are largely of your own making — and can be removed.',
    reversedMeaning:
      'Breaking free from unhealthy bonds, reclaiming power, and releasing shadow patterns mark an important liberation. Examine what belief or behavior you have just begun to release and honor that courage.',
    keywords: ['shadow self', 'bondage', 'materialism', 'addiction', 'liberation'],
  },
  {
    id: 'major-16',
    name: 'The Tower',
    arcana: 'major',
    suit: null,
    number: 16,
    uprightMeaning:
      'Sudden disruption, revelatory upheaval, and the collapse of false structures clear the ground for authentic rebuilding. Though shocking, this destruction liberates you from foundations built on illusion.',
    reversedMeaning:
      'Avoiding necessary change, delaying inevitable collapse, or internalizing upheaval creates prolonged inner turmoil. The tower must fall — resisting only makes the eventual reckoning more destructive.',
    keywords: ['disruption', 'upheaval', 'revelation', 'chaos', 'transformation'],
  },
  {
    id: 'major-17',
    name: 'The Star',
    arcana: 'major',
    suit: null,
    number: 17,
    uprightMeaning:
      'Hope, renewal, and serene faith in the future pour healing light onto wounds and inspire deep spiritual trust. After darkness comes this quiet reminder that you are guided, blessed, and never truly alone.',
    reversedMeaning:
      'Despair, loss of faith, or disconnection from your guiding light dims the hopeful vision your soul needs. Tend the small flame of belief that remains — hope is a practice as much as a feeling.',
    keywords: ['hope', 'renewal', 'faith', 'healing', 'inspiration'],
  },
  {
    id: 'major-18',
    name: 'The Moon',
    arcana: 'major',
    suit: null,
    number: 18,
    uprightMeaning:
      'Illusion, the subconscious depths, and the fertile uncertainty of the unknown invite you to navigate by intuition rather than logic. Acknowledge your fears and shadowy projections before they mislead you.',
    reversedMeaning:
      'Confusion lifting, hidden truths surfacing, or releasing irrational fears allows clarity to gradually return. Trust that what has been obscured in the lunar dark is moving toward the light of understanding.',
    keywords: ['illusion', 'subconscious', 'fear', 'confusion', 'intuition'],
  },
  {
    id: 'major-19',
    name: 'The Sun',
    arcana: 'major',
    suit: null,
    number: 19,
    uprightMeaning:
      'Radiant joy, clarity, vitality, and unambiguous success illuminate every aspect of life with warmth and optimism. This is a card of wholehearted celebration — your authentic self shines brilliantly.',
    reversedMeaning:
      'Temporary setbacks to happiness, blocked vitality, or excessive ego dim the natural solar radiance available to you. Return to simplicity and genuine gratitude to let the light back in.',
    keywords: ['joy', 'success', 'vitality', 'clarity', 'optimism'],
  },
  {
    id: 'major-20',
    name: 'Judgement',
    arcana: 'major',
    suit: null,
    number: 20,
    uprightMeaning:
      'Awakening, absolution, and a powerful call to rise into your highest self mark a pivotal moment of reckoning and renewal. Hear the inner summons with courage and answer it without hesitation.',
    reversedMeaning:
      'Self-doubt, harsh self-judgment, or ignoring a profound calling stall the transformation awaiting you. Release guilt that no longer serves and forgive yourself fully so you may move forward reborn.',
    keywords: ['awakening', 'absolution', 'rebirth', 'calling', 'reckoning'],
  },
  {
    id: 'major-21',
    name: 'The World',
    arcana: 'major',
    suit: null,
    number: 21,
    uprightMeaning:
      'Completion, wholeness, and triumphant integration of all life\'s lessons signal the joyful achievement of a major cycle. Celebrate how far you have come before setting your sights on the next grand beginning.',
    reversedMeaning:
      'Incompletion, shortcuts to closure, or inability to integrate lessons keep you from experiencing true fulfillment. Tie up loose ends with care and acknowledge the growth that cannot yet be seen.',
    keywords: ['completion', 'wholeness', 'achievement', 'integration', 'fulfillment'],
  },

  // ─── MINOR ARCANA — WANDS ───────────────────────────────────────────────────
  {
    id: 'wands-1',
    name: 'Ace of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 1,
    uprightMeaning:
      'A spark of pure creative inspiration, passionate new beginnings, and the raw potential of fire energy ignite within you. Seize this moment to plant the seed of a bold new venture with full enthusiasm.',
    reversedMeaning:
      'Delays, lack of direction, or creative blocks extinguish the initial spark before it can catch. Reconnect with what genuinely excites you to reignite the fire of inspired action.',
    keywords: ['inspiration', 'new beginnings', 'creative spark', 'potential', 'enthusiasm'],
  },
  {
    id: 'wands-2',
    name: 'Two of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 2,
    uprightMeaning:
      'Bold future planning, personal power, and the expansive vision of an explorer who has conquered one world and now surveys the next. Commit to your long-range vision and take the first decisive step.',
    reversedMeaning:
      'Fear of the unknown, lack of planning, or playing it overly safe restricts your full potential for growth. Examine what limiting beliefs are keeping you anchored when you are meant to set sail.',
    keywords: ['planning', 'future vision', 'personal power', 'expansion', 'discovery'],
  },
  {
    id: 'wands-3',
    name: 'Three of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 3,
    uprightMeaning:
      'Foresight, expansion into new horizons, and the early fruits of bold enterprise reward your courageous initiative. Your ships are coming in — look further still and prepare to grow beyond previous limits.',
    reversedMeaning:
      'Unexpected delays, obstacles to expansion, or plans failing to launch despite effort require patience and reassessment. Refine your strategy and stay faithful to the vision even when results are slow to arrive.',
    keywords: ['foresight', 'expansion', 'enterprise', 'progress', 'horizons'],
  },
  {
    id: 'wands-4',
    name: 'Four of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 4,
    uprightMeaning:
      'Celebration, homecoming, and the joyful harvest of hard work bring a period of stability, community, and heartfelt gratitude. Honor this milestone with those you love — you have earned this moment of peace.',
    reversedMeaning:
      'Tension within community, an incomplete celebration, or a home situation lacking harmony clouds what should be a joyful time. Address underlying issues with openness to restore genuine warmth and belonging.',
    keywords: ['celebration', 'harmony', 'homecoming', 'community', 'stability'],
  },
  {
    id: 'wands-5',
    name: 'Five of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 5,
    uprightMeaning:
      'Competition, conflict, and the dynamic friction of many strong wills clash in a battle that ultimately sharpens everyone involved. Channel this competitive energy constructively and welcome the challenge as a catalyst for growth.',
    reversedMeaning:
      'Inner conflict, avoided confrontation, or suppressed aggression creates tension that festers beneath the surface. Address disagreements directly rather than letting unresolved friction quietly erode your energy.',
    keywords: ['conflict', 'competition', 'tension', 'diversity of views', 'challenge'],
  },
  {
    id: 'wands-6',
    name: 'Six of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 6,
    uprightMeaning:
      'Public recognition, hard-won victory, and the triumphant acknowledgment of your achievements by others affirm your efforts. Ride this wave of success with confidence and allow yourself to be seen.',
    reversedMeaning:
      'Ego inflation, dependence on external validation, or a private defeat diminishes your sense of worthiness. Cultivate inner recognition of your value that stands independent of applause.',
    keywords: ['victory', 'success', 'public recognition', 'confidence', 'achievement'],
  },
  {
    id: 'wands-7',
    name: 'Seven of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 7,
    uprightMeaning:
      'Perseverance, standing firm in the face of opposition, and defending what you have built with courageous resolve. You hold the high ground — do not surrender your position out of exhaustion or self-doubt.',
    reversedMeaning:
      'Feeling overwhelmed, giving up under pressure, or abandoning your stance before the battle is truly lost. Reassess whether you are fighting the right battles and conserve your energy for what truly matters.',
    keywords: ['perseverance', 'defensiveness', 'courage', 'resilience', 'standing firm'],
  },
  {
    id: 'wands-8',
    name: 'Eight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 8,
    uprightMeaning:
      'Swift movement, rapid progress, and the exciting momentum of events suddenly accelerating bring exhilarating change. Everything you have set in motion is now moving quickly — stay alert and adaptable.',
    reversedMeaning:
      'Delays, chaos, or communications gone astray interrupt the natural flow and scatter momentum. Slow down enough to ensure messages and plans are clear before forcing further acceleration.',
    keywords: ['speed', 'swift action', 'progress', 'momentum', 'rapid change'],
  },
  {
    id: 'wands-9',
    name: 'Nine of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 9,
    uprightMeaning:
      'Resilience, persistence through weariness, and the hard-won wisdom of one who has endured keep you standing at the final threshold. You have the strength to see this through — do not give up now.',
    reversedMeaning:
      'Stubbornness, paranoia, or near-total exhaustion from prolonged struggle make it difficult to continue with full strength. Seek support, rest, and assess whether continued resistance serves or merely prolongs suffering.',
    keywords: ['resilience', 'persistence', 'courage', 'fatigue', 'last stand'],
  },
  {
    id: 'wands-10',
    name: 'Ten of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 10,
    uprightMeaning:
      'Burden, overcommitment, and the heavy responsibility of carrying too much at once signal the need to delegate and reassess. You are nearly at the finish line — examine what burdens you can legitimately set down.',
    reversedMeaning:
      'Releasing burdens, learning to delegate, or finally putting down what was never yours to carry brings profound relief. Give yourself permission to do less so that you may live more fully.',
    keywords: ['burden', 'overcommitment', 'responsibility', 'hard work', 'struggle'],
  },
  {
    id: 'wands-11',
    name: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 11,
    uprightMeaning:
      'Enthusiastic exploration, a free spirit hungry for experience, and the adventurous beginnings of a creative or spiritual quest energize this moment. Follow your curiosity with playful boldness and embrace the joy of learning.',
    reversedMeaning:
      'Scattered energy, lack of follow-through, or reckless impulsiveness waste the genuine creative gifts available to you. Channel fiery enthusiasm into focused commitment before the flame burns out.',
    keywords: ['enthusiasm', 'exploration', 'free spirit', 'adventurous', 'creative'],
  },
  {
    id: 'wands-12',
    name: 'Knight of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 12,
    uprightMeaning:
      'Passionate energy, fearless action, and the electrifying momentum of a soul fully committed to its quest drive you forward at full speed. Harness this fire purposefully and let nothing extinguish your bold charge.',
    reversedMeaning:
      'Recklessness, aggression, or impulsive decisions made without sufficient planning create avoidable chaos in your wake. Temper the fire with a measure of strategic foresight before leaping into action.',
    keywords: ['passion', 'fearlessness', 'impulsive action', 'adventure', 'energy'],
  },
  {
    id: 'wands-13',
    name: 'Queen of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 13,
    uprightMeaning:
      'Courageous self-confidence, magnetic charisma, and the warm, inspiring presence of a fiercely creative soul attract abundance and admiration. Lead with passion and generosity, and others will naturally follow your light.',
    reversedMeaning:
      'Jealousy, demanding behavior, or selfish use of charisma alienates those whose support you need most. Redirect the fire inward toward self-mastery rather than outward toward control of others.',
    keywords: ['confidence', 'charisma', 'creativity', 'independence', 'warmth'],
  },
  {
    id: 'wands-14',
    name: 'King of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 14,
    uprightMeaning:
      'Visionary leadership, entrepreneurial mastery, and the bold authority of one who transforms inspired visions into powerful realities command respect and inspire loyalty. Lead with integrity, generosity, and unwavering creative vision.',
    reversedMeaning:
      'Arrogance, forceful domination, or impatience with those who move at a different pace undermines your natural authority. Soften the edges of your fire and listen as much as you direct.',
    keywords: ['visionary', 'leadership', 'entrepreneurship', 'mastery', 'boldness'],
  },

  // ─── MINOR ARCANA — CUPS ────────────────────────────────────────────────────
  {
    id: 'cups-1',
    name: 'Ace of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 1,
    uprightMeaning:
      'A divine outpouring of love, new emotional beginnings, and the overflowing grace of an open and receptive heart mark this as a deeply blessed moment. Welcome new connections, creative inspiration, and spiritual gifts with an open soul.',
    reversedMeaning:
      'Emotional repression, blocked intuition, or an inability to give or receive love creates inner emptiness. Gently clear what obstructs your heart and allow feelings to flow once more.',
    keywords: ['new love', 'emotional beginnings', 'intuition', 'creativity', 'spiritual gifts'],
  },
  {
    id: 'cups-2',
    name: 'Two of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 2,
    uprightMeaning:
      'A beautiful mutual attraction, partnership forged on equal footing, and the sacred alchemy of two souls uniting in love and trust bless this connection. Honor this bond with genuine vulnerability and wholehearted presence.',
    reversedMeaning:
      'Imbalance in a relationship, broken trust, or separation from a meaningful partnership creates emotional pain. Examine whether both parties are equally invested and address any power imbalances with honesty.',
    keywords: ['partnership', 'attraction', 'mutual love', 'union', 'connection'],
  },
  {
    id: 'cups-3',
    name: 'Three of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 3,
    uprightMeaning:
      'Joyful celebration, friendship, and the heartwarming abundance of community and creative collaboration fill your world with laughter. This is a time to honor the people who uplift you and rejoice in shared accomplishments.',
    reversedMeaning:
      'Overindulgence, gossip within your circle, or social isolation dampens the genuine joy available in community. Bring awareness to dynamics that drain rather than nourish and choose connections that genuinely celebrate your growth.',
    keywords: ['celebration', 'friendship', 'community', 'joy', 'abundance'],
  },
  {
    id: 'cups-4',
    name: 'Four of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 4,
    uprightMeaning:
      'Contemplation, emotional withdrawal, and a period of introspective reassessment ask you to look beyond the offerings in front of you. A new opportunity may be appearing quietly while your attention is turned inward.',
    reversedMeaning:
      'Re-emerging from apathy, renewed motivation, or finally accepting a long-overlooked offer signals a healthy return to engagement. Be open to the gifts that life is extending even when they arrive unannounced.',
    keywords: ['contemplation', 'apathy', 'reevaluation', 'introspection', 'missed opportunity'],
  },
  {
    id: 'cups-5',
    name: 'Five of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 5,
    uprightMeaning:
      'Loss, grief, and the necessary mourning of what has been taken away or spilled call for genuine emotional processing. When the tears have been honored, turn to see the cups still standing — not all is lost.',
    reversedMeaning:
      'Moving on from grief, emotional recovery, and the gradual return of hope signal that healing is well underway. Allow yourself to fully grieve and then gently redirect your attention toward what remains.',
    keywords: ['loss', 'grief', 'regret', 'mourning', 'recovery'],
  },
  {
    id: 'cups-6',
    name: 'Six of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 6,
    uprightMeaning:
      'Nostalgia, innocent joy, and the healing warmth of happy memories reconnect you with the purity and wonder of your younger self. This card also speaks to acts of simple kindness and the gift of returning home.',
    reversedMeaning:
      'Living too much in the past, rose-tinted memories that distort the present, or unresolved childhood wounds limit your ability to move forward freely. Honor the past with gratitude without letting it anchor you there.',
    keywords: ['nostalgia', 'childhood', 'innocence', 'past', 'kindness'],
  },
  {
    id: 'cups-7',
    name: 'Seven of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 7,
    uprightMeaning:
      'Fantasy, wishful thinking, and an abundance of imaginative options invite you to dream boldly while remaining grounded in discernment. Not all that glitters in the vision world will sustain you — choose wisely.',
    reversedMeaning:
      'Clarity emerging from confusion, dispelling illusions, or making a long-delayed decisive choice brings welcome relief. Ground your dreams in practical action and commit to what is genuinely aligned with your soul.',
    keywords: ['fantasy', 'illusion', 'choices', 'wishful thinking', 'imagination'],
  },
  {
    id: 'cups-8',
    name: 'Eight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 8,
    uprightMeaning:
      'Walking away from what no longer fulfills you, seeking deeper meaning, and having the courage to abandon the familiar for the soul\'s true calling marks a pivotal spiritual turning. Honor the sadness of leaving and the courage it takes.',
    reversedMeaning:
      'Fear of moving on, staying in an empty situation out of comfort, or returning to what was already outgrown delays necessary transformation. Examine whether what you are holding onto still nourishes your deepest self.',
    keywords: ['walking away', 'deeper meaning', 'disappointment', 'seeking', 'transition'],
  },
  {
    id: 'cups-9',
    name: 'Nine of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 9,
    uprightMeaning:
      'Emotional fulfillment, wishes coming true, and a deep sense of contentment and gratitude signal a blessed period of personal satisfaction. Count your blessings openly and allow yourself to truly enjoy what you have created.',
    reversedMeaning:
      'Overindulgence, superficial satisfaction, or placing material comfort above genuine emotional and spiritual nourishment. Assess whether your contentment is authentic or merely a comfortable numbness avoiding deeper truths.',
    keywords: ['wish fulfillment', 'satisfaction', 'contentment', 'gratitude', 'abundance'],
  },
  {
    id: 'cups-10',
    name: 'Ten of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 10,
    uprightMeaning:
      'Divine love, lasting happiness, and the ultimate fulfillment of an emotionally rich family and community life radiate pure joy. This card represents the heart\'s deepest vision of harmony made beautifully real.',
    reversedMeaning:
      'Broken family dynamics, disrupted harmony, or a gap between the dream of happiness and the messy reality call for honest attention. Do the inner and relational work needed to close that gap with love.',
    keywords: ['family', 'harmony', 'happiness', 'divine love', 'fulfillment'],
  },
  {
    id: 'cups-11',
    name: 'Page of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 11,
    uprightMeaning:
      'Creative sensitivity, intuitive messages, and the wide-open emotional receptivity of a dreaming soul invite you to follow whimsy and wonder. A surprising message or a creative spark arrives from an unexpected, magical source.',
    reversedMeaning:
      'Emotional immaturity, creative blocks, or an overactive fantasy life disconnected from reality limits genuine feeling. Ground your imagination in honest emotional expression rather than evasive daydreaming.',
    keywords: ['sensitivity', 'intuition', 'creative messages', 'curiosity', 'wonder'],
  },
  {
    id: 'cups-12',
    name: 'Knight of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 12,
    uprightMeaning:
      'Romantic idealism, following the heart\'s call, and the graceful pursuit of beauty, love, and inspired vision characterize this dreaming yet devoted soul. Act on your heart\'s deepest longing with both sensitivity and courage.',
    reversedMeaning:
      'Moodiness, unrealistic expectations, or emotional manipulation taint the beauty of an otherwise sincere heart. Guard against projecting an idealized fantasy onto real people or situations.',
    keywords: ['romance', 'idealism', 'following the heart', 'charm', 'imagination'],
  },
  {
    id: 'cups-13',
    name: 'Queen of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 13,
    uprightMeaning:
      'Deep emotional intelligence, compassionate nurturing, and psychic sensitivity make this queen a vessel for healing and unconditional love. Trust your intuition fully and lead others with empathy and boundless care.',
    reversedMeaning:
      'Emotional overwhelm, codependency, or insecurity erodes the clear and compassionate presence that is your greatest gift. Establish healthy emotional boundaries so that your giving flows from abundance rather than depletion.',
    keywords: ['compassion', 'empathy', 'intuition', 'emotional intelligence', 'nurturing'],
  },
  {
    id: 'cups-14',
    name: 'King of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 14,
    uprightMeaning:
      'Emotional mastery, compassionate wisdom, and the calm authority of one who has navigated the full depths of feeling without being swept away. Lead with a heart that is both open and steady — this is rare and powerful.',
    reversedMeaning:
      'Emotional manipulation, coldness beneath a caring surface, or unresolved feelings erupting in destructive ways undermine trust. Return to honest self-examination and allow genuine vulnerability rather than controlled distance.',
    keywords: ['emotional mastery', 'wisdom', 'compassion', 'diplomacy', 'calm'],
  },

  // ─── MINOR ARCANA — SWORDS ──────────────────────────────────────────────────
  {
    id: 'swords-1',
    name: 'Ace of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 1,
    uprightMeaning:
      'Breakthrough clarity, the power of truth cutting through confusion, and the sharp intelligence of a newly awakened mind bring decisive momentum. Use this mental clarity to speak your truth and cut away what is false.',
    reversedMeaning:
      'Mental fog, confusion, or a truth too painful to acknowledge blocks the clarity needed for right action. Pause, breathe, and allow the muddy waters of the mind to settle before acting.',
    keywords: ['clarity', 'truth', 'breakthrough', 'mental power', 'decisiveness'],
  },
  {
    id: 'swords-2',
    name: 'Two of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 2,
    uprightMeaning:
      'Stalemate, a difficult decision requiring impartiality, and the deliberate blindfold of avoidance keep two options locked in painful balance. You must choose even when all options feel uncomfortable — indecision is its own choice.',
    reversedMeaning:
      'Information emerging to break a stalemate, decisions finally being made, or releasing a painful emotional deadlock brings movement. Removing the blindfold may be frightening but it is necessary for progress.',
    keywords: ['stalemate', 'indecision', 'blocked emotions', 'avoidance', 'choice'],
  },
  {
    id: 'swords-3',
    name: 'Three of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 3,
    uprightMeaning:
      'Heartbreak, sorrow, and the sharp pain of loss or betrayal cut deeply but also carve open space for profound healing and truth. Feel the grief fully — only by passing through this pain can genuine healing begin.',
    reversedMeaning:
      'Healing from heartbreak, releasing pain, or the slow mending of a wounded heart signal that the worst is passing. Be patient with the process of recovery and offer yourself the same compassion you would a dear friend.',
    keywords: ['heartbreak', 'sorrow', 'grief', 'loss', 'truth'],
  },
  {
    id: 'swords-4',
    name: 'Four of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 4,
    uprightMeaning:
      'Rest, recovery, and the sacred stillness of withdrawal from battle allow mind, body, and spirit to replenish after intense effort. Take the rest you need without guilt — restoration is not retreat, it is strategy.',
    reversedMeaning:
      'Restlessness, burnout from refusing to rest, or re-entering the fray before healing is complete depletes essential reserves. Honor the wisdom of your body and mind by allowing genuine, unhurried recuperation.',
    keywords: ['rest', 'recovery', 'contemplation', 'retreat', 'peace'],
  },
  {
    id: 'swords-5',
    name: 'Five of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 5,
    uprightMeaning:
      'Conflict, defeat, and the hollow victory of winning at the expense of others\' dignity point to battles that cost more than they are worth. Examine whether the desire to be right is more important than the desire for peace.',
    reversedMeaning:
      'Reconciliation after conflict, letting go of the need to win, or walking away from a self-defeating battle marks a return to wisdom. Choose peace over pride and allow old wounds to begin their healing.',
    keywords: ['conflict', 'defeat', 'hollow victory', 'tension', 'self-interest'],
  },
  {
    id: 'swords-6',
    name: 'Six of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 6,
    uprightMeaning:
      'Transition, moving away from turbulence toward calmer waters, and the slow but certain passage from difficulty to relative peace offer hope. You are moving in the right direction — keep your eyes on the far shore.',
    reversedMeaning:
      'Resistance to moving on, carrying old mental burdens into new situations, or hitting rough water mid-passage disrupts forward progress. Identify what you are still holding onto from the past that makes the crossing harder.',
    keywords: ['transition', 'moving on', 'calmer waters', 'healing', 'travel'],
  },
  {
    id: 'swords-7',
    name: 'Seven of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 7,
    uprightMeaning:
      'Strategy, stealth, and the calculated move of one who acts alone or uses cunning to achieve an objective call for careful discernment. Assess whether you are operating with clever strategy or sliding into deception.',
    reversedMeaning:
      'Confession, coming clean, or the exposure of deception — whether your own or another\'s — brings an uncomfortable but necessary reckoning. Honesty now, though difficult, is infinitely preferable to the consequences of prolonged deceit.',
    keywords: ['strategy', 'deception', 'stealth', 'cunning', 'impermanence'],
  },
  {
    id: 'swords-8',
    name: 'Eight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 8,
    uprightMeaning:
      'Self-imposed restriction, a victim mentality, and the mental prison of limiting beliefs leave you feeling trapped when freedom is actually nearer than you think. The blindfold and bindings are largely of your own making — step forward.',
    reversedMeaning:
      'Breaking free from mental restrictions, releasing victim consciousness, or finally seeing through the illusion of powerlessness restores agency and hope. You have more choices than your fear has allowed you to see.',
    keywords: ['restriction', 'self-imposed limits', 'victim mentality', 'fear', 'liberation'],
  },
  {
    id: 'swords-9',
    name: 'Nine of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 9,
    uprightMeaning:
      'Anxiety, sleepless worry, and the anguish of a mind that magnifies fears in the dark of night reach a painful peak that demands compassionate attention. Seek support, challenge catastrophic thinking, and bring your fears into the light.',
    reversedMeaning:
      'Releasing anxiety, finding relief after a period of intense mental anguish, or finally confronting the fears that haunted you brings gradual but real recovery. Healing is closer than the darkness would have you believe.',
    keywords: ['anxiety', 'fear', 'worry', 'sleeplessness', 'despair'],
  },
  {
    id: 'swords-10',
    name: 'Ten of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 10,
    uprightMeaning:
      'A painful but final ending, total defeat, or betrayal marks the absolute rock bottom of a cycle — but with the dawn comes the certain promise of renewal. This is the end; it cannot get worse, and so it will get better.',
    reversedMeaning:
      'Recovery from a devastating blow, refusing to stay down, or resisting an inevitable ending that still needs to occur. You cannot rise until you fully accept what has ended — and once you do, rebirth comes swiftly.',
    keywords: ['endings', 'betrayal', 'defeat', 'painful conclusion', 'rock bottom'],
  },
  {
    id: 'swords-11',
    name: 'Page of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 11,
    uprightMeaning:
      'Intellectual curiosity, eagerness to learn, and a sharp mind hungry for truth and new ideas bring fresh and alert energy to any situation. Ask bold questions, communicate clearly, and pursue knowledge with passionate candor.',
    reversedMeaning:
      'Gossip, sharp-tongued communication, or all mental energy with no grounded follow-through wastes considerable intellectual gifts. Think before you speak and direct your mental acuity toward constructive rather than combative ends.',
    keywords: ['curiosity', 'intellectual energy', 'communication', 'truth-seeking', 'alertness'],
  },
  {
    id: 'swords-12',
    name: 'Knight of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 12,
    uprightMeaning:
      'Fierce determination, direct communication, and the unstoppable charge of a brilliant mind committed to a cause drive rapid and decisive action. Charge forward with clarity and conviction — just be sure your sword is aimed at the right target.',
    reversedMeaning:
      'Reckless aggression, verbal cruelty, or charging ahead without sufficient information creates chaos and damaged relationships in your wake. Slow the charge, gather more intel, and temper brilliance with basic human sensitivity.',
    keywords: ['determination', 'directness', 'ambition', 'speed', 'intellectual force'],
  },
  {
    id: 'swords-13',
    name: 'Queen of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 13,
    uprightMeaning:
      'Clear-minded perception, honest communication, and the sharp but fair authority of one who has earned wisdom through experience. Cut through pretense with surgical clarity and offer others the gift of your unvarnished, compassionate truth.',
    reversedMeaning:
      'Coldness, cruelty disguised as honesty, or emotional bitterness coloring judgment undermines the genuine clarity that is your great strength. Let past grief inform your wisdom without allowing it to calcify your heart.',
    keywords: ['clear-minded', 'honest', 'direct', 'perceptive', 'independent'],
  },
  {
    id: 'swords-14',
    name: 'King of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 14,
    uprightMeaning:
      'Intellectual authority, ethical clarity, and the decisive command of one who leads with both brilliant mind and incorruptible principles inspire trust and respect. Hold your standards high and let truth be both your sword and your shield.',
    reversedMeaning:
      'Tyranny of intellect, manipulation of others through superior knowledge, or the abuse of mental authority betrays the very principles that give your power its legitimacy. Return to ethical reasoning and let fair truth guide you.',
    keywords: ['intellectual authority', 'truth', 'ethics', 'clarity', 'command'],
  },

  // ─── MINOR ARCANA — PENTACLES ───────────────────────────────────────────────
  {
    id: 'pentacles-1',
    name: 'Ace of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 1,
    uprightMeaning:
      'A golden opportunity, a new material beginning, and the prosperous seed of a venture grounded in the physical world are offered with divine generosity. Receive this gift with both hands and plant it where it can truly grow.',
    reversedMeaning:
      'Missed financial opportunity, poor planning, or greed squandering a golden chance for material stability. Reassess your relationship with money and the earth\'s abundance before the window closes.',
    keywords: ['opportunity', 'prosperity', 'material beginnings', 'abundance', 'manifestation'],
  },
  {
    id: 'pentacles-2',
    name: 'Two of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 2,
    uprightMeaning:
      'Skillful juggling of multiple priorities, financial adaptability, and the graceful balance of life\'s ever-shifting demands are mastered with practiced ease. Stay flexible, keep your sense of humor, and trust your ability to manage change.',
    reversedMeaning:
      'Overwhelm from too many competing demands, financial disorganization, or dropping important balls due to misaligned priorities create instability. Prioritize ruthlessly and ask for help before the juggling act collapses.',
    keywords: ['balance', 'adaptability', 'juggling', 'flexibility', 'time management'],
  },
  {
    id: 'pentacles-3',
    name: 'Three of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 3,
    uprightMeaning:
      'Collaboration, mastery through dedicated practice, and the recognition that skilled teamwork creates far greater results than solo effort validate your commitment to craft. Work diligently alongside others and take pride in your growing expertise.',
    reversedMeaning:
      'Poor teamwork, lack of effort, or disregard for others\' contributions undermine the quality and integrity of your shared work. Bring humility and genuine respect for each collaborator\'s contribution back to the process.',
    keywords: ['collaboration', 'skill', 'mastery', 'teamwork', 'craftsmanship'],
  },
  {
    id: 'pentacles-4',
    name: 'Four of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 4,
    uprightMeaning:
      'Financial security built through disciplined saving and careful stewardship of resources creates a stable foundation. Examine whether protective conservatism serves genuine security or merely expresses fear of loss.',
    reversedMeaning:
      'Releasing financial control, overcoming miserliness, or spending recklessly in a confused reaction against past scarcity both lead to imbalance. Find the healthy middle ground between hoarding and squandering.',
    keywords: ['security', 'control', 'conservation', 'stability', 'possessiveness'],
  },
  {
    id: 'pentacles-5',
    name: 'Five of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 5,
    uprightMeaning:
      'Financial hardship, material loss, or feeling spiritually and physically left out in the cold demand both resourcefulness and the humility to seek help. Look up from your struggle — there is warmth and support closer than you realize.',
    reversedMeaning:
      'Recovery from financial difficulty, accepting help graciously, or a shift from a poverty mindset to one of genuine abundance marks an important turning. Allow support in and begin to see yourself as worthy of prosperity.',
    keywords: ['hardship', 'loss', 'poverty consciousness', 'isolation', 'recovery'],
  },
  {
    id: 'pentacles-6',
    name: 'Six of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 6,
    uprightMeaning:
      'Generosity, charitable giving, and the balanced flow of material resources between those who have and those who need create harmonious abundance for all. Give and receive with equal grace and remember that wealth circulates best when it flows.',
    reversedMeaning:
      'Strings-attached giving, power imbalances in generosity, or receiving charity that diminishes dignity call for reassessment of how resources are being shared. True generosity empowers rather than creates dependence.',
    keywords: ['generosity', 'giving', 'receiving', 'charity', 'balance'],
  },
  {
    id: 'pentacles-7',
    name: 'Seven of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 7,
    uprightMeaning:
      'Patient assessment of long-term investments, pausing to evaluate the fruits of sustained effort, and the wisdom of knowing when to wait and when to act characterize this moment of reflective stocktaking. Your work is growing — trust the process.',
    reversedMeaning:
      'Impatience with slow results, poor investment of time and energy, or lack of long-term vision squanders the fruits of genuine effort. Resist the urge to abandon a worthy endeavor before the harvest has properly ripened.',
    keywords: ['patience', 'investment', 'assessment', 'long-term vision', 'perseverance'],
  },
  {
    id: 'pentacles-8',
    name: 'Eight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 8,
    uprightMeaning:
      'Dedicated craftsmanship, mastery through diligent practice, and the deep satisfaction of honing a skill with full focus and commitment mark a period of meaningful productive effort. Do your work with wholehearted attention and excellence will follow.',
    reversedMeaning:
      'Perfectionism that paralyzes, mediocrity accepted without effort, or working hard on the wrong thing wastes your considerable capacity for mastery. Align effort with genuine purpose and release the need for flawlessness before you begin.',
    keywords: ['craftsmanship', 'diligence', 'mastery', 'skill development', 'dedication'],
  },
  {
    id: 'pentacles-9',
    name: 'Nine of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 9,
    uprightMeaning:
      'Luxurious self-sufficiency, the refined enjoyment of well-earned abundance, and the quiet satisfaction of a life built beautifully on your own terms grace this deeply satisfying moment. You have worked hard for this — savor it fully.',
    reversedMeaning:
      'Financial dependence, overworking to the exclusion of enjoyment, or a hollow sense of success despite material achievement signal that something essential is missing. Reconnect with what genuine fulfillment means beyond external measures.',
    keywords: ['self-sufficiency', 'abundance', 'refinement', 'independence', 'luxury'],
  },
  {
    id: 'pentacles-10',
    name: 'Ten of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 10,
    uprightMeaning:
      'Lasting wealth, family legacy, and the deep fulfillment of material and spiritual abundance shared across generations represent the ultimate earthly success. Invest in what will endure and bring meaning beyond your own lifetime.',
    reversedMeaning:
      'Family conflict over money or inheritance, financial instability threatening long-term security, or the hollowness of wealth without meaningful human connection. Tend the roots — wealth without relational richness is an empty harvest.',
    keywords: ['legacy', 'family wealth', 'abundance', 'security', 'permanence'],
  },
  {
    id: 'pentacles-11',
    name: 'Page of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 11,
    uprightMeaning:
      'Studious ambition, the eager beginnings of a new financial or practical venture, and the grounded curiosity of a young mind committed to learning and building. Apply yourself to the work with patience and practical focus — this foundation will carry you far.',
    reversedMeaning:
      'Lack of focus on practical matters, procrastination in the face of important responsibilities, or daydreaming without concrete follow-through limits material progress. Ground your ambitions in specific, actionable steps taken consistently.',
    keywords: ['ambition', 'diligence', 'new ventures', 'learning', 'practicality'],
  },
  {
    id: 'pentacles-12',
    name: 'Knight of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 12,
    uprightMeaning:
      'Methodical reliability, hardworking determination, and the steady, unhurried progress of one fully committed to thoroughness and trustworthiness deliver lasting results. Slow and steady wins this particular race — keep going with disciplined consistency.',
    reversedMeaning:
      'Stubbornness, boredom from overly rigid routine, or workaholic tendencies at the expense of joy and spontaneity create a kind of earthbound stagnation. Introduce some fresh inspiration without abandoning the discipline that makes your work reliable.',
    keywords: ['reliability', 'diligence', 'methodical', 'patience', 'hard work'],
  },
  {
    id: 'pentacles-13',
    name: 'Queen of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 13,
    uprightMeaning:
      'Practical nurturing, earthy abundance, and the warm, capable mastery of one who tends home, body, finances, and loved ones with equal skill and genuine pleasure. Create a sanctuary of comfort and prosperity that nourishes all who enter.',
    reversedMeaning:
      'Financial insecurity, neglect of domestic life, or allowing material worries to crowd out warmth and presence diminishes the abundant environment you are capable of creating. Return to the sensory, earthy pleasures that restore and ground you.',
    keywords: ['nurturing', 'practicality', 'abundance', 'groundedness', 'financial security'],
  },
  {
    id: 'pentacles-14',
    name: 'King of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 14,
    uprightMeaning:
      'Masterful abundance, generous wealth, and the confident authority of one whose patient, disciplined efforts have built an enduring empire of material and spiritual prosperity. Lead others toward sustainable wealth with wisdom, generosity, and unshakeable reliability.',
    reversedMeaning:
      'Stubbornness, greed, or the corruption that can attend great material power erode the very foundations of what you have built. Revisit your core values and allow wealth to serve genuine generosity rather than become an end in itself.',
    keywords: ['abundance', 'prosperity', 'generosity', 'mastery', 'leadership'],
  },
];

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

export function drawCard(moonPhase?: string): TarotCard {
  // Major arcana weighted 1.3x during full/new moon
  const isHighEnergy = moonPhase === 'Full Moon' || moonPhase === 'New Moon';

  const majorArcana = TAROT_DECK.filter(c => c.arcana === 'major');
  const minorArcana = TAROT_DECK.filter(c => c.arcana === 'minor');

  // Build weighted pool
  const pool: TarotCard[] = [];
  for (const card of majorArcana) {
    pool.push(card);
    if (isHighEnergy) pool.push(card); // 2x weight = effectively 1.3x when normalized with minor
  }
  for (const card of minorArcana) {
    pool.push(card);
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCardById(id: string): TarotCard | undefined {
  return TAROT_DECK.find(c => c.id === id);
}

export function isCardReversed(): boolean {
  return Math.random() < 0.3; // 30% chance of reversed
}
