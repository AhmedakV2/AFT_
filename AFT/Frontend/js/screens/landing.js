import { el } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { themeToggle } from '../components/themeToggle.js';

const brand = () =>
    el('button', { style: 'display:flex; align-items:center; gap:11px; background:none; border:none; cursor:pointer; padding:0;' },
        el('span', { style: 'width:34px; height:34px; border-radius:9px; background:var(--orange); display:grid; place-items:center; box-shadow:0 6px 16px color-mix(in srgb, var(--orange) 42%, transparent);' },
            el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', html: '<circle cx="12" cy="12" r="8.5" stroke="#fff" stroke-width="2"/><path d="M10.2 9 15 12l-4.8 3z" fill="#fff"/>' })
        ),
        el('span', { style: 'display:flex; flex-direction:column; align-items:flex-start; line-height:1;' },
            el('span', { style: "font:800 18px 'Sora'; letter-spacing:-.01em; color:var(--fg);" }, 'AFT'),
            el('span', { style: "font:700 8.5px 'Manrope'; letter-spacing:.2em; text-transform:uppercase; color:var(--fg-3); margin-top:3px;" }, 'Automation')
        )
    );

const navLink = (label, targetId) => el('a', {
    href: 'javascript:void(0)',
    style: "text-decoration:none; font:600 14px 'Manrope'; color:var(--fg-2); transition:color 0.2s;",
    onClick: (e) => {
        e.preventDefault();
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}, label);

const featureCard = (svgIconHtml, title, desc, theme = 'orange') =>
    el('div', { class: 'lp-feature', style: 'background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:28px; box-shadow:var(--shadow); display:flex; flex-direction:column;' },
        el('span', {
            style: `width:48px; height:48px; border-radius:13px; background:var(--${theme}-tint); color:var(--${theme}); display:grid; place-items:center; margin-bottom:18px;`
        }, el('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: svgIconHtml })),
        el('h3', { style: "font:700 19px 'Sora'; color:var(--fg); margin:0 0 8px;" }, title),
        el('p', { style: "font:400 14.5px/1.6 'Manrope'; color:var(--fg-3); margin:0;" }, desc),
    );

const sectionHeader = (eyebrow, title, descText = '') =>
    el('div', { style: 'text-align:center; max-width:680px; margin:0 auto 52px;' },
        el('div', { style: "font:700 13px 'Manrope'; letter-spacing:.16em; text-transform:uppercase; color:var(--orange);" }, eyebrow),
        el('h2', { style: "font:800 40px/1.1 'Sora'; color:var(--fg); margin:14px 0 0;" }, title),
        descText ? el('p', { style: "font:400 16px/1.6 'Manrope'; color:var(--fg-3); margin-top:16px;" }, descText) : ''
    );

export function features() {
    return el('section', { id: 'ozellikler', style: 'max-width:1200px; margin:0 auto; padding:120px 24px; scroll-margin-top:88px;' },
        sectionHeader('ÖZELLİKLER', 'Otomasyonu uçtan uca yönetin', 'Kaydetmekten raporlamaya kadar tüm test sürecini tek bir kontrol panelinde toplar.'),
        el('div', { style: 'display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;' },
            featureCard('<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>', 'Kaydet & Oynat', 'Chrome eklentisiyle ekranda yaptığın adımları yakala, kodsuz senaryolara dönüştür.', 'orange'),
            featureCard('<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>', 'No-code Senaryolar', 'Adımları sürükle-bırak düzenle, taslak ve hazır durumlarıyla yönet.', 'blue'),
            featureCard('<path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/>', 'RESTful Veri Akışı', 'Veriler arka planda işlenir ve tıpkı Selenium + Cucumber gibi çalıştırılır.', 'green'),
            featureCard('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>', 'Token Güvenliği', 'Token tabanlı doğrulama ile güvenli oturum yönetimi ve veri akışı.', 'blue'),
            featureCard('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>', 'Zamanlanmış Görevler', 'Testleri planla, gelecek çalıştırmaları izle, gece koşularını otomatikleştir.', 'orange'),
            featureCard('<path d="M18 20V10M12 20V4M6 20v-6"/><path d="M3 20h18"/>', 'Detaylı Raporlar', 'Başarı yüzdesi, hata görselleri ve adım sonuçları; Excel ve PDF olarak dışa aktar.', 'green'),
        )
    );
}

export function howItWorks() {
    return el('section', { id: 'nasil-calisir', style: 'background:var(--bg-2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); scroll-margin-top:88px;' },
        el('div', { style: 'max-width:1200px; margin:0 auto; padding:120px 24px;' },
            sectionHeader('NASIL ÇALIŞIR', 'Üç adımda otomasyon'),
            el('div', { style: 'display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;' },
                el('div', { style: 'background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:32px; box-shadow:var(--shadow);' },
                    el('div', { style: 'font:800 18px "Sora"; color:var(--orange); margin-bottom:16px;' }, '01'),
                    el('h3', { style: 'font:700 20px "Sora"; color:var(--fg); margin:0 0 12px;' }, 'Kaydet'),
                    el('p', { style: 'color:var(--fg-3); font:400 15px/1.6 "Manrope"; margin:0;' }, 'Chrome eklentisini aç; ekranda yaptığın her adım otomatik olarak kaydedilir.')
                ),
                el('div', { style: 'background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:32px; box-shadow:var(--shadow);' },
                    el('div', { style: 'font:800 18px "Sora"; color:var(--blue); margin-bottom:16px;' }, '02'),
                    el('h3', { style: 'font:700 20px "Sora"; color:var(--fg); margin:0 0 12px;' }, 'İşle'),
                    el('p', { style: 'color:var(--fg-3); font:400 15px/1.6 "Manrope"; margin:0;' }, "Veriler RESTful API ile AFT'ye gelir; algoritma onları gerçek bir test gibi çalıştırır.")
                ),
                el('div', { style: 'background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:32px; box-shadow:var(--shadow);' },
                    el('div', { style: 'font:800 18px "Sora"; color:var(--green); margin-bottom:16px;' }, '03'),
                    el('h3', { style: 'font:700 20px "Sora"; color:var(--fg); margin:0 0 12px;' }, 'Raporla'),
                    el('p', { style: 'color:var(--fg-3); font:400 15px/1.6 "Manrope"; margin:0;' }, 'Başarı oranı, hata görselleri ve adım adım sonuçlar anında panelde belirir.')
                )
            )
        )
    );
}

export function guide() {
    const stepBox = (number, title, desc, theme) => el('div', { style: 'display:flex; flex-direction:column; align-items:center;' },
        el('div', { style: 'width:100%; display:flex; gap:16px; align-items:flex-start; padding:24px; border:1px solid var(--border); border-radius:16px; background:var(--surface); box-shadow:var(--shadow);' },
            el('span', { style: `width:36px; height:36px; border-radius:10px; background:var(--${theme}-tint); color:var(--${theme}); display:grid; place-items:center; font:800 16px "Sora"; flex-shrink:0;` }, number),
            el('div', {},
                el('h3', { style: 'font:700 18px "Sora"; color:var(--fg); margin:0 0 8px;' }, title),
                el('p', { style: 'font:400 15px/1.6 "Manrope"; color:var(--fg-3); margin:0;' }, desc)
            )
        )
    );

    const arrowDown = () => el('div', { style: 'padding:12px 0;' },
        el('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--border-2)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M12 4v16M6 14l6 6 6-6"/>' })
    );

    return el('section', { id: 'kullanim', style: 'max-width:1200px; margin:0 auto; padding:120px 24px; scroll-margin-top:88px;' },
        sectionHeader('KULLANIM REHBERİ', 'Sistemi nasıl kullanırsın?', 'Hesabını oluşturduktan sonra ilk otomasyonun beş adımda hazır. Tek satır kod yazmadan.'),
        el('div', { style: 'display:grid; grid-template-columns:1.05fr 0.95fr; gap:64px; align-items:center;' },
            el('div', { style: 'display:flex; flex-direction:column; align-items:center;' },
                stepBox('1', 'Proje oluştur', "Panelde test edeceğin uygulama için bir proje aç, base URL'i gir.", 'orange'),
                arrowDown(),
                stepBox('2', 'Eklentiyle adımları kaydet', 'Chrome eklentisini aç, "Kaydet"e bas ve uygulamada normal kullanımını yap — her tıklama ve giriş yakalanır.', 'blue'),
                arrowDown(),
                stepBox('3', 'Senaryoyu düzenle', 'Kaydedilen adımları panelden düzenle; XPath, CSS ve ID seçicilerini ihtiyacına göre ayarla.', 'green'),
                arrowDown(),
                stepBox('4', 'Çalıştır veya zamanla', 'Senaryoyu hemen çalıştır ya da zamanlanmış görev olarak gece koşusuna ekle.', 'orange'),
                arrowDown(),
                stepBox('5', 'Raporu incele', 'Başarı oranını, hata anının ekran görüntüsünü ve adım sonuçlarını gör; Excel/PDF olarak dışa aktar.', 'green')
            ),
            el('div', { style: 'background:var(--surface); border:1px solid var(--border); border-radius:24px; box-shadow:var(--shadow-lg); overflow:hidden;' },
                el('div', { style: 'display:flex; align-items:center; gap:12px; padding:20px; border-bottom:1px solid var(--border);' },
                    el('span', { style: 'width:32px; height:32px; border-radius:8px; background:var(--orange); display:grid; place-items:center;' },
                        el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', html: '<circle cx="12" cy="12" r="8.5" stroke="#fff" stroke-width="2"/><path d="M10.2 9 15 12l-4.8 3z" fill="#fff"/>' })
                    ),
                    el('span', { style: 'font:700 16px "Sora"; color:var(--fg);' }, 'AFT Recorder'),
                    el('span', { style: 'margin-left:auto; display:inline-flex; align-items:center; gap:6px; font:700 12px "Manrope"; color:var(--red); background:var(--red-tint); padding:6px 12px; border-radius:8px;' },
                        el('span', { style: 'width:8px; height:8px; border-radius:50%; background:currentColor;' }), 'Kaydediliyor'
                    )
                ),
                el('div', { style: 'padding:24px; display:flex; flex-direction:column; gap:12px;' },
                    el('div', { style: 'display:flex; align-items:center; gap:12px; padding:14px 16px; border:1px solid var(--border); border-radius:12px;' },
                        el('span', { style: 'font:800 13px "Sora"; color:var(--fg-3); width:24px;' }, '01'),
                        el('span', { style: 'font:700 11px "Manrope"; color:var(--blue); background:var(--blue-tint); padding:4px 8px; border-radius:6px;' }, 'GO'),
                        el('span', { style: 'font:500 14px "Manrope"; color:var(--fg-2);' }, '/login açıldı')
                    ),
                    el('div', { style: 'display:flex; align-items:center; gap:12px; padding:14px 16px; border:1px solid var(--border); border-radius:12px;' },
                        el('span', { style: 'font:800 13px "Sora"; color:var(--fg-3); width:24px;' }, '02'),
                        el('span', { style: 'font:700 11px "Manrope"; color:var(--orange); background:var(--orange-tint); padding:4px 8px; border-radius:6px;' }, 'TYPE'),
                        el('span', { style: 'font:500 14px "Manrope"; color:var(--fg-2);' }, '#email → demo@aft.io')
                    ),
                    el('div', { style: 'display:flex; align-items:center; gap:12px; padding:14px 16px; border:1px solid var(--border); border-radius:12px;' },
                        el('span', { style: 'font:800 13px "Sora"; color:var(--fg-3); width:24px;' }, '03'),
                        el('span', { style: 'font:700 11px "Manrope"; color:var(--orange); background:var(--orange-tint); padding:4px 8px; border-radius:6px;' }, 'CLICK'),
                        el('span', { style: 'font:500 14px "Manrope"; color:var(--fg-2);' }, '"Giriş Yap" butonu')
                    ),
                    el('div', { style: 'display:flex; align-items:center; gap:12px; padding:14px 16px; border:1px solid var(--border); border-radius:12px; background:var(--green-tint);' },
                        el('span', { style: 'font:800 13px "Sora"; color:var(--green); width:24px;' }, '04'),
                        el('span', { style: 'font:700 11px "Manrope"; color:var(--green); background:var(--surface); padding:4px 8px; border-radius:6px;' }, 'ASSERT'),
                        el('span', { style: 'font:500 14px "Manrope"; color:var(--fg-2);' }, 'Panel göründü')
                    ),
                    el('button', { style: 'margin-top:12px; height:48px; border-radius:12px; border:none; background:var(--orange); color:#fff; font:700 15px "Manrope"; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px;' },
                        el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<rect x="5" y="5" width="14" height="14" rx="2"/>' }),
                        'Kaydı durdur & senaryoya gönder'
                    )
                )
            )
        )
    );
}

export function extensionSection() {
    return el('section', { id: 'eklenti', style: 'background:var(--bg-2); scroll-margin-top:88px;' },
        el('div', { style: 'max-width:1200px; margin:0 auto; padding:120px 24px; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;' },
            el('div', {},
                el('span', { style: 'display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 14px; border-radius:999px; background:var(--surface); border:1px solid var(--border); color:var(--fg-2); font:700 13px "Manrope"; margin-bottom:24px;' },
                    el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--green)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M21.17 8H12M3.95 6.06L8.54 14M10.88 21.94L15.46 14"/>' }),
                    'Chrome Web Store'
                ),
                el('h2', { style: "font:800 44px/1.12 'Sora'; color:var(--fg); margin:0 0 20px;" }, 'AFT Recorder eklentisini indir'),
                el('p', { style: "font:400 17px/1.6 'Manrope'; color:var(--fg-3); margin-bottom:32px;" }, 'Tarayıcına kur, projene bağlan ve adımlarını kaydetmeye başla. Kurulum 30 saniye, kayıt için ek bir ayar gerekmez.'),
                el('div', { style: 'display:flex; align-items:center; gap:16px; margin-bottom:32px;' },
                    el('a', { href: 'https://chrome.google.com/webstore', target: '_blank', rel: 'noopener', style: 'display:inline-flex; align-items:center; gap:12px; height:56px; padding:0 28px; border-radius:14px; background:var(--orange); color:#fff; font:700 16px "Manrope"; text-decoration:none; box-shadow:0 12px 28px color-mix(in srgb, var(--orange) 32%, transparent);' },
                        el('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M12 2v14m0 0l-5-5m5 5l5-5M4 21h16"/>' }),
                        "Chrome'a Ekle"
                    ),
                    el('div', { style: 'display:flex; flex-direction:column; gap:4px;' },
                        el('div', { style: 'display:flex; align-items:center; gap:4px;' },
                            el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'var(--orange)', html: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' }),
                            el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'var(--orange)', html: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' }),
                            el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'var(--orange)', html: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' }),
                            el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'var(--orange)', html: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' }),
                            el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'var(--orange)', html: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' })
                        ),
                        el('span', { style: 'font:500 13px "Manrope"; color:var(--fg-3);' }, '4.9 · 1.200+ kurulum')
                    )
                ),
                el('div', { style: 'display:flex; flex-wrap:wrap; gap:20px; margin-bottom:24px;' },
                    el('span', { style: 'display:inline-flex; align-items:center; gap:8px; font:500 14px "Manrope"; color:var(--fg-2);' }, el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--green)', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M20 6L9 17l-5-5"/>' }), 'Ücretsiz'),
                    el('span', { style: 'display:inline-flex; align-items:center; gap:8px; font:500 14px "Manrope"; color:var(--fg-2);' }, el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--green)', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M20 6L9 17l-5-5"/>' }), 'Manifest V3'),
                    el('span', { style: 'display:inline-flex; align-items:center; gap:8px; font:500 14px "Manrope"; color:var(--fg-2);' }, el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--green)', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M20 6L9 17l-5-5"/>' }), 'Edge & Brave uyumlu')
                ),
                el('p', { style: 'font:500 13px "Manrope"; color:var(--fg-3); margin:0;' }, 'Sürüm 2.4.1 · 1,8 MB · Tüm güncellemeler otomatik')
            ),
            el('div', { style: 'background:var(--surface); border:1px solid var(--border); border-radius:24px; box-shadow:var(--shadow-lg); overflow:hidden;' },
                el('div', { style: 'height:180px; background:var(--blue-strong); position:relative; display:grid; place-items:center;' },
                    el('div', { style: 'position:absolute; inset:0; background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,.15) 1px, transparent 0); background-size:24px 24px; opacity:.4;' }),
                    el('span', { style: 'position:relative; width:64px; height:64px; border-radius:16px; background:var(--orange); display:grid; place-items:center; box-shadow:0 10px 24px rgba(0,0,0,.3);' },
                        el('svg', { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', html: '<circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="2"/><path d="M10 8l6 4-6 4V8z" fill="#fff"/>' })
                    )
                ),
                el('div', { style: 'padding:32px;' },
                    el('div', { style: 'display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;' },
                        el('div', {},
                            el('div', { style: 'font:800 20px "Sora"; color:var(--fg);' }, 'AFT Recorder'),
                            el('div', { style: 'font:500 14px "Manrope"; color:var(--fg-3); margin-top:4px;' }, 'aft.io · Geliştirici')
                        ),
                        el('span', { style: 'font:700 12px "Manrope"; color:var(--green); background:var(--green-tint); padding:6px 12px; border-radius:8px;' }, 'Doğrulanmış')
                    ),
                    el('p', { style: 'font:400 15px/1.6 "Manrope"; color:var(--fg-3); margin:0 0 24px;' }, 'Ekrandaki adımlarını kaydedip kodsuz test senaryolarına dönüştürür. Projene bağlanır, tek tıkla kayda başlar.'),
                    el('a', { href: 'https://chrome.google.com/webstore', target: '_blank', rel: 'noopener', style: 'display:flex; align-items:center; justify-content:center; gap:10px; height:48px; border-radius:12px; background:var(--blue); color:#fff; font:700 15px "Manrope"; text-decoration:none;' },
                        el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>' }),
                        'İndir & Kur'
                    )
                )
            )
        )
    );
}

