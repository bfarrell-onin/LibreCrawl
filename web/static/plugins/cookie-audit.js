LibreCrawlPlugin.register({
    id: 'cookie-audit-plugin',
    name: 'Cookie Audit',
    tab: {
        label: 'Cookies',
        icon: '🍪',
        position: 'end'
    },

    version: '1.1.0',
    author: 'LibreCrawl User',
    description: 'Analyzes and lists all cookies found during the crawl.',

    onLoad() {
        console.log('Cookie Audit Plugin Initialized');
    },

    onTabActivate(container, data) {
     
        this.render(container, data);
    },

    onDataUpdate(data) {
        if (this.isActive && this.container) {
            this.render(this.container, data);
        }
    },

    render(container, data) {
        if (!data.urls || data.urls.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        const cookieData = this.extractCookies(data.urls);

        container.innerHTML = `
            <div class="plugin-content" style="padding: 20px; overflow-y: auto; max-height: calc(100vh - 200px);">
                <div class="plugin-header" style="margin-bottom: 24px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #e5e7eb;">🍪 Cookie & Tracker Audit</h2>
                    <p style="color: #9ca3af; font-size: 14px;">
                        Showing cookies detected across <strong>${data.urls.length}</strong> pages.
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div style="background: #1f2937; padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                        <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase;">Total Cookies</div>
                        <div style="font-size: 24px; color: #fbbf24; font-weight: bold;">${cookieData.totalCount}</div>
                    </div>
                    <div style="background: #1f2937; padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                        <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase;">Unique Names</div>
                        <div style="font-size: 24px; color: #60a5fa; font-weight: bold;">${cookieData.uniqueNames.size}</div>
                    </div>
                </div>

                <div style="background: #1f2937; border-radius: 12px; border: 1px solid #374151; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; color: #cbd5e1; font-size: 13px;">
                        <thead>
                            <tr style="background: #111827; text-align: left;">
                                <th style="padding: 12px; border-bottom: 1px solid #374151;">Cookie Name</th>
                                <th style="padding: 12px; border-bottom: 1px solid #374151;">Domain</th>
                                <th style="padding: 12px; border-bottom: 1px solid #374151;">First Found On</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderCookieRows(cookieData.allCookies)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    extractCookies(urls) {
        let allCookies = [];
        let uniqueNames = new Set();
        let totalCount = 0;

        urls.forEach(page => {
            // LibreCrawl stores cookies in different places depending on engine
            // Usually metadata.cookies or metadata.response_headers['set-cookie']
            const cookies = page.metadata?.cookies || [];
            
            cookies.forEach(c => {
                totalCount++;
                uniqueNames.add(c.name);
                allCookies.push({
                    name: c.name,
                    domain: c.domain || 'N/A',
                    path: page.url,
                    value: c.value
                });
            });
        });

        return { allCookies, uniqueNames, totalCount };
    },

    renderCookieRows(cookies) {
        if (cookies.length === 0) {
            return `<tr><td colspan="3" style="padding: 20px; text-align: center; color: #9ca3af;">No cookies detected. Ensure JavaScript rendering is enabled.</td></tr>`;
        }

        return cookies.map(c => `
            <tr style="border-bottom: 1px solid #374151;">
                <td style="padding: 12px; font-family: monospace; color: #f472b6;">${this.utils.escapeHtml(c.name)}</td>
                <td style="padding: 12px;">${this.utils.escapeHtml(c.domain)}</td>
                <td style="padding: 12px; font-size: 11px; color: #9ca3af;">
                    ${this.utils.formatUrl(c.path, 50)}
                </td>
            </tr>
        `).join('');
    },

    renderEmptyState() {
        return `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🍪</div>
                <h3 style="font-size: 24px; color: #e5e7eb;">Ready to Audit</h3>
                <p style="color: #9ca3af;">Start a crawl with <strong>Playwright</strong> enabled to detect cookies.</p>
            </div>
        `;
    }
});