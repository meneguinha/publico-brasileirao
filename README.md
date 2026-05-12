# Preditor Brasileirão ⚽

Uma aplicação web full-stack movida a Machine Learning que estima o **público pagante** e a **renda bruta** de partidas do Campeonato Brasileiro Série A.

A arquitetura do projeto foi desenvolvida de forma moderna e totalmente desacoplada, utilizando **GitHub Pages** para o Frontend interativo e **Hugging Face Spaces** para hospedar a API de inteligência artificial.

---

## 🏗️ Arquitetura do Projeto

O projeto é dividido em dois ambientes independentes:

### 1. Frontend (Interface do Usuário)
- **Tecnologias:** HTML5 puro, CSS3 Vanilla e JavaScript.
- **Hospedagem:** [GitHub Pages](https://publicobrasileirao.fmind.app/)
- **Destaques Visuais:** Design responsivo, paleta de cores inspirada na CBF, cards de métricas com efeito tilt 3D interativo, animações de progresso e um sistema de partículas em Canvas para um visual premium.
- **Comunicação:** Faz requisições HTTP estritamente assíncronas (`fetch()`) para o backend.

### 2. Backend (API de Machine Learning)
- **Tecnologias:** Python 3.11, FastAPI, Uvicorn, Pandas e Scikit-learn.
- **Hospedagem:** [Hugging Face Spaces - Docker](https://fmenegottobr-preditor-brasileirao.hf.space/).
- **O Modelo:** Utiliza o algoritmo **Gradient Boosting Regressor**, treinado com o histórico de jogos do Brasileirão para entender o peso das variáveis como dia da semana, clássicos, horário e popularidade do time mandante.
- **Resiliência:** A API possui um mecanismo inteligente de fallback. Caso o modelo binário compilado (`.pkl`) não exista no container, a própria API carrega a planilha de dados (`consolidado_formatado.xlsx`), divide a amostragem para gerar métricas de confiabilidade, treina as árvores de decisão em tempo real e armazena o novo modelo.

---

## 🔌 API e Endpoints

A API está publicamente acessível e processa o modelo preditivo através dos seguintes endpoints principais:

* `GET /` — Verificação de saúde da API e status do carregamento do modelo.
* `GET /times` — Retorna os times mapeados no vocabulário do modelo.
* `GET /horarios` — Retorna as faixas de horários conhecidas.
* `GET /metricas` — Retorna os níveis de precisão (R² e MAE) calculados pela métrica _hold-out_ durante o treinamento do modelo.
* `POST /predict` — Recebe o payload do jogo (`mandante`, `visitante`, `dia_semana`, `hora`, `ano`) e retorna as estimativas calculadas pela IA, bem como comparações matemáticas com as médias históricas.

---

## 🚀 Como testar localmente

Se você deseja rodar a aplicação no seu computador:

1. **Backend:**
   Navegue até a pasta `backend-huggingface/` e execute:
   ```bash
   pip install -r requirements.txt
   uvicorn app:app --reload
   ```

2. **Frontend:**
   Navegue até a pasta `frontend-githubpages/` e inicie um servidor HTTP local:
   ```bash
   python -m http.server 8080
   ```
   Acesse no navegador: `http://localhost:8080`

*Observação: A URL base da API no frontend (`script.js`) deve ser ajustada para `http://localhost:8000` caso queira realizar requisições locais.*

---

## 📈 Entendendo a Performance

O modelo calcula duas métricas estatísticas essenciais exibidas no painel frontal:
- **R² (R-quadrado):** Mede o quão bem o modelo explica as variações de público e renda. Varia de 0 a 1; mais perto de 1 indica um modelo excelente.
- **MAE (Erro Médio Absoluto):** Expressa, na prática, a margem de erro estimada pelo sistema (ex: erro de +/- 2.500 pagantes por previsão).

---
*Projeto desenvolvido como ferramenta analítica baseada em dados históricos.*
