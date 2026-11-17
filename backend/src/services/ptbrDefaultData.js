/**
 * Self-heal seeder: localise factory-default data to pt-BR.
 *
 * Some visible labels are seeded as data, in English, by upstream migrations:
 * photo category names (shown to guests as gallery filters), event type names
 * and the CMS pages (legal notice, privacy, "page / gallery not found").
 *
 * When the installation's default language is Portuguese (`pt`), each value is
 * replaced by its pt-BR text — but ONLY while it still equals the exact
 * upstream default. Anything an admin renamed or edited is left alone, so the
 * seeder is idempotent and safe on every boot.
 *
 * Technical identifiers (slugs, slug_prefix) are never changed: code relies on
 * them (e.g. event_reminder_<event_type> templates).
 *
 * CMS pages only have `en` and `de` columns, and every non-German visitor is
 * served the `en` column. On a pt-BR installation the `en` column therefore
 * carries the Portuguese text.
 *
 * Returns [] — nothing here affects the email queue.
 */

const CATEGORY_NAMES = {
  Ceremony: 'Cerimônia',
  Reception: 'Recepção',
  Portraits: 'Retratos',
  'Group Photos': 'Fotos em grupo',
  Details: 'Detalhes',
  Party: 'Festa',
};

const EVENT_TYPE_NAMES = {
  Wedding: 'Casamento',
  Birthday: 'Aniversário',
  Corporate: 'Corporativo',
  Other: 'Outro',
};

const CMS_PAGES = {
  impressum: {
    from: { title_en: 'Legal Notice', content_en: '<h2>Legal Notice</h2><p>Please edit this content in the admin panel.</p>' },
    to: { title_en: 'Aviso legal', content_en: '<h2>Aviso legal</h2><p>Edite este conteúdo no painel administrativo (Configurações → Páginas CMS).</p>' },
  },
  datenschutz: {
    from: { title_en: 'Privacy Policy', content_en: '<h2>Privacy Policy</h2><p>Please edit this content in the admin panel.</p>' },
    to: { title_en: 'Política de privacidade', content_en: '<h2>Política de privacidade</h2><p>Edite este conteúdo no painel administrativo (Configurações → Páginas CMS).</p>' },
  },
  'not-found': {
    from: { title_en: 'Page Not Found', content_en: '<h2>Page Not Found</h2><p>The page you are looking for does not exist or has been moved.</p>' },
    to: { title_en: 'Página não encontrada', content_en: '<h2>Página não encontrada</h2><p>A página que você procura não existe ou foi movida.</p>' },
  },
  'gallery-not-found': {
    from: {
      title_en: 'Gallery Not Found',
      content_en: '<h2>Gallery Not Found</h2><p>This gallery could not be found. The link may be incorrect, or the gallery may have expired or been archived. Please contact the organiser if you believe this is a mistake.</p>',
    },
    to: {
      title_en: 'Galeria não encontrada',
      content_en: '<h2>Galeria não encontrada</h2><p>Não foi possível encontrar esta galeria. O link pode estar incorreto ou a galeria pode ter expirado ou sido arquivada. Se você acredita que isso é um erro, entre em contato com o organizador.</p>',
    },
  },
};

// Payment conditions (seeded in German by migration 107). Shown on quote and
// invoice PDFs, so they reach customers. Matched by exact default name.
const PAYMENT_TEMPLATES = {
  'Komplettzahlung nach Auslieferung': {
    name: 'Pagamento integral após a entrega',
    description: 'Pagável após o recebimento das fotos, sem descontos.',
  },
  'Komplettzahlung vor Event': {
    name: 'Pagamento integral antes do evento',
    description: 'Pagável 7 dias antes do evento.',
  },
  'Komplettzahlung nach Event': {
    name: 'Pagamento integral após o evento',
    description: 'Pagável após o evento, antes da entrega.',
  },
  '3 Raten 30/30/40': {
    name: '3 parcelas 30/30/40',
    description: '30% na confirmação do pedido, 30% antes do evento, 40% após a entrega.',
  },
};
const INSTALLMENT_LABELS = {
  'Gesamtbetrag nach Auslieferung': 'Valor total após a entrega',
  'Gesamtbetrag vor Event': 'Valor total antes do evento',
  'Gesamtbetrag nach Event': 'Valor total após o evento',
  'Anzahlung bei Auftragsbestätigung': 'Entrada na confirmação do pedido',
  'Teilzahlung vor Event': 'Parcela antes do evento',
  'Schlusszahlung nach Auslieferung': 'Parcela final após a entrega',
};
const NET_DAYS_NAMES = { 'Sofort fällig': 'À vista', 'Net 14': '14 dias', 'Net 30': '30 dias', 'Net 60': '60 dias', 'Net 90': '90 dias' };

