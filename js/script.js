/**
 * Simulador de Compostagem - Concurso Agrinho 2026
 * Categoria: Programação | Subcategoria 3: Ensino Médio
 * Tecnologias: HTML5, CSS3, JavaScript (ES6+)
 * Autor - Kauan Maciel Mariano - 1º ano A - CEEP Olegário Macedo - Castro - PR
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // CONFIGURAÇÕES E PARÂMETROS CIENTÍFICOS
  // ==========================================
  const CONFIG_SIMULACAO = {
    tempoBase: {
      domestica: 90,  // Dias para compostagem em baldes/vermicompostagem
      rotativa: 60,   // Dias para barril rotativo acelerado
      leiras: 120     // Dias para leiras tradicionais ao ar livre
    },
    ajusteFrequencia: {
      semanal: 1.0,
      quinzenal: 1.2,
      mensal: 1.5
    },
    fatoresImpacto: {
      conversaoComposto: 0.65, // 65% da massa vira adubo rico em nutrientes
      co2EvitadoPorKg: 0.04,   // 0.04 kg de CO2 evitado por kg de resíduo desviado do aterro
      aguaRetidaPorKg: 0.8     // 0.8L de retenção hídrica agregada ao solo por kg ao ano
    }
  };

  // ==========================================
  // SELEÇÃO DE ELEMENTOS DO DOM
  // ==========================================
  const btnTema = document.getElementById('btn-tema');
  const temaTexto = document.getElementById('tema-texto');
  const btnProximo = document.querySelector('.btn.proximo');
  const botoesVoltar = document.querySelectorAll('.btn.voltar');
  const btnCalcular = document.querySelector('.btn.calcular');
  const btnResetar = document.querySelector('.btn.resetar');
  const barra = document.getElementById('barra-progresso');
  const indicadores = document.querySelectorAll('.etapas-indicador li');
  const etapas = document.querySelectorAll('.etapa');
  
  // Resultados
  const resTempo = document.getElementById('res-tempo');
  const resComposto = document.getElementById('res-composto');
  const resAgua = document.getElementById('res-agua');
  const resCo2 = document.getElementById('res-co2');
  const msgTema = document.getElementById('msg-tema');

  // Elementos do Modal de Ajuda
  const btnAjuda = document.getElementById('btn-ajuda');
  const modalTutorial = document.getElementById('modal-tutorial');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnComecar = document.getElementById('btn-comecar');
  
  // ==========================================
  // ESTADO DA APLICAÇÃO
  // ==========================================
  const estado = {
    etapaAtual: 1,
    totalEtapas: 3,
    dados: {
      tipo: '',
      qtd: 0,
      modelo: '',
      freq: ''
    }
  };
  
  // ==========================================
  // INICIALIZAÇÃO E TIMEOUT CORRIGIDO
  // ==========================================
  configurarModoEscuro();
  atualizarUI();
  
  const jaViuTutorial = localStorage.getItem('tutorial-visto');
  if (!jaViuTutorial) {
    setTimeout(() => {
      modalTutorial.classList.add('ativo');
    }, 1500); // Ajuda inicial 1.5 segundos
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================
  btnProximo.addEventListener('click', avancarEtapa);
  btnCalcular.addEventListener('click', processarSimulacao);
  btnResetar.addEventListener('click', resetarSimulacao);
  btnTema.addEventListener('click', alternarModoEscuro);
  
  botoesVoltar.forEach(btn => {
    btn.addEventListener('click', voltarEtapa);
  });

  if(btnAjuda) btnAjuda.addEventListener('click', () => {
    modalTutorial.classList.add('ativo');
  });
  
  if(btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
  if(btnComecar) {
    btnComecar.addEventListener('click', () => {
      localStorage.setItem('tutorial-visto', 'true');
      fecharModal();
    });
  }

  if(modalTutorial) {
    modalTutorial.addEventListener('click', (e) => {
      if (e.target === modalTutorial) fecharModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalTutorial.classList.contains('ativo')) fecharModal();
  });

  // ==========================================
  // FUNÇÕES CORE
  // ==========================================
  function fecharModal() {
    modalTutorial.classList.remove('ativo');
  }

  function avancarEtapa() {
    if (!validarCampos(estado.etapaAtual)) return;
    salvarDadosParciais();
    
    if (estado.etapaAtual < estado.totalEtapas) {
      estado.etapaAtual++;
      atualizarUI();
    }
  }
  
  function voltarEtapa() {
    if (estado.etapaAtual > 1) {
      estado.etapaAtual--;
      atualizarUI();
    }
  }
  
  function atualizarUI() {
    etapas.forEach(el => el.classList.remove('ativa'));
    const etapaAlvo = document.getElementById(`etapa-${estado.etapaAtual}`);
    if (etapaAlvo) etapaAlvo.classList.add('ativa');
    
    const progresso = (estado.etapaAtual / estado.totalEtapas) * 100;
    if (barra) barra.style.width = `${progresso}%`;
    
    indicadores.forEach((ind, i) => {
      ind.classList.toggle('ativa', i + 1 === estado.etapaAtual);
    });
  }
  
  function validarCampos(etapa) {
    if (etapa === 1) {
      const tipo = document.getElementById('tipo-residuo').value;
      const qtd = document.getElementById('quantidade').value;
      
      if (!tipo || !qtd) {
        alert('⚠️ Por favor, preencha todos os campos para continuar.');
        return false;
      }
      return true;
    }
    return true;
  }
  
  function salvarDadosParciais() {
    if (estado.etapaAtual === 1) {
      estado.dados.tipo = document.getElementById('tipo-residuo').value;
      estado.dados.qtd = parseFloat(document.getElementById('quantidade').value);
    } else if (estado.etapaAtual === 2) {
      estado.dados.modelo = document.getElementById('tipo-composteira').value;
      estado.dados.freq = document.getElementById('frequencia').value;
    }
  }
  
  function processarSimulacao() {
    salvarDadosParciais();
    const { qtd, modelo, freq } = estado.dados;
    
    // Processamento estruturado usando os parâmetros de Clean Code configurados
    const tempoBase = CONFIG_SIMULACAO.tempoBase[modelo] || 120;
    const freqAjuste = CONFIG_SIMULACAO.ajusteFrequencia[freq] || 1.0;
    
    const tempoFinal = Math.round(tempoBase * freqAjuste);
    const compostoGerado = (qtd * CONFIG_SIMULACAO.fatoresImpacto.conversaoComposto).toFixed(1);
    const qtdAnual = qtd * 52;
    const co2Evitado = (qtdAnual * CONFIG_SIMULACAO.fatoresImpacto.co2EvitadoPorKg).toFixed(1);
    const aguaRetida = (qtdAnual * CONFIG_SIMULACAO.fatoresImpacto.aguaRetidaPorKg).toFixed(0);
    
    // Atualização dos cards de resultados
    resTempo.textContent = `${tempoFinal} dias (média)`;
    resComposto.textContent = `${compostoGerado} kg/semana`;
    resAgua.textContent = `~${aguaRetida} L/ano no solo`;
    resCo2.textContent = `${co2Evitado} kg/ano`;
    
    msgTema.textContent = qtd > 20 
      ? "💡 Grande gerador! Considere implantar uma composteira comunitária para reduzir custos de coleta."
      : "🌱 Excelente! Pequenas ações domésticas somam toneladas de resíduos fora de aterros anualmente.";
    
    estado.etapaAtual = 3;
    atualizarUI();
  }
  
  function resetarSimulacao() {
    estado.etapaAtual = 1;
    estado.dados = { tipo: '', qtd: 0, modelo: '', freq: '' };
    document.getElementById('form-dados').reset();
    document.getElementById('form-config').reset();
    atualizarUI();
  }
  
  // ==========================================
  // CONFIGURAÇÃO DO MODO ESCURO HÍBRIDO
  // ==========================================
  function configurarModoEscuro() {
    const preferencia = localStorage.getItem('tema-agrinho') || 'light';
    
    if (preferencia === 'dark') {
      document.body.classList.add('dark-mode');
      btnTema.textContent = '☀️';
      if (temaTexto) temaTexto.textContent = 'Modo escuro';
    } else {
      document.body.classList.remove('dark-mode');
      btnTema.textContent = '🌙';
      if (temaTexto) temaTexto.textContent = 'Modo claro';
    }
  }
  
  function alternarModoEscuro() {
    document.body.classList.toggle('dark-mode');
    const modo = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    
    localStorage.setItem('tema-agrinho', modo);
    btnTema.textContent = modo === 'dark' ? '☀️' : '🌙';
    
    if (temaTexto) {
      temaTexto.textContent = modo === 'dark' ? 'Modo escuro' : 'Modo claro';
    }
  }
});