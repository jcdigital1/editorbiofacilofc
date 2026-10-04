/**
 * Script injected inside the sandboxed iframe to manage selection, hover outlines,
 * node-level text editing (preserving icons and children), and message passing.
 */
export function generatePreviewInjectionScript(mode: 'edit' | 'test'): string {
  return `
(function() {
  let currentMode = '${mode}';
  let selectedBioId = null;
  let hoveredEl = null;

  // Assign stable data-bio-id to all elements
  let counter = 1;
  function indexElements(root) {
    if (!root) return;
    if (!document.body.getAttribute('data-bio-id')) {
      document.body.setAttribute('data-bio-id', 'bio-body');
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    let node = walker.currentNode;
    while (node) {
      if (!node.getAttribute('data-bio-id')) {
        node.setAttribute('data-bio-id', 'bio-el-' + (counter++));
      }
      node = walker.nextNode();
    }
  }

  // Inject styles for inspector outline in bright neon yellow (#EFFF00)
  const styleEl = document.createElement('style');
  styleEl.id = 'bio-studio-editor-styles';
  styleEl.textContent = \`
    .bio-editor-hovered {
      outline: 1.5px dashed #EFFF00 !important;
      outline-offset: -1px !important;
      cursor: pointer !important;
    }
    .bio-editor-selected {
      outline: 2px solid #EFFF00 !important;
      outline-offset: -2px !important;
      box-shadow: 0 0 15px rgba(239, 255, 0, 0.45) !important;
    }
  \`;
  document.head.appendChild(styleEl);

  indexElements(document.body);

  // Extract direct text node content while preserving child icons/elements
  function getDirectTextNodeInfo(el) {
    let text = '';
    let targetNode = null;

    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i];
      if (child.nodeType === Node.TEXT_NODE && child.nodeValue && child.nodeValue.trim().length > 0) {
        text = child.nodeValue.trim();
        targetNode = child;
        break;
      }
    }

    if (!targetNode) {
      for (let i = 0; i < el.childNodes.length; i++) {
        if (el.childNodes[i].nodeType === Node.TEXT_NODE) {
          targetNode = el.childNodes[i];
          text = targetNode.nodeValue || '';
          break;
        }
      }
    }

    const childTags = [];
    for (let i = 0; i < el.children.length; i++) {
      childTags.push(el.children[i].tagName.toLowerCase());
    }

    return {
      text,
      hasTextNode: !!targetNode,
      childTags,
      hasChildElements: el.children.length > 0
    };
  }

  function getAncestors(el) {
    const list = [];
    let curr = el.parentElement;
    while (curr && curr.tagName !== 'HTML') {
      const id = curr.getAttribute('data-bio-id') || '';
      const tag = curr.tagName.toLowerCase();
      let preview = '';
      if (curr.id) preview += '#' + curr.id;
      else if (curr.className && typeof curr.className === 'string') {
        const firstClass = curr.className.split(' ')[0];
        if (firstClass) preview += '.' + firstClass;
      }
      list.push({ id, tagName: tag, preview: preview || tag });
      if (tag === 'body') break;
      curr = curr.parentElement;
    }
    return list;
  }

  function sendElementDetails(el) {
    if (!el || el === document.documentElement) return;

    const bioId = el.getAttribute('data-bio-id') || (el === document.body ? 'bio-body' : '');
    const tagName = el.tagName.toLowerCase();
    const textInfo = getDirectTextNodeInfo(el);
    const computed = window.getComputedStyle(el);
    const b = el.getBoundingClientRect();

    const attrs = {};
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      if (attr.name !== 'data-bio-id') {
        attrs[attr.name] = attr.value;
      }
    }

    const isLink = tagName === 'a' || !!el.closest('a');
    const linkEl = tagName === 'a' ? el : el.closest('a');
    const href = linkEl ? linkEl.getAttribute('href') || '' : '';
    const isWhatsApp = isLink && (
      href.includes('wa.me') ||
      href.includes('api.whatsapp.com') ||
      href.includes('wa.link') ||
      /whatsapp/i.test(el.textContent || '')
    );

    const payload = {
      bioId,
      tagName,
      textNodeContent: textInfo.text,
      fullTextContent: (el.textContent || '').trim(),
      hasChildElements: textInfo.hasChildElements,
      childTags: textInfo.childTags,
      attributes: attrs,
      styles: {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        fontWeight: computed.fontWeight,
        textAlign: computed.textAlign,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        margin: computed.margin,
        border: computed.border,
        display: computed.display,
        objectFit: computed.objectFit,
      },
      ancestors: getAncestors(el),
      rect: {
        top: Math.round(b.top),
        left: Math.round(b.left),
        width: Math.round(b.width),
        height: Math.round(b.height),
        bottom: Math.round(b.bottom),
        right: Math.round(b.right),
      },
      isLink,
      isButton: tagName === 'button' || el.getAttribute('role') === 'button' || el.classList.contains('btn') || isLink,
      isImage: tagName === 'img',
      isWhatsApp,
    };

    window.parent.postMessage({ type: 'BIO_ELEMENT_SELECTED', payload }, '*');
  }

  function clearOutlines() {
    document.querySelectorAll('.bio-editor-hovered').forEach(el => el.classList.remove('bio-editor-hovered'));
    document.querySelectorAll('.bio-editor-selected').forEach(el => el.classList.remove('bio-editor-selected'));
  }

  function selectElementById(id) {
    clearOutlines();
    if (!id) {
      selectedBioId = null;
      return;
    }
    const el = id === 'bio-body' ? document.body : document.querySelector('[data-bio-id="' + id + '"]');
    if (el) {
      selectedBioId = id;
      el.classList.add('bio-editor-selected');
      sendElementDetails(el);
      if (el !== document.body) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // Mouse event listeners
  document.addEventListener('mouseover', function(e) {
    if (currentMode !== 'edit') return;
    const target = e.target;
    if (!target || target === document.documentElement) return;
    if (target.classList.contains('bio-editor-selected')) return;

    if (hoveredEl && hoveredEl !== target) {
      hoveredEl.classList.remove('bio-editor-hovered');
    }
    hoveredEl = target;
    target.classList.add('bio-editor-hovered');
  }, true);

  document.addEventListener('mouseout', function(e) {
    if (currentMode !== 'edit') return;
    const target = e.target;
    if (target && target.classList.contains('bio-editor-hovered')) {
      target.classList.remove('bio-editor-hovered');
    }
  }, true);

  document.addEventListener('click', function(e) {
    if (currentMode === 'edit') {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      if (!target || target === document.documentElement) return;

      clearOutlines();
      selectedBioId = target.getAttribute('data-bio-id') || (target === document.body ? 'bio-body' : '');
      target.classList.add('bio-editor-selected');
      sendElementDetails(target);
    } else {
      // In Test Mode: allow normal interactions, prevent navigating away
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    }
  }, true);

  // Message handler from parent
  window.addEventListener('message', function(event) {
    const data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case 'BIO_SET_MODE':
        currentMode = data.mode;
        if (currentMode === 'test') {
          clearOutlines();
        } else if (selectedBioId) {
          selectElementById(selectedBioId);
        }
        break;

      case 'BIO_SELECT_ELEMENT':
        selectElementById(data.bioId);
        break;

      case 'BIO_SELECT_BODY':
        selectElementById('bio-body');
        break;

      case 'BIO_DESELECT':
        clearOutlines();
        selectedBioId = null;
        break;

      case 'BIO_SELECT_PARENT':
        if (selectedBioId) {
          const current = selectedBioId === 'bio-body' ? document.body : document.querySelector('[data-bio-id="' + selectedBioId + '"]');
          if (current && current.parentElement && current.parentElement !== document.documentElement) {
            selectElementById(current.parentElement.getAttribute('data-bio-id') || 'bio-body');
          }
        }
        break;

      case 'BIO_UPDATE_TEXT': {
        const el = data.bioId === 'bio-body' ? document.body : document.querySelector('[data-bio-id="' + data.bioId + '"]');
        if (!el) return;

        const newText = data.newText || '';
        let targetTextNode = null;
        for (let i = 0; i < el.childNodes.length; i++) {
          const child = el.childNodes[i];
          if (child.nodeType === Node.TEXT_NODE && child.nodeValue && child.nodeValue.trim().length > 0) {
            targetTextNode = child;
            break;
          }
        }

        if (targetTextNode) {
          targetTextNode.nodeValue = newText;
        } else {
          if (el.childNodes.length === 0) {
            el.textContent = newText;
          } else {
            const textNode = document.createTextNode(newText);
            el.appendChild(textNode);
          }
        }
        notifyHtmlChanged();
        break;
      }

      case 'BIO_UPDATE_ATTRIBUTE': {
        const el = data.bioId === 'bio-body' ? document.body : document.querySelector('[data-bio-id="' + data.bioId + '"]');
        if (!el) return;
        if (data.value === null || data.value === '') {
          el.removeAttribute(data.attribute);
        } else {
          el.setAttribute(data.attribute, data.value);
        }
        notifyHtmlChanged();
        break;
      }

      case 'BIO_UPDATE_STYLE': {
        const el = data.bioId === 'bio-body' ? document.body : document.querySelector('[data-bio-id="' + data.bioId + '"]');
        if (!el) return;
        el.style[data.property] = data.value;
        notifyHtmlChanged();
        break;
      }

      case 'BIO_REPLACE_COLOR_GLOBAL': {
        const oldColor = (data.oldColor || '').trim().toLowerCase();
        const newColor = (data.newColor || '').trim();
        if (!oldColor || !newColor) return;

        document.querySelectorAll('style').forEach(st => {
          if (st.id === 'bio-studio-editor-styles') return;
          const reg = new RegExp(oldColor, 'gi');
          st.textContent = st.textContent.replace(reg, newColor);
        });

        document.querySelectorAll('[style]').forEach(el => {
          const s = el.getAttribute('style') || '';
          const reg = new RegExp(oldColor, 'gi');
          if (reg.test(s)) {
            el.setAttribute('style', s.replace(reg, newColor));
          }
        });

        notifyHtmlChanged();
        break;
      }

      case 'BIO_DELETE_ELEMENT': {
        const el = document.querySelector('[data-bio-id="' + data.bioId + '"]');
        if (el && el.parentElement && el !== document.body) {
          el.parentElement.removeChild(el);
          clearOutlines();
          selectedBioId = null;
          notifyHtmlChanged();
        }
        break;
      }

      case 'BIO_DUPLICATE_ELEMENT': {
        const el = document.querySelector('[data-bio-id="' + data.bioId + '"]');
        if (el && el.parentElement && el !== document.body) {
          const clone = el.cloneNode(true);
          clone.removeAttribute('data-bio-id');
          clone.querySelectorAll('[data-bio-id]').forEach(c => c.removeAttribute('data-bio-id'));
          clone.classList.remove('bio-editor-selected', 'bio-editor-hovered');
          el.parentElement.insertBefore(clone, el.nextSibling);
          indexElements(clone);
          notifyHtmlChanged();
        }
        break;
      }
    }
  });

  function notifyHtmlChanged() {
    indexElements(document.body);
    const cleanHtml = getCleanDocumentHtml();
    window.parent.postMessage({ type: 'BIO_HTML_UPDATED', html: cleanHtml }, '*');
  }

  function getCleanDocumentHtml() {
    const clone = document.documentElement.cloneNode(true);
    const editorStyles = clone.querySelector('#bio-studio-editor-styles');
    if (editorStyles) editorStyles.remove();
    clone.querySelectorAll('.bio-editor-selected, .bio-editor-hovered').forEach(el => {
      el.classList.remove('bio-editor-selected', 'bio-editor-hovered');
      if (!el.getAttribute('class')) el.removeAttribute('class');
    });
    clone.querySelectorAll('[data-bio-id]').forEach(el => {
      el.removeAttribute('data-bio-id');
    });

    return '<!DOCTYPE html>\\n<html lang="' + (document.documentElement.lang || 'pt-BR') + '">\\n' + clone.innerHTML + '\\n</html>';
  }

  window.parent.postMessage({ type: 'BIO_PREVIEW_READY' }, '*');
})();
`;
}
