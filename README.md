# Passagem de serviço — versão Búzios (demonstração)

Conteúdo estático: `index.html` (página de entrada com chaves de teste), `app.html` (aplicativo), `deck.html` (apresentação) e seus recursos.

## Publicar no GitHub Pages
1. Envie TODOS os arquivos desta pasta para a raiz do repositório `fabriciomartini/passagembuzios` (branch `main`), inclusive as pastas `ds`, `assets` (com os 3 vídeos .webm e `assets/fonts/` — fonte Petrobras Sans) e `screenshots`.
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


## Atualização — estrutura completa de postos (out/2026)
- 20 postos em 4 coordenações (Gerência, Produção, Manutenção, Embarcação) com regras de acesso por nível (GEOP, GEPLAT, coordenação, supervisão, executante, engenheiros de base).
- Modelos do PE-3BUZ-00130: Anexo A-1 (GEPLAT, coordenadores, TLT) e Anexo C-1 (manutenção, com turno facultativo e “Turno sem ocorrências”).
- Botão “Turma” para levar itens da passagem de turno à passagem de turma do posto.
- Controle Embarcação e Convés: passagem separada ou única.
- Admin → Perfis e postos: criação de perfis adicionais (fiscais, MIED, EEE).
- Cadastro de 183 usuários da P-83 (senha de teste 1234).
- Embarcação: formulário da produção sem poços; TLT só turma (Anexo A-1).
- Deck técnico atualizado (67 slides): estrutura, regras de acesso, modelos, envio à turma, turno sem ocorrências, passagem única e perfis.


## Atualização — validação e confirmações (out/2026)
- Barra lateral do formulário com rolagem própria.
- “Concluir preenchimento do bloco” nos blocos de lista aberta; qualquer edição posterior reabre o bloco.
- Poços e Disponibilidade importados da passagem anterior com confirmação item a item ou por grupo (com aviso de atenção na confirmação em bloco). Inclusão de sistemas restrita aos administradores; remoção retirada.
- Revisão assistida ligada por padrão e executada automaticamente ao sair do campo.
- Passagem aberta acompanha as alterações dos demais membros (conclusões declaradas aparecem para todos).
- Cópia de segurança local do rascunho: recarregar ou fechar o navegador não perde o preenchimento.
- Meio ambiente: TOG ≤ 29,00 mg/L (CONAMA 393/2007) e temperatura < 40,00 °C (CONAMA 430/2011) classificados automaticamente, alerta de notificação ao SUPROD/COPROD ou SUEMB/COEMB e campo livre.
- Tipo de alteração com palavras-guia do HAZOP, texto livre e “Não aplicável”.
- Deck técnico atualizado (75 slides, capturas de tela refeitas): conclusão por bloco, confirmação dos dados herdados, meio ambiente, tipos de alteração HAZOP, edição simultânea e rascunho protegido.
- Operadores de produção com acesso apenas ao próprio posto (planilha Equipe P-83). Botão “Turma” sem seta.

Obs.: o arquivo do design system foi renomeado para `ds/industry/ds_bundle.js` (sem sublinhado), dispensando o arquivo oculto `.nojekyll`. O antigo `ds/industry/_ds_bundle.js` e o `.nojekyll` que já estão no repositório podem permanecer — não interferem.
