import { store } from './core/store.js';
import { applyTheme } from './core/theme.js';
import { route, startRouter } from './core/router.js';
import { bootSession } from './core/session.js';
import { el } from './core/dom.js';

import { landingScreen } from './screens/landing.js';
import { loginScreen } from './screens/login.js';
import { registerScreen } from './screens/register.js';
import { dashboardScreen } from './screens/dashboard.js';
import { projectsScreen } from './screens/projects.js';
import { reportsScreen } from './screens/reports.js';
import { scheduledScreen } from './screens/scheduled.js';

applyTheme();
store.subscribe(applyTheme);


route('/', landingScreen);
route('/login', loginScreen);
route('/register', registerScreen);

route('/dashboard', dashboardScreen, { auth: true });
route('/projects', projectsScreen, { auth: true });
route('/reports', reportsScreen, { auth: true });
route('/scheduled', scheduledScreen, { auth: true });

route('/404', () => el('div', { class: 'auth' }, el('h1', { class: 'auth__title' }, 'Sayfa bulunamadı')));

(async () => {
    await bootSession();
    startRouter(document.getElementById('app'));
})();