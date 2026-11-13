# Preditor Brasileirão ⚽

🌐 **Acesse:** [publicobrasileirao.felipemenegotto.com.br](https://publicobrasileirao.felipemenegotto.com.br/)

Aplicação web movida a Machine Learning que estima o **público pagante** de partidas do Campeonato Brasileiro Série A.

O projeto é desacoplado: o **frontend** fica no **GitHub Pages**, com domínio próprio, e a **API do modelo** roda no **Hugging Face Spaces**.

---

## 🏗️ Arquitetura do Projeto

### 1. Frontend (Interface do Usuário)
- **Tecnologias:** HTML5, CSS3 e JavaScript puros, sem frameworks.
- **Hospedagem:** GitHub Pages, no endereço [publicobrasileirao.felipemenegotto.com.br](https://publicobrasileirao.felipemenegotto.com.br/).
- **Destaques visuais:** design responsivo, paleta inspirada na CBF, cards com efeito tilt 3D, contadores animados e partículas em Canvas.
- **Comunicação:** requisições assíncronas (`fetch()`) para a API.

### 2. Backend (API de Machine Learning)
- **Tecnologias:** Python 3.11, FastAPI, Uvicorn, Pandas e CatBoost.
- **Hospedagem:** [Hugging Face Spaces (Docker)](https://fmenegottobr-preditor-brasileirao.hf.space/).
- **O modelo (v2):** média de dois modelos **CatBoost**, um treinado no logaritmo do público e outro no público direto. Foi treinado com 2.599 jogos do Brasileirão (2018, 2019 e 2022 a 2026).
- **Variáveis usadas:** mandante e visitante, estádio, data, horário, dia da semana, feriados, clássicos, rodada e situação dos dois times na tabela antes do jogo. A situação inclui posição, pontos, forma nos últimos jogos, distância para o líder, para o G-4/G-6 e para o Z-4, e chances matemáticas na reta final. Também entra o histórico de público e de preço médio do ingresso do mandante.
- **Sem dados manuais:** o usuário informa só o jogo. A API calcula tabela, forma e histórico a partir dos resultados e públicos já registrados, usando apenas jogos anteriores à data informada.

---

## 🔌 API e Endpoints

* `GET /`: saúde da API e informações do modelo (versão, nº de jogos de treino, anos).
* `GET /opcoes`: clubes, estádios e estádio padrão de cada clube, usados para montar os seletores do formulário.
* `GET /metricas`: erros medidos em temporadas que o modelo não viu no treino.
* `POST /prever`: recebe o jogo e devolve o público previsto e a faixa típica.

Exemplo de chamada:

```json
POST /prever
{
  "mandante": "Grêmio",
  "visitante": "Palmeiras",
  "data": "2026-11-15",
  "hora": "16:00",
  "estadio": "Arena do Grêmio",
  "rodada": 35
}
```

`mandante`, `visitante` e `data` (AAAA-MM-DD) são obrigatórios. `hora`, `estadio` e `rodada` são opcionais, mas sem o estádio a previsão fica bem menos precisa. Clube desconhecido, mandante igual ao visitante ou data inválida retornam **400**.

---

## 📈 Desempenho do Modelo

Medido em jogos que o modelo não tinha visto no treino: cada temporada foi prevista por um modelo treinado só com as anteriores. No total são 718 jogos (2025 e 2026).

| Métrica | Valor |
|---|---|
| Erro médio (MAE) | ~6.083 pagantes por jogo |
| Erro típico (erro % mediano) | 23,2% |
| R² | 0,72 |

- **Erro médio:** quantos pagantes a previsão erra, em média, por jogo.
- **Erro típico:** o erro percentual de um jogo comum. Metade dos jogos erra menos que isso. A **faixa típica** mostrada no site é a previsão ± esse percentual.
- **R²:** quanto da variação de público o modelo explica. Varia de 0 a 1; quanto mais perto de 1, melhor.

---

## 🚀 Como testar localmente

1. **Backend:** na pasta `backend-huggingface/`, execute:
   ```bash
   pip install -r requirements.txt -r modelo_v2/requirements.txt
   uvicorn app:app --reload
   ```

2. **Frontend:** na pasta `frontend-githubpages/`, inicie um servidor HTTP local:
   ```bash
   python -m http.server 8080
   ```
   Para usar a API local sem editar o código, acesse:
   `http://localhost:8080/?api=http://localhost:8000`

---

## ⚠️ Limitações

- A situação dos times na tabela vem dos resultados registrados nos dados da API, que vão até **06/11/2026**. Se os dados não forem atualizados, previsões de jogos posteriores usam essa tabela.
- Clubes que nunca jogaram a Série A entre 2018 e 2026 não são aceitos.
- O modelo prevê apenas o público pagante; a renda não é estimada.

---
*Projeto desenvolvido como ferramenta analítica baseada em dados históricos.*