export function solutions() {
    const checkItem = (text) => el('div', { style: 'display:flex; gap:16px; align-items:center;' },
        el('span', { style: 'flex:none; width:28px; height:28px; border-radius:50%; background:var(--green-tint); color:var(--green); display:grid; place-items:center;' },
            el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M20 6L9 17l-5-5"/>' })
        ),
        el('span', { style: 'font:500 16px "Manrope"; color:var(--fg-2);' }, text)
    );

    return el('section', { id: 'cozumler', style: 'max-width:1200px; margin:0 auto; padding:140px 24px; scroll-margin-top:88px; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;' },
        el('div', {},
            el('div', { style: "font:700 13px 'Manrope'; letter-spacing:.16em; text-transform:uppercase; color:var(--orange);" }, 'ÇÖZÜMLER'),
            el('h2', { style: "font:800 44px/1.12 'Sora'; color:var(--fg); margin:16px 0 32px;" }, 'Her ekip için tek otomasyon altyapısı'),
            el('div', { style: 'display:flex; flex-direction:column; gap:20px;' },
                checkItem('Regresyon testlerini her sürümde otomatik çalıştır'),
                checkItem('Zamanlanmış görevlerle gece koşularını planla'),
                checkItem('XPath, CSS ve ID seçicilerini panelden düzenle'),
                checkItem('Excel ve PDF ile paylaşılabilir raporlar üret')
            )
        ),
        el('div', { style: 'background:var(--surface); border:1px solid var(--border); border-radius:24px; box-shadow:var(--shadow-lg); overflow:hidden;' },
            el('div', { style: 'display:flex; align-items:center; gap:24px; padding:0 24px; border-bottom:1px solid var(--border);' },
                el('div', { style: 'padding:20px 0; font:700 14px "Manrope"; color:var(--fg); border-bottom:2px solid var(--orange); margin-bottom:-1px;' }, 'Senaryo Adımları'),
                el('div', { style: 'padding:20px 0; font:600 14px "Manrope"; color:var(--fg-3);' }, 'Seçici Değerler'),
                el('button', { style: 'margin-left:auto; height:36px; padding:0 16px; border-radius:10px; border:none; background:var(--green); color:#fff; font:700 14px "Manrope"; cursor:pointer; display:inline-flex; align-items:center; gap:8px;' },
                    el('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'currentColor', html: '<path d="M8 5v14l11-7z"/>' }),
                    'Run'
                )
            ),
            el('div', { style: 'padding:24px; display:flex; flex-direction:column; gap:12px;' },
                el('div', { style: 'display:flex; align-items:center; gap:16px; padding:14px 20px; border:1px solid var(--border); border-radius:12px;' },
                    el('span', { style: 'font:800 13px "Sora"; color:var(--fg-3); width:24px;' }, '01'),
                    el('span', { style: 'font:600 14px "Manrope"; color:var(--fg); flex:1;' }, 'Sayfaya git — base URL'),
                    el('span', { style: 'font:700 11px "Manrope"; color:var(--blue); background:var(--blue-tint); padding:4px 10px; border-radius:8px;' }, 'NAVIGATE')
                ),
                el('div', { style: 'display:flex; align-items:center; gap:16px; padding:14px 20px; border:1px solid var(--border); border-radius:12px;' },
                    el('span', { style: 'font:800 13px "Sora"; color:var(--fg-3); width:24px;' }, '02'),
                    el('span', { style: 'font:600 14px "Manrope"; color:var(--fg); flex:1;' }, 'E-posta alanına yaz'),
                    el('span', { style: 'font:700 11px "Manrope"; color:var(--orange); background:var(--orange-tint); padding:4px 10px; border-radius:8px;' }, 'INPUT')
                ),
                el('div', { style: 'display:flex; align-items:center; gap:16px; padding:14px 20px; border:1px solid var(--border); border-radius:12px;' },
                    el('span', { style: 'font:800 13px "Sora"; color:var(--fg-3); width:24px;' }, '03'),
                    el('span', { style: 'font:600 14px "Manrope"; color:var(--fg); flex:1;' }, 'Giriş butonuna tıkla'),
                    el('span', { style: 'font:700 11px "Manrope"; color:var(--orange); background:var(--orange-tint); padding:4px 10px; border-radius:8px;' }, 'CLICK')
                ),
                el('div', { style: 'display:flex; align-items:center; gap:16px; padding:14px 20px; border:1px solid var(--border); border-radius:12px; background:var(--green-tint);' },
                    el('span', { style: 'font:800 13px "Sora"; color:var(--green); width:24px;' }, '04'),
                    el('span', { style: 'font:600 14px "Manrope"; color:var(--fg); flex:1;' }, 'Panel başlığını doğrula'),
                    el('span', { style: 'font:700 11px "Manrope"; color:var(--green); background:var(--surface); padding:4px 10px; border-radius:8px;' }, 'ASSERT')
                )
            )
        )
    );
}

export function pricing() {
    const checkItem = (text) => el('li', { style: 'color:var(--fg-2); font:500 15px "Manrope"; display:flex; align-items:center; gap:10px;' },
        el('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--green)', 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M20 6L9 17l-5-5"/>' }),
        text
    );

    const planCard = (title, price, desc, btnText, featuresList, isPopular) => el('div', {
            style: `background:var(--surface); border:2px solid ${isPopular ? 'var(--orange)' : 'var(--border)'}; border-radius:24px; padding:40px; box-shadow:var(--shadow); position:relative; display:flex; flex-direction:column;`
        },
        isPopular ? el('div', { style: 'position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:var(--orange); color:#fff; font:700 12px "Manrope"; padding:6px 16px; border-radius:99px;' }, 'En Çok Tercih Edilen') : '',
        el('h3', { style: 'font:800 24px "Sora"; color:var(--fg); margin:0 0 12px;' }, title),
        el('p', { style: 'color:var(--fg-3); font:400 15px/1.6 "Manrope"; margin:0 0 32px; min-height:48px;' }, desc),
        el('div', { style: 'display:flex; align-items:baseline; margin-bottom:32px;' },
            price === 'Özel'
                ? el('span', { style: 'font:800 48px "Sora"; color:var(--fg); letter-spacing:-0.03em;' }, price)
                : el('div', { style: 'display:flex; align-items:baseline;' },
                    el('span', { style: 'font:800 32px "Sora"; color:var(--fg); margin-right:4px;' }, '₺'),
                    el('span', { style: 'font:800 56px "Sora"; color:var(--fg); letter-spacing:-0.03em;' }, price.replace('₺','')),
                    el('span', { style: 'font:600 16px "Manrope"; color:var(--fg-3); margin-left:8px;' }, '/ay')
                )
        ),
        el('button', {
            style: `width:100%; height:52px; border-radius:12px; font:700 16px "Manrope"; cursor:pointer; border:none; margin-bottom:32px; ${isPopular ? 'background:var(--orange); color:#fff; box-shadow:0 8px 24px color-mix(in srgb, var(--orange) 30%, transparent);' : 'background:var(--bg-2); color:var(--fg); border:1px solid var(--border-2);'}`,
            onClick: () => navigate(price === 'Özel' ? '/' : '/register')
        }, btnText),
        el('ul', { style: 'margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:16px;' },
            ...featuresList.map(text => checkItem(text))
        )
    );

    return el('section', { id: 'fiyatlandirma', style: 'max-width:1200px; margin:0 auto; padding:120px 24px; scroll-margin-top:88px;' },
        sectionHeader('FİYATLANDIRMA', 'İhtiyacınıza uygun planı seçin'),
        el('div', { style: 'display:grid; grid-template-columns:repeat(3, 1fr); gap:32px; align-items:start;' },
            planCard('Başlangıç', '₺000', 'Küçük projeler ve bireysel kullanım için.', 'Ücretsiz Başla', [
                '1 proje',
                'Ayda 100 çalıştırma',
                'Topluluk desteği'
            ], false),
            planCard('Profesyonel', '₺000', 'Büyüyen ekipler ve düzenli otomasyon testleri için.', '14 Gün Dene', [
                '10 proje',
                'Sınırsız çalıştırma',
                'Zamanlanmış görevler',
                'Öncelikli destek'
            ], true),
            planCard('Kurumsal', 'Özel', 'Gelişmiş güvenlik ve limitsiz altyapı ihtiyaçları için.', 'İletişime Geç', [
                'Sınırsız proje',
                'SSO & rol yönetimi',
                'Self-hosted runner',
                'SLA & özel eğitim'
            ], false)
        )
    );
}

export function landingScreen() {
    return el('div', { class: 'landing-page' },
        el('header', { style: 'position:sticky; top:0; z-index:50; background:color-mix(in srgb, var(--bg) 86%, transparent); backdrop-filter:saturate(180%) blur(14px); border-bottom:1px solid var(--border);' },
            el('div', { style: 'max-width:1200px; margin:0 auto; padding:0 24px; height:72px; display:flex; align-items:center; gap:30px;' },
                brand(),
                el('nav', { style: 'display:flex; align-items:center; gap:26px; margin-left:6px;' },
                    navLink('Özellikler', 'ozellikler'),
                    navLink('Nasıl Çalışır', 'nasil-calisir'),
                    navLink('Kullanım Rehberi', 'kullanim'),
                    navLink('Eklenti', 'eklenti'),
                    navLink('Çözümler', 'cozumler'),
                    navLink('Fiyatlandırma', 'fiyatlandirma')
                ),
                el('div', { style: 'margin-left:auto; display:flex; align-items:center; gap:11px;' },
                    themeToggle(),
                    el('button', { style: "height:40px; padding:0 16px; border-radius:10px; border:1px solid transparent; background:none; color:var(--fg); font:600 14px 'Manrope'; cursor:pointer;", onClick: () => navigate('/login') }, 'Giriş Yap'),
                    el('button', { style: "height:40px; padding:0 18px; border-radius:10px; border:none; background:var(--orange); color:#fff; font:700 14px 'Manrope'; cursor:pointer; box-shadow:0 6px 16px color-mix(in srgb, var(--orange) 32%, transparent);", onClick: () => navigate('/register') }, 'Kayıt Ol'),
                )
            )
        ),

        el('section', { class: 'lp-hero', style: 'max-width:1200px; margin:0 auto; padding:120px 24px 100px; text-align:center; display:flex; flex-direction:column; align-items:center;' },
            el('span', { style: 'display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 16px; border-radius:999px; background:var(--orange-tint); color:var(--orange); font:700 13px "Manrope"; margin-bottom:32px;' }, ' Yeni Nesil Test Otomasyon Platformu'),
            el('h1', { style: "font:800 64px/1.1 'Sora'; color:var(--fg); max-width:900px; margin:0; letter-spacing:-0.03em;", html: 'Test otomasyonunu <em style="color:var(--orange); font-style:normal;">kod yazmadan</em> yönet.' }),
            el('p', { style: "font:400 18px/1.6 'Manrope'; color:var(--fg-3); margin:24px 0 40px; max-width:680px;" }, 'Chrome eklentisiyle aksiyonlarını kaydet, AFT bunları arka planda otomatik çalıştırsın. Senaryo yaz, zamanla, raporla.'),
            el('div', { style: 'display:flex; gap:16px;' },
                el('button', { style: "height:56px; padding:0 32px; border-radius:12px; border:none; background:var(--orange); color:#fff; font:700 16px 'Manrope'; cursor:pointer; box-shadow:0 8px 24px color-mix(in srgb, var(--orange) 32%, transparent);", onClick: () => navigate('/register') }, 'Ücretsiz Başla'),
                el('button', { style: "height:56px; padding:0 32px; border-radius:12px; border:1px solid var(--border-2); background:var(--surface); color:var(--fg); font:700 16px 'Manrope'; cursor:pointer;", onClick: () => navigate('/login') }, 'Demoyu İzle')
            )
        ),

        features(),
        howItWorks(),
        guide(),
        extensionSection(),
        solutions(),
        pricing(),

        el('section', { style: 'max-width:1200px; margin:0 auto; padding:80px 24px 120px;' },
            el('div', { style: 'background:var(--blue-strong); border-radius:32px; padding:80px 40px; text-align:center; position:relative; overflow:hidden;' },
                el('h2', { style: "font:800 48px/1.12 'Sora'; letter-spacing:-.025em; color:#fff; margin:0;" }, 'Otomasyona bugün başla'),
                el('p', { style: "font:400 18px 'Manrope'; color:rgba(255,255,255,.85); margin:16px 0 36px;" }, 'İlk senaryonu 5 dakikada çalıştır. Kart bilgisi gerekmez.'),
                el('button', { onclick: () => navigate('/register'), style: "display:inline-flex; align-items:center; gap:10px; height:56px; padding:0 32px; border-radius:14px; border:none; background:var(--orange); color:#fff; font:700 16px 'Manrope'; cursor:pointer; box-shadow:0 12px 32px rgba(0,0,0,.25);" },
                    'Ücretsiz Hesap Oluştur',
                    el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', html: '<path d="M5 12h14M13 6l6 6-6 6"/>' })
                )
            )
        ),

        el('footer', { style: 'border-top:1px solid var(--border); background:var(--bg-2);' },
            el('div', { style: 'max-width:1200px; margin:0 auto; padding:80px 24px 40px; display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px;' },
                el('div', {},
                    el('div', { style: 'display:flex; align-items:center; gap:12px; margin-bottom:16px;' },
                        el('span', { style: 'width:36px; height:36px; border-radius:10px; background:var(--orange); display:grid; place-items:center;' },
                            el('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', html: '<circle cx="12" cy="12" r="8.5" stroke="#fff" stroke-width="2"/><path d="M10.2 9 15 12l-4.8 3z" fill="#fff"/>' })
                        ),
                        el('span', { style: 'font:800 22px "Sora"; color:var(--fg);' }, 'AFT')
                    ),
                    el('p', { style: 'font:400 15px/1.6 "Manrope"; color:var(--fg-3); max-width:300px; margin:0;' }, 'No-code, kaydet-oynat mantığıyla çalışan test otomasyon platformu.')
                ),
                el('div', {},
                    el('div', { style: 'font:700 15px "Manrope"; color:var(--fg); margin-bottom:20px;' }, 'Ürün'),
                    el('div', { style: 'display:flex; flex-direction:column; gap:14px;' },
                        el('a', { href: '#ozellikler', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Özellikler'),
                        el('a', { href: '#fiyatlandirma', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Fiyatlandırma'),
                        el('a', { href: '#eklenti', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Chrome eklentisi')
                    )
                ),
                el('div', {},
                    el('div', { style: 'font:700 15px "Manrope"; color:var(--fg); margin-bottom:20px;' }, 'Çözümler'),
                    el('div', { style: 'display:flex; flex-direction:column; gap:14px;' },
                        el('a', { href: '#cozumler', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Regresyon'),
                        el('a', { href: '#cozumler', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'CI/CD'),
                        el('a', { href: '#cozumler', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Raporlama')
                    )
                ),
                el('div', {},
                    el('div', { style: 'font:700 15px "Manrope"; color:var(--fg); margin-bottom:20px;' }, 'Şirket'),
                    el('div', { style: 'display:flex; flex-direction:column; gap:14px;' },
                        el('a', { href: '#', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Hakkımızda'),
                        el('a', { href: '#', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'İletişim'),
                        el('a', { href: '#', style: 'font:500 15px "Manrope"; color:var(--fg-3); text-decoration:none;' }, 'Gizlilik')
                    )
                )
            ),
            el('div', { style: 'max-width:1200px; margin:0 auto; padding:32px 24px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;' },
                el('span', { style: 'font:500 14px "Manrope"; color:var(--fg-3);' }, '© ' + new Date().getFullYear() + ' AFT Automation. Tüm hakları saklıdır.'),
                el('span', { style: 'font:500 14px "Manrope"; color:var(--fg-3);' }, "Türkiye'de tasarlandı")
            )
        )
    );
}