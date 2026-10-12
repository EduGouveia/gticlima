# GTI | Consulta Clima Brasil
Consulte o endereço pelo CEP e veja o clima atual e a previsão do tempo.

Projeto de estudo feito com HTML, CSS e JavaScript puro. Consulta um CEP pela AwesomeAPI e usa as coordenadas retornadas para solicitar as condições atuais e a previsão de cinco dias ao Open-Meteo.

## Recursos

- Consulta de CEP brasileiro.
- Exibição de endereço e cidade/UF.
- Clima atual: temperatura, sensação térmica, umidade, precipitação e vento.
- Previsão de cinco dias com temperaturas mínima/máxima e probabilidade de chuva.
- Tema claro/escuro, com preferência salva no navegador.
- Layout responsivo e mensagens de erro/carregamento.

## Executar localmente

1. Baixe ou clone este projeto.
2. Abra a pasta no VS Code.
3. Inicie um servidor local, por exemplo com a extensão Live Server.
4. Abra `index.html` pelo endereço local fornecido pelo servidor.
5. Digite um CEP brasileiro com oito números.

Abrir diretamente pelo sistema de arquivos pode funcionar em alguns navegadores, mas um servidor local é recomendado para desenvolvimento.

## APIs

- AwesomeAPI CEP: https://docs.awesomeapi.com.br/api-cep
- Open-Meteo Forecast: https://open-meteo.com/en/docs

As APIs são serviços externos e podem ter limites, indisponibilidade ou alterar suas condições de uso. A localização do CEP pode representar um trecho de rua ou uma região; o clima é estimado para as coordenadas retornadas.

## Publicar

Pode ser publicado como site estático no GitHub Pages, Netlify ou Vercel. Não há backend próprio neste projeto.

