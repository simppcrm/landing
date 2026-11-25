const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const modal = document.getElementById('trialModal');
const modalForm = document.getElementById('modalForm');
const modalSuccess = document.getElementById('modalSuccess');
const firstInput = document.getElementById('inputNome');
const promotionPopup = document.getElementById('promotionPopup');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 20), { passive: true });

menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.innerHTML = `<i class="ti ti-${open ? 'x' : 'menu-2'}"></i>`;
});

mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.innerHTML = '<i class="ti ti-menu-2"></i>';
}));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

function openModal() {
  closePromotion(false);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => firstInput.focus(), 250);
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-open-trial]').forEach((button) => button.addEventListener('click', openModal));
document.querySelector('[data-close-modal]').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
document.querySelectorAll('[data-close-modal-link]').forEach((link) => link.addEventListener('click', closeModal));

function closePromotion(persist = true) {
  if (!promotionPopup) return;
  promotionPopup.classList.remove('visible');
  promotionPopup.setAttribute('aria-hidden', 'true');
  if (persist) {
    try { sessionStorage.setItem('simpp-promotion-dismissed', 'true'); } catch (error) { /* armazenamento indisponível */ }
  }
}

if (promotionPopup) {
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('simpp-promotion-dismissed') === 'true'; } catch (error) { /* armazenamento indisponível */ }
  if (!dismissed) {
    setTimeout(() => {
      promotionPopup.classList.add('visible');
      promotionPopup.setAttribute('aria-hidden', 'false');
    }, 1400);
  }
  document.querySelector('[data-close-promotion]').addEventListener('click', () => closePromotion(true));
  document.querySelector('[data-promotion-trial]').addEventListener('click', () => {
    closePromotion(true);
    openModal();
  });
  document.querySelectorAll('[data-close-promotion-link]').forEach((link) => link.addEventListener('click', () => closePromotion(true)));
}

// ─── Black Week (25/11 a 01/12/2026) ─────────────────────────────────────
// Contagem regressiva em blocos (faixa do topo e pop-up). Se a página ficar
// aberta até o fim da campanha, sai do modo Black Week sozinha.
const bwAtiva = () => document.documentElement.classList.contains('bw');
function atualizarBlackWeek() {
  const restante = window.BLACK_WEEK_FIM - Date.now();
  if (restante <= 0) {
    document.documentElement.classList.remove('bw');
    return false;
  }
  const partes = [
    [Math.floor(restante / 86400000), 'dias'],
    [Math.floor((restante % 86400000) / 3600000), 'h'],
    [Math.floor((restante % 3600000) / 60000), 'min'],
    [Math.floor((restante % 60000) / 1000), 's'],
  ];
  const html = partes.map(([n, rotulo]) => `<span class="bw-unit"><b>${String(n).padStart(2, '0')}</b><small>${rotulo}</small></span>`).join('');
  document.querySelectorAll('[data-bw-timer]').forEach((el) => { el.innerHTML = html; });
  return true;
}
if (bwAtiva() && atualizarBlackWeek()) {
  const bwIntervalo = setInterval(() => { if (!atualizarBlackWeek()) clearInterval(bwIntervalo); }, 1000);
}

