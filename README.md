# Passagem de serviço — versão Búzios (demonstração)

Conteúdo estático: `index.html` (página de entrada com chaves de teste), `app.html` (aplicativo), `deck.html` (apresentação técnica) e seus recursos.

## Como atualizar o GitHub
1. Descompacte este pacote.
2. No repositório `fabriciomartini/passagembuzios` (branch `main`), use **Add file → Upload files** e arraste TODO o conteúdo da pasta (arquivos e as pastas `assets`, `ds` e `screenshots`) para a raiz.
3. Confirme o commit. Em ~1 min o site é atualizado em https://fabriciomartini.github.io/passagembuzios/
4. Não há arquivos ocultos neste pacote. O arquivo do design system se chama `ds/industry/ds_bundle.js` (sem sublinhado), então o `.nojekyll` não é necessário. Os antigos `.nojekyll` e `ds/industry/_ds_bundle.js` que já estiverem no repositório podem ficar — não interferem.

Primeira publicação: Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.

## Chaves de teste
- Operador P-83: RTWC / 1234 · SUPROD P-83: M37R / 1234 · demais usuários da P-83: chave / 1234
- Multiunidade (todas as unidades): URPQ, F8CK, URSS / 1234
- Administrador local: ADM80 (P-80), ADM83 (P-83) / adm1234
- ADM do sistema: ADMIN / admin1234

## Base de dados compartilhada (Supabase)
`nuvem.js` sincroniza usuários, passagens, arquivo e parâmetros com o Supabase (carga ao abrir, envio ~1 s após cada alteração, atualização a cada 8 s, fila local quando offline). Criar a tabela uma única vez executando `supabase-buzios.sql` no SQL Editor.

## Novidades desta versão (out/2026)
- Barra lateral do formulário com rolagem própria.
- Conclusão do preenchimento por bloco nos blocos de lista aberta; edição posterior reabre o bloco.
- Poços e Disponibilidade importados da passagem anterior, com confirmação item a item ou por grupo (aviso de atenção na confirmação em bloco; item só confirma com status preenchido). Inclusão de sistemas restrita aos administradores; remoção retirada.
- Revisão assistida ligada por padrão e executada ao sair do campo.
- Passagem aberta acompanha as alterações dos demais membros; conclusões declaradas aparecem para todos.
- Cópia de segurança local do rascunho: recarregar ou fechar o navegador não perde o preenchimento.
- Meio ambiente: TOG ≤ 29,00 mg/L (CONAMA 393/2007) e temperatura < 40,00 °C (CONAMA 430/2011) classificados automaticamente; valor fora do limite confirmado pelo usuário vai compulsoriamente à passagem do SUPROD; campo livre.
- Integridade dos sistemas: resposta “Sim” abre alerta de comunicação imediata ao SUPROD e COPROD; o desvio validado vai compulsoriamente à passagem do SUPROD.
- Tipo de alteração com palavras-guia do HAZOP, texto livre e “Não aplicável”.
- Operadores de produção com acesso apenas ao próprio posto. Botão “Turma” sem seta.
- Deck técnico com 83 slides e todas as capturas refeitas, incluindo as janelas de alerta e diálogos (integridade, meio ambiente, confirmação em bloco, alerta aos postos, reporte, turma, revisão, declaração e sobrescrita).
