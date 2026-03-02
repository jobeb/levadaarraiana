/**
 * RichText — Quill wrapper for Levada Arraiana
 *
 * Usage:
 *   var q = initRichTextEditor('container-id', htmlContent, { uploadDir: 'instrumentos' })
 *   getRichTextContent('container-id')  => HTML string
 */

var _rtInstances = {};

function initRichTextEditor(containerId, initialHtml, opts) {
    opts = opts || {};
    var container = document.getElementById(containerId);
    if (!container) return null;

    container.innerHTML = '';
    var editorDiv = document.createElement('div');
    editorDiv.id = containerId + '-quill';
    editorDiv.innerHTML = initialHtml || '';
    container.appendChild(editorDiv);

    var toolbarOptions = [
        [{ 'header': [3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': ['#e3c300','#005f97','#a50d3d','#009564','#ff9800','#ffffff','#eef0f4','#8a92a4','#000000'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ];

    var quill = new Quill('#' + containerId + '-quill', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        },
        placeholder: opts.placeholder || ''
    });

    // Custom image handler: upload to server
    var uploadDir = opts.uploadDir || 'instrumentos';
    quill.getModule('toolbar').addHandler('image', function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        input.addEventListener('change', function() {
            if (!input.files || !input.files[0]) return;
            _rtUploadImage(quill, input.files[0], uploadDir);
        });
    });

    _rtInstances[containerId] = quill;
    return quill;
}

async function _rtUploadImage(quill, file, uploadDir) {
    try {
        var imgData = await imageToBase64(file);
        var res = await api('/arquivos/upload-imaxe', {
            method: 'POST',
            body: {
                dir: uploadDir,
                name: file.name,
                data: imgData.data
            }
        });
        if (res.url) {
            var range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', uploadUrl(res.url));
            quill.setSelection(range.index + 1);
        }
    } catch (e) {
        toast(t('erro') + ': ' + e.message, 'error');
    }
}

function getRichTextContent(containerId) {
    var quill = _rtInstances[containerId];
    if (!quill) return '';
    var html = quill.root.innerHTML.trim();
    if (html === '<p><br></p>' || html === '<br>') return '';
    return html;
}
