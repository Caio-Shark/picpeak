/**
 * Self-heal seeder: Brazilian Portuguese (pt / pt-BR) email-template translations.
 *
 * The upstream migrations ship `pt` rows for the core gallery/account
 * templates only. This seeder adds `pt` rows for every remaining template
 * (CRM quotes/invoices/contracts, event reminders, gallery lifecycle,
 * PicTransfer), so an installation whose default language is pt-BR never
 * falls back to English.
 *
 * Why a boot seeder and not a migration: PicPeak derives its "schema level"
 * (backup manifests, restore guards) from the newest migration file name. A
 * locally added migration would make this installation's backups look newer
 * than any official release. A seeder changes data only.
 *
 * Rules:
 *   - Insert-only. An existing (template_id, 'pt') row is never touched, so
 *     edits made in Admin → Email templates are preserved.
 *   - Templates that still keep their text in the legacy columns
 *     (subject_en/body_html_en/…) and have NO translation rows at all get
 *     `en` and `de` rows copied from those columns first. Without that, adding
 *     only a `pt` row would make processTemplate's "any available language"
 *     fallback send Portuguese to English/German recipients.
 *   - Unknown template keys are skipped (the feature may be absent).
 *
 * Returns [] — no template is created, so no queue recovery is needed.
 */

const SIGN_OFF = '<p style="margin-top: 24px;">Até breve,<br>{{business_name}}</p>';

