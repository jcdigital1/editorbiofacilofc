import JSZip from 'jszip';

/**
 * Strips any editor artifacts (data-bio-id, injected styles/scripts) from HTML.
 */
export function cleanHtmlForExport(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove editor-specific script and style tags
  doc.querySelectorAll('#bio-studio-editor-styles, #bio-studio-preview-script').forEach(el => el.remove());

  // Remove data-bio-id
  doc.querySelectorAll('[data-bio-id]').forEach(el => {
    el.removeAttribute('data-bio-id');
  });

  // Remove editor classes
  doc.querySelectorAll('.bio-editor-selected, .bio-editor-hovered').forEach(el => {
    el.classList.remove('bio-editor-selected', 'bio-editor-hovered');
    if (!el.getAttribute('class')) {
      el.removeAttribute('class');
    }
  });

  return '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';
}

/**
 * Triggers a direct browser file download for a string or blob
 */
export function downloadFile(content: Blob | string, filename: string, mimeType = 'text/html;charset=utf-8') {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Generates and downloads the standalone index.html file
 */
export function exportSingleHtml(html: string, projectName: string) {
  const cleaned = cleanHtmlForExport(html);
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-') || 'bio-site';
  downloadFile(cleaned, `${safeName}.html`);
}

/**
 * Generates and downloads a complete ZIP package with index.html, /assets folder, and README.md
 */
export async function exportZipPackage(html: string, projectName: string): Promise<{ assetCount: number }> {
  const zip = new JSZip();
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-') || 'bio-site';

  const cleaned = cleanHtmlForExport(html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');

  // Find all base64 data URLs in images and inline styles to extract into /assets folder
  const assetsFolder = zip.folder('assets');
  let assetCount = 0;

  const images = Array.from(doc.querySelectorAll('img'));
  images.forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:image/')) {
      assetCount++;
      const match = src.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        let ext = match[1].toLowerCase();
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';

        const base64Data = match[2];
        const filename = `imagem-${assetCount}.${ext}`;

        // Add binary to assets
        assetsFolder?.file(filename, base64Data, { base64: true });

        // Update image src to relative path
        img.setAttribute('src', `./assets/${filename}`);
      }
    }
  });

  // Extract favicon if data URL
  const favicon = doc.querySelector('link[rel="icon"]');
  const favSrc = favicon?.getAttribute('href') || '';
  if (favSrc.startsWith('data:image/')) {
    const match = favSrc.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match) {
      assetCount++;
      const ext = match[1].toLowerCase() === 'x-icon' ? 'ico' : match[1].toLowerCase();
      const filename = `favicon.${ext}`;
      assetsFolder?.file(filename, match[2], { base64: true });
      favicon?.setAttribute('href', `./assets/${filename}`);
    }
  }

  // Readme for hosting
  const readmeContent = `# ${projectName || 'Bio Site'}

Parabéns! Seu bio site foi exportado com sucesso através do **Bio Studio Editor**.

## Estrutura do Pacote
- \`index.html\`: Página principal completa com todos os estilos, interações e metadados.
- \`assets/\`: Imagens e ícones locais otimizados.

## Como hospedar gratuitamente

### Opção 1: Vercel (Recomendado)
1. Acesse [vercel.com](https://vercel.com) e crie uma conta gratuita.
2. Arraste e solte esta pasta descompactada diretamente no painel da Vercel.
3. Seu site estará online em segundos com HTTPS gratuito e carregamento ultra-rápido!

### Opção 2: Netlify Drop
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arraste esta pasta para a área indicada.
3. Seu site receberá um link público instantaneamente.

### Opção 3: GitHub Pages
1. Crie um repositório no GitHub.
2. Envie os arquivos (\`index.html\` e a pasta \`assets\`).
3. Em **Settings > Pages**, selecione a branch \`main\` e salve.

---
Gerado por **Bio Studio Editor**
`;

  const finalHtml = '<!DOCTYPE html>\n<html lang="' + (doc.documentElement.lang || 'pt-BR') + '">\n' + doc.documentElement.innerHTML + '\n</html>';

  zip.file('index.html', finalHtml);
  zip.file('README.md', readmeContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadFile(zipBlob, `${safeName}-pronto.zip`, 'application/zip');

  return { assetCount };
}
