const SOCIETARY_PATHS = new Set(['/repasse-societario', '/tesouraria'])

function messageFromReason(reason: unknown) {
  if (reason instanceof Error) return reason.message
  if (typeof reason === 'object' && reason && 'message' in reason) return String((reason as { message?: unknown }).message ?? '')
  return String(reason ?? '')
}

window.addEventListener('unhandledrejection', (event) => {
  if (!SOCIETARY_PATHS.has(window.location.pathname)) return

  const message = messageFromReason(event.reason)
  console.error('Falha não tratada no fluxo do Repasse Societário:', event.reason)

  const permissionFailure = /permission|insufficient|denied/i.test(message)
  const userMessage = permissionFailure
    ? 'A operação não foi concluída por falta de permissão. Nenhuma alteração foi confirmada. Atualize a tela e, se o problema continuar, procure o Administrador Master.'
    : 'A operação do Repasse Societário não foi concluída. Nenhuma confirmação deve ser considerada concluída até o status aparecer atualizado na tela.'

  window.alert(userMessage)
})
