// Kayıt: (1) bilgiler -> /auth/register, (2) e-posta OTP -> /auth/verify-email, (3) otomatik giriş
import { el, icon } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { api } from '../core/api.js';
import { login } from '../core/session.js';
import { toast } from '../components/toast.js';
import { themeToggle } from '../components/themeToggle.js';
import { brand } from '../components/brand.js';

export function registerScreen() {
    const state = { step: 1, email: '', password: '' };           // doğrulama sonrası otomatik giriş için sakla
    const holder = el('div', { class: 'card' });

    const dots = () => el('div', { class: 'steps' },
        el('span', { class: 'dot ' + (state.step > 1 ? 'done' : 'active') }),
        el('span', { class: 'dot ' + (state.step === 2 ? 'active' : state.step > 2 ? 'done' : '') }),
        el('span', { class: 'dot ' + (state.step === 3 ? 'active' : '') }),
    );

    function render() {
        holder.replaceChildren(dots(), state.step === 1 ? stepForm() : state.step === 2 ? stepOtp() : stepDone());
    }

    // --- Adım 1: bilgiler ---
    function stepForm() {
        let showPw = false;
        const email = el('input', { class: 'input', type: 'email', placeholder: 'ad@ornek.com', autocomplete: 'email' });
        const phone = el('input', { class: 'input', type: 'tel', placeholder: '+90 5xx xxx xx xx', autocomplete: 'tel' });
        const username = el('input', { class: 'input', type: 'text', placeholder: 'kullanici_adi', autocomplete: 'username' });
        const pw = el('input', { class: 'input', type: 'password', placeholder: 'En az 8 karakter', autocomplete: 'new-password' });
        const eye = el('button', { class: 'input-affix press', type: 'button', 'aria-label': 'Şifreyi göster' }, icon('eye', 18));
        eye.onclick = () => { showPw = !showPw; pw.type = showPw ? 'text' : 'password'; eye.replaceChildren(icon(showPw ? 'eyeOff' : 'eye', 18)); };

        const btn = el('button', { class: 'btn btn--primary btn--block press hover-grow', type: 'submit' }, 'Devam et');

        async function submit(e) {
            e.preventDefault();
            if (!email.value || !phone.value || !username.value || pw.value.length < 8)
                return toast('Tüm alanları doğru doldur (şifre min. 8 karakter).', 'error');
            btn.disabled = true; btn.textContent = 'Kod gönderiliyor...';
            try {
                await api.post('/auth/register', { email: email.value.trim(), username: username.value.trim(), password: pw.value, phone: phone.value.trim() });
                state.email = email.value.trim(); state.password = pw.value;
                state.step = 2; render();                              // OTP adımına geç
            } catch (err) {
                toast(err.message || 'Kayıt başarısız.', 'error');
                btn.disabled = false; btn.textContent = 'Devam et';
            }
        }

        return el('form', { class: 'col gap-4 anim-rise', onSubmit: submit },
            el('h1', { class: 'auth__title' }, 'Hesap oluştur'),
            el('p', { class: 'auth__sub' }, 'Birkaç bilgi, sonra e-postanı doğrulayalım.'),
            el('div', { class: 'field' }, el('label', {}, 'E-posta'), email),
            el('div', { class: 'field' }, el('label', {}, 'Telefon'), phone),
            el('div', { class: 'field' }, el('label', {}, 'Kullanıcı Adı'), username),
            el('div', { class: 'field' }, el('label', {}, 'Şifre'), el('div', { class: 'input-wrap' }, pw, eye)),
            btn,
        );
    }

    // --- Adım 2: OTP ---
    function stepOtp() {
        const inputs = Array.from({ length: 6 }, () =>
            el('input', { class: '', inputmode: 'numeric', maxlength: '1', 'aria-label': 'Doğrulama hanesi' }));

        inputs.forEach((inp, i) => {
            inp.oninput = (e) => {                                     // sadece rakam, otomatik ilerle
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 1);
                if (e.target.value && inputs[i + 1]) inputs[i + 1].focus();
            };
            inp.onkeydown = (e) => {                                   // boşken backspace ile geri git
                if (e.key === 'Backspace' && !e.target.value && inputs[i - 1]) inputs[i - 1].focus();
            };
        });

        const btn = el('button', { class: 'btn btn--primary btn--block press hover-grow', type: 'submit' }, 'Doğrula');

        async function submit(e) {
            e.preventDefault();
            const code = inputs.map((i) => i.value).join('');
            if (code.length !== 6) return toast('6 haneli kodu gir.', 'error');
            btn.disabled = true; btn.textContent = 'Doğrulanıyor...';
            try {
                await api.post('/auth/verify-email', { email: state.email, code }); // e-postayı doğrula
                await login(state.email, state.password);                // backend oturum döndürmez -> otomatik giriş
                state.step = 3; render();
            } catch (err) {
                toast(err.message || 'Doğrulama başarısız.', 'error');
                btn.disabled = false; btn.textContent = 'Doğrula';
            }
        }

        return el('form', { class: 'col gap-4 anim-rise', onSubmit: submit },
            el('h1', { class: 'auth__title' }, 'E-postanı doğrula'),
            el('p', { class: 'auth__sub' }, state.email + ' adresine gönderdiğimiz 6 haneli kodu gir.'),
            el('div', { class: 'otp' }, ...inputs),
            btn,
            el('button', { class: 'btn btn--ghost btn--block press', type: 'button', onClick: () => { state.step = 1; render(); } }, 'Geri'),
        );
    }

    // --- Adım 3: tamamlandı ---
    function stepDone() {
        setTimeout(() => navigate('/dashboard'), 1200);
        return el('div', { class: 'col gap-4 anim-pop', style: 'text-align:center;padding:14px 0' },
            el('div', { style: 'width:64px;height:64px;border-radius:99px;background:var(--green-tint);color:var(--green-strong);display:flex;align-items:center;justify-content:center;margin:0 auto' }, icon('check', 30)),
            el('h1', { class: 'auth__title' }, 'Hesabın hazır'),
            el('p', { class: 'auth__sub', style: 'margin:0' }, 'Panele yönlendiriliyorsun...'),
        );
    }

    render();

    return el('div', { class: 'auth' },
        el('div', { class: 'auth__card anim-pop' },
            el('div', { class: 'row', style: 'justify-content:space-between;margin-bottom:18px' },
                brand(),
                themeToggle(),
            ),
            holder,
            el('p', { class: 'auth__foot' }, 'Zaten hesabın var mı? ', el('a', { href: '#/login' }, 'Giriş yap')),
        ),
    );
}