// Abre/fecha um overlay genérico (mesmo padrão do modal do teste grátis).
function abrirOverlay(el) {
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function fecharOverlay(el) {
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-overlay.open')) document.body.style.overflow = '';
}

// Pop-up central ao entrar no site, uma vez por visita.
const bwPopup = document.getElementById('bwPopup');
const bwMensalModal = document.getElementById('bwMensalModal');
const bwMensalForm = document.getElementById('bwMensalForm');
const bwMensalOk = document.getElementById('bwMensalOk');
const fecharBwPopup = () => { if (bwPopup) fecharOverlay(bwPopup); };

function abrirBwMensal() {
  fecharBwPopup();
  closeModal();
  bwMensalForm.style.display = '';
  bwMensalOk.style.display = 'none';
  document.getElementById('bwMensalErro').textContent = '';
  abrirOverlay(bwMensalModal);
  setTimeout(() => bwMensalForm.elements.nome.focus(), 250);
}

if (bwPopup && bwMensalModal) {
  const pedeMensal = new URLSearchParams(location.search).get('bw') === 'mensal';
  let popupVisto = false;
  try { popupVisto = sessionStorage.getItem('simpp-bw-popup-visto') === 'true'; } catch (error) { /* armazenamento indisponível */ }
  if (bwAtiva() && pedeMensal) {
    abrirBwMensal();
  } else if (bwAtiva() && !popupVisto) {
    setTimeout(() => {
      if (!document.querySelector('.modal-overlay.open')) abrirOverlay(bwPopup);
      try { sessionStorage.setItem('simpp-bw-popup-visto', 'true'); } catch (error) { /* armazenamento indisponível */ }
    }, 1200);
  }

  bwPopup.querySelector('[data-close-bw-popup]').addEventListener('click', fecharBwPopup);
  bwPopup.addEventListener('click', (event) => { if (event.target === bwPopup) fecharBwPopup(); });
  bwPopup.querySelector('.bw-pop-offer-main').addEventListener('click', fecharBwPopup);
  bwPopup.querySelector('[data-bw-popup-trial]').addEventListener('click', () => { fecharBwPopup(); openModal(); });
  document.querySelectorAll('[data-open-bw-mensal]').forEach((btn) => btn.addEventListener('click', abrirBwMensal));
  bwMensalModal.querySelectorAll('[data-close-bw-mensal]').forEach((btn) => btn.addEventListener('click', () => fecharOverlay(bwMensalModal)));
  bwMensalModal.addEventListener('click', (event) => { if (event.target === bwMensalModal) fecharOverlay(bwMensalModal); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (bwPopup.classList.contains('open')) fecharBwPopup();
    if (bwMensalModal.classList.contains('open')) fecharOverlay(bwMensalModal);
  });

  // Máscaras simples de CPF/CNPJ e telefone.
  const soDigitos = (v) => v.replace(/\D/g, '');
  bwMensalForm.elements.documento.addEventListener('input', (e) => {
    const d = soDigitos(e.target.value).slice(0, 14);
    e.target.value = d.length <= 11
      ? d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
      : d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  });
  bwMensalForm.elements.telefone.addEventListener('input', (e) => {
    const d = soDigitos(e.target.value).slice(0, 11);
    e.target.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3') : d.replace(/(\d{2})(\d{0,4})(\d{0,4})/, (m, a, b, c) => `(${a}) ${b}${c ? '-' + c : ''}`);
  });

  bwMensalForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const f = bwMensalForm.elements;
    const erro = document.getElementById('bwMensalErro');
    const botao = document.getElementById('bwMensalEnviar');
    erro.textContent = '';
    const dados = {
      nome: f.nome.value.trim(), documento: f.documento.value, telefone: f.telefone.value,
      email: f.email.value.trim(), endereco: f.endereco.value.trim(), site: f.site.value,
    };
    const doc = soDigitos(dados.documento);
    if (dados.nome.length < 3) return (erro.textContent = 'Informe o nome ou a razão social.');
    if (doc.length !== 11 && doc.length !== 14) return (erro.textContent = 'Informe um CPF ou CNPJ válido.');
    const tel = soDigitos(dados.telefone);
    if (tel.length < 10 || tel.length > 11) return (erro.textContent = 'Informe um telefone válido, com DDD.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dados.email)) return (erro.textContent = 'Informe um e-mail válido.');
    if (dados.endereco.length < 10) return (erro.textContent = 'Informe o endereço completo.');

    botao.disabled = true;
    const textoOriginal = botao.innerHTML;
    botao.textContent = 'Enviando...';
    try {
      // Falha de rede vira mensagem em português (o navegador devolve "Failed to fetch").
      const r = await fetch('https://crm.simpp.com.br/api/black-week-mensal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados),
      }).catch(() => { throw new Error('Não foi possível enviar agora.'); });
      const corpo = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(corpo.error || 'Não foi possível enviar agora.');
      if (typeof window.fbq !== 'undefined') window.fbq('track', 'Lead', { content_name: 'Black Week mensal' });
      bwMensalForm.style.display = 'none';
      bwMensalOk.style.display = 'block';
    } catch (e) {
      erro.innerHTML = `${e.message} Tente de novo ou <a href="https://wa.me/5511942688776?text=${encodeURIComponent('Olá! Quero o plano mensal da Black Week com 1º mês grátis.')}" target="_blank" rel="noopener">fale com a gente no WhatsApp</a>.`;
    } finally {
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
    }
  });
}