const T = {
  archive_complete: {
    subject: 'Arquivamento concluído: {{event_name}}',
    body_html: `<h2>Arquivamento concluído</h2>
<p>Olá, {{host_name}},</p>
<p>A galeria de fotos "{{event_name}}" foi arquivada com sucesso.</p>
<p><strong>Detalhes do arquivo:</strong></p>
<ul>
  <li>Data do evento: {{event_date}}</li>
  <li>Arquivada em: {{archive_date}}</li>
  <li>Número de fotos: {{photo_count}}</li>
  <li>Tamanho do arquivo: {{archive_size}}</li>
</ul>
<p>O arquivo está armazenado com segurança e pode ser restaurado, se necessário.</p>
{{#if support_email}}<p>Dúvidas? Fale conosco em <a href="mailto:{{support_email}}">{{support_email}}</a>.</p>{{/if}}`,
    body_text: 'Arquivamento concluído\n\nOlá, {{host_name}},\n\nA galeria de fotos "{{event_name}}" foi arquivada com sucesso.\n\nData do evento: {{event_date}}\nArquivada em: {{archive_date}}\nNúmero de fotos: {{photo_count}}\nTamanho do arquivo: {{archive_size}}\n\nO arquivo está armazenado com segurança e pode ser restaurado, se necessário.\n\n{{#if support_email}}Dúvidas? Fale conosco em {{support_email}}.{{/if}}',
  },

  gallery_expired: {
    subject: 'Sua galeria de fotos expirou',
    body_html: `<h2>Galeria expirada</h2>
<p>Olá, {{host_name}},</p>
<p>Sua galeria de fotos "{{event_name}}" expirou em {{expiry_date}} e não está mais disponível on-line.</p>
<p>Suas fotos foram arquivadas com segurança — nada foi perdido.</p>
<p><strong>Detalhes da galeria:</strong></p>
<ul>
  <li>Data do evento: {{event_date}}</li>
  <li>Expirou em: {{expiry_date}}</li>
</ul>
{{#if support_email}}<p>Se precisar acessar as fotos arquivadas, fale conosco em <a href="mailto:{{support_email}}">{{support_email}}</a>.</p>{{/if}}`,
    body_text: 'Galeria expirada\n\nOlá, {{host_name}},\n\nSua galeria de fotos "{{event_name}}" expirou em {{expiry_date}} e não está mais disponível on-line.\n\nSuas fotos foram arquivadas com segurança — nada foi perdido.\n\nData do evento: {{event_date}}\nExpirou em: {{expiry_date}}\n\n{{#if support_email}}Se precisar acessar as fotos arquivadas, fale conosco em {{support_email}}.{{/if}}',
  },

  contract_sent: {
    subject: 'Contrato {{contract_number}} pronto para sua assinatura',
    body_html: `<h2>Contrato {{contract_number}}</h2>
<p>Olá, {{customer_name}},</p>
<p>Segue em anexo o contrato {{contract_number}}{{#if title}} — "{{title}}"{{/if}}{{#if event_name}} referente a "{{event_name}}"{{/if}}.</p>
<p>Você pode revisar e assinar o contrato diretamente no navegador pelo link abaixo:</p>
<p style="text-align: center; margin: 30px 0;">
  <a href="{{response_url}}" class="button">Revisar e assinar o contrato</a>
</p>
<p>Ou abra o contrato completo:<br>
<span style="word-break: break-all; font-size: 13px;">{{response_url}}</span></p>
{{#if valid_until}}<p style="font-size: 13px; color: #666;">Por favor, assine até {{valid_until}}.</p>{{/if}}`,
    body_text: 'Contrato {{contract_number}}\n\nOlá, {{customer_name}},\n\nRevise e assine o contrato {{contract_number}}.\n\nAbrir: {{response_url}}\n\n{{#if valid_until}}Por favor, assine até {{valid_until}}.{{/if}}',
  },

  contract_fully_signed: {
    subject: 'Contrato {{contract_number}} assinado pelas duas partes',
    body_html: `<h2>Contrato {{contract_number}} — totalmente assinado</h2>
<p>Olá, {{customer_name}},</p>
<p>As duas partes já assinaram o contrato {{contract_number}}{{#if title}} — "{{title}}"{{/if}}. O PDF com todas as assinaturas segue em anexo para os seus registros.</p>
<p style="font-size: 13px; color: #666;">Esta é a via assinada oficial. Guarde-a junto com o orçamento e as faturas relacionadas.</p>`,
    body_text: 'O contrato {{contract_number}} foi assinado pelas duas partes. O PDF assinado segue em anexo para os seus registros.',
  },

  contract_signed_admin_notification: {
    subject: 'Contrato {{contract_number}} assinado por {{customer_email}}',
    body_html: `<h2>Contrato assinado</h2><p>{{signed_customer_name}} ({{customer_email}}) acabou de assinar o contrato <strong>{{contract_number}}</strong>.</p>
<p style="text-align: center; margin: 30px 0;"><a href="{{admin_dashboard_url}}" class="button">Abrir no painel</a></p>
<p style="font-size: 13px; color: #666;">O PDF assinado e as provas da assinatura (nome digitado, IP, data/hora e imagem da assinatura, se desenhada) estão disponíveis na página de detalhes do contrato. Para torná-lo plenamente válido, assine também como contratado ou envie uma via assinada à mão.</p>`,
    body_text: 'Contrato {{contract_number}} assinado por {{signed_customer_name}} ({{customer_email}}). Abrir: {{admin_dashboard_url}}',
  },

  event_reminder_default: {
    subject: 'Lembrete: {{event_name}} em {{days_before}} dia(s)',
    body_html: `<p>Olá, {{customer_name}},</p>
<p>Passando para lembrar que <strong>{{event_name}}</strong> será em <strong>{{event_date}}</strong> — daqui a cerca de {{days_before}} dia(s).</p>
<p>Algumas coisas que nos ajudam a começar bem no dia:</p>
<ul>
  <li>Confirme o horário exato de início e o endereço (um link de localização ajuda muito).</li>
  <li>Avise se houver algo a que devamos ficar atentos — convidados importantes, surpresas, áreas restritas.</li>
  <li>Em locais fechados, um cantinho para montar o equipamento ajuda bastante.</li>
</ul>
<p>Se algo mudou desde a nossa última conversa, é só responder este e-mail.</p>
${SIGN_OFF}`,
    body_text: 'Olá, {{customer_name}},\n\nPassando para lembrar que {{event_name}} será em {{event_date}} — daqui a cerca de {{days_before}} dia(s).\n\nAlgumas coisas que nos ajudam a começar bem no dia:\n- Confirme o horário exato de início e o endereço.\n- Avise se houver algo a que devamos ficar atentos (convidados importantes, surpresas, áreas restritas).\n- Em locais fechados, um cantinho para montar o equipamento ajuda bastante.\n\nSe algo mudou desde a nossa última conversa, é só responder este e-mail.\n\nAté breve,\n{{business_name}}',
  },

  event_reminder_wedding: {
    subject: 'Seu casamento em {{event_date}} — últimos detalhes',
    body_html: `<p>Olá, {{customer_name}},</p>
<p>O grande dia está chegando — <strong>{{event_date}}</strong>, daqui a cerca de {{days_before}} dia(s). Estamos ansiosos!</p>
<p>Um pequeno checklist para que a cobertura fotográfica flua tranquilamente:</p>
<ul>
  <li><strong>Cronograma:</strong> uma programação aproximada, hora a hora (making of → cerimônia → retratos → recepção → festa), nos ajuda a antecipar cada momento.</li>
  <li><strong>Fotos de família:</strong> uma lista curta das fotos de grupo indispensáveis (com nomes) deixa as fotos formais rápidas e sem estresse.</li>
  <li><strong>Espaço do making of:</strong> um ambiente com luz natural (perto de janelas) faz toda a diferença.</li>
  <li><strong>Surpresas:</strong> conte para nós, para estarmos no lugar certo na hora certa — e sem estragar a surpresa.</li>
  <li><strong>Logística:</strong> horário da cerimônia, endereço do local, informações de estacionamento e telefone do cerimonialista no dia.</li>
</ul>
<p>Se algo mudou desde a nossa última conversa — mesmo detalhes pequenos — é só responder este e-mail.</p>
${SIGN_OFF}`,
    body_text: 'Olá, {{customer_name}},\n\nO grande dia está chegando — {{event_date}}, daqui a cerca de {{days_before}} dia(s). Estamos ansiosos!\n\nUm pequeno checklist para que a cobertura fotográfica flua tranquilamente:\n- Cronograma: uma programação aproximada, hora a hora, nos ajuda a antecipar cada momento.\n- Fotos de família: uma lista curta das fotos de grupo indispensáveis (com nomes).\n- Espaço do making of: um ambiente com luz natural faz toda a diferença.\n- Surpresas: conte para nós — sem estragar nada.\n- Logística: horário da cerimônia, endereço, estacionamento e contato do cerimonialista.\n\nSe algo mudou desde a nossa última conversa, é só responder este e-mail.\n\nAté breve,\n{{business_name}}',
  },

  event_reminder_birthday: {
    subject: '{{event_name}} em {{event_date}} — vamos alinhar?',
    body_html: `<p>Olá, {{customer_name}},</p>
<p>{{event_name}} está chegando: <strong>{{event_date}}</strong> — daqui a cerca de {{days_before}} dia(s). Vamos alinhar alguns pontos antes do dia:</p>
<ul>
  <li><strong>Número de convidados:</strong> quantas pessoas, aproximadamente? Isso nos ajuda a planejar as fotos de grupo e as espontâneas.</li>
  <li><strong>Programação:</strong> que horas será o parabéns? Queremos estar prontos para esse momento.</li>
  <li><strong>Tema ou traje:</strong> se houver, conte para acompanharmos o clima da festa.</li>
  <li><strong>Surpresas:</strong> algum convidado ou momento surpresa que devamos manter em segredo?</li>
</ul>
<p>Estamos ansiosos para celebrar — avise se algo mudou.</p>
${SIGN_OFF}`,
    body_text: 'Olá, {{customer_name}},\n\n{{event_name}} está chegando: {{event_date}} — daqui a cerca de {{days_before}} dia(s). Vamos alinhar:\n- Número de convidados: quantas pessoas, aproximadamente?\n- Programação: que horas será o parabéns?\n- Tema ou traje, se houver.\n- Surpresas que devamos manter em segredo?\n\nEstamos ansiosos para celebrar — avise se algo mudou.\n\nAté breve,\n{{business_name}}',
  },

  event_reminder_corporate: {
    subject: 'Preparação da cobertura: {{event_name}} em {{event_date}}',
    body_html: `<p>Olá, {{customer_name}},</p>
<p>{{event_name}} será em <strong>{{event_date}}</strong> — daqui a cerca de {{days_before}} dia(s). Para garantir que a cobertura atenda aos seus objetivos, alguns itens para confirmar:</p>
<ul>
  <li><strong>Briefing:</strong> para que serão as fotos — comunicação interna, kit de imprensa, redes sociais, site? Isso influencia enquadramentos e cortes.</li>
  <li><strong>Agenda / roteiro:</strong> quem fala e quando, além de momentos que mereçam destaque (premiações, painéis, perguntas e respostas).</li>
  <li><strong>Convidados VIP e marca:</strong> uma lista curta de nomes prioritários, além das diretrizes de logotipo/cores para manter a identidade consistente.</li>
  <li><strong>Acesso:</strong> entrada, doca de carga (se houver) e contato no local pela manhã. É preciso documento com foto ou credenciamento?</li>
  <li><strong>Confidencialidade:</strong> alguma sessão estritamente interna / sem fotos?</li>
  <li><strong>Entrega:</strong> prazo aproximado de que você precisa (seleção para imprensa em 24 h, galeria completa depois)?</li>
</ul>
<p>Se preferir, podemos fazer uma ligação rápida de 10 minutos antes do evento.</p>
${SIGN_OFF}`,
    body_text: 'Olá, {{customer_name}},\n\n{{event_name}} será em {{event_date}} — daqui a cerca de {{days_before}} dia(s). Para garantir que a cobertura atenda aos seus objetivos, alguns itens para confirmar:\n- Briefing: comunicação interna, kit de imprensa, redes sociais, site?\n- Agenda / roteiro: palestrantes, premiações, painéis, perguntas e respostas.\n- Convidados VIP e marca: nomes prioritários e diretrizes de logotipo/cores.\n- Acesso: entrada, doca de carga, contato no local. Precisa de documento com foto?\n- Confidencialidade: alguma sessão sem fotos?\n- Entrega: prazo aproximado (seleção para imprensa em 24 h, galeria completa depois)?\n\nSe preferir, podemos fazer uma ligação rápida de 10 minutos antes do evento.\n\nAté breve,\n{{business_name}}',
  },

  event_reminder_other: {
    subject: '{{event_name}} em {{event_date}} — preparação',
    body_html: `<p>Olá, {{customer_name}},</p>
<p>{{event_name}} será em <strong>{{event_date}}</strong> — daqui a cerca de {{days_before}} dia(s). Uma breve nota de preparação:</p>
<ul>
  <li><strong>Horário e endereço:</strong> por favor, confirme os dois — até pequenas mudanças afetam a chegada e a montagem.</li>
  <li><strong>Roteiro do dia:</strong> uma linha do tempo aproximada dos momentos principais (início, destaques, encerramento) nos ajuda a estar no lugar certo.</li>
  <li><strong>Espaço para montagem:</strong> em local fechado, um cantinho para o equipamento faz diferença.</li>
  <li><strong>Algo específico:</strong> pessoas prioritárias, coisas a evitar, traje, surpresas — é só nos avisar.</li>
</ul>
<p>Se algo mudou desde a nossa última conversa, é só responder este e-mail.</p>
${SIGN_OFF}`,
    body_text: 'Olá, {{customer_name}},\n\n{{event_name}} será em {{event_date}} — daqui a cerca de {{days_before}} dia(s). Uma breve nota de preparação:\n- Horário e endereço: por favor, confirme os dois.\n- Roteiro do dia: uma linha do tempo aproximada dos momentos principais.\n- Espaço para montagem: um cantinho para o equipamento, se for em local fechado.\n- Algo específico: pessoas prioritárias, coisas a evitar, traje, surpresas.\n\nSe algo mudou, é só responder este e-mail.\n\nAté breve,\n{{business_name}}',
  },

  invoice_sent: {
    subject: 'Fatura {{invoice_number}} — {{total_amount}}',
    body_html: `<h2>Fatura {{invoice_number}}</h2><p>Olá, {{customer_name}},</p>
<p>Segue em anexo a fatura {{invoice_number}}{{#if event_name}} referente a "{{event_name}}"{{/if}}.</p>
<p><strong>Valor:</strong> {{total_amount}}<br><strong>Vencimento:</strong> {{due_date}}{{#if installment_label}}<br><strong>Parcela:</strong> {{installment_label}} ({{installment_index}}/{{installment_total}}){{/if}}</p>
<p>Os dados para pagamento estão no PDF anexo.</p>`,
    body_text: 'Fatura {{invoice_number}}: {{total_amount}}, vencimento em {{due_date}}.',
  },

  invoice_reminder_first: {
    subject: 'Lembrete: a fatura {{invoice_number}} está vencida',
    body_html: `<h2>Lembrete de pagamento</h2><p>Olá, {{customer_name}},</p>
<p>Nossos registros mostram que a fatura <strong>{{invoice_number}}</strong> (vencimento original em {{due_date}}) está vencida há {{days_overdue}} dias. O valor em aberto é <strong>{{total_amount}}</strong>.</p>
<p>Se você já realizou o pagamento, desconsidere este lembrete. Caso contrário, segue em anexo uma nova via.</p>`,
    body_text: 'A fatura {{invoice_number}} está vencida há {{days_overdue}} dias. Valor em aberto: {{total_amount}}.',
  },

  invoice_reminder_second: {
    subject: 'Segundo lembrete: fatura {{invoice_number}}',
    body_html: `<h2>Segundo lembrete de pagamento</h2><p>Olá, {{customer_name}},</p>
<p>A fatura <strong>{{invoice_number}}</strong> está vencida há {{days_overdue}} dias. Conforme previsto em nossas condições de pagamento, foi acrescentada uma multa por atraso de <strong>{{late_fee_amount}}</strong>. O novo total é <strong>{{new_total_amount}}</strong>.</p>
<p>Pedimos que o valor em aberto seja quitado o quanto antes. Segue em anexo a fatura atualizada.</p>`,
    body_text: 'Segundo lembrete da fatura {{invoice_number}}. Multa por atraso de {{late_fee_amount}} acrescentada. Novo total: {{new_total_amount}}.',
  },

  invoice_paid_receipt: {
    subject: 'Recibo da fatura {{invoice_number}}',
    body_html: `<h2>Pagamento recebido</h2><p>Olá, {{customer_name}},</p>
<p>Recebemos seu pagamento de <strong>{{paid_amount}}</strong> referente à fatura {{invoice_number}} em {{paid_at}}. Muito obrigado!</p>`,
    body_text: 'Recibo: {{paid_amount}} recebido referente à fatura {{invoice_number}} em {{paid_at}}.',
  },

  invoice_cancelled: {
    subject: 'Fatura {{invoice_number}} cancelada',
    body_html: '<p>Olá, {{customer_name}},</p><p>A fatura {{invoice_number}} foi cancelada. Desconsidere quaisquer lembretes anteriores referentes a ela.</p>',
    body_text: 'A fatura {{invoice_number}} foi cancelada.',
  },

  storno_issued: {
    subject: 'Fatura de estorno {{storno_number}} referente à fatura {{original_invoice_number}}',
    body_html: `<p>Olá, {{customer_name}},</p>
<p>Segue em anexo a fatura de estorno <strong>{{storno_number}}</strong>, que anula formalmente a fatura <strong>{{original_invoice_number}}</strong> de {{original_issue_date}}, no valor de {{total_amount}}.</p>
<p>A fatura original não deve mais ser paga. Guarde o PDF anexo para os seus registros e desconsidere lembretes anteriores.</p>`,
    body_text: 'A fatura de estorno {{storno_number}} anula formalmente a fatura {{original_invoice_number}} de {{original_issue_date}}, no valor de {{total_amount}}. A fatura original não deve mais ser paga. PDF em anexo.',
  },

  invoice_payment_check: {
    subject: 'Verifique o pagamento da fatura {{invoice_number}}',
    body_html: `<h2>Hora de verificar um pagamento</h2>
<p>A fatura <strong>{{invoice_number}}</strong> de <strong>{{customer_name}}</strong>{{#if event_name}} ({{event_name}}){{/if}} venceu em <strong>{{due_date}}</strong>. Total: <strong>{{total_amount}}</strong>.</p>
<p>Confira no seu banco o que foi recebido (se algo foi) e clique no botão correspondente abaixo — não é preciso fazer login.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px auto; border-collapse: collapse;">
  <tr>
    <td style="padding: 0 6px;">
      <a href="{{paid_url}}" style="background: #16a34a; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Pago integralmente</a>
    </td>
    {{#if has_skonto}}<td style="padding: 0 6px;">
      <a href="{{skonto_url}}" style="background: #0d9488; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Pago com desconto antecipado ({{skonto_amount}})</a>
    </td>{{/if}}
    <td style="padding: 0 6px;">
      <a href="{{partial_url}}" style="background: #2563eb; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Pago parcialmente</a>
    </td>
    <td style="padding: 0 6px;">
      <a href="{{unpaid_url}}" style="background: #dc2626; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Ainda não pago</a>
    </td>
  </tr>
</table>
<p style="font-size: 13px; color: #666;">Se você escolher "Ainda não pago" ou "Pago parcialmente", o sistema colocará na fila o próximo lembrete ao cliente{{#if late_fee_due}}, incluindo uma multa por atraso de {{late_fee_amount}}{{/if}}.</p>`,
    body_text: 'Hora de verificar um pagamento\n\nA fatura {{invoice_number}} de {{customer_name}}{{#if event_name}} ({{event_name}}){{/if}} venceu em {{due_date}}. Total: {{total_amount}}.\n\nConfirme o que foi recebido:\n  Pago integralmente:     {{paid_url}}{{#if has_skonto}}\n  Pago com desconto antecipado ({{skonto_amount}}): {{skonto_url}}{{/if}}\n  Parcial:                {{partial_url}}\n  Ainda não pago:         {{unpaid_url}}\n\nEscolher "Ainda não pago" ou "Pago parcialmente" coloca na fila o lembrete ao cliente{{#if late_fee_due}}, incluindo uma multa por atraso de {{late_fee_amount}}{{/if}}.',
  },

  invoice_payment_check_action_recorded: {
    subject: 'Ação de verificação de pagamento registrada: fatura {{invoice_number}}',
    body_html: `<h2>Link de verificação de pagamento usado</h2>
<p>Alguém usou o link de verificação de pagamento (sem login) da fatura <strong>{{invoice_number}}</strong>{{#if customer_name}} ({{customer_name}}){{/if}}{{#if event_name}}, {{event_name}}{{/if}} e registrou: <strong>{{action}}</strong>{{#if has_amount}} ({{amount}}){{/if}}.</p>
<table role="presentation" cellpadding="6" cellspacing="0" border="0" style="border-collapse: collapse; margin: 16px 0;">
  <tr><td style="color: #666;">Ação</td><td><strong>{{action}}</strong></td></tr>
  {{#if has_amount}}<tr><td style="color: #666;">Valor</td><td>{{amount}}</td></tr>{{/if}}
  <tr><td style="color: #666;">Endereço IP</td><td>{{ip}}</td></tr>
  <tr><td style="color: #666;">Registrado em</td><td>{{recorded_at}}</td></tr>
</table>
<p style="font-size: 13px; color: #666;">Este link não exige login — apenas o token da URL. Se você não reconhece esta ação, revise a fatura no painel administrativo.</p>`,
    body_text: 'Link de verificação de pagamento usado\n\nFatura {{invoice_number}}{{#if customer_name}} ({{customer_name}}){{/if}}{{#if event_name}}, {{event_name}}{{/if}} — registrado: {{action}}{{#if has_amount}} ({{amount}}){{/if}}.\n\n  Endereço IP:    {{ip}}\n  Registrado em:  {{recorded_at}}\n\nEste link não exige login — apenas o token da URL. Se você não reconhece esta ação, revise a fatura no painel administrativo.',
  },

  invoice_paid_admin_notification: {
    subject: 'Pagamento recebido: fatura {{invoice_number}}',
    body_html: `<h2>Pagamento registrado</h2>
<p>A fatura <strong>{{invoice_number}}</strong> de <strong>{{customer_name}}</strong>{{#if event_name}} ({{event_name}}){{/if}} foi marcada como paga integralmente.</p>
<table role="presentation" cellpadding="6" cellspacing="0" border="0" style="border-collapse: collapse; margin: 16px 0;">
  <tr><td style="color: #666;">Valor total da fatura</td><td><strong>{{total_amount}}</strong></td></tr>
  <tr><td style="color: #666;">Total pago</td><td><strong>{{paid_amount}}</strong></td></tr>
  {{#if skonto_applied}}<tr><td style="color: #0d9488;">Pago com desconto antecipado ({{skonto_percent}}%)</td><td style="color: #0d9488;"><strong>−{{skonto_discount_amount}}</strong></td></tr>{{/if}}
  {{#if payment_method}}<tr><td style="color: #666;">Forma de pagamento</td><td>{{payment_method}}</td></tr>{{/if}}
  {{#if payment_reference}}<tr><td style="color: #666;">Referência</td><td>{{payment_reference}}</td></tr>{{/if}}
  <tr><td style="color: #666;">Registrado em</td><td>{{paid_at}}</td></tr>
</table>
<p style="font-size: 13px; color: #666;">Esta é uma notificação automática — nenhuma ação é necessária.</p>`,
    body_text: 'Pagamento registrado\n\nA fatura {{invoice_number}} de {{customer_name}}{{#if event_name}} ({{event_name}}){{/if}} foi marcada como paga integralmente.\n\n  Valor total da fatura:   {{total_amount}}\n  Total pago:              {{paid_amount}}{{#if skonto_applied}}\n  Pago com desconto antecipado ({{skonto_percent}}%): -{{skonto_discount_amount}}{{/if}}{{#if payment_method}}\n  Forma de pagamento:      {{payment_method}}{{/if}}{{#if payment_reference}}\n  Referência:              {{payment_reference}}{{/if}}\n  Registrado em:           {{paid_at}}\n\nEsta é uma notificação automática — nenhuma ação é necessária.',
  },

  invoice_collections_handoff: {
    subject: 'Encaminhar para cobrança: fatura {{invoice_number}} continua em aberto após os lembretes',
    body_html: `<h2>Pronta para encaminhar à cobrança</h2>
<p>A fatura <strong>{{invoice_number}}</strong>{{#if event_name}} ({{event_name}}){{/if}} continua em aberto após {{reminder_level}} lembretes. O PDF da fatura segue em anexo para encaminhamento.</p>
<table role="presentation" cellpadding="6" cellspacing="0" border="0" style="border-collapse: collapse; margin: 16px 0;">
  <tr><td style="color:#666;">Cliente</td><td><strong>{{customer_name}}</strong></td></tr>
  {{#if customer_email}}<tr><td style="color:#666;">E-mail</td><td>{{customer_email}}</td></tr>{{/if}}
  {{#if customer_address}}<tr><td style="color:#666;">Endereço</td><td>{{customer_address}}</td></tr>{{/if}}
  <tr><td style="color:#666;">Vencimento</td><td>{{due_date}}</td></tr>
  <tr><td style="color:#666;">Valor original</td><td>{{original_amount}}</td></tr>
  {{#if late_fee_amount}}<tr><td style="color:#666;">Multas por atraso</td><td>{{late_fee_amount}}</td></tr>{{/if}}
  <tr><td style="color:#666;">Pago</td><td>{{paid_amount}}</td></tr>
  <tr><td style="color:#666;"><strong>Em aberto</strong></td><td><strong>{{outstanding_amount}}</strong></td></tr>
</table>
<p style="font-size:13px;color:#666;">Encaminhe à sua empresa de cobrança ou ao setor jurídico. Notificação automática.</p>`,
    body_text: 'Pronta para encaminhar à cobrança\n\nA fatura {{invoice_number}}{{#if event_name}} ({{event_name}}){{/if}} continua em aberto após {{reminder_level}} lembretes. O PDF da fatura segue em anexo.\n\n  Cliente:         {{customer_name}}{{#if customer_email}}\n  E-mail:          {{customer_email}}{{/if}}{{#if customer_address}}\n  Endereço:        {{customer_address}}{{/if}}\n  Vencimento:      {{due_date}}\n  Valor original:  {{original_amount}}{{#if late_fee_amount}}\n  Multas:          {{late_fee_amount}}{{/if}}\n  Pago:            {{paid_amount}}\n  Em aberto:       {{outstanding_amount}}\n\nEncaminhe à sua empresa de cobrança ou ao setor jurídico.',
  },

  quote_sent: {
    subject: 'Seu orçamento {{quote_number}} está pronto',
    body_html: `<h2>Orçamento {{quote_number}}</h2>
<p>Olá, {{customer_name}},</p>
<p>Segue em anexo o orçamento {{quote_number}}{{#if event_name}} referente a "{{event_name}}"{{/if}}. Valor total: <strong>{{total_amount}}</strong>.</p>
<p>Você pode aceitar ou recusar este orçamento diretamente pelos botões abaixo:</p>
<p style="text-align: center; margin: 30px 0;">
  <a href="{{accept_url}}" class="button">Aceitar orçamento</a>
  &nbsp;
  <a href="{{decline_url}}" style="display:inline-block;padding:10px 20px;color:#666;text-decoration:underline;">Recusar</a>
</p>
<p>Ou abra o orçamento completo no navegador:<br>
<span style="word-break: break-all; font-size: 13px;">{{response_url}}</span></p>
{{#if valid_until}}<p style="font-size: 13px; color: #666;">Este orçamento é válido até {{valid_until}}.</p>{{/if}}`,
    body_text: 'Orçamento {{quote_number}}\n\nOlá, {{customer_name}},\n\nSegue em anexo o orçamento {{quote_number}}. Total: {{total_amount}}.\n\nResponder: {{response_url}}\nAceitar: {{accept_url}}\nRecusar: {{decline_url}}\n\n{{#if valid_until}}Válido até {{valid_until}}.{{/if}}',
  },

  quote_accepted_customer: {
    subject: 'Orçamento {{quote_number}} aceito — obrigado!',
    body_html: `<h2>Obrigado!</h2>
<p>Olá, {{customer_name}},</p>
<p>Confirmamos que o orçamento <strong>{{quote_number}}</strong>{{#if event_name}} referente a "{{event_name}}"{{/if}} foi aceito. Total: <strong>{{total_amount}}</strong>.</p>
{{#if accepted_on_behalf}}<p style="font-size: 13px; color: #666;">Este aceite foi registrado em seu nome pelo seu fotógrafo.</p>{{/if}}
<p>Em breve entraremos em contato com os próximos passos.</p>`,
    body_text: 'Olá, {{customer_name}},\n\nConfirmamos que o orçamento {{quote_number}}{{#if event_name}} referente a "{{event_name}}"{{/if}} foi aceito. Total: {{total_amount}}.\n{{#if accepted_on_behalf}}\nEste aceite foi registrado em seu nome pelo seu fotógrafo.\n{{/if}}\nEm breve entraremos em contato com os próximos passos.',
  },

  quote_accepted_admin: {
    subject: 'Orçamento {{quote_number}} aceito por {{customer_email}}',
    body_html: `<h2>Orçamento aceito</h2><p>{{customer_email}} acabou de aceitar o orçamento <strong>{{quote_number}}</strong>{{#if event_name}} referente a "{{event_name}}"{{/if}}. Total: {{total_amount}}.</p>
<p style="text-align: center; margin: 30px 0;"><a href="{{admin_dashboard_url}}" class="button">Abrir no painel</a></p>`,
    body_text: 'Orçamento {{quote_number}} aceito por {{customer_email}}. Abrir: {{admin_dashboard_url}}',
  },

  quote_declined_admin: {
    subject: 'Orçamento {{quote_number}} recusado por {{customer_email}}',
    body_html: `<p>{{customer_email}} recusou o orçamento <strong>{{quote_number}}</strong>{{#if event_name}} referente a "{{event_name}}"{{/if}}.</p>
<p><a href="{{admin_dashboard_url}}">Abrir o orçamento no painel</a></p>`,
    body_text: 'Orçamento {{quote_number}} recusado por {{customer_email}}. Abrir: {{admin_dashboard_url}}',
  },

  transfer_ready: {
    subject: '{{transfer_title}} — seus arquivos estão prontos para download',
    body_html: `
<h2>Seus arquivos estão prontos</h2>

<p>Olá,</p>

<p>{{transfer_title}} está pronto para você — baixe tudo com um único clique abaixo.</p>

{{#if message}}
<div style="background-color: #f6f6f4; border-left: 4px solid #5C8762; padding: 16px 20px; margin: 20px 0; border-radius: 4px; white-space: pre-line;">{{message}}</div>
{{/if}}

<p style="margin: 28px 0;">
  <a href="{{download_url}}" class="button">Baixar seus arquivos</a>
</p>

<p style="color: #555555;">O link fica ativo até {{expiry_date}} e inclui {{file_count}} arquivo(s).</p>

<p style="color: #999999; font-size: 13px;">O botão não funciona? Copie este link no seu navegador:<br>{{download_url}}</p>

<p>Aproveite suas fotos!</p>`,
    body_text: 'Seus arquivos estão prontos\n\nOlá,\n\n{{transfer_title}} está pronto para você — baixe tudo pelo link abaixo.\n{{#if message}}\n\n{{message}}\n{{/if}}\n\nBaixar seus arquivos:\n{{download_url}}\n\nO link fica ativo até {{expiry_date}} e inclui {{file_count}} arquivo(s).\n\nAproveite suas fotos!',
  },

  transfer_link_expired: {
    subject: 'Um link de transferência expirou — {{transfer_title}}',
    body_html: `
<h2>Um link de transferência expirou</h2>

<p>A transferência de arquivos abaixo não pode mais ser baixada pelo destinatário:</p>

<div style="background-color: #f0f8ff; border-left: 4px solid #5C8762; padding: 20px; margin: 20px 0; border-radius: 4px;">
  <p style="margin: 0;"><strong>Transferência:</strong> {{transfer_title}}</p>
  <p style="margin: 10px 0 0 0;"><strong>Expirou em:</strong> {{expiry_date}}</p>
  <p style="margin: 10px 0 0 0;"><strong>Arquivos incluídos:</strong> {{file_count}}</p>
  <p style="margin: 10px 0 0 0;"><strong>Envios recebidos do cliente:</strong> {{upload_count}}</p>
</div>

<p>Os arquivos serão mantidos por mais {{grace_days}} dias (até {{delete_date}})
para que você possa compartilhar novamente ou recuperar o que ainda precisar; depois disso,
eles são excluídos automaticamente.</p>

<p><a href="{{admin_url}}">Abrir o PicTransfer no painel administrativo</a></p>

<p>Atenciosamente,<br>
Sua instalação do PicPeak</p>`,
    body_text: 'Um link de transferência expirou\n\nA transferência de arquivos abaixo não pode mais ser baixada pelo destinatário:\n\nTransferência: {{transfer_title}}\nExpirou em: {{expiry_date}}\nArquivos incluídos: {{file_count}}\nEnvios recebidos do cliente: {{upload_count}}\n\nOs arquivos serão mantidos por mais {{grace_days}} dias (até {{delete_date}}) para que\nvocê possa compartilhar novamente ou recuperar o que ainda precisar; depois disso,\neles são excluídos automaticamente.\n\nAbrir o PicTransfer no painel administrativo: {{admin_url}}\n\nAtenciosamente,\nSua instalação do PicPeak',
  },
};

