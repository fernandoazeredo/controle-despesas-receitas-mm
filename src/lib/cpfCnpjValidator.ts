/**
 * Validação e máscara de CPF/CNPJ.
 * Módulo utilitário sem dependências externas.
 */
export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '')
}

export function maskCpfCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14)

  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calcDigit = (base: string, factorStart: number) => {
    let sum = 0
    for (let i = 0; i < base.length; i += 1) {
      sum += Number.parseInt(base[i], 10) * (factorStart - i)
    }
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const digit1 = calcDigit(cpf.slice(0, 9), 10)
  const digit2 = calcDigit(cpf.slice(0, 10), 11)
  return digit1 === Number.parseInt(cpf[9], 10) && digit2 === Number.parseInt(cpf[10], 10)
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const calcDigit = (base: string) => {
    const weights = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < base.length; i += 1) {
      sum += Number.parseInt(base[i], 10) * weights[i]
    }
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const digit1 = calcDigit(cnpj.slice(0, 12))
  const digit2 = calcDigit(cnpj.slice(0, 12) + digit1)
  return digit1 === Number.parseInt(cnpj[12], 10) && digit2 === Number.parseInt(cnpj[13], 10)
}

export function validateCpfCnpj(value: string): { valid: boolean; message?: string } {
  const digits = onlyDigits(value)

  if (digits.length === 0) return { valid: true }

  if (digits.length <= 11) {
    if (digits.length < 11) return { valid: false, message: 'CPF incompleto.' }
    return isValidCPF(digits)
      ? { valid: true }
      : { valid: false, message: 'CPF inválido. Confira os números digitados.' }
  }

  if (digits.length < 14) return { valid: false, message: 'CNPJ incompleto.' }

  return isValidCNPJ(digits)
    ? { valid: true }
    : { valid: false, message: 'CNPJ inválido. Confira os números digitados.' }
}
