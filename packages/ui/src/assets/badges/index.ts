import type { ImageSourcePropType } from 'react-native'
import budgetCompleter from './budget-completer.png'
import nTravelCompleted from './n-travel-completed.png'
import aiFirstChat from './ai-first-chat.png'
import redesignMaster from './redesign-master.png'
import crisisEscape from './crisis-escape.png'
import valueHunter from './value-hunter.png'
import dailyRecordKing from './daily-record-king.png'
import firstTripPlanner from './first-trip-planner.png'
import flexTraveler from './flex-traveler.png'
import nationwideGourmet from './nationwide-gourmet.png'
import goodPrice from './good-price.png'
import consistentType from './consistent-type.png'
import frugalExpert from './frugal-expert.png'
import localCrew from './local-crew.png'
import earlyBirdSaver from './early-bird-saver.png'
import quickReflexesMaster from './quick-reflexes-master.png'
import perfectFitPlanner from './perfect-fit-planner.png'

export type BadgeId =
  | 'budget-completer'
  | 'n-travel-completed'
  | 'ai-first-chat'
  | 'redesign-master'
  | 'crisis-escape'
  | 'value-hunter'
  | 'daily-record-king'
  | 'first-trip-planner'
  | 'flex-traveler'
  | 'nationwide-gourmet'
  | 'good-price'
  | 'consistent-type'
  | 'frugal-expert'
  | 'local-crew'
  | 'early-bird-saver'
  | 'quick-reflexes-master'
  | 'perfect-fit-planner'

export const badgeAssets: Record<BadgeId, ImageSourcePropType> = {
  'budget-completer': budgetCompleter,
  'n-travel-completed': nTravelCompleted,
  'ai-first-chat': aiFirstChat,
  'redesign-master': redesignMaster,
  'crisis-escape': crisisEscape,
  'value-hunter': valueHunter,
  'daily-record-king': dailyRecordKing,
  'first-trip-planner': firstTripPlanner,
  'flex-traveler': flexTraveler,
  'nationwide-gourmet': nationwideGourmet,
  'good-price': goodPrice,
  'consistent-type': consistentType,
  'frugal-expert': frugalExpert,
  'local-crew': localCrew,
  'early-bird-saver': earlyBirdSaver,
  'quick-reflexes-master': quickReflexesMaster,
  'perfect-fit-planner': perfectFitPlanner,
}

// G0~G17 배지 판정 기준(docs/business-logic-notes.md 6절)의 한글 배지명과 매칭
export const badgeNames: Record<BadgeId, string> = {
  'budget-completer': '예산 완주자',
  'perfect-fit-planner': '딱 맞춤 플래너',
  'frugal-expert': '짠테크 고수',
  'crisis-escape': '위기탈출',
  'flex-traveler': '플렉스 여행자',
  'early-bird-saver': '아침형 알뜰러',
  'quick-reflexes-master': '순발력 만렙',
  'consistent-type': '초지일관형',
  'redesign-master': '재설계 마스터',
  'good-price': '착한가격 애호가',
  'value-hunter': '가성비 헌터',
  'nationwide-gourmet': '팔도 미식가',
  'local-crew': '로컬 크루',
  'daily-record-king': '매일 기록왕',
  'n-travel-completed': 'N회 여행 완주',
  'first-trip-planner': '첫 여행 설계자',
  'ai-first-chat': 'AI와 첫 대화',
}
