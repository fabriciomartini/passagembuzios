# Passagem de serviço — versão Búzios (demonstração)

Conteúdo estático: `index.html` (página de entrada com chaves de teste), `app.html` (aplicativo), `deck.html` (apresentação) e seus recursos.

## Publicar no GitHub Pages
1. Envie TODOS os arquivos desta pasta para a raiz do repositório `fabriciomartini/passagembuzios` (branch `main`), inclusive `.nojekyll` e as pastas `ds`, `assets` (com os 3 vídeos .webm e `assets/fonts/` — fonte Petrobras Sans) e `screenshots`.
2. No GitHub: Settings → Pages → Source: *Deploy from a branch* → Branch `main` / `/(root)` → Save.
3. Em ~1 min o site estará em https://fabriciomartini.github.io/passagembuzios/

## Chaves de teste
- Operador P-83: RTWC / 1234 · SUPROD P-83: M37R / 1234
- Multiunidade (todas as unidades): URPQ, F8CK, URSS / 1234
- Administrador local: ADM80 (P-80), ADM83 (P-83) / adm1234
- ADM do sistema: ADMIN / admin1234

## Observações
- Cada testador vê apenas os dados do próprio navegador.
- Na primeira entrada em cada unidade são criadas passagens de exemplo; para caber no armazenamento do navegador, os exemplos automáticos de outras unidades são descartados ao trocar de unidade (dados reais permanecem).
- "Limpar dados da demonstração" (página de entrada) apaga só os dados `bz-` deste navegador.


## Base de dados compartilhada (Supabase)
`nuvem.js` sincroniza os dados (usuários, passagens, arquivo, parâmetros) com o Supabase: carga completa ao abrir, envio ~1 s após cada alteração, atualização a cada 8 s e fila local quando offline. Preferências de tela e a sessão continuam locais. Criar a tabela uma única vez executando `supabase-buzios.sql` no SQL Editor do projeto.