// Built-in workflows (admin only). Matched by builtin name; the upstream
// seeder rewrites them only on a version bump of an untouched copy, after
// which this seeder translates them again.
const WORKFLOW_NAMES = {
  'Invoice dunning (built-in)': 'Cobrança de faturas (integrado)',
  'Gallery expiring (built-in)': 'Galeria expirando (integrado)',
  'Gallery expired (built-in)': 'Galeria expirada (integrado)',
  'Pre-event reminder (built-in)': 'Lembrete antes do evento (integrado)',
  'Booking — quote → contract → event → invoice (built-in)': 'Reserva — orçamento → contrato → evento → fatura (integrado)',
  'Booking — quote → event → invoice (built-in)': 'Reserva — orçamento → evento → fatura (integrado)',
  'Booking — quote → invoice, no gallery (built-in)': 'Reserva — orçamento → fatura, sem galeria (integrado)',
};
const WORKFLOW_DESCRIPTIONS = {
  'Cobrança de faturas (integrado)': 'Conduz a cobrança de faturas vencidas pelo mecanismo de fluxos: aguarda a data de vencimento e executa até três ciclos de verificação de pagamento. Cada ciclo dispara o e-mail de confirmação de pagamento ao administrador (a etapa de aprovação), que aplica os lembretes e a multa por atraso pelo fluxo de verificação já existente; esgotados os ciclos, o caso é encaminhado à cobrança. DESATIVADO por padrão — a sequência fixa de lembretes continua funcionando até você ativar este fluxo; ao ativar, o mecanismo assume (a sequência fixa é suspensa para que nada seja enviado em dobro) e, ao desativar, tudo volta ao comportamento anterior.',
  'Galeria expirando (integrado)': 'Quando uma galeria se aproxima da data de expiração, envia ao cliente o aviso de expiração. DESATIVADO por padrão; o verificador de expiração de hora em hora continua enviando o aviso até você ativar este fluxo, que passa a usar o mesmo e-mail e suspende o envio antigo. Edite ou amplie aqui (ex.: um lembrete final para baixar as fotos).',
  'Galeria expirada (integrado)': 'Quando uma galeria passa da data de expiração, avisa o cliente (e o administrador) por e-mail. DESATIVADO por padrão; o verificador de expiração continua enviando o aviso até você ativar este fluxo, que passa a usar o mesmo e-mail e suspende o envio antigo. A galeria continua sendo arquivada automaticamente, independentemente deste fluxo.',
  'Lembrete antes do evento (integrado)': 'Alguns dias antes da data do evento, envia ao cliente o lembrete pré-evento. DESATIVADO por padrão; a rotina antiga de lembretes continua funcionando até você ativar este fluxo, que passa a usar a mesma lógica (template por tipo, configuração por evento, envio único) e suspende a rotina antiga. A antecedência é daysBefore na configuração do gatilho (preenchida a partir da sua configuração global anterior); as configurações por evento continuam valendo.',
  'Reserva — orçamento → contrato → evento → fatura (integrado)': 'Ao aceitar o orçamento: prepara o contrato, permite que o administrador o revise (itens / condições) e confirme antes do envio, aguarda a confirmação de que foi assinado, cria o evento/galeria e prepara a fatura COM ANTECEDÊNCIA para ajustes. O administrador aprova a fatura na etapa de revisão quando quiser; o envio aguarda a data do evento e acontece sozinho. Nenhum documento é enviado sem aprovação explícita. Desativado por padrão — as ações de documentos ainda são simuladas até a migração do fluxo de reservas, então uma execução ativada apenas registra etapas ignoradas. Um ponto de partida para editar.',
  'Reserva — orçamento → evento → fatura (integrado)': 'O caminho de reserva sem contrato: ao aceitar o orçamento, cria o evento/galeria e prepara a fatura com antecedência. O administrador a aprova na etapa de revisão; o envio aguarda a data do evento e acontece sozinho. Mesma regra de revisão antes do envio e mesma ressalva sobre ações simuladas do fluxo completo; desativado por padrão.',
  'Reserva — orçamento → fatura, sem galeria (integrado)': 'Para ensaios cobrados sem galeria on-line: ao aceitar o orçamento, prepara a fatura, o administrador revisa e aprova, e ela é enviada na hora (sem evento/galeria, sem espera). Escolha este fluxo por orçamento no seletor de fluxo de reserva. Mesma regra de revisão antes do envio e mesma ressalva sobre ações simuladas; desativado por padrão.',
};

