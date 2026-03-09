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
    socios:             { gl:'Socios', es:'Socios', pt:'Sócios', en:'Members' },
    instrumento:        { gl:'Instrumento', es:'Instrumento', pt:'Instrumento', en:'Instrument' },
    rol:                { gl:'Rol', es:'Rol', pt:'Papel', en:'Role' },
    estado:             { gl:'Estado', es:'Estado', pt:'Estado', en:'Status' },
    email:              { gl:'Email', es:'Email', pt:'Email', en:'Email' },
    telefono:           { gl:'Teléfono', es:'Teléfono', pt:'Telefone', en:'Phone' },
    dni:                { gl:'DNI', es:'DNI', pt:'NIF', en:'ID' },
    data_alta:          { gl:'Data alta', es:'Fecha alta', pt:'Data registo', en:'Join date' },
    activo:             { gl:'Activo', es:'Activo', pt:'Ativo', en:'Active' },
    activos:            { gl:'activos', es:'activos', pt:'ativos', en:'active' },
    inactivo:           { gl:'Inactivo', es:'Inactivo', pt:'Inativo', en:'Inactive' },
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
    proximo_bolo:       { gl:'Próximo bolo', es:'Próximo bolo', pt:'Próximo bolo', en:'Next gig' },
    proximo_ensaio:     { gl:'Próximo ensaio', es:'Próximo ensayo', pt:'Próximo ensaio', en:'Next rehearsal' },
    sen_proximos:       { gl:'Non hai próximos eventos', es:'No hay próximos eventos', pt:'Não há próximos eventos', en:'No upcoming events' },
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
    asistentes_reunion: { gl:'Asistentes', es:'Asistentes', pt:'Presentes', en:'Attendees' },
    desde:              { gl:'Desde', es:'Desde', pt:'Desde', en:'From' },
    ata:                { gl:'Ata', es:'Hasta', pt:'Até', en:'Until' },
    ver_acta:           { gl:'Ver acta completa', es:'Ver acta completa', pt:'Ver ata completa', en:'View full minutes' },

    // ---- Documentos / Arquivos ----
    documento:          { gl:'Documento', es:'Documento', pt:'Documento', en:'Document' },
    novo_documento:     { gl:'Novo documento', es:'Nuevo documento', pt:'Novo documento', en:'New document' },
    visibilidade:       { gl:'Visibilidade', es:'Visibilidad', pt:'Visibilidade', en:'Visibility' },
    todos:              { gl:'Todos', es:'Todos', pt:'Todos', en:'All' },
    carpeta:            { gl:'Carpeta', es:'Carpeta', pt:'Pasta', en:'Folder' },
    tamano:             { gl:'Tama\u00f1o', es:'Tama\u00f1o', pt:'Tamanho', en:'Size' },
    todas_carpetas:     { gl:'Todas', es:'Todas', pt:'Todas', en:'All' },
    arquivos:           { gl:'Arquivos', es:'Archivos', pt:'Ficheiros', en:'Files' },
    subir_arquivos:     { gl:'Subir arquivos', es:'Subir archivos', pt:'Enviar ficheiros', en:'Upload files' },
    arrastra_arquivos:  { gl:'Arrastra os arquivos aquí', es:'Arrastra los archivos aquí', pt:'Arraste os ficheiros aqui', en:'Drag files here' },
    seleccionar_arquivos: { gl:'Seleccionar arquivos', es:'Seleccionar archivos', pt:'Selecionar ficheiros', en:'Select files' },
    subir:              { gl:'Subir', es:'Subir', pt:'Enviar', en:'Upload' },
    subidos:            { gl:'Subidos', es:'Subidos', pt:'Enviados', en:'Uploaded' },

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
    enlace_copiado:     { gl:'Enlace copiado para compartir en Instagram', es:'Enlace copiado para compartir en Instagram', pt:'Link copiado para compartilhar no Instagram', en:'Link copied to share on Instagram' },

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
    vista_tarxetas:     { gl:'Tarxetas', es:'Tarjetas', pt:'Cartões', en:'Cards' },
    hora_fin_antes:     { gl:'A hora fin debe ser posterior á hora inicio', es:'La hora fin debe ser posterior a la hora inicio', pt:'A hora fim deve ser posterior à hora início', en:'End time must be after start time' },
    conflicto_horario:  { gl:'Xa existe un ensaio nese lugar e horario. Continuar?', es:'Ya existe un ensayo en ese lugar y horario. ¿Continuar?', pt:'Já existe um ensaio nesse local e horário. Continuar?', en:'A rehearsal already exists at that place and time. Continue?' },
    confirmo:           { gl:'Confirmo', es:'Confirmo', pt:'Confirmo', en:'I confirm' },
    non_podo:           { gl:'Non podo', es:'No puedo', pt:'Não posso', en:'Cannot attend' },
    chegarei_tarde:     { gl:'Chegarei tarde', es:'Llegaré tarde', pt:'Chegarei tarde', en:'Will be late' },
    confirmados_bolo:   { gl:'Confirmados', es:'Confirmados', pt:'Confirmados', en:'Confirmed' },
    ninguen_confirmou:  { gl:'Aínda ninguén confirmou', es:'Todavía nadie confirmó', pt:'Ainda ninguém confirmou', en:'No one confirmed yet' },
    reconto_instrumentos: { gl:'Reconto de instrumentos', es:'Recuento de instrumentos', pt:'Contagem de instrumentos', en:'Instrument count' },
    sen_confirmados_instrumentos: { gl:'Non hai confirmados con instrumento', es:'No hay confirmados con instrumento', pt:'Não há confirmados com instrumento', en:'No confirmed with instrument' },
    confirmar_asistencia_link: { gl:'Confirma a túa asistencia aquí', es:'Confirma tu asistencia aquí', pt:'Confirma a tua presença aqui', en:'Confirm your attendance here' },
    o_teu_estado:       { gl:'O teu estado', es:'Tu estado', pt:'O teu estado', en:'Your status' },
    n_sesions_previstas:{ gl:'{n} sesións previstas', es:'{n} sesiones previstas', pt:'{n} sessões previstas', en:'{n} sessions planned' },
    todos_estados:      { gl:'Todos os estados', es:'Todos los estados', pt:'Todos os estados', en:'All statuses' },
    meses_curtos:       { gl:['Xan','Feb','Mar','Abr','Mai','Xuñ','Xul','Ago','Set','Out','Nov','Dec'], es:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], pt:['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'], en:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },

    // ---- Multi-instrumento ----
    principal:           { gl:'Principal', es:'Principal', pt:'Principal', en:'Primary' },
    secundario:          { gl:'Secundario', es:'Secundario', pt:'Secundário', en:'Secondary' },
    terciario:           { gl:'Terciario', es:'Terciario', pt:'Terciário', en:'Tertiary' },
    nivel_n:             { gl:'Nivel {n}', es:'Nivel {n}', pt:'Nível {n}', en:'Level {n}' },
    reasignacions:       { gl:'{n} reasignación(s)', es:'{n} reasignación(es)', pt:'{n} reatribuição(ões)', en:'{n} reassignment(s)' },
    sen_cobertura:       { gl:'Sen cobertura', es:'Sin cobertura', pt:'Sem cobertura', en:'Uncovered' },
    instrumento_asignado:{ gl:'Instrumento asignado', es:'Instrumento asignado', pt:'Instrumento atribuído', en:'Assigned instrument' },
    engadir_instrumento: { gl:'Engadir instrumento', es:'Añadir instrumento', pt:'Adicionar instrumento', en:'Add instrument' },
    meus_instrumentos:   { gl:'Os meus instrumentos', es:'Mis instrumentos', pt:'Meus instrumentos', en:'My instruments' },

    // ---- Instrumentos ----
    novo_instrumento:   { gl:'Novo instrumento', es:'Nuevo instrumento', pt:'Novo instrumento', en:'New instrument' },
    audio_mostra:       { gl:'Audio/vídeo de mostra', es:'Audio/vídeo de muestra', pt:'Áudio/vídeo de amostra', en:'Sample audio/video' },
    escoitar:           { gl:'Escoitar', es:'Escuchar', pt:'Ouvir', en:'Listen' },
    ver_video:          { gl:'Ver vídeo', es:'Ver vídeo', pt:'Ver vídeo', en:'Watch video' },
    gravar_audio:       { gl:'Gravar audio', es:'Grabar audio', pt:'Gravar áudio', en:'Record audio' },
    gravar_video:       { gl:'Gravar vídeo', es:'Grabar vídeo', pt:'Gravar vídeo', en:'Record video' },
    parar_gravacion:    { gl:'Parar', es:'Parar', pt:'Parar', en:'Stop' },

    // ---- Repertorio ----
    ritmo:              { gl:'Ritmo', es:'Ritmo', pt:'Ritmo', en:'Rhythm' },
    novo_ritmo:         { gl:'Novo ritmo', es:'Nuevo ritmo', pt:'Novo ritmo', en:'New rhythm' },
    tempo_bpm:          { gl:'Tempo (BPM)', es:'Tempo (BPM)', pt:'Tempo (BPM)', en:'Tempo (BPM)' },
    dificultade:        { gl:'Dificultade', es:'Dificultad', pt:'Dificuldade', en:'Difficulty' },
    facil:              { gl:'Fácil', es:'Fácil', pt:'Fácil', en:'Easy' },
    media:              { gl:'Media', es:'Media', pt:'Média', en:'Medium' },
    dificil:            { gl:'Difícil', es:'Difícil', pt:'Difícil', en:'Hard' },
    audio:              { gl:'Audio', es:'Audio', pt:'Áudio', en:'Audio' },
    video:              { gl:'Vídeo', es:'Vídeo', pt:'Vídeo', en:'Video' },
    partitura:          { gl:'Partitura', es:'Partitura', pt:'Partitura', en:'Score' },
    estructura:         { gl:'Estructura', es:'Estructura', pt:'Estrutura', en:'Structure' },
    inicio:             { gl:'Inicio', es:'Inicio', pt:'Início', en:'Intro' },
    andamento:          { gl:'Andamento', es:'Andamiento', pt:'Andamento', en:'Movement' },
    corte:              { gl:'Corte', es:'Corte', pt:'Corte', en:'Break' },
    final_cierre:       { gl:'Final', es:'Final', pt:'Final', en:'Ending' },
    engadir_andamento:  { gl:'Engadir andamento', es:'Añadir andamiento', pt:'Adicionar andamento', en:'Add movement' },
    engadir_corte:      { gl:'Engadir corte', es:'Añadir corte', pt:'Adicionar corte', en:'Add break' },
    descargar:          { gl:'Descargar', es:'Descargar', pt:'Descarregar', en:'Download' },
    descargar_medios:   { gl:'Descargar medios (ZIP)', es:'Descargar medios (ZIP)', pt:'Descarregar médias (ZIP)', en:'Download media (ZIP)' },
    abrir_youtube:      { gl:'Abrir en YouTube', es:'Abrir en YouTube', pt:'Abrir no YouTube', en:'Open on YouTube' },
    preparando_descarga:{ gl:'Preparando descarga...', es:'Preparando descarga...', pt:'Preparando download...', en:'Preparing download...' },
    sen_medios:         { gl:'Non hai medios para descargar', es:'No hay medios para descargar', pt:'Não há médias para descarregar', en:'No media to download' },
    gravar:             { gl:'Gravar', es:'Grabar', pt:'Gravar', en:'Record' },
    gravando:           { gl:'Gravando... Pulsa de novo para parar', es:'Grabando... Pulsa de nuevo para parar', pt:'Gravando... Clique novamente para parar', en:'Recording... Click again to stop' },
    gravando_pulsa_parar: { gl:'Gravando — pulsa para parar', es:'Grabando — pulsa para parar', pt:'Gravando — clique para parar', en:'Recording — click to stop' },
    erro_permiso_micro: { gl:'Non se puido acceder ao micrófono/cámara', es:'No se pudo acceder al micrófono/cámara', pt:'Não foi possível aceder ao microfone/câmera', en:'Could not access microphone/camera' },
    listo:              { gl:'Listo', es:'Listo', pt:'Pronto', en:'Ready' },
    pausa:              { gl:'Pausa', es:'Pausa', pt:'Pausa', en:'Pause' },
    parar:              { gl:'Parar', es:'Parar', pt:'Parar', en:'Stop' },
    continuar:          { gl:'Continuar', es:'Continuar', pt:'Continuar', en:'Continue' },
    gravar_audio:       { gl:'Gravar audio', es:'Grabar audio', pt:'Gravar áudio', en:'Record audio' },

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
    servizos_externos:  { gl:'Servizos externos', es:'Servicios externos', pt:'Serviços externos', en:'External services' },
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

    // ---- Whisper / Transcrición ----
    transcribir:        { gl:'Transcribir', es:'Transcribir', pt:'Transcrever', en:'Transcribe' },
    transcribindo:      { gl:'Transcribindo...', es:'Transcribiendo...', pt:'Transcrevendo...', en:'Transcribing...' },
    transcricion:       { gl:'Transcrición', es:'Transcripción', pt:'Transcrição', en:'Transcription' },
    inserir_contido:    { gl:'Inserir no contido', es:'Insertar en contenido', pt:'Inserir no conteúdo', en:'Insert into content' },
    transcricion_inserida: { gl:'Transcrición inserida no contido', es:'Transcripción insertada en contenido', pt:'Transcrição inserida no conteúdo', en:'Transcription inserted into content' },
    erro_transcricion:  { gl:'Erro ao transcribir o audio', es:'Error al transcribir el audio', pt:'Erro ao transcrever o áudio', en:'Error transcribing audio' },
    xerar_resumo:       { gl:'Xerar resumo', es:'Generar resumen', pt:'Gerar resumo', en:'Generate summary' },
    xerando_resumo:     { gl:'Xerando resumo...', es:'Generando resumen...', pt:'Gerando resumo...', en:'Generating summary...' },
    resumo_inserido:    { gl:'Resumo inserido no contido', es:'Resumen insertado en contenido', pt:'Resumo inserido no conteúdo', en:'Summary inserted into content' },
    erro_resumo:        { gl:'Erro ao xerar o resumo', es:'Error al generar el resumen', pt:'Erro ao gerar o resumo', en:'Error generating summary' },
    groq_api_key:       { gl:'Groq API Key (Whisper)', es:'Groq API Key (Whisper)', pt:'Groq API Key (Whisper)', en:'Groq API Key (Whisper)' },

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

    // ---- Legal / Cookies ----
    legal:              { gl:'Legal', es:'Legal', pt:'Legal', en:'Legal' },
    aviso_legal:        { gl:'Aviso Legal', es:'Aviso Legal', pt:'Aviso Legal', en:'Legal Notice' },
    politica_privacidade:{ gl:'Politica de Privacidade', es:'Politica de Privacidad', pt:'Politica de Privacidade', en:'Privacy Policy' },
    politica_cookies:   { gl:'Politica de Cookies', es:'Politica de Cookies', pt:'Politica de Cookies', en:'Cookie Policy' },
    cookie_texto:       { gl:'Este sitio usa almacenamento local para funcionar correctamente.', es:'Este sitio usa almacenamiento local para funcionar correctamente.', pt:'Este site usa armazenamento local para funcionar corretamente.', en:'This site uses local storage to work properly.' },
    aceptar:            { gl:'Aceptar', es:'Aceptar', pt:'Aceitar', en:'Accept' },
    rexeitar:           { gl:'Rexeitar', es:'Rechazar', pt:'Rejeitar', en:'Reject' },
    mais_info:          { gl:'Mais info', es:'Mas info', pt:'Mais info', en:'More info' },
    legal_titular:      { gl:'Titular', es:'Titular', pt:'Titular', en:'Owner' },
    legal_nif:          { gl:'NIF', es:'NIF', pt:'NIF', en:'Tax ID' },
    legal_enderezo:     { gl:'Enderezo', es:'Direccion', pt:'Endereco', en:'Address' },
    legal_email_contacto:{ gl:'Email de contacto', es:'Email de contacto', pt:'Email de contacto', en:'Contact email' },
    legal_prop_intelectual:{ gl:'Propiedade intelectual', es:'Propiedad intelectual', pt:'Propriedade intelectual', en:'Intellectual property' },
    legal_lei_aplicable:{ gl:'Lei aplicable', es:'Ley aplicable', pt:'Lei aplicavel', en:'Applicable law' },
    legal_finalidade:   { gl:'Finalidade', es:'Finalidad', pt:'Finalidade', en:'Purpose' },
    legal_datos_recollidos:{ gl:'Datos recollidos', es:'Datos recogidos', pt:'Dados recolhidos', en:'Data collected' },
    legal_base_legal:   { gl:'Base legal', es:'Base legal', pt:'Base legal', en:'Legal basis' },
    legal_dereitos:     { gl:'Os teus dereitos', es:'Tus derechos', pt:'Os teus direitos', en:'Your rights' },
    legal_retencion:    { gl:'Retencion de datos', es:'Retencion de datos', pt:'Retencao de dados', en:'Data retention' },
    legal_cesion:       { gl:'Cesion de datos a terceiros', es:'Cesion de datos a terceros', pt:'Cessao de dados a terceiros', en:'Data sharing with third parties' },
    legal_seguridade:   { gl:'Medidas de seguridade', es:'Medidas de seguridad', pt:'Medidas de seguranca', en:'Security measures' },
    legal_que_almacenamos:{ gl:'Que almacenamos', es:'Que almacenamos', pt:'O que armazenamos', en:'What we store' },
    legal_terceiros:    { gl:'Cookies de terceiros', es:'Cookies de terceros', pt:'Cookies de terceiros', en:'Third-party cookies' },

    // Aviso Legal paragraphs
    legal_aviso_p1: {
        gl:'En cumprimento do artigo 10 da Lei 34/2002, do 11 de xullo, de Servizos da Sociedade da Informacion e Comercio Electronico (LSSI-CE), o titular deste sitio web pon a disposicion dos usuarios a seguinte informacion:',
        es:'En cumplimiento del articulo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Informacion y de Comercio Electronico (LSSI-CE), el titular de este sitio web pone a disposicion de los usuarios la siguiente informacion:',
        pt:'Em cumprimento do artigo 10 da Lei 34/2002, de 11 de julho, de Servicos da Sociedade da Informacao e Comercio Eletronico (LSSI-CE), o titular deste site disponibiliza aos utilizadores a seguinte informacao:',
        en:'In compliance with Article 10 of Law 34/2002, of July 11, on Information Society Services and Electronic Commerce (LSSI-CE), the owner of this website provides users with the following information:'
    },
    legal_aviso_obxecto: { gl:'Obxecto', es:'Objeto', pt:'Objeto', en:'Purpose' },
    legal_aviso_obxecto_p1: {
        gl:'Este sitio web ten como finalidade servir de plataforma de xestion interna para a asociacion Levada Arraiana, un grupo de batucada con sede en Estas, Tomino (Pontevedra). A traves del, os membros poden xestionar ensaios, bolos, repertorio, votacions e documentacion interna, e o publico pode coñecer a actividade da asociacion, consultar o calendario de actuacions e solicitar informacion.',
        es:'Este sitio web tiene como finalidad servir de plataforma de gestion interna para la asociacion Levada Arraiana, un grupo de batucada con sede en Estas, Tomino (Pontevedra). A traves de el, los miembros pueden gestionar ensayos, bolos, repertorio, votaciones y documentacion interna, y el publico puede conocer la actividad de la asociacion, consultar el calendario de actuaciones y solicitar informacion.',
        pt:'Este site tem como finalidade servir de plataforma de gestao interna para a associacao Levada Arraiana, um grupo de batucada com sede em Estas, Tomino (Pontevedra). Atraves dele, os membros podem gerir ensaios, concertos, repertorio, votacoes e documentacao interna, e o publico pode conhecer a atividade da associacao, consultar o calendario de atuacoes e solicitar informacao.',
        en:'This website serves as an internal management platform for the association Levada Arraiana, a batucada group based in Estas, Tomino (Pontevedra). Through it, members can manage rehearsals, gigs, repertoire, votes and internal documentation, and the public can learn about the association\'s activities, check the performance calendar and request information.'
    },
    legal_aviso_condicions: { gl:'Condicionsde uso', es:'Condiciones de uso', pt:'Condicoes de uso', en:'Terms of use' },
    legal_aviso_condicions_p1: {
        gl:'O acceso a este sitio web atribue a condicion de usuario e implica a aceptacion plena e sen reservas de todas as disposicions incluidas neste aviso legal. O usuario comprometese a:<ul><li>Facer un uso adecuado da plataforma conforme a legalidade vixente, a boa fe e a orde publica.</li><li>Non utilizar a plataforma para fins ilicitos, lesivos ou que poidan danar a imaxe da asociacion.</li><li>Non intentar acceder a contas ou datos doutros usuarios.</li><li>Non introducir contidos que sexan falsos, enganosos, difamatorios ou que vulneren dereitos de terceiros.</li></ul>O incumprimento destas condicionspodera dar lugar a suspension ou eliminacion da conta de usuario.',
        es:'El acceso a este sitio web atribuye la condicion de usuario e implica la aceptacion plena y sin reservas de todas las disposiciones incluidas en este aviso legal. El usuario se compromete a:<ul><li>Hacer un uso adecuado de la plataforma conforme a la legalidad vigente, la buena fe y el orden publico.</li><li>No utilizar la plataforma para fines ilicitos, lesivos o que puedan danar la imagen de la asociacion.</li><li>No intentar acceder a cuentas o datos de otros usuarios.</li><li>No introducir contenidos que sean falsos, enganosos, difamatorios o que vulneren derechos de terceros.</li></ul>El incumplimiento de estas condiciones podra dar lugar a la suspension o eliminacion de la cuenta de usuario.',
        pt:'O acesso a este site atribui a condicao de utilizador e implica a aceitacao plena e sem reservas de todas as disposicoes incluidas neste aviso legal. O utilizador compromete-se a:<ul><li>Fazer um uso adequado da plataforma conforme a legalidade vigente, a boa fe e a ordem publica.</li><li>Nao utilizar a plataforma para fins ilicitos, lesivos ou que possam prejudicar a imagem da associacao.</li><li>Nao tentar aceder a contas ou dados de outros utilizadores.</li><li>Nao introduzir conteudos que sejam falsos, enganosos, difamatorios ou que violem direitos de terceiros.</li></ul>O incumprimento destas condicoes podera dar lugar a suspensao ou eliminacao da conta de utilizador.',
        en:'Access to this website confers the status of user and implies full and unreserved acceptance of all provisions included in this legal notice. The user agrees to:<ul><li>Use the platform appropriately in accordance with current legislation, good faith and public order.</li><li>Not use the platform for illicit or harmful purposes or purposes that may damage the association\'s image.</li><li>Not attempt to access other users\' accounts or data.</li><li>Not introduce content that is false, misleading, defamatory or that infringes third-party rights.</li></ul>Breach of these conditions may result in suspension or deletion of the user account.'
    },
    legal_aviso_responsabilidade: { gl:'Limitacion de responsabilidade', es:'Limitacion de responsabilidad', pt:'Limitacao de responsabilidade', en:'Limitation of liability' },
    legal_aviso_responsabilidade_p1: {
        gl:'A asociacion Levada Arraiana non se fai responsable de:<ul><li>Interrupcions no servizo por motivos tecnicos, de mantemento ou causas alleas ao seu control.</li><li>Danos derivados do uso indebido da plataforma por parte dos usuarios.</li><li>A veracidade dos contidos publicados polos usuarios (comentarios, propostas, etc.).</li><li>O contido de sitios web externos aos que se poida enlazar desde esta plataforma.</li></ul>A asociacion reservase o dereito de modificar, suspender ou eliminar calquera contido ou funcionalidade da plataforma sen previo aviso.',
        es:'La asociacion Levada Arraiana no se hace responsable de:<ul><li>Interrupciones en el servicio por motivos tecnicos, de mantenimiento o causas ajenas a su control.</li><li>Danos derivados del uso indebido de la plataforma por parte de los usuarios.</li><li>La veracidad de los contenidos publicados por los usuarios (comentarios, propuestas, etc.).</li><li>El contenido de sitios web externos a los que se pueda enlazar desde esta plataforma.</li></ul>La asociacion se reserva el derecho de modificar, suspender o eliminar cualquier contenido o funcionalidad de la plataforma sin previo aviso.',
        pt:'A associacao Levada Arraiana nao se responsabiliza por:<ul><li>Interrupcoes no servico por motivos tecnicos, de manutencao ou causas alheias ao seu controlo.</li><li>Danos derivados do uso indevido da plataforma por parte dos utilizadores.</li><li>A veracidade dos conteudos publicados pelos utilizadores (comentarios, propostas, etc.).</li><li>O conteudo de sites externos aos quais se possa ligar a partir desta plataforma.</li></ul>A associacao reserva-se o direito de modificar, suspender ou eliminar qualquer conteudo ou funcionalidade da plataforma sem aviso previo.',
        en:'The association Levada Arraiana is not responsible for:<ul><li>Service interruptions due to technical reasons, maintenance or causes beyond its control.</li><li>Damages arising from misuse of the platform by users.</li><li>The accuracy of content published by users (comments, proposals, etc.).</li><li>The content of external websites that may be linked from this platform.</li></ul>The association reserves the right to modify, suspend or remove any content or functionality of the platform without prior notice.'
    },
    legal_aviso_prop_p1: {
        gl:'Todos os contidos deste sitio web — incluidos textos, fotografias, videos, logotipos, iconografia, deseño grafico, codigo fonte e base de datos — son propiedade da asociacion Levada Arraiana ou dos seus lexitimos propietarios, e estan protexidos pola lexislacion espanola e comunitaria sobre propiedade intelectual e industrial. Queda expresamente prohibida a reproducion, distribucion, comunicacion publica ou transformacion total ou parcial dos contidos sen autorizacion expresa e por escrito do titular. O uso non autorizado dos contidos dara lugar as responsabilidades legalmente establecidas.',
        es:'Todos los contenidos de este sitio web — incluidos textos, fotografias, videos, logotipos, iconografia, diseno grafico, codigo fuente y base de datos — son propiedad de la asociacion Levada Arraiana o de sus legitimos propietarios, y estan protegidos por la legislacion espanola y comunitaria sobre propiedad intelectual e industrial. Queda expresamente prohibida la reproduccion, distribucion, comunicacion publica o transformacion total o parcial de los contenidos sin autorizacion expresa y por escrito del titular. El uso no autorizado de los contenidos dara lugar a las responsabilidades legalmente establecidas.',
        pt:'Todos os conteudos deste site — incluindo textos, fotografias, videos, logotipos, iconografia, design grafico, codigo fonte e base de dados — sao propriedade da associacao Levada Arraiana ou dos seus legitimos proprietarios, e estao protegidos pela legislacao espanhola e comunitaria sobre propriedade intelectual e industrial. E expressamente proibida a reproducao, distribuicao, comunicacao publica ou transformacao total ou parcial dos conteudos sem autorizacao expressa e por escrito do titular. O uso nao autorizado dos conteudos dara lugar as responsabilidades legalmente estabelecidas.',
        en:'All content on this website — including texts, photographs, videos, logos, iconography, graphic design, source code and databases — is the property of the association Levada Arraiana or their legitimate owners, and is protected by Spanish and EU intellectual and industrial property law. The reproduction, distribution, public communication or total or partial transformation of the content without the express written authorization of the owner is expressly prohibited. Unauthorized use of the content will give rise to the legally established liabilities.'
    },
    legal_aviso_lei_p1: {
        gl:'Este sitio web e as relacions entre o titular e os usuarios rexense pola lexislacion espanola. Para a resolucion de calquera controversia derivada do acceso ou uso desta plataforma, as partes someteranse expresamente aos xulgados e tribunais de Vigo (Pontevedra), con renuncia expresa a calquera outro foro que lles puidese corresponder.',
        es:'Este sitio web y las relaciones entre el titular y los usuarios se rigen por la legislacion espanola. Para la resolucion de cualquier controversia derivada del acceso o uso de esta plataforma, las partes se someteran expresamente a los juzgados y tribunales de Vigo (Pontevedra), con renuncia expresa a cualquier otro fuero que les pudiera corresponder.',
        pt:'Este site e as relacoes entre o titular e os utilizadores regem-se pela legislacao espanhola. Para a resolucao de qualquer controversia derivada do acesso ou uso desta plataforma, as partes submeter-se-ao expressamente aos tribunais de Vigo (Pontevedra), com renuncia expressa a qualquer outro foro que lhes pudesse corresponder.',
        en:'This website and the relationship between the owner and users are governed by Spanish law. For the resolution of any dispute arising from access to or use of this platform, the parties expressly submit to the courts of Vigo (Pontevedra), with express waiver of any other jurisdiction that may apply.'
    },
    legal_aviso_modificacions: { gl:'Modificacions', es:'Modificaciones', pt:'Modificacoes', en:'Modifications' },
    legal_aviso_modificacions_p1: {
        gl:'O titular reservase o dereito de modificar o presente aviso legal en calquera momento para adaptalo a novidades lexislativas ou xurisprudenciais. Ditas modificacions seran publicadas nesta mesma paxina e consideraranse vixentes desde a sua publicacion.',
        es:'El titular se reserva el derecho de modificar el presente aviso legal en cualquier momento para adaptarlo a novedades legislativas o jurisprudenciales. Dichas modificaciones seran publicadas en esta misma pagina y se consideraran vigentes desde su publicacion.',
        pt:'O titular reserva-se o direito de modificar o presente aviso legal a qualquer momento para o adaptar a novidades legislativas ou jurisprudenciais. As referidas modificacoes serao publicadas nesta mesma pagina e considerar-se-ao vigentes desde a sua publicacao.',
        en:'The owner reserves the right to modify this legal notice at any time to adapt it to legislative or case-law developments. Such modifications will be published on this page and will be considered effective from their publication.'
    },

    // Privacy Policy paragraphs
    legal_privacidade_intro: {
        gl:'En cumprimento do Regulamento (UE) 2016/679 do Parlamento Europeo e do Consello (Regulamento Xeral de Proteccion de Datos, RXPD/RGPD) e da Lei Organica 3/2018, do 5 de decembro, de Proteccion de Datos Persoais e Garantia dos Dereitos Dixitais (LOPDGDD), a asociacion Levada Arraiana informache sobre o tratamento dos teus datos persoais a traves desta plataforma:',
        es:'En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (Reglamento General de Proteccion de Datos, RGPD) y de la Ley Organica 3/2018, de 5 de diciembre, de Proteccion de Datos Personales y Garantia de los Derechos Digitales (LOPDGDD), la asociacion Levada Arraiana te informa sobre el tratamiento de tus datos personales a traves de esta plataforma:',
        pt:'Em cumprimento do Regulamento (UE) 2016/679 do Parlamento Europeu e do Conselho (Regulamento Geral de Protecao de Dados, RGPD) e da Lei Organica 3/2018, de 5 de dezembro, de Protecao de Dados Pessoais e Garantia dos Direitos Digitais (LOPDGDD), a associacao Levada Arraiana informa-te sobre o tratamento dos teus dados pessoais atraves desta plataforma:',
        en:'In compliance with Regulation (EU) 2016/679 of the European Parliament and of the Council (General Data Protection Regulation, GDPR) and Organic Law 3/2018, of December 5, on the Protection of Personal Data and Guarantee of Digital Rights (LOPDGDD), the association Levada Arraiana informs you about the processing of your personal data through this platform:'
    },
    legal_privacidade_finalidade_p1: {
        gl:'Os teus datos persoais seran tratados coas seguintes finalidades:<ul><li>Xestion do rexistro e acceso como membro da asociacion.</li><li>Comunicacion interna entre socios: convocatorias de ensaios, bolos, votacions e propostas.</li><li>Organizacion da actividade musical: planificacion de ensaios, xestion de repertorio e control de asistencia.</li><li>Publicacion de contido na web publica (noticias, galeria, bolos) sempre co teu coñecemento.</li><li>Envio de notificacions por correo electronico relacionadas coa actividade da asociacion.</li></ul>En ningun caso os teus datos seran utilizados con fins comerciais nin cedidos a terceiros para publicidade.',
        es:'Tus datos personales seran tratados con las siguientes finalidades:<ul><li>Gestion del registro y acceso como miembro de la asociacion.</li><li>Comunicacion interna entre socios: convocatorias de ensayos, bolos, votaciones y propuestas.</li><li>Organizacion de la actividad musical: planificacion de ensayos, gestion de repertorio y control de asistencia.</li><li>Publicacion de contenido en la web publica (noticias, galeria, bolos) siempre con tu conocimiento.</li><li>Envio de notificaciones por correo electronico relacionadas con la actividad de la asociacion.</li></ul>En ningun caso tus datos seran utilizados con fines comerciales ni cedidos a terceros para publicidad.',
        pt:'Os teus dados pessoais serao tratados com as seguintes finalidades:<ul><li>Gestao do registo e acesso como membro da associacao.</li><li>Comunicacao interna entre socios: convocatorias de ensaios, concertos, votacoes e propostas.</li><li>Organizacao da atividade musical: planificacao de ensaios, gestao de repertorio e controlo de presenca.</li><li>Publicacao de conteudo na web publica (noticias, galeria, concertos) sempre com o teu conhecimento.</li><li>Envio de notificacoes por correio eletronico relacionadas com a atividade da associacao.</li></ul>Em nenhum caso os teus dados serao utilizados com fins comerciais nem cedidos a terceiros para publicidade.',
        en:'Your personal data will be processed for the following purposes:<ul><li>Management of your registration and access as a member of the association.</li><li>Internal communication between members: rehearsal calls, gigs, votes and proposals.</li><li>Organization of musical activity: rehearsal planning, repertoire management and attendance tracking.</li><li>Publication of content on the public website (news, gallery, gigs) always with your knowledge.</li><li>Sending email notifications related to the association\'s activities.</li></ul>Your data will never be used for commercial purposes or shared with third parties for advertising.'
    },
    legal_privacidade_datos_p1: {
        gl:'A plataforma recolle os seguintes datos persoais:<ul><li><strong>Obrigatorios:</strong> nome de usuario, contrasinal (almacenada cifrada con PBKDF2-SHA256), email.</li><li><strong>Voluntarios:</strong> nome completo, telefono, instrumento que tocas e foto de perfil.</li><li><strong>Xerados polo uso:</strong> rexistro de asistencia a ensaios, votos en votacions, comentarios, propostas e contido publicado (noticias, actas, documentos).</li><li><strong>Automaticos:</strong> enderezo IP e data/hora nas accions de inicio de sesion e modificacion de datos (rexistro de auditoria).</li></ul>Non se recollen datos especialmente protexidos (saude, ideoloxia, relixion, orixe etnica, etc.).',
        es:'La plataforma recoge los siguientes datos personales:<ul><li><strong>Obligatorios:</strong> nombre de usuario, contrasena (almacenada cifrada con PBKDF2-SHA256), email.</li><li><strong>Voluntarios:</strong> nombre completo, telefono, instrumento que tocas y foto de perfil.</li><li><strong>Generados por el uso:</strong> registro de asistencia a ensayos, votos en votaciones, comentarios, propuestas y contenido publicado (noticias, actas, documentos).</li><li><strong>Automaticos:</strong> direccion IP y fecha/hora en las acciones de inicio de sesion y modificacion de datos (registro de auditoria).</li></ul>No se recogen datos especialmente protegidos (salud, ideologia, religion, origen etnico, etc.).',
        pt:'A plataforma recolhe os seguintes dados pessoais:<ul><li><strong>Obrigatorios:</strong> nome de utilizador, palavra-passe (armazenada cifrada com PBKDF2-SHA256), email.</li><li><strong>Voluntarios:</strong> nome completo, telefone, instrumento que tocas e foto de perfil.</li><li><strong>Gerados pelo uso:</strong> registo de presenca em ensaios, votos em votacoes, comentarios, propostas e conteudo publicado (noticias, atas, documentos).</li><li><strong>Automaticos:</strong> endereco IP e data/hora nas acoes de inicio de sessao e modificacao de dados (registo de auditoria).</li></ul>Nao se recolhem dados especialmente protegidos (saude, ideologia, religiao, origem etnica, etc.).',
        en:'The platform collects the following personal data:<ul><li><strong>Required:</strong> username, password (stored encrypted with PBKDF2-SHA256), email.</li><li><strong>Voluntary:</strong> full name, phone number, instrument you play and profile photo.</li><li><strong>Generated by use:</strong> rehearsal attendance records, votes in polls, comments, proposals and published content (news, minutes, documents).</li><li><strong>Automatic:</strong> IP address and date/time for login actions and data modifications (audit log).</li></ul>No specially protected data is collected (health, ideology, religion, ethnic origin, etc.).'
    },
    legal_privacidade_base_p1: {
        gl:'O tratamento dos teus datos basease nas seguintes bases legais:<ul><li><strong>Consentimento (art. 6.1.a RXPD):</strong> ao rexistrarte e aceptar esta politica, prestas o teu consentimento expreso e informado para o tratamento dos teus datos coas finalidades indicadas.</li><li><strong>Execucion dun contrato (art. 6.1.b RXPD):</strong> o tratamento e necesario para a xestion da tua relacion como membro da asociacion.</li><li><strong>Interes lexitimo (art. 6.1.f RXPD):</strong> rexistro de auditoria e seguridade da plataforma.</li></ul>Podes retirar o teu consentimento en calquera momento contactando co titular, sen que iso afecte a licitude do tratamento previo.',
        es:'El tratamiento de tus datos se basa en las siguientes bases legales:<ul><li><strong>Consentimiento (art. 6.1.a RGPD):</strong> al registrarte y aceptar esta politica, prestas tu consentimiento expreso e informado para el tratamiento de tus datos con las finalidades indicadas.</li><li><strong>Ejecucion de un contrato (art. 6.1.b RGPD):</strong> el tratamiento es necesario para la gestion de tu relacion como miembro de la asociacion.</li><li><strong>Interes legitimo (art. 6.1.f RGPD):</strong> registro de auditoria y seguridad de la plataforma.</li></ul>Puedes retirar tu consentimiento en cualquier momento contactando con el titular, sin que ello afecte a la licitud del tratamiento previo.',
        pt:'O tratamento dos teus dados baseia-se nas seguintes bases legais:<ul><li><strong>Consentimento (art. 6.1.a RGPD):</strong> ao registares-te e aceitares esta politica, prestas o teu consentimento expresso e informado para o tratamento dos teus dados com as finalidades indicadas.</li><li><strong>Execucao de um contrato (art. 6.1.b RGPD):</strong> o tratamento e necessario para a gestao da tua relacao como membro da associacao.</li><li><strong>Interesse legitimo (art. 6.1.f RGPD):</strong> registo de auditoria e seguranca da plataforma.</li></ul>Podes retirar o teu consentimento a qualquer momento contactando o titular, sem que isso afete a licitude do tratamento previo.',
        en:'The processing of your data is based on the following legal grounds:<ul><li><strong>Consent (art. 6.1.a GDPR):</strong> by registering and accepting this policy, you give your express and informed consent for the processing of your data for the stated purposes.</li><li><strong>Performance of a contract (art. 6.1.b GDPR):</strong> the processing is necessary for managing your relationship as a member of the association.</li><li><strong>Legitimate interest (art. 6.1.f GDPR):</strong> audit logging and platform security.</li></ul>You may withdraw your consent at any time by contacting the owner, without affecting the lawfulness of prior processing.'
    },
    legal_privacidade_cesion_p1: {
        gl:'Os teus datos non seran cedidos a terceiros agas obriga legal. Non se realizan transferencias internacionais de datos. Os unicos servizos externos utilizados son:<ul><li><strong>YouTube (Google):</strong> para o aloxamento de videos musicais subidos pola asociacion. Non se comparten datos persoais dos usuarios con YouTube.</li></ul>',
        es:'Tus datos no seran cedidos a terceros salvo obligacion legal. No se realizan transferencias internacionales de datos. Los unicos servicios externos utilizados son:<ul><li><strong>YouTube (Google):</strong> para el alojamiento de videos musicales subidos por la asociacion. No se comparten datos personales de los usuarios con YouTube.</li></ul>',
        pt:'Os teus dados nao serao cedidos a terceiros salvo obrigacao legal. Nao se realizam transferencias internacionais de dados. Os unicos servicos externos utilizados sao:<ul><li><strong>YouTube (Google):</strong> para o alojamento de videos musicais carregados pela associacao. Nao se partilham dados pessoais dos utilizadores com o YouTube.</li></ul>',
        en:'Your data will not be shared with third parties except where required by law. No international data transfers are made. The only external services used are:<ul><li><strong>YouTube (Google):</strong> for hosting musical videos uploaded by the association. No personal user data is shared with YouTube.</li></ul>'
    },
    legal_privacidade_seguridade_p1: {
        gl:'A plataforma aplica medidas tecnicas e organizativas para protexer os teus datos:<ul><li>Contrasinais cifradas con PBKDF2-SHA256 (260.000 iteracions).</li><li>Comunicacions cifradas mediante HTTPS.</li><li>Control de acceso baseado en roles (Admin, Socio, Usuario).</li><li>Rexistro de auditoria de accions sensibles.</li><li>Validacion e saneamento de datos de entrada para previr ataques.</li></ul>',
        es:'La plataforma aplica medidas tecnicas y organizativas para proteger tus datos:<ul><li>Contrasenas cifradas con PBKDF2-SHA256 (260.000 iteraciones).</li><li>Comunicaciones cifradas mediante HTTPS.</li><li>Control de acceso basado en roles (Admin, Socio, Usuario).</li><li>Registro de auditoria de acciones sensibles.</li><li>Validacion y saneamiento de datos de entrada para prevenir ataques.</li></ul>',
        pt:'A plataforma aplica medidas tecnicas e organizativas para proteger os teus dados:<ul><li>Palavras-passe cifradas com PBKDF2-SHA256 (260.000 iteracoes).</li><li>Comunicacoes cifradas mediante HTTPS.</li><li>Controlo de acesso baseado em funcoes (Admin, Socio, Utilizador).</li><li>Registo de auditoria de acoes sensiveis.</li><li>Validacao e saneamento de dados de entrada para prevenir ataques.</li></ul>',
        en:'The platform implements technical and organizational measures to protect your data:<ul><li>Passwords encrypted with PBKDF2-SHA256 (260,000 iterations).</li><li>Communications encrypted via HTTPS.</li><li>Role-based access control (Admin, Member, User).</li><li>Audit logging of sensitive actions.</li><li>Input validation and sanitization to prevent attacks.</li></ul>'
    },
    legal_privacidade_dereitos_p1: {
        gl:'De acordo co RXPD e a LOPDGDD, tes os seguintes dereitos sobre os teus datos persoais:<ul><li><strong>Acceso:</strong> coñecer que datos temos sobre ti.</li><li><strong>Rectificacion:</strong> corrixir datos inexactos ou incompletos.</li><li><strong>Supresion (dereito ao esquecemento):</strong> solicitar a eliminacion dos teus datos.</li><li><strong>Portabilidade:</strong> recibir os teus datos nun formato estruturado e de uso comun.</li><li><strong>Limitacion:</strong> solicitar a restricion do tratamento en determinadas circunstancias.</li><li><strong>Oposicion:</strong> oponerche ao tratamento dos teus datos.</li></ul>Para exercer calquera destes dereitos, contacta co titular a traves do email indicado. Responderemos no prazo maximo de 30 dias. Tamen tes dereito a presentar unha reclamacion ante a Axencia Espanola de Proteccion de Datos (<strong>www.aepd.es</strong>).',
        es:'De acuerdo con el RGPD y la LOPDGDD, tienes los siguientes derechos sobre tus datos personales:<ul><li><strong>Acceso:</strong> conocer que datos tenemos sobre ti.</li><li><strong>Rectificacion:</strong> corregir datos inexactos o incompletos.</li><li><strong>Supresion (derecho al olvido):</strong> solicitar la eliminacion de tus datos.</li><li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso comun.</li><li><strong>Limitacion:</strong> solicitar la restriccion del tratamiento en determinadas circunstancias.</li><li><strong>Oposicion:</strong> oponerte al tratamiento de tus datos.</li></ul>Para ejercer cualquiera de estos derechos, contacta con el titular a traves del email indicado. Responderemos en el plazo maximo de 30 dias. Tambien tienes derecho a presentar una reclamacion ante la Agencia Espanola de Proteccion de Datos (<strong>www.aepd.es</strong>).',
        pt:'De acordo com o RGPD e a LOPDGDD, tens os seguintes direitos sobre os teus dados pessoais:<ul><li><strong>Acesso:</strong> conhecer que dados temos sobre ti.</li><li><strong>Retificacao:</strong> corrigir dados inexatos ou incompletos.</li><li><strong>Supressao (direito ao esquecimento):</strong> solicitar a eliminacao dos teus dados.</li><li><strong>Portabilidade:</strong> receber os teus dados num formato estruturado e de uso comum.</li><li><strong>Limitacao:</strong> solicitar a restricao do tratamento em determinadas circunstancias.</li><li><strong>Oposicao:</strong> opor-te ao tratamento dos teus dados.</li></ul>Para exercer qualquer destes direitos, contacta o titular atraves do email indicado. Responderemos no prazo maximo de 30 dias. Tambem tens direito a apresentar uma reclamacao junto da Agencia Espanhola de Protecao de Dados (<strong>www.aepd.es</strong>).',
        en:'In accordance with the GDPR and LOPDGDD, you have the following rights over your personal data:<ul><li><strong>Access:</strong> know what data we hold about you.</li><li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li><li><strong>Erasure (right to be forgotten):</strong> request the deletion of your data.</li><li><strong>Portability:</strong> receive your data in a structured, commonly used format.</li><li><strong>Restriction:</strong> request the restriction of processing under certain circumstances.</li><li><strong>Objection:</strong> object to the processing of your data.</li></ul>To exercise any of these rights, contact the owner via the email provided. We will respond within a maximum of 30 days. You also have the right to file a complaint with the Spanish Data Protection Agency (<strong>www.aepd.es</strong>).'
    },
    legal_privacidade_retencion_p1: {
        gl:'Os teus datos conservaranse mentres a tua conta de usuario permaneza activa na plataforma. Cando solicites a baixa ou a supresion dos teus datos, estes eliminaranse nun prazo maximo de 30 dias naturais, agas que exista unha obriga legal que requira a sua conservacion (por exemplo, obrigas fiscais ou contables). O rexistro de auditoria conservase segundo o periodo configurado polo administrador (por defecto 90 dias) e elimina automaticamente os rexistros antigos.',
        es:'Tus datos se conservaran mientras tu cuenta de usuario permanezca activa en la plataforma. Cuando solicites la baja o la supresion de tus datos, estos se eliminaran en un plazo maximo de 30 dias naturales, salvo que exista una obligacion legal que requiera su conservacion (por ejemplo, obligaciones fiscales o contables). El registro de auditoria se conserva segun el periodo configurado por el administrador (por defecto 90 dias) y elimina automaticamente los registros antiguos.',
        pt:'Os teus dados serao conservados enquanto a tua conta de utilizador permanecer ativa na plataforma. Quando solicitares a eliminacao ou a supressao dos teus dados, estes serao eliminados num prazo maximo de 30 dias naturais, salvo que exista uma obrigacao legal que requeira a sua conservacao (por exemplo, obrigacoes fiscais ou contabilisticas). O registo de auditoria conserva-se segundo o periodo configurado pelo administrador (por defeito 90 dias) e elimina automaticamente os registos antigos.',
        en:'Your data will be kept as long as your user account remains active on the platform. When you request account deletion or data erasure, your data will be deleted within a maximum of 30 calendar days, unless there is a legal obligation requiring its retention (e.g., tax or accounting obligations). The audit log is retained according to the period configured by the administrator (default 90 days) and automatically deletes old records.'
    },

    // Cookie Policy paragraphs
    legal_cookies_intro: {
        gl:'En cumprimento do artigo 22 da Lei 34/2002 (LSSI-CE) e da normativa europea sobre privacidade electronica, informamoste sobre o uso de tecnoloxias de almacenamento no teu navegador. Este sitio web NON utiliza cookies tradicionais (ficheiros enviados polo servidor ao navegador). En cambio, utiliza exclusivamente o almacenamento local do navegador (localStorage) para gardar preferencias tecnicas necesarias para o correcto funcionamento da plataforma.',
        es:'En cumplimiento del articulo 22 de la Ley 34/2002 (LSSI-CE) y de la normativa europea sobre privacidad electronica, te informamos sobre el uso de tecnologias de almacenamiento en tu navegador. Este sitio web NO utiliza cookies tradicionales (archivos enviados por el servidor al navegador). En su lugar, utiliza exclusivamente el almacenamiento local del navegador (localStorage) para guardar preferencias tecnicas necesarias para el correcto funcionamiento de la plataforma.',
        pt:'Em cumprimento do artigo 22 da Lei 34/2002 (LSSI-CE) e da normativa europeia sobre privacidade eletronica, informamos-te sobre o uso de tecnologias de armazenamento no teu navegador. Este site NAO utiliza cookies tradicionais (ficheiros enviados pelo servidor ao navegador). Em vez disso, utiliza exclusivamente o armazenamento local do navegador (localStorage) para guardar preferencias tecnicas necessarias para o correto funcionamento da plataforma.',
        en:'In compliance with Article 22 of Law 34/2002 (LSSI-CE) and European electronic privacy regulations, we inform you about the use of storage technologies in your browser. This website does NOT use traditional cookies (files sent by the server to the browser). Instead, it exclusively uses the browser\'s local storage (localStorage) to save technical preferences necessary for the correct functioning of the platform.'
    },
    legal_cookies_diferenza: { gl:'Diferenza entre cookies e localStorage', es:'Diferencia entre cookies y localStorage', pt:'Diferenca entre cookies e localStorage', en:'Difference between cookies and localStorage' },
    legal_cookies_diferenza_p1: {
        gl:'A diferenza das cookies tradicionais, o localStorage:<ul><li>Non se envia automaticamente ao servidor en cada peticion — os datos quedan exclusivamente no teu navegador.</li><li>Non ten data de caducidade automatica — os datos permanecen ata que ti os borres ou peches sesion.</li><li>Non pode ser lido por terceiros nin por outros sitios web.</li><li>Non se utiliza para rastrexamento nin publicidade.</li></ul>',
        es:'A diferencia de las cookies tradicionales, el localStorage:<ul><li>No se envia automaticamente al servidor en cada peticion — los datos quedan exclusivamente en tu navegador.</li><li>No tiene fecha de caducidad automatica — los datos permanecen hasta que tu los borres o cierres sesion.</li><li>No puede ser leido por terceros ni por otros sitios web.</li><li>No se utiliza para rastreo ni publicidad.</li></ul>',
        pt:'Ao contrario dos cookies tradicionais, o localStorage:<ul><li>Nao e enviado automaticamente ao servidor em cada pedido — os dados ficam exclusivamente no teu navegador.</li><li>Nao tem data de validade automatica — os dados permanecem ate que tu os apagues ou encerres sessao.</li><li>Nao pode ser lido por terceiros nem por outros sites.</li><li>Nao e utilizado para rastreamento nem publicidade.</li></ul>',
        en:'Unlike traditional cookies, localStorage:<ul><li>Is not automatically sent to the server with each request — data stays exclusively in your browser.</li><li>Has no automatic expiration date — data remains until you clear it or log out.</li><li>Cannot be read by third parties or other websites.</li><li>Is not used for tracking or advertising.</li></ul>'
    },
    legal_cookies_list: {
        gl:'<li><strong>session</strong> — Datos de sesion (token, nome de usuario, rol) para manter o acceso aberto tras iniciar sesion. Eliminase ao pechar sesion.</li><li><strong>lang</strong> — Idioma seleccionado (gl, es, pt, en). Permite que a web recorde a tua preferencia de idioma.</li><li><strong>theme</strong> — Tema visual (claro/escuro). Garda a tua preferencia de aparencia.</li><li><strong>fontSize</strong> — Tamano de letra preferido (small/normal/large). Permite axustar a lexibilidade.</li><li><strong>compactMode</strong> — Modo compacto activado ou desactivado. Reduce o espazamento visual.</li><li><strong>cookieConsent</strong> — Rexistro da tua eleccion sobre o banner informativo (accepted/rejected). Evita que se volva amosar.</li>',
        es:'<li><strong>session</strong> — Datos de sesion (token, nombre de usuario, rol) para mantener el acceso abierto tras iniciar sesion. Se elimina al cerrar sesion.</li><li><strong>lang</strong> — Idioma seleccionado (gl, es, pt, en). Permite que la web recuerde tu preferencia de idioma.</li><li><strong>theme</strong> — Tema visual (claro/oscuro). Guarda tu preferencia de apariencia.</li><li><strong>fontSize</strong> — Tamano de letra preferido (small/normal/large). Permite ajustar la legibilidad.</li><li><strong>compactMode</strong> — Modo compacto activado o desactivado. Reduce el espaciado visual.</li><li><strong>cookieConsent</strong> — Registro de tu eleccion sobre el banner informativo (accepted/rejected). Evita que se vuelva a mostrar.</li>',
        pt:'<li><strong>session</strong> — Dados de sessao (token, nome de utilizador, funcao) para manter o acesso aberto apos iniciar sessao. E eliminado ao encerrar sessao.</li><li><strong>lang</strong> — Idioma selecionado (gl, es, pt, en). Permite que o site recorde a tua preferencia de idioma.</li><li><strong>theme</strong> — Tema visual (claro/escuro). Guarda a tua preferencia de aparencia.</li><li><strong>fontSize</strong> — Tamanho de letra preferido (small/normal/large). Permite ajustar a legibilidade.</li><li><strong>compactMode</strong> — Modo compacto ativado ou desativado. Reduz o espacamento visual.</li><li><strong>cookieConsent</strong> — Registo da tua escolha sobre o banner informativo (accepted/rejected). Evita que volte a aparecer.</li>',
        en:'<li><strong>session</strong> — Session data (token, username, role) to keep access open after logging in. Deleted when logging out.</li><li><strong>lang</strong> — Selected language (gl, es, pt, en). Allows the site to remember your language preference.</li><li><strong>theme</strong> — Visual theme (light/dark). Saves your appearance preference.</li><li><strong>fontSize</strong> — Preferred font size (small/normal/large). Allows adjusting readability.</li><li><strong>compactMode</strong> — Compact mode on or off. Reduces visual spacing.</li><li><strong>cookieConsent</strong> — Record of your choice on the informative banner (accepted/rejected). Prevents it from showing again.</li>'
    },
    legal_cookies_como_borrar: { gl:'Como borrar os datos almacenados', es:'Como borrar los datos almacenados', pt:'Como apagar os dados armazenados', en:'How to delete stored data' },
    legal_cookies_como_borrar_p1: {
        gl:'Podes eliminar todos os datos almacenados polo sitio web en calquera momento:<ul><li><strong>Pechando sesion:</strong> o boton "Sair" elimina automaticamente os datos de sesion.</li><li><strong>Desde o navegador:</strong> nas opcions de configuracion do teu navegador, busca "Datos de sitios" ou "Almacenamento local" e elimina os datos asociados a este dominio.</li><li><strong>Atallos rapidos:</strong> na maiorias dos navegadores, preme F12, vai a pestana "Application" ou "Storage" e borra o localStorage do sitio.</li></ul>Ao borrar estes datos, pecharase a tua sesion e as preferencias de idioma, tema e tamano voltaran aos seus valores por defecto.',
        es:'Puedes eliminar todos los datos almacenados por el sitio web en cualquier momento:<ul><li><strong>Cerrando sesion:</strong> el boton "Salir" elimina automaticamente los datos de sesion.</li><li><strong>Desde el navegador:</strong> en las opciones de configuracion de tu navegador, busca "Datos de sitios" o "Almacenamiento local" y elimina los datos asociados a este dominio.</li><li><strong>Atajos rapidos:</strong> en la mayoria de navegadores, pulsa F12, ve a la pestana "Application" o "Storage" y borra el localStorage del sitio.</li></ul>Al borrar estos datos, se cerrara tu sesion y las preferencias de idioma, tema y tamano volveran a sus valores por defecto.',
        pt:'Podes eliminar todos os dados armazenados pelo site a qualquer momento:<ul><li><strong>Encerrando sessao:</strong> o botao "Sair" elimina automaticamente os dados de sessao.</li><li><strong>A partir do navegador:</strong> nas opcoes de configuracao do teu navegador, procura "Dados de sites" ou "Armazenamento local" e elimina os dados associados a este dominio.</li><li><strong>Atalhos rapidos:</strong> na maioria dos navegadores, prime F12, vai ao separador "Application" ou "Storage" e apaga o localStorage do site.</li></ul>Ao apagar estes dados, a tua sessao sera encerrada e as preferencias de idioma, tema e tamanho voltarao aos seus valores por defeito.',
        en:'You can delete all data stored by the website at any time:<ul><li><strong>Logging out:</strong> the "Logout" button automatically deletes session data.</li><li><strong>From your browser:</strong> in your browser settings, look for "Site data" or "Local storage" and delete the data associated with this domain.</li><li><strong>Quick shortcuts:</strong> in most browsers, press F12, go to the "Application" or "Storage" tab and clear the site\'s localStorage.</li></ul>Deleting this data will close your session and language, theme and font size preferences will return to their default values.'
    },
    legal_cookies_terceiros_p1: {
        gl:'Este sitio web incrusta contido de servizos externos que poden establecer as suas propias cookies ou tecnoloxias de rastrexamento:<ul><li><strong>Google Maps:</strong> na seccion de contacto incrustase un mapa interactivo. Google pode establecer cookies propias ao cargar o mapa. Consulta a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">politica de privacidade de Google</a>.</li><li><strong>YouTube:</strong> os videos de actuacions e repertorio incrustanse mediante iframes de YouTube. Google/YouTube pode establecer cookies ao reproducir un video. Consulta a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">politica de privacidade de Google</a>.</li></ul>Estes servizos de terceiros son necesarios para a funcionalidade da web e non estan baixo o noso control. Se prefires evitar estas cookies, podes bloquealas na configuracion do teu navegador.',
        es:'Este sitio web incrusta contenido de servicios externos que pueden establecer sus propias cookies o tecnologias de rastreo:<ul><li><strong>Google Maps:</strong> en la seccion de contacto se incrusta un mapa interactivo. Google puede establecer cookies propias al cargar el mapa. Consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">politica de privacidad de Google</a>.</li><li><strong>YouTube:</strong> los videos de actuaciones y repertorio se incrustan mediante iframes de YouTube. Google/YouTube puede establecer cookies al reproducir un video. Consulta la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">politica de privacidad de Google</a>.</li></ul>Estos servicios de terceros son necesarios para la funcionalidad de la web y no estan bajo nuestro control. Si prefieres evitar estas cookies, puedes bloquearlas en la configuracion de tu navegador.',
        pt:'Este site incorpora conteudo de servicos externos que podem definir os seus proprios cookies ou tecnologias de rastreamento:<ul><li><strong>Google Maps:</strong> na seccao de contacto e incorporado um mapa interativo. O Google pode definir cookies proprios ao carregar o mapa. Consulta a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">politica de privacidade do Google</a>.</li><li><strong>YouTube:</strong> os videos de atuacoes e repertorio sao incorporados atraves de iframes do YouTube. O Google/YouTube pode definir cookies ao reproduzir um video. Consulta a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">politica de privacidade do Google</a>.</li></ul>Estes servicos de terceiros sao necessarios para a funcionalidade do site e nao estao sob o nosso controlo. Se preferires evitar estes cookies, podes bloquea-los na configuracao do teu navegador.',
        en:'This website embeds content from external services that may set their own cookies or tracking technologies:<ul><li><strong>Google Maps:</strong> an interactive map is embedded in the contact section. Google may set its own cookies when loading the map. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google\'s privacy policy</a>.</li><li><strong>YouTube:</strong> performance and repertoire videos are embedded via YouTube iframes. Google/YouTube may set cookies when playing a video. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google\'s privacy policy</a>.</li></ul>These third-party services are necessary for website functionality and are not under our control. If you prefer to avoid these cookies, you can block them in your browser settings.'
    },
    legal_cookies_actualizacion: { gl:'Actualizacion desta politica', es:'Actualizacion de esta politica', pt:'Atualizacao desta politica', en:'Updates to this policy' },
    legal_cookies_actualizacion_p1: {
        gl:'Esta politica pode ser actualizada en calquera momento para reflectir cambios na plataforma ou na normativa aplicable. Recomendamos revisala periodicamente. A data de ultima actualizacion e marzo de 2026.',
        es:'Esta politica puede ser actualizada en cualquier momento para reflejar cambios en la plataforma o en la normativa aplicable. Recomendamos revisarla periodicamente. La fecha de ultima actualizacion es marzo de 2026.',
        pt:'Esta politica pode ser atualizada a qualquer momento para refletir alteracoes na plataforma ou na normativa aplicavel. Recomendamos revisa-la periodicamente. A data da ultima atualizacao e marco de 2026.',
        en:'This policy may be updated at any time to reflect changes in the platform or applicable regulations. We recommend reviewing it periodically. The last update date is March 2026.'
    },

    // ---- Auditoría ----
    auditoria:              { gl:'Auditoría', es:'Auditoría', pt:'Auditoria', en:'Audit Log' },
    modulo_label:           { gl:'Módulo', es:'Módulo', pt:'Módulo', en:'Module' },
    accion_label:           { gl:'Acción', es:'Acción', pt:'Ação', en:'Action' },
    detalles:               { gl:'Detalles', es:'Detalles', pt:'Detalhes', en:'Details' },
    retencion_label:        { gl:'Retención', es:'Retención', pt:'Retenção', en:'Retention' },
    dias:                   { gl:'días', es:'días', pt:'dias', en:'days' },
    rexistros:              { gl:'rexistros', es:'registros', pt:'registos', en:'records' },
    rexistros_eliminados:   { gl:'rexistros eliminados', es:'registros eliminados', pt:'registos eliminados', en:'records deleted' },
    limpar_antigos:         { gl:'Limpar antigos', es:'Limpiar antiguos', pt:'Limpar antigos', en:'Purge old' },
    limpar_todo:            { gl:'Limpar todo', es:'Limpiar todo', pt:'Limpar tudo', en:'Purge all' },
    limpar_antigos_prompt:  { gl:'Eliminar rexistros con máis de cantos días?', es:'¿Eliminar registros con más de cuántos días?', pt:'Eliminar registos com mais de quantos dias?', en:'Delete records older than how many days?' },
    confirmar_limpar_todo:  { gl:'Seguro que queres eliminar TODO o log de auditoría?', es:'¿Seguro que quieres eliminar TODO el log de auditoría?', pt:'Tem certeza que deseja eliminar TODO o log de auditoria?', en:'Are you sure you want to delete the ENTIRE audit log?' },
    gardado:                { gl:'Gardado', es:'Guardado', pt:'Guardado', en:'Saved' },

    // ---- LOPD / Proteccion de datos ----
    lopd_titulo:            { gl:'Proteccion de datos', es:'Proteccion de datos', pt:'Protecao de dados', en:'Data protection' },
    lopd_texto:             { gl:'Para continuar usando a plataforma, necesitamos o teu consentimento para o tratamento dos teus datos persoais conforme a normativa de proteccion de datos (LOPD/RGPD). Os teus datos seran tratados unicamente para a xestion interna da asociacion.', es:'Para continuar usando la plataforma, necesitamos tu consentimiento para el tratamiento de tus datos personales conforme a la normativa de proteccion de datos (LOPD/RGPD). Tus datos seran tratados unicamente para la gestion interna de la asociacion.', pt:'Para continuar a usar a plataforma, precisamos do seu consentimento para o tratamento dos seus dados pessoais conforme a normativa de protecao de dados (LOPD/RGPD). Os seus dados serao tratados unicamente para a gestao interna da associacao.', en:'To continue using the platform, we need your consent for the processing of your personal data in accordance with data protection regulations (GDPR). Your data will only be used for the internal management of the association.' },
    lopd_checkbox:          { gl:'Lin e acepto a politica de privacidade e o tratamento dos meus datos persoais', es:'He leido y acepto la politica de privacidad y el tratamiento de mis datos personales', pt:'Li e aceito a politica de privacidade e o tratamento dos meus dados pessoais', en:'I have read and accept the privacy policy and the processing of my personal data' },
    lopd_aceptar:           { gl:'Aceptar e continuar', es:'Aceptar y continuar', pt:'Aceitar e continuar', en:'Accept and continue' },
    lopd_obrigatorio:       { gl:'Debes aceptar a politica de privacidade para continuar', es:'Debes aceptar la politica de privacidad para continuar', pt:'Deve aceitar a politica de privacidade para continuar', en:'You must accept the privacy policy to continue' },
    lopd_ver_privacidade:   { gl:'Ver politica de privacidade', es:'Ver politica de privacidad', pt:'Ver politica de privacidade', en:'View privacy policy' },
    lopd_rexeitar:          { gl:'Cancelar e sair', es:'Cancelar y salir', pt:'Cancelar e sair', en:'Cancel and log out' },
    lopd_checkbox_link:     { gl:'Lin e acepto a {link} e o tratamento dos meus datos persoais', es:'He leido y acepto la {link} y el tratamiento de mis datos personales', pt:'Li e aceito a {link} e o tratamento dos meus dados pessoais', en:'I have read and accept the {link} and the processing of my personal data' },
    // ---- Benvida ----
    benvido:                { gl:'Benvido/a', es:'Bienvenido/a', pt:'Bem-vindo/a', en:'Welcome' },
    bo_dia:                 { gl:'Bo día', es:'Buenos días', pt:'Bom dia', en:'Good morning' },
    boas_tardes:            { gl:'Boas tardes', es:'Buenas tardes', pt:'Boa tarde', en:'Good afternoon' },
    boas_noites:            { gl:'Boas noites', es:'Buenas noches', pt:'Boa noite', en:'Good evening' },
    dias_semana:            { gl:['Domingo','Luns','Martes','Mércores','Xoves','Venres','Sábado'], es:['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'], pt:['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'], en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },

    // ---- Config labels ----
    smtp_host:              { gl:'SMTP Host', es:'SMTP Host', pt:'SMTP Host', en:'SMTP Host' },
    smtp_port:              { gl:'SMTP Port', es:'SMTP Port', pt:'SMTP Port', en:'SMTP Port' },
    smtp_user:              { gl:'SMTP User', es:'SMTP User', pt:'SMTP User', en:'SMTP User' },
    smtp_pass:              { gl:'SMTP Pass', es:'SMTP Pass', pt:'SMTP Pass', en:'SMTP Pass' },
    smtp_from:              { gl:'SMTP From', es:'SMTP From', pt:'SMTP From', en:'SMTP From' },
    email_destino:          { gl:'Email destino', es:'Email destino', pt:'Email destino', en:'Destination email' },
    cp:                     { gl:'CP', es:'CP', pt:'CP', en:'Zip code' },
    localidade:             { gl:'Localidade', es:'Localidad', pt:'Localidade', en:'City' },
    provincia:              { gl:'Provincia', es:'Provincia', pt:'Provincia', en:'Province' },

    // ---- Erros API ----
    erro_cargar_imaxe:      { gl:'Erro ao cargar a imaxe', es:'Error al cargar la imagen', pt:'Erro ao carregar a imagem', en:'Image load failed' },
    erro_credenciais:       { gl:'Credenciais incorrectas', es:'Credenciales incorrectas', pt:'Credenciais incorretas', en:'Invalid credentials' },
    erro_conta_desactivada: { gl:'Conta desactivada', es:'Cuenta desactivada', pt:'Conta desativada', en:'Account disabled' },
    erro_faltan_credenciais:{ gl:'Faltan credenciais', es:'Faltan credenciales', pt:'Faltam credenciais', en:'Missing credentials' },
    erro_username_obrigatorio:{ gl:'Username e contrasinal obrigatorios', es:'Usuario y contraseña obligatorios', pt:'Utilizador e senha obrigatorios', en:'Username and password required' },
    erro_contrasinal_curto: { gl:'O contrasinal debe ter polo menos 8 caracteres', es:'La contraseña debe tener al menos 8 caracteres', pt:'A senha deve ter pelo menos 8 caracteres', en:'Password must be at least 8 characters' },
    erro_username_existe:   { gl:'O username xa existe', es:'El usuario ya existe', pt:'O utilizador ja existe', en:'Username already exists' },
    erro_email_existe:      { gl:'Ese email xa esta en uso', es:'Ese email ya esta en uso', pt:'Esse email ja esta em uso', en:'That email is already in use' },
    erro_non_autorizado:    { gl:'Non autorizado', es:'No autorizado', pt:'Nao autorizado', en:'Unauthorized' },
    erro_acceso_denegado:   { gl:'Acceso denegado', es:'Acceso denegado', pt:'Acesso negado', en:'Access denied' },
    erro_rate_limit:        { gl:'Demasiados intentos. Agarda uns minutos.', es:'Demasiados intentos. Espera unos minutos.', pt:'Demasiadas tentativas. Aguarde uns minutos.', en:'Too many attempts. Please wait a few minutes.' },
    erro_contrasinal_actual:{ gl:'Contrasinal actual incorrecta', es:'Contraseña actual incorrecta', pt:'Senha atual incorreta', en:'Current password is incorrect' },
    erro_token_invalido:    { gl:'Token non valido ou caducado', es:'Token no valido o caducado', pt:'Token invalido ou expirado', en:'Invalid or expired token' },
    erro_introduce_usuario: { gl:'Introduce o teu usuario ou email', es:'Introduce tu usuario o email', pt:'Introduz o teu utilizador ou email', en:'Enter your username or email' },
    erro_non_atopado:       { gl:'Non atopado', es:'No encontrado', pt:'Nao encontrado', en:'Not found' },
    erro_campos_obrigatorios:{ gl:'Campos obrigatorios', es:'Campos obligatorios', pt:'Campos obrigatorios', en:'Required fields' },
    erro_email_invalido:    { gl:'Email non valido', es:'Email no valido', pt:'Email invalido', en:'Invalid email' },
    erro_datos_invalidos:   { gl:'Datos non validos', es:'Datos no validos', pt:'Dados invalidos', en:'Invalid data' },
    erro_enviar_correo:     { gl:'Erro ao enviar o correo', es:'Error al enviar el correo', pt:'Erro ao enviar o email', en:'Error sending email' },
    erro_email_destino:     { gl:'Email de destino non configurado', es:'Email de destino no configurado', pt:'Email de destino nao configurado', en:'Destination email not configured' },
    erro_base_datos:        { gl:'Erro de base de datos', es:'Error de base de datos', pt:'Erro de base de dados', en:'Database error' },
    erro_metodo:            { gl:'Metodo non permitido', es:'Metodo no permitido', pt:'Metodo nao permitido', en:'Method not allowed' },
    erro_votacion_pechada:  { gl:'A votacion esta pechada', es:'La votacion esta cerrada', pt:'A votacao esta fechada', en:'The vote is closed' },
    erro_xa_votaches:       { gl:'Xa votaches nesta votacion', es:'Ya votaste en esta votacion', pt:'Ja votou nesta votacao', en:'You already voted in this poll' },
    erro_arquivo_grande:    { gl:'Arquivo demasiado grande', es:'Archivo demasiado grande', pt:'Ficheiro demasiado grande', en:'File too large' },
    erro_tipo_arquivo:      { gl:'Tipo de arquivo non permitido', es:'Tipo de archivo no permitido', pt:'Tipo de ficheiro nao permitido', en:'File type not allowed' },
    erro_contrasinais_non_coinciden:{ gl:'Os contrasinais non coinciden', es:'Las contraseñas no coinciden', pt:'As senhas nao coincidem', en:'Passwords do not match' },
    erro_token_contrasinal_obrigatorios:{ gl:'Token e contrasinal obrigatorios', es:'Token y contraseña obligatorios', pt:'Token e senha obrigatorios', en:'Token and password required' },

    username_disponible:    { gl:'Usuario disponible', es:'Usuario disponible', pt:'Utilizador disponivel', en:'Username available' },
    username_xa_existe:     { gl:'Ese usuario xa esta en uso', es:'Ese usuario ya esta en uso', pt:'Esse utilizador ja esta em uso', en:'That username is already taken' },
    email_disponible:       { gl:'Email disponible', es:'Email disponible', pt:'Email disponivel', en:'Email available' },
    email_xa_existe:        { gl:'Ese email xa esta en uso', es:'Ese email ya esta en uso', pt:'Esse email ja esta em uso', en:'That email is already taken' },

    // ---- Newsletter (#12) ----
    newsletter_titulo:      { gl:'Newsletter', es:'Newsletter', pt:'Newsletter', en:'Newsletter' },
    newsletter_desc:        { gl:'Recibe as noticias e eventos no teu correo', es:'Recibe las noticias y eventos en tu correo', pt:'Receba as noticias e eventos no seu email', en:'Get news and events in your inbox' },
    suscribirse:            { gl:'Suscribirse', es:'Suscribirse', pt:'Subscrever', en:'Subscribe' },
    newsletter_ok:          { gl:'Suscrito correctamente!', es:'Suscrito correctamente!', pt:'Subscrito com sucesso!', en:'Subscribed successfully!' },
    email_invalido:         { gl:'Email non valido', es:'Email no valido', pt:'Email invalido', en:'Invalid email' },

    // ---- Papeleira (#31) ----
    papeleira:              { gl:'Papeleira', es:'Papelera', pt:'Reciclagem', en:'Recycle bin' },
    papeleira_desc:         { gl:'Elementos eliminados nos ultimos 30 dias', es:'Elementos eliminados en los ultimos 30 dias', pt:'Elementos eliminados nos ultimos 30 dias', en:'Items deleted in the last 30 days' },
    papeleira_baleira:      { gl:'A papeleira esta baleira', es:'La papelera esta vacia', pt:'A reciclagem esta vazia', en:'Recycle bin is empty' },
    restaurar:              { gl:'Restaurar', es:'Restaurar', pt:'Restaurar', en:'Restore' },
    restaurado:             { gl:'Restaurado correctamente', es:'Restaurado correctamente', pt:'Restaurado com sucesso', en:'Restored successfully' },
    eliminar_definitivo:    { gl:'Eliminar definitivo', es:'Eliminar definitivo', pt:'Eliminar definitivo', en:'Delete permanently' },
    eliminado_definitivo:   { gl:'Eliminado definitivamente', es:'Eliminado definitivamente', pt:'Eliminado definitivamente', en:'Permanently deleted' },
    confirmar_eliminar_definitivo: { gl:'Seguro que queres eliminar definitivamente? Esta accion non se pode desfacer.', es:'Seguro que quieres eliminar definitivamente? Esta accion no se puede deshacer.', pt:'Tem certeza que deseja eliminar definitivamente? Esta acao nao pode ser desfeita.', en:'Are you sure you want to permanently delete? This action cannot be undone.' },
    eliminado_en:           { gl:'Eliminado', es:'Eliminado', pt:'Eliminado', en:'Deleted' },
    modulo:                 { gl:'Modulo', es:'Modulo', pt:'Modulo', en:'Module' },

    // ---- Countdown (#9) ----
    dias:                   { gl:'Dias', es:'Dias', pt:'Dias', en:'Days' },
    horas:                  { gl:'Horas', es:'Horas', pt:'Horas', en:'Hours' },
    minutos:                { gl:'Minutos', es:'Minutos', pt:'Minutos', en:'Minutes' },

    // ---- Comment pagination (#3) ----
    ver_mais_comentarios:   { gl:'Ver mais comentarios', es:'Ver mas comentarios', pt:'Ver mais comentarios', en:'View more comments' },

    // ---- Form validation (#4) ----
    campo_obrigatorio:      { gl:'Este campo e obrigatorio', es:'Este campo es obligatorio', pt:'Este campo e obrigatorio', en:'This field is required' },
    min_caracteres:         { gl:'Minimo {n} caracteres', es:'Minimo {n} caracteres', pt:'Minimo {n} caracteres', en:'Minimum {n} characters' },

    // ---- Landing preview (#39) ----
    vista_previa_landing:   { gl:'Vista previa', es:'Vista previa', pt:'Pre-visualizacao', en:'Preview' },

    // ---- Pagination (#29) ----
    paxina:                 { gl:'Paxina', es:'Pagina', pt:'Pagina', en:'Page' },
    de:                     { gl:'de', es:'de', pt:'de', en:'of' },
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
