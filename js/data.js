/**
 * Café del Centro — Plataforma Digital SPA
 * Catálogo con Fotografías Dedicadas, Trazabilidad Completa y Datos Iniciales (DESIGN.md)
 * Consultora: Linuxeros Digital Consulting (LDC) — Grupo 4
 */

(function (window) {
  'use strict';

  function getISODateOffset(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 14 Fotografías locales optimizadas (5 reales del local + 9 de producto dedicado)
  const IMAGES = {
    exterior: './img/Vista%20local%20exterior.jpeg',
    tazas: './img/Tazas%20de%20caf%C3%A9.jpg',
    helado: './img/Caf%C3%A9%20helado.jpg',
    preparacion: './img/Preparaci%C3%B3n%20de%20caf%C3%A9.jpg',
    mesas: './img/Vista%20-%20Mesas%20local.jpg',
    bolsaPacamara: './img/bolsa-pacamara.jpg',
    bolsaBourbon: './img/bolsa-bourbon.jpg',
    bolsaGeisha: './img/bolsa-geisha.jpg',
    espresso: './img/espresso.jpg',
    americano: './img/americano.jpg',
    latte: './img/latte.jpg',
    icedLatte: './img/iced-latte.jpg',
    frappe: './img/frappe.jpg',
    postreCasa: './img/postre-casa.jpg'
  };

  // Galería real del local físico en Centro Histórico
  const GALLERY_PHOTOS = [
    {
      id: 'gal-exterior',
      src: IMAGES.exterior,
      title: 'Fachada en Centro Histórico',
      caption: 'Esquina opuesta al Parque Libertad, San Salvador — Specialty Coffee | Est. 2023.'
    },
    {
      id: 'gal-tazas',
      src: IMAGES.tazas,
      title: 'Arte Latte en Taza Negra Mate',
      caption: 'Extracción calibrada con leche texturizada sedosa sobre mesas de terrazzo.'
    },
    {
      id: 'gal-preparacion',
      src: IMAGES.preparacion,
      title: 'Métodos Filtrados de Precisión',
      caption: 'Preparación artesanal por vertido con control exacto de gramos y tiempo.'
    },
    {
      id: 'gal-helado',
      src: IMAGES.helado,
      title: 'Croissant Artesanal & Iced Latte',
      caption: 'Empaque encerado oficial de la casa para disfrutar en barra o Pick-up.'
    },
    {
      id: 'gal-mesas',
      src: IMAGES.mesas,
      title: 'Salón Interior y Mapas Cafetaleros',
      caption: 'Ocho mesas con perfiles sensoriales de las cordilleras cafetaleras de El Salvador.'
    }
  ];

  const TIME_BLOCKS = [
    {
      id: '15:00',
      label: '3:00 PM - 4:00 PM',
      shortLabel: '3:00 PM',
      digitalCapReached: false
    },
    {
      id: '16:00',
      label: '4:00 PM - 5:00 PM',
      chipLabel: '4:00 PM - 5:00 PM (Aforo 80%)',
      shortLabel: '4:00 PM',
      digitalCapReached: true
    },
    {
      id: '17:15',
      label: '5:15 PM - 6:30 PM',
      shortLabel: '5:15 PM',
      digitalCapReached: false
    }
  ];

  // Catálogo oficial (12 ítems de DESIGN.md, sin textos decorativos superpuestos; solo estado Disponible / No disponible)
  const CATALOG_ITEMS = [
    {
      id: 'grain-pacamara',
      name: 'Bolsa Café Pacamara (1 lb / 5 lb B2B)',
      shortName: 'Bolsa Café Pacamara',
      category: 'Café en Grano (Libras)',
      price: 14.00,
      unit: 'lb',
      isGrain: true,
      available: true,
      statusLabel: 'Disponible',
      description: 'Grano gigante emblemático de El Salvador con dulzor intenso, cuerpo cremoso y posgusto prolongado.',
      flavorNotes: ['Miel de abeja', 'Frutas tropicales', 'Cacao fino'],
      image: IMAGES.bolsaPacamara,
      traceability: {
        finca: 'Las Brumas',
        caficultor: 'Don Carlos',
        proceso: 'Honey',
        variedad: 'Pacamara',
        tostador: 'Café del Centro'
      }
    },
    {
      id: 'grain-bourbon',
      name: 'Bolsa Café Bourbon Salvadoreño (1 lb / 5 lb B2B)',
      shortName: 'Bolsa Café Bourbon Salvadoreño',
      category: 'Café en Grano (Libras)',
      price: 12.50,
      unit: 'lb',
      isGrain: true,
      available: true,
      statusLabel: 'Disponible',
      description: 'Taza redonda y equilibrada cultivada bajo sombra en suelos volcánicos de la cordillera Ilamatepec.',
      flavorNotes: ['Caramelo', 'Naranja dulce', 'Almendra tostada'],
      image: IMAGES.bolsaBourbon,
      traceability: {
        finca: 'El Manzano, Santa Ana',
        caficultor: 'Familia Pacas',
        proceso: 'Lavado',
        variedad: 'Bourbon',
        tostador: 'Café del Centro'
      }
    },
    {
      id: 'grain-geisha',
      name: 'Bolsa Geisha Reserva Especial (1 lb)',
      shortName: 'Bolsa Geisha Reserva Especial',
      category: 'Café en Grano (Libras)',
      price: 22.00,
      unit: 'lb',
      isGrain: true,
      available: false, // Criterio de aceptación obligatorio HU-09
      statusLabel: 'No disponible',
      description: 'Lote de competencia secado en camas africanas con fragancia floral delicada. Cosecha agotada.',
      flavorNotes: ['Flor de jazmín', 'Bergamota', 'Durazno blanco'],
      image: IMAGES.bolsaGeisha,
      traceability: {
        finca: 'Montecarlos',
        caficultor: 'Carlos Batres',
        proceso: 'Natural',
        variedad: 'Geisha',
        tostador: 'Café del Centro'
      }
    },
    {
      id: 'exp-v60-chemex',
      name: 'Método V60 / Chemex en Mesa (Experiencia Educativa)',
      shortName: 'Método V60 / Chemex',
      category: 'Bebidas de Barra',
      price: 5.50,
      unit: 'taza',
      isGrain: false,
      isTableExperience: true,
      available: true,
      statusLabel: 'Disponible',
      description: 'Incluye demostración de granos en mesa y explicación de finca, productor y tostador por el barista (Bloquea mesa por 75 minutos).',
      flavorNotes: ['Cata guiada', 'Claridad aromática', 'Origen a elección'],
      image: IMAGES.preparacion,
      traceability: {
        finca: 'Las Brumas / El Manzano',
        caficultor: 'Selección de Temporada',
        proceso: 'Honey / Lavado',
        variedad: 'Pacamara & Bourbon',
        tostador: 'Café del Centro'
      }
    },
    {
      id: 'bar-espresso',
      name: 'Espresso',
      shortName: 'Espresso',
      category: 'Bebidas de Barra',
      price: 2.50,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Finca El Manzano | Tueste Medio. Extracción densa con crema atigrada avellanada y dulzor natural.',
      flavorNotes: ['Cacao 70%', 'Avellana', 'Cuerpo intenso'],
      image: IMAGES.espresso
    },
    {
      id: 'bar-americano',
      name: 'Americano',
      shortName: 'Americano',
      category: 'Bebidas de Barra',
      price: 2.75,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Cordillera de Apaneca | Notas a chocolate oscuro y panela. Taza limpia, brillante y reconfortante.',
      flavorNotes: ['Chocolate oscuro', 'Panela', 'Final limpio'],
      image: IMAGES.americano
    },
    {
      id: 'bar-capuccino',
      name: 'Capuccino',
      shortName: 'Capuccino',
      category: 'Bebidas de Barra',
      price: 3.50,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Servido en nuestra icónica taza negra mate artesanal con arte latte y microespuma aterciopelada.',
      flavorNotes: ['Textura cremosa', 'Dulzor lácteo', 'Balance ideal'],
      image: IMAGES.tazas
    },
    {
      id: 'bar-latte',
      name: 'Latte',
      shortName: 'Latte',
      category: 'Bebidas de Barra',
      price: 3.75,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Leche texturizada sedosa + Espresso doble de especialidad con notas suaves a caramelo y nuez.',
      flavorNotes: ['Suave y sedoso', 'Caramelo', 'Arte Latte'],
      image: IMAGES.latte
    },
    {
      id: 'bar-iced-latte',
      name: 'Iced Latte',
      shortName: 'Iced Latte',
      category: 'Bebidas de Barra',
      price: 4.00,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Vaso transparente con leche fría, hielo cristalino y doble carga de espresso recién extraído.',
      flavorNotes: ['Refrescante', 'Doble Espresso', 'Cremoso en frío'],
      image: IMAGES.icedLatte
    },
    {
      id: 'bar-frappe',
      name: 'Frappe',
      shortName: 'Frappe',
      category: 'Bebidas de Barra',
      price: 4.50,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Especialidad fría batida al momento con base de espresso salvadoreño, crema ligera y cacao.',
      flavorNotes: ['Granizado suave', 'Toque de cacao', 'Dulzor medio'],
      image: IMAGES.frappe
    },
    {
      id: 'past-croissant',
      name: 'Croissant Sandwich Artesanal',
      shortName: 'Croissant Sandwich Artesanal',
      category: 'Pastelería',
      price: 4.75,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Servido en papel encerado oficial de Café del Centro con masa hojaldrada dorada, jamón y queso fundido.',
      flavorNotes: ['Mantequilla', 'Recién horneado', 'Salado gourmet'],
      image: IMAGES.helado
    },
    {
      id: 'past-postre',
      name: 'Postre de la Casa',
      shortName: 'Postre de la Casa',
      category: 'Pastelería',
      price: 3.50,
      unit: 'unidad',
      isGrain: false,
      available: true,
      statusLabel: 'Disponible',
      description: 'Cheesecake vasco artesanal de centro cremoso, diseñado como maridaje ideal para cafés V60 y Chemex.',
      flavorNotes: ['Textura fundente', 'Tostado suave', 'Maridaje V60'],
      image: IMAGES.postreCasa
    }
  ];

  const BASE_TABLES = [
    { id: 1, name: 'Mesa 1', capacity: 2, zone: 'Vitrina Parque Libertad', isWalkInOnly: false },
    { id: 2, name: 'Mesa 2', capacity: 4, zone: 'Banqueta Terrazzo Norte', isWalkInOnly: false },
    { id: 3, name: 'Mesa 3', capacity: 4, zone: 'Galería Mapas Cafetaleros', isWalkInOnly: false },
    { id: 4, name: 'Mesa 4', capacity: 2, zone: 'Frente a Barra de Métodos', isWalkInOnly: false },
    { id: 5, name: 'Mesa 5', capacity: 6, zone: 'Mesa Grupal Salón Interior', isWalkInOnly: false },
    { id: 6, name: 'Mesa 6', capacity: 4, zone: 'Rincón Cultural Centro', isWalkInOnly: false },
    { id: 7, name: 'Mesa 7', capacity: 2, zone: 'Acceso Peatonal Exterior', isWalkInOnly: true },
    { id: 8, name: 'Mesa 8', capacity: 4, zone: 'Ventana Take-Out', isWalkInOnly: true }
  ];

  const ORDER_STATES = [
    'Orden Recibida',
    'En Preparación / Tostado',
    'Listo para Empacar / Entrega',
    'Entregado / En Ruta'
  ];

  function createInitialState() {
    const today = getISODateOffset(0);
    const tomorrow = getISODateOffset(1);

    return {
      version: 1,
      lastSyncAt: new Date().toISOString(),
      lastSyncSource: 'Carga inicial del sistema',
      nextReservationSeq: 104,
      nextOrderSeq: 209,

      reservations: [
        {
          id: '#RES-101',
          customerName: 'Valeria Rivas',
          guests: 2,
          date: today,
          timeBlockId: '15:00',
          timeBlockLabel: '3:00 PM - 4:00 PM',
          tableId: 4,
          modality: 'barismo',
          modalityLabel: 'Experiencia Educativa de Barismo (Métodos en Mesa)',
          durationMinutes: 75,
          barista: 'Camila Renderos',
          status: 'checked_in',
          checkInTime: '02:58 PM',
          delayedMinutes: 0,
          createdAt: '02:10 PM'
        },
        {
          id: '#RES-102',
          customerName: 'Roberto Méndez',
          guests: 3,
          date: today,
          timeBlockId: '15:00',
          timeBlockLabel: '3:00 PM - 4:00 PM',
          tableId: 3,
          modality: 'estandar',
          modalityLabel: 'Consumo Estándar',
          durationMinutes: 45,
          barista: 'Atención de Barra',
          status: 'reserved',
          checkInTime: null,
          delayedMinutes: 12,
          createdAt: '01:45 PM'
        },
        {
          id: '#RES-103',
          customerName: 'Sofía Martínez',
          guests: 4,
          date: today,
          timeBlockId: '15:00',
          timeBlockLabel: '3:00 PM - 4:00 PM',
          tableId: 6,
          modality: 'barismo',
          modalityLabel: 'Experiencia Educativa de Barismo (Métodos en Mesa)',
          durationMinutes: 75,
          barista: 'Mateo Aguilar',
          status: 'reserved',
          checkInTime: null,
          delayedMinutes: 0,
          createdAt: '02:30 PM'
        },
        {
          id: '#RES-095',
          customerName: 'Andrea Cáceres',
          guests: 2,
          date: today,
          timeBlockId: '16:00',
          timeBlockLabel: '4:00 PM - 5:00 PM',
          tableId: 1,
          modality: 'estandar',
          modalityLabel: 'Consumo Estándar',
          durationMinutes: 45,
          barista: 'Atención de Barra',
          status: 'checked_in',
          checkInTime: '03:55 PM',
          delayedMinutes: 0,
          createdAt: '11:20 AM'
        },
        {
          id: '#RES-096',
          customerName: 'Diego Portillo',
          guests: 4,
          date: today,
          timeBlockId: '16:00',
          timeBlockLabel: '4:00 PM - 5:00 PM',
          tableId: 2,
          modality: 'barismo',
          modalityLabel: 'Experiencia Educativa de Barismo (Métodos en Mesa)',
          durationMinutes: 75,
          barista: 'Alejandro Sura',
          status: 'reserved',
          checkInTime: null,
          delayedMinutes: 0,
          createdAt: '11:40 AM'
        },
        {
          id: '#RES-097',
          customerName: 'Lucía Hernández',
          guests: 4,
          date: today,
          timeBlockId: '16:00',
          timeBlockLabel: '4:00 PM - 5:00 PM',
          tableId: 3,
          modality: 'estandar',
          modalityLabel: 'Consumo Estándar',
          durationMinutes: 45,
          barista: 'Atención de Barra',
          status: 'reserved',
          checkInTime: null,
          delayedMinutes: 0,
          createdAt: '12:05 PM'
        },
        {
          id: '#RES-098',
          customerName: 'Javier Morales',
          guests: 2,
          date: today,
          timeBlockId: '16:00',
          timeBlockLabel: '4:00 PM - 5:00 PM',
          tableId: 4,
          modality: 'estandar',
          modalityLabel: 'Consumo Estándar',
          durationMinutes: 45,
          barista: 'Atención de Barra',
          status: 'checked_in',
          checkInTime: '03:59 PM',
          delayedMinutes: 0,
          createdAt: '12:15 PM'
        },
        {
          id: '#RES-099',
          customerName: 'Grupo Cultural San Salvador',
          guests: 6,
          date: today,
          timeBlockId: '16:00',
          timeBlockLabel: '4:00 PM - 5:00 PM',
          tableId: 5,
          modality: 'barismo',
          modalityLabel: 'Experiencia Educativa de Barismo (Métodos en Mesa)',
          durationMinutes: 75,
          barista: 'Camila Renderos',
          status: 'reserved',
          checkInTime: null,
          delayedMinutes: 0,
          createdAt: '12:50 PM'
        },
        {
          id: '#RES-100',
          customerName: 'Elena Salgado',
          guests: 3,
          date: today,
          timeBlockId: '16:00',
          timeBlockLabel: '4:00 PM - 5:00 PM',
          tableId: 6,
          modality: 'estandar',
          modalityLabel: 'Consumo Estándar',
          durationMinutes: 45,
          barista: 'Atención de Barra',
          status: 'checked_in',
          checkInTime: '04:01 PM',
          delayedMinutes: 0,
          createdAt: '01:10 PM'
        }
      ],

      manualTableOverrides: {},

      salonHistory: [
        {
          id: 'log-1',
          time: '02:58 PM',
          type: 'checkin',
          message: 'Mesa 4 (#RES-101 - Valeria Rivas) registró Check-in puntual - Experiencia de Barismo (75 min).'
        }
      ],

      activeClientReservationId: null,

      cart: [
        {
          itemId: 'grain-pacamara',
          quantity: 1,
          notes: 'Grano entero'
        },
        {
          itemId: 'bar-iced-latte',
          quantity: 1,
          notes: ''
        }
      ],

      orders: [
        {
          id: '#ORD-207',
          customerName: 'Gabriela Lemus',
          phone: '7845-1290',
          modality: 'pickup',
          modalityLabel: 'Pasar a Traer / Pick-up',
          itemsSummary: '1 lb Café Pacamara + 1 Croissant Sandwich Artesanal',
          items: [
            { itemId: 'grain-pacamara', name: 'Bolsa Café Pacamara', qty: 1, unit: 'lb', price: 14.00 },
            { itemId: 'past-croissant', name: 'Croissant Sandwich Artesanal', qty: 1, unit: 'unidad', price: 4.75 }
          ],
          totalLbs: 1,
          totalAmount: 18.75,
          scheduledDate: today,
          scheduledTime: 'Hoy - 3:15 PM',
          urgencyRank: 1,
          stepIndex: 2,
          b2bApprovalStatus: 'not_applicable',
          rejectionReason: '',
          deliveryAddress: 'Retiro en Barra - Centro Histórico',
          createdAt: '02:35 PM'
        },
        {
          id: '#ORD-208',
          customerName: 'Carlos Renderos',
          phone: '7122-9940',
          modality: 'pickup',
          modalityLabel: 'Pasar a Traer / Pick-up',
          itemsSummary: '2 lb Café Bourbon Salvadoreño + 2 Iced Latte',
          items: [
            { itemId: 'grain-bourbon', name: 'Bolsa Café Bourbon Salvadoreño', qty: 2, unit: 'lb', price: 12.50 },
            { itemId: 'bar-iced-latte', name: 'Iced Latte', qty: 2, unit: 'unidad', price: 4.00 }
          ],
          totalLbs: 2,
          totalAmount: 33.00,
          scheduledDate: today,
          scheduledTime: 'Hoy - 3:40 PM',
          urgencyRank: 2,
          stepIndex: 1,
          b2bApprovalStatus: 'not_applicable',
          rejectionReason: '',
          deliveryAddress: 'Retiro en Barra - Centro Histórico',
          createdAt: '02:50 PM'
        },
        {
          id: '#ORD-205',
          customerName: 'Alquimia Coffee',
          contactPerson: 'Fernando Bolaños',
          phone: '2264-8810',
          modality: 'b2b',
          modalityLabel: 'Mayorista / Marca Aliada B2B',
          itemsSummary: '15 lb Café Pacamara (Finca Las Brumas)',
          items: [
            { itemId: 'grain-pacamara', name: 'Bolsa Café Pacamara (Lote B2B)', qty: 15, unit: 'lb', price: 14.00 }
          ],
          totalLbs: 15,
          totalAmount: 210.00,
          scheduledDate: tomorrow,
          scheduledTime: 'Mañana - 07:00 AM - 08:30 AM (Pre-Apertura)',
          urgencyRank: 3,
          stepIndex: 0,
          b2bApprovalStatus: 'pending',
          rejectionReason: '',
          deliveryAddress: 'Col. Escalón, Pasaje Istmania #14, San Salvador',
          createdAt: '10:15 AM'
        },
        {
          id: '#ORD-206',
          customerName: 'Hotel Casa Libertad',
          contactPerson: 'Mariana Guirola',
          phone: '2211-4500',
          modality: 'b2b',
          modalityLabel: 'Mayorista / Marca Aliada B2B',
          itemsSummary: '10 lb Café Bourbon Salvadoreño (Finca El Manzano)',
          items: [
            { itemId: 'grain-bourbon', name: 'Bolsa Café Bourbon Salvadoreño (Lote B2B)', qty: 10, unit: 'lb', price: 12.50 }
          ],
          totalLbs: 10,
          totalAmount: 125.00,
          scheduledDate: tomorrow,
          scheduledTime: 'Mañana - 07:30 PM - 09:00 PM (Post-Cierre)',
          urgencyRank: 4,
          stepIndex: 1,
          b2bApprovalStatus: 'pending',
          rejectionReason: '',
          deliveryAddress: '4a Calle Oriente, Centro Histórico, San Salvador',
          createdAt: '11:40 AM'
        }
      ],

      activeTrackedOrderId: '#ORD-208',

      logisticsWindows: [
        {
          id: 'win-pre',
          name: 'Pre-Apertura',
          startTime: '07:00 AM',
          endTime: '08:30 AM',
          days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
          active: true
        },
        {
          id: 'win-post',
          name: 'Post-Cierre',
          startTime: '07:30 PM',
          endTime: '09:00 PM',
          days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
          active: true
        }
      ],

      adminBlocks: []
    };
  }

  window.CDC_DATA = {
    IMAGES,
    GALLERY_PHOTOS,
    TIME_BLOCKS,
    CATALOG_ITEMS,
    BASE_TABLES,
    ORDER_STATES,
    getISODateOffset,
    createInitialState
  };
})(window);
