export const SAMPLE_BARBEARIA_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Barbearia Dom Pedro | Estilo Tradicional e Cortes Modernos</title>
  <meta name="description" content="Barbearia tradicional em São Paulo com cortes de cabelo, barba com toalha quente e bebidas artesanais.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --cor-primaria: #d97706;
      --cor-primaria-hover: #b45309;
      --cor-fundo: #09090b;
      --cor-superficie: #18181b;
      --cor-borda: #27272a;
      --cor-texto: #f4f4f5;
      --cor-texto-mutado: #a1a1aa;
      --raio-borda: 16px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--cor-fundo);
      color: var(--cor-texto);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px 48px;
    }

    .container {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Perfil / Header */
    .header-card {
      background: var(--cor-superficie);
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-borda);
      padding: 28px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    .avatar-wrapper {
      position: relative;
      width: 96px;
      height: 96px;
      margin-bottom: 16px;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--cor-primaria);
      box-shadow: 0 8px 24px rgba(217, 119, 6, 0.2);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #10b981;
      margin-bottom: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .titulo-principal {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
      color: var(--cor-texto);
    }

    .descricao {
      font-size: 14px;
      color: var(--cor-texto-mutado);
      line-height: 1.5;
      max-width: 380px;
    }

    /* Botão Principal WhatsApp */
    .btn-whatsapp-principal {
      background: #25d366;
      color: #052e16;
      font-weight: 700;
      font-size: 16px;
      padding: 16px 24px;
      border-radius: var(--raio-borda);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-decoration: none;
      box-shadow: 0 10px 25px rgba(37, 211, 102, 0.25);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-whatsapp-principal:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(37, 211, 102, 0.35);
    }

    /* Carrossel de Fotos */
    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--cor-texto-mutado);
      margin-bottom: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .carousel-container {
      position: relative;
      border-radius: var(--raio-borda);
      overflow: hidden;
      border: 1px solid var(--cor-borda);
      background: var(--cor-superficie);
      aspect-ratio: 16 / 9;
    }

    .carousel-slide {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.5s ease-in-out;
    }

    /* Grade de Serviços */
    .servicos-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .servico-card {
      background: var(--cor-superficie);
      border: 1px solid var(--cor-borda);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: border-color 0.2s;
    }

    .servico-card:hover {
      border-color: var(--cor-primaria);
    }

    .servico-info h4 {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .servico-info p {
      font-size: 12px;
      color: var(--cor-texto-mutado);
    }

    .servico-preco {
      font-size: 16px;
      font-weight: 700;
      color: var(--cor-primaria);
      white-space: nowrap;
    }

    /* Links Sociais e Informações */
    .links-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .link-item {
      background: var(--cor-superficie);
      border: 1px solid var(--cor-borda);
      border-radius: 12px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--cor-texto);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .link-item:hover {
      background: #27272a;
    }

    .link-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .info-footer {
      text-align: center;
      font-size: 12px;
      color: var(--cor-texto-mutado);
      padding: 16px 0;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header-card">
      <div class="avatar-wrapper">
        <img id="logo-img" class="avatar-img" src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop" alt="Logo Barbearia Dom Pedro">
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        <span id="status-texto">Aberto hoje até as 20h</span>
      </div>
      <h1 id="nome-empresa" class="titulo-principal">Barbearia Dom Pedro</h1>
      <p id="bio-texto" class="descricao">Tradição, estilo e cuidado masculino. Cortes clássicos, barba com toalha quente e atendimento com cerveja gelada.</p>
    </header>

    <!-- Botão WhatsApp Principal -->
    <a id="btn-agendamento" class="btn-whatsapp-principal" href="https://wa.me/5511987654321?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20um%20hor%C3%A1rio%20na%20Barbearia%20Dom%20Pedro">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 2C6.51 2 2.02 6.49 2.02 12.01c0 1.98.58 3.86 1.68 5.46L2 22l4.67-1.63c1.55 1.01 3.37 1.55 5.36 1.55 5.52 0 10.01-4.49 10.01-10.01C22.04 6.49 17.55 2 12.031 2zm5.72 14.51c-.24.68-1.39 1.3-1.92 1.38-.49.08-1.12.11-3.23-.76-2.54-1.04-4.17-3.64-4.3-3.81-.13-.17-1.03-1.37-1.03-2.61 0-1.24.65-1.85.88-2.1.23-.25.5-.31.67-.31.17 0 .34 0 .49.01.16.01.37-.06.58.44.22.52.74 1.8.8 1.93.07.13.11.29.02.46-.09.18-.14.29-.28.45-.14.16-.3.35-.43.47-.14.14-.29.3-.12.59.16.29.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.28 1.4.29.14.46.12.63-.08.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.15.26.09 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.7-.17 1.38z"/>
      </svg>
      <span>Agendar Horário no WhatsApp</span>
    </a>

    <!-- Galeria Carrossel -->
    <div class="galeria-secao">
      <div class="section-title">
        <span>Galeria do Espaço</span>
        <span style="font-size: 11px;">Arraste para ver</span>
      </div>
      <div class="carousel-container">
        <img id="carousel-img" class="carousel-slide" src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=350&fit=crop" alt="Espaço da Barbearia">
      </div>
    </div>

    <!-- Tabela de Serviços -->
    <div>
      <div class="section-title">Nossos Serviços</div>
      <div class="servicos-grid" id="lista-servicos">
        <div class="servico-card">
          <div class="servico-info">
            <h4>Corte de Cabelo Tradicional</h4>
            <p>Lavagem, corte degradê ou clássico e finalização.</p>
          </div>
          <div class="servico-preco">R$ 55,00</div>
        </div>

        <div class="servico-card">
          <div class="servico-info">
            <h4>Barba Terapia com Toalha Quente</h4>
            <p>Alinhamento de barba, óleos essenciais e toalha vaporizada.</p>
          </div>
          <div class="servico-preco">R$ 45,00</div>
        </div>

        <div class="servico-card">
          <div class="servico-info">
            <h4>Combo Completo (Cabelo + Barba)</h4>
            <p>Tratamento VIP completo com bebida de cortesia.</p>
          </div>
          <div class="servico-preco">R$ 90,00</div>
        </div>
      </div>
    </div>

    <!-- Redes e Localização -->
    <div class="links-grid">
      <a class="link-item" href="https://instagram.com/barbeariadompedro" target="_blank">
        <div class="link-left">
          <span>Instagram @barbeariadompedro</span>
        </div>
        <span>→</span>
      </a>

      <a class="link-item" href="https://maps.google.com/?q=Rua+Augusta+1420+Sao+Paulo" target="_blank">
        <div class="link-left">
          <span>Ver no Google Maps</span>
        </div>
        <span>→</span>
      </a>
    </div>

    <!-- Rodapé -->
    <footer class="info-footer">
      <p id="endereco-texto">Rua Augusta, 1420 - Consolação, São Paulo - SP</p>
      <p id="horario-texto">Terça a Sábado das 09h às 20h</p>
    </footer>
  </div>

  <script>
    // Objeto de Configuração Dinâmica para o Bio Site
    const CONFIGURACAO = {
      nome: "Barbearia Dom Pedro",
      slogan: "Cortes clássicos, navalha quente e cerveja artesanal",
      whatsapp: "5511987654321",
      instagram: "https://instagram.com/barbeariadompedro",
      endereco: "Rua Augusta, 1420 - Consolação, São Paulo - SP",
      horario: "Terça a Sábado das 09h às 20h",
      fotosCarrossel: [
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&h=350&fit=crop",
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=350&fit=crop",
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=350&fit=crop"
      ],
      servicos: [
        { nome: "Corte de Cabelo Tradicional", preco: "R$ 55,00", tempo: "40 min" },
        { nome: "Barba Terapia com Toalha Quente", preco: "R$ 45,00", tempo: "30 min" },
        { nome: "Combo Completo (Cabelo + Barba)", preco: "R$ 90,00", tempo: "1h 10min" }
      ]
    };

    // Auto-rotacionar carrossel
    (function initCarousel() {
      const img = document.getElementById('carousel-img');
      if (!img || !CONFIGURACAO.fotosCarrossel || !CONFIGURACAO.fotosCarrossel.length) return;
      let currentIndex = 0;
      setInterval(() => {
        currentIndex = (currentIndex + 1) % CONFIGURACAO.fotosCarrossel.length;
        img.src = CONFIGURACAO.fotosCarrossel[currentIndex];
      }, 3500);
    })();
  </script>
</body>
</html>`;
