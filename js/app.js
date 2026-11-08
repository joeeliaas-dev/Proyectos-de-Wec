/**
 * Café del Centro — Plataforma Digital SPA (P-01 a P-08)
 * Diseño Comercial Realista, Tipografía Moderna (Poppins + Ubuntu) y Arquitectura Ultra-Responsiva
 * Consultora: Linuxeros Digital Consulting (LDC) — Grupo 4
 */

(function (window, document) {
  'use strict';

  const {
    IMAGES,
    GALLERY_PHOTOS,
    TIME_BLOCKS,
    CATALOG_ITEMS,
    BASE_TABLES,
    ORDER_STATES,
    getISODateOffset
  } = window.CDC_DATA;

  const store = window.CDC_STORE;

  const SCREEN_META = {
    'P-01': { role: 'client', short: 'Menú y Origen', title: 'Home, Cultura y Catálogo con Trazabilidad' },
    'P-02': { role: 'client', short: 'Reservar Mesa', title: 'Mapa de Disponibilidad y Reserva de Mesas' },
    'P-03': { role: 'client', short: 'Pase Reserva', title: 'Confirmación de Reserva Exitosa' },
    'P-04': { role: 'client', short: 'Carrito / B2B', title: 'Carrito y Checkout Pick-up / Mayorista B2B' },
    'P-05': { role: 'client', short: 'Rastrear Orden', title: 'Seguimiento de Estado de Orden en Vivo' },
    'P-06': { role: 'staff', short: 'Salón POS', title: 'Tablet de Barra — Mapa de Salón y Check-in' },
    'P-07': { role: 'staff', short: 'Cola Pedidos', title: 'Tablet de Barra — Cola de Pedidos Externos' },
    'P-08': { role: 'admin', short: 'Admin B2B', title: 'Panel de Administradora — Logística, Ventanas y Bloqueos' }
  };

  const ui = {
    currentRole: 'client',
    currentScreen: 'P-01',
    lastScreenByRole: {
      client: 'P-01',
      staff: 'P-06',
      admin: 'P-08'
    },

    // Lightbox de fotos reales del local
    lightbox: {
      open: false,
      index: 0
    },

    // P-01
    catalogCategory: 'Todos',
    grainSelectedWeightByItem: {
      'grain-pacamara': 1,
      'grain-bourbon': 1
    },

    // P-02
    reservationDraft: {
      date: getISODateOffset(0),
      guests: 2,
      timeBlockId: '15:00',
      selectedTableId: 1,
      modality: 'estandar',
      customerName: '',
      errors: {}
    },

    // Modal P-02.1 (RN-01 o Bloqueo Evento)
    modalRN01: {
      open: false,
      blockedTimeLabel: '4:00 PM - 5:00 PM',
      reasonType: 'rn01',
      adminBlockReason: '',
      nextSlot: null
    },

    // P-04 Checkout Pick-up & B2B
    checkoutTab: 'pickup',
    pickupDraft: {
      customerName: '',
      phone: '',
      pickupTime: 'Hoy • 3:30 PM',
      notes: '',
      errors: {}
    },
    b2bDraft: {
      brandName: '',
      contactPerson: '',
      deliveryAddress: '',
      dateChoice: 'today',
      customDate: getISODateOffset(2),
      windowChoice: 'invalid_regular',
      notes: '',
      errors: {}
    },

    // P-06 & P-07 Tablet de Barra
    staffDateFilter: getISODateOffset(0),
    staffBlockFilter: '15:00',
    queueFilter: 'active',

    // P-08 Panel Administradora
    rejectModal: {
      open: false,
      orderId: null,
      brandName: '',
      reason: '',
      error: ''
    },
    blockDraft: {
      date: getISODateOffset(0),
      timeBlockId: '15:00',
      scope: 'all',
      tableIds: [1, 2],
      reason: 'Patrocinio Torneo Nacional de Tenis',
      error: ''
    },
    conflictModal: {
      open: false,
      conflicts: [],
      pendingPayload: null
    }
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatFriendlyDate(isoDate) {
    const today = getISODateOffset(0);
    const tomorrow = getISODateOffset(1);
    if (isoDate === today) return `Hoy (${isoDate})`;
    if (isoDate === tomorrow) return `Mañana (${isoDate})`;
    return isoDate;
  }

  function getBlockLabel(blockId) {
    const found = TIME_BLOCKS.find(function (b) { return b.id === blockId; });
    return found ? found.label : blockId;
  }

  function getProductImageById(itemId) {
    const found = CATALOG_ITEMS.find(function (p) { return p.id === itemId; });
    return found ? found.image : IMAGES.tazas;
  }

  function svgIcon(paths, size) {
    const px = size || 16;
    return `<svg class="svg-icon" width="${px}" height="${px}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  const ICONS = {
    award: svgIcon('<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>', 16),
    arrowRight: svgIcon('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', 16),
    arrowLeft: svgIcon('<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>', 16),
    maximize: svgIcon('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>', 14),
    leaf: svgIcon('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', 20),
    leafSm: svgIcon('<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>', 14),
    layoutGrid: svgIcon('<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>', 20),
    coffee: svgIcon('<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>', 20),
    coffeeSm: svgIcon('<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>', 15),
    packageBox: svgIcon('<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>', 20),
    packageSm: svgIcon('<path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>', 16),
    shoppingBag: svgIcon('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>', 16),
    check: svgIcon('<polyline points="20 6 9 17 4 12"/>', 15),
    checkCircle: svgIcon('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>', 14),
    slashCircle: svgIcon('<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>', 14),
    xCircle: svgIcon('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>', 15),
    alertTriangle: svgIcon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>', 16),
    clock: svgIcon('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', 14),
    timer: svgIcon('<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>', 18),
    lock: svgIcon('<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', 13),
    camera: svgIcon('<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>', 15),
    doorOpen: svgIcon('<path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/>', 15),
    bell: svgIcon('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>', 18),
    mapPin: svgIcon('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', 14),
    radioOn: svgIcon('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/>', 16),
    radioOff: svgIcon('<circle cx="12" cy="12" r="9"/>', 16),
    plus: svgIcon('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', 15),
    minus: svgIcon('<line x1="5" y1="12" x2="19" y2="12"/>', 15),
    userOccupied: svgIcon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', 13),
    clipboard: svgIcon('<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>', 17),
    flame: svgIcon('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 17),
    truck: svgIcon('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>', 17),
    calendar: svgIcon('<rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>', 16)
  };

  // SVG Ilustración arquitectónica de mesa según capacidad (2, 4 o 6 sillas)
  function renderTableSvgGraphic(capacity) {
    if (capacity <= 2) {
      return `
        <svg width="36" height="30" viewBox="0 0 44 36" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="11" width="6" height="14" rx="2"/>
          <rect x="35" y="11" width="6" height="14" rx="2"/>
          <rect x="12" y="7" width="20" height="22" rx="4" fill="#FFFFFF"/>
        </svg>
      `;
    }
    if (capacity <= 4) {
      return `
        <svg width="40" height="32" viewBox="0 0 48 38" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="14" y="2" width="8" height="4" rx="1.5"/>
          <rect x="26" y="2" width="8" height="4" rx="1.5"/>
          <rect x="14" y="32" width="8" height="4" rx="1.5"/>
          <rect x="26" y="32" width="8" height="4" rx="1.5"/>
          <rect x="10" y="8" width="28" height="22" rx="4" fill="#FFFFFF"/>
        </svg>
      `;
    }
    return `
      <svg width="44" height="32" viewBox="0 0 54 38" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="11" y="2" width="8" height="4" rx="1.5"/>
        <rect x="23" y="2" width="8" height="4" rx="1.5"/>
        <rect x="35" y="2" width="8" height="4" rx="1.5"/>
        <rect x="11" y="32" width="8" height="4" rx="1.5"/>
        <rect x="23" y="32" width="8" height="4" rx="1.5"/>
        <rect x="35" y="32" width="8" height="4" rx="1.5"/>
        <rect x="8" y="8" width="38" height="22" rx="5" fill="#FFFFFF"/>
      </svg>
    `;
  }

  function showToast(message, isWarning) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg' + (isWarning ? ' toast-warn' : '');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3400);
  }

  function flashSyncBadge(sourceText) {
    const badge = document.getElementById('live-sync-badge');
    const textEl = document.getElementById('live-sync-text');
    if (!badge || !textEl) return;
    badge.classList.add('sync-flash');
    textEl.textContent = 'Sincronización en vivo (< 3s) - RNF-03 • En línea';
    if (sourceText) {
      badge.title = `Último evento sincronizado: ${sourceText}`;
    }
    setTimeout(function () {
      badge.classList.remove('sync-flash');
      textEl.textContent = 'Sincronización en vivo (< 3s) - RNF-03';
    }, 1500);
  }

  // --- Navegación SPA sin Recarga ---

  function navigateToScreen(screenCode, skipHashUpdate) {
    if (!SCREEN_META[screenCode]) return;
    const targetRole = SCREEN_META[screenCode].role;
    ui.currentRole = targetRole;
    ui.currentScreen = screenCode;
    ui.lastScreenByRole[targetRole] = screenCode;

    if (!skipHashUpdate) {
      try {
        window.history.replaceState(null, '', `#${screenCode}`);
      } catch (_) {}
    }

    if (screenCode === 'P-02') {
      ensureValidSelectedTableInDraft();
    }

    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function switchRole(role) {
    if (!['client', 'staff', 'admin'].includes(role)) return;
    ui.currentRole = role;
    const screen = ui.lastScreenByRole[role] || (role === 'client' ? 'P-01' : role === 'staff' ? 'P-06' : 'P-08');
    navigateToScreen(screen);
  }

  function ensureValidSelectedTableInDraft() {
    const d = ui.reservationDraft;
    const currentInfo = d.selectedTableId
      ? store.getTableDetailedState(d.date, d.timeBlockId, d.selectedTableId)
      : null;

    const currentValid =
      currentInfo &&
      currentInfo.customerStatus === 'available' &&
      currentInfo.table.capacity >= d.guests;

    if (currentValid) return;

    const candidate = BASE_TABLES.find(function (t) {
      if (t.isWalkInOnly || t.capacity < d.guests) return false;
      const st = store.getTableDetailedState(d.date, d.timeBlockId, t.id);
      return st && st.customerStatus === 'available';
    });

    d.selectedTableId = candidate ? candidate.id : null;
  }

  // ==========================================================================
  // RENDERIZADO GLOBAL
  // ==========================================================================

  function renderAll() {
    renderHeaderAndMobileNav();
    const root = document.getElementById('app-root');
    if (!root) return;

    if (ui.currentRole === 'client') {
      root.innerHTML = renderClientView();
    } else if (ui.currentRole === 'staff') {
      root.innerHTML = renderStaffView();
    } else {
      root.innerHTML = renderAdminView();
    }

    renderModals();
  }

  function renderHeaderAndMobileNav() {
    const s = store.getState();
    const cartTotals = store.getCartTotals();
    const activeOrdersCount = s.orders.filter(function (o) {
      return o.stepIndex < 3 && o.b2bApprovalStatus !== 'rejected';
    }).length;
    const pendingCheckinsCount = s.reservations.filter(function (r) {
      return r.status === 'reserved';
    }).length;
    const pendingB2BCount = s.orders.filter(function (o) {
      return o.modality === 'b2b' && o.b2bApprovalStatus === 'pending';
    }).length;

    // Role Switcher
    document.querySelectorAll('[data-role-switch]').forEach(function (btn) {
      const r = btn.getAttribute('data-role-switch');
      btn.classList.toggle('active', r === ui.currentRole);
    });

    const staffBadge = document.getElementById('badge-role-staff');
    if (staffBadge) staffBadge.textContent = String(activeOrdersCount + pendingCheckinsCount);

    const adminBadge = document.getElementById('badge-role-admin');
    if (adminBadge) adminBadge.textContent = String(pendingB2BCount);

    // Quick Screen Strip P-01 .. P-08
    const jumpContainer = document.getElementById('screen-jump-list');
    if (jumpContainer) {
      jumpContainer.innerHTML = Object.keys(SCREEN_META)
        .map(function (code) {
          const meta = SCREEN_META[code];
          const isActive = ui.currentScreen === code;
          let countLabel = '';
          if (code === 'P-04' && cartTotals.totalUnits > 0) countLabel = ` (${cartTotals.totalUnits})`;
          return `
            <button type="button" class="screen-pill ${isActive ? 'active' : ''}" data-nav-screen="${code}">
              <strong>${code}</strong>
              <span>${escapeHtml(meta.short)}${countLabel}</span>
            </button>
          `;
        })
        .join('');
    }

    // Contextual Main Brand Bar Nav
    const headerNav = document.getElementById('header-context-nav');
    if (headerNav) {
      if (ui.currentRole === 'client') {
        const isBooking = ui.currentScreen === 'P-02' || ui.currentScreen === 'P-03';
        headerNav.innerHTML = `
          <div class="desktop-only-nav" style="display:flex; align-items:center; gap:6px;">
            <button type="button" class="header-nav-link ${ui.currentScreen === 'P-01' ? 'active' : ''}" data-nav-screen="P-01">
              Menú y Café
            </button>
            <button type="button" class="header-nav-link ${isBooking ? 'active' : ''}" data-nav-screen="P-02">
              Reservar Mesa
            </button>
            <button type="button" class="header-nav-link ${ui.currentScreen === 'P-05' ? 'active' : ''}" data-nav-screen="P-05">
              Seguimiento
            </button>
          </div>
          <button type="button" class="header-cart-pill" data-nav-screen="P-04">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span>${cartTotals.totalUnits}</span>
            <span style="opacity:0.9; font-weight:500;">• $${cartTotals.totalAmount.toFixed(2)}</span>
          </button>
        `;
      } else if (ui.currentRole === 'staff') {
        headerNav.innerHTML = `
          <button type="button" class="header-nav-link ${ui.currentScreen === 'P-06' ? 'active' : ''}" data-nav-screen="P-06">
            Salón y Check-in (${pendingCheckinsCount})
          </button>
          <button type="button" class="header-nav-link ${ui.currentScreen === 'P-07' ? 'active' : ''}" data-nav-screen="P-07">
            Cola Pedidos (${activeOrdersCount})
          </button>
        `;
      } else {
        headerNav.innerHTML = `
          <span class="header-nav-link active" style="cursor:default;">
            Panel Ejecutivo B2B (${pendingB2BCount} pendientes)
          </span>
        `;
      }
    }

    // Mobile Bottom Navigation Bar (App Nativa en pantallas <= 768px)
    const mobNav = document.getElementById('mobile-bottom-nav');
    if (document.body && document.body.classList) {
      document.body.classList.toggle('has-mobile-nav', ui.currentRole === 'client');
    }
    if (mobNav) {
      if (ui.currentRole === 'client') {
        mobNav.classList.add('visible');
        const isRes = ui.currentScreen === 'P-02' || ui.currentScreen === 'P-03';
        mobNav.innerHTML = `
          <button type="button" class="mob-nav-btn ${ui.currentScreen === 'P-01' ? 'active' : ''}" data-nav-screen="P-01">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>
            <span>Menú</span>
          </button>
          <button type="button" class="mob-nav-btn ${isRes ? 'active' : ''}" data-nav-screen="P-02">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>Reservar</span>
          </button>
          <button type="button" class="mob-nav-btn ${ui.currentScreen === 'P-04' ? 'active' : ''}" data-nav-screen="P-04">
            ${cartTotals.totalUnits > 0 ? `<span class="mob-nav-badge">${cartTotals.totalUnits}</span>` : ''}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Carrito</span>
          </button>
          <button type="button" class="mob-nav-btn ${ui.currentScreen === 'P-05' ? 'active' : ''}" data-nav-screen="P-05">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Orden</span>
          </button>
        `;
      } else {
        mobNav.classList.remove('visible');
        mobNav.innerHTML = '';
      }
    }
  }

  // ==========================================================================
  // BLOQUE A: VISTA CLIENTE FLUIDA Y RESPONSIVA (P-01 A P-05)
  // ==========================================================================

  function renderClientView() {
    switch (ui.currentScreen) {
      case 'P-01':
        return `<div class="container">${renderScreenP01()}</div>`;
      case 'P-02':
        return `<div class="container">${renderScreenP02()}</div>`;
      case 'P-03':
        return `<div class="container">${renderScreenP03()}</div>`;
      case 'P-04':
        return `<div class="container">${renderScreenP04()}</div>`;
      case 'P-05':
        return `<div class="container">${renderScreenP05()}</div>`;
      default:
        return `<div class="container">${renderScreenP01()}</div>`;
    }
  }

  // --- P-01: Home, Galería Real, Catálogo con Trazabilidad y Cultura ---
  function renderScreenP01() {
    const categories = ['Todos', 'Bebidas de Barra', 'Pastelería', 'Café en Grano (Libras)'];
    const filteredItems = CATALOG_ITEMS.filter(function (item) {
      if (ui.catalogCategory === 'Todos') return true;
      return item.category === ui.catalogCategory;
    });
    const cartTotals = store.getCartTotals();

    return `
      <section aria-labelledby="p01-heading">
        <!-- Hero Inmersivo de 2 Columnas con Mosaico Real del Local -->
        <div class="hero-showcase">
          <div>
            <div class="top59-badge">
              ${ICONS.award}
              <span>#59 en el Top 100 Mejores Cafeterías de Latinoamérica y el Caribe</span>
            </div>
            <h1 id="p01-heading" class="hero-headline">
              Café de especialidad salvadoreño con origen 100% trazable.
            </h1>
            <p class="hero-lead">
              Visítanos frente al Parque Libertad en el Centro Histórico de San Salvador.
              Reserva tu mesa en tiempo real, vive la experiencia de métodos filtrados o programa tu pedido Pick-up y Mayorista B2B.
            </p>

            <!-- Botones Segmentados Principales -->
            <div class="hero-cta-group" role="group" aria-label="Acciones principales">
              <button type="button" class="hero-cta-primary" data-nav-screen="P-02">
                ${ICONS.calendar}
                <span>Reservar Mesa</span>
                ${ICONS.arrowRight}
              </button>
              <button type="button" class="hero-cta-secondary" data-action="focus-catalog-or-cart">
                ${ICONS.shoppingBag}
                <span>Catálogo Pick-up / B2B</span>
              </button>
              <button type="button" class="hero-cta-secondary" data-nav-screen="P-05">
                ${ICONS.clock}
                <span>Seguimiento de Orden</span>
              </button>
            </div>

            <div class="hero-metrics-row">
              <div>
                <strong>SCA 87.5+</strong>
                <span>Granos de especialidad</span>
              </div>
              <div>
                <strong>5 Cordilleras</strong>
                <span>Fincas salvadoreñas</span>
              </div>
              <div>
                <strong>Sin Filas</strong>
                <span>Reserva y Pick-up digital</span>
              </div>
            </div>
          </div>

          <!-- Bento Mosaico con las Fotografías Reales del Local (Clic para ampliar) -->
          <div class="hero-photo-bento" aria-label="Galería fotográfica real de Café del Centro">
            <button type="button" class="bento-photo-btn tall" data-open-lightbox="0">
              <img src="${IMAGES.exterior}" alt="Fachada real de Café del Centro en el Centro Histórico" />
              <span class="bento-caption">
                <span>Fachada Centro Histórico</span>
                ${ICONS.maximize}
              </span>
            </button>
            <button type="button" class="bento-photo-btn" data-open-lightbox="1">
              <img src="${IMAGES.tazas}" alt="Tazas negras mate con arte latte de Café del Centro" />
              <span class="bento-caption">
                <span>Arte Latte de Autor</span>
                ${ICONS.maximize}
              </span>
            </button>
            <button type="button" class="bento-photo-btn" data-open-lightbox="2">
              <img src="${IMAGES.preparacion}" alt="Preparación de método filtrado en barra" />
              <span class="bento-caption">
                <span>Métodos en Mesa • Ver 5 fotos</span>
                ${ICONS.maximize}
              </span>
            </button>
          </div>
        </div>

        <!-- Franja de Pilares de Experiencia Real -->
        <div class="pillars-strip">
          <div class="pillar-card">
            <div class="pillar-icon">${ICONS.leaf}</div>
            <div>
              <strong style="font-size:0.86rem; display:block;">Trazabilidad Completa</strong>
              <span style="font-size:0.76rem; color:var(--md-sys-color-on-surface-muted);">Finca, caficultor, proceso y tueste</span>
            </div>
          </div>
          <div class="pillar-card">
            <div class="pillar-icon">${ICONS.layoutGrid}</div>
            <div>
              <strong style="font-size:0.86rem; display:block;">Aforo Inteligente 80/20</strong>
              <span style="font-size:0.76rem; color:var(--md-sys-color-on-surface-muted);">Reserva digital + cuota Walk-in</span>
            </div>
          </div>
          <div class="pillar-card">
            <div class="pillar-icon">${ICONS.coffee}</div>
            <div>
              <strong style="font-size:0.86rem; display:block;">Barismo en Mesa (75m)</strong>
              <span style="font-size:0.76rem; color:var(--md-sys-color-on-surface-muted);">Extracción guiada V60 / Chemex</span>
            </div>
          </div>
          <div class="pillar-card">
            <div class="pillar-icon">${ICONS.packageBox}</div>
            <div>
              <strong style="font-size:0.86rem; display:block;">Tostaduría B2B Aliada</strong>
              <span style="font-size:0.76rem; color:var(--md-sys-color-on-surface-muted);">Lotes desde 5 lb en ventana dedicada</span>
            </div>
          </div>
        </div>

        <!-- Encabezado y Filtros del Catálogo (HU-09 | RF-04) -->
        <div id="catalog-anchor">
          <div class="section-head">
            <div>
              <span class="eyebrow-pill">Menú Artesanal & Tostaduría • P-01</span>
              <h2 style="font-size:clamp(1.35rem, 2.5vw, 1.8rem); margin:0;">Nuestra Carta y Café en Grano</h2>
            </div>
            <span style="font-family:var(--font-ubuntu); font-size:0.84rem; font-weight:700; color:var(--md-sys-color-primary);">
              Mostrando ${filteredItems.length} de ${CATALOG_ITEMS.length} especialidades
            </span>
          </div>

          <div class="chip-carousel" role="tablist" aria-label="Filtrar catálogo por categoría">
            ${categories
              .map(function (cat) {
                const active = ui.catalogCategory === cat;
                return `
                  <button type="button" class="md3-chip ${active ? 'active' : ''}" data-cat-filter="${escapeHtml(cat)}">
                    ${escapeHtml(cat)}
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- Cuadrícula Responsiva de Productos con Fotografía Dedicada -->
        <div class="catalog-grid">
          ${filteredItems.map(renderProductCard).join('')}
        </div>

        <!-- Barra Flotante de Acceso al Checkout (P-04) -->
        ${
          cartTotals.totalUnits > 0
            ? `
              <div class="sticky-cart-dock">
                <div>
                  <div style="font-weight:700; font-size:0.9rem;">
                    Tu orden: ${cartTotals.totalUnits} producto(s) ${cartTotals.grainLbs > 0 ? `• ${cartTotals.grainLbs} lb café` : ''}
                  </div>
                  <div style="font-size:0.78rem; color:rgba(255,255,255,0.82);">
                    Subtotal: $${cartTotals.totalAmount.toFixed(2)} • Listo para Pick-up o B2B
                  </div>
                </div>
                <button type="button" class="btn-tertiary" data-nav-screen="P-04" style="padding:10px 18px;">
                  <span>Ver Carrito (P-04)</span>
                  ${ICONS.arrowRight}
                </button>
              </div>
            `
            : ''
        }

        <!-- Bloque Educativo Inferior Oficial (DESIGN.md P-01) -->
        <article class="heritage-editorial" aria-labelledby="edu-title">
          <div class="heritage-gallery">
            <img src="${IMAGES.tazas}" alt="Tazas artesanales de Café del Centro con arte latte" loading="lazy" />
            <img src="${IMAGES.mesas}" alt="Salón interior con mapas de las regiones cafetaleras de El Salvador" loading="lazy" />
          </div>
          <div class="heritage-copy">
            <span class="top59-badge" style="align-self:flex-start;">
              ${ICONS.leafSm}
              <span>Cultura de Especialidad • San Salvador</span>
            </span>
            <h2 id="edu-title">¿QUÉ ES UN CAFÉ DE ESPECIALIDAD?</h2>
            <p>
              Celebramos la herencia cafetalera del Centro Histórico de San Salvador frente al Parque Libertad.
              Trabajamos con granos de puntuación superior, provenientes de fincas específicas y variedades
              cultivadas en nuestras cordilleras. Cuando nos visitas, conoces el nombre del caficultor,
              del tostador y del barista detrás de tu taza.
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:10px;">
              <button type="button" class="hero-cta-primary" data-action="request-table-method" style="padding:10px 18px; font-size:0.84rem;">
                <span>Reservar Método Guiado en Mesa</span>
                ${ICONS.arrowRight}
              </button>
              <button type="button" class="hero-cta-secondary" data-open-lightbox="4" style="padding:10px 16px; font-size:0.84rem;">
                ${ICONS.camera}
                <span>Explorar Fotos del Salón</span>
              </button>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  function renderProductCard(item) {
    const statusBadgeClass = item.available ? 'status-available' : 'status-unavailable';
    const selectedWeight = ui.grainSelectedWeightByItem[item.id] || 1;

    const flavorPillsHtml = Array.isArray(item.flavorNotes)
      ? `
        <div class="flavor-tags-row">
          ${item.flavorNotes
            .map(function (note) {
              return `<span class="flavor-pill">${escapeHtml(note)}</span>`;
            })
            .join('')}
        </div>
      `
      : '';

    const traceabilityHtml = item.traceability
      ? `
        <div class="traceability-panel">
          <div class="traceability-header">
            ${ICONS.leafSm}
            <span>Ficha de Origen y Trazabilidad</span>
          </div>
          <div class="traceability-grid">
            <div><strong>Finca:</strong> ${escapeHtml(item.traceability.finca)}</div>
            <div><strong>Caficultor:</strong> ${escapeHtml(item.traceability.caficultor)}</div>
            <div><strong>Proceso:</strong> ${escapeHtml(item.traceability.proceso)}</div>
            <div><strong>Variedad:</strong> ${escapeHtml(item.traceability.variedad)}</div>
            <div style="grid-column: 1 / -1;"><strong>Tostador:</strong> ${escapeHtml(item.traceability.tostador)}</div>
          </div>
        </div>
      `
      : '';

    let actionControlsHtml = '';
    if (!item.available) {
      actionControlsHtml = `
        <button type="button" class="btn-disabled-stock" disabled aria-disabled="true">
          ${ICONS.slashCircle}
          <span>No disponible (Agotado)</span>
        </button>
      `;
    } else if (item.isTableExperience) {
      actionControlsHtml = `
        <button type="button" class="btn-tertiary w-full" data-action="request-table-method">
          <span>Solicitar Método en Mesa (75 min)</span>
          ${ICONS.arrowRight}
        </button>
      `;
    } else if (item.isGrain) {
      actionControlsHtml = `
        <select class="weight-select" aria-label="Peso para ${escapeHtml(item.shortName)}" data-grain-weight-select="${item.id}">
          <option value="1" ${selectedWeight === 1 ? 'selected' : ''}>1 lb ($${item.price.toFixed(2)})</option>
          <option value="5" ${selectedWeight === 5 ? 'selected' : ''}>5 lb B2B ($${(item.price * 5).toFixed(2)})</option>
        </select>
        <button type="button" class="btn-tertiary btn-add-grain" data-add-cart="${item.id}">
          ${ICONS.plus}
          <span>Agregar</span>
        </button>
      `;
    } else {
      actionControlsHtml = `
        <button type="button" class="btn-tertiary w-full" data-add-cart="${item.id}">
          ${ICONS.plus}
          <span>Agregar al Pedido</span>
        </button>
      `;
    }

    return `
      <article class="product-card ${!item.available ? 'out-of-stock' : ''}">
        <div class="product-img-wrap">
          <img src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy" />
          <div class="product-overlay-top">
            <span class="status-badge ${statusBadgeClass}">
              ${item.available ? ICONS.checkCircle : ICONS.slashCircle}
              <span>${escapeHtml(item.statusLabel)}</span>
            </span>
          </div>
          <span class="product-price-float">$${item.price.toFixed(2)}${item.isGrain ? ' / lb' : ''}</span>
        </div>

        <div class="product-content">
          <span class="product-cat-label">${escapeHtml(item.category)}</span>
          <h3 class="product-title">${escapeHtml(item.name)}</h3>
          <p class="product-desc">${escapeHtml(item.description)}</p>
          ${flavorPillsHtml}
          ${traceabilityHtml}
          <div class="product-card-footer">
            ${actionControlsHtml}
          </div>
        </div>
      </article>
    `;
  }

  // --- P-02: Plano Arquitectónico de 8 Mesas + Asistente en 4 Pasos ---
  function renderScreenP02() {
    const d = ui.reservationDraft;
    const today = getISODateOffset(0);
    const tomorrow = getISODateOffset(1);
    const baristaCheck = store.checkSpecialistBaristaAvailability(d.date, d.timeBlockId);
    const isBarismo = d.modality === 'barismo';

    return `
      <section aria-labelledby="p02-heading">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">Reserva Digital sin Filas • P-02 (Máx. 4 Pasos — RNF-01)</span>
            <h1 id="p02-heading" style="font-size:clamp(1.4rem, 2.8vw, 2rem); margin:0;">
              Mapa de Disponibilidad y Reserva de Mesa
            </h1>
          </div>
          <button type="button" class="btn-outline" data-nav-screen="P-01">
            ${ICONS.arrowLeft}
            <span>Volver al Menú</span>
          </button>
        </div>

        <div class="booking-split-layout">
          <!-- COLUMNA IZQUIERDA: Plano Arquitectónico Interactivo de las 8 Mesas -->
          <div class="floorplan-blueprint">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
              <div>
                <h2 style="font-size:1.15rem; margin:0 0 3px;">Plano en Vivo del Salón (${escapeHtml(getBlockLabel(d.timeBlockId))})</h2>
                <span style="font-size:0.8rem; color:var(--md-sys-color-on-surface-muted);">
                  ${escapeHtml(formatFriendlyDate(d.date))} • Habilitando mesas para <strong>${d.guests} ${d.guests === 1 ? 'comensal' : 'comensales'}</strong>
                </span>
              </div>
              <button type="button" class="btn-outline" style="padding:7px 13px; font-size:0.78rem;" data-open-lightbox="4">
                ${ICONS.camera}
                <span>Ver foto real del salón</span>
              </button>
            </div>

            <!-- Leyenda Accesible (Color + Icono SVG + Texto Explícito — HU-01) -->
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
              <span class="status-badge status-available">${ICONS.checkCircle}<span>Disponible</span></span>
              <span class="status-badge status-reserved">${ICONS.clock}<span>Reservada</span></span>
              <span class="status-badge status-occupied">${ICONS.userOccupied}<span>Ocupada</span></span>
              <span class="status-badge status-walkin">${ICONS.lock}<span>Exclusivo Walk-in 20% - RN-01</span></span>
            </div>

            <div class="floorplan-zones-banner">
              <span class="inline-icon-text">${ICONS.doorOpen}<span>Acceso Frente a Parque Libertad</span></span>
              <span class="inline-icon-text">${ICONS.coffeeSm}<span>Barra de Especialidad y Métodos V60</span></span>
            </div>

            <!-- Cuadrícula Arquitectónica de 8 Mesas -->
            <div class="tables-floor-grid">
              ${BASE_TABLES.map(function (t) {
                const info = store.getTableDetailedState(d.date, d.timeBlockId, t.id);
                const hasCapacity = t.capacity >= d.guests;
                const isSelectable = info.customerStatus === 'available' && hasCapacity;
                const isSelected = d.selectedTableId === t.id && isSelectable;

                let stateClass = 'state-available';
                let badgeClass = 'status-available';
                let statusIcon = ICONS.checkCircle;
                if (info.customerStatus === 'reserved') {
                  stateClass = 'state-reserved';
                  badgeClass = 'status-reserved';
                  statusIcon = ICONS.clock;
                } else if (info.customerStatus === 'occupied') {
                  stateClass = 'state-occupied';
                  badgeClass = 'status-occupied';
                  statusIcon = ICONS.userOccupied;
                } else if (info.customerStatus === 'walkin' || info.customerStatus === 'blocked') {
                  stateClass = 'state-walkin';
                  badgeClass = 'status-walkin';
                  statusIcon = ICONS.lock;
                }

                return `
                  <button
                    type="button"
                    class="table-card-visual ${stateClass} ${isSelected ? 'selected-table' : ''} ${!hasCapacity && info.customerStatus === 'available' ? 'insufficient-cap' : ''}"
                    data-select-table="${t.id}"
                    ${!isSelectable ? 'disabled' : ''}
                  >
                    <div class="table-furniture-graphic">
                      <div>
                        <strong style="font-size:1.02rem; display:block; color:var(--md-sys-color-on-surface);">${escapeHtml(t.name)}</strong>
                        <span style="font-size:0.75rem; color:var(--md-sys-color-on-surface-muted);">${escapeHtml(t.zone)}</span>
                      </div>
                      <div class="table-svg-icon">
                        ${renderTableSvgGraphic(t.capacity)}
                      </div>
                    </div>

                    <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:6px; margin-top:4px;">
                      <span class="status-badge ${badgeClass}">${statusIcon}<span>${escapeHtml(info.customerLabel)}</span></span>
                      <span style="font-family:var(--font-ubuntu); font-size:0.75rem; font-weight:700;">
                        Capacidad: ${t.capacity} pers.
                      </span>
                    </div>

                    ${
                      !hasCapacity && info.customerStatus === 'available'
                        ? `<small style="color:var(--status-occupied); font-weight:600; font-size:0.73rem;">Capacidad insuficiente (requiere ≥ ${d.guests})</small>`
                        : isSelected
                        ? `<small class="inline-icon-text" style="color:var(--status-available); font-weight:700; font-size:0.75rem;">${ICONS.check}<span>Seleccionada para tu visita</span></small>`
                        : ''
                    }
                  </button>
                `;
              }).join('')}
            </div>

            ${d.errors.table ? `<div class="field-error-msg" style="margin-top:10px;">${escapeHtml(d.errors.table)}</div>` : ''}
          </div>

          <!-- COLUMNA DERECHA: Configurador Guiado en 4 Pasos -->
          <div class="booking-steps-panel">
            <!-- Paso 1 -->
            <div class="step-box">
              <div class="step-box-header">
                <span class="step-badge-num">1</span>
                <h3 style="margin:0; font-size:1rem;">Fecha y Cantidad de Personas</h3>
              </div>
              <div class="form-grid-2">
                <div>
                  <label class="field-label" for="res-date-input">Fecha</label>
                  <input id="res-date-input" type="date" class="md3-input" min="${today}" value="${escapeHtml(d.date)}" data-res-field="date" />
                  <div style="display:flex; gap:6px; margin-top:6px;">
                    <button type="button" class="md3-chip ${d.date === today ? 'active' : ''}" style="padding:4px 10px; font-size:0.73rem;" data-res-quick-date="${today}">Hoy</button>
                    <button type="button" class="md3-chip ${d.date === tomorrow ? 'active' : ''}" style="padding:4px 10px; font-size:0.73rem;" data-res-quick-date="${tomorrow}">Mañana</button>
                  </div>
                </div>
                <div>
                  <span class="field-label" style="display:block; margin-bottom:5px;">Comensales (1 a 6)</span>
                  <div class="guest-stepper">
                    <button type="button" class="stepper-btn" data-guest-delta="-1" ${d.guests <= 1 ? 'disabled' : ''} aria-label="Menos personas">${ICONS.minus}</button>
                    <strong style="font-family:var(--font-ubuntu); font-size:0.95rem;">${d.guests} pers.</strong>
                    <button type="button" class="stepper-btn" data-guest-delta="1" ${d.guests >= 6 ? 'disabled' : ''} aria-label="Más personas">${ICONS.plus}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Paso 2 -->
            <div class="step-box">
              <div class="step-box-header">
                <span class="step-badge-num">2</span>
                <h3 style="margin:0; font-size:1rem;">Bloque Horario (RN-01)</h3>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:8px;">
                ${TIME_BLOCKS.map(function (block) {
                  const evalStatus = store.evaluateTimeBlockStatus(d.date, block.id);
                  const isSelected = d.timeBlockId === block.id;
                  const isBlockedOrCap = !evalStatus.available;
                  let labelText = block.chipLabel || block.label;
                  if (evalStatus.reason === 'admin_block') {
                    labelText = `${block.shortLabel} (Evento)`;
                  }
                  return `
                    <button
                      type="button"
                      class="md3-chip ${isSelected ? 'active' : ''} ${isBlockedOrCap && !isSelected ? 'chip-warning' : ''}"
                      style="padding:7px 13px; font-size:0.8rem;"
                      data-select-timeblock="${block.id}"
                    >
                      ${isBlockedOrCap ? ICONS.alertTriangle : ICONS.clock}
                      <span>${escapeHtml(labelText)}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Paso 3 -->
            <div class="step-box">
              <div class="step-box-header">
                <span class="step-badge-num">3</span>
                <h3 style="margin:0; font-size:1rem;">Modalidad de Experiencia (RN-03)</h3>
              </div>

              <div style="display:grid; gap:10px;">
                <button type="button" class="experience-radio-card ${!isBarismo ? 'selected' : ''}" data-select-modality="estandar">
                  <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; flex-wrap:wrap;">
                    <strong class="inline-icon-text">${!isBarismo ? ICONS.radioOn : ICONS.radioOff}<span>Consumo Estándar</span></strong>
                    <span class="duration-pill">Duración asignada: 45 minutos</span>
                  </div>
                  <span style="font-size:0.79rem; color:var(--md-sys-color-on-surface-muted);">
                    Bebidas de barra de especialidad, fríos y pastelería recién horneada.
                  </span>
                </button>

                <button type="button" class="experience-radio-card ${isBarismo ? 'selected barismo-selected' : ''}" data-select-modality="barismo">
                  <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:8px; flex-wrap:wrap;">
                    <strong class="inline-icon-text" style="color:var(--md-sys-color-tertiary);">
                      ${isBarismo ? ICONS.radioOn : ICONS.radioOff}
                      <span>Experiencia Educativa de Barismo (Métodos en Mesa)</span>
                    </strong>
                    <span class="duration-pill barismo-pill">Duración asignada: 75 minutos</span>
                  </div>
                  <span style="font-size:0.79rem; color:var(--md-sys-color-on-surface-muted);">
                    Extracción V60 / Chemex en tu mesa con historia de la finca y caficultor.
                  </span>

                  ${
                    isBarismo
                      ? baristaCheck.available
                        ? `
                          <div class="inline-icon-text" style="margin-top:4px; background:#FFFFFF; border:1.5px solid var(--md-sys-color-tertiary); border-radius:10px; padding:8px 11px; font-size:0.8rem; font-weight:700; color:var(--md-sys-color-tertiary);">
                            ${ICONS.checkCircle}
                            <span>RN-03 Activa: 75 minutos • Barista asignado: ${escapeHtml(baristaCheck.baristaName)}</span>
                          </div>
                        `
                        : `
                          <div class="rule-alert-banner" style="margin:6px 0 0; padding:12px;">
                            <h4 style="font-size:0.88rem;">${ICONS.alertTriangle}<span>Barista especialista ocupado en este bloque</span></h4>
                            <p style="font-size:0.78rem; margin-bottom:8px;">Alejandro Sura ya atiende una sesión en este horario.</p>
                            ${
                              baristaCheck.suggestedSlot
                                ? `<span class="rule-alert-cta" data-apply-suggested-barista-slot="${baristaCheck.suggestedSlot.id}">
                                    <span>Cambiar a ${escapeHtml(baristaCheck.suggestedSlot.label)}</span>
                                    ${ICONS.arrowRight}
                                  </span>`
                                : ''
                            }
                          </div>
                        `
                      : ''
                  }
                </button>
              </div>
            </div>

            <!-- Paso 4 -->
            <div class="step-box" style="background:var(--md-sys-color-surface-container);">
              <div class="step-box-header">
                <span class="step-badge-num">4</span>
                <h3 style="margin:0; font-size:1rem;">Datos del Titular y Confirmación</h3>
              </div>

              <div class="field-group">
                <label class="field-label" for="res-customer-name">Tu nombre completo *</label>
                <input
                  id="res-customer-name"
                  type="text"
                  class="md3-input ${d.errors.customerName ? 'input-error' : ''}"
                  style="background:#FFFFFF;"
                  placeholder="Ej. Camila Figueroa"
                  value="${escapeHtml(d.customerName)}"
                  data-res-field="customerName"
                />
                ${d.errors.customerName ? `<span class="field-error-msg">${escapeHtml(d.errors.customerName)}</span>` : ''}
              </div>

              <div style="background:rgba(255,255,255,0.78); border-radius:12px; padding:10px 13px; margin-bottom:12px; font-size:0.8rem;">
                <strong>Resumen:</strong> ${d.selectedTableId ? `Mesa ${d.selectedTableId}` : 'Elige mesa'} •
                ${d.guests} pers. • ${escapeHtml(getBlockLabel(d.timeBlockId))} •
                <strong>${isBarismo ? '75 min (Alejandro Sura)' : '45 min'}</strong>
              </div>

              <button
                type="button"
                class="btn-primary w-full"
                data-action="confirm-reservation"
                ${isBarismo && !baristaCheck.available ? 'disabled' : ''}
              >
                <span>Confirmar Reserva</span>
                ${ICONS.arrowRight}
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // --- P-03: Pase Digital de Confirmación de Reserva (Wallet Pass + RN-02) ---
  function renderScreenP03() {
    const s = store.getState();
    const res =
      s.reservations.find(function (r) { return r.id === s.activeClientReservationId; }) ||
      s.reservations[0];

    if (!res) {
      return `
        <div class="md3-surface-card" style="text-align:center;">
          <h2>Aún no tienes reservas registradas</h2>
          <button type="button" class="btn-primary" data-nav-screen="P-02">Reservar una Mesa (P-02)</button>
        </div>
      `;
    }

    let statusBadgeHtml = `<span class="status-badge status-reserved">${ICONS.clock}<span>Reservada • Pendiente de Check-in</span></span>`;
    if (res.status === 'checked_in') {
      statusBadgeHtml = `<span class="status-badge status-available">${ICONS.checkCircle}<span>Check-in Registrado en Barra (${escapeHtml(res.checkInTime)})</span></span>`;
    } else if (res.status === 'no_show') {
      statusBadgeHtml = `<span class="status-badge status-occupied">${ICONS.xCircle}<span>Liberada por RN-02 (No presentó tras 15 min)</span></span>`;
    } else if (res.status === 'cancelled_by_event') {
      statusBadgeHtml = `<span class="status-badge status-occupied">${ICONS.alertTriangle}<span>Reprogramación por Evento (${escapeHtml(res.eventReason || '')})</span></span>`;
    }

    return `
      <section aria-labelledby="p03-heading" class="wallet-pass-wrap">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">Pase Digital de Reserva • P-03</span>
            <h1 id="p03-heading" style="font-size:1.65rem; margin:0;">¡Te esperamos en Café del Centro!</h1>
          </div>
          <button type="button" class="btn-outline" data-nav-screen="P-02">
            ${ICONS.plus}
            <span>Otra Reserva</span>
          </button>
        </div>

        <article class="wallet-ticket">
          <div class="wallet-ticket-top">
            <div>
              <div style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.08em; opacity:0.85;">Código de Reserva Oficial</div>
              <div style="font-family:var(--font-ubuntu); font-size:2rem; font-weight:700; line-height:1.1; margin:4px 0 10px;">
                ${escapeHtml(res.id)}
              </div>
              ${statusBadgeHtml}
            </div>
            <div class="wallet-qr-box" aria-label="Código QR de Check-in en Barra">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="#013542" aria-hidden="true">
                <rect x="4" y="4" width="20" height="20" rx="3" fill="none" stroke="#013542" stroke-width="4"/>
                <rect x="10" y="10" width="8" height="8"/>
                <rect x="40" y="4" width="20" height="20" rx="3" fill="none" stroke="#013542" stroke-width="4"/>
                <rect x="46" y="10" width="8" height="8"/>
                <rect x="4" y="40" width="20" height="20" rx="3" fill="none" stroke="#013542" stroke-width="4"/>
                <rect x="10" y="46" width="8" height="8"/>
                <rect x="30" y="30" width="8" height="8"/>
                <rect x="44" y="34" width="16" height="6"/>
                <rect x="32" y="46" width="10" height="14"/>
                <rect x="48" y="46" width="12" height="12"/>
              </svg>
            </div>
          </div>

          <div class="wallet-ticket-divider" aria-hidden="true">
            <div class="wallet-ticket-dash"></div>
          </div>

          <div class="wallet-ticket-body">
            <div class="wallet-meta-grid">
              <div>
                <small style="color:var(--md-sys-color-on-surface-muted); display:block;">Titular</small>
                <strong>${escapeHtml(res.customerName)}</strong>
              </div>
              <div>
                <small style="color:var(--md-sys-color-on-surface-muted); display:block;">Mesa y Comensales</small>
                <strong>Mesa ${res.tableId} (${res.guests} personas)</strong>
              </div>
              <div>
                <small style="color:var(--md-sys-color-on-surface-muted); display:block;">Fecha y Horario</small>
                <strong>${escapeHtml(formatFriendlyDate(res.date))} • ${escapeHtml(res.timeBlockLabel)}</strong>
              </div>
              <div>
                <small style="color:var(--md-sys-color-on-surface-muted); display:block;">Duración y Barista</small>
                <span class="duration-pill ${res.modality === 'barismo' ? 'barismo-pill' : ''}">${res.durationMinutes} min</span>
                <div style="font-size:0.8rem; margin-top:3px; font-weight:600;">${escapeHtml(res.barista)}</div>
              </div>
              <div style="grid-column: 1 / -1;">
                <small style="color:var(--md-sys-color-on-surface-muted); display:block;">Experiencia Seleccionada</small>
                <strong>${escapeHtml(res.modalityLabel)}</strong>
              </div>
            </div>

            <!-- Alerta Preventiva Obligatoria RN-02 -->
            <div class="rule-alert-banner" role="alert" style="margin:0 0 18px;">
              <h4>${ICONS.timer}<span>Aviso de Tolerancia de 15 Minutos (Regla RN-02)</span></h4>
              <p style="margin-bottom:0;">
                Tu reserva cuenta con <strong>15 minutos de tolerancia</strong> a partir de la hora seleccionada.
                Si transcurrido ese tiempo no se ha registrado tu <strong>Check-in en barra</strong>, el sistema liberará
                automáticamente la mesa a estado <strong>Disponible</strong>.
              </p>
            </div>

            <div style="display:flex; flex-wrap:wrap; gap:10px;">
              <button type="button" class="btn-primary" style="flex:1;" data-action="jump-staff-checkin">
                <span>Simular Llegada y Check-in en Barra (P-06)</span>
                ${ICONS.arrowRight}
              </button>
              <button type="button" class="btn-outline" data-nav-screen="P-01">
                Pre-ordenar Café o Pastelería
              </button>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  // --- P-04 & Alerta P-04.1: Carrito con Miniaturas y Checkout Pick-up / Mayorista B2B ---
  function renderScreenP04() {
    const cartTotals = store.getCartTotals();
    const activeWindows = store.getActiveLogisticsWindows();
    const isB2BTab = ui.checkoutTab === 'b2b';
    const tomorrowIso = getISODateOffset(1);

    const firstValidWin = activeWindows[0] || {
      id: 'win-fallback',
      name: 'Pre-Apertura',
      startTime: '07:00 AM',
      endTime: '08:30 AM'
    };
    const firstValidButtonLabel = `Aplicar primera ventana válida: Mañana ${firstValidWin.startTime} - ${firstValidWin.endTime}`;

    const isSelectedWindowAuthorized = activeWindows.some(function (w) {
      return w.id === ui.b2bDraft.windowChoice;
    });
    const isB2BDateValid = ui.b2bDraft.dateChoice !== 'today';
    const triggersRN04Alert = isB2BTab && (!isB2BDateValid || !isSelectedWindowAuthorized);

    return `
      <section aria-labelledby="p04-heading">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">Pedidos Externos sin Filas • P-04</span>
            <h1 id="p04-heading" style="font-size:clamp(1.4rem, 2.8vw, 2rem); margin:0;">
              Tu Carrito y Programación de Entrega
            </h1>
          </div>
          <button type="button" class="btn-outline" data-nav-screen="P-01">
            ${ICONS.plus}
            <span>Seguir Comprando</span>
          </button>
        </div>

        <div class="checkout-split-layout">
          <!-- COLUMNA IZQUIERDA: Resumen Visual del Carrito con Miniaturas Reales -->
          <div class="md3-surface-card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
              <h2 style="font-size:1.15rem; margin:0;">Detalle de Productos</h2>
              <span class="status-badge ${cartTotals.grainLbs >= 5 ? 'status-occupied' : 'status-available'}">
                ${ICONS.packageSm}
                <span>Café en grano: ${cartTotals.grainLbs} lb</span>
              </span>
            </div>

            ${
              cartTotals.items.length === 0
                ? `
                  <div style="text-align:center; padding:28px 16px; background:var(--md-sys-color-background); border-radius:16px;">
                    <p style="margin:0 0 14px; font-weight:600;">Tu carrito está vacío en este momento.</p>
                    <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px;">
                      <button type="button" class="btn-outline" data-quick-add="grain-pacamara:1">${ICONS.plus}<span>1 lb Pacamara (Pick-up)</span></button>
                      <button type="button" class="btn-tertiary" data-quick-add="grain-pacamara:5">${ICONS.plus}<span>5 lb Pacamara (Lote B2B)</span></button>
                    </div>
                  </div>
                `
                : `
                  <div style="display:grid; gap:12px; margin-bottom:18px;">
                    ${cartTotals.items
                      .map(function (it) {
                        return `
                          <div class="cart-item-row">
                            <img src="${it.image}" alt="${escapeHtml(it.name)}" class="cart-item-thumb" />
                            <div style="flex:1; min-width:140px;">
                              <strong style="font-size:0.92rem; display:block;">${escapeHtml(it.name)}</strong>
                              <span style="font-size:0.78rem; color:var(--md-sys-color-on-surface-muted);">
                                $${it.price.toFixed(2)} / ${escapeHtml(it.unit)} • Subtotal: <strong>$${it.lineTotal.toFixed(2)}</strong>
                              </span>
                            </div>
                            <div style="display:flex; align-items:center; gap:7px; margin-left:auto;">
                              <button type="button" class="stepper-btn" style="width:30px; height:30px;" data-cart-qty="${it.itemId}:${it.qty - 1}" aria-label="Restar">${ICONS.minus}</button>
                              <strong style="font-family:var(--font-ubuntu); min-width:36px; text-align:center; font-size:0.86rem;">
                                ${it.qty}${it.isGrain ? ' lb' : ''}
                              </strong>
                              <button type="button" class="stepper-btn" style="width:30px; height:30px;" data-cart-qty="${it.itemId}:${it.qty + 1}" aria-label="Sumar">${ICONS.plus}</button>
                            </div>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>

                  <div style="background:var(--md-sys-color-surface-container); border-radius:16px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.84rem; margin-bottom:6px;">
                      <span>Empaque con válvula desgasificadora</span>
                      <strong>Incluido</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:8px; border-top:1px solid rgba(25,44,61,0.18);">
                      <strong style="font-size:1rem;">Total del Pedido</strong>
                      <span style="font-family:var(--font-ubuntu); font-size:1.4rem; font-weight:700; color:var(--md-sys-color-primary);">
                        $${cartTotals.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                `
            }
          </div>

          <!-- COLUMNA DERECHA: Pestañas Pick-up Individual vs Mayorista B2B -->
          <div class="md3-surface-card">
            <div class="segmented-tabs" role="tablist">
              <button
                type="button"
                class="${!isB2BTab ? 'btn-primary' : 'btn-outline'}"
                style="border-radius:12px; padding:10px 12px; font-size:0.82rem; border:none;"
                data-checkout-tab="pickup"
              >
                ${ICONS.shoppingBag}
                <span>Pasar a Traer / Pick-up (&lt; 5 lb)</span>
              </button>
              <button
                type="button"
                class="${isB2BTab ? 'btn-primary' : 'btn-outline'}"
                style="border-radius:12px; padding:10px 12px; font-size:0.82rem; border:none;"
                data-checkout-tab="b2b"
              >
                ${ICONS.packageSm}
                <span>Mayorista / Marca B2B (≥ 5 lb)</span>
              </button>
            </div>

            ${!isB2BTab ? renderPickupForm(cartTotals) : renderB2BForm(cartTotals, activeWindows, triggersRN04Alert, firstValidWin, firstValidButtonLabel, tomorrowIso)}
          </div>
        </div>
      </section>
    `;
  }

  function renderPickupForm(cartTotals) {
    const p = ui.pickupDraft;
    const exceedsIndividualLimit = cartTotals.grainLbs >= 5;

    return `
      <div>
        <h3 style="font-size:1.08rem; margin:0 0 4px;">Retiro Express el Mismo Día (HU-10)</h3>
        <p style="font-size:0.82rem; color:var(--md-sys-color-on-surface-muted); margin:0 0 14px;">
          Tu café estará recién preparado y empacado en nuestra ventana de entrega rápida.
        </p>

        ${
          exceedsIndividualLimit
            ? `
              <div class="rule-alert-banner" role="alert">
                <h4>${ICONS.alertTriangle}<span>Volumen Mayorista Detectado (${cartTotals.grainLbs} lb ≥ 5 lb — RN-04)</span></h4>
                <p>
                  Los pedidos de 5 lb o más corresponden a despacho Mayorista B2B con anticipación mínima de 24h y ventana logística.
                </p>
                <button type="button" class="rule-alert-cta" data-checkout-tab="b2b">
                  <span>Continuar en Pestaña Mayorista B2B</span>
                  ${ICONS.arrowRight}
                </button>
              </div>
            `
            : ''
        }

        <div class="field-group">
          <label class="field-label" for="pk-name">Nombre completo *</label>
          <input
            id="pk-name"
            type="text"
            class="md3-input ${p.errors.customerName ? 'input-error' : ''}"
            placeholder="Ej. Ernesto Villalobos"
            value="${escapeHtml(p.customerName)}"
            data-pickup-field="customerName"
          />
          ${p.errors.customerName ? `<span class="field-error-msg">${escapeHtml(p.errors.customerName)}</span>` : ''}
        </div>

        <div class="form-grid-2">
          <div class="field-group">
            <label class="field-label" for="pk-phone">Teléfono de contacto *</label>
            <input
              id="pk-phone"
              type="tel"
              class="md3-input ${p.errors.phone ? 'input-error' : ''}"
              placeholder="Ej. 7890-1234"
              value="${escapeHtml(p.phone)}"
              data-pickup-field="phone"
            />
            ${p.errors.phone ? `<span class="field-error-msg">${escapeHtml(p.errors.phone)}</span>` : ''}
          </div>

          <div class="field-group">
            <label class="field-label" for="pk-time">Horario de retiro hoy *</label>
            <select id="pk-time" class="md3-input ${p.errors.pickupTime ? 'input-error' : ''}" data-pickup-field="pickupTime">
              <option value="" ${p.pickupTime === '' ? 'selected' : ''}>-- Seleccionar --</option>
              <option value="Hoy • En 20 min" ${p.pickupTime === 'Hoy • En 20 min' ? 'selected' : ''}>En 20 minutos (Express)</option>
              <option value="Hoy • 3:30 PM" ${p.pickupTime === 'Hoy • 3:30 PM' ? 'selected' : ''}>Hoy • 3:30 PM</option>
              <option value="Hoy • 4:30 PM" ${p.pickupTime === 'Hoy • 4:30 PM' ? 'selected' : ''}>Hoy • 4:30 PM</option>
              <option value="Hoy • 5:30 PM" ${p.pickupTime === 'Hoy • 5:30 PM' ? 'selected' : ''}>Hoy • 5:30 PM</option>
            </select>
            ${p.errors.pickupTime ? `<span class="field-error-msg">${escapeHtml(p.errors.pickupTime)}</span>` : ''}
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="pk-notes">Tipo de molienda o notas (opcional)</label>
          <input
            id="pk-notes"
            type="text"
            class="md3-input"
            placeholder="Ej. Grano entero / Molienda media para V60"
            value="${escapeHtml(p.notes)}"
            data-pickup-field="notes"
          />
        </div>

        <button
          type="button"
          class="btn-primary w-full"
          data-action="submit-pickup-order"
          ${cartTotals.items.length === 0 || exceedsIndividualLimit ? 'disabled' : ''}
        >
          <span>Confirmar Pedido Pick-up</span>
          ${ICONS.arrowRight}
        </button>
      </div>
    `;
  }

  function renderB2BForm(cartTotals, activeWindows, triggersRN04Alert, firstValidWin, firstValidButtonLabel, tomorrowIso) {
    const b = ui.b2bDraft;
    const needsMoreGrain = cartTotals.grainLbs < 5;

    return `
      <div>
        <h3 style="font-size:1.08rem; margin:0 0 4px;">Portal Mayorista / Marca Aliada B2B (HU-11 | RN-04)</h3>
        <p style="font-size:0.82rem; color:var(--md-sys-color-on-surface-muted); margin:0 0 14px;">
          Tueste bajo pedido desde 5 lb para cafeterías, hoteles y restaurantes aliados.
        </p>

        ${
          needsMoreGrain
            ? `
              <div style="background:var(--status-reserved-soft); border-left:4px solid var(--status-reserved); padding:12px 14px; border-radius:12px; margin-bottom:14px;">
                <div style="font-size:0.82rem; font-weight:700; margin-bottom:8px;">
                  Volumen actual en grano: ${cartTotals.grainLbs} lb (Mínimo mayorista B2B: 5 lb)
                </div>
                <button type="button" class="btn-tertiary" style="padding:8px 14px; font-size:0.78rem;" data-action="fill-b2b-minimum">
                  ${ICONS.plus}
                  <span>Completar lote mínimo de 5 lb (Café Pacamara)</span>
                </button>
              </div>
            `
            : ''
        }

        <div class="form-grid-2">
          <div class="field-group">
            <label class="field-label" for="b2b-brand">Marca Aliada / Empresa *</label>
            <input
              id="b2b-brand"
              type="text"
              class="md3-input ${b.errors.brandName ? 'input-error' : ''}"
              placeholder="Ej. Bistro Parque Libertad"
              value="${escapeHtml(b.brandName)}"
              data-b2b-field="brandName"
            />
            ${b.errors.brandName ? `<span class="field-error-msg">${escapeHtml(b.errors.brandName)}</span>` : ''}
          </div>

          <div class="field-group">
            <label class="field-label" for="b2b-contact">Contacto Responsable *</label>
            <input
              id="b2b-contact"
              type="text"
              class="md3-input ${b.errors.contactPerson ? 'input-error' : ''}"
              placeholder="Ej. Rodrigo Mena • 7744-8899"
              value="${escapeHtml(b.contactPerson)}"
              data-b2b-field="contactPerson"
            />
            ${b.errors.contactPerson ? `<span class="field-error-msg">${escapeHtml(b.errors.contactPerson)}</span>` : ''}
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="b2b-address">Dirección Comercial o Recolección *</label>
          <input
            id="b2b-address"
            type="text"
            class="md3-input ${b.errors.deliveryAddress ? 'input-error' : ''}"
            placeholder="Ej. Paseo General Escalón #412, San Salvador"
            value="${escapeHtml(b.deliveryAddress)}"
            data-b2b-field="deliveryAddress"
          />
          ${b.errors.deliveryAddress ? `<span class="field-error-msg">${escapeHtml(b.errors.deliveryAddress)}</span>` : ''}
        </div>

        <div class="form-grid-2">
          <div class="field-group">
            <label class="field-label" for="b2b-date-choice">Fecha de Despacho *</label>
            <select id="b2b-date-choice" class="md3-input" data-b2b-field="dateChoice">
              <option value="today" ${b.dateChoice === 'today' ? 'selected' : ''}>Hoy mismo (&lt; 24h — No permitido)</option>
              <option value="tomorrow" ${b.dateChoice === 'tomorrow' ? 'selected' : ''}>Mañana (${tomorrowIso} • ≥ 24h)</option>
              <option value="custom" ${b.dateChoice === 'custom' ? 'selected' : ''}>Fecha posterior (+48h)</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label" for="b2b-win-choice">Ventana Logística *</label>
            <select id="b2b-win-choice" class="md3-input" data-b2b-field="windowChoice">
              <option value="invalid_regular" ${b.windowChoice === 'invalid_regular' ? 'selected' : ''}>
                Horario público 02:00 PM - 04:00 PM (Fuera de ventana)
              </option>
              ${activeWindows
                .map(function (w) {
                  return `
                    <option value="${w.id}" ${b.windowChoice === w.id ? 'selected' : ''}>
                      ${escapeHtml(w.name)}: ${escapeHtml(w.startTime)} - ${escapeHtml(w.endTime)}
                    </option>
                  `;
                })
                .join('')}
            </select>
          </div>
        </div>

        <!-- ALERTA P-04.1: Disparador Regla RN-04 -->
        ${
          triggersRN04Alert
            ? `
              <div class="rule-alert-banner" role="alert" id="alert-p04-1">
                <h4>${ICONS.alertTriangle}<span>Alerta P-04.1 — Regla Logística Mayorista (RN-04)</span></h4>
                <p>
                  Los pedidos B2B (≥ 5 lb) exigen <strong>mínimo 24 horas de anticipación</strong> y despacho exclusivo en
                  <strong>ventanas logísticas autorizadas</strong> (Pre-apertura o Post-cierre) para proteger la atención en barra.
                </p>
                ${
                  activeWindows.length > 0
                    ? `
                      <button
                        type="button"
                        class="rule-alert-cta"
                        data-action="apply-first-valid-b2b-window"
                        data-win-id="${firstValidWin.id}"
                      >
                        ${ICONS.checkCircle}
                        <span>${escapeHtml(firstValidButtonLabel)}</span>
                      </button>
                    `
                    : `
                      <button type="button" class="rule-alert-cta" data-nav-screen="P-08">
                        <span>Habilitar ventana logística en Panel Admin (P-08)</span>
                        ${ICONS.arrowRight}
                      </button>
                    `
                }
              </div>
            `
            : `
              <div class="inline-icon-text" style="background:var(--status-available-soft); border-left:4px solid var(--status-available); padding:11px 14px; border-radius:12px; margin-bottom:14px; font-size:0.82rem; width:100%;">
                <span style="color:var(--status-available); display:inline-flex;">${ICONS.checkCircle}</span>
                <span><strong style="color:var(--status-available);">Validación RN-04 Cumplida:</strong> Anticipación ≥ 24 horas y ventana logística autorizada seleccionada.</span>
              </div>
            `
        }

        <button
          type="button"
          class="btn-primary w-full"
          data-action="submit-b2b-order"
          ${needsMoreGrain || triggersRN04Alert ? 'disabled' : ''}
        >
          <span>Confirmar Pedido Mayorista B2B</span>
          ${ICONS.arrowRight}
        </button>
      </div>
    `;
  }

  // --- P-05: Tracker Visual de Seguimiento de Orden en Vivo ---
  function renderScreenP05() {
    const s = store.getState();
    const currentOrder =
      s.orders.find(function (o) { return o.id === s.activeTrackedOrderId; }) ||
      s.orders[0];

    if (!currentOrder) {
      return `
        <div class="md3-surface-card" style="text-align:center;">
          <h2>No tienes pedidos en curso</h2>
          <button type="button" class="btn-primary" data-nav-screen="P-01">Explorar Catálogo (P-01)</button>
        </div>
      `;
    }

    const isReadyStep = currentOrder.stepIndex === 2 && currentOrder.b2bApprovalStatus !== 'rejected';
    const isRejected = currentOrder.b2bApprovalStatus === 'rejected';
    const progressPct = isRejected ? 0 : Math.min(100, Math.round(((currentOrder.stepIndex + 1) / ORDER_STATES.length) * 100));
    const stageIcons = [ICONS.clipboard, ICONS.flame, ICONS.packageSm, ICONS.truck];

    return `
      <section aria-labelledby="p05-heading">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">Rastreo Sincronizado (&lt; 3s — RNF-03) • P-05</span>
            <h1 id="p05-heading" style="font-size:clamp(1.4rem, 2.8vw, 2rem); margin:0;">
              Seguimiento de Estado de Orden en Vivo
            </h1>
          </div>
          <button type="button" class="btn-outline" data-nav-screen="P-07">
            <span>Simular Barra Staff (P-07)</span>
            ${ICONS.arrowRight}
          </button>
        </div>

        <!-- Selector de orden a consultar -->
        <div class="chip-carousel" aria-label="Seleccionar orden">
          ${s.orders
            .map(function (o) {
              const active = o.id === currentOrder.id;
              return `
                <button type="button" class="md3-chip ${active ? 'active' : ''}" data-track-order="${o.id}">
                  <strong>${escapeHtml(o.id)}</strong> • ${escapeHtml(o.customerName)}
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Notificación destacada en Paso 3: Listo para Empacar / Entrega (HU-12) -->
        ${
          isReadyStep
            ? `
              <div class="ready-pickup-banner" role="status">
                <div class="inline-icon-text" style="font-size:1.12rem; font-weight:700; margin-bottom:4px;">
                  ${ICONS.bell}
                  <span>¡Tu pedido ${escapeHtml(currentOrder.id)} está LISTO PARA EMPACAR / ENTREGA!</span>
                </div>
                <div style="font-size:0.88rem; opacity:0.95;">
                  Acércate directamente a nuestra zona de entrega rápida en Café del Centro sin hacer fila en caja.
                </div>
              </div>
            `
            : ''
        }

        <!-- Notificación de Rechazo Administrativo B2B (HU-14) -->
        ${
          isRejected
            ? `
              <div class="rule-alert-banner" role="alert">
                <h4>${ICONS.xCircle}<span>Solicitud Mayorista B2B Rechazada (HU-14)</span></h4>
                <p style="margin-bottom:0;">
                  <strong>Motivo informado por Administración:</strong> "${escapeHtml(currentOrder.rejectionReason)}"
                </p>
              </div>
            `
            : ''
        }

        <div class="md3-surface-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding-bottom:16px; border-bottom:1px solid rgba(25,44,61,0.1);">
            <div>
              <span style="font-family:var(--font-ubuntu); font-size:1.55rem; font-weight:700; color:var(--md-sys-color-primary);">
                ${escapeHtml(currentOrder.id)}
              </span>
              <span style="margin-left:10px; font-weight:600;">${escapeHtml(currentOrder.customerName)}</span>
            </div>
            <span class="status-badge ${currentOrder.modality === 'b2b' ? 'status-occupied' : 'status-available'}">
              ${escapeHtml(currentOrder.modalityLabel)}
            </span>
          </div>

          <div class="tracker-progress-track" aria-hidden="true">
            <div class="tracker-progress-fill" style="width:${progressPct}%;"></div>
          </div>

          <!-- Stepper Responsivo de 4 Etapas Exactas -->
          <div class="tracker-steps-grid" aria-label="Etapas del pedido">
            ${ORDER_STATES.map(function (label, idx) {
              const isDone = !isRejected && idx < currentOrder.stepIndex;
              const isCurrent = !isRejected && idx === currentOrder.stepIndex;
              const cls = isDone ? 'completed' : isCurrent ? 'current' : '';
              const desc = [
                'Orden confirmada y recibida en pantalla de barra.',
                'Tueste, molienda calibrada o extracción en curso.',
                'Empacado sellado y listo para entrega inmediata.',
                'Orden entregada al cliente o despachada en ruta.'
              ];

              return `
                <div class="tracker-step-card ${cls}">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="tracker-icon-circle">${isDone ? ICONS.check : stageIcons[idx]}</div>
                    ${isCurrent ? '<span class="eyebrow-pill" style="margin:0;">Actual</span>' : ''}
                  </div>
                  <strong style="font-size:0.92rem;">${escapeHtml(label)}</strong>
                  <span style="font-size:0.78rem; color:var(--md-sys-color-on-surface-muted);">${desc[idx]}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Recibo Visual con Miniaturas -->
          <div style="background:var(--md-sys-color-background); border-radius:16px; padding:16px;">
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:14px; font-size:0.84rem;">
              <div><strong>Programación:</strong><br/>${escapeHtml(currentOrder.scheduledTime)}</div>
              <div><strong>Punto de Entrega:</strong><br/>${escapeHtml(currentOrder.deliveryAddress)}</div>
              <div><strong>Total Orden:</strong><br/>$${currentOrder.totalAmount.toFixed(2)} ${currentOrder.totalLbs > 0 ? `(${currentOrder.totalLbs} lb café)` : ''}</div>
              ${
                currentOrder.modality === 'b2b'
                  ? `<div><strong>Aprobación B2B:</strong><br/>${
                      currentOrder.b2bApprovalStatus === 'approved'
                        ? `<span class="inline-icon-text" style="color:var(--status-available); font-weight:700;">${ICONS.checkCircle}<span>Despacho Aprobado</span></span>`
                        : currentOrder.b2bApprovalStatus === 'rejected'
                        ? `<span class="inline-icon-text" style="color:var(--status-error); font-weight:700;">${ICONS.xCircle}<span>Rechazado</span></span>`
                        : `<span class="inline-icon-text" style="color:var(--status-reserved); font-weight:700;">${ICONS.clock}<span>Pendiente Admin (P-08)</span></span>`
                    }</div>`
                  : ''
              }
            </div>

            ${
              Array.isArray(currentOrder.items) && currentOrder.items.length > 0
                ? `
                  <div style="display:flex; flex-wrap:wrap; gap:10px;">
                    ${currentOrder.items
                      .map(function (it) {
                        const img = getProductImageById(it.itemId);
                        return `
                          <div style="display:flex; align-items:center; gap:10px; background:#FFFFFF; padding:8px 12px; border-radius:12px; border:1px solid rgba(25,44,61,0.08);">
                            <img src="${img}" alt="${escapeHtml(it.name)}" style="width:42px; height:42px; border-radius:8px; object-fit:cover;" />
                            <div style="font-size:0.8rem;">
                              <strong>${it.qty} ${it.unit === 'lb' ? 'lb' : 'x'} ${escapeHtml(it.name)}</strong>
                            </div>
                          </div>
                        `;
                      })
                      .join('')}
                  </div>
                `
                : ''
            }
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================================
  // BLOQUE B: VISTA STAFF / TABLET DE BARRA POS (P-06 Y P-07)
  // ==========================================================================

  function renderStaffView() {
    return `
      <div class="container">
        ${ui.currentScreen === 'P-07' ? renderScreenP07() : renderScreenP06()}
      </div>
    `;
  }

  // --- P-06: Tablet de Barra — Mapa de Salón POS, Check-in y Simulador RN-02 ---
  function renderScreenP06() {
    const s = store.getState();
    const today = getISODateOffset(0);
    const tomorrow = getISODateOffset(1);

    // Métricas en vivo del bloque seleccionado
    let countAvailable = 0;
    let countReserved = 0;
    let countOccupied = 0;
    BASE_TABLES.forEach(function (t) {
      const st = store.getTableDetailedState(ui.staffDateFilter, ui.staffBlockFilter, t.id);
      if (st.staffStatus === 'available' || st.staffStatus === 'walkin') countAvailable++;
      else if (st.staffStatus === 'reserved') countReserved++;
      else if (st.staffStatus === 'occupied') countOccupied++;
    });

    const latestClientRes = s.activeClientReservationId
      ? s.reservations.find(function (r) { return r.id === s.activeClientReservationId && r.status === 'reserved'; })
      : null;

    const showSlotJumpNotice =
      latestClientRes &&
      (latestClientRes.date !== ui.staffDateFilter || latestClientRes.timeBlockId !== ui.staffBlockFilter);

    return `
      <section aria-labelledby="p06-heading">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">POS Tablet de Barra • P-06 (HU-05, HU-06, HU-07 | RN-02)</span>
            <h1 id="p06-heading" style="font-size:clamp(1.35rem, 2.5vw, 1.85rem); margin:0;">
              Control de Salón, Check-in y Tolerancia
            </h1>
          </div>
          <button type="button" class="btn-outline" data-nav-screen="P-07">
            <span>Ir a Cola Externa (P-07)</span>
            ${ICONS.arrowRight}
          </button>
        </div>

        ${
          showSlotJumpNotice
            ? `
              <div class="ready-pickup-banner" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div>
                  <strong>Nueva reserva creada por cliente (${escapeHtml(latestClientRes.id)} • ${escapeHtml(latestClientRes.customerName)}):</strong>
                  Mesa ${latestClientRes.tableId} en ${escapeHtml(formatFriendlyDate(latestClientRes.date))} (${escapeHtml(latestClientRes.timeBlockLabel)}).
                </div>
                <button type="button" class="rule-alert-cta" data-jump-staff-slot="${latestClientRes.date}|${latestClientRes.timeBlockId}">
                  <span>Cambiar a horario de ${escapeHtml(latestClientRes.id)}</span>
                  ${ICONS.arrowRight}
                </button>
              </div>
            `
            : ''
        }

        <!-- KPIs Operativos del Turno -->
        <div class="kpi-metrics-grid">
          <div class="kpi-card" style="border-left-color:var(--status-available);">
            <div class="kpi-val">${countAvailable}</div>
            <div class="kpi-lbl">Mesas Libres (Incl. Walk-in)</div>
          </div>
          <div class="kpi-card" style="border-left-color:var(--status-reserved);">
            <div class="kpi-val">${countReserved}</div>
            <div class="kpi-lbl">Reservas por Llegar</div>
          </div>
          <div class="kpi-card" style="border-left-color:var(--status-occupied);">
            <div class="kpi-val">${countOccupied}</div>
            <div class="kpi-lbl">Mesas con Check-in Activo</div>
          </div>
          <div class="kpi-card" style="border-left-color:var(--md-sys-color-primary);">
            <div class="kpi-val">15 min</div>
            <div class="kpi-lbl">Tolerancia Máxima (RN-02)</div>
          </div>
        </div>

        <!-- Barra de Filtros por Bloque y Fecha -->
        <div class="md3-surface-card" style="padding:14px 18px; margin-bottom:20px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
            <strong style="font-size:0.86rem;">Turno:</strong>
            ${TIME_BLOCKS.map(function (b) {
              const active = ui.staffBlockFilter === b.id;
              return `
                <button type="button" class="md3-chip ${active ? 'active' : ''}" data-staff-block="${b.id}">
                  ${escapeHtml(b.label)}
                </button>
              `;
            }).join('')}
          </div>

          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
            <input type="date" class="md3-input" style="width:auto; padding:7px 12px;" value="${escapeHtml(ui.staffDateFilter)}" data-staff-date-input aria-label="Filtrar fecha en barra" />
            <button type="button" class="md3-chip ${ui.staffDateFilter === today ? 'active' : ''}" data-staff-quick-date="${today}">Hoy</button>
            <button type="button" class="md3-chip ${ui.staffDateFilter === tomorrow ? 'active' : ''}" data-staff-quick-date="${tomorrow}">Mañana</button>
          </div>
        </div>

        <!-- Cuadrícula POS de 8 Mesas -->
        <div class="pos-tables-grid">
          ${BASE_TABLES.map(renderStaffTableCard).join('')}
        </div>

        <!-- Bitácora de Salón -->
        <div class="md3-card">
          <h3 style="font-size:1.08rem; margin:0 0 12px;">Bitácora Operativa de Salón y Registro "No presentó" (RN-02)</h3>
          <div style="display:grid; gap:8px;">
            ${s.salonHistory
              .slice(0, 8)
              .map(function (entry) {
                const col =
                  entry.type === 'noshow'
                    ? 'var(--md-sys-color-tertiary)'
                    : entry.type === 'checkin'
                    ? 'var(--status-available)'
                    : 'var(--md-sys-color-primary)';
                return `
                  <div style="background:#FFFFFF; padding:11px 15px; border-radius:12px; border-left:5px solid ${col}; display:flex; justify-content:space-between; align-items:center; gap:12px; font-size:0.84rem;">
                    <span>${escapeHtml(entry.message)}</span>
                    <strong style="font-family:var(--font-ubuntu); white-space:nowrap;">${escapeHtml(entry.time)}</strong>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderStaffTableCard(table) {
    const info = store.getTableDetailedState(ui.staffDateFilter, ui.staffBlockFilter, table.id);
    const res = info.reservation;

    let badgeClass = 'status-available';
    let borderCol = 'var(--status-available)';
    if (info.staffStatus === 'reserved') {
      badgeClass = 'status-reserved';
      borderCol = 'var(--status-reserved)';
    } else if (info.staffStatus === 'occupied') {
      badgeClass = 'status-occupied';
      borderCol = 'var(--status-occupied)';
    } else if (info.staffStatus === 'walkin' || info.staffStatus === 'blocked') {
      badgeClass = 'status-walkin';
      borderCol = 'var(--status-disabled)';
    }

    const isDelayedRN02 = res && res.status === 'reserved' && res.delayedMinutes >= 10;

    return `
      <article class="md3-surface-card" style="padding:18px; border-top:6px solid ${borderCol}; display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="margin:0; font-size:1.12rem;">${escapeHtml(table.name)}</h3>
            <span style="font-family:var(--font-ubuntu); font-size:0.76rem; font-weight:700; background:var(--md-sys-color-background); padding:3px 9px; border-radius:999px;">
              Cap. ${table.capacity} pers.
            </span>
          </div>

          <div style="margin-bottom:8px;">
            <span class="status-badge ${badgeClass}">${escapeHtml(info.staffLabel)}</span>
          </div>

          <div style="font-size:0.78rem; color:var(--md-sys-color-on-surface-muted); margin-bottom:10px;">
            ${escapeHtml(table.zone)}
          </div>

          ${
            res
              ? `
                <div style="background:var(--md-sys-color-background); padding:11px; border-radius:12px; font-size:0.81rem; display:grid; gap:4px;">
                  <div><strong>${escapeHtml(res.id)}</strong> • ${escapeHtml(res.customerName)} (${res.guests} pers.)</div>
                  <div>Duración: <strong>${res.durationMinutes} min</strong></div>
                  ${
                    res.modality === 'barismo'
                      ? `<div class="inline-icon-text" style="color:var(--md-sys-color-tertiary); font-weight:700;">${ICONS.coffeeSm}<span>Métodos en Mesa • ${escapeHtml(res.barista)}</span></div>`
                      : ''
                  }
                  ${
                    res.checkInTime
                      ? `<div class="inline-icon-text" style="color:var(--status-available); font-weight:700;">${ICONS.checkCircle}<span>Llegada: ${escapeHtml(res.checkInTime)}</span></div>`
                      : ''
                  }
                </div>
              `
              : info.adminBlock
              ? `
                <div style="background:var(--md-sys-color-background); padding:11px; border-radius:12px; font-size:0.8rem;">
                  <strong>Bloqueo Evento:</strong> ${escapeHtml(info.adminBlock.reason)}
                </div>
              `
              : `
                <div style="background:var(--md-sys-color-background); padding:11px; border-radius:12px; font-size:0.8rem; color:var(--md-sys-color-on-surface-muted);">
                  ${table.isWalkInOnly ? 'Cuota fija 20% para atención presencial Walk-in (RN-01).' : 'Disponible para nueva reserva o asignación directa.'}
                </div>
              `
          }

          ${
            isDelayedRN02
              ? `
                <div class="rn02-warning-box" role="alert">
                  <div class="inline-icon-text" style="margin-bottom:3px;">${ICONS.alertTriangle}<span>Alerta Preventiva RN-02:</span></div>
                  "${res.delayedMinutes} min sin Check-in - Se liberará en ${15 - res.delayedMinutes} min"
                </div>
              `
              : ''
          }
        </div>

        <div style="display:grid; gap:7px;">
          ${
            res && res.status === 'reserved'
              ? `
                <button type="button" class="btn-success w-full" data-checkin-res="${res.id}">
                  ${ICONS.check}
                  <span>Registrar Check-in</span>
                </button>
                <button type="button" class="btn-tertiary w-full" style="font-size:0.78rem; padding:9px 12px;" data-expire-rn02="${res.id}">
                  ${ICONS.timer}
                  <span>Simular Vencimiento 15 min (RN-02)</span>
                </button>
              `
              : info.staffStatus === 'occupied'
              ? `
                <button type="button" class="btn-outline w-full" data-manual-table="${table.id}:available">
                  Liberar Mesa a Disponible
                </button>
              `
              : table.isWalkInOnly
              ? `
                <button type="button" class="btn-primary w-full" style="font-size:0.82rem;" data-manual-table="${table.id}:occupied">
                  Ocupar Walk-in Presencial
                </button>
              `
              : info.staffStatus === 'available'
              ? `
                <button type="button" class="btn-outline w-full" style="font-size:0.8rem;" data-manual-table="${table.id}:occupied">
                  Asignar en Barra
                </button>
              `
              : ''
          }
        </div>
      </article>
    `;
  }

  // --- P-07: Tablet de Barra — Cola de Pedidos Externos con Miniaturas ---
  function renderScreenP07() {
    const s = store.getState();

    const filteredOrders = s.orders
      .filter(function (o) {
        if (o.b2bApprovalStatus === 'rejected') return ui.queueFilter === 'all';
        if (ui.queueFilter === 'active') return o.stepIndex < 3;
        if (ui.queueFilter === 'pickup') return o.modality === 'pickup';
        if (ui.queueFilter === 'b2b') return o.modality === 'b2b';
        return true;
      })
      .slice()
      .sort(function (a, b) {
        if ((a.stepIndex === 3) !== (b.stepIndex === 3)) {
          return a.stepIndex === 3 ? 1 : -1;
        }
        return (a.urgencyRank || 5) - (b.urgencyRank || 5);
      });

    return `
      <section aria-labelledby="p07-heading">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">Producción y Despacho en Barra • P-07 (HU-13)</span>
            <h1 id="p07-heading" style="font-size:clamp(1.35rem, 2.5vw, 1.85rem); margin:0;">
              Cola de Pedidos Externos Pick-up y B2B
            </h1>
          </div>
          <button type="button" class="btn-outline" data-nav-screen="P-05">
            <span>Ver Pantalla Cliente (P-05)</span>
            ${ICONS.arrowRight}
          </button>
        </div>

        <div class="chip-carousel">
          <button type="button" class="md3-chip ${ui.queueFilter === 'active' ? 'active' : ''}" data-queue-filter="active">En Preparación Activa</button>
          <button type="button" class="md3-chip ${ui.queueFilter === 'pickup' ? 'active' : ''}" data-queue-filter="pickup">Solo Pick-up</button>
          <button type="button" class="md3-chip ${ui.queueFilter === 'b2b' ? 'active' : ''}" data-queue-filter="b2b">Mayoristas B2B</button>
          <button type="button" class="md3-chip ${ui.queueFilter === 'all' ? 'active' : ''}" data-queue-filter="all">Todos los Pedidos</button>
        </div>

        <div class="queue-cards-grid">
          ${
            filteredOrders.length === 0
              ? `<div class="md3-surface-card"><p style="margin:0;">No hay pedidos pendientes en este filtro.</p></div>`
              : filteredOrders.map(renderOrderQueueCard).join('')
          }
        </div>
      </section>
    `;
  }

  function renderOrderQueueCard(order) {
    const isReadyToPack = order.stepIndex === 2;
    const isDelivered = order.stepIndex === 3;
    const isRejected = order.b2bApprovalStatus === 'rejected';
    const currentStateLabel = ORDER_STATES[order.stepIndex];
    const nextStateLabel = ORDER_STATES[order.stepIndex + 1] || null;

    let stateBadgeClass = 'status-reserved';
    if (isReadyToPack || isDelivered) stateBadgeClass = 'status-available';
    if (isRejected) stateBadgeClass = 'status-occupied';

    const leadThumb =
      Array.isArray(order.items) && order.items[0]
        ? getProductImageById(order.items[0].itemId)
        : IMAGES.bolsaPacamara;

    return `
      <article class="md3-card order-queue-card ${isReadyToPack ? 'ready-highlight' : ''}" style="display:flex; flex-direction:column; justify-content:space-between; gap:14px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:10px;">
            <strong style="font-family:var(--font-ubuntu); font-size:1.22rem; color:var(--md-sys-color-primary);">
              ${escapeHtml(order.id)}
            </strong>
            ${
              isReadyToPack
                ? `<span class="status-badge status-available" style="padding:6px 13px;">${ICONS.packageSm}<span>LISTO PARA EMPACAR</span></span>`
                : `<span class="status-badge ${stateBadgeClass}">${escapeHtml(isRejected ? 'Rechazado' : currentStateLabel)}</span>`
            }
          </div>

          <div style="background:#FFFFFF; border-radius:16px; padding:14px; display:flex; gap:12px; align-items:flex-start;">
            <img src="${leadThumb}" alt="${escapeHtml(order.itemsSummary)}" style="width:58px; height:58px; border-radius:12px; object-fit:cover; flex-shrink:0;" />
            <div style="font-size:0.82rem; display:grid; gap:4px; flex:1;">
              <strong style="font-size:0.92rem;">${escapeHtml(order.customerName)}</strong>
              <span>${escapeHtml(order.itemsSummary)}</span>
              <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px;">
                <span class="eyebrow-pill" style="margin:0; padding:2px 9px;">${order.totalLbs} lb café</span>
                <span class="inline-icon-text" style="font-weight:600;">${ICONS.clock}<span>${escapeHtml(order.scheduledTime)}</span></span>
              </div>
              <span style="font-size:0.76rem; color:var(--md-sys-color-on-surface-muted);">${escapeHtml(order.modalityLabel)}</span>
            </div>
          </div>
        </div>

        <div>
          ${
            !isDelivered && !isRejected
              ? `
                <button type="button" class="btn-primary w-full" data-advance-order="${order.id}">
                  <span>Avanzar Estado (${escapeHtml(nextStateLabel)})</span>
                  ${ICONS.arrowRight}
                </button>
              `
              : `
                <button type="button" class="btn-disabled-stock" disabled>
                  ${isRejected ? ICONS.xCircle : ICONS.checkCircle}
                  <span>${isRejected ? 'Pedido Rechazado' : 'Entregado / En Ruta'}</span>
                </button>
              `
          }
        </div>
      </article>
    `;
  }

  // ==========================================================================
  // BLOQUE C: PANEL EJECUTIVO DE ADMINISTRADORA (P-08)
  // ==========================================================================

  function renderAdminView() {
    const s = store.getState();
    const b2bOrders = s.orders.filter(function (o) { return o.modality === 'b2b'; });
    const pendingB2B = b2bOrders.filter(function (o) { return o.b2bApprovalStatus === 'pending'; });
    const totalPendingLbs = pendingB2B.reduce(function (acc, o) { return acc + (o.totalLbs || 0); }, 0);
    const bd = ui.blockDraft;
    const allDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    return `
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow-pill">Dirección Operativa y Mayorista • P-08 (HU-08, HU-14, HU-15)</span>
            <h1 style="font-size:clamp(1.4rem, 2.6vw, 1.95rem); margin:0;">
              Panel Ejecutivo de Administradora
            </h1>
          </div>
        </div>

        <!-- KPIs Ejecutivos -->
        <div class="kpi-metrics-grid">
          <div class="kpi-card" style="border-left-color:var(--md-sys-color-tertiary);">
            <div class="kpi-val">${pendingB2B.length}</div>
            <div class="kpi-lbl">Despachos B2B por Aprobar</div>
          </div>
          <div class="kpi-card" style="border-left-color:var(--md-sys-color-primary);">
            <div class="kpi-val">${totalPendingLbs} lb</div>
            <div class="kpi-lbl">Volumen en Grano Solicitado</div>
          </div>
          <div class="kpi-card" style="border-left-color:var(--status-available);">
            <div class="kpi-val">${s.logisticsWindows.filter(function (w) { return w.active; }).length}</div>
            <div class="kpi-lbl">Ventanas Logísticas Activas</div>
          </div>
          <div class="kpi-card" style="border-left-color:var(--status-disabled);">
            <div class="kpi-val">${s.adminBlocks.length}</div>
            <div class="kpi-lbl">Bloqueos de Eventos Activos</div>
          </div>
        </div>

        <!-- MÓDULO A (HU-14): Aprobación y Rechazo de Pedidos Mayoristas B2B -->
        <section class="md3-card" aria-labelledby="mod-a-title">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <div>
              <span class="eyebrow-pill" style="background:#FFFFFF;">Módulo A • HU-14</span>
              <h2 id="mod-a-title" style="font-size:1.2rem; margin:0;">Solicitudes Mayoristas B2B</h2>
            </div>
          </div>

          <div class="b2b-cards-list">
            ${b2bOrders
              .map(function (order) {
                let statusBadge = `<span class="status-badge status-reserved">${ICONS.clock}<span>Pendiente</span></span>`;
                if (order.b2bApprovalStatus === 'approved') {
                  statusBadge = `<span class="status-badge status-available">${ICONS.checkCircle}<span>Despacho Aprobado</span></span>`;
                } else if (order.b2bApprovalStatus === 'rejected') {
                  statusBadge = `<span class="status-badge status-occupied">${ICONS.xCircle}<span>Rechazado</span></span><div style="font-size:0.75rem; color:var(--status-error); margin-top:4px;">Motivo: ${escapeHtml(order.rejectionReason)}</div>`;
                }

                return `
                  <div class="b2b-order-row-card">
                    <div>
                      <strong style="font-family:var(--font-ubuntu); font-size:1.05rem; color:var(--md-sys-color-primary);">${escapeHtml(order.id)}</strong>
                      <div style="font-weight:700;">${escapeHtml(order.customerName)}</div>
                      ${order.contactPerson ? `<small style="color:var(--md-sys-color-on-surface-muted);">${escapeHtml(order.contactPerson)}</small>` : ''}
                    </div>

                    <div>
                      <span class="eyebrow-pill" style="margin:0 0 4px;">${order.totalLbs} lb • $${order.totalAmount.toFixed(2)}</span>
                      <div style="font-size:0.82rem;">${escapeHtml(order.itemsSummary)}</div>
                    </div>

                    <div style="font-size:0.82rem; display:grid; gap:3px;">
                      <div class="inline-icon-text">${ICONS.mapPin}<span>${escapeHtml(order.deliveryAddress)}</span></div>
                      <strong class="inline-icon-text" style="color:var(--md-sys-color-primary);">${ICONS.clock}<span>${escapeHtml(order.scheduledTime)}</span></strong>
                      <div style="margin-top:4px;">${statusBadge}</div>
                    </div>

                    <div style="display:flex; flex-wrap:wrap; gap:8px;">
                      ${
                        order.b2bApprovalStatus === 'pending'
                          ? `
                            <button type="button" class="btn-success" style="padding:9px 14px; font-size:0.8rem;" data-approve-b2b="${order.id}">
                              ${ICONS.check}
                              <span>Aprobar Despacho</span>
                            </button>
                            <button type="button" class="btn-tertiary" style="padding:9px 14px; font-size:0.8rem;" data-open-reject-b2b="${order.id}">
                              ${ICONS.xCircle}
                              <span>Rechazar (con motivo obligatorio)</span>
                            </button>
                          `
                          : `<span style="font-size:0.78rem; font-weight:600; color:var(--md-sys-color-on-surface-muted);">Sincronizado en P-05</span>`
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </section>

        <div class="admin-two-col">
          <!-- MÓDULO B (HU-15 / RN-04): Configuración de Ventanas Logísticas -->
          <section class="md3-surface-card" aria-labelledby="mod-b-title">
            <span class="eyebrow-pill">Módulo B • HU-15 | RN-04</span>
            <h2 id="mod-b-title" style="font-size:1.18rem; margin:0 0 8px;">Ventanas Logísticas Autorizadas</h2>
            <p style="font-size:0.82rem; color:var(--md-sys-color-on-surface-muted); margin:0 0 14px;">
              Aplica exclusivamente a <strong>pedidos B2B nuevos</strong> en <code>P-04</code> sin modificar órdenes ya aprobadas.
            </p>

            <div style="display:grid; gap:14px;">
              ${s.logisticsWindows
                .map(function (win) {
                  return `
                    <div style="background:var(--md-sys-color-background); border-radius:16px; padding:16px; border:1px solid rgba(25,44,61,0.1);">
                      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
                        <strong>${escapeHtml(win.name)} (${escapeHtml(win.startTime)} - ${escapeHtml(win.endTime)})</strong>
                        <button
                          type="button"
                          class="${win.active ? 'btn-success' : 'btn-outline'}"
                          style="padding:6px 13px; font-size:0.76rem;"
                          data-toggle-window="${win.id}"
                        >
                          ${win.active ? `${ICONS.checkCircle}<span>Activa</span>` : '<span>Inactiva</span>'}
                        </button>
                      </div>

                      <div class="form-grid-2" style="margin-bottom:10px;">
                        <div>
                          <label class="field-label" style="font-size:0.74rem;">Inicio</label>
                          <input type="text" class="md3-input" style="background:#FFF; padding:7px 10px;" value="${escapeHtml(win.startTime)}" data-win-time="${win.id}:startTime" />
                        </div>
                        <div>
                          <label class="field-label" style="font-size:0.74rem;">Cierre</label>
                          <input type="text" class="md3-input" style="background:#FFF; padding:7px 10px;" value="${escapeHtml(win.endTime)}" data-win-time="${win.id}:endTime" />
                        </div>
                      </div>

                      <div style="display:flex; flex-wrap:wrap; gap:6px;">
                        ${allDays
                          .map(function (day) {
                            const activeDay = win.days.includes(day);
                            return `
                              <button type="button" class="md3-chip ${activeDay ? 'active' : ''}" style="padding:4px 10px; font-size:0.73rem;" data-win-day="${win.id}:${day}">
                                ${day}
                              </button>
                            `;
                          })
                          .join('')}
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </section>

          <!-- MÓDULO C (HU-08): Bloqueo de Horarios y Mesas por Eventos -->
          <section class="md3-surface-card" aria-labelledby="mod-c-title">
            <span class="eyebrow-pill">Módulo C • HU-08</span>
            <h2 id="mod-c-title" style="font-size:1.18rem; margin:0 0 8px;">Bloqueos por Eventos o Patrocinios</h2>
            <p style="font-size:0.82rem; color:var(--md-sys-color-on-surface-muted); margin:0 0 14px;">
              Verifica conflictos con reservas activas antes de cerrar horarios en <code>P-02</code>.
            </p>

            <div class="form-grid-2">
              <div class="field-group">
                <label class="field-label" for="blk-date">Fecha</label>
                <input id="blk-date" type="date" class="md3-input" value="${escapeHtml(bd.date)}" data-block-field="date" />
              </div>
              <div class="field-group">
                <label class="field-label" for="blk-slot">Bloque Horario</label>
                <select id="blk-slot" class="md3-input" data-block-field="timeBlockId">
                  ${TIME_BLOCKS.map(function (b) {
                    return `<option value="${b.id}" ${bd.timeBlockId === b.id ? 'selected' : ''}>${escapeHtml(b.label)}</option>`;
                  }).join('')}
                  <option value="ALL" ${bd.timeBlockId === 'ALL' ? 'selected' : ''}>Jornada Completa</option>
                </select>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label" for="blk-scope">Alcance</label>
              <select id="blk-scope" class="md3-input" data-block-field="scope">
                <option value="all" ${bd.scope === 'all' ? 'selected' : ''}>Salón Completo</option>
                <option value="tables" ${bd.scope === 'tables' ? 'selected' : ''}>Mesas Específicas</option>
              </select>
            </div>

            ${
              bd.scope === 'tables'
                ? `
                  <div class="field-group">
                    <span class="field-label">Mesas a bloquear:</span>
                    <div style="display:flex; flex-wrap:wrap; gap:6px;">
                      ${BASE_TABLES.filter(function (t) { return !t.isWalkInOnly; })
                        .map(function (t) {
                          const checked = bd.tableIds.includes(t.id);
                          return `
                            <button type="button" class="md3-chip ${checked ? 'active' : ''}" style="padding:5px 11px; font-size:0.76rem;" data-block-toggle-table="${t.id}">
                              Mesa ${t.id}
                            </button>
                          `;
                        })
                        .join('')}
                    </div>
                  </div>
                `
                : ''
            }

            <div class="field-group">
              <label class="field-label" for="blk-reason">Evento o Patrocinio *</label>
              <input
                id="blk-reason"
                type="text"
                class="md3-input ${bd.error ? 'input-error' : ''}"
                placeholder="Ej. Patrocinio Torneo Nacional de Tenis"
                value="${escapeHtml(bd.reason)}"
                data-block-field="reason"
              />
              <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                <button type="button" class="md3-chip" style="padding:4px 10px; font-size:0.73rem;" data-block-preset="Patrocinio Torneo Nacional de Tenis">
                  Torneo Nacional de Tenis
                </button>
                <button type="button" class="md3-chip" style="padding:4px 10px; font-size:0.73rem;" data-block-preset="Cata Privada de Cafés Geisha">
                  Cata Privada Geisha
                </button>
              </div>
              ${bd.error ? `<span class="field-error-msg">${escapeHtml(bd.error)}</span>` : ''}
            </div>

            <button type="button" class="btn-primary w-full" data-action="verify-and-apply-block">
              <span>Verificar Conflictos y Bloquear Horario</span>
              ${ICONS.arrowRight}
            </button>

            <div style="margin-top:16px;">
              <strong style="font-size:0.84rem; display:block; margin-bottom:8px;">Bloqueos Activos (${s.adminBlocks.length}):</strong>
              ${
                s.adminBlocks.length === 0
                  ? `<span style="font-size:0.8rem; color:var(--md-sys-color-on-surface-muted);">Ningún horario bloqueado actualmente.</span>`
                  : s.adminBlocks
                      .map(function (blk) {
                        return `
                          <div style="background:var(--md-sys-color-background); padding:10px 14px; border-radius:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px; font-size:0.8rem;">
                            <div>
                              <strong>${escapeHtml(blk.reason)}</strong><br/>
                              <span>${escapeHtml(formatFriendlyDate(blk.date))} • ${escapeHtml(blk.timeBlockLabel)}</span>
                            </div>
                            <button type="button" class="btn-outline" style="padding:5px 11px; font-size:0.74rem;" data-remove-block="${blk.id}">
                              Quitar
                            </button>
                          </div>
                        `;
                      })
                      .join('')
              }
            </div>
          </section>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // MODALES (LIGHTBOX FOTOGRÁFICO, MODAL P-02.1, RECHAZO HU-14, CONFLICTOS HU-08)
  // ==========================================================================

  function renderModals() {
    const modalHost = document.getElementById('modal-host');
    if (!modalHost) return;

    // 0. Lightbox de Fotografías Reales del Local
    if (ui.lightbox.open) {
      const photo = GALLERY_PHOTOS[ui.lightbox.index] || GALLERY_PHOTOS[0];
      modalHost.innerHTML = `
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Galería de Café del Centro">
          <div class="modal-dialog lightbox-dialog">
            <div style="position:relative; background:#000; max-height:70vh; overflow:hidden; display:flex; align-items:center; justify-content:center;">
              <img src="${photo.src}" alt="${escapeHtml(photo.title)}" style="max-height:68vh; width:auto; object-fit:contain;" />
            </div>
            <div style="padding:18px 22px; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px;">
              <div>
                <strong style="font-size:1.05rem; display:block;">${escapeHtml(photo.title)} (${ui.lightbox.index + 1}/${GALLERY_PHOTOS.length})</strong>
                <span style="font-size:0.84rem; opacity:0.85;">${escapeHtml(photo.caption)}</span>
              </div>
              <div style="display:flex; gap:8px;">
                <button type="button" class="hero-cta-secondary" style="padding:8px 14px;" data-lightbox-step="-1">${ICONS.arrowLeft}<span>Anterior</span></button>
                <button type="button" class="hero-cta-secondary" style="padding:8px 14px;" data-lightbox-step="1"><span>Siguiente</span>${ICONS.arrowRight}</button>
                <button type="button" class="hero-cta-primary" style="padding:8px 16px;" data-close-modals>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 1. Modal P-02.1: Alerta RN-01 (Aforo 80% / Walk-in 20%) o Bloqueo por Evento
    if (ui.modalRN01.open) {
      const m = ui.modalRN01;
      const nextSlot = m.nextSlot || TIME_BLOCKS[2];
      const isEventBlock = m.reasonType === 'admin_block';

      modalHost.innerHTML = `
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-rn01-title">
          <div class="modal-dialog">
            <div class="modal-header-tertiary">
              <span style="font-size:0.74rem; font-weight:700; opacity:0.9; display:block; margin-bottom:4px;">
                ${isEventBlock ? 'Aviso de Evento Oficial (HU-08)' : 'Modal P-02.1 • Regla de Aforo RN-01 (HU-04)'}
              </span>
              <h3 id="modal-rn01-title" class="inline-icon-text">
                ${ICONS.alertTriangle}
                <span>${isEventBlock ? 'Horario Reservado para Evento' : 'Aforo Digital al 80% Completado'}</span>
              </h3>
            </div>
            <div class="modal-body">
              <div class="modal-body-inner">
                ${
                  isEventBlock
                    ? `
                      <p style="margin:0 0 8px; font-size:0.88rem;">
                        El horario <strong>${escapeHtml(m.blockedTimeLabel)}</strong> se encuentra reservado para:
                        <strong>"${escapeHtml(m.adminBlockReason)}"</strong>.
                      </p>
                      <p style="margin:0; font-size:0.84rem;">Selecciona el siguiente horario habilitado en un clic.</p>
                    `
                    : `
                      <p style="margin:0 0 10px; font-size:0.88rem;">
                        El bloque <strong>${escapeHtml(m.blockedTimeLabel)}</strong> alcanzó el <strong>80% de cupo máximo digital</strong>.
                      </p>
                      <p style="margin:0; font-size:0.84rem;">
                        <strong>Regla RN-01:</strong> Resguardamos de forma permanente el <strong>20% del salón (Mesas 7 y 8)</strong>
                        para visitantes presenciales <em>Walk-in</em> en el Centro Histórico.
                      </p>
                    `
                }
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-tertiary w-full" data-apply-next-slot="${nextSlot.id}">
                  <span>Seleccionar siguiente horario disponible: ${escapeHtml(nextSlot.shortLabel)} (${escapeHtml(nextSlot.label)})</span>
                  ${ICONS.arrowRight}
                </button>
                <button type="button" class="btn-outline w-full" data-close-modals>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 2. Modal Rechazo B2B (HU-14)
    if (ui.rejectModal.open) {
      const rm = ui.rejectModal;
      modalHost.innerHTML = `
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-rej-title">
          <div class="modal-dialog">
            <div class="modal-header-tertiary">
              <h3 id="modal-rej-title">Rechazar Pedido ${escapeHtml(rm.orderId)} (${escapeHtml(rm.brandName)})</h3>
            </div>
            <div class="modal-body">
              <div class="modal-body-inner">
                <label class="field-label" for="reject-reason-input" style="display:block; margin-bottom:6px;">
                  Motivo obligatorio de rechazo (visible por el cliente en P-05) *
                </label>
                <textarea
                  id="reject-reason-input"
                  rows="3"
                  class="md3-input ${rm.error ? 'input-error' : ''}"
                  placeholder="Ej. Capacidad de tueste completa para mañana; disponible en ventana del jueves."
                  data-reject-reason-field
                >${escapeHtml(rm.reason)}</textarea>
                ${rm.error ? `<div class="field-error-msg" style="margin-top:6px;">${escapeHtml(rm.error)}</div>` : ''}
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-tertiary w-full" data-action="confirm-reject-b2b">
                  Confirmar Rechazo y Notificar
                </button>
                <button type="button" class="btn-outline w-full" data-close-modals>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 3. Modal Conflictos de Reservas Activas por Bloqueo (HU-08)
    if (ui.conflictModal.open) {
      const cm = ui.conflictModal;
      modalHost.innerHTML = `
        <div class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-conf-title">
          <div class="modal-dialog">
            <div class="modal-header-tertiary">
              <h3 id="modal-conf-title">¡Atención! ${cm.conflicts.length} Reserva(s) Activa(s) Afectada(s)</h3>
            </div>
            <div class="modal-body">
              <div class="modal-body-inner">
                <p style="margin:0 0 10px; font-size:0.86rem;">
                  El bloqueo por <strong>"${escapeHtml(cm.pendingPayload.reason)}"</strong> coincide con estas reservas activas:
                </p>
                <ul style="margin:0; padding-left:18px; font-size:0.83rem; display:grid; gap:6px;">
                  ${cm.conflicts
                    .map(function (c) {
                      return `<li><strong>${escapeHtml(c.id)}</strong> — ${escapeHtml(c.customerName)} (Mesa ${c.tableId}, ${c.guests} pers. • ${escapeHtml(c.timeBlockLabel)})</li>`;
                    })
                    .join('')}
                </ul>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-tertiary w-full" data-action="confirm-force-admin-block">
                  Confirmar Bloqueo y Notificar Reservas Afectadas
                </button>
                <button type="button" class="btn-outline w-full" data-close-modals>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    modalHost.innerHTML = '';
  }

  // ==========================================================================
  // INTERACTIVIDAD Y VALIDACIÓN DE REGLAS DE NEGOCIO
  // ==========================================================================

  function attachEventDelegation() {
    document.addEventListener('click', function (ev) {
      const target = ev.target;

      // Lightbox galería
      const openLb = target.closest('[data-open-lightbox]');
      if (openLb) {
        ui.lightbox.open = true;
        ui.lightbox.index = Number(openLb.getAttribute('data-open-lightbox')) || 0;
        renderModals();
        return;
      }

      const stepLb = target.closest('[data-lightbox-step]');
      if (stepLb) {
        const delta = Number(stepLb.getAttribute('data-lightbox-step'));
        ui.lightbox.index = (ui.lightbox.index + delta + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
        renderModals();
        return;
      }

      // Role Switcher
      const roleBtn = target.closest('[data-role-switch]');
      if (roleBtn) {
        switchRole(roleBtn.getAttribute('data-role-switch'));
        return;
      }

      // Navegación P-01 .. P-08
      const navScreenBtn = target.closest('[data-nav-screen]');
      if (navScreenBtn) {
        navigateToScreen(navScreenBtn.getAttribute('data-nav-screen'));
        return;
      }

      // Restaurar Datos Demo
      if (target.closest('#btn-reset-demo')) {
        store.resetDemoData();
        ui.reservationDraft.date = getISODateOffset(0);
        ui.reservationDraft.timeBlockId = '15:00';
        ui.reservationDraft.guests = 2;
        ui.reservationDraft.selectedTableId = 1;
        ui.reservationDraft.modality = 'estandar';
        ui.reservationDraft.customerName = '';
        ui.reservationDraft.errors = {};
        ui.b2bDraft.dateChoice = 'today';
        ui.b2bDraft.windowChoice = 'invalid_regular';
        ui.staffDateFilter = getISODateOffset(0);
        ui.staffBlockFilter = '15:00';
        showToast('Datos de demostración restaurados correctamente.');
        return;
      }

      // P-01 Catálogo
      if (target.closest('[data-action="focus-catalog-or-cart"]')) {
        const anchor = document.getElementById('catalog-anchor');
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const catChip = target.closest('[data-cat-filter]');
      if (catChip) {
        ui.catalogCategory = catChip.getAttribute('data-cat-filter');
        renderAll();
        return;
      }

      if (target.closest('[data-action="request-table-method"]')) {
        ui.reservationDraft.modality = 'barismo';
        navigateToScreen('P-02');
        showToast('Experiencia de Barismo (75 min — RN-03) seleccionada.');
        return;
      }

      const addCartBtn = target.closest('[data-add-cart]');
      if (addCartBtn) {
        const itemId = addCartBtn.getAttribute('data-add-cart');
        const product = CATALOG_ITEMS.find(function (p) { return p.id === itemId; });
        if (!product || !product.available) return;
        const qty = product.isGrain ? (ui.grainSelectedWeightByItem[itemId] || 1) : 1;
        store.addToCart(itemId, qty);
        if (product.isGrain && qty >= 5) {
          ui.checkoutTab = 'b2b';
        }
        showToast(`Agregado: ${qty} ${product.isGrain ? 'lb' : 'x'} ${product.shortName}`);
        return;
      }

      // P-02 Reserva de Mesas
      const quickDateBtn = target.closest('[data-res-quick-date]');
      if (quickDateBtn) {
        ui.reservationDraft.date = quickDateBtn.getAttribute('data-res-quick-date');
        ensureValidSelectedTableInDraft();
        renderAll();
        return;
      }

      const guestDeltaBtn = target.closest('[data-guest-delta]');
      if (guestDeltaBtn) {
        const delta = Number(guestDeltaBtn.getAttribute('data-guest-delta'));
        ui.reservationDraft.guests = Math.min(6, Math.max(1, ui.reservationDraft.guests + delta));
        ensureValidSelectedTableInDraft();
        renderAll();
        return;
      }

      const timeBlockBtn = target.closest('[data-select-timeblock]');
      if (timeBlockBtn) {
        const blockId = timeBlockBtn.getAttribute('data-select-timeblock');
        const blockObj = TIME_BLOCKS.find(function (b) { return b.id === blockId; });
        const evalStatus = store.evaluateTimeBlockStatus(ui.reservationDraft.date, blockId);

        if (!evalStatus.available) {
          const nextOpen = store.getNextAvailableTimeBlock(ui.reservationDraft.date, blockId);
          ui.modalRN01 = {
            open: true,
            blockedTimeLabel: blockObj ? blockObj.label : blockId,
            reasonType: evalStatus.reason === 'admin_block' ? 'admin_block' : 'rn01',
            adminBlockReason: evalStatus.adminBlock ? evalStatus.adminBlock.reason : '',
            nextSlot: nextOpen
          };
          renderModals();
          return;
        }

        ui.reservationDraft.timeBlockId = blockId;
        ensureValidSelectedTableInDraft();
        renderAll();
        return;
      }

      const applyNextSlotBtn = target.closest('[data-apply-next-slot]');
      if (applyNextSlotBtn) {
        const nextId = applyNextSlotBtn.getAttribute('data-apply-next-slot');
        ui.modalRN01.open = false;
        ui.reservationDraft.timeBlockId = nextId;
        ensureValidSelectedTableInDraft();
        renderAll();
        showToast(`Horario cambiado a ${getBlockLabel(nextId)}.`);
        return;
      }

      const selectTableBtn = target.closest('[data-select-table]');
      if (selectTableBtn) {
        ui.reservationDraft.selectedTableId = Number(selectTableBtn.getAttribute('data-select-table'));
        delete ui.reservationDraft.errors.table;
        renderAll();
        return;
      }

      const modalityBtn = target.closest('[data-select-modality]');
      if (modalityBtn) {
        ui.reservationDraft.modality = modalityBtn.getAttribute('data-select-modality');
        renderAll();
        return;
      }

      const suggestedBaristaBtn = target.closest('[data-apply-suggested-barista-slot]');
      if (suggestedBaristaBtn) {
        ui.reservationDraft.timeBlockId = suggestedBaristaBtn.getAttribute('data-apply-suggested-barista-slot');
        ensureValidSelectedTableInDraft();
        renderAll();
        return;
      }

      if (target.closest('[data-action="confirm-reservation"]')) {
        handleConfirmReservation();
        return;
      }

      if (target.closest('[data-action="jump-staff-checkin"]')) {
        const s = store.getState();
        const res = s.reservations.find(function (r) { return r.id === s.activeClientReservationId; }) || s.reservations[0];
        if (res) {
          ui.staffDateFilter = res.date;
          ui.staffBlockFilter = res.timeBlockId;
        }
        navigateToScreen('P-06');
        return;
      }

      // P-04 Carrito & Checkout
      const quickAddBtn = target.closest('[data-quick-add]');
      if (quickAddBtn) {
        const parts = quickAddBtn.getAttribute('data-quick-add').split(':');
        store.addToCart(parts[0], Number(parts[1]));
        if (Number(parts[1]) >= 5) ui.checkoutTab = 'b2b';
        return;
      }

      const cartQtyBtn = target.closest('[data-cart-qty]');
      if (cartQtyBtn) {
        const parts = cartQtyBtn.getAttribute('data-cart-qty').split(':');
        store.updateCartItemQty(parts[0], Number(parts[1]));
        return;
      }

      const checkoutTabBtn = target.closest('[data-checkout-tab]');
      if (checkoutTabBtn) {
        ui.checkoutTab = checkoutTabBtn.getAttribute('data-checkout-tab');
        renderAll();
        return;
      }

      if (target.closest('[data-action="fill-b2b-minimum"]')) {
        store.ensureMinimumB2BGrainWeight();
        showToast('Lote ajustado al mínimo mayorista de 5 lb.');
        return;
      }

      const applyValidWinBtn = target.closest('[data-action="apply-first-valid-b2b-window"]');
      if (applyValidWinBtn) {
        ui.b2bDraft.dateChoice = 'tomorrow';
        ui.b2bDraft.windowChoice = applyValidWinBtn.getAttribute('data-win-id');
        renderAll();
        showToast('Primera ventana logística válida aplicada (RN-04).');
        return;
      }

      if (target.closest('[data-action="submit-pickup-order"]')) {
        handleSubmitPickupOrder();
        return;
      }

      if (target.closest('[data-action="submit-b2b-order"]')) {
        handleSubmitB2BOrder();
        return;
      }

      // P-05 Tracking
      const trackBtn = target.closest('[data-track-order]');
      if (trackBtn) {
        store.setTrackedOrder(trackBtn.getAttribute('data-track-order'));
        return;
      }

      // P-06 & P-07 Staff POS
      const staffBlockBtn = target.closest('[data-staff-block]');
      if (staffBlockBtn) {
        ui.staffBlockFilter = staffBlockBtn.getAttribute('data-staff-block');
        renderAll();
        return;
      }

      const staffQuickDate = target.closest('[data-staff-quick-date]');
      if (staffQuickDate) {
        ui.staffDateFilter = staffQuickDate.getAttribute('data-staff-quick-date');
        renderAll();
        return;
      }

      const jumpStaffSlot = target.closest('[data-jump-staff-slot]');
      if (jumpStaffSlot) {
        const parts = jumpStaffSlot.getAttribute('data-jump-staff-slot').split('|');
        ui.staffDateFilter = parts[0];
        ui.staffBlockFilter = parts[1];
        renderAll();
        return;
      }

      const checkInBtn = target.closest('[data-checkin-res]');
      if (checkInBtn) {
        const updated = store.checkInReservation(checkInBtn.getAttribute('data-checkin-res'));
        if (updated) showToast(`Check-in confirmado en Mesa ${updated.tableId} (${updated.checkInTime}).`);
        return;
      }

      const expireBtn = target.closest('[data-expire-rn02]');
      if (expireBtn) {
        const expired = store.expireReservationNoShow(expireBtn.getAttribute('data-expire-rn02'));
        if (expired) showToast(`RN-02: Mesa ${expired.tableId} liberada a Disponible ("No presentó").`, true);
        return;
      }

      const manualTableBtn = target.closest('[data-manual-table]');
      if (manualTableBtn) {
        const parts = manualTableBtn.getAttribute('data-manual-table').split(':');
        store.setManualTableState(ui.staffDateFilter, ui.staffBlockFilter, Number(parts[0]), parts[1]);
        showToast(`Estado de Mesa ${parts[0]} actualizado.`);
        return;
      }

      const queueFilterBtn = target.closest('[data-queue-filter]');
      if (queueFilterBtn) {
        ui.queueFilter = queueFilterBtn.getAttribute('data-queue-filter');
        renderAll();
        return;
      }

      const advanceBtn = target.closest('[data-advance-order]');
      if (advanceBtn) {
        const updated = store.advanceOrderState(advanceBtn.getAttribute('data-advance-order'));
        if (updated) showToast(`${updated.id}: ${ORDER_STATES[updated.stepIndex]}`);
        return;
      }

      // P-08 Administradora
      const approveB2BBtn = target.closest('[data-approve-b2b]');
      if (approveB2BBtn) {
        const ord = store.approveB2BOrder(approveB2BBtn.getAttribute('data-approve-b2b'));
        if (ord) showToast(`Despacho aprobado para ${ord.customerName} (${ord.id}).`);
        return;
      }

      const openRejectBtn = target.closest('[data-open-reject-b2b]');
      if (openRejectBtn) {
        const ordId = openRejectBtn.getAttribute('data-open-reject-b2b');
        const ord = store.getState().orders.find(function (o) { return o.id === ordId; });
        ui.rejectModal = {
          open: true,
          orderId: ordId,
          brandName: ord ? ord.customerName : ordId,
          reason: '',
          error: ''
        };
        renderModals();
        return;
      }

      if (target.closest('[data-action="confirm-reject-b2b"]')) {
        if (!ui.rejectModal.reason.trim()) {
          ui.rejectModal.error = 'Ingresa obligatoriamente el motivo de rechazo (HU-14).';
          renderModals();
          return;
        }
        const ordId = ui.rejectModal.orderId;
        store.rejectB2BOrder(ordId, ui.rejectModal.reason);
        ui.rejectModal.open = false;
        renderModals();
        showToast(`Pedido ${ordId} rechazado y notificado.`, true);
        return;
      }

      const toggleWinBtn = target.closest('[data-toggle-window]');
      if (toggleWinBtn) {
        const winId = toggleWinBtn.getAttribute('data-toggle-window');
        const win = store.getState().logisticsWindows.find(function (w) { return w.id === winId; });
        if (win) {
          store.updateLogisticsWindow(winId, { active: !win.active });
          showToast(`Ventana "${win.name}" ${!win.active ? 'habilitada' : 'deshabilitada'}.`);
        }
        return;
      }

      const winDayBtn = target.closest('[data-win-day]');
      if (winDayBtn) {
        const parts = winDayBtn.getAttribute('data-win-day').split(':');
        const win = store.getState().logisticsWindows.find(function (w) { return w.id === parts[0]; });
        if (win) {
          const exists = win.days.includes(parts[1]);
          const nextDays = exists
            ? win.days.filter(function (d) { return d !== parts[1]; })
            : win.days.concat([parts[1]]);
          store.updateLogisticsWindow(win.id, { days: nextDays });
        }
        return;
      }

      const presetReasonBtn = target.closest('[data-block-preset]');
      if (presetReasonBtn) {
        ui.blockDraft.reason = presetReasonBtn.getAttribute('data-block-preset');
        ui.blockDraft.error = '';
        renderAll();
        return;
      }

      const toggleBlkTable = target.closest('[data-block-toggle-table]');
      if (toggleBlkTable) {
        const tId = Number(toggleBlkTable.getAttribute('data-block-toggle-table'));
        const exists = ui.blockDraft.tableIds.includes(tId);
        ui.blockDraft.tableIds = exists
          ? ui.blockDraft.tableIds.filter(function (id) { return id !== tId; })
          : ui.blockDraft.tableIds.concat([tId]);
        renderAll();
        return;
      }

      if (target.closest('[data-action="verify-and-apply-block"]')) {
        handleVerifyAndApplyAdminBlock();
        return;
      }

      if (target.closest('[data-action="confirm-force-admin-block"]')) {
        const payload = ui.conflictModal.pendingPayload;
        ui.conflictModal.open = false;
        if (payload) {
          store.applyAdminBlock(payload);
          showToast(`Bloqueo aplicado por "${payload.reason}".`, true);
        }
        renderModals();
        return;
      }

      const removeBlkBtn = target.closest('[data-remove-block]');
      if (removeBlkBtn) {
        store.removeAdminBlock(removeBlkBtn.getAttribute('data-remove-block'));
        showToast('Bloqueo eliminado.');
        return;
      }

      if (target.closest('[data-close-modals]') || (target.classList && target.classList.contains('modal-backdrop'))) {
        ui.lightbox.open = false;
        ui.modalRN01.open = false;
        ui.rejectModal.open = false;
        ui.conflictModal.open = false;
        renderModals();
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        if (ui.lightbox.open || ui.modalRN01.open || ui.rejectModal.open || ui.conflictModal.open) {
          ui.lightbox.open = false;
          ui.modalRN01.open = false;
          ui.rejectModal.open = false;
          ui.conflictModal.open = false;
          renderModals();
        }
      } else if (ui.lightbox.open && ev.key === 'ArrowRight') {
        ui.lightbox.index = (ui.lightbox.index + 1) % GALLERY_PHOTOS.length;
        renderModals();
      } else if (ui.lightbox.open && ev.key === 'ArrowLeft') {
        ui.lightbox.index = (ui.lightbox.index - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
        renderModals();
      }
    });

    function syncFormFieldElement(el, isChangeEvent) {
      if (!el || typeof el.hasAttribute !== 'function') return false;

      if (el.hasAttribute('data-res-field')) {
        const field = el.getAttribute('data-res-field');
        if (ui.reservationDraft[field] === el.value && isChangeEvent) return true;
        ui.reservationDraft[field] = el.value;
        if (ui.reservationDraft.errors[field]) {
          delete ui.reservationDraft.errors[field];
          el.classList.remove('input-error');
        }
        if (field === 'date') {
          ensureValidSelectedTableInDraft();
          renderAll();
        }
        return true;
      }

      if (el.hasAttribute('data-pickup-field')) {
        const field = el.getAttribute('data-pickup-field');
        ui.pickupDraft[field] = el.value;
        if (ui.pickupDraft.errors[field]) {
          delete ui.pickupDraft.errors[field];
          el.classList.remove('input-error');
        }
        return true;
      }

      if (el.hasAttribute('data-b2b-field')) {
        const field = el.getAttribute('data-b2b-field');
        const changed = ui.b2bDraft[field] !== el.value;
        ui.b2bDraft[field] = el.value;
        if (ui.b2bDraft.errors[field]) {
          delete ui.b2bDraft.errors[field];
          el.classList.remove('input-error');
        }
        if ((field === 'dateChoice' || field === 'windowChoice') && (changed || !isChangeEvent)) {
          renderAll();
        }
        return true;
      }

      if (el.hasAttribute('data-reject-reason-field')) {
        ui.rejectModal.reason = el.value;
        ui.rejectModal.error = '';
        return true;
      }

      if (el.hasAttribute('data-block-field')) {
        const field = el.getAttribute('data-block-field');
        const changed = ui.blockDraft[field] !== el.value;
        ui.blockDraft[field] = el.value;
        ui.blockDraft.error = '';
        if ((field === 'scope' || field === 'date' || field === 'timeBlockId') && (changed || !isChangeEvent)) {
          renderAll();
        }
        return true;
      }

      return false;
    }

    document.addEventListener('input', function (ev) {
      syncFormFieldElement(ev.target, false);
    });

    document.addEventListener('change', function (ev) {
      const el = ev.target;
      if (syncFormFieldElement(el, true)) return;

      if (el.hasAttribute('data-grain-weight-select')) {
        const itemId = el.getAttribute('data-grain-weight-select');
        ui.grainSelectedWeightByItem[itemId] = Number(el.value);
        return;
      }

      if (el.hasAttribute('data-staff-date-input')) {
        ui.staffDateFilter = el.value;
        renderAll();
        return;
      }

      if (el.hasAttribute('data-win-time')) {
        const parts = el.getAttribute('data-win-time').split(':');
        const patch = {};
        patch[parts[1]] = el.value;
        store.updateLogisticsWindow(parts[0], patch);
      }
    });
  }

  function handleConfirmReservation() {
    const d = ui.reservationDraft;
    const errors = {};

    const slotEval = store.evaluateTimeBlockStatus(d.date, d.timeBlockId);
    if (!slotEval.available) {
      const nextOpen = store.getNextAvailableTimeBlock(d.date, d.timeBlockId);
      ui.modalRN01 = {
        open: true,
        blockedTimeLabel: getBlockLabel(d.timeBlockId),
        reasonType: slotEval.reason === 'admin_block' ? 'admin_block' : 'rn01',
        adminBlockReason: slotEval.adminBlock ? slotEval.adminBlock.reason : '',
        nextSlot: nextOpen
      };
      renderModals();
      return;
    }

    if (!d.selectedTableId) {
      errors.table = 'Selecciona una mesa disponible con capacidad suficiente en el plano.';
    }
    if (!d.customerName || !d.customerName.trim()) {
      errors.customerName = 'Ingresa tu nombre completo para emitir el pase.';
    }

    d.errors = errors;
    if (Object.keys(errors).length > 0) {
      renderAll();
      return;
    }

    const baristaInfo = store.checkSpecialistBaristaAvailability(d.date, d.timeBlockId);
    const created = store.createReservation({
      date: d.date,
      guests: d.guests,
      timeBlockId: d.timeBlockId,
      tableId: d.selectedTableId,
      modality: d.modality,
      barista: d.modality === 'barismo' ? baristaInfo.baristaName : 'Equipo de Barra General',
      customerName: d.customerName
    });

    ui.staffDateFilter = created.date;
    ui.staffBlockFilter = created.timeBlockId;
    d.customerName = '';
    d.errors = {};

    navigateToScreen('P-03');
    showToast(`Reserva ${created.id} confirmada con éxito.`);
  }

  function handleSubmitPickupOrder() {
    const p = ui.pickupDraft;
    const errors = {};

    if (!p.customerName.trim()) errors.customerName = 'Ingresa tu nombre completo.';
    if (!p.phone.trim()) errors.phone = 'Ingresa un teléfono de contacto.';
    if (!p.pickupTime) errors.pickupTime = 'Selecciona la hora de retiro.';

    p.errors = errors;
    if (Object.keys(errors).length > 0) {
      renderAll();
      showToast('Revisa los campos resaltados para continuar.', true);
      return;
    }

    const created = store.createOrder({
      modality: 'pickup',
      customerName: p.customerName,
      phone: p.phone,
      scheduledDate: getISODateOffset(0),
      scheduledTimeLabel: p.pickupTime,
      notes: p.notes
    });

    p.customerName = '';
    p.phone = '';
    p.notes = '';
    p.errors = {};

    navigateToScreen('P-05');
    showToast(`Pedido ${created.id} enviado a barra en vivo.`);
  }

  function handleSubmitB2BOrder() {
    const b = ui.b2bDraft;
    const activeWindows = store.getActiveLogisticsWindows();
    const selectedWin = activeWindows.find(function (w) { return w.id === b.windowChoice; });

    if (b.dateChoice === 'today' || !selectedWin) {
      renderAll();
      showToast('Aplica una ventana logística válida con ≥ 24h (RN-04).', true);
      return;
    }

    const errors = {};
    if (!b.brandName.trim()) errors.brandName = 'Ingresa el nombre de la empresa o marca.';
    if (!b.contactPerson.trim()) errors.contactPerson = 'Ingresa el contacto responsable.';
    if (!b.deliveryAddress.trim()) errors.deliveryAddress = 'Ingresa la dirección de entrega.';

    b.errors = errors;
    if (Object.keys(errors).length > 0) {
      renderAll();
      showToast('Completa los datos corporativos obligatorios.', true);
      return;
    }

    const scheduledDate = b.dateChoice === 'tomorrow' ? getISODateOffset(1) : b.customDate;
    const datePrefix = b.dateChoice === 'tomorrow' ? 'Mañana' : scheduledDate;

    const created = store.createOrder({
      modality: 'b2b',
      customerName: b.brandName,
      contactPerson: b.contactPerson,
      deliveryAddress: b.deliveryAddress,
      scheduledDate: scheduledDate,
      scheduledTimeLabel: `${datePrefix} • ${selectedWin.startTime} - ${selectedWin.endTime} (${selectedWin.name})`,
      notes: b.notes
    });

    b.brandName = '';
    b.contactPerson = '';
    b.deliveryAddress = '';
    b.notes = '';
    b.errors = {};

    navigateToScreen('P-05');
    showToast(`Pedido B2B ${created.id} registrado exitosamente.`);
  }

  function handleVerifyAndApplyAdminBlock() {
    const bd = ui.blockDraft;
    if (!bd.reason.trim()) {
      bd.error = 'Especifica el motivo del evento o patrocinio.';
      renderAll();
      return;
    }
    if (bd.scope === 'tables' && bd.tableIds.length === 0) {
      bd.error = 'Selecciona al menos una mesa.';
      renderAll();
      return;
    }

    const conflicts = store.findConflictingReservations(
      bd.date,
      bd.timeBlockId,
      bd.scope,
      bd.tableIds
    );

    const payload = {
      date: bd.date,
      timeBlockId: bd.timeBlockId,
      scope: bd.scope,
      tableIds: bd.tableIds.slice(),
      reason: bd.reason.trim()
    };

    if (conflicts.length > 0) {
      ui.conflictModal = {
        open: true,
        conflicts: conflicts,
        pendingPayload: payload
      };
      renderModals();
      return;
    }

    store.applyAdminBlock(payload);
    showToast(`Horario bloqueado por "${payload.reason}".`);
  }

  function init() {
    attachEventDelegation();

    store.subscribe(function (_nextState, meta) {
      flashSyncBadge(meta && meta.source ? meta.source : '');
      renderAll();
    });

    const hash = (window.location.hash || '').replace('#', '').toUpperCase();
    if (SCREEN_META[hash]) {
      navigateToScreen(hash, true);
    } else {
      ensureValidSelectedTableInDraft();
      renderAll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
