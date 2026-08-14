$ErrorActionPreference = 'Stop'

$ProjectId = 'controle-despesas-receitas-mm'
$ExpectedFolderName = 'Controle_Despesas_Receitas_MM_Firebase'

Write-Host ''
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host ' FLAVIO MARQUES - DEPLOY FINANCEIRO' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host "Projeto Firebase: $ProjectId"
Write-Host "Pasta atual: $((Get-Location).Path)"
Write-Host ''

if (-not (Test-Path '.\package.json')) {
  throw 'package.json nao encontrado. Execute este script na raiz do projeto.'
}

if ((Split-Path -Leaf (Get-Location).Path) -ne $ExpectedFolderName) {
  Write-Warning "A pasta atual nao se chama $ExpectedFolderName. Confira se voce esta no projeto correto antes de continuar."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js nao encontrado no PATH.'
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'npm nao encontrado no PATH.'
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
  throw 'Firebase CLI nao encontrado. Instale com: npm install -g firebase-tools'
}

if (-not (Test-Path '.\.env')) {
  if (Test-Path '.\.env.example') {
    Copy-Item '.\.env.example' '.\.env'
    Write-Host '.env criado a partir de .env.example.' -ForegroundColor Yellow
  } else {
    throw '.env e .env.example nao encontrados.'
  }
}

Write-Host '1/4 - Instalando dependencias...' -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { throw 'Falha no npm install.' }

Write-Host '2/4 - Gerando build de producao...' -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Falha no build. Deploy cancelado.' }

if (-not (Test-Path '.\dist\index.html')) {
  throw 'dist\index.html nao encontrado. Deploy cancelado por seguranca.'
}

Write-Host '3/4 - Validando projeto Firebase...' -ForegroundColor Yellow
firebase use $ProjectId
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel selecionar o projeto Firebase.' }

Write-Host '4/4 - Publicando Firestore e Hosting...' -ForegroundColor Yellow
firebase deploy --only firestore:rules,firestore:indexes,hosting --project $ProjectId
if ($LASTEXITCODE -ne 0) { throw 'Falha no deploy Firebase.' }

Write-Host ''
Write-Host 'DEPLOY CONCLUIDO COM SUCESSO.' -ForegroundColor Green
Write-Host "Hosting esperado: https://$ProjectId.web.app" -ForegroundColor Green
Write-Host ''
Write-Host 'Observacao: Storage permanece fora deste deploy ate a ativacao do plano Blaze.' -ForegroundColor DarkYellow
