const { createApp, ref, computed, nextTick, onMounted, onUnmounted, watch } = Vue;

const app = createApp({
    components: { 
        'dashboard-view': window.DashboardFeature,
        'cloud-classroom-view': window.CloudClassroomFeature, 
        'ladder-view': window.LadderFeature,
        'competition-view': window.CompetitionFeature,
        'cpp-core-view': window.CppCoreFeature,
        'calendar-view': window.CalendarFeature,
        'coding-workspace': window.CodingWorkspaceFeature,
        'gift-view': window.GiftFeature,
        'scratch-creative-view': window.ScratchCreativeFeature,
        'scratch-personal-view': window.ScratchPersonalFeature,
        'scratch-team-view': window.ScratchTeamFeature,
        'exam-center-view': window.ExamCenterFeature,
        'honor-view': window.HonorFeature,
        'special-course-view': window.SpecialCourseFeature,
        'knowledge-view': window.KnowledgeFeature,
        'wealth-ranking-view': window.WealthRankingFeature,
        'toolbox-view': window.ToolboxFeature,
        'notification-center-view': window.NotificationCenterFeature,
        'user-profile-view': window.UserProfileFeature,
        'wechat-bind-view': window.WechatBindFeature, // 注册新组件
        'data-center-view': window.DataCenterFeature,
        'star-student-view': window.StarStudentFeature || { template: '<div class="text-red-500 p-4">组件加载失败: feature-star-student.js 未找到</div>' }
    },
    setup() {
        // ================= 1. 基础状态 =================
        const user = ref({
            name: '周佳缘', 
            level: 3,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            // [New] 补充个人资料字段
            gender: 'female',
            school: '海淀区第三实验小学',
            grade: '五年级',
            province: '北京市',
            city: '海淀区',
            address: '中关村南大街 123 号',
            phone: '13800138000',
            email: 'zhoujiayuan@example.com',
            birthday: '2013-05-20',
            
            currencies: { '积分': 12000, '码豆': 5400, '活跃点': 880, '天梯币': 1200, '荣誉点': 15 },
            historyStats: {
                honor: 10, activity: 300, points: 5000, ladder: 800
            },
            cards: [
                { id: 1, type: 'week', name: '尊享周卡', desc: '激活后7天内无限次免费预约', status: 'active', deadline: '2025-12-31', activatedAt: '2023-10-20', validUntil: '2023-10-27' },
                { id: 2, type: 'week', name: '体验周卡', desc: '激活后7天内无限次免费预约', status: 'inactive', deadline: '2025-06-30', activatedAt: null, validUntil: null },
                { id: 3, type: 'hour', name: '10小时资源包', desc: '抵扣预约时长，精确到0.5小时', status: 'active', balance: 8.5, deadline: '2025-12-31' },
                { id: 4, type: 'week', name: '新手周卡', desc: '新用户注册赠送', status: 'expired', deadline: '2023-01-01', activatedAt: '2022-12-01', validUntil: '2022-12-08' },
                { id: 5, type: 'hour', name: '5小时体验包', desc: '活动赠送', status: 'used', balance: 0, deadline: '2024-10-01' }
            ]
        });
        const currentView = ref('dashboard');
        
        // 状态：沉浸模式
        const isImmersiveMode = ref(false);
        const cheatWarnings = ref(0);
        
        const cppCoreActiveTab = ref('notes');
        const activeLadderType = ref('basic');
        const ladderViewMode = ref('home'); 
        const chatOpen = ref(false);
        
        // Panels
        const showTaskPanel = ref(false); 
        const showCardPanel = ref(false); 
        const showWealthPanel = ref(false);
        const showToolboxPanel = ref(false);
        const showStarStudentPanel = ref(false);
        const showAllMessagesPanel = ref(false);
        const showProfileEditPanel = ref(false);
        const showWechatBindPanel = ref(false); // [NEW] 微信绑定面板

        // ================= 消息中心 =================
        const notificationTab = ref('teacher'); 

        const teacherNotifications = ref([
            { 
                id: 1, 
                title: '王老师发布了新作业《C++ 指针进阶》', 
                time: '10分钟前', 
                read: false, 
                urgent: true, 
                desc: '请各位同学务必在周五前完成，本次作业计入期末考核。请仔细阅读附件中的解题思路。',
                content: `
                    <p>各位同学，大家好！</p>
                    <p>本周我们深入学习了 C++ 指针的高级用法，为了巩固知识点，特布置《指针进阶》作业。</p>
                    <p class="font-bold text-white mt-2">作业要求：</p>
                    <ul class="list-disc pl-5 mt-1 mb-2">
                        <li>完成所有选择题与填空题。</li>
                        <li>编程题需要提交完整代码，并附带运行截图。</li>
                        <li><strong>重点：</strong>请注意内存泄漏问题，使用 <code>delete</code> 释放内存。</li>
                    </ul>
                    <p>附件中包含了几道经典例题的图解，遇到困难可以参考。</p>
                `,
                images: [
                    { name: '指针内存图解.png', color: 'from-blue-600 to-indigo-700' },
                    { name: '作业提交示例.jpg', color: 'from-slate-600 to-slate-700' }
                ]
            },
            { 
                id: 2, 
                title: '张老师批改了你的试卷', 
                time: '1小时前', 
                read: false, 
                urgent: false, 
                desc: '你的《数据结构基础》测试卷已批改，得分为 95 分，继续保持！',
                content: `
                    <p><strong>得分：95 / 100</strong></p>
                    <p>整体表现非常出色！对二叉树的遍历算法掌握得很牢固。</p>
                    <p>扣分点主要在第 3 题的时间复杂度分析上，稍微有点不够严谨，建议复习一下大 O 表示法的定义。</p>
                    <p>加油！</p>
                `
            },
            { 
                id: 3, 
                title: '本周五下午 14:00 班会提醒', 
                time: '昨天', 
                read: true, 
                urgent: false, 
                desc: '请大家准时参加线上班会，我们将讨论下周的竞赛安排。',
                content: `<p>收到请回复。</p>`
            },
            { 
                id: 4, 
                title: '物理引擎物理课调课通知', 
                time: '3天前', 
                read: true, 
                urgent: false, 
                desc: '原定周三的物理实验课调整至周四下午，请互相转告。',
                content: `
                    <p>因实验室设备维护，原定于本周三（11月22日）的物理实验课调整至周四（11月23日）下午 14:00 - 16:00。</p>
                    <p>地点不变：科技楼 302 实验室。</p>
                `
            },
            { 
                id: 5, 
                title: '关于寒假集训营的报名通知', 
                time: '一周前', 
                read: true, 
                urgent: true, 
                desc: '2025年寒假集训营报名开启，名额有限，欲报从速！',
                content: `
                    <p><strong>🚀 2025 寒假编程集训营火热招募中！</strong></p>
                    <p>想在寒假期间弯道超车吗？想在 CSP-J/S 中取得优异成绩吗？快来加入我们的集训营吧！</p>
                    <p><strong>课程亮点：</strong></p>
                    <ul class="list-disc pl-5">
                        <li>金牌教练全程指导</li>
                        <li>全真模拟赛制</li>
                        <li>针对性弱项突破</li>
                    </ul>
                    <p>详情请查看宣传海报。</p>
                `,
                images: [
                    { name: '集训营海报.png', color: 'from-orange-500 to-red-600' },
                    { name: '课程表.png', color: 'from-teal-500 to-emerald-600' },
                    { name: '往期合影.jpg', color: 'from-blue-400 to-cyan-500' }
                ]
            }
        ]);

        const systemMessages = ref([
            { id: 101, title: '系统维护通知：今晚凌晨停机更新', time: '2小时前', read: false, icon: 'fa-solid fa-server', desc: '为了提供更好的服务，我们将于今晚 00:00 - 02:00 进行服务器升级维护。', content: '<p>维护期间将无法登录系统，请提前保存好您的代码。</p>' },
            { id: 102, title: '恭喜！你在天梯赛中晋升为【钻石 V】', time: '昨天', read: true, icon: 'fa-solid fa-trophy', desc: '你的努力得到了回报，段位已更新。', content: '<p>恭喜晋级！下个赛季继续加油！</p>' },
            { id: 103, title: '每日签到成功，获得 10 积分', time: '昨天', read: true, icon: 'fa-solid fa-calendar-check', desc: '连续签到 5 天，继续保持！', content: '<p>积分已到账。</p>' },
            { id: 104, title: '您的周卡即将到期，请及时续费', time: '3天前', read: true, icon: 'fa-solid fa-wallet', desc: '您的尊享周卡将于 2023-10-27 到期。', content: '<p>请前往卡包中心进行续费，以免影响您的预约权益。</p>' },
            { id: 105, title: '账号安全提醒：异地登录', time: '一周前', read: true, icon: 'fa-solid fa-shield-halved', desc: '检测到您的账号在未知设备登录，请确认是否为本人操作。', content: '<p>如果不是本人操作，请立即修改密码。</p>' }
        ]);

        const teacherUnread = computed(() => teacherNotifications.value.filter(n => !n.read).length);
        const systemUnread = computed(() => systemMessages.value.filter(n => !n.read).length);
        const unreadCount = computed(() => teacherUnread.value + systemUnread.value);

        const handleNotificationRead = (notification) => {
            const exists = systemMessages.value.find(n => n.id === notification.id);
            if (!exists) {
                systemMessages.value.unshift({
                    id: notification.id,
                    title: notification.title,
                    time: '刚刚',
                    read: true,
                    icon: 'fa-solid fa-bullhorn'
                });
            }
        };

        const markMessageAsRead = (msg, type) => {
            if (type === 'teacher') {
                const item = teacherNotifications.value.find(n => n.id === msg.id);
                if (item) item.read = true;
            } else {
                const item = systemMessages.value.find(n => n.id === msg.id);
                if (item) item.read = true;
            }
        };

        const markAllRead = () => {
            teacherNotifications.value.forEach(n => n.read = true);
            systemMessages.value.forEach(n => n.read = true);
            showToast('所有消息已标记为已读', 'success');
        };

        const deleteMessage = (id, type) => {
             if (type === 'teacher') {
                const idx = teacherNotifications.value.findIndex(n => n.id === id);
                if (idx !== -1) teacherNotifications.value.splice(idx, 1);
            } else {
                const idx = systemMessages.value.findIndex(n => n.id === id);
                if (idx !== -1) systemMessages.value.splice(idx, 1);
            }
            showToast('消息已删除', 'success');
        };

        const openNotificationCenter = () => {
            showTaskPanel.value = false; // 关闭下拉小菜单
            showAllMessagesPanel.value = true; // 打开全屏菜单
        };

        const workspaceTabs = ref([]); 
        const activeTabIndex = ref(0); 
        const isWorkspaceVisible = ref(false); 
        
        const sysModal = ref({ open: false, type: 'alert', title: '', message: '', inputValue: '', resolve: null, reject: null });
        const sysToast = ref({ show: false, message: '' });
        
        const learningTasks = ref([
            { id: 1, title: '完成 C++ 循环结构练习', deadline: '今天 20:00', done: false },
            { id: 2, title: '观看《二叉树入门》视频', deadline: '明天', done: false }
        ]);

        const activeCards = computed(() => user.value.cards.filter(c => c.status === 'active' || c.status === 'inactive'));
        const inactiveCards = computed(() => user.value.cards.filter(c => c.status === 'expired' || c.status === 'used'));

        // ================= 面板互斥逻辑 =================
        const closeAllPanels = (except = null) => {
            if(except !== 'task') showTaskPanel.value = false;
            if(except !== 'card') showCardPanel.value = false;
            if(except !== 'wealth') showWealthPanel.value = false;
            if(except !== 'toolbox') showToolboxPanel.value = false;
            if(except !== 'star') showStarStudentPanel.value = false;
            if(except !== 'messages') showAllMessagesPanel.value = false;
            if(except !== 'profile') showProfileEditPanel.value = false;
            if(except !== 'wechat') showWechatBindPanel.value = false; // [NEW]
        };

        watch(showToolboxPanel, (val) => { if(val) closeAllPanels('toolbox'); });
        watch(showWealthPanel, (val) => { if(val) closeAllPanels('wealth'); });
        watch(showStarStudentPanel, (val) => { if(val) closeAllPanels('star'); });
        watch(showAllMessagesPanel, (val) => { if(val) closeAllPanels('messages'); });
        watch(showCardPanel, (val) => { if(val) closeAllPanels('card'); });
        watch(showTaskPanel, (val) => { if(val) closeAllPanels('task'); });
        watch(showProfileEditPanel, (val) => { if(val) closeAllPanels('profile'); });
        watch(showWechatBindPanel, (val) => { if(val) closeAllPanels('wechat'); }); // [NEW]

        const toggleTaskPanel = () => { 
            showTaskPanel.value = !showTaskPanel.value; 
            if(showTaskPanel.value) closeAllPanels('task'); 
        };
        const toggleCardPanel = () => { 
            showCardPanel.value = !showCardPanel.value; 
            if(showCardPanel.value) closeAllPanels('card'); 
        };

        watch(currentView, () => closeAllPanels());

        // ================= 资产详情逻辑 =================
        const currencyConfig = {
            '积分': { icon: 'fa-solid fa-gem', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
            '码豆': { icon: 'fa-solid fa-seedling', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            '活跃点': { icon: 'fa-solid fa-fire', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
            '天梯币': { icon: 'fa-solid fa-trophy', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
            '荣誉点': { icon: 'fa-solid fa-medal', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' }
        };

        const currencyModal = ref({ open: false, type: '', balance: 0, totalEarned: 0, totalUsed: 0, history: [] });

        const openCurrencyDetail = (type) => {
            const balance = user.value.currencies[type];
            const history = [];
            let used = 0;
            let earned = 0;
            const actions = [
                { name: '每日签到', amount: 10, type: 'in' }, { name: '完成作业', amount: 50, type: 'in' },
                { name: '天梯获胜', amount: 30, type: 'in' }, { name: '兑换礼品', amount: -200, type: 'out' },
                { name: '预约座位', amount: -20, type: 'out' }, { name: '系统奖励', amount: 100, type: 'in' }
            ];
            for (let i = 0; i < 15; i++) {
                const action = actions[Math.floor(Math.random() * actions.length)];
                const amount = action.amount;
                if (amount > 0) earned += amount; else used += Math.abs(amount);
                history.push({
                    id: i, desc: action.name, time: new Date(Date.now() - i * 86400000).toLocaleDateString(),
                    amount: amount > 0 ? `+${amount}` : `${amount}`, isIncome: amount > 0
                });
            }
            currencyModal.value = {
                open: true, type: type, balance: balance,
                totalEarned: balance + used + Math.floor(Math.random() * 500),
                totalUsed: used + Math.floor(Math.random() * 200), history: history
            };
        };

        const closeCurrencyModal = () => { currencyModal.value.open = false; };

        // ================= 2. 计算属性 =================
        const pageTitle = computed(() => {
            if (isImmersiveMode.value) return '沉浸专注模式';
            if(currentView.value === 'dashboard') return '学习中心';
            if(currentView.value === 'gift-home') return '礼品兑换中心';
            if(currentView.value === 'calendar-home') return '学习日历';
            if(currentView.value === 'exam-center') return '考试中心';
            if(currentView.value === 'honor-home') return '荣誉中心';
            if(currentView.value === 'special-course-home') return '专题课程';
            if(currentView.value === 'knowledge-home') return '知识百科';
            if(currentView.value === 'cpp-home') return 'C++ 核心';
            if(currentView.value === 'cloud-home' || currentView.value.startsWith('cloud-')) return '云课堂';
            if(currentView.value === 'ladder-home') return '天梯训练';
            if(currentView.value === 'competition-home') return '竞赛中心'; 
            if(currentView.value === 'scratch-creative') return 'Scratch 创意中心';
            if(currentView.value === 'scratch-personal') return 'Scratch 个人课堂';
            if(currentView.value === 'scratch-team') return 'Scratch 团队课堂';
            return '系统';
        });

        // ================= 3. 方法 =================
        const showToast = (msg, type='info') => { 
            sysToast.value={show:true, message:msg}; 
            setTimeout(()=>sysToast.value.show=false, 3000); 
        };

        // [NEW] 处理用户信息更新
        const handleUpdateUser = (newData) => {
            Object.assign(user.value, newData);
        };

        const activateWeekCard = (cardId) => {
            const hasActiveWeek = user.value.cards.some(c => c.type === 'week' && c.status === 'active' && new Date(c.validUntil) > new Date());
            if (hasActiveWeek) { showToast('当前已有激活的周卡', 'error'); return; }
            const card = user.value.cards.find(c => c.id === cardId);
            if (!card) return;
            openModal('confirm', '激活确认', `确定要激活“${card.name}”吗？`).then((confirmed) => {
                if (confirmed) {
                    const now = new Date();
                    card.status = 'active'; card.activatedAt = now.toLocaleDateString();
                    card.validUntil = new Date(now.getTime() + 7 * 86400000).toLocaleDateString();
                    showToast('周卡激活成功！', 'success');
                }
            });
        };
        
        const openModal = (type, title, message, defaultValue = '') => {
            return new Promise((resolve, reject) => {
                sysModal.value = { open: true, type, title, message, inputValue: defaultValue, resolve, reject };
                if (type === 'prompt') { nextTick(() => { const inputEl = document.getElementById('sys-modal-input'); if (inputEl) inputEl.focus(); }); }
            });
        };

        const showConfirm = (msg) => openModal('confirm', '确认', msg);
        
        const handleModalConfirm = () => { 
            const { resolve, inputValue, type } = sysModal.value;
            if (resolve) { if (type === 'prompt') resolve(inputValue); else resolve(true); }
            sysModal.value.open = false; 
        };

        const handleModalCancel = () => { 
            const { resolve, reject, type } = sysModal.value;
            sysModal.value.open = false;
            if (type === 'prompt') { if (resolve) resolve(null); } else { if (reject) reject(); }
        };
        
        const handleGlobalModal = (payload) => {
            const { type, title, message, defaultValue, callback } = payload;
            openModal(type, title, message, defaultValue).then((result) => { if (callback) callback(result); }).catch(() => { if (callback && type === 'confirm') callback(false); });
        };
        const logout = () => { showConfirm('确定要退出登录吗?').then(() => showToast('已退出登录', 'success')).catch(() => {}); };

        const handleBlurEvent = () => {
            if (!isImmersiveMode.value) return;
            cheatWarnings.value++;
            const remaining = 5 - cheatWarnings.value;
            if (remaining <= 0) {
                showToast('专注度检测：多次切屏，系统已自动交卷/结束任务！', 'error');
                toggleImmersiveMode(false);
            } else {
                showToast(`⚠️ 警告：检测到切屏行为！请保持专注！(剩余机会: ${remaining})`, 'warning');
            }
        };
        
        const toggleImmersiveMode = (active = true) => {
            const shouldBeActive = active === true;

            if (shouldBeActive) {
                if (workspaceTabs.value.length > 0) {
                    workspaceTabs.value = []; isWorkspaceVisible.value = false;
                    showToast('进入专注模式，已清理无关窗口', 'info');
                }
                isImmersiveMode.value = true; 
                cheatWarnings.value = 0;
                window.addEventListener('blur', handleBlurEvent);
            } else {
                isImmersiveMode.value = false; 
                window.removeEventListener('blur', handleBlurEvent);
                cheatWarnings.value = 0;
            }
        };

        // Navigation (Keep as is)
        const enterCppCore = (tab = 'notes') => { cppCoreActiveTab.value = tab; currentView.value = 'cpp-home'; };
        const enterCloudClassroom = () => { currentView.value = 'cloud-home'; };
        const enterLadder = (type) => { 
            if (type === 'history') { ladderViewMode.value = 'history'; } 
            else { activeLadderType.value = type; ladderViewMode.value = 'home'; }
            currentView.value = 'ladder-home'; 
        };
        const enterCompetition = () => { currentView.value = 'competition-home'; };
        const enterExamCenter = () => { currentView.value = 'exam-center'; };
        const enterHonor = () => { currentView.value = 'honor-home'; };
        const enterSpecialCourse = () => { currentView.value = 'special-course-home'; };
        const enterKnowledge = () => { currentView.value = 'knowledge-home'; };
        const enterScratch = (section) => { 
            if (section === 'creative') currentView.value = 'scratch-creative';
            else if (section === 'personal') currentView.value = 'scratch-personal';
            else if (section === 'team') currentView.value = 'scratch-team';
            else showToast(`未知模块: ${section}`, 'error'); 
        };
        const enterCalendar = () => { currentView.value = 'calendar-home'; };
        const enterGift = () => { currentView.value = 'gift-home'; };
        // 数据中心
        const enterDataCenter = () => { currentView.value = 'data-center'; };
        const goBack = () => { currentView.value = 'dashboard'; };

        const handleRedeemGift = ({ gift, callback }) => {
            try {
                for (const [currency, cost] of Object.entries(gift.price)) {
                    if (user.value.currencies[currency] >= cost) { user.value.currencies[currency] -= cost; } else { throw new Error('余额不足'); }
                }
                callback(true);
            } catch (e) { callback(false); }
        };

        const openCodingProblem = (task) => { 
            const existingIndex = workspaceTabs.value.findIndex(t => t.id === task.id);
            if (existingIndex !== -1) { activeTabIndex.value = existingIndex; } 
            else {
                const newTask = { ...task }; 
                if (!newTask.code) newTask.code = newTask.initialCode || `// ${newTask.title}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`;
                workspaceTabs.value.push(newTask);
                activeTabIndex.value = workspaceTabs.value.length - 1;
            }
            isWorkspaceVisible.value = true;
        };
        const closeWorkspaceTab = (index) => {
            workspaceTabs.value.splice(index, 1);
            if (activeTabIndex.value >= workspaceTabs.value.length) activeTabIndex.value = Math.max(0, workspaceTabs.value.length - 1);
            if (workspaceTabs.value.length === 0) isWorkspaceVisible.value = false;
        };
        const minimizeWorkspace = () => { isWorkspaceVisible.value = false; showToast('工作台已挂起', 'info'); };
        const restoreWorkspace = () => { if (workspaceTabs.value.length > 0) isWorkspaceVisible.value = true; };
        const saveCode = (task) => { setTimeout(() => { showToast(`《${task.title}》保存成功`, 'success'); }, 500); };
        const toggleChat = () => chatOpen.value = !chatOpen.value;
        const getTaskTips = () => showToast('AI 正在思考...', 'info');
        const handleGlobalKeydown = (e) => { 
             if (e.ctrlKey && e.key === 's') { e.preventDefault(); showToast('全局保存触发', 'success'); }
        };
        
        onMounted(() => window.addEventListener('keydown', handleGlobalKeydown));
        onUnmounted(() => window.removeEventListener('keydown', handleGlobalKeydown));

        return {
            user, learningTasks, currentView, pageTitle, 
            cppCoreActiveTab, activeLadderType, ladderViewMode,
            isImmersiveMode, toggleImmersiveMode,
            enterCppCore, enterCloudClassroom, enterLadder, enterCompetition, enterExamCenter, enterScratch, enterCalendar, enterGift, enterDataCenter,enterHonor, enterSpecialCourse, enterKnowledge, goBack,
            handleRedeemGift, activateWeekCard,
            sysModal, sysToast, handleModalConfirm, handleModalCancel, handleGlobalModal, logout,
            workspaceTabs, activeTabIndex, isWorkspaceVisible,
            openCodingProblem, closeWorkspaceTab, minimizeWorkspace, restoreWorkspace, saveCode,
            chatOpen, toggleChat, getTaskTips, handleGlobalKeydown,
            showTaskPanel, toggleTaskPanel, unreadCount, showCardPanel, toggleCardPanel, 
            showWealthPanel, showToolboxPanel, showStarStudentPanel, showAllMessagesPanel, showProfileEditPanel, showWechatBindPanel, // [NEW]
            handleNotificationRead, teacherNotifications, systemMessages, notificationTab, teacherUnread, systemUnread, closeAllPanels,
            markMessageAsRead, markAllRead, deleteMessage, openNotificationCenter, handleUpdateUser, 
            currencyConfig, currencyModal, openCurrencyDetail, closeCurrencyModal,
            activeCards, inactiveCards
        };
    }
}).mount('#app');