const LANGUAGE = 'pt';
let done = false;

async function copyLegacyColumnsIfUntranslated(db, template, now) {
  const existing = await db('email_template_translations').where({ template_id: template.id }).count({ n: '*' }).first();
  if (Number(existing && existing.n) > 0) return;
  for (const lang of ['en', 'de']) {
    const subject = template[`subject_${lang}`];
    const html = template[`body_html_${lang}`];
    if (!subject && !html) continue;
    await db('email_template_translations').insert({
      template_id: template.id,
      language: lang,
      subject: subject || '',
      body_html: html || '',
      body_text: template[`body_text_${lang}`] || '',
      created_at: now,
      updated_at: now,
    });
  }
}

async function ensurePtBrEmailTemplatesSeeded(db, logger) {
  if (done) return [];
  const log = logger || { info: () => {}, warn: () => {} };
  if (!(await db.schema.hasTable('email_template_translations'))) return [];

  const templates = await db('email_templates').whereIn('template_key', Object.keys(T)).select('*');
  let added = 0;
  for (const template of templates) {
    const already = await db('email_template_translations')
      .where({ template_id: template.id, language: LANGUAGE })
      .first();
    if (already) continue;
    const now = new Date();
    await copyLegacyColumnsIfUntranslated(db, template, now);
    const copy = T[template.template_key];
    await db('email_template_translations').insert({
      template_id: template.id,
      language: LANGUAGE,
      subject: copy.subject,
      body_html: copy.body_html,
      body_text: copy.body_text,
      created_at: now,
      updated_at: now,
    });
    added++;
  }
  if (added > 0) log.info(`pt-BR email templates: added ${added} translation(s)`);
  done = true;
  return [];
}

module.exports = { ensurePtBrEmailTemplatesSeeded, PT_BR_EMAIL_TEMPLATES: T };
