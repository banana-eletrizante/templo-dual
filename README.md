# Templo Dual

Jogo local para dois jogadores no mesmo aparelho, com seis eras de preparação e exploração. Vidas decidem o vencedor; relíquias desempatam.

## Desenvolvimento

HTML, CSS e JavaScript sem dependências de produção ou build. Sirva a raiz com `npx serve .`. A Vercel publica a raiz do repositório. Com Node.js 24, execute `npm test` e `npm run check`; ambos também rodam no GitHub Actions.

## Como jogar

As instruções estão em **Como se joga**. Pontos não utilizados são descartados. Sair do fosso custa um passo. Desabamentos preservam uma rota da entrada ao ídolo. Jogadores sem vidas precisam do rito para voltar a explorar. Use Tab e Enter ou toque nas casas destacadas. Animações respeitam movimento reduzido.

## Offline

O service worker prepara os arquivos após a primeira visita online. A partida fica apenas na memória: recarregar reinicia o jogo. Fontes externas têm alternativas locais. A instalação depende do suporte do navegador ao manifesto e ao ícone SVG.

Incremente a versão do cache em `sw.js` ao alterar arquivos. A atualização aguarda as abas antigas fecharem antes de ativar.
