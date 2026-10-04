export const SAMPLE_GASTRONOMIA_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bistrô & Café Aurora | Gastronomia Afetiva e Cafés Especiais</title>
  <meta name="description" content="Cafeteria artesanal, brunch contemporâneo e confeitaria de autor em ambiente aconchegante.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --cor-principal: #047857;
      --cor-principal-hover: #065f46;
      --cor-destaque: #fbbf24;
      --cor-fundo-site: #f8fafc;
      --cor-cartao: #ffffff;
      --cor-borda: #e2e8f0;
      --cor-texto-escuro: #0f172a;
      --cor-texto-suave: #64748b;
      --raio-suave: 20px;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--cor-fundo-site);
      color: var(--cor-texto-escuro);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 24px 16px 48px;
    }

    .main-wrap {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Top Brand Box */
    .brand-box {
      background: var(--cor-cartao);
      border: 1px solid var(--cor-borda);
      border-radius: var(--raio-suave);
      padding: 32px 20px;
      text-align: center;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }

    .brand-logo-container {
      width: 90px;
      height: 90px;
      margin: 0 auto 16px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(4, 120, 87, 0.15);
      border: 3px solid #ffffff;
    }

    .brand-logo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: var(--cor-texto-escuro);
      margin-bottom: 8px;
    }

    .brand-tagline {
      font-size: 14px;
      color: var(--cor-texto-suave);
      line-height: 1.5;
    }

    /* Principal WhatsApp CTA */
    .cta-whatsapp-reserva {
      background: var(--cor-principal);
      color: #ffffff;
      font-weight: 600;
      font-size: 15px;
      padding: 16px 20px;
      border-radius: var(--raio-suave);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      text-decoration: none;
      box-shadow: 0 10px 20px -5px rgba(4, 120, 87, 0.4);
      transition: all 0.2s ease;
    }

    .cta-whatsapp-reserva:hover {
      background: var(--cor-principal-hover);
      transform: translateY(-2px);
    }

    /* Destaques do Cardápio */
    .section-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--cor-texto-suave);
      margin-top: 6px;
    }

    .cardapio-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .prato-card {
      background: var(--cor-cartao);
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    }

    .prato-detalhes h4 {
      font-size: 15px;
      font-weight: 600;
      color: var(--cor-texto-escuro);
      margin-bottom: 3px;
    }

    .prato-detalhes p {
      font-size: 12px;
      color: var(--cor-texto-suave);
      line-height: 1.4;
    }

    .prato-valor {
      font-size: 15px;
      font-weight: 700;
      color: var(--cor-principal);
      white-space: nowrap;
    }

    /* Galeria Fotos */
    .galeria-box {
      border-radius: var(--raio-suave);
      overflow: hidden;
      border: 1px solid var(--cor-borda);
      background: #000;
      aspect-ratio: 16 / 9;
    }

    .galeria-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Redes Sociais Links */
    .menu-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .menu-link-btn {
      background: var(--cor-cartao);
      border: 1px solid var(--cor-borda);
      border-radius: 14px;
      padding: 14px 18px;
      color: var(--cor-texto-escuro);
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: background 0.2s, border-color 0.2s;
    }

    .menu-link-btn:hover {
      border-color: var(--cor-principal);
      background: #f1f5f9;
    }

    .footer-address {
      text-align: center;
      font-size: 12px;
      color: var(--cor-texto-suave);
      padding: 12px 0 24px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="main-wrap">
    <!-- Header Empresa -->
    <header class="brand-box">
      <div class="brand-logo-container">
        <img class="brand-logo" src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=240&h=240&fit=crop" alt="Logo Bistrô Aurora">
      </div>
      <h1 class="brand-title">Bistrô & Café Aurora</h1>
      <p class="brand-tagline">Cafés especiais torrados na casa, brunch artesanal e confeitaria francesa em um refúgio acolhedor.</p>
    </header>

    <!-- Botão WhatsApp Reserva -->
    <a class="cta-whatsapp-reserva" href="https://wa.me/5511998877665?text=Ol%C3%A1%21%20Gostaria%20de%20reservar%20uma%20mesa%20no%20Bistr%C3%B4%20Aurora.">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.031 2C6.51 2 2.02 6.49 2.02 12.01c0 1.98.58 3.86 1.68 5.46L2 22l4.67-1.63c1.55 1.01 3.37 1.55 5.36 1.55 5.52 0 10.01-4.49 10.01-10.01C22.04 6.49 17.55 2 12.031 2zm5.72 14.51c-.24.68-1.39 1.3-1.92 1.38-.49.08-1.12.11-3.23-.76-2.54-1.04-4.17-3.64-4.3-3.81-.13-.17-1.03-1.37-1.03-2.61 0-1.24.65-1.85.88-2.1.23-.25.5-.31.67-.31.17 0 .34 0 .49.01.16.01.37-.06.58.44.22.52.74 1.8.8 1.93.07.13.11.29.02.46-.09.18-.14.29-.28.45-.14.16-.3.35-.43.47-.14.14-.29.3-.12.59.16.29.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.28 1.4.29.14.46.12.63-.08.17-.2.73-.85.92-1.14.19-.29.39-.24.65-.15.26.09 1.67.79 1.96.93.29.14.48.21.55.33.07.12.07.7-.17 1.38z"/>
      </svg>
      <span>Reservar Mesa pelo WhatsApp</span>
    </a>

    <!-- Foto Destaque -->
    <div class="galeria-box">
      <img class="galeria-img" src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=350&fit=crop" alt="Ambiente do Café Aurora">
    </div>

    <!-- Destaques -->
    <div>
      <div class="section-label">Sugestões do Barista</div>
      <div class="cardapio-grid" style="margin-top: 8px;">
        <div class="prato-card">
          <div class="prato-detalhes">
            <h4>Café Filtrado V60 Origem Única</h4>
            <p>Grãos selecionados do Sul de Minas com notas florais e caramelo.</p>
          </div>
          <div class="prato-valor">R$ 16,00</div>
        </div>

        <div class="prato-card">
          <div class="prato-detalhes">
            <h4>Croissant Folhado Amêndoas</h4>
            <p>Manteiga francesa, creme frangipane e amêndoas tostadas.</p>
          </div>
          <div class="prato-valor">R$ 22,00</div>
        </div>

        <div class="prato-card">
          <div class="prato-detalhes">
            <h4>Toast Salmão & Avocado</h4>
            <p>Pão de fermentação natural, avocado amassado, salmão curado e ovo pochê.</p>
          </div>
          <div class="prato-valor">R$ 38,00</div>
        </div>
      </div>
    </div>

    <!-- Links Úteis -->
    <div class="menu-links">
      <a class="menu-link-btn" href="https://instagram.com/bistroaurora" target="_blank">
        <span>Siga no Instagram @bistroaurora</span>
        <span>→</span>
      </a>

      <a class="menu-link-btn" href="https://maps.google.com/?q=Alameda+Lorena+1200+Sao+Paulo" target="_blank">
        <span>Como Chegar (Google Maps)</span>
        <span>→</span>
      </a>
    </div>

    <!-- Rodapé -->
    <footer class="footer-address">
      <p>Alameda Lorena, 1200 - Jardins, São Paulo - SP</p>
      <p>Segunda a Domingo das 08h às 19h</p>
    </footer>
  </div>
</body>
</html>`;
