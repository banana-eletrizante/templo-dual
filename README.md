# Templo Dual

Jogo local para dois jogadores no mesmo aparelho, com seis eras de preparação e exploração. Vidas decidem o vencedor; relíquias desempatam.

## Desenvolvimento

HTML, CSS e JavaScript sem dependências de produção ou build. Sirva a raiz com `npx serve .`. A Vercel publica a raiz do repositório. Com Node.js 24, execute `npm test` e `npm run check`; ambos também rodam no GitHub Actions.

## Como jogar

As instruções estão em **Como jogar**. Pontos não utilizados são descartados. Sair do fosso custa um passo. Desabamentos preservam uma rota da entrada ao ídolo. Jogadores sem vidas precisam do rito para voltar a explorar. Use as setas, WASD, Tab e Enter ou toque nas casas destacadas. Animações respeitam movimento reduzido. Efeitos sonoros são opcionais e começam desligados.

## Offline

O service worker prepara o jogo, as fontes e as artes após a primeira visita online. A partida é salva automaticamente no armazenamento local deste navegador; **Continuar partida** restaura o progresso passando primeiro pela tela privada de troca de jogador. Limpar os dados do navegador apaga o progresso. Se o armazenamento estiver bloqueado, um aviso aparece e o jogo continua em memória. Não há conta, sincronização entre aparelhos nem multiplayer online.

O manifesto inclui ícones PNG de 192 e 512 pixels. A instalação depende do suporte do navegador a PWAs. Fontes Cinzel e Source Sans 3 são servidas localmente com suas licenças em `assets/`.

Incremente a versão do cache em `sw.js` ao alterar arquivos. A atualização aguarda as abas antigas fecharem antes de ativar.

## Estrutura

- `js/live.js`: regras, fluxo e telas do jogo.
- `js/presentation.js`: ícones, áudio e validação do salvamento.
- `css/premium.css`: direção visual, personagens e layouts responsivos.
- `assets/`: artes WebP otimizadas, fontes e ícones de instalação.
- `tests/`: regressões de regras e persistência, executadas com o test runner nativo do Node.

A direção de arte e os prompts de geração estão em `docs/ART_DIRECTION.md`.