async function translatePaymentTemplates(db, table) {
  if (!(await db.schema.hasTable(table))) return 0;
  const cols = await db(table).columnInfo();
  let n = 0;
  for (const row of await db(table).whereIn('name', Object.keys(PAYMENT_TEMPLATES))) {
    const to = PAYMENT_TEMPLATES[row.name];
    const patch = { name: to.name };
    if ('updated_at' in cols) patch.updated_at = new Date();
    if ('description' in cols) patch.description = to.description;
    if ('installments' in cols && row.installments) {
      try {
        const list = typeof row.installments === 'string' ? JSON.parse(row.installments) : row.installments;
        if (Array.isArray(list)) {
          const translated = list.map((it) => ({ ...it, label: INSTALLMENT_LABELS[it.label] || it.label }));
          patch.installments = JSON.stringify(translated);
        }
      } catch { /* leave installments untouched */ }
    }
    n += await db(table).where({ id: row.id }).update(patch);
  }
  return n;
}

async function translateWorkflows(db) {
  if (!(await db.schema.hasTable('workflows'))) return 0;
  let n = 0;
  for (const row of await db('workflows').whereIn('name', Object.keys(WORKFLOW_NAMES))) {
    const name = WORKFLOW_NAMES[row.name];
    n += await db('workflows').where({ id: row.id }).update({ name, description: WORKFLOW_DESCRIPTIONS[name] || row.description });
  }
  return n;
}

let done = false;

async function defaultLanguageIsPortuguese(db) {
  const row = await db('app_settings').where('setting_key', 'general_default_language').first();
  if (!row) return false;
  let value = row.setting_value;
  try { value = JSON.parse(value); } catch { /* plain string */ }
  return String(value || '').toLowerCase().startsWith('pt');
}

async function renameExact(db, table, column, map) {
  if (!(await db.schema.hasTable(table))) return 0;
  let n = 0;
  for (const [from, to] of Object.entries(map)) {
    n += await db(table).where(column, from).update({ [column]: to });
  }
  return n;
}

async function ensurePtBrDefaultDataLocalized(db, logger) {
  if (done) return [];
  const log = logger || { info: () => {}, warn: () => {} };
  if (!(await db.schema.hasTable('app_settings'))) return [];
  if (!(await defaultLanguageIsPortuguese(db))) return [];

  let changed = 0;
  changed += await renameExact(db, 'photo_categories', 'name', CATEGORY_NAMES);
  changed += await renameExact(db, 'event_types', 'name', EVENT_TYPE_NAMES);
  changed += await renameExact(db, 'payment_net_days_templates', 'name', NET_DAYS_NAMES);
  changed += await translatePaymentTemplates(db, 'payment_term_templates');
  changed += await translatePaymentTemplates(db, 'payment_timing_templates');
  changed += await translateWorkflows(db);

  if (await db.schema.hasTable('cms_pages')) {
    for (const [slug, { from, to }] of Object.entries(CMS_PAGES)) {
      changed += await db('cms_pages')
        .where({ slug, title_en: from.title_en, content_en: from.content_en })
        .update({ ...to, updated_at: new Date() });
    }
  }

  if (changed > 0) log.info(`pt-BR default data: localised ${changed} row(s)`);
  done = true;
  return [];
}

module.exports = { ensurePtBrDefaultDataLocalized };
