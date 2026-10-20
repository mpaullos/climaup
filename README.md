<div align="center">
  
# 🌤️ ClimaUp
O clima na medida certa.

**Simples · Moderno · Intuitivo**

</div>

<img width="1598" height="754" alt="image" src="https://github.com/user-attachments/assets/4ccc712a-997c-48b0-b31f-daa19c3db4b9" />


Aplicação web moderna para consultar as condições climáticas atuais e a previsão dos próximos dias em diferentes cidades. O projeto combina dados em tempo real do [OpenWeatherMap](https://openweathermap.org/) com uma interface responsiva, temas visuais que acompanham o clima e uma experiência de busca simples.

## 👋 Sobre

O **ClimaUp** mostra informações meteorológicas de forma clara e visual. É possível:

- Pesquisar cidades com sugestões e geolocalização;
- Consultar temperatura, sensação térmica, umidade, pressão, vento, visibilidade e índice UV;
- Visualizar a previsão consolidada para os próximos cinco dias;
- Alternar entre graus Celsius e Fahrenheit;
- Salvar cidades favoritas no navegador;
- Atualizar os dados manualmente;
- Usar a localização atual, quando o navegador permitir;
- Visualizar fundos e ícones que mudam de acordo com a condição climática.

Sem uma chave configurada, a aplicação inicia com dados demonstrativos de algumas cidades. Para consultar dados ao vivo, configure a chave do OpenWeatherMap [conforme as instruções abaixo](#como-obter-a-api).

## 📸 Imagens do projeto

### 💻 Aplicação Web

<p align="center">
  <img src="https://github.com/user-attachments/assets/1ee66edd-7821-479a-b604-e54fa788d4c9" width="48%" alt="Tela Web 1" />
  <img src="https://github.com/user-attachments/assets/bbed0aca-4bbc-471d-89d8-6b82fde250e6" width="48%" alt="Tela Web 2" />
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/bfe18d37-05f7-4e5d-94c8-37b2a477598c" width="48%" alt="Tela Web 3" />
  <img src="https://github.com/user-attachments/assets/9323a795-2016-4e6f-b453-cb773f02989e" width="48%" alt="Tela Web 4" />
</p>

### 📱 Aplicação Mobile

<p align="center">
  <img src="https://github.com/user-attachments/assets/f3af4991-a759-4b05-b568-40a4af74234e" width="23%" alt="Tela Mobile 1" />
  <img src="https://github.com/user-attachments/assets/1363b8dc-706f-4cf8-8b16-3a7e99eb342a" width="23%" alt="Tela Mobile 2" />
  <img src="https://github.com/user-attachments/assets/292fe05f-c513-4359-ae3b-7150373a2736" width="23%" alt="Tela Mobile 3" />
  <img src="https://github.com/user-attachments/assets/8676bdef-c58f-4c56-ba07-580094988e3a" width="23%" alt="Tela Mobile 4" />
</p>

<a id="como-obter-a-api"></a>

## 🔑 Como obter a API do OpenWeatherMap

1. Acesse [openweathermap.org/api](https://openweathermap.org/api).
2. Crie uma conta ou entre na sua conta existente.
3. Gere uma chave de API na área **My API keys**.
4. Copie a chave para configurar o projeto localmente.

> A chave é usada pelo servidor para consultar os endpoints de clima, previsão e geocodificação. Não publique sua chave em commits ou em repositórios públicos.

## 🚀 Como rodar o projeto

### 🧰 Pré-requisitos

- Node.js 20 ou superior;
- npm;
- Uma chave do OpenWeatherMap para dados em tempo real.

### 📦 Instalação

Clone o repositório, entre na pasta do projeto e instale as dependências:

```bash
git clone https://github.com/mpaullos/climaup.git
cd climaup
npm install
```

### 🔐 Configuração da chave

O projeto inclui o arquivo [`.env.example`](./.env.example) como modelo. Faça uma cópia dele para criar o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Depois, abra o arquivo `.env` e substitua o valor de exemplo pela sua chave:

```env
OPENWEATHER_API_KEY="SUA_CHAVE_OPENWEATHERMAP"
```

Também é possível informar a chave pelo aviso exibido na interface quando ela não estiver configurada no servidor. Nesse caso, a chave será armazenada no `localStorage` do navegador.

### 🛠️ Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### 📦 Build de produção

Gere os arquivos otimizados:

```bash
npm run build
```

Depois, execute o servidor em modo de produção:

```bash
NODE_ENV=production npm start
```

Por padrão, a aplicação usa a porta `3000`. Para escolher outra porta, defina a variável `PORT`:

```bash
PORT=8080 NODE_ENV=production npm start
```

### ✅ Verificação de tipos

Para executar a verificação TypeScript:

```bash
npm run lint
```

## 🧱 Tecnologias utilizadas

- **React 19** — construção da interface;
- **TypeScript** — tipagem e segurança durante o desenvolvimento;
- **Vite** — desenvolvimento e build do frontend;
- **Express** — servidor local e camada de API;
- **Tailwind CSS 4** — estilos e layout responsivo;
- **Lucide React** — ícones da interface;
- **Motion** — animações e transições;
- **OpenWeatherMap API** — clima atual, previsão e geocodificação;
- **dotenv** — carregamento das variáveis de ambiente.

## 🔌 Endpoints utilizados

O servidor disponibiliza internamente:

- `GET /api/weather` — condições atuais;
- `GET /api/forecast` — previsão para os próximos cinco dias;
- `GET /api/geo` — busca e geocodificação de cidades;
- `GET /api/config` — verifica se existe uma chave configurada no servidor;
- `GET /api/health` — verifica o status do servidor.