document.querySelectorAll('[data-checkout]').forEach((link) => {
  link.addEventListener('click', () => {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'InitiateCheckout', { currency: 'BRL', value: Number(link.dataset.checkoutValue) || 699.90, content_name: 'Simpp' });
    }
  });
});

document.querySelectorAll('.faq-list details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.faq-list details').forEach((other) => {
      if (other !== detail) other.removeAttribute('open');
    });
  });
});

let sb;
if (window.supabase) {
  const { createClient } = window.supabase;
  sb = createClient(
    'https://qqmfvpubrrdxakowpldv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbWZ2cHVicnJkeGFrb3dwbGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTczMjEsImV4cCI6MjA5NjMzMzMyMX0.XLh29w5Jsq-u27hYfiy_7dOMzm9Ifs9_glvWOoQP6G0'
  );
}

function showError(message) {
  document.getElementById('formErro').textContent = message;
}

async function sendWelcome(userData) {
  try {
    await fetch('https://qoptwkmnyrjatcamrfxd.supabase.co/functions/v1/pipeline-webhook/cd802cba469deea8123985ae35be0ad86867baa37ce1286b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'novo_cadastro',
        email: userData.email || '',
        nome: userData.nome || '',
        whatsapp: userData.whatsapp || '',
        colaboradores: userData.colaboradores || '',
        apolices: userData.apolices || '',
        created_at: new Date().toISOString()
      })
    });
  } catch (error) {
    console.warn('Não foi possível enviar a mensagem de boas-vindas.', error);
  }
}

modalForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nome = document.getElementById('inputNome').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const whatsapp = document.getElementById('inputWhatsapp').value.trim();
  const whatsappDigits = whatsapp.replace(/\D/g, '');
  const senha = document.getElementById('inputSenha').value;
  const colaboradores = document.getElementById('inputColaboradores').value;
  const apolices = document.getElementById('inputApolices').value;
  const button = document.getElementById('btnSubmit');
  const buttonText = document.getElementById('btnTxt');
  showError('');

  if (!nome) return showError('Informe seu nome.');
  if (!email || !email.includes('@')) return showError('Informe um e-mail válido.');
  if (whatsappDigits.length < 10 || whatsappDigits.length > 11) return showError('Informe um WhatsApp válido, com DDD.');
  if (senha.length < 6) return showError('A senha precisa ter pelo menos 6 caracteres.');
  if (!colaboradores) return showError('Informe o número de colaboradores.');
  if (!apolices) return showError('Informe o número de apólices na carteira.');
  if (!sb) return showError('Não foi possível conectar. Atualize a página e tente novamente.');

  button.disabled = true;
  buttonText.textContent = 'Criando sua conta...';

  const { error } = await sb.auth.signUp({
    email,
    password: senha,
    options: {
      emailRedirectTo: 'https://crm.simpp.com.br/login.html',
      data: { full_name: nome, whatsapp, colaboradores, apolices }
    }
  });

  if (error) {
    button.disabled = false;
    buttonText.textContent = 'Criar conta e testar grátis';
    showError(error.message.includes('already registered') ? 'Este e-mail já está cadastrado. Acesse o Simpp para entrar.' : 'Não foi possível criar sua conta. Tente novamente.');
    return;
  }

  await sb.auth.signOut();
  await sendWelcome({ email, nome, whatsapp, colaboradores, apolices });

  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'Lead');
    window.fbq('track', 'StartTrial', { currency: 'BRL', value: 0, content_name: 'Trial Simpp' });
  }

  document.getElementById('emailConfirm').textContent = email;
  modalForm.style.display = 'none';
  modalSuccess.style.display = 'block';
});
