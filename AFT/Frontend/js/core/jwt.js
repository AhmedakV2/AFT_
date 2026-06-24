// Access token'dan kullanıcı bilgisini çözer (backend yanıtı user objesi döndürmüyor)
export function userFromToken(token) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const claims = JSON.parse(decodeURIComponent(escape(atob(payload))));
        const email = claims.email || claims.sub || '';
        return { id: claims.sub || null, email, name: email ? email.split('@')[0] : 'Kullanıcı' };
    } catch {
        return { id: null, email: '', name: 'Kullanıcı' };
    }
}