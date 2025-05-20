document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const homeBtn = document.getElementById('home-btn');
    const gameModal = document.getElementById('game-modal');
    const closeModal = document.getElementById('close-modal');
    const recommendBtn = document.getElementById('recommend-btn');
    const recommendationResults = document.getElementById('recommendation-results');
    const recommendationList = document.getElementById('recommendation-list');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const currentPageElement = document.getElementById('current-page');
    let currentPage = 1;
    // 新增代码：处理登录和注册按钮点击事件
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeLoginModal = document.getElementById('close-login-modal');
    const closeRegisterModal = document.getElementById('close-register-modal');

    // 点击登录按钮显示登录弹窗
    loginButton.addEventListener('click', () => {
          loginModal.classList.remove('hidden');
    });

// 点击注册按钮显示注册弹窗
registerButton.addEventListener('click', () => {
    registerModal.classList.remove('hidden');
});

// 关闭登录弹窗
closeLoginModal.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

// 关闭注册弹窗
closeRegisterModal.addEventListener('click', () => {
    registerModal.classList.add('hidden');
});

// 点击模态窗口外部关闭弹窗（可选增强功能）
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.classList.add('hidden');
    }
    if (event.target === registerModal) {
        registerModal.classList.add('hidden');
    }
});
    // 加载游戏列表
    async function loadGames(page = 1) {
        const search = searchInput.value.trim();
        const data = await fetchGames(page, search);

        if (!data) {
            document.getElementById('game-list').innerHTML = '<p>无法加载数据，请稍后重试。</p>';
            return;
        }

        // Populate game list
        const gameList = document.getElementById('game-list');
        gameList.innerHTML = '';
        data.games.forEach(game => {
            const gameItem = `
                <div class="game-item" data-game-id="${game.id}">
                    <img src="${game.icon_url}" alt="${game.name}">
                    <div class="game-name">${game.name}</div>
                </div>`;
            gameList.insertAdjacentHTML('beforeend', gameItem);
        });

        // Add click event to each game item
        const gameItems = document.querySelectorAll('.game-item');
        gameItems.forEach(item => {
            item.addEventListener('click', async () => {
                const gameId = item.getAttribute('data-game-id');
                const gameDetails = await fetchGameDetails(gameId);
                if (gameDetails) {
                    showGameDetails(gameDetails);
                }
            });
        });

        // Update pagination
        generatePagination(data.totalPages, page);
    }

    // 获取游戏列表数据
    async function fetchGames(page, search) {
        try {
            const response = await fetch(`/api/games?page=${page}&search=${encodeURIComponent(search)}`);
            if (!response.ok) throw new Error('Failed to fetch games');
            return await response.json(); // 假设后端返回 { games: [...], totalPages: n }
        } catch (error) {
            console.error('Error fetching games:', error);
            return null;
        }
    }

    // 获取游戏详情数据
    async function fetchGameDetails(gameId) {
        try {
            const response = await fetch(`/api/games/${gameId}`);
            if (!response.ok) throw new Error('Failed to fetch game details');
            return await response.json(); // 假设后端返回游戏详情数据
        } catch (error) {
            console.error('Error fetching game details:', error);
            return null;
        }
    }

   // 显示游戏详情弹窗（原代码修改为使用 .hidden 类）
function showGameDetails(game) {
    document.getElementById('game-image').src = game.icon_url;
    document.getElementById('game-title').textContent = game.name;
    document.getElementById('game-rating').textContent = `评分: ${game.rating}`;
    document.getElementById('game-price').textContent = `价格: $${game.price}`;
    document.getElementById('game-description').innerHTML = game.description.replace(/\n/g, '<br>');
    // 使用 .hidden 类控制显示
    gameModal.classList.remove('hidden'); // 替换原 gameModal.style.display = 'block'
}

// 关闭游戏详情弹窗（原代码修改为使用 .hidden 类）
closeModal.addEventListener('click', () => {
    gameModal.classList.add('hidden'); // 替换原 gameModal.style.display = 'none'
});

    // 点击首页按钮
    homeBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentPage = 1;
        loadGames(currentPage);
    });

    // 点击搜索按钮
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        loadGames(currentPage);
    });

    // 点击推荐按钮
    recommendBtn.addEventListener('click', () => {
        const requestData = {
            user_id: 123, // 假设用户 ID 为 123
            item_ids: [1, 2, 3, 4, 5], // 候选游戏的 ID 列表
            item_categories: [10, 20, 30, 40, 50], // 游戏类别
            hours: [14, 16, 18, 20, 22] // 假设行为发生时间
        };

        fetch("/api/recommend", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            recommendationList.innerHTML = "";

            if (data.length === 0) {
                recommendationResults.classList.remove("hidden");
                recommendationList.innerHTML = "<li>暂无推荐结果</li>";
                return;
            }

            data.forEach(item => {
                const listItem = document.createElement("li");
                listItem.textContent = `游戏 ID: ${item.item_id}，推荐分数: ${item.score.toFixed(2)}`;
                recommendationList.appendChild(listItem);
            });

            recommendationResults.classList.remove("hidden");
        })
        .catch(error => {
            console.error("推荐请求失败:", error);
            recommendationList.innerHTML = "<li>推荐请求失败，请稍后重试</li>";
            recommendationResults.classList.remove("hidden");
        });
    });

    // 分页功能
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadGames(currentPage);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadGames(currentPage);
    });

    function generatePagination(totalPages, currentPage) {
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        currentPageElement.textContent = currentPage;
    }

    // 初始加载第 1 页
    loadGames(currentPage);
});