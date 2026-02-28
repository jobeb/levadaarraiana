/**
 * Modal Confirm — Themed confirm dialog replacing native confirm()
 * Returns a Promise<boolean>
 */

function _showConfirmDialog(message, opts) {
    opts = opts || {};
    return new Promise(function(resolve) {
        var overlay = document.getElementById('confirm-overlay');
        if (!overlay) { resolve(false); return; }

        var danger = opts.danger || false;
        var confirmText = opts.confirmText || t('si');
        var cancelText = opts.cancelText || t('cancelar');

        var box = overlay.querySelector('.confirm-box');
        if (!box) { resolve(false); return; }

        box.innerHTML =
            '<div class="confirm-body">' +
                '<p>' + esc(message) + '</p>' +
            '</div>' +
            '<div class="confirm-footer">' +
                '<button class="btn btn-secondary" id="confirm-cancel">' + esc(cancelText) + '</button>' +
                '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" id="confirm-ok">' + esc(confirmText) + '</button>' +
            '</div>';

        overlay.classList.add('show');

        function cleanup(result) {
            overlay.classList.remove('show');
            document.removeEventListener('keydown', onKey);
            resolve(result);
        }

        box.querySelector('#confirm-ok').onclick = function() { cleanup(true); };
        box.querySelector('#confirm-cancel').onclick = function() { cleanup(false); };
        overlay.onclick = function(e) {
            if (e.target === overlay) cleanup(false);
        };

        function onKey(e) {
            if (e.key === 'Escape') cleanup(false);
            if (e.key === 'Enter') cleanup(true);
        }
        document.addEventListener('keydown', onKey);

        box.querySelector('#confirm-ok').focus();
    });
}

/**
 * Form validation helper
 * rules = { fieldId: { required: true, minLength: 3, type: 'email' }, ... }
 * Returns true if valid, false otherwise (shows inline errors)
 */
function validateForm(rules) {
    var valid = true;
    // Clear previous errors
    $$('.form-error').forEach(function(el) { el.remove(); });
    $$('.form-control.error').forEach(function(el) { el.classList.remove('error'); });

    Object.keys(rules).forEach(function(fieldId) {
        var rule = rules[fieldId];
        var input = document.getElementById(fieldId);
        if (!input) return;

        var val = (input.value || '').trim();
        var errorMsg = '';

        if (rule.required && !val) {
            errorMsg = t('campo_obrigatorio');
        } else if (rule.minLength && val.length > 0 && val.length < rule.minLength) {
            errorMsg = t('min_caracteres').replace('{n}', rule.minLength);
        } else if (rule.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            errorMsg = t('email_invalido');
        }

        if (errorMsg) {
            valid = false;
            input.classList.add('error');
            var errEl = document.createElement('div');
            errEl.className = 'form-error';
            errEl.textContent = errorMsg;
            input.parentNode.appendChild(errEl);
        }
    });

    return valid;
}

/**
 * Button loading state
 */
function btnLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn._origText = btn.innerHTML;
        btn.innerHTML = '<span class="btn-spinner"></span> ' + t('gardando');
        btn.disabled = true;
        btn.classList.add('btn-loading');
    } else {
        btn.innerHTML = btn._origText || btn.innerHTML;
        btn.disabled = false;
        btn.classList.remove('btn-loading');
    }
}
