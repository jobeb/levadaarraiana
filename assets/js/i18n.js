/**
 * i18n — Traducciones + t() + applyLang()
 * Idiomas: gl (galego), es (castellano), pt (português), en (english)
 */
const TRANSLATIONS = {
    // ---- General ----
    app_name:           { gl:'Levada Arraiana', es:'Levada Arraiana', pt:'Levada Arraiana', en:'Levada Arraiana' },
    entrar:             { gl:'Entrar', es:'Entrar', pt:'Entrar', en:'Login' },
    rexistro:           { gl:'Rexistro', es:'Registro', pt:'Registo', en:'Register' },
    saír:               { gl:'Saír', es:'Salir', pt:'Sair', en:'Logout' },
    gardar:             { gl:'Gardar', es:'Guardar', pt:'Guardar', en:'Save' },
    cancelar:           { gl:'Cancelar', es:'Cancelar', pt:'Cancelar', en:'Cancel' },
    eliminar:           { gl:'Eliminar', es:'Eliminar', pt:'Eliminar', en:'Delete' },
    editar:             { gl:'Editar', es:'Editar', pt:'Editar', en:'Edit' },
    engadir:            { gl:'Engadir', es:'Añadir', pt:'Adicionar', en:'Add' },
    buscar:             { gl:'Buscar...', es:'Buscar...', pt:'Pesquisar...', en:'Search...' },
    confirmar_accion:   { gl:'Estás seguro/a?', es:'¿Estás seguro/a?', pt:'Tem certeza?', en:'Are you sure?' },
    confirmar_eliminar: { gl:'Seguro que queres eliminar?', es:'¿Seguro que quieres eliminar?', pt:'Tem certeza que deseja eliminar?', en:'Are you sure you want to delete?' },
    si:                 { gl:'Si', es:'Sí', pt:'Sim', en:'Yes' },
    non:                { gl:'Non', es:'No', pt:'Não', en:'No' },
    cargando:           { gl:'Cargando...', es:'Cargando...', pt:'Carregando...', en:'Loading...' },
    erro:               { gl:'Erro', es:'Error', pt:'Erro', en:'Error' },
    exito:              { gl:'Feito!', es:'¡Hecho!', pt:'Feito!', en:'Done!' },
    sen_resultados:     { gl:'Sen resultados', es:'Sin resultados', pt:'Sem resultados', en:'No results' },
    ver:                { gl:'Ver', es:'Ver', pt:'Ver', en:'View' },
    voltar:             { gl:'Voltar', es:'Volver', pt:'Voltar', en:'Back' },

    // ---- Auth ----
    username:           { gl:'Usuario', es:'Usuario', pt:'Utilizador', en:'Username' },
    contrasinal:        { gl:'Contrasinal', es:'Contraseña', pt:'Senha', en:'Password' },
    nome_completo:      { gl:'Nome completo', es:'Nombre completo', pt:'Nome completo', en:'Full name' },
    login_titulo:       { gl:'Iniciar sesión', es:'Iniciar sesión', pt:'Iniciar sessão', en:'Log in' },
    rexistro_titulo:    { gl:'Crear conta', es:'Crear cuenta', pt:'Criar conta', en:'Create account' },
    rexistro_ok:        { gl:'Rexistro correcto! Agarda aprobación.', es:'Registro correcto. Espera aprobación.', pt:'Registo correto! Aguarde aprovação.', en:'Registered! Wait for approval.' },
    login_pendente:     { gl:'A túa conta está pendente de aprobación', es:'Tu cuenta está pendiente de aprobación', pt:'A sua conta está pendente de aprovação', en:'Your account is pending approval' },
    repetir_contrasinal:{ gl:'Repetir contrasinal', es:'Repetir contraseña', pt:'Repetir senha', en:'Repeat password' },
    contrasinais_non_coinciden: { gl:'Os contrasinais non coinciden', es:'Las contraseñas no coinciden', pt:'As senhas não coincidem', en:'Passwords do not match' },
    foto_perfil:        { gl:'Foto de perfil', es:'Foto de perfil', pt:'Foto de perfil', en:'Profile photo' },
    acceder:            { gl:'Acceder', es:'Acceder', pt:'Aceder', en:'Login' },
    ou:                 { gl:'ou', es:'o', pt:'ou', en:'or' },
    xa_tes_conta:       { gl:'Xa tes conta?', es:'¿Ya tienes cuenta?', pt:'Já tem conta?', en:'Already have an account?' },
    non_tes_conta:      { gl:'Non tes conta?', es:'¿No tienes cuenta?', pt:'Não tem conta?', en:"Don't have an account?" },
    rexistrarse:        { gl:'Rexistrarse', es:'Registrarse', pt:'Registar-se', en:'Sign up' },
    iniciar_sesion:     { gl:'Iniciar sesión', es:'Iniciar sesión', pt:'Iniciar sessão', en:'Log in' },

    // ---- Perfil / Header ----
    meu_perfil:         { gl:'O meu perfil', es:'Mi perfil', pt:'Meu perfil', en:'My profile' },
    cambiar_contrasinal:{ gl:'Cambiar contrasinal', es:'Cambiar contrase\u00f1a', pt:'Alterar senha', en:'Change password' },
    contrasinal_actual: { gl:'Contrasinal actual', es:'Contrase\u00f1a actual', pt:'Senha atual', en:'Current password' },
    contrasinal_nova:   { gl:'Nova contrasinal', es:'Nueva contrase\u00f1a', pt:'Nova senha', en:'New password' },
    perfil_actualizado: { gl:'Perfil actualizado', es:'Perfil actualizado', pt:'Perfil atualizado', en:'Profile updated' },
    notificacions:      { gl:'Notificaci\u00f3ns', es:'Notificaciones', pt:'Notifica\u00e7\u00f5es', en:'Notifications' },
    sen_notificacions:  { gl:'Sen notificaci\u00f3ns', es:'Sin notificaciones', pt:'Sem notifica\u00e7\u00f5es', en:'No notifications' },
    mensaxes_non_lidas: { gl:'mensaxes non lidas', es:'mensajes no le\u00eddos', pt:'mensagens n\u00e3o lidas', en:'unread messages' },

    // ---- Sidebar ----
    dashboard:          { gl:'Inicio', es:'Inicio', pt:'Início', en:'Home' },
    socios:             { gl:'Socios', es:'Socios', pt:'Sócios', en:'Members' },
    noticias:           { gl:'Noticias', es:'Noticias', pt:'Notícias', en:'News' },
    bolos:              { gl:'Bolos', es:'Bolos', pt:'Bolos', en:'Gigs' },
    bolo:               { gl:'Bolo', es:'Bolo', pt:'Bolo', en:'Gig' },
    galeria:            { gl:'Galería', es:'Galería', pt:'Galeria', en:'Gallery' },
    mensaxeria:         { gl:'Mensaxería', es:'Mensajería', pt:'Mensagens', en:'Messages' },
    propostas:          { gl:'Propostas', es:'Propuestas', pt:'Propostas', en:'Proposals' },
    actas:              { gl:'Actas', es:'Actas', pt:'Atas', en:'Minutes' },
    documentos:         { gl:'Documentos', es:'Documentos', pt:'Documentos', en:'Documents' },
    votacions:          { gl:'Votacións', es:'Votaciones', pt:'Votações', en:'Votes' },
    contabilidade:      { gl:'Contabilidade', es:'Contabilidad', pt:'Contabilidade', en:'Accounting' },
    ensaios:            { gl:'Ensaios', es:'Ensayos', pt:'Ensaios', en:'Rehearsals' },
    instrumentos:       { gl:'Instrumentos', es:'Instrumentos', pt:'Instrumentos', en:'Instruments' },
    repertorio:         { gl:'Repertorio', es:'Repertorio', pt:'Repertório', en:'Repertoire' },
    configuracion:      { gl:'Configuración', es:'Configuración', pt:'Configuração', en:'Settings' },

    // ---- Sidebar sections ----
    sec_xeral:          { gl:'Xeral', es:'General', pt:'Geral', en:'General' },
    sec_comunicacion:   { gl:'Comunicación', es:'Comunicación', pt:'Comunicação', en:'Communication' },
    sec_administracion: { gl:'Administración', es:'Administración', pt:'Administração', en:'Administration' },
    sec_finanzas:       { gl:'Finanzas', es:'Finanzas', pt:'Finanças', en:'Finance' },
    sec_musica:         { gl:'Música', es:'Música', pt:'Música', en:'Music' },

    // ---- Socios ----
    socio:              { gl:'Socio/a', es:'Socio/a', pt:'Sócio/a', en:'Member' },
    instrumento:        { gl:'Instrumento', es:'Instrumento', pt:'Instrumento', en:'Instrument' },
    rol:                { gl:'Rol', es:'Rol', pt:'Papel', en:'Role' },
    estado:             { gl:'Estado', es:'Estado', pt:'Estado', en:'Status' },
    email:              { gl:'Email', es:'Email', pt:'Email', en:'Email' },
    telefono:           { gl:'Teléfono', es:'Teléfono', pt:'Telefone', en:'Phone' },
    dni:                { gl:'DNI', es:'DNI', pt:'NIF', en:'ID' },
    data_alta:          { gl:'Data alta', es:'Fecha alta', pt:'Data registo', en:'Join date' },
    pendente:           { gl:'Pendente', es:'Pendiente', pt:'Pendente', en:'Pending' },
    aprobado:           { gl:'Aprobado', es:'Aprobado', pt:'Aprovado', en:'Approved' },
    rexeitado:          { gl:'Rexeitado', es:'Rechazado', pt:'Rejeitado', en:'Rejected' },
    aprobar:            { gl:'Aprobar', es:'Aprobar', pt:'Aprovar', en:'Approve' },
    rexeitar:           { gl:'Rexeitar', es:'Rechazar', pt:'Rejeitar', en:'Reject' },
    admin:              { gl:'Admin', es:'Admin', pt:'Admin', en:'Admin' },
    director:           { gl:'Director/a', es:'Director/a', pt:'Diretor/a', en:'Director' },

    // ---- Noticias ----
    titulo:             { gl:'Título', es:'Título', pt:'Título', en:'Title' },
    texto:              { gl:'Texto', es:'Texto', pt:'Texto', en:'Text' },
    data:               { gl:'Data', es:'Fecha', pt:'Data', en:'Date' },
    autor:              { gl:'Autor', es:'Autor', pt:'Autor', en:'Author' },
    imaxes:             { gl:'Imaxes', es:'Imágenes', pt:'Imagens', en:'Images' },
    publicada:          { gl:'Publicada', es:'Publicada', pt:'Publicada', en:'Published' },
    borrador:           { gl:'Borrador', es:'Borrador', pt:'Rascunho', en:'Draft' },
    publica:            { gl:'Pública', es:'Pública', pt:'Pública', en:'Public' },
    nova_noticia:       { gl:'Nova noticia', es:'Nueva noticia', pt:'Nova notícia', en:'New article' },

    // ---- Bolos ----
    novo_bolo:          { gl:'Novo bolo', es:'Nuevo bolo', pt:'Novo bolo', en:'New gig' },
    asinado:            { gl:'Asinado', es:'Firmado', pt:'Assinado', en:'Signed' },
    completado:         { gl:'Completado', es:'Completado', pt:'Completado', en:'Completed' },
    proximos_bolos:     { gl:'Pr\u00f3ximos bolos', es:'Pr\u00f3ximos bolos', pt:'Pr\u00f3ximos bolos', en:'Upcoming gigs' },
    hora:               { gl:'Hora', es:'Hora', pt:'Hora', en:'Time' },
    lugar:              { gl:'Lugar', es:'Lugar', pt:'Local', en:'Location' },
    tipo:               { gl:'Tipo', es:'Tipo', pt:'Tipo', en:'Type' },
    actuacion:          { gl:'Actuación', es:'Actuación', pt:'Atuação', en:'Performance' },
    festival:           { gl:'Festival', es:'Festival', pt:'Festival', en:'Festival' },
    taller:             { gl:'Taller', es:'Taller', pt:'Oficina', en:'Workshop' },

    // ---- Galería ----
    album:              { gl:'Álbum', es:'Álbum', pt:'Álbum', en:'Album' },
    fotos:              { gl:'Fotos', es:'Fotos', pt:'Fotos', en:'Photos' },
    novo_album:         { gl:'Novo álbum', es:'Nuevo álbum', pt:'Novo álbum', en:'New album' },
    portada:            { gl:'Portada', es:'Portada', pt:'Capa', en:'Cover' },

    // ---- Mensaxería ----
    mensaxe:            { gl:'Mensaxe', es:'Mensaje', pt:'Mensagem', en:'Message' },
    nova_mensaxe:       { gl:'Nova mensaxe', es:'Nuevo mensaje', pt:'Nova mensagem', en:'New message' },
    xeral:              { gl:'Xeral', es:'General', pt:'Geral', en:'General' },
    direccion:          { gl:'Dirección', es:'Dirección', pt:'Direção', en:'Board' },
    lida:               { gl:'Lida', es:'Leída', pt:'Lida', en:'Read' },
    non_lida:           { gl:'Non lida', es:'No leída', pt:'Não lida', en:'Unread' },
    marcar_lida:        { gl:'Marcar como lida', es:'Marcar como leída', pt:'Marcar como lida', en:'Mark as read' },

    // ---- Chat (keys kept for reuse) ----
    enviar:             { gl:'Enviar', es:'Enviar', pt:'Enviar', en:'Send' },
    escribir_mensaxe:   { gl:'Escribe unha mensaxe...', es:'Escribe un mensaje...', pt:'Escreva uma mensagem...', en:'Write a message...' },

    // ---- Propostas ----
    proposta:           { gl:'Proposta', es:'Propuesta', pt:'Proposta', en:'Proposal' },
    nova_proposta:      { gl:'Nova proposta', es:'Nueva propuesta', pt:'Nova proposta', en:'New proposal' },
    ficheiros:          { gl:'Ficheiros', es:'Archivos', pt:'Ficheiros', en:'Files' },

    // ---- Actas ----
    acta:               { gl:'Acta', es:'Acta', pt:'Ata', en:'Minutes' },
    nova_acta:          { gl:'Nova acta', es:'Nueva acta', pt:'Nova ata', en:'New minutes' },
    contido:            { gl:'Contido', es:'Contenido', pt:'Conteúdo', en:'Content' },

    // ---- Documentos ----
    documento:          { gl:'Documento', es:'Documento', pt:'Documento', en:'Document' },
    novo_documento:     { gl:'Novo documento', es:'Nuevo documento', pt:'Novo documento', en:'New document' },
    visibilidade:       { gl:'Visibilidade', es:'Visibilidad', pt:'Visibilidade', en:'Visibility' },
    todos:              { gl:'Todos', es:'Todos', pt:'Todos', en:'All' },

    // ---- Votacións ----
    votacion:           { gl:'Votación', es:'Votación', pt:'Votação', en:'Vote' },
    nova_votacion:      { gl:'Nova votación', es:'Nueva votación', pt:'Nova votação', en:'New vote' },
    opcions:            { gl:'Opcións', es:'Opciones', pt:'Opções', en:'Options' },
    aberta:             { gl:'Aberta', es:'Abierta', pt:'Aberta', en:'Open' },
    pechada:            { gl:'Pechada', es:'Cerrada', pt:'Fechada', en:'Closed' },
    votar:              { gl:'Votar', es:'Votar', pt:'Votar', en:'Vote' },
    selecciona_opcion:  { gl:'Selecciona unha opci\u00f3n', es:'Selecciona una opci\u00f3n', pt:'Selecione uma op\u00e7\u00e3o', en:'Select an option' },
    xa_votaches:        { gl:'Xa votaches', es:'Ya votaste', pt:'Já votou', en:'Already voted' },
    resultados:         { gl:'Resultados', es:'Resultados', pt:'Resultados', en:'Results' },
    pechar:             { gl:'Pechar', es:'Cerrar', pt:'Fechar', en:'Close' },

    // ---- Contabilidade ----
    factura:            { gl:'Factura', es:'Factura', pt:'Fatura', en:'Invoice' },
    nova_factura:       { gl:'Nova factura', es:'Nueva factura', pt:'Nova fatura', en:'New invoice' },
    gasto:              { gl:'Gasto', es:'Gasto', pt:'Despesa', en:'Expense' },
    novo_gasto:         { gl:'Novo gasto', es:'Nuevo gasto', pt:'Nova despesa', en:'New expense' },
    cliente:            { gl:'Cliente', es:'Cliente', pt:'Cliente', en:'Client' },
    novo_cliente:       { gl:'Novo cliente', es:'Nuevo cliente', pt:'Novo cliente', en:'New client' },
    proveedor:          { gl:'Provedor', es:'Proveedor', pt:'Fornecedor', en:'Supplier' },
    novo_proveedor:     { gl:'Novo provedor', es:'Nuevo proveedor', pt:'Novo fornecedor', en:'New supplier' },
    importe:            { gl:'Importe', es:'Importe', pt:'Importância', en:'Amount' },
    iva:                { gl:'IVE', es:'IVA', pt:'IVA', en:'VAT' },
    concepto:           { gl:'Concepto', es:'Concepto', pt:'Conceito', en:'Concept' },
    categoria:          { gl:'Categoría', es:'Categoría', pt:'Categoria', en:'Category' },
    total:              { gl:'Total', es:'Total', pt:'Total', en:'Total' },
    ingresos:           { gl:'Ingresos', es:'Ingresos', pt:'Receitas', en:'Income' },
    gastos_label:       { gl:'Gastos', es:'Gastos', pt:'Despesas', en:'Expenses' },
    balance:            { gl:'Balance', es:'Balance', pt:'Balanço', en:'Balance' },
    pagada:             { gl:'Pagada', es:'Pagada', pt:'Paga', en:'Paid' },
    pendente_pago:      { gl:'Pendente', es:'Pendiente', pt:'Pendente', en:'Pending' },

    // ---- Contratos (reused in bolos) ----
    contrato:           { gl:'Contrato', es:'Contrato', pt:'Contrato', en:'Contract' },

    // ---- Ensaios ----
    ensaio:             { gl:'Ensaio', es:'Ensayo', pt:'Ensaio', en:'Rehearsal' },
    novo_ensaio:        { gl:'Novo ensaio', es:'Nuevo ensayo', pt:'Novo ensaio', en:'New rehearsal' },
    hora_inicio:        { gl:'Hora inicio', es:'Hora inicio', pt:'Hora início', en:'Start time' },
    hora_fin:           { gl:'Hora fin', es:'Hora fin', pt:'Hora fim', en:'End time' },
    programado:         { gl:'Programado', es:'Programado', pt:'Programado', en:'Scheduled' },
    realizado:          { gl:'Realizado', es:'Realizado', pt:'Realizado', en:'Completed' },
    cancelado:          { gl:'Cancelado', es:'Cancelado', pt:'Cancelado', en:'Cancelled' },
    asistencia:         { gl:'Asistencia', es:'Asistencia', pt:'Assistência', en:'Attendance' },
    confirmado:         { gl:'Confirmado', es:'Confirmado', pt:'Confirmado', en:'Confirmed' },
    ausente:            { gl:'Ausente', es:'Ausente', pt:'Ausente', en:'Absent' },
    xustificado:        { gl:'Xustificado', es:'Justificado', pt:'Justificado', en:'Excused' },

    // ---- Instrumentos ----
    novo_instrumento:   { gl:'Novo instrumento', es:'Nuevo instrumento', pt:'Novo instrumento', en:'New instrument' },
    numero_serie:       { gl:'Nº serie', es:'Nº serie', pt:'Nº série', en:'Serial No.' },
    asignado_a:         { gl:'Asignado a', es:'Asignado a', pt:'Atribuído a', en:'Assigned to' },
    bo:                 { gl:'Bo', es:'Bueno', pt:'Bom', en:'Good' },
    reparacion:         { gl:'En reparación', es:'En reparación', pt:'Em reparação', en:'Under repair' },
    baixa:              { gl:'Baixa', es:'Baja', pt:'Baixa', en:'Retired' },
    sen_asignar:        { gl:'Sen asignar', es:'Sin asignar', pt:'Sem atribuir', en:'Unassigned' },

    // ---- Repertorio ----
    ritmo:              { gl:'Ritmo', es:'Ritmo', pt:'Ritmo', en:'Rhythm' },
    novo_ritmo:         { gl:'Novo ritmo', es:'Nuevo ritmo', pt:'Novo ritmo', en:'New rhythm' },
    tempo_bpm:          { gl:'Tempo (BPM)', es:'Tempo (BPM)', pt:'Tempo (BPM)', en:'Tempo (BPM)' },
    dificultade:        { gl:'Dificultade', es:'Dificultad', pt:'Dificuldade', en:'Difficulty' },
    facil:              { gl:'Fácil', es:'Fácil', pt:'Fácil', en:'Easy' },
    media:              { gl:'Media', es:'Media', pt:'Média', en:'Medium' },
    dificil:            { gl:'Difícil', es:'Difícil', pt:'Difícil', en:'Hard' },
    audio:              { gl:'Audio', es:'Audio', pt:'Áudio', en:'Audio' },
    partitura:          { gl:'Partitura', es:'Partitura', pt:'Partitura', en:'Score' },

    // ---- Config ----
    nome_asociacion:    { gl:'Nome asociación', es:'Nombre asociación', pt:'Nome associação', en:'Association name' },
    datos_fiscais:      { gl:'Datos fiscais', es:'Datos fiscales', pt:'Dados fiscais', en:'Tax info' },
    sobre_nos:          { gl:'Sobre nós', es:'Sobre nosotros', pt:'Sobre nós', en:'About us' },
    smtp:               { gl:'Correo SMTP', es:'Correo SMTP', pt:'Correio SMTP', en:'SMTP Email' },
    // ---- Landing ----
    benvidos:           { gl:'Benvidos á Levada Arraiana', es:'Bienvenidos a Levada Arraiana', pt:'Bem-vindos à Levada Arraiana', en:'Welcome to Levada Arraiana' },
    subtitulo_landing:  { gl:'Batucada de Estás, Tomiño', es:'Batucada de Estás, Tomiño', pt:'Batucada de Estás, Tomiño', en:'Batucada from Estás, Tomiño' },
    acceder_panel:      { gl:'Acceder ao panel', es:'Acceder al panel', pt:'Aceder ao painel', en:'Access panel' },
    ultimas_noticias:   { gl:'Últimas noticias', es:'Últimas noticias', pt:'Últimas notícias', en:'Latest news' },
    galeria_fotos:      { gl:'Galería de fotos', es:'Galería de fotos', pt:'Galeria de fotos', en:'Photo gallery' },
    sobre_nos_landing:  { gl:'Sobre nós', es:'Sobre nosotros', pt:'Sobre nós', en:'About us' },

    // ---- Backup ----
    backup:             { gl:'Copia de seguridade', es:'Copia de seguridad', pt:'Cópia de segurança', en:'Backup' },
    copias_seguridade:  { gl:'Copias de seguridade', es:'Copias de seguridad', pt:'Cópias de segurança', en:'Backups' },
    descargar_backup:   { gl:'Descargar backup', es:'Descargar backup', pt:'Descarregar backup', en:'Download backup' },
    descargar_backup_desc: { gl:'Descarga un arquivo SQL con toda a base de datos', es:'Descarga un archivo SQL con toda la base de datos', pt:'Descarrega um ficheiro SQL com toda a base de dados', en:'Download a SQL file with the entire database' },

    // ---- YouTube ----
    youtube_conectado:      { gl:'Conectado a YouTube', es:'Conectado a YouTube', pt:'Conectado ao YouTube', en:'Connected to YouTube' },
    youtube_non_conectado:  { gl:'Non conectado a YouTube', es:'No conectado a YouTube', pt:'Não conectado ao YouTube', en:'Not connected to YouTube' },
    youtube_client_id:      { gl:'YouTube Client ID', es:'YouTube Client ID', pt:'YouTube Client ID', en:'YouTube Client ID' },
    youtube_client_secret:  { gl:'YouTube Client Secret', es:'YouTube Client Secret', pt:'YouTube Client Secret', en:'YouTube Client Secret' },
    youtube_conectar:       { gl:'Conectar con YouTube', es:'Conectar con YouTube', pt:'Conectar ao YouTube', en:'Connect to YouTube' },
    youtube_desconectar:    { gl:'Desconectar', es:'Desconectar', pt:'Desconectar', en:'Disconnect' },
    youtube_ok:             { gl:'YouTube conectado correctamente', es:'YouTube conectado correctamente', pt:'YouTube conectado com sucesso', en:'YouTube connected successfully' },
    youtube_erro:           { gl:'Erro ao conectar YouTube', es:'Error al conectar YouTube', pt:'Erro ao conectar YouTube', en:'Error connecting YouTube' },
    youtube_intro_credenciais: { gl:'Introduce Client ID e Client Secret primeiro', es:'Introduce Client ID y Client Secret primero', pt:'Introduza Client ID e Client Secret primeiro', en:'Enter Client ID and Client Secret first' },

    // ---- Notas ----
    notas:              { gl:'Notas', es:'Notas', pt:'Notas', en:'Notes' },
    descricion:         { gl:'Descrición', es:'Descripción', pt:'Descrição', en:'Description' },
    nome:               { gl:'Nome', es:'Nombre', pt:'Nome', en:'Name' },
    nif:                { gl:'NIF', es:'NIF', pt:'NIF', en:'Tax ID' },
    enderezo:           { gl:'Enderezo', es:'Dirección', pt:'Morada', en:'Address' },
    accions:            { gl:'Accións', es:'Acciones', pt:'Ações', en:'Actions' },

    // ---- Fase 1A: Modales / Validación ----
    campo_obrigatorio:  { gl:'Este campo é obrigatorio', es:'Este campo es obligatorio', pt:'Este campo é obrigatório', en:'This field is required' },
    min_caracteres:     { gl:'Mínimo {n} caracteres', es:'Mínimo {n} caracteres', pt:'Mínimo {n} caracteres', en:'Minimum {n} characters' },
    email_invalido:     { gl:'Email non válido', es:'Email no válido', pt:'Email inválido', en:'Invalid email' },
    gardando:           { gl:'Gardando...', es:'Guardando...', pt:'Guardando...', en:'Saving...' },

    // ---- Fase 1B: Paginación ----
    anterior:           { gl:'Anterior', es:'Anterior', pt:'Anterior', en:'Previous' },
    seguinte:           { gl:'Seguinte', es:'Siguiente', pt:'Seguinte', en:'Next' },
    mostrando:          { gl:'Mostrando {from}-{to} de {total}', es:'Mostrando {from}-{to} de {total}', pt:'Mostrando {from}-{to} de {total}', en:'Showing {from}-{to} of {total}' },

    // ---- Fase 2: Calendario ----
    meses:              { gl:['Xaneiro','Febreiro','Marzo','Abril','Maio','Xuño','Xullo','Agosto','Setembro','Outubro','Novembro','Decembro'], es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'], pt:['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'], en:['January','February','March','April','May','June','July','August','September','October','November','December'] },
    dias_curtos:        { gl:['Lun','Mar','Mér','Xov','Ven','Sáb','Dom'], es:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'], pt:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'], en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    hoxe:               { gl:'Hoxe', es:'Hoy', pt:'Hoje', en:'Today' },
    vista_lista:        { gl:'Lista', es:'Lista', pt:'Lista', en:'List' },
    vista_calendario:   { gl:'Calendario', es:'Calendario', pt:'Calendário', en:'Calendar' },

    // ---- Fase 3: Ensaios recurrentes ----
    recorrencia:        { gl:'Recorrencia', es:'Recurrencia', pt:'Recorrência', en:'Recurrence' },
    sen_recorrencia:    { gl:'Sen recorrencia', es:'Sin recurrencia', pt:'Sem recorrência', en:'No recurrence' },
    semanal:            { gl:'Semanal', es:'Semanal', pt:'Semanal', en:'Weekly' },
    bisemanal:          { gl:'Bisemanal', es:'Bisemanal', pt:'Bissemanal', en:'Biweekly' },
    mensual:            { gl:'Mensual', es:'Mensual', pt:'Mensal', en:'Monthly' },
    data_fin_recorrencia: { gl:'Data fin recorrencia', es:'Fecha fin recurrencia', pt:'Data fim recorrência', en:'Recurrence end date' },
    solo_este:          { gl:'Só este', es:'Solo este', pt:'Só este', en:'Only this one' },
    este_e_futuros:     { gl:'Este e futuros', es:'Este y futuros', pt:'Este e futuros', en:'This and future' },
    ensaios_creados:    { gl:'Ensaios creados', es:'Ensayos creados', pt:'Ensaios criados', en:'Rehearsals created' },

    // ---- Fase 4: Dashboard mejorado ----
    proximos_eventos:   { gl:'Próximos eventos', es:'Próximos eventos', pt:'Próximos eventos', en:'Upcoming events' },
    actividade_recente: { gl:'Actividade recente', es:'Actividad reciente', pt:'Atividade recente', en:'Recent activity' },
    accions_rapidas:    { gl:'Accións rápidas', es:'Acciones rápidas', pt:'Ações rápidas', en:'Quick actions' },
    sen_eventos:        { gl:'Sen eventos próximos', es:'Sin eventos próximos', pt:'Sem eventos próximos', en:'No upcoming events' },

    // ---- Fase 5: Gráficos ----
    ingresos_gastos_mensuais: { gl:'Ingresos e gastos mensuais', es:'Ingresos y gastos mensuales', pt:'Receitas e despesas mensais', en:'Monthly income & expenses' },
    gastos_por_categoria: { gl:'Gastos por categoría', es:'Gastos por categoría', pt:'Despesas por categoria', en:'Expenses by category' },
    resumo:             { gl:'Resumo', es:'Resumen', pt:'Resumo', en:'Summary' },
    desde:              { gl:'Desde', es:'Desde', pt:'Desde', en:'From' },
    ata:                { gl:'Ata', es:'Hasta', pt:'Até', en:'To' },
    filtrar:            { gl:'Filtrar', es:'Filtrar', pt:'Filtrar', en:'Filter' },
    limpar:             { gl:'Limpar', es:'Limpiar', pt:'Limpar', en:'Clear' },

    // ---- Fase 7: Resumo asistencia ----
    resumo_asistencia:  { gl:'Resumo asistencia', es:'Resumen asistencia', pt:'Resumo assistência', en:'Attendance summary' },
    porcentaxe:         { gl:'Porcentaxe', es:'Porcentaje', pt:'Percentagem', en:'Percentage' },

    // ---- Fase 8: Exportación CSV ----
    exportar_csv:       { gl:'Exportar CSV', es:'Exportar CSV', pt:'Exportar CSV', en:'Export CSV' },

    // ---- Fase 9: Mensaxería ----
    responder:          { gl:'Responder', es:'Responder', pt:'Responder', en:'Reply' },
    mensaxe_orixinal:   { gl:'Mensaxe orixinal', es:'Mensaje original', pt:'Mensagem original', en:'Original message' },
    ver_mais:           { gl:'Ver máis', es:'Ver más', pt:'Ver mais', en:'See more' },

    // ---- Fase 10: Votación propostas ----
    a_favor:            { gl:'A favor', es:'A favor', pt:'A favor', en:'In favor' },
    en_contra:          { gl:'En contra', es:'En contra', pt:'Contra', en:'Against' },

    // ---- Fase 11: Setlists ----
    setlists:           { gl:'Setlists', es:'Setlists', pt:'Setlists', en:'Setlists' },
    nova_setlist:       { gl:'Nova setlist', es:'Nueva setlist', pt:'Nova setlist', en:'New setlist' },
    engadir_peza:       { gl:'Engadir peza', es:'Añadir pieza', pt:'Adicionar peça', en:'Add piece' },

    // ---- Fase 12: Extras ----
    data_limite:        { gl:'Data límite', es:'Fecha límite', pt:'Data limite', en:'Deadline' },
    historial_mantemento: { gl:'Historial mantemento', es:'Historial mantenimiento', pt:'Histórico manutenção', en:'Maintenance history' },

    // ---- Galería: editor de fotos ----
    foto_titulo:        { gl:'Título da foto', es:'Título de la foto', pt:'Título da foto', en:'Photo title' },
    foto_alt:           { gl:'Texto alternativo', es:'Texto alternativo', pt:'Texto alternativo', en:'Alt text' },
    definir_portada:    { gl:'Definir como portada', es:'Definir como portada', pt:'Definir como capa', en:'Set as cover' },
    eliminar_foto:      { gl:'Eliminar foto', es:'Eliminar foto', pt:'Eliminar foto', en:'Delete photo' },
    arrastra_reordenar: { gl:'Arrastra para reordenar', es:'Arrastra para reordenar', pt:'Arraste para reordenar', en:'Drag to reorder' },
};

function t(key) {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[AppState.lang] || entry['gl'] || key;
}

function applyLang(lang) {
    AppState.lang = lang;
    localStorage.setItem('lang', lang);
    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // Update lang selector active state
    document.querySelectorAll('.lang-selector button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function initLangSelector() {
    document.querySelectorAll('.lang-selector button').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
}
