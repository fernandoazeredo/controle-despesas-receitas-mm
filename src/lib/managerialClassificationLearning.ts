import { officialChartOfAccounts, type ChartOfAccount } from '../data/chartOfAccounts'
import { mmExpenseSeedSuggestion } from './mmExpenseSeedKnowledge'

export type LearningSourceType = 'expense' | 'revenue'

export type LearningClassification = {
  id?: string
  sourceType?: LearningSourceType
  sourceId?: string
  sourceCounterparty?: string
  sourceDescription?: string
  accountCode?: string
  confirmed?: boolean
}

export type LearnedSuggestion = {
  account: ChartOfAccount
  confidence: number
  reason: string
}

function normalized(value: unknown) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function usefulTokens(value: unknown) {
  const stopWords = new Set(['para', 'com', 'sem', 'das', 'dos', 'uma', 'por', 'referente', 'pagamento', 'recebimento', 'despesa', 'receita'])
  return new Set(normalized(value).split(' ').filter((token) => token.length >= 4 && !stopWords.has(token)))
}

function similarity(a: unknown, b: unknown) {
  const left = usefulTokens(a)
  const right = usefulTokens(b)
  if (left.size === 0 || right.size === 0) return 0
  let intersection = 0
  for (const token of left) if (right.has(token)) intersection += 1
  return intersection / Math.max(left.size, right.size)
}

function accountByCode(type: LearningSourceType, code: string | undefined) {
  const category = type === 'expense' ? 'Despesa' : 'Receita'
  return officialChartOfAccounts.find((account) => account.code === code && account.kind === 'account' && account.category === category) ?? null
}

export function learnedClassificationSuggestion(args: {
  type: LearningSourceType
  sourceId: string
  counterparty: string
  description: string
  history: LearningClassification[]
}): LearnedSuggestion | null {
  const { type, sourceId, counterparty, description, history } = args
  const validHistory = history.filter((record) => record.confirmed && record.sourceType === type && record.sourceId !== sourceId && accountByCode(type, record.accountCode))
  const normalizedCounterparty = normalized(counterparty)

  // 1) Memória real: classificações já confirmadas pelos usuários do sistema.
  if (normalizedCounterparty) {
    const sameCounterparty = validHistory.filter((record) => normalized(record.sourceCounterparty) === normalizedCounterparty)
    if (sameCounterparty.length > 0) {
      const counts = new Map<string, number>()
      sameCounterparty.forEach((record) => {
        if (record.accountCode) counts.set(record.accountCode, (counts.get(record.accountCode) ?? 0) + 1)
      })
      const ranking = [...counts.entries()].sort((a, b) => b[1] - a[1])
      const [bestCode, bestCount] = ranking[0] ?? []
      const account = accountByCode(type, bestCode)
      if (account && bestCount) {
        const dominance = bestCount / sameCounterparty.length
        if (bestCount >= 2 && dominance === 1) {
          return { account, confidence: 99, reason: `Aprendido com ${bestCount} classificações confirmadas deste mesmo favorecido/cliente` }
        }
        if (bestCount >= 3 && dominance >= 0.75) {
          return { account, confidence: 94, reason: `Padrão predominante do histórico deste favorecido/cliente (${bestCount} de ${sameCounterparty.length})` }
        }
        if (bestCount === 1 && sameCounterparty.length === 1) {
          return { account, confidence: 88, reason: 'Aprendido com a última classificação confirmada deste favorecido/cliente' }
        }
      }
    }
  }

  let bestMatch: { record: LearningClassification; score: number } | null = null
  for (const record of validHistory) {
    const score = similarity(description, record.sourceDescription)
    if (score > (bestMatch?.score ?? 0)) bestMatch = { record, score }
  }

  if (bestMatch && bestMatch.score >= 0.72) {
    const account = accountByCode(type, bestMatch.record.accountCode)
    if (account) return { account, confidence: 92, reason: 'Aprendido com lançamento anterior de descrição muito semelhante' }
  }
  if (bestMatch && bestMatch.score >= 0.55) {
    const account = accountByCode(type, bestMatch.record.accountCode)
    if (account) return { account, confidence: 82, reason: 'Histórico semelhante encontrado; requer conferência' }
  }

  // 2) Base inicial MM: padrões recorrentes observados no relatório real de despesas.
  // A base apenas aponta para contas já existentes no Plano de Contas oficial.
  if (type === 'expense') {
    const seeded = mmExpenseSeedSuggestion({ counterparty, description })
    if (seeded) return seeded
  }

  return null
}
