class App {
    constructor(apps) {
        this.apps = apps;
        this.disabledApps = this.getDisabledApps();
        this.$progressbar = $('.progress-bar');

        this.initHandlers();
        this.setEnabledClass();
        this.initSavedIframeView();

    }

    getDisabledApps() {
        const json = localStorage.getItem('disabled_apps') || '[]';
        return JSON.parse(json);
    }

    saveStorage() {
        const json = JSON.stringify(this.disabledApps);
        localStorage.setItem('disabled_apps', json);
    }

    initHandlers() {
        const $b = $(document.body);

        $b.on('click', '#settings-view .app-item-box',          e => this.appsSetChange(e));
        $b.on('click', '.js-set-active-iframe',                 e => this.setActiveIframeClick(e));
        $b.on('click', '.js-reload-page', () => location.reload());
        $b.on('click', '.js-welcome-slider-btn:not(.active)', function () {
            $('.js-welcome-slider-btn').toggleClass('active');
            $('#welcome-view').find('.slider-box').toggleClass('second-view');
        });
        $b.on('click', '[show-view]', e => {
            const el = e.target.closest('[show-view]');
            const v = el.getAttribute('show-view');
            this.setActiveView(v);
        });
        $b.on('click', '.js-hamburger', function () {
            this.classList.toggle('is-active');
            document.body.classList.toggle('active-sidebar');
            localStorage.sidebar_state = localStorage.sidebar_state === 'show' ? 'hide' : 'show';
        });
    }

    setEnabledClass() {
        $('[data-app-url]').each((i, el) => {
            const appId = el.getAttribute('data-app-url');
            const isDisabled = this.disabledApps.includes(appId);
            const a = isDisabled ? 'remove' : 'add';
            el.classList[a]('enabled');
        });
    }

   
    setActiveView(v) {
        document.getElementById('view-box').setAttribute('data-a-view', v);
    }

    appsSetChange(e) {
        const el = e.target.closest('[data-app-url]');
        const appId = el.getAttribute('data-app-url');
        const index = this.disabledApps.indexOf(appId);

        index > -1 ? this.disabledApps.splice(index, 1) : this.disabledApps.push(appId) ;

        this.saveStorage();
        this.setEnabledClass();
    }

    highlightActiveApp(e) {
        const target = e.currentTarget;
        const parent = target.closest('#sidebar');
        const activeApp = parent.querySelector('.app-item.active');
        if (activeApp && activeApp !== target) {
            activeApp.classList.remove('active');
        }
        target.classList.add('active');
    }

    setActiveIframeClick(e) {
        this.highlightActiveApp(e);
        const el = e.target.closest('[data-app-url]');
        const url = el.getAttribute('data-app-url');
        const iframeSrc = this.getIframeSrc(url);
        this.setActiveIframe(iframeSrc);
        localStorage.active_iframe = url;
    }

    setActiveIframe(url) {
        const target = document.querySelector(`iframe[data-url="${url}"]`);
        const iframeError = document.getElementById('iframe-error');
        iframeError.classList.remove('time');

        $('iframe').hide();

        if(target) {
            $(target).show();

        } else {
            this.$progressbar.show();

            const view   = document.getElementById('iframe-view');
            const iframe = document.createElement('iframe');
            iframe.src   = url;
            iframe.innerHTML = 'If WhatsApp does not loaded <a href="https://web.whatsapp.com?unregister-sw" target="_top">click here, please</a>';
            iframe.setAttribute('data-url', url);
            iframe.onload = () => this.$progressbar.hide();
            view.appendChild(iframe);

            setTimeout(() => {
                this.$progressbar.hide();
                if(url === 'https://web.whatsapp.com') iframeError.classList.add('time');
            }, 4000);
        }

        if(url !== 'https://web.whatsapp.com')
            $('iframe[data-url="https://web.whatsapp.com"]').remove();
    }

    initSavedIframeView() {
        const url = localStorage.active_iframe;
        if(!url) return;
        const activeIframe = document.querySelector(`#sidebar [data-app-url="${url}"]`);
        activeIframe.classList.add('active');
        const iframeSrc = this.getIframeSrc(url);

        this.setActiveIframe(iframeSrc);
        this.setActiveView('iframe-view');
    }

    getIframeSrc(url) {
        return this.canOpenInIframe(url) ? url : '/new_launcher/app_launcher.php?app=' + decodeURIComponent(url);
    }

    canOpenInIframe(url) {
        const app = this.apps.find(a => a.url === url);
        if(!app) return console.error('app not found');

        return app.iframe;
    }
}

const app = new App(APPS);
