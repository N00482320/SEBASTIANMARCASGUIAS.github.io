// Arreglo principal del pedido
const pedido = [];

/**
 * Renderiza los elementos del pedido en el DOM y actualiza el total acumulado
 */
function render() {
  const listaPedido = document.getElementById('lista-pedido');
  const pedidoVacioMsg = document.getElementById('pedido-vacio');
  const totalElem = document.getElementById('total');

  if (!listaPedido || !totalElem) return;

  // Limpiar contenido previo de la lista
  listaPedido.innerHTML = '';

  let totalAcumulado = 0;

  if (pedido.length === 0) {
    if (pedidoVacioMsg) pedidoVacioMsg.classList.remove('d-none');
  } else {
    if (pedidoVacioMsg) pedidoVacioMsg.classList.add('d-none');

    pedido.forEach((item, index) => {
      totalAcumulado += item.precio;

      const li = document.createElement('li');
      li.className = 'd-flex justify-content-between align-items-center py-2 border-bottom';

      li.innerHTML = `
        <div>
          <span class="fw-bold">${item.nombre}</span>
          <span class="text-muted ms-2">S/ ${item.precio.toFixed(2)}</span>
        </div>
        <button type="button" class="btn btn-sm btn-quitar" onclick="quitarDelPedido(${index})">
          Quitar
        </button>
      `;

      listaPedido.appendChild(li);
    });
  }

  // Formatear total con 2 decimales
  totalElem.textContent = `S/ ${totalAcumulado.toFixed(2)}`;
}

/**
 * Agrega un producto al arreglo y actualiza la vista
 * @param {string} nombre 
 * @param {number|string} precio 
 */
function añadirAlPedido(nombre, precio) {
  const precioNum = parseFloat(precio);
  pedido.push({ nombre, precio: precioNum });
  render();

  const totalActual = pedido.reduce((acc, p) => acc + p.precio, 0);
  anunciar(`Se añadió ${nombre}. Total: S/ ${totalActual.toFixed(2)}.`);
}

/**
 * Quita un producto según su índice en el arreglo
 * @param {number} index 
 */
function quitarDelPedido(index) {
  if (index >= 0 && index < pedido.length) {
    const productoEliminado = pedido[index];
    pedido.splice(index, 1);
    render();

    const totalActual = pedido.reduce((acc, p) => acc + p.precio, 0);
    anunciar(`Se quitó ${productoEliminado.nombre}. Total: S/ ${totalActual.toFixed(2)}.`);
  }
}

/**
 * Emite un mensaje de estado para lectores de pantalla
 * @param {string} mensaje 
 */
function anunciar(mensaje) {
  const aviso = document.getElementById('aviso');
  if (aviso) {
    aviso.textContent = mensaje;
  }
}

// Inicialización de eventos al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  // Asignar escuchador de eventos a todos los botones "Añadir"
  const botonesAnadir = document.querySelectorAll('.btn-anadir');

  botonesAnadir.forEach((boton) => {
    boton.addEventListener('click', (e) => {
      const tarjeta = e.target.closest('.producto');
      if (tarjeta) {
        const nombre = tarjeta.dataset.nombre;
        const precio = tarjeta.dataset.precio;
        añadirAlPedido(nombre, precio);
      }
    });
  });

  // Render inicial al cargar la página
  render();
});