# Gera um .zip da skill "lp" para passar a alguém sem GitHub.
#
# Uso (no PowerShell, a partir da raiz do repositório):
#   pwsh ferramentas/empacotar.ps1                       só a skill
#   pwsh ferramentas/empacotar.ps1 -ComPerfil -Nome jean  skill + o seu perfil (sem o registro de clientes)
#   pwsh ferramentas/empacotar.ps1 -Saida C:\pasta        muda onde o .zip é salvo (padrão: Área de Trabalho)
#
# O .zip traz:
#   LEIA-ME.txt        passo a passo para instalar
#   skill/             marketplace + plugin, instalável com /plugin install lp --marketplace <pasta skill>
#   perfil-<nome>.md   (opcional) o seu perfil no formato de importação do /lp:perfil

param(
  [switch]$ComPerfil,
  [string]$Nome = 'meu',
  [string]$Saida = [Environment]::GetFolderPath('Desktop')
)
$ErrorActionPreference = 'Stop'

$repo = Split-Path $PSScriptRoot -Parent
$versao = (Get-Content "$repo\plugins\landing-page\.claude-plugin\plugin.json" -Raw | ConvertFrom-Json).version
$pacote = "lp-skill-$versao"
$tmp = Join-Path ([IO.Path]::GetTempPath()) "$pacote-$(Get-Random)"
$base = Join-Path $tmp $pacote

New-Item -ItemType Directory -Force "$base\skill\.claude-plugin", "$base\skill\plugins" | Out-Null
Copy-Item "$repo\.claude-plugin\marketplace.json" "$base\skill\.claude-plugin\"
Copy-Item "$repo\plugins\landing-page" "$base\skill\plugins\landing-page" -Recurse

$perfilLinha = ''
if ($ComPerfil) {
  $dir = Join-Path $HOME '.claude\landing-page'
  foreach ($f in 'preferencias.md', 'referencias.md') {
    if (-not (Test-Path "$dir\$f")) { throw "Perfil incompleto: falta $dir\$f" }
  }
  $perfil = @"
# Perfil da skill landing-page: $Nome

Para usar: instale a skill (veja o LEIA-ME.txt) e digite /lp:perfil importar <caminho deste arquivo>.
O perfil importado vira uma cópia sua: mude à vontade.

<!-- lp:arquivo preferencias.md -->
$(Get-Content "$dir\preferencias.md" -Raw)
<!-- lp:arquivo referencias.md -->
$(Get-Content "$dir\referencias.md" -Raw)
"@
  Set-Content -Encoding utf8 "$base\perfil-$Nome.md" $perfil
  $perfilLinha = @"

PERFIL DE QUEM TE MANDOU (opcional)
Este pacote traz o arquivo perfil-$Nome.md, com o gosto de quem te mandou
(preferências e referências; o registro de clientes não vem junto).
- Para usar como ponto de partida:  /lp:perfil importar <caminho do perfil-$Nome.md>
- Para montar o seu do zero:        /lp:perfil
O perfil importado é uma cópia sua: dá para mudar tudo ao seu gosto.
"@
}

$leiame = @"
SKILL "lp" PARA O CLAUDE CODE
Landing pages que não parecem feitas por IA, para clientes de freela e negócios locais.
Versão $versao

COMO INSTALAR (uma vez só)
1. Descompacte este .zip numa pasta que você não vá apagar, por exemplo em Documentos.
2. Abra o Claude Code e digite o comando abaixo, trocando o caminho pelo da pasta "skill"
   que está aqui dentro (dica: arraste a pasta "skill" para a janela para colar o caminho):

   /plugin install lp --marketplace C:\Users\SEU-USUARIO\Documents\$pacote\skill

3. Reinicie o Claude Code e digite:  /lp:inicio
   O Claude mostra o passo a passo e pergunta por onde você quer começar.
$perfilLinha
PRECISA TER
- Claude Code
- Node 22 ou mais novo e Chrome ou Edge (usados para tirar os prints de revisão)

QUANDO CHEGAR UMA VERSÃO NOVA (outro .zip)
1. Descompacte por cima da mesma pasta.
2. No terminal:
   claude plugin marketplace update claude-skills
   claude plugin update lp@claude-skills
3. Reinicie o Claude Code.
"@
Set-Content -Encoding utf8 "$base\LEIA-ME.txt" $leiame

New-Item -ItemType Directory -Force $Saida | Out-Null
$zip = Join-Path $Saida "$pacote.zip"
Compress-Archive -Path $base -DestinationPath $zip -Force
Remove-Item $tmp -Recurse -Force
"Pacote criado: $zip"
