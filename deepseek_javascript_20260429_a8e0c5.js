// Данные серверов
const serversData = [
    { id: 1, name: "Amsterdam", country: "Netherlands", region: "europe", ip: "ams.securenet.com", load: 23, ping: null },
    { id: 2, name: "Frankfurt", country: "Germany", region: "europe", ip: "fra.securenet.com", load: 45, ping: null },
    { id: 3, name: "London", country: "UK", region: "europe", ip: "lhr.securenet.com", load: 12, ping: null },
    { id: 4, name: "Paris", country: "France", region: "europe", ip: "cdg.securenet.com", load: 67, ping: null },
    { id: 5, name: "Tokyo", country: "Japan", region: "asia", ip: "nrt.securenet.com", load: 34, ping: null },
    { id: 6, name: "Singapore", country: "Singapore", region: "asia", ip: "sin.securenet.com", load: 56, ping: null },
    { id: 7, name: "Seoul", country: "South Korea", region: "asia", ip: "icn.securenet.com", load: 23, ping: null },
    { id: 8, name: "New York", country: "USA", region: "america", ip: "jfk.securenet.com", load: 78, ping: null },
    { id: 9, name: "Los Angeles", country: "USA", region: "america", ip: "lax.securenet.com", load: 34, ping: null },
    { id: 10, name: "Miami", country: "USA", region: "america", ip: "mia.securenet.com", load: 45, ping: null },
    { id: 11, name: "Sao Paulo", country: "Brazil", region: "america", ip: "gru.securenet.com", load: 67, ping: null },
    { id: 12, name: "Sydney", country: "Australia", region: "asia", ip: "syd.securenet.com", load: 23, ping: null }
];

// Функция измерения пинга
async function measurePing(serverIp) {
    const startTime = performance.now();
    
    try {
        // Используем fetch с маленьким таймаутом для измерения задержки
        await fetch(`https://${serverIp}`, {
            mode: 'no-cors',
            cache: 'no-cache',
            timeout: 5000
        });
        
        const endTime = performance.now();
        const ping = Math.round(endTime - startTime);
        return ping > 0 && ping < 1000 ? ping : Math.floor(Math.random() * 100) + 20;
    } catch (error) {
        // Симуляция пинга для демонстрации
        return Math.floor(Math.random() * 150) + 20;
    }
}

// Загрузка пинга для всех серверов
async function loadAllPings() {
    const promises = serversData.map(async (server) => {
        const ping = await measurePing(server.ip);
        server.ping = ping;
        return server;
    });
    
    await Promise.all(promises);
    return serversData;
}

// Отображение серверов
async function displayServers(filter = 'all') {
    const serversGrid = document.getElementById('serversGrid');
    serversGrid.innerHTML = '<div class="loading-spinner">📡 Измерение пинга серверов...</div>';
    
    // Загружаем пинги
    const servers = await loadAllPings();
    
    // Фильтруем серверы
    let filteredServers = servers;
    if (filter !== 'all') {
        filteredServers = servers.filter(server => server.region === filter);
    }
    
    // Сортируем по пингу
    filteredServers.sort((a, b) => a.ping - b.ping);
    
    // Обновляем счетчик серверов
    document.getElementById('serverCount').innerText = servers.length;
    
    // Обновляем глобальный пинг (средний)
    const avgPing = Math.round(servers.reduce((sum, s) => sum + s.ping, 0) / servers.length);
    document.getElementById('globalPing').innerHTML = `🌍 Средний пинг: ${avgPing} мс`;
    
    // Отображаем серверы
    if (filteredServers.length === 0) {
        serversGrid.innerHTML = '<div class="loading-spinner">😔 Серверы не найдены</div>';
        return;
    }
    
    serversGrid.innerHTML = filteredServers.map(server => `
        <div class="server-card" data-region="${server.region}">
            <div class="server-info">
                <h3>🇺🇳 ${server.name}</h3>
                <div style="font-size: 12px; opacity: 0.7;">${server.country}</div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <span class="ping-badge">⏱️ ${server.ping} мс</span>
                    <span class="load-badge">📊 Загрузка: ${server.load}%</span>
                </div>
            </div>
            <button class="connect-btn" onclick="connectToServer('${server.name}', ${server.ping})">
                🔌 Подключиться
            </button>
        </div>
    `).join('');
}

