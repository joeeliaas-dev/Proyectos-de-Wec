/**
 * Café del Centro — Prototipo Funcional SPA
 * Gestor de Estado Reactivo Compartido (localStorage + BroadcastChannel + Eventos storage)
 * Garantiza sincronización en tiempo real (< 3 segundos — RNF-03) entre Cliente, Barra y Administradora.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'cafe_del_centro_spa_state_v3';
  const CHANNEL_NAME = 'cafe_del_centro_live_sync';

  const {
    CATALOG_ITEMS,
    BASE_TABLES,
    TIME_BLOCKS,
    ORDER_STATES,
    getISODateOffset,
    createInitialState
  } = window.CDC_DATA;

  let state = loadFromStorage();
  const listeners = new Set();
  let syncChannel = null;

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      syncChannel = new BroadcastChannel(CHANNEL_NAME);
      syncChannel.onmessage = function (ev) {
        if (ev && ev.data && ev.data.type === 'STATE_UPDATED') {
          state = loadFromStorage();
          notifyListeners({ external: true, source: ev.data.source || 'Sincronización entre pestañas' });
        }
      };
    }
  } catch (_) {
    // Fallback silencioso a evento storage estándar
  }

  window.addEventListener('storage', function (ev) {
    if (ev.key === STORAGE_KEY && ev.newValue) {
      try {
        state = JSON.parse(ev.newValue);
        notifyListeners({ external: true, source: 'Sincronización localStorage' });
      } catch (_) {
        // Ignorar JSON corrupto
      }
    }
  });

  function loadFromStorage() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && Array.isArray(parsed.reservations) && Array.isArray(parsed.orders)) {
          return parsed;
        }
      }
    } catch (_) {
      // Si localStorage está restringido, opera en memoria sin fallar
    }
    const initial = createInitialState();
    saveToStorage(initial);
    return initial;
  }

  function saveToStorage(nextState) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch (_) {
      // Ignorar cuota excedida o modo privado estricto
    }
  }

  function commit(sourceDescription) {
    state.lastSyncAt = new Date().toISOString();
    state.lastSyncSource = sourceDescription || 'Actualización en vivo';
    saveToStorage(state);
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'STATE_UPDATED',
          source: state.lastSyncSource,
          timestamp: state.lastSyncAt
        });
      } catch (_) {}
    }
    notifyListeners({ external: false, source: state.lastSyncSource });
  }

  function notifyListeners(meta) {
    listeners.forEach(function (fn) {
      try {
        fn(state, meta);
      } catch (err) {
        console.error('Error en suscriptor de estado:', err);
      }
    });
  }

  function subscribe(fn) {
    listeners.add(fn);
    return function unsubscribe() {
      listeners.delete(fn);
    };
  }

  function getState() {
    return state;
  }

  function formatCurrentTime12h() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  // --- Consultas de Disponibilidad de Salón y Mesas (RF-01, HU-01, HU-02, RN-01, HU-08) ---

  function getAdminBlockForSlot(date, timeBlockId, tableId) {
    return state.adminBlocks.find(function (b) {
      const dateMatch = b.date === date;
      const timeMatch = b.timeBlockId === 'ALL' || b.timeBlockId === timeBlockId;
      if (!dateMatch || !timeMatch) return false;
      if (!tableId) return b.scope === 'all';
      return b.scope === 'all' || (Array.isArray(b.tableIds) && b.tableIds.includes(tableId));
    }) || null;
  }

  function getActiveReservationForTable(date, timeBlockId, tableId) {
    return state.reservations.find(function (r) {
      return (
        r.date === date &&
        r.timeBlockId === timeBlockId &&
        r.tableId === tableId &&
        (r.status === 'reserved' || r.status === 'checked_in')
      );
    }) || null;
  }

  function getTableDetailedState(date, timeBlockId, tableId) {
    const base = BASE_TABLES.find(function (t) { return t.id === tableId; });
    if (!base) return null;

    const overrideKey = `${date}_${timeBlockId}_${tableId}`;
    const manualOverride = state.manualTableOverrides[overrideKey] || null;
    const block = getAdminBlockForSlot(date, timeBlockId, tableId);
    const activeRes = getActiveReservationForTable(date, timeBlockId, tableId);

    // Mesas 7 y 8: Exclusivo Walk-in 20% (RN-01)
    if (base.isWalkInOnly) {
      const walkInOccupied = manualOverride === 'occupied';
      return {
        table: base,
        customerStatus: 'walkin',
        customerLabel: 'Exclusivo Walk-in 20% - RN-01',
        staffStatus: walkInOccupied ? 'occupied' : 'walkin',
        staffLabel: walkInOccupied ? 'Ocupada (Walk-in Presencial)' : 'Exclusivo Walk-in 20% - RN-01',
        reservation: null,
        adminBlock: block
      };
    }

    // Bloqueo administrativo por evento o patrocinio (HU-08)
    if (block) {
      return {
        table: base,
        customerStatus: 'blocked',
        customerLabel: 'Bloqueada (Evento)',
        staffStatus: 'blocked',
        staffLabel: `Bloqueada (${block.reason})`,
        reservation: activeRes,
        adminBlock: block
      };
    }

    // Reserva activa en sistema
    if (activeRes) {
      const isOccupied = activeRes.status === 'checked_in';
      return {
        table: base,
        customerStatus: isOccupied ? 'occupied' : 'reserved',
        customerLabel: isOccupied ? 'Ocupada' : 'Reservada',
        staffStatus: isOccupied ? 'occupied' : 'reserved',
        staffLabel: isOccupied ? 'Ocupada' : 'Reservada',
        reservation: activeRes,
        adminBlock: null
      };
    }

    // Cambio manual desde Tablet de Barra (HU-05)
    if (manualOverride === 'occupied') {
      return {
        table: base,
        customerStatus: 'occupied',
        customerLabel: 'Ocupada',
        staffStatus: 'occupied',
        staffLabel: 'Ocupada (Asignación en Barra)',
        reservation: null,
        adminBlock: null
      };
    }
    if (manualOverride === 'reserved') {
      return {
        table: base,
        customerStatus: 'reserved',
        customerLabel: 'Reservada',
        staffStatus: 'reserved',
        staffLabel: 'Reservada (Manual)',
        reservation: null,
        adminBlock: null
      };
    }

    return {
      table: base,
      customerStatus: 'available',
      customerLabel: 'Disponible',
      staffStatus: 'available',
      staffLabel: 'Disponible',
      reservation: null,
      adminBlock: null
    };
  }

  function evaluateTimeBlockStatus(date, timeBlockId) {
    const blockMeta = TIME_BLOCKS.find(function (b) { return b.id === timeBlockId; });
    const fullVenueBlock = getAdminBlockForSlot(date, timeBlockId, null);
    if (fullVenueBlock) {
      return {
        available: false,
        reason: 'admin_block',
        adminBlock: fullVenueBlock
      };
    }

    // Regla RN-01: El bloque 4:00 PM - 5:00 PM tiene alcanzado el tope del 80% de aforo digital
    if (blockMeta && blockMeta.digitalCapReached) {
      return {
        available: false,
        reason: 'rn01_80_cap',
        adminBlock: null
      };
    }

    // También verifica dinámicamente si las 6 mesas digitales están llenas
    const onlineTables = BASE_TABLES.filter(function (t) { return !t.isWalkInOnly; });
    const freeOnlineTables = onlineTables.filter(function (t) {
      const info = getTableDetailedState(date, timeBlockId, t.id);
      return info && info.customerStatus === 'available';
    });

    if (freeOnlineTables.length === 0) {
      return {
        available: false,
        reason: 'rn01_80_cap',
        adminBlock: null
      };
    }

    return {
      available: true,
      reason: 'ok',
      freeCount: freeOnlineTables.length
    };
  }

  function getNextAvailableTimeBlock(date, afterBlockId) {
    const idx = TIME_BLOCKS.findIndex(function (b) { return b.id === afterBlockId; });
    const ordered = idx >= 0
      ? TIME_BLOCKS.slice(idx + 1).concat(TIME_BLOCKS.slice(0, idx))
      : TIME_BLOCKS.slice();

    for (let i = 0; i < ordered.length; i++) {
      const candidate = ordered[i];
      const status = evaluateTimeBlockStatus(date, candidate.id);
      if (status.available) {
        return candidate;
      }
    }
    return TIME_BLOCKS[2]; // Fallback 5:15 PM - 6:30 PM
  }

  // Disponibilidad de Barista Especialista para Métodos en Mesa (RN-03 / HU-03)
  function checkSpecialistBaristaAvailability(date, timeBlockId) {
    const assigned = state.reservations.some(function (r) {
      return (
        r.date === date &&
        r.timeBlockId === timeBlockId &&
        r.modality === 'barismo' &&
        r.barista === 'Alejandro Sura' &&
        (r.status === 'reserved' || r.status === 'checked_in')
      );
    });
    if (!assigned) {
      return {
        available: true,
        baristaName: 'Alejandro Sura'
      };
    }
    // Busca siguiente bloque con Alejandro Sura libre
    const nextSlot = TIME_BLOCKS.find(function (b) {
      if (b.id === timeBlockId) return false;
      const slotEval = evaluateTimeBlockStatus(date, b.id);
      if (!slotEval.available) return false;
      const busy = state.reservations.some(function (r) {
        return (
          r.date === date &&
          r.timeBlockId === b.id &&
          r.modality === 'barismo' &&
          r.barista === 'Alejandro Sura' &&
          (r.status === 'reserved' || r.status === 'checked_in')
        );
      });
      return !busy;
    });

    return {
      available: false,
      baristaName: null,
      suggestedSlot: nextSlot || null
    };
  }

  // --- Mutaciones de Reservas y Salón ---

  function createReservation(payload) {
    const seq = state.nextReservationSeq++;
    const code = `#RES-${seq}`;
    const blockObj = TIME_BLOCKS.find(function (b) { return b.id === payload.timeBlockId; });
    const isBarismo = payload.modality === 'barismo';

    const newReservation = {
      id: code,
      customerName: payload.customerName.trim(),
      guests: Number(payload.guests),
      date: payload.date,
      timeBlockId: payload.timeBlockId,
      timeBlockLabel: blockObj ? blockObj.label : payload.timeBlockId,
      tableId: Number(payload.tableId),
      modality: isBarismo ? 'barismo' : 'estandar',
      modalityLabel: isBarismo
        ? 'Experiencia Educativa de Barismo (Métodos en Mesa)'
        : 'Consumo Estándar',
      durationMinutes: isBarismo ? 75 : 45,
      barista: isBarismo ? (payload.barista || 'Alejandro Sura') : 'Equipo de Barra General',
      status: 'reserved',
      checkInTime: null,
      delayedMinutes: 0,
      createdAt: formatCurrentTime12h()
    };

    // Limpiar override manual si existiera sobre esa mesa/bloque
    delete state.manualTableOverrides[`${payload.date}_${payload.timeBlockId}_${payload.tableId}`];

    state.reservations.unshift(newReservation);
    state.activeClientReservationId = code;
    state.salonHistory.unshift({
      id: `log-${Date.now()}`,
      time: newReservation.createdAt,
      type: 'new_reservation',
      message: `Nueva reserva digital ${code} (${newReservation.customerName} • Mesa ${newReservation.tableId} • ${newReservation.durationMinutes} min).`
    });

    commit(`Reserva ${code} creada por cliente`);
    return newReservation;
  }

  function checkInReservation(reservationId) {
    const res = state.reservations.find(function (r) { return r.id === reservationId; });
    if (!res) return null;

    res.status = 'checked_in';
    res.checkInTime = formatCurrentTime12h();
    res.delayedMinutes = 0;

    state.salonHistory.unshift({
      id: `log-${Date.now()}`,
      time: res.checkInTime,
      type: 'checkin',
      message: `Check-in confirmado en Mesa ${res.tableId} (${res.id} • ${res.customerName}) a las ${res.checkInTime}.`
    });

    commit(`Check-in registrado en Mesa ${res.tableId} (${res.id})`);
    return res;
  }

  function expireReservationNoShow(reservationId) {
    const res = state.reservations.find(function (r) { return r.id === reservationId; });
    if (!res) return null;

    res.status = 'no_show';
    res.expiredAt = formatCurrentTime12h();
    delete state.manualTableOverrides[`${res.date}_${res.timeBlockId}_${res.tableId}`];

    state.salonHistory.unshift({
      id: `log-${Date.now()}`,
      time: res.expiredAt,
      type: 'noshow',
      message: `RN-02 Aplicada: Mesa ${res.tableId} liberada a Disponible. Reserva ${res.id} (${res.customerName}) marcada como "No presentó" tras 15 min sin Check-in.`
    });

    commit(`Mesa ${res.tableId} liberada automáticamente (RN-02 — No presentó)`);
    return res;
  }

  function setManualTableState(date, timeBlockId, tableId, nextManualStatus) {
    const key = `${date}_${timeBlockId}_${tableId}`;
    const activeRes = getActiveReservationForTable(date, timeBlockId, tableId);

    // Si el barista libera una mesa ocupada con reserva activa, finalizar esa estancia
    if (nextManualStatus === 'available' && activeRes) {
      activeRes.status = 'completed';
      delete state.manualTableOverrides[key];
      state.salonHistory.unshift({
        id: `log-${Date.now()}`,
        time: formatCurrentTime12h(),
        type: 'release',
        message: `Mesa ${tableId} liberada a Disponible tras finalizar servicio (${activeRes.id}).`
      });
      commit(`Mesa ${tableId} liberada a Disponible`);
      return;
    }

    if (nextManualStatus === 'available') {
      delete state.manualTableOverrides[key];
    } else {
      state.manualTableOverrides[key] = nextManualStatus;
    }

    state.salonHistory.unshift({
      id: `log-${Date.now()}`,
      time: formatCurrentTime12h(),
      type: 'manual',
      message: `Estado de Mesa ${tableId} actualizado en barra a "${nextManualStatus === 'occupied' ? 'Ocupada' : nextManualStatus === 'reserved' ? 'Reservada' : 'Disponible'}".`
    });
    commit(`Estado de Mesa ${tableId} actualizado desde Tablet de Barra`);
  }

  // --- Mutaciones de Carrito y Pedidos Pick-up / Mayorista B2B (RF-05, RF-06, RN-04) ---

  function addToCart(itemId, quantityToAdd) {
    const product = CATALOG_ITEMS.find(function (p) { return p.id === itemId; });
    if (!product || !product.available) return false;

    const qty = Math.max(1, Number(quantityToAdd) || 1);
    const existing = state.cart.find(function (c) { return c.itemId === itemId; });
    if (existing) {
      existing.quantity += qty;
    } else {
      state.cart.push({
        itemId: itemId,
        quantity: qty,
        notes: product.isGrain ? 'Grano entero' : ''
      });
    }
    commit(`Producto agregado al carrito: ${product.shortName}`);
    return true;
  }

  function updateCartItemQty(itemId, newQty) {
    const qty = Number(newQty);
    if (qty <= 0) {
      state.cart = state.cart.filter(function (c) { return c.itemId !== itemId; });
    } else {
      const target = state.cart.find(function (c) { return c.itemId === itemId; });
      if (target) target.quantity = qty;
    }
    commit('Carrito actualizado');
  }

  function updateCartItemNotes(itemId, notes) {
    const target = state.cart.find(function (c) { return c.itemId === itemId; });
    if (target) {
      target.notes = notes;
      saveToStorage(state);
    }
  }

  function ensureMinimumB2BGrainWeight() {
    const totals = getCartTotals();
    if (totals.grainLbs >= 5) return;
    const needed = 5 - totals.grainLbs;
    const pacamaraInCart = state.cart.find(function (c) { return c.itemId === 'grain-pacamara'; });
    if (pacamaraInCart) {
      pacamaraInCart.quantity += needed;
    } else {
      state.cart.unshift({
        itemId: 'grain-pacamara',
        quantity: needed,
        notes: 'Lote B2B Mayorista'
      });
    }
    commit('Lote ajustado a mínimo mayorista de 5 lb (RN-04)');
  }

  function getCartTotals() {
    let totalAmount = 0;
    let grainLbs = 0;
    let totalUnits = 0;
    const detailedItems = [];

    state.cart.forEach(function (entry) {
      const product = CATALOG_ITEMS.find(function (p) { return p.id === entry.itemId; });
      if (!product) return;
      const lineTotal = product.price * entry.quantity;
      totalAmount += lineTotal;
      totalUnits += entry.quantity;
      if (product.isGrain) {
        grainLbs += entry.quantity;
      }
      detailedItems.push({
        itemId: product.id,
        name: product.shortName,
        fullName: product.name,
        image: product.image,
        price: product.price,
        unit: product.unit,
        isGrain: product.isGrain,
        qty: entry.quantity,
        notes: entry.notes || '',
        lineTotal: lineTotal
      });
    });

    return {
      items: detailedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      grainLbs: grainLbs,
      totalUnits: totalUnits
    };
  }

  function getActiveLogisticsWindows() {
    return state.logisticsWindows.filter(function (w) { return w.active; });
  }

  function createOrder(payload) {
    const cartSummary = getCartTotals();
    const seq = state.nextOrderSeq++;
    const orderId = `#ORD-${seq}`;

    const summaryText = cartSummary.items
      .map(function (it) {
        return `${it.qty} ${it.unit === 'lb' ? 'lb' : 'x'} ${it.name}`;
      })
      .join(' + ');

    const isB2B = payload.modality === 'b2b';

    const newOrder = {
      id: orderId,
      customerName: payload.customerName.trim(),
      contactPerson: payload.contactPerson ? payload.contactPerson.trim() : '',
      phone: payload.phone ? payload.phone.trim() : '',
      modality: isB2B ? 'b2b' : 'pickup',
      modalityLabel: isB2B ? 'Mayorista / Marca Aliada B2B' : 'Pasar a Traer / Pick-up',
      itemsSummary: summaryText,
      items: cartSummary.items.map(function (it) {
        return {
          itemId: it.itemId,
          name: it.name,
          qty: it.qty,
          unit: it.unit,
          price: it.price,
          notes: it.notes
        };
      }),
      totalLbs: cartSummary.grainLbs,
      totalAmount: cartSummary.totalAmount,
      scheduledDate: payload.scheduledDate,
      scheduledTime: payload.scheduledTimeLabel,
      urgencyRank: isB2B ? 3 : 1,
      stepIndex: 0, // Paso 1: Orden Recibida
      b2bApprovalStatus: isB2B ? 'pending' : 'not_applicable',
      rejectionReason: '',
      deliveryAddress: isB2B
        ? (payload.deliveryAddress || 'Recolección en Ventana Autorizada — Centro Histórico')
        : 'Retiro en Barra — Café del Centro',
      notes: payload.notes || '',
      createdAt: formatCurrentTime12h()
    };

    state.orders.unshift(newOrder);
    state.activeTrackedOrderId = orderId;
    state.cart = []; // Vacía carrito tras confirmar orden exitosamente

    commit(`Nuevo pedido ${orderId} registrado (${newOrder.modalityLabel})`);
    return newOrder;
  }

  function advanceOrderState(orderId) {
    const order = state.orders.find(function (o) { return o.id === orderId; });
    if (!order) return null;
    if (order.b2bApprovalStatus === 'rejected') return null;

    if (order.stepIndex < ORDER_STATES.length - 1) {
      order.stepIndex += 1;
      const stateName = ORDER_STATES[order.stepIndex];
      commit(`Pedido ${order.id} avanzado a "${stateName}"`);
    }
    return order;
  }

  function setTrackedOrder(orderId) {
    state.activeTrackedOrderId = orderId;
    commit(`Seguimiento cambiado a ${orderId}`);
  }

  // --- Mutaciones Panel de Administradora (P-08: HU-08, HU-14, HU-15) ---

  function approveB2BOrder(orderId) {
    const order = state.orders.find(function (o) { return o.id === orderId; });
    if (!order) return null;
    order.b2bApprovalStatus = 'approved';
    order.rejectionReason = '';
    if (order.stepIndex === 0) {
      order.stepIndex = 1; // Pasa automáticamente a En Preparación / Tostado al aprobar despacho
    }
    commit(`Despacho B2B aprobado para ${order.id} (${order.customerName})`);
    return order;
  }

  function rejectB2BOrder(orderId, reason) {
    const order = state.orders.find(function (o) { return o.id === orderId; });
    if (!order) return null;
    order.b2bApprovalStatus = 'rejected';
    order.rejectionReason = reason.trim();
    commit(`Pedido B2B ${order.id} rechazado por Administradora`);
    return order;
  }

  function updateLogisticsWindow(windowId, changes) {
    const win = state.logisticsWindows.find(function (w) { return w.id === windowId; });
    if (!win) return null;
    Object.assign(win, changes);
    commit(`Ventana logística "${win.name}" actualizada (RN-04 / HU-15)`);
    return win;
  }

  function addLogisticsWindow(newWin) {
    const win = {
      id: `win-${Date.now()}`,
      name: newWin.name.trim(),
      startTime: newWin.startTime.trim(),
      endTime: newWin.endTime.trim(),
      days: newWin.days || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      active: true
    };
    state.logisticsWindows.push(win);
    commit(`Nueva ventana logística "${win.name}" agregada (HU-15)`);
    return win;
  }

  function findConflictingReservations(date, timeBlockId, scope, tableIds) {
    return state.reservations.filter(function (r) {
      if (r.date !== date) return false;
      if (r.status !== 'reserved' && r.status !== 'checked_in') return false;
      const timeMatch = timeBlockId === 'ALL' || r.timeBlockId === timeBlockId;
      if (!timeMatch) return false;
      if (scope === 'all') return true;
      return Array.isArray(tableIds) && tableIds.includes(r.tableId);
    });
  }

  function applyAdminBlock(payload) {
    const conflicts = findConflictingReservations(
      payload.date,
      payload.timeBlockId,
      payload.scope,
      payload.tableIds
    );

    const blockObj = TIME_BLOCKS.find(function (b) { return b.id === payload.timeBlockId; });
    const timeLabel = payload.timeBlockId === 'ALL'
      ? 'Jornada Completa (Todos los horarios)'
      : (blockObj ? blockObj.label : payload.timeBlockId);

    const newBlock = {
      id: `blk-${Date.now()}`,
      date: payload.date,
      timeBlockId: payload.timeBlockId,
      timeBlockLabel: timeLabel,
      scope: payload.scope,
      tableIds: payload.scope === 'all' ? [1, 2, 3, 4, 5, 6, 7, 8] : payload.tableIds.slice(),
      reason: payload.reason.trim(),
      affectedCount: conflicts.length,
      createdAt: formatCurrentTime12h()
    };

    // Marcar reservas afectadas como reprogramación notificada si el administrador confirmó
    conflicts.forEach(function (r) {
      r.status = 'cancelled_by_event';
      r.eventReason = newBlock.reason;
    });

    if (conflicts.length > 0) {
      state.salonHistory.unshift({
        id: `log-${Date.now()}`,
        time: newBlock.createdAt,
        type: 'admin_block',
        message: `Bloqueo Administrativo por "${newBlock.reason}" (${newBlock.timeBlockLabel}). ${conflicts.length} reserva(s) notificada(s) para reprogramación.`
      });
    }

    state.adminBlocks.unshift(newBlock);
    commit(`Bloqueo aplicado: ${newBlock.reason} (${newBlock.timeBlockLabel})`);
    return newBlock;
  }

  function removeAdminBlock(blockId) {
    state.adminBlocks = state.adminBlocks.filter(function (b) { return b.id !== blockId; });
    commit('Bloqueo operativo eliminado por Administradora');
  }

  function resetDemoData() {
    state = createInitialState();
    saveToStorage(state);
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'STATE_UPDATED',
          source: 'Datos Demo Restaurados',
          timestamp: state.lastSyncAt
        });
      } catch (_) {}
    }
    notifyListeners({ external: false, source: 'Datos Demo Restaurados', reset: true });
  }

  window.CDC_STORE = {
    subscribe,
    getState,
    getISODateOffset,
    getTableDetailedState,
    evaluateTimeBlockStatus,
    getNextAvailableTimeBlock,
    checkSpecialistBaristaAvailability,
    createReservation,
    checkInReservation,
    expireReservationNoShow,
    setManualTableState,
    addToCart,
    updateCartItemQty,
    updateCartItemNotes,
    ensureMinimumB2BGrainWeight,
    getCartTotals,
    getActiveLogisticsWindows,
    createOrder,
    advanceOrderState,
    setTrackedOrder,
    approveB2BOrder,
    rejectB2BOrder,
    updateLogisticsWindow,
    addLogisticsWindow,
    findConflictingReservations,
    applyAdminBlock,
    removeAdminBlock,
    resetDemoData
  };
})(window);
