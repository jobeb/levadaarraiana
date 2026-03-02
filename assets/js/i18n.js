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
    login_desactivado:  { gl:'A túa conta está desactivada', es:'Tu cuenta está desactivada', pt:'A sua conta está desativada', en:'Your account is disabled' },
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
    idioma:             { gl:'Idioma', es:'Idioma', pt:'Idioma', en:'Language' },
    aparencia:          { gl:'Aparencia', es:'Apariencia', pt:'Aparência', en:'Appearance' },
    tamano_texto:       { gl:'Texto', es:'Texto', pt:'Texto', en:'Text' },
    modo_compacto:      { gl:'Compacto', es:'Compacto', pt:'Compacto', en:'Compact' },
    modo_claro:         { gl:'Modo claro', es:'Modo claro', pt:'Modo claro', en:'Light mode' },
    notificacions:      { gl:'Notificaci\u00f3ns', es:'Notificaciones', pt:'Notifica\u00e7\u00f5es', en:'Notifications' },
    sen_notificacions:  { gl:'Sen notificaci\u00f3ns', es:'Sin notificaciones', pt:'Sem notifica\u00e7\u00f5es', en:'No notifications' },

    // ---- Sidebar ----
    dashboard:          { gl:'Inicio', es:'Inicio', pt:'Início', en:'Home' },
    usuarios:           { gl:'Usuarios', es:'Usuarios', pt:'Utilizadores', en:'Users' },
    noticias:           { gl:'Noticias', es:'Noticias', pt:'Notícias', en:'News' },
    bolos:              { gl:'Bolos', es:'Bolos', pt:'Bolos', en:'Gigs' },
    bolo:               { gl:'Bolo', es:'Bolo', pt:'Bolo', en:'Gig' },
    galeria:            { gl:'Galería', es:'Galería', pt:'Galeria', en:'Gallery' },
    propostas:          { gl:'Xurxerencias', es:'Xurxerencias', pt:'Xurxestões', en:'Xurxxestions' },
    actas:              { gl:'Actas', es:'Actas', pt:'Atas', en:'Minutes' },
    documentos:         { gl:'Documentos', es:'Documentos', pt:'Documentos', en:'Documents' },
    votacions:          { gl:'Votacións', es:'Votaciones', pt:'Votações', en:'Votes' },
    ensaios:            { gl:'Ensaios', es:'Ensayos', pt:'Ensaios', en:'Rehearsals' },
    instrumentos:       { gl:'Instrumentos', es:'Instrumentos', pt:'Instrumentos', en:'Instruments' },
    repertorio:         { gl:'Repertorio', es:'Repertorio', pt:'Repertório', en:'Repertoire' },
    configuracion:      { gl:'Configuración', es:'Configuración', pt:'Configuração', en:'Settings' },

    // ---- Sidebar sections ----
    sec_xeral:          { gl:'Xeral', es:'General', pt:'Geral', en:'General' },
    sec_comunicacion:   { gl:'Comunicación', es:'Comunicación', pt:'Comunicação', en:'Communication' },
    sec_administracion: { gl:'Administración', es:'Administración', pt:'Administração', en:'Administration' },
    sec_musica:         { gl:'Música', es:'Música', pt:'Música', en:'Music' },

    // ---- Usuarios ----
    socio:              { gl:'Socio/a', es:'Socio/a', pt:'Sócio/a', en:'Member' },
    instrumento:        { gl:'Instrumento', es:'Instrumento', pt:'Instrumento', en:'Instrument' },
    rol:                { gl:'Rol', es:'Rol', pt:'Papel', en:'Role' },
    estado:             { gl:'Estado', es:'Estado', pt:'Estado', en:'Status' },
    email:              { gl:'Email', es:'Email', pt:'Email', en:'Email' },
    telefono:           { gl:'Teléfono', es:'Teléfono', pt:'Telefone', en:'Phone' },
    dni:                { gl:'DNI', es:'DNI', pt:'NIF', en:'ID' },
    data_alta:          { gl:'Data alta', es:'Fecha alta', pt:'Data registo', en:'Join date' },
    activo:             { gl:'Activo', es:'Activo', pt:'Ativo', en:'Active' },
    desactivado:        { gl:'Desactivado', es:'Desactivado', pt:'Desativado', en:'Disabled' },
    activar:            { gl:'Activar', es:'Activar', pt:'Ativar', en:'Activate' },
    desactivar:         { gl:'Desactivar', es:'Desactivar', pt:'Desativar', en:'Disable' },
    admin:              { gl:'Admin', es:'Admin', pt:'Admin', en:'Admin' },
    usuario:            { gl:'Usuario/a', es:'Usuario/a', pt:'Utilizador/a', en:'User' },

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
    albums:             { gl:'Álbums', es:'Álbumes', pt:'Álbuns', en:'Albums' },
    fotos:              { gl:'Fotos', es:'Fotos', pt:'Fotos', en:'Photos' },
    novo_album:         { gl:'Novo álbum', es:'Nuevo álbum', pt:'Novo álbum', en:'New album' },
    portada:            { gl:'Portada', es:'Portada', pt:'Capa', en:'Cover' },

    xeral:              { gl:'Xeral', es:'General', pt:'Geral', en:'General' },
    direccion:          { gl:'Dirección', es:'Dirección', pt:'Direção', en:'Board' },

    // ---- Xeral ----
    enviar:             { gl:'Enviar', es:'Enviar', pt:'Enviar', en:'Send' },

    // ---- Propostas ----
    proposta:           { gl:'Xurxerencia', es:'Xurxerencia', pt:'Xurxestão', en:'Xurxxestion' },
    nova_proposta:      { gl:'Nova xurxerencia', es:'Nova xurxerencia', pt:'Nova xurxestão', en:'New xurxxestion' },
    ficheiros:          { gl:'Ficheiros', es:'Archivos', pt:'Ficheiros', en:'Files' },
    proposta_aberta:    { gl:'Aberta', es:'Abierta', pt:'Aberta', en:'Open' },
    proposta_pechada:   { gl:'Pechada', es:'Cerrada', pt:'Fechada', en:'Closed' },
    ordenar_por:        { gl:'Ordenar por', es:'Ordenar por', pt:'Ordenar por', en:'Sort by' },
    mais_recentes:      { gl:'Máis recentes', es:'Más recientes', pt:'Mais recentes', en:'Most recent' },
    mais_votadas:       { gl:'Máis votadas', es:'Más votadas', pt:'Mais votadas', en:'Most voted' },
    mais_comentadas:    { gl:'Máis comentadas', es:'Más comentadas', pt:'Mais comentadas', en:'Most commented' },
    titulo_az:          { gl:'Título A-Z', es:'Título A-Z', pt:'Título A-Z', en:'Title A-Z' },
    nome_az:            { gl:'Nome A-Z', es:'Nombre A-Z', pt:'Nome A-Z', en:'Name A-Z' },
    tipo_az:            { gl:'Tipo A-Z', es:'Tipo A-Z', pt:'Tipo A-Z', en:'Type A-Z' },
    mais_antigas:       { gl:'Máis antigas', es:'Más antiguas', pt:'Mais antigas', en:'Oldest first' },
    todas:              { gl:'Todas', es:'Todas', pt:'Todas', en:'All' },
    todos_tipos:        { gl:'Todos os tipos', es:'Todos los tipos', pt:'Todos os tipos', en:'All types' },

    // ---- Actas ----
    acta:               { gl:'Acta', es:'Acta', pt:'Ata', en:'Minutes' },
    nova_acta:          { gl:'Nova acta', es:'Nueva acta', pt:'Nova ata', en:'New minutes' },
    contido:            { gl:'Contido', es:'Contenido', pt:'Conteúdo', en:'Content' },

    // ---- Documentos / Arquivos ----
    documento:          { gl:'Documento', es:'Documento', pt:'Documento', en:'Document' },
    novo_documento:     { gl:'Novo documento', es:'Nuevo documento', pt:'Novo documento', en:'New document' },
    visibilidade:       { gl:'Visibilidade', es:'Visibilidad', pt:'Visibilidade', en:'Visibility' },
    todos:              { gl:'Todos', es:'Todos', pt:'Todos', en:'All' },
    carpeta:            { gl:'Carpeta', es:'Carpeta', pt:'Pasta', en:'Folder' },
    tamano:             { gl:'Tama\u00f1o', es:'Tama\u00f1o', pt:'Tamanho', en:'Size' },
    todas_carpetas:     { gl:'Todas', es:'Todas', pt:'Todas', en:'All' },
    arquivos:           { gl:'Arquivos', es:'Archivos', pt:'Ficheiros', en:'Files' },

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
    compartir_whatsapp: { gl:'Compartir en WhatsApp', es:'Compartir en WhatsApp', pt:'Compartilhar no WhatsApp', en:'Share on WhatsApp' },

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
    estructura:         { gl:'Estructura', es:'Estructura', pt:'Estrutura', en:'Structure' },
    inicio:             { gl:'Inicio', es:'Inicio', pt:'Início', en:'Intro' },
    andamento:          { gl:'Andamento', es:'Andamiento', pt:'Andamento', en:'Movement' },
    corte:              { gl:'Corte', es:'Corte', pt:'Corte', en:'Break' },
    final_cierre:       { gl:'Final', es:'Final', pt:'Final', en:'Ending' },
    engadir_andamento:  { gl:'Engadir andamento', es:'Añadir andamiento', pt:'Adicionar andamento', en:'Add movement' },
    engadir_corte:      { gl:'Engadir corte', es:'Añadir corte', pt:'Adicionar corte', en:'Add break' },

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
    fotos_destacadas:   { gl:'Fotos destacadas', es:'Fotos destacadas', pt:'Fotos em destaque', en:'Featured photos' },
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
    descricion_curta:   { gl:'Descrición curta', es:'Descripción corta', pt:'Descrição curta', en:'Short description' },
    imaxe:              { gl:'Imaxe', es:'Imagen', pt:'Imagem', en:'Image' },
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
    vista_tabla:        { gl:'Táboa', es:'Tabla', pt:'Tabela', en:'Table' },
    vista_cards:        { gl:'Tarxetas', es:'Tarjetas', pt:'Cartões', en:'Cards' },

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
    sesions:            { gl:'sesións', es:'sesiones', pt:'sessões', en:'sessions' },
    ver_sesions:        { gl:'Ver sesións', es:'Ver sesiones', pt:'Ver sessões', en:'View sessions' },
    horario:            { gl:'Horario', es:'Horario', pt:'Horário', en:'Schedule' },
    confirmar_eliminar_grupo: { gl:'Eliminar todos os ensaios deste grupo?', es:'¿Eliminar todos los ensayos de este grupo?', pt:'Eliminar todos os ensaios deste grupo?', en:'Delete all rehearsals in this group?' },

    // ---- Fase 4: Dashboard mejorado ----
    proximos_eventos:   { gl:'Próximos eventos', es:'Próximos eventos', pt:'Próximos eventos', en:'Upcoming events' },
    actividade_recente: { gl:'Actividade recente', es:'Actividad reciente', pt:'Atividade recente', en:'Recent activity' },
    accions_rapidas:    { gl:'Accións rápidas', es:'Acciones rápidas', pt:'Ações rápidas', en:'Quick actions' },
    sen_eventos:        { gl:'Sen eventos próximos', es:'Sin eventos próximos', pt:'Sem eventos próximos', en:'No upcoming events' },

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
    exportar:           { gl:'Exportar', es:'Exportar', pt:'Exportar', en:'Export' },

    responder:          { gl:'Responder', es:'Responder', pt:'Responder', en:'Reply' },
    ver_mais:           { gl:'Ver máis', es:'Ver más', pt:'Ver mais', en:'See more' },

    // ---- Fase 10: Votación propostas ----
    a_favor:            { gl:'A favor', es:'A favor', pt:'A favor', en:'In favor' },
    en_contra:          { gl:'En contra', es:'En contra', pt:'Contra', en:'Against' },


    medios:             { gl:'Medios', es:'Medios', pt:'Mídias', en:'Media' },
    por_instrumento:    { gl:'Por instrumento', es:'Por instrumento', pt:'Por instrumento', en:'By instrument' },
    audio_video:        { gl:'Audio/Vídeo', es:'Audio/Vídeo', pt:'Áudio/Vídeo', en:'Audio/Video' },

    // ---- Fase 12: Extras ----
    data_limite:        { gl:'Data límite', es:'Fecha límite', pt:'Data limite', en:'Deadline' },
    anonima:            { gl:'Anónima', es:'Anónima', pt:'Anónima', en:'Anonymous' },
    anonima_desc:       { gl:'Resultados ocultos ata pechar. Ao pechar, móstranse sen nomes.', es:'Resultados ocultos hasta cerrar. Al cerrar, se muestran sin nombres.', pt:'Resultados ocultos até fechar. Ao fechar, mostram-se sem nomes.', en:'Results hidden until closed. When closed, shown without names.' },
    tipo_votacion:      { gl:'Tipo de votación', es:'Tipo de votación', pt:'Tipo de votação', en:'Vote type' },
    seleccion_simple:   { gl:'Selección simple', es:'Selección simple', pt:'Seleção simples', en:'Single choice' },
    seleccion_multiple: { gl:'Selección múltiple', es:'Selección múltiple', pt:'Seleção múltipla', en:'Multiple choice' },
    max_opcions:        { gl:'Máximo de opcións', es:'Máximo de opciones', pt:'Máximo de opções', en:'Max options' },
    sen_limite:         { gl:'Sen límite', es:'Sin límite', pt:'Sem limite', en:'No limit' },
    maximo:             { gl:'máximo', es:'máximo', pt:'máximo', en:'max' },
    votos_emitidos:     { gl:'votos emitidos', es:'votos emitidos', pt:'votos emitidos', en:'votes cast' },
    unha_por_lina:      { gl:'unha por liña', es:'una por línea', pt:'uma por linha', en:'one per line' },
    imaxe:              { gl:'Imaxe', es:'Imagen', pt:'Imagem', en:'Image' },
    historial_mantemento: { gl:'Historial mantemento', es:'Historial mantenimiento', pt:'Histórico manutenção', en:'Maintenance history' },

    // ---- Landing: secciones extra ----
    os_nosos_instrumentos: { gl:'Os nosos instrumentos', es:'Nuestros instrumentos', pt:'Os nossos instrumentos', en:'Our instruments' },
    desc_surdo:     { gl:'O corazón da batucada. Graves profundos que marcan o pulso.', es:'El corazón de la batucada. Graves profundos que marcan el pulso.', pt:'O coração da batucada. Graves profundos que marcam o pulso.', en:'The heart of the batucada. Deep bass that sets the pulse.' },
    desc_caixa:     { gl:'A caixa clara que dialoga co surdo e engade textura rítmica.', es:'La caja clara que dialoga con el surdo y añade textura rítmica.', pt:'A caixa clara que dialoga com o surdo e acrescenta textura rítmica.', en:'The snare drum that dialogues with the surdo and adds rhythmic texture.' },
    desc_repinique: { gl:'Dirixe a batucada con chamadas e breaks cheos de enerxía.', es:'Dirige la batucada con llamadas y breaks llenos de energía.', pt:'Dirige a batucada com chamadas e breaks cheios de energia.', en:'Leads the batucada with energetic calls and breaks.' },
    desc_tamborim:  { gl:'Pequeno pero potente, engade melodía e acentos ao ritmo.', es:'Pequeño pero potente, añade melodía y acentos al ritmo.', pt:'Pequeno mas potente, acrescenta melodia e acentos ao ritmo.', en:'Small but mighty, adds melody and accents to the rhythm.' },
    desc_timbao:    { gl:'O timbao engade profundidade e corpo co seu son grave e resonante.', es:'El timbao añade profundidad y cuerpo con su sonido grave y resonante.', pt:'O timbao acrescenta profundidade e corpo com o seu som grave e ressonante.', en:'The timbao adds depth and body with its deep, resonant sound.' },
    desc_agogo:     { gl:'Campás metálicas que crean melodías e sinais rítmicos.', es:'Campanas metálicas que crean melodías y señales rítmicas.', pt:'Sinos metálicos que criam melodias e sinais rítmicos.', en:'Metal bells that create melodies and rhythmic signals.' },
    desc_ganza:     { gl:'O shaker que enche os ocos e dá continuidade ao ritmo.', es:'El shaker que llena los huecos y da continuidad al ritmo.', pt:'O shaker que preenche os vazios e dá continuidade ao ritmo.', en:'The shaker that fills the gaps and gives continuity to the rhythm.' },
    desc_apito:     { gl:'O apito do mestre que marca entradas, saídas e breaks.', es:'El silbato del mestre que marca entradas, salidas y breaks.', pt:'O apito do mestre que marca entradas, saídas e breaks.', en:'The master\'s whistle that signals entries, exits and breaks.' },
    unirse_titulo:  { gl:'Queres tocar con nós?', es:'¿Quieres tocar con nosotros?', pt:'Queres tocar connosco?', en:'Want to play with us?' },
    unirse_texto:   { gl:'Non precisas experiencia previa. Ensaiamos todas as semanas e ensinamos dende cero. Únete á Levada!', es:'No necesitas experiencia previa. Ensayamos cada semana y enseñamos desde cero. ¡Únete a Levada!', pt:'Não precisas de experiência prévia. Ensaiamos todas as semanas e ensinamos desde o zero. Junta-te à Levada!', en:'No previous experience needed. We rehearse every week and teach from scratch. Join Levada!' },
    unirse_btn:     { gl:'Rexístrate agora', es:'Regístrate ahora', pt:'Regista-te agora', en:'Sign up now' },
    localizacion:   { gl:'Localización', es:'Localización', pt:'Localização', en:'Location' },
    footer_desc:    { gl:'Grupo de batucada con sede en Estás, Tomiño, na fronteira entre Galicia e Portugal.', es:'Grupo de batucada con sede en Estás, Tomiño, en la frontera entre Galicia y Portugal.', pt:'Grupo de batucada com sede em Estás, Tomiño, na fronteira entre a Galiza e Portugal.', en:'Batucada group based in Estás, Tomiño, on the border between Galicia and Portugal.' },
    enlaces:        { gl:'Ligazóns', es:'Enlaces', pt:'Ligações', en:'Links' },
    frontera_ritmo: { gl:'Na fronteira do ritmo', es:'En la frontera del ritmo', pt:'Na fronteira do ritmo', en:'On the border of rhythm' },
    bolos_realizados: { gl:'Bolos realizados', es:'Bolos realizados', pt:'Bolos realizados', en:'Past gigs' },
    cal_inicio:     { gl:'Inicio', es:'Inicio', pt:'Início', en:'Start' },
    cal_peche:      { gl:'Peche', es:'Cierre', pt:'Encerramento', en:'Deadline' },
    calendario:     { gl:'Calendario', es:'Calendario', pt:'Calendário', en:'Calendar' },
    cal_cores_desc: { gl:'Personaliza as cores dos eventos no calendario do panel.', es:'Personaliza los colores de los eventos en el calendario del panel.', pt:'Personaliza as cores dos eventos no calendário do painel.', en:'Customize event colors on the dashboard calendar.' },
    restablecer:    { gl:'Restablecer', es:'Restablecer', pt:'Restaurar', en:'Reset' },

    // ---- Galería: editor de fotos ----
    foto_titulo:        { gl:'Título da foto', es:'Título de la foto', pt:'Título da foto', en:'Photo title' },
    foto_alt:           { gl:'Texto alternativo', es:'Texto alternativo', pt:'Texto alternativo', en:'Alt text' },
    definir_portada:    { gl:'Definir como portada', es:'Definir como portada', pt:'Definir como capa', en:'Set as cover' },
    eliminar_foto:      { gl:'Eliminar foto', es:'Eliminar foto', pt:'Eliminar foto', en:'Delete photo' },
    seleccionar:        { gl:'Seleccionar', es:'Seleccionar', pt:'Selecionar', en:'Select' },
    arrastra_reordenar: { gl:'Arrastra para reordenar', es:'Arrastra para reordenar', pt:'Arraste para reordenar', en:'Drag to reorder' },

    // ---- Comentarios ----
    comentarios:            { gl:'Comentarios', es:'Comentarios', pt:'Comentários', en:'Comments' },
    comentario:             { gl:'Comentario', es:'Comentario', pt:'Comentário', en:'Comment' },
    novo_comentario:        { gl:'Novo comentario', es:'Nuevo comentario', pt:'Novo comentário', en:'New comment' },
    escribir_comentario:    { gl:'Escribe un comentario...', es:'Escribe un comentario...', pt:'Escreva um comentário...', en:'Write a comment...' },
    comentario_engadido:    { gl:'Comentario engadido', es:'Comentario añadido', pt:'Comentário adicionado', en:'Comment added' },
    comentario_eliminado:   { gl:'Comentario eliminado', es:'Comentario eliminado', pt:'Comentário eliminado', en:'Comment deleted' },
    iniciar_sesion_comentar:{ gl:'Inicia sesión para comentar', es:'Inicia sesión para comentar', pt:'Inicie sessão para comentar', en:'Log in to comment' },
    admin_comentarios:      { gl:'Xestión de comentarios', es:'Gestión de comentarios', pt:'Gestão de comentários', en:'Comment management' },

    // ---- Moderación de comentarios ----
    metodo_envio:       { gl:'Método de envío de correo', es:'Método de envío de correo', pt:'Método de envio de email', en:'Email sending method' },
    cifrado:            { gl:'Cifrado', es:'Cifrado', pt:'Encriptação', en:'Encryption' },
    ningunha:           { gl:'Ningunha', es:'Ninguna', pt:'Nenhuma', en:'None' },
    moderacion_comentarios: { gl:'Moderación de comentarios', es:'Moderación de comentarios', pt:'Moderação de comentários', en:'Comment moderation' },
    publicar_automaticamente: { gl:'Publicar automaticamente', es:'Publicar automáticamente', pt:'Publicar automaticamente', en:'Auto-publish' },
    requirir_aprobacion: { gl:'Requirir aprobación', es:'Requerir aprobación', pt:'Requerer aprovação', en:'Require approval' },
    comentario_pendente_moderacion: { gl:'Comentario enviado, pendente de aprobación', es:'Comentario enviado, pendiente de aprobación', pt:'Comentário enviado, pendente de aprovação', en:'Comment sent, pending approval' },
    resposta:           { gl:'Resposta', es:'Respuesta', pt:'Resposta', en:'Reply' },
    pendentes:          { gl:'Pendentes', es:'Pendientes', pt:'Pendentes', en:'Pending' },
    aprobados:          { gl:'Aprobados', es:'Aprobados', pt:'Aprovados', en:'Approved' },
    rexeitados:         { gl:'Rexeitados', es:'Rechazados', pt:'Rejeitados', en:'Rejected' },

    // ---- Solicitude de unirse ----
    quero_unirme:           { gl:'Quero unirme', es:'Quiero unirme', pt:'Quero juntar-me', en:'I want to join' },
    solicitude_enviada:     { gl:'Solicitude enviada correctamente!', es:'Solicitud enviada correctamente!', pt:'Pedido enviado com sucesso!', en:'Request sent successfully!' },
    teu_nome:               { gl:'O teu nome', es:'Tu nombre', pt:'O teu nome', en:'Your name' },
    teu_email:              { gl:'O teu email', es:'Tu email', pt:'O teu email', en:'Your email' },
    teu_telefono:           { gl:'O teu teléfono', es:'Tu teléfono', pt:'O teu telefone', en:'Your phone' },
    comentario_opcional:    { gl:'Comentario (opcional)', es:'Comentario (opcional)', pt:'Comentário (opcional)', en:'Comment (optional)' },
    enviar_solicitude:      { gl:'Enviar solicitude', es:'Enviar solicitud', pt:'Enviar pedido', en:'Send request' },
    solicitude_info_usuario:{ gl:'Os teus datos enviaranse xunto coa solicitude', es:'Tus datos se enviarán junto con la solicitud', pt:'Os teus dados serão enviados com o pedido', en:'Your data will be sent with the request' },
    xa_formas_parte:        { gl:'Xa formas parte da batucada!', es:'Ya formas parte de la batucada!', pt:'Ja fazes parte da batucada!', en:'You are already part of the batucada!' },
    ir_ao_panel:            { gl:'Ir ao panel', es:'Ir al panel', pt:'Ir ao painel', en:'Go to panel' },

    // ---- Forgot / Reset password ----
    esquecin_contrasinal:   { gl:'Esquecín o contrasinal', es:'Olvidé mi contraseña', pt:'Esqueci a senha', en:'Forgot password' },
    recuperar_contrasinal:  { gl:'Recuperar contrasinal', es:'Recuperar contraseña', pt:'Recuperar senha', en:'Recover password' },
    recuperar_desc:         { gl:'Introduce o teu usuario ou email e enviarémosche un enlace para restablecer o contrasinal.', es:'Introduce tu usuario o email y te enviaremos un enlace para restablecer la contraseña.', pt:'Introduz o teu utilizador ou email e enviaremos um link para redefinir a senha.', en:'Enter your username or email and we will send you a link to reset your password.' },
    usuario_ou_email:       { gl:'Usuario ou email', es:'Usuario o email', pt:'Utilizador ou email', en:'Username or email' },
    reset_email_enviado:    { gl:'Se o usuario ou email existe, recibirás un correo con instrucións.', es:'Si el usuario o email existe, recibirás un correo con instrucciones.', pt:'Se o utilizador ou email existir, receberás um email com instruções.', en:'If the username or email exists, you will receive an email with instructions.' },
    novo_contrasinal:       { gl:'Novo contrasinal', es:'Nueva contraseña', pt:'Nova senha', en:'New password' },
    restablecer_contrasinal:{ gl:'Restablecer contrasinal', es:'Restablecer contraseña', pt:'Redefinir senha', en:'Reset password' },
    contrasinal_restablecido:{ gl:'Contrasinal restablecido correctamente. Xa podes iniciar sesión.', es:'Contraseña restablecida correctamente. Ya puedes iniciar sesión.', pt:'Senha redefinida com sucesso. Já podes iniciar sessão.', en:'Password reset successfully. You can now log in.' },
    voltar_login:           { gl:'Voltar ao login', es:'Volver al login', pt:'Voltar ao login', en:'Back to login' },

    // ---- Landing backgrounds ----
    paxina_inicio:      { gl:'Páxina de inicio', es:'Página de inicio', pt:'Página inicial', en:'Home page' },
    fondo_imaxe:        { gl:'Imaxe de fondo', es:'Imagen de fondo', pt:'Imagem de fundo', en:'Background image' },
    fondo_video:        { gl:'Video de fondo', es:'Video de fondo', pt:'Video de fundo', en:'Background video' },
    fondo_cor:          { gl:'Cor de fondo', es:'Color de fondo', pt:'Cor de fundo', en:'Background color' },
    parallax:           { gl:'Efecto parallax', es:'Efecto parallax', pt:'Efeito parallax', en:'Parallax effect' },
    overlay_opacidade:  { gl:'Opacidade do overlay', es:'Opacidad del overlay', pt:'Opacidade do overlay', en:'Overlay opacity' },
    seccion_activa:     { gl:'Activa', es:'Activa', pt:'Ativa', en:'Active' },
    divisor_debaixo:    { gl:'Divisor debaixo', es:'Divisor debajo', pt:'Divisor abaixo', en:'Divider below' },
    bg_tamano:          { gl:'Tamano do fondo', es:'Tamano del fondo', pt:'Tamanho do fundo', en:'Background size' },
    bg_tamano_custom:   { gl:'Ancho (px)', es:'Ancho (px)', pt:'Largura (px)', en:'Width (px)' },
    personalizado:      { gl:'Personalizado', es:'Personalizado', pt:'Personalizado', en:'Custom' },
    bg_repeticion:      { gl:'Repeticion', es:'Repeticion', pt:'Repeticao', en:'Repeat' },
    bg_posicion:        { gl:'Posicion', es:'Posicion', pt:'Posicao', en:'Position' },
    quitar_imaxe:       { gl:'Quitar imaxe', es:'Quitar imagen', pt:'Remover imagem', en:'Remove image' },
    quitar_video:       { gl:'Quitar video', es:'Quitar video', pt:'Remover video', en:'Remove video' },
    gardado:            { gl:'Gardado', es:'Guardado', pt:'Salvo', en:'Saved' },
    max_elementos:      { gl:'Max. elementos', es:'Max. elementos', pt:'Max. elementos', en:'Max. items' },
    max_elementos_movil:{ gl:'Max. movil', es:'Max. movil', pt:'Max. movel', en:'Max. mobile' },
    solicitar_asistir:{ gl:'Solicitar asistir', es:'Solicitar asistir', pt:'Solicitar presenca', en:'Request attendance' },
    confirmar_solicitar_asistencia:{ gl:'Enviar solicitude de asistencia?', es:'Enviar solicitud de asistencia?', pt:'Enviar pedido de presenca?', en:'Send attendance request?' },
    solicitude_asistencia_enviada:{ gl:'Solicitude enviada', es:'Solicitud enviada', pt:'Pedido enviado', en:'Request sent' },
    desarrollada_por:{ gl:'Desenvolvida por', es:'Desarrollada por', pt:'Desenvolvida por', en:'Developed by' },
    contacto:{ gl:'Contacto', es:'Contacto', pt:'Contacto', en:'Contact' },
    enderezo:{ gl:'Enderezo', es:'Dirección', pt:'Morada', en:'Address' },
    enviar_mensaxe:{ gl:'Enviar mensaxe', es:'Enviar mensaje', pt:'Enviar mensagem', en:'Send message' },
    asunto:{ gl:'Asunto', es:'Asunto', pt:'Assunto', en:'Subject' },
    mensaxe:{ gl:'Mensaxe', es:'Mensaje', pt:'Mensagem', en:'Message' },
    mensaxe_enviada:{ gl:'Mensaxe enviada correctamente', es:'Mensaje enviado correctamente', pt:'Mensagem enviada com sucesso', en:'Message sent successfully' },

    // ---- Traduccions i18n ----
    traduccions:        { gl:'Traducións', es:'Traducciones', pt:'Traduções', en:'Translations' },
    campo_opcional:     { gl:'Campo opcional', es:'Campo opcional', pt:'Campo opcional', en:'Optional field' },

    // ---- Solicitudes de contratacion ----
    contratar_titulo:   { gl:'Presuposto sen compromiso', es:'Presupuesto sin compromiso', pt:'Orcamento sem compromisso', en:'No-obligation quote' },
    contratar_texto:    { gl:'Queres que a Levada Arraiana toque no teu evento? Contanos que tes en mente e contactarémoste.', es:'Quieres que Levada Arraiana toque en tu evento? Cuéntanos qué tienes en mente y te contactaremos.', pt:'Queres que a Levada Arraiana toque no teu evento? Conta-nos o que tens em mente e entraremos em contacto.', en:'Want Levada Arraiana to play at your event? Tell us what you have in mind and we will get in touch.' },
    contratar_btn:      { gl:'Pedir presuposto', es:'Pedir presupuesto', pt:'Pedir orcamento', en:'Request a quote' },
    contratar_enviada:  { gl:'Solicitude de contratacion enviada correctamente!', es:'Solicitud de contratacion enviada correctamente!', pt:'Pedido de contratacao enviado com sucesso!', en:'Booking request sent successfully!' },
    data_evento_desexada: { gl:'Data desexada do evento', es:'Fecha deseada del evento', pt:'Data desejada do evento', en:'Desired event date' },
    lugar_evento:       { gl:'Lugar do evento', es:'Lugar del evento', pt:'Local do evento', en:'Event location' },
    tipo_evento:        { gl:'Tipo de evento', es:'Tipo de evento', pt:'Tipo de evento', en:'Event type' },
    outro:              { gl:'Outro', es:'Otro', pt:'Outro', en:'Other' },
    selecciona_tipo:    { gl:'Selecciona un tipo', es:'Selecciona un tipo', pt:'Seleciona um tipo', en:'Select a type' },
    descricion_evento:  { gl:'Descricion do evento', es:'Descripcion del evento', pt:'Descricao do evento', en:'Event description' },
    descricion_evento_placeholder: { gl:'Cóntanos sobre o teu evento...', es:'Cuéntanos sobre tu evento...', pt:'Conta-nos sobre o teu evento...', en:'Tell us about your event...' },
    solicitudes:        { gl:'Solicitudes', es:'Solicitudes', pt:'Pedidos', en:'Requests' },
    sol_pendente:       { gl:'Pendente', es:'Pendiente', pt:'Pendente', en:'Pending' },
    sol_contactado:     { gl:'Contactado', es:'Contactado', pt:'Contactado', en:'Contacted' },
    sol_aceptado:       { gl:'Aceptado', es:'Aceptado', pt:'Aceite', en:'Accepted' },
    sol_rexeitado:      { gl:'Rexeitado', es:'Rechazado', pt:'Rejeitado', en:'Rejected' },
    sol_converter_bolo: { gl:'Converter en bolo', es:'Convertir en bolo', pt:'Converter em bolo', en:'Convert to gig' },
    cliente:            { gl:'Cliente', es:'Cliente', pt:'Cliente', en:'Client' },
    importe:            { gl:'Importe', es:'Importe', pt:'Montante', en:'Amount' },
    orden_gardado:      { gl:'Orde gardada', es:'Orden guardado', pt:'Ordem salva', en:'Order saved' },
    max_fotos_destacadas:{ gl:'Max. fotos destacadas', es:'Max. fotos destacadas', pt:'Max. fotos em destaque', en:'Max. featured photos' },
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
