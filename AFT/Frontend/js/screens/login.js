// Giriş ekranı: e-posta + şifre, şifre göster/gizle, Google ile giriş
import { el, icon } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { login, googleLogin } from '../core/session.js';
import { getGoogleIdToken } from '../core/google.js';
import { toast } from '../components/toast.js';
import { themeToggle } from '../components/themeToggle.js';
import { brand } from '../components/brand.js';

export function loginScreen() {
    let showPw = false;
    const emailInput = el('input', { class: 'input', type: 'email', placeholder: 'ad@ornek.com', autocomplete: 'email' });
    const pwInput = el('input', { class: 'input', type: 'password', placeholder: '••••••••', autocomplete: 'current-password' });
    const submitBtn = el('button', { class: 'btn btn--primary btn--block press hover-grow', type: 'submit' }, 'Giriş Yap');

    const toggleEye = el('button', { class: 'input-affix press', type: 'button', 'aria-label': 'Şifreyi göster' }, icon('eye', 18));
    toggleEye.onclick = () => {                                    // şifre görünürlüğünü değiştir
        showPw = !showPw;
        pwInput.type = showPw ? 'text' : 'password';
        toggleEye.replaceChildren(icon(showPw ? 'eyeOff' : 'eye', 18));
    };

    async function submit(e) {
        e.preventDefault();
        if (!emailInput.value || !pwInput.value) return toast('E-posta ve şifre zorunlu.', 'error');
        submitBtn.disabled = true; submitBtn.textContent = 'Giriş yapılıyor...';
        try {
            await login(emailInput.value.trim(), pwInput.value);
            navigate('/dashboard');                                    // başarılı -> panele git
        } catch (err) {
            toast(err.message || 'Giriş başarısız.', 'error');
            submitBtn.disabled = false; submitBtn.textContent = 'Giriş Yap';
        }
    }

    async function google() {
        try {
            const idToken = await getGoogleIdToken();                  // GIS'ten idToken al
            await googleLogin(idToken);
            navigate('/dashboard');
        } catch (err) {
            toast(err.message || 'Google girişi başarısız.', 'error');
        }
    }

    const form = el('form', { class: 'col gap-4', onSubmit: submit },
        el('div', { class: 'field' }, el('label', {}, 'E-posta'), emailInput),
        el('div', { class: 'field' },
            el('div', { class: 'row', style: 'justify-content:space-between' },
                el('label', { style: 'font-weight:600;font-size:13px;color:var(--fg-2)' }, 'Şifre'),
                el('a', { href: '#/login', style: 'font-size:13px;color:var(--orange);font-weight:700', onClick: (e) => { e.preventDefault(); toast('Şifre sıfırlama yakında.', 'info'); } }, 'Şifremi Unuttum'),
            ),
            el('div', { class: 'input-wrap' }, pwInput, toggleEye),
        ),
        submitBtn,
    );

    return el('div', { class: 'auth' },
        el('div', { class: 'auth__card anim-pop' },
            el('div', { class: 'row', style: 'justify-content:space-between;margin-bottom:18px' },
                brand(),
                themeToggle(),
            ),
            el('div', { class: 'card' },
                el('h1', { class: 'auth__title' }, 'Tekrar hoş geldin'),
                el('p', { class: 'auth__sub' }, 'Hesabına giriş yap ve kaldığın yerden devam et.'),
                form,
                el('div', { class: 'divider', style: 'margin:20px 0' }, 'veya'),
                el('button', { class: 'btn btn--ghost btn--block press', onClick: google }, icon('google', 18), 'Google ile devam et'),
            ),
            el('p', { class: 'auth__foot' }, 'Hesabın yok mu? ', el('a', { href: '#/register' }, 'Kayıt ol')),
        ),
    );
}