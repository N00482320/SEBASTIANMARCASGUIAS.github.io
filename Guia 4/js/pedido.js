// ===== 3. Estado del pedido y utilidades =====
const pedido = []; // cada ítem: { nombre, precio, cantidad }

const lista = document.getElementById('lista-pedido');
const totalTexto = document.getElementById('total');
const mensajeVacio = document.getElementById('pedido-vacio');
const aviso = document.getElementById('aviso');
const tituloPedido = document.getElementById('titulo-pedido');
const btnVaciar = document.getElementById('btn-vaciar');
const sugerenciaBox = document.getElementById('sugerencia-mantequilla');
const btnSugerencia = document.getElementById('btn-sugerencia');
const contadorGlobal = document.getElementById('contador-global');

function soles(monto) {
  return 'S/ ' + monto.toFixed(2);
}

function calcularTotal() {
  return pedido.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

function calcularCantidadTotal() {
  return pedido.reduce((suma, item) => suma + item.cantidad, 0);
}

function anunciar(mensaje) {
  aviso.textContent = mensaje;
}

// Persistencia de datos en localStorage
function cargarPedidoGuardado() {
  const guardado = localStorage.getItem('pedido_santa_rosa');
  if (guardado) {
    try {
      const datos = JSON.parse(guardado);
      if (Array.isArray(datos)) {
        pedido.push(...datos);
      }
    } catch (e) {
      console.error('Error al recuperar el pedido guardado:', e);
    }
  }
}

function guardarPedido() {
  localStorage.setItem('pedido_santa_rosa', JSON.stringify(pedido));
}

// ===== 4. Dibujar la lista con el DOM =====
function render() {
  lista.replaceChildren(); // borra los <li> anteriores

  for (const item of pedido) {
    const li = document.createElement('li');

    const texto = document.createElement('span');
    const subtotal = soles(item.precio * item.cantidad);
    texto.textContent = `${item.cantidad} × ${item.nombre} · ${subtotal}`;

    // Contenedor de acciones (+, -, quitar)
    const acciones = document.createElement('div');
    acciones.className = 'acciones-item';

    // Reto: Botón Restar (-)
    const restarBtn = document.createElement('button');
    restarBtn.type = 'button';
    restarBtn.className = 'btn-restar';
    restarBtn.textContent = '−';
    restarBtn.setAttribute('aria-label', `Restar una unidad de ${item.nombre}`);
    restarBtn.dataset.nombre = item.nombre;

    // Reto: Botón Sumar (+)
    const sumarBtn = document.createElement('button');
    sumarBtn.type = 'button';
    sumarBtn.className = 'btn-sumar';
    sumarBtn.textContent = '+';
    sumarBtn.setAttribute('aria-label', `Sumar una unidad de ${item.nombre}`);
    sumarBtn.dataset.nombre = item.nombre;

    // Botón Quitar
    const quitarBtn = document.createElement('button');
    quitarBtn.type = 'button';
    quitarBtn.className = 'btn-quitar';
    quitarBtn.dataset.nombre = item.nombre;
    quitarBtn.textContent = 'Quitar';
    quitarBtn.setAttribute('aria-label', `Quitar ${item.nombre}`);

    acciones.append(restarBtn, sumarBtn, quitarBtn);
    li.append(texto, acciones);
    lista.append(li);
  }

  // Actualizar totales y contadores
  totalTexto.textContent = soles(calcularTotal());
  if (contadorGlobal) {
    contadorGlobal.textContent = calcularCantidadTotal();
  }

  const hayProductos = pedido.length > 0;
  mensajeVacio.hidden = hayProductos;
  btnVaciar.hidden = !hayProductos;

  // Reto: Mostrar sugerencia de mantequilla solo si hay pan en el pedido y no se ha añadido aún
  const tienePan = pedido.some(item => item.nombre.toLowerCase().includes('pan'));
  const tieneMantequilla = pedido.some(item => item.nombre === 'Mantequilla');
  sugerenciaBox.hidden = !(tienePan && !tieneMantequilla);

  // Guardar cambios en el navegador
  guardarPedido();
}

// ===== 5. Añadir y quitar =====
function agregar(nombre, precio) {
  const existente = pedido.find((item) => item.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    pedido.push({ nombre, precio, cantidad: 1 });
  }
  render();
  anunciar(`Se añadió ${nombre}. Total: ${soles(calcularTotal())}.`);
}

function restarUnidad(nombre) {
  const existente = pedido.find((item) => item.nombre === nombre);
  if (!existente) return;

  existente.cantidad--;
  if (existente.cantidad <= 0) {
    quitar(nombre);
  } else {
    render();
    anunciar(`Se restó una unidad de ${nombre}. Total: ${soles(calcularTotal())}.`);
  }
}

function quitar(nombre) {
  const posicion = pedido.findIndex((item) => item.nombre === nombre);
  if (posicion === -1) return;
  pedido.splice(posicion, 1);
  render();
  anunciar(`Se quitó ${nombre}. Total: ${soles(calcularTotal())}.`);
  
  if (pedido.length === 0) {
    mensajeVacio.focus();
  } else {
    tituloPedido.focus(); // el foco no se pierde
  }
}

function vaciarPedido() {
  if (pedido.length === 0) return;
  
  // Confirmación previa para evitar pérdida accidental (Caso Diego)
  const confirmado = confirm('¿Estás seguro de que deseas vaciar todo tu pedido?');
  if (confirmado) {
    pedido.length = 0; // limpia el arreglo
    render();
    anunciar('Se ha vaciado todo el pedido.');
    mensajeVacio.focus();
  }
}

// ===== Delegación de eventos =====
// 1. Oyente para catálogo (Añadir)
document.querySelector('.catalogo').addEventListener('click', (evento) => {
  const boton = evento.target.closest('.btn-anadir');
  if (!boton) return;
  const producto = boton.closest('.producto');
  agregar(producto.dataset.nombre, Number(producto.dataset.precio));
});

// 2. Oyente para la lista de pedido (Quitar, +, -)
lista.addEventListener('click', (evento) => {
  const botonQuitar = evento.target.closest('.btn-quitar');
  if (botonQuitar) {
    quitar(botonQuitar.dataset.nombre);
    return;
  }

  const botonSumar = evento.target.closest('.btn-sumar');
  if (botonSumar) {
    // Si ya existe en el pedido, busca el precio real guardado
    const prod = pedido.find(p => p.nombre === botonSumar.dataset.nombre);
    const precio = prod ? prod.precio : 0;
    agregar(botonSumar.dataset.nombre, precio);
    return;
  }

  const botonRestar = evento.target.closest('.btn-restar');
  if (botonRestar) {
    restarUnidad(botonRestar.dataset.nombre);
    return;
  }
});

// 3. Oyente para vaciar el pedido
btnVaciar.addEventListener('click', vaciarPedido);

// 4. Oyente para sugerencia de mantequilla
btnSugerencia.addEventListener('click', () => {
  agregar('Mantequilla', 2.50);
});

// Cargar estado inicial y dibujar la vista
cargarPedidoGuardado();
render();