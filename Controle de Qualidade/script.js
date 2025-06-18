const MAX_WIDTH = 100, MAX_HEIGHT = 100;

// Carrega imagem, desenha no canvas oculto e mostra assinatura + preview
function carregarImagem(input, canvasId, signatureId, callback) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.getElementById(canvasId);
      const ctx = canvas.getContext('2d');

      // Redimensiona e desenha imagem no canvas oculto
      canvas.width = MAX_WIDTH;
      canvas.height = MAX_HEIGHT;
      ctx.drawImage(img, 0, 0, MAX_WIDTH, MAX_HEIGHT);

      // Desenha assinatura no canvas visível
      desenharAssinatura(ctx, signatureId);

      // Exibe preview visível
      if (canvasId === 'canvas1') {
        document.getElementById('preview1').src = e.target.result;
      } else if (canvasId === 'canvas2') {
        document.getElementById('preview2').src = e.target.result;
      }

      callback();
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

// Gera gráfico de brilho médio por linha da imagem
function desenharAssinatura(ctxOrigem, canvasDestinoId) {
  const data = ctxOrigem.getImageData(0, 0, MAX_WIDTH, MAX_HEIGHT).data;
  const signature = [];

  for (let y = 0; y < MAX_HEIGHT; y++) {
    let somaBrilho = 0;
    for (let x = 0; x < MAX_WIDTH; x++) {
      const idx = (y * MAX_WIDTH + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const brilho = (r + g + b) / 3;
      somaBrilho += brilho;
    }
    signature.push(somaBrilho / MAX_WIDTH);
  }

  const sigCanvas = document.getElementById(canvasDestinoId);
  const sigCtx = sigCanvas.getContext('2d');
  sigCtx.clearRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
  sigCtx.beginPath();
  sigCtx.moveTo(0, MAX_HEIGHT - signature[0] * MAX_HEIGHT / 255);

  for (let i = 1; i < signature.length; i++) {
    const y = MAX_HEIGHT - signature[i] * MAX_HEIGHT / 255;
    sigCtx.lineTo(i, y);
  }

  sigCtx.strokeStyle = 'blue';
  sigCtx.stroke();
}

// Calcula a distância euclidiana entre as duas imagens
function calcularDistancia() {
  const canvas1 = document.getElementById('canvas1');
  const canvas2 = document.getElementById('canvas2');
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');

  const imgData1 = ctx1.getImageData(0, 0, MAX_WIDTH, MAX_HEIGHT).data;
  const imgData2 = ctx2.getImageData(0, 0, MAX_WIDTH, MAX_HEIGHT).data;

  let soma = 0;
  for (let i = 0; i < imgData1.length; i++) {
    soma += Math.pow(imgData1[i] - imgData2[i], 2);
  }

  const distancia = Math.sqrt(soma);
  const limiar = parseInt(document.getElementById('limiar').value);

  const resultado = document.getElementById('resultado');
  resultado.innerText = 'Distância Euclidiana: ' + distancia.toFixed(2) +
                        '\nLimiar: ' + limiar;

  if (distancia <= limiar) {
    resultado.innerText += '\n✅ Resultado: Imagem APROVADA';
    resultado.style.color = 'green';
  } else {
    resultado.innerText += '\n❌ Resultado: Imagem REPROVADA';
    resultado.style.color = 'red';
  }
}

// Eventos de mudança de imagem
document.getElementById('img1').addEventListener('change', function () {
  carregarImagem(this, 'canvas1', 'signature1', function () {});
});

document.getElementById('img2').addEventListener('change', function () {
  carregarImagem(this, 'canvas2', 'signature2', function () {});
});

// Botão comparar
document.getElementById('botaoComparar').addEventListener('click', function () {
  const img1 = document.getElementById('img1').files.length > 0;
  const img2 = document.getElementById('img2').files.length > 0;

  if (img1 && img2) {
    calcularDistancia();
  } else {
    alert('Por favor, selecione as duas imagens antes de comparar.');
  }
});

// Atualiza valor do limiar visivelmente
document.getElementById('limiar').addEventListener('input', function () {
  document.getElementById('valor-limiar').innerText = this.value;
});
