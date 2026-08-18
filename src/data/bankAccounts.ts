export type BankAccount = {
  id: 'itau' | 'bb' | 'cef'
  bank: string
  agency: string
  account: string
  holder: string
  holderType: 'PJ' | 'PF / Sócio'
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'itau',
    bank: 'Itaú',
    agency: '8548',
    account: '26486-3',
    holder: 'FLAVIO MARQUES ADVOGADOS ASSOCIADOS',
    holderType: 'PJ',
  },
  {
    id: 'bb',
    bank: 'Banco do Brasil',
    agency: '5974-9',
    account: '5875-0',
    holder: 'FLAVIO MARQUES DE SOUZA',
    holderType: 'PF / Sócio',
  },
  {
    id: 'cef',
    bank: 'Caixa Econômica Federal',
    agency: '3131',
    account: '1000225249',
    holder: 'FLAVIO MARQUES DE SOUZA',
    holderType: 'PF / Sócio',
  },
]

export const DEFAULT_BANK_ACCOUNT_ID: BankAccount['id'] = 'itau'

export function getBankAccount(id: string | null | undefined) {
  return BANK_ACCOUNTS.find((item) => item.id === id) ?? BANK_ACCOUNTS[0]
}