// Функция подключения к VPN
function connectToServer(serverName, ping) {
    // Создаем уведомление о подключении
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(74, 222, 128, 0.95);
        color: #fff;
        padding: 15px 25px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        z-index: 10000;
        animation: slideIn 0.5s ease;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>🔐</span>
            <div>
                <strong>Подключение к ${serverName}</strong><br>
                <small>Пинг: ${ping} мс | Идет установка защищенного соединения...</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Симуляция подключения
    setTimeout(() => {
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>✅</span>
                <div>
                    <strong>VPN Активен</strong><br>
                    <small>Вы подключены к ${serverName}. Ваш IP защищен!</small>
                </div>
            </div>
        `;
        
        // Показываем дополнительную информацию
        showVpnStatus(serverName, ping);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        
    }, 2000);
}

// Показ статуса VPN
function showVpnStatus(serverName, ping) {
    // Создаем плавающую панель статуса
    const existingPanel = document.getElementById('vpnStatusPanel');
    if (existingPanel) existingPanel.remove();
    
    const statusPanel = document.createElement('div');
    statusPanel.id = 'vpnStatusPanel';
    statusPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        padding: 15px 20px;
        border-radius: 15px;
        z-index: 10000;
        font-size: 14px;
        border-left: 4px solid #4ade80;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: slideInLeft 0.5s ease;
    `;
    
    statusPanel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: rgba(74, 222, 128, 0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                🔒
            </div>
            <div>
                <strong style="color: #4ade80;">VPN ЗАЩИЩЕН</strong><br>
                <span style="font-size: 12px; opacity: 0.8;">Сервер: ${serverName} • Пинг: ${ping} мс</span><br>
                <span style="font-size: 11px; opacity: 0.6;">IP: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}</span>
            </div>
            <button onclick="disconnectVPN()" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 5px 10px; border-radius: 8px; cursor: pointer; margin-left: 10px;">
                ⏹️ Отключить
            </button>
        </div>
    `;
    
    document.body.appendChild(statusPanel);
}

// Отключение от VPN
function disconnectVPN() {
    const panel = document.getElementById('vpnStatusPanel');
    if (panel) {
        panel.style.animation = 'slideOutLeft 0.5s ease';
        setTimeout(() => panel.remove(), 500);
    }
    
    // Показываем уведомление об отключении
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.95);
        color: #fff;
        padding: 15px 25px;
        border-radius: 15px;
        backdrop-filter: blur(10px);
        z-index: 10000;
        animation: slideIn 0.5s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>🔓</span>
            <div>
                <strong>VPN отключен</strong><br>
                <small>Ваше соединение больше не защищено</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Фильтрация серверов
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        displayServers(filter);
    });
});

// Мобильное меню
document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '70px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'rgba(0,0,0,0.95)';
        navLinks.style.padding = '20px';
        navLinks.style.backdropFilter = 'blur(10px)';
    }
});

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes slideInLeft {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutLeft {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(-100%);
            opacity: 0;
        }
    }
`;

document.head.appendChild(style);

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    displayServers();
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Счетчик активных пользователей (анимация)
    let count = 0;
    const targetCount = 50234;
    const counterElement = document.getElementById('activeUsers');
    const interval = setInterval(() => {
        if (count >= targetCount) {
            clearInterval(interval);
            counterElement.textContent = targetCount.toLocaleString() + '+';
        } else {
            count += Math.ceil(targetCount / 100);
            if (count > targetCount) count = targetCount;
            counterElement.textContent = count.toLocaleString() + '+';
        }
    }, 20);
});

// Функция для генерации конфигурации (для реального VPN)
function generateVPNConfig(serverName) {
    const config = `
# OpenVPN Config for ${serverName}
client
dev tun
proto udp
remote ${serverName.toLowerCase().replace(' ', '')}.securenet.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
verb 3
<ca>
-----BEGIN CERTIFICATE-----
[Your Certificate Here]
-----END CERTIFICATE-----
</ca>
    `;
    
    return config;
}