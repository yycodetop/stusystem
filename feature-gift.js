// ==========================================
// 模块名称：礼品兑换中心 (Feature Gift)
// 版本：V3.4 (UI迭代：走马灯 Carousel 模式 + 极简图片展示)
// ==========================================

const GiftFeature = {
    props: ['user'],
    emits: ['show-toast', 'redeem-gift', 'go-back'], 
    
    template: `
    <div class="h-full flex flex-col gap-4 animate-fade-in-up relative">
        
        <!-- 顶部 Header -->
        <header class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm shrink-0 flex justify-between items-center relative overflow-hidden z-10">
            <div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-pink-50 to-transparent pointer-events-none"></div>
            <i class="fa-solid fa-gift absolute -right-6 -bottom-6 text-8xl text-pink-100 pointer-events-none transform rotate-12"></i>

            <div class="relative z-10">
                <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <i class="fa-solid fa-store text-pink-500"></i> 礼品兑换中心
                </h2>
                <p class="text-slate-500 text-xs mt-1">努力学习赚取积分，海量好礼等你拿！</p>
            </div>

            <div class="flex bg-slate-100 p-1 rounded-lg relative z-10">
                <button @click="view = 'shop'" class="px-4 py-1.5 rounded-md text-xs font-bold transition-all" 
                    :class="view === 'shop' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                    <i class="fa-solid fa-bag-shopping mr-1"></i> 兑换广场
                </button>
                <button @click="view = 'history'" class="px-4 py-1.5 rounded-md text-xs font-bold transition-all"
                    :class="view === 'history' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
                    <i class="fa-solid fa-clock-rotate-left mr-1"></i> 兑换记录
                </button>
            </div>
        </header>

        <!-- 资产概览条 -->
        <div class="flex items-center gap-4 px-2 shrink-0 overflow-x-auto no-scrollbar z-10">
            <span class="text-xs font-bold text-slate-400 uppercase">My Wallet:</span>
            <div v-for="(amount, type) in user.currencies" :key="type" class="bg-white border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm whitespace-nowrap">
                <span class="size-5 rounded-full flex items-center justify-center text-[10px]" :class="currencyConfig[type]?.bg || 'bg-slate-100'">
                    <i :class="currencyConfig[type]?.icon || 'fa-solid fa-coins'" :class="currencyConfig[type]?.color || 'text-slate-500'"></i>
                </span>
                <span class="text-xs font-bold text-slate-700">{{ amount }}</span>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-hidden relative z-0">
            
            <!-- 视图 A: 兑换广场 -->
            <div v-if="view === 'shop'" class="h-full flex flex-col animate-fade-in">
                <!-- 搜索与筛选 -->
                <div class="flex justify-between items-center mb-4 px-2 shrink-0">
                    <div class="relative w-64">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input v-model="searchQuery" type="text" placeholder="搜索礼品..." class="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-pink-500 transition">
                    </div>
                    <!-- 分页器 -->
                    <div v-if="totalPages > 1" class="flex items-center gap-2">
                        <button @click="changePage(-1)" :disabled="currentPage === 1" class="size-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pink-600 disabled:opacity-50 transition"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                        <span class="text-xs font-mono text-slate-500">{{ currentPage }} / {{ totalPages }}</span>
                        <button @click="changePage(1)" :disabled="currentPage === totalPages" class="size-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pink-600 disabled:opacity-50 transition"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                    </div>
                </div>

                <!-- 商品网格 -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <div v-for="gift in paginatedGifts" :key="gift.id" class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col">
                            <!-- 商品图 -->
                            <div class="h-32 bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors cursor-pointer" @click="openQuickView(gift)">
                                <img :src="gift.image" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt="Gift">
                                <div v-if="gift.stock <= 5" class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                    仅剩 {{ gift.stock }}
                                </div>
                                <!-- 悬浮提示 -->
                                <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <span class="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm text-slate-700 transform translate-y-2 group-hover:translate-y-0 transition">查看</span>
                                </div>
                            </div>
                            
                            <!-- 信息区 -->
                            <div class="p-3 flex-1 flex flex-col">
                                <div class="mb-1">
                                    <span v-for="tag in gift.tags" :key="tag" class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-1">{{ tag }}</span>
                                </div>
                                <h3 class="font-bold text-slate-800 text-sm mb-2 line-clamp-1 cursor-pointer hover:text-pink-600 transition" :title="gift.name" @click="openQuickView(gift)">{{ gift.name }}</h3>
                                
                                <div class="space-y-1 mb-3">
                                    <div v-for="(cost, type) in gift.price" :key="type" class="flex items-center gap-1.5 text-xs">
                                        <i :class="getCurrencyIcon(type)" class="text-[10px]"></i>
                                        <span class="font-bold" :class="checkAfford(type, cost) ? 'text-slate-600' : 'text-red-500'">{{ cost }}</span>
                                        <span class="text-[10px] text-slate-400">{{ type }}</span>
                                    </div>
                                </div>

                                <button @click="openQuickView(gift)" 
                                        :disabled="gift.stock === 0"
                                        class="mt-auto w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm border border-transparent"
                                        :class="gift.stock > 0 ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'">
                                    <i class="fa-solid fa-gift"></i> {{ gift.stock > 0 ? '立即兑换' : '已售罄' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 视图 B: 历史记录 -->
            <div v-else-if="view === 'history'" class="h-full flex flex-col animate-fade-in px-2">
                <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
                            <tr>
                                <th class="p-4 rounded-tl-lg">礼品名称</th>
                                <th class="p-4">消耗</th>
                                <th class="p-4">兑换时间</th>
                                <th class="p-4">状态</th>
                                <th class="p-4 rounded-tr-lg">物流/备注</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm bg-white">
                            <tr v-if="history.length === 0">
                                <td colspan="5" class="p-8 text-center text-slate-400">暂无兑换记录</td>
                            </tr>
                            <tr v-for="item in history" :key="item.id" class="border-b border-slate-50 hover:bg-slate-50 transition">
                                <td class="p-4 font-medium text-slate-700 flex items-center gap-3">
                                    <img :src="item.image" class="size-8 rounded object-cover bg-slate-100">
                                    {{ item.name }}
                                </td>
                                <td class="p-4">
                                    <div class="flex flex-col gap-0.5">
                                        <span v-for="(cost, type) in item.price" :key="type" class="text-xs text-slate-500">
                                            -{{ cost }} {{ type }}
                                        </span>
                                    </div>
                                </td>
                                <td class="p-4 text-slate-500 text-xs">{{ item.time }}</td>
                                <td class="p-4">
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border" :class="getStatusStyle(item.status)">
                                        {{ item.statusText }}
                                    </span>
                                </td>
                                <td class="p-4 text-xs text-slate-400 font-mono">
                                    {{ item.trackingNumber || '-' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ==================== 走马灯 (Carousel) 兑换弹窗 ==================== -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="quickViewGift" class="fixed inset-0 z-30 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 transition-all overflow-hidden" @click.self="closeQuickView">
                    
                    <!-- 走马灯容器 -->
                    <div class="flex items-center justify-center w-full max-w-6xl gap-4 md:gap-8 lg:gap-12 relative">
                        
                        <!-- 左侧：上一件商品 (Ghost Card) -->
                        <div v-if="prevGift" 
                             class="hidden md:block w-32 md:w-48 lg:w-56 shrink-0 opacity-40 hover:opacity-90 hover:scale-105 transition-all duration-300 cursor-pointer transform translate-x-4 md:translate-x-0 z-0 select-none"
                             @click="navigateGift(-1)">
                            <div class="bg-white/10 rounded-2xl p-2 border border-white/10 backdrop-blur-sm">
                                <img :src="prevGift.image" class="w-full h-24 md:h-32 object-cover rounded-xl bg-slate-800 shadow-lg">
                                <div class="mt-2 text-center text-white/60 text-xs font-bold truncate px-1">{{ prevGift.name }}</div>
                            </div>
                        </div>
                        <div v-else class="hidden md:block w-32 md:w-48 lg:w-56 shrink-0"></div> <!-- 占位符 -->

                        <!-- 中间：主卡片 (Active Card) -->
                        <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-scale-in z-20 mx-auto border border-white/20">
                            
                            <!-- 移动端左右切换箭头 (仅在手机显示) -->
                            <button @click="navigateGift(-1)" :disabled="!hasPrev" 
                                    class="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full size-8 flex items-center justify-center z-30 backdrop-blur disabled:opacity-0 transition">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <button @click="navigateGift(1)" :disabled="!hasNext" 
                                    class="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full size-8 flex items-center justify-center z-30 backdrop-blur disabled:opacity-0 transition">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>

                            <!-- 左侧：图片区 (45%) -->
                            <div class="w-full md:w-[45%] bg-slate-50 relative h-56 md:h-auto flex items-center justify-center overflow-hidden">
                                <img :src="quickViewGift.image" class="w-full h-full object-cover md:absolute md:inset-0 hover:scale-110 transition duration-700">
                                <!-- 极简库存标签 -->
                                <div class="absolute top-4 left-4">
                                    <span class="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        <i class="fa-solid fa-cubes text-slate-400"></i> 库存 {{ quickViewGift.stock }}
                                    </span>
                                </div>
                            </div>

                            <!-- 右侧：详情与操作 (55%) -->
                            <div class="flex-1 p-6 md:p-8 flex flex-col bg-white">
                                <!-- 头部信息 -->
                                <div class="mb-6">
                                    <div class="flex justify-between items-start mb-2">
                                        <div class="flex flex-wrap gap-2">
                                            <span v-for="tag in quickViewGift.tags" :key="tag" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wide">{{ tag }}</span>
                                        </div>
                                        <button @click="closeQuickView" class="text-slate-300 hover:text-slate-500 transition -mr-2 -mt-2 p-2">
                                            <i class="fa-solid fa-xmark text-xl"></i>
                                        </button>
                                    </div>
                                    <h2 class="text-2xl font-black text-slate-800 leading-tight mb-2">{{ quickViewGift.name }}</h2>
                                    <div class="flex items-center gap-2 text-xs text-slate-400">
                                        <span>Item #{{ quickViewGift.id }}</span>
                                        <span class="w-px h-3 bg-slate-200"></span>
                                        <span>{{ currentGiftIndex + 1 }} / {{ filteredGifts.length }}</span>
                                    </div>
                                </div>

                                <!-- 价格清单 -->
                                <div class="bg-slate-50 rounded-2xl p-5 mb-auto border border-slate-100">
                                    <p class="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center gap-1">
                                        <i class="fa-solid fa-receipt"></i> 支付明细
                                    </p>
                                    <div class="space-y-3">
                                        <div v-for="(cost, type) in quickViewGift.price" :key="type" class="flex items-center justify-between text-sm group">
                                            <div class="flex items-center gap-3 text-slate-600">
                                                <span class="size-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs shadow-sm">
                                                    <i :class="getCurrencyIcon(type)" :class="currencyConfig[type]?.color"></i>
                                                </span>
                                                <span class="font-medium">{{ type }}</span>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="font-bold font-mono text-slate-800 text-lg">-{{ cost }}</span>
                                                <i v-if="checkAfford(type, cost)" class="fa-solid fa-check text-green-500 text-sm" title="余额充足"></i>
                                                <i v-else class="fa-solid fa-circle-exclamation text-red-500 text-sm animate-pulse" title="余额不足"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 操作按钮 -->
                                <div class="mt-8">
                                    <button @click="confirmRedeemAction" 
                                            :disabled="quickViewGift.stock === 0"
                                            class="w-full py-3.5 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 duration-200"
                                            :class="quickViewGift.stock > 0 ? 'bg-pink-500 text-white shadow-pink-200 hover:bg-pink-600 hover:-translate-y-1' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'">
                                        <i class="fa-solid fa-gift text-lg"></i> 
                                        {{ quickViewGift.stock > 0 ? '确认兑换' : '暂时缺货' }}
                                    </button>
                                    <div class="mt-3 text-[10px] text-slate-400 text-center font-mono hidden md:block opacity-60">
                                        ← 按左右方向键切换商品 →
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 右侧：下一件商品 (Ghost Card) -->
                        <div v-if="nextGift" 
                             class="hidden md:block w-32 md:w-48 lg:w-56 shrink-0 opacity-40 hover:opacity-90 hover:scale-105 transition-all duration-300 cursor-pointer transform -translate-x-4 md:translate-x-0 z-0 select-none"
                             @click="navigateGift(1)">
                            <div class="bg-white/10 rounded-2xl p-2 border border-white/10 backdrop-blur-sm">
                                <img :src="nextGift.image" class="w-full h-24 md:h-32 object-cover rounded-xl bg-slate-800 shadow-lg">
                                <div class="mt-2 text-center text-white/60 text-xs font-bold truncate px-1">{{ nextGift.name }}</div>
                            </div>
                        </div>
                        <div v-else class="hidden md:block w-32 md:w-48 lg:w-56 shrink-0"></div> <!-- 占位符 -->

                    </div>
                </div>
            </transition>
        </Teleport>

    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, onMounted, onUnmounted } = Vue;

        const view = ref('shop');
        const searchQuery = ref('');
        const currentPage = ref(1);
        const pageSize = 10;
        
        const quickViewGift = ref(null);

        // 货币配置
        const currencyConfig = {
            '积分': { icon: 'fa-solid fa-coins', color: 'text-yellow-500', bg: 'bg-yellow-100' },
            '码豆': { icon: 'fa-solid fa-cookie-bite', color: 'text-orange-500', bg: 'bg-orange-100' },
            '活跃点': { icon: 'fa-solid fa-fire', color: 'text-red-500', bg: 'bg-red-100' },
            '天梯币': { icon: 'fa-solid fa-trophy', color: 'text-indigo-500', bg: 'bg-indigo-100' },
            '荣誉点': { icon: 'fa-solid fa-medal', color: 'text-purple-500', bg: 'bg-purple-100' }
        };

        const gifts = ref([
            { id: 1, name: '机械键盘 Keychron K3', price: { '积分': 12000, '荣誉点': 5 }, stock: 3, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80', tags: ['数码', '限量'] },
            { id: 2, name: 'Scratch 编程积木套件', price: { '积分': 5000 }, stock: 20, image: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&q=80', tags: ['教具'] },
            { id: 3, name: '高清护眼台灯', price: { '积分': 3000, '活跃点': 500 }, stock: 15, image: 'https://images.unsplash.com/photo-1533280385001-c32ff4cb760b?w=500&q=80', tags: ['生活'] },
            { id: 4, name: 'C++ 算法竞赛经典书籍', price: { '积分': 1500 }, stock: 50, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80', tags: ['书籍'] },
            { id: 5, name: '10元 话费充值卡', price: { '积分': 1000 }, stock: 100, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=500&q=80', tags: ['虚拟'] },
            { id: 6, name: '专属限定皮肤：赛博朋克', price: { '天梯币': 500 }, stock: 999, image: 'https://images.unsplash.com/photo-1535378437323-9528869de713?w=500&q=80', tags: ['虚拟', '皮肤'] },
            { id: 7, name: 'Python 入门视频课', price: { '码豆': 2000 }, stock: 999, image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80', tags: ['课程'] },
            { id: 8, name: '极客双肩包', price: { '积分': 4500 }, stock: 8, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', tags: ['周边'] },
        ]);

        const history = ref([
            { id: 101, name: 'C++ 算法竞赛经典书籍', price: {'积分': 1500}, time: '2024-10-20 14:30', status: 'shipped', statusText: '已发货', trackingNumber: 'SF1024888', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80' }
        ]);

        // Logic
        const filteredGifts = computed(() => {
            if (!searchQuery.value) return gifts.value;
            return gifts.value.filter(g => g.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
        });

        const totalPages = computed(() => Math.ceil(filteredGifts.value.length / pageSize));
        const paginatedGifts = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredGifts.value.slice(start, start + pageSize);
        });

        const changePage = (delta) => {
            const newVal = currentPage.value + delta;
            if (newVal >= 1 && newVal <= totalPages.value) currentPage.value = newVal;
        };

        const getCurrencyIcon = (type) => currencyConfig[type]?.icon || 'fa-solid fa-coins';
        
        const checkAfford = (type, cost) => (props.user.currencies[type] || 0) >= cost;

        // --- Quick View Logic ---
        const openQuickView = (gift) => {
            quickViewGift.value = gift;
        };

        const closeQuickView = () => {
            quickViewGift.value = null;
        };

        const currentGiftIndex = computed(() => {
            if (!quickViewGift.value) return -1;
            return filteredGifts.value.findIndex(g => g.id === quickViewGift.value.id);
        });

        const hasPrev = computed(() => currentGiftIndex.value > 0);
        const hasNext = computed(() => currentGiftIndex.value !== -1 && currentGiftIndex.value < filteredGifts.value.length - 1);

        // 新增：前后商品数据 Computed
        const prevGift = computed(() => {
            if (!hasPrev.value) return null;
            return filteredGifts.value[currentGiftIndex.value - 1];
        });
        
        const nextGift = computed(() => {
            if (!hasNext.value) return null;
            return filteredGifts.value[currentGiftIndex.value + 1];
        });

        const navigateGift = (step) => {
            const newIdx = currentGiftIndex.value + step;
            if (newIdx >= 0 && newIdx < filteredGifts.value.length) {
                quickViewGift.value = filteredGifts.value[newIdx];
            }
        };

        const handleKeydown = (e) => {
            if (!quickViewGift.value) return;
            if (e.key === 'ArrowLeft' && hasPrev.value) navigateGift(-1);
            if (e.key === 'ArrowRight' && hasNext.value) navigateGift(1);
            if (e.key === 'Escape') closeQuickView();
        };

        onMounted(() => window.addEventListener('keydown', handleKeydown));
        onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

        const confirmRedeemAction = () => {
            const gift = quickViewGift.value;
            if (!gift) return;

            for (const [currency, cost] of Object.entries(gift.price)) {
                if (!checkAfford(currency, cost)) {
                    emit('show-toast', `${currency} 余额不足`, 'error');
                    return;
                }
            }

            emit('redeem-gift', { 
                gift: gift, 
                callback: (success) => {
                    if (success) {
                        gift.stock--;
                        history.value.unshift({
                            id: Date.now(),
                            name: gift.name,
                            image: gift.image,
                            time: new Date().toLocaleString(),
                            price: gift.price,
                            status: 'pending',
                            statusText: '待发货',
                            trackingNumber: null
                        });
                        emit('show-toast', '兑换成功！', 'success');
                        closeQuickView();
                        view.value = 'history';
                    } else {
                        emit('show-toast', '兑换失败，请重试', 'error');
                    }
                }
            });
        };

        const getStatusStyle = (status) => {
            if (status === 'completed') return 'bg-green-100 text-green-600 border-green-200';
            if (status === 'shipped') return 'bg-blue-100 text-blue-600 border-blue-200';
            return 'bg-orange-100 text-orange-600 border-orange-200';
        };

        return {
            view, gifts, history, searchQuery, filteredGifts, 
            currentPage, totalPages, pageSize, paginatedGifts, changePage,
            currencyConfig, getCurrencyIcon, checkAfford, getStatusStyle,
            // Quick View Related
            quickViewGift, openQuickView, closeQuickView, navigateGift, 
            hasPrev, hasNext, currentGiftIndex, confirmRedeemAction,
            prevGift, nextGift // Exported for template
        };
    }
};

window.GiftFeature = GiftFeature;