const WealthRankingFeature = {
    props: ['user', 'currencyConfig'],
    template: `
    <div class="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-2xl flex flex-col animate-fade-in text-white overflow-hidden font-sans">
        
        <!-- 顶部导航栏 -->
        <div class="flex-shrink-0 px-6 py-5 flex justify-between items-center border-b border-white/10 bg-white/5 relative z-20">
            <div class="flex items-center gap-5">
                <div class="size-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-white/10 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <i class="fa-solid fa-ranking-star text-3xl text-white relative z-10"></i>
                </div>
                <div>
                    <h2 class="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">财富风云榜</h2>
                    <p class="text-xs text-amber-400/80 font-bold uppercase tracking-widest mt-1">Global Wealth Leaderboard</p>
                </div>
            </div>
            <button @click="$emit('close')" class="group flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-red-500/20 transition backdrop-blur-md border border-white/10 hover:border-red-500/50">
                <i class="fa-solid fa-xmark text-lg text-slate-400 group-hover:text-red-400 transition"></i>
            </button>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
            
            <!-- ================= 左侧：综合战力榜 (Total Power) ================= -->
            <div class="flex-shrink-0 lg:w-[420px] bg-gradient-to-b from-slate-800/50 to-slate-900/80 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col relative">
                
                <!-- 装饰背景 -->
                <div class="absolute top-0 left-0 w-full h-64 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

                <!-- 顶部：我的战力卡片 -->
                <div class="p-6 flex-shrink-0 relative z-10">
                    <div class="relative rounded-[2rem] p-6 bg-gradient-to-br from-indigo-600 via-purple-700 to-purple-900 shadow-2xl shadow-indigo-900/50 overflow-hidden group border border-white/10 transition-transform hover:scale-[1.02] duration-500">
                        <!-- 动态光效 -->
                        <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:rotate-12 duration-700">
                            <i class="fa-solid fa-bolt text-9xl text-white"></i>
                        </div>
                        <div class="absolute -bottom-10 -left-10 size-40 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-2">
                                    <span class="size-2 rounded-full bg-green-400 animate-pulse"></span>
                                    <span class="text-xs font-bold text-indigo-200 tracking-wider">MY COMBAT POWER</span>
                                </div>
                                <div class="px-2 py-1 rounded bg-black/20 text-[10px] text-white/60 font-mono border border-white/5">
                                    RANK #{{ myTotalRank }}
                                </div>
                            </div>
                            
                            <div class="text-5xl font-black font-mono tracking-tighter text-white mb-2 drop-shadow-md">
                                {{ formatNumber(myTotalScore) }}
                            </div>
                            <div class="flex items-center gap-2 text-xs text-indigo-200/80 bg-black/10 w-fit px-3 py-1.5 rounded-full border border-white/5">
                                <i class="fa-solid fa-scale-balanced"></i>
                                <span>基于资产加权计算综合实力</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 列表标题 -->
                <div class="px-6 pb-2 flex items-center justify-between flex-shrink-0">
                    <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <i class="fa-solid fa-trophy text-amber-500"></i> 综合战力榜 TOP 100
                    </h3>
                    <span class="text-[10px] text-slate-500">实时更新</span>
                </div>

                <!-- 战力排行榜列表 -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-2">
                    <div v-for="(user, index) in totalPowerLeaderboard" :key="user.id" 
                         class="flex items-center p-3 rounded-xl transition border border-transparent hover:border-white/10 group relative overflow-hidden"
                         :class="[
                            isMe(user) ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 hover:bg-white/10',
                            index === 0 ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : ''
                         ]">
                        
                        <!-- 排名 Badge -->
                        <div class="flex-shrink-0 w-10 flex justify-center">
                            <div v-if="index < 3" class="size-8 flex items-center justify-center rounded-lg shadow-lg text-sm font-black transform group-hover:scale-110 transition"
                                 :class="[
                                    index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-white ring-2 ring-amber-500/30' : '',
                                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white ring-2 ring-slate-400/30' : '',
                                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white ring-2 ring-orange-500/30' : ''
                                 ]">
                                {{ index + 1 }}
                            </div>
                            <span v-else class="text-slate-500 font-mono font-bold text-lg">#{{ index + 1 }}</span>
                        </div>

                        <!-- 头像与信息 -->
                        <div class="flex-1 flex items-center gap-3 px-2">
                            <div class="relative">
                                <img :src="user.avatar" class="size-9 rounded-lg border border-white/10 bg-slate-800 object-cover">
                                <div v-if="index === 0" class="absolute -top-3 -right-2 text-amber-400 text-sm animate-bounce">
                                    <i class="fa-solid fa-crown"></i>
                                </div>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-slate-200 truncate max-w-[120px]" :class="isMe(user) ? 'text-indigo-300' : ''">
                                    {{ user.name }}
                                </span>
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] bg-white/10 px-1.5 rounded text-slate-400">Lv.{{ user.level }}</span>
                                    <span v-if="isMe(user)" class="text-[9px] bg-indigo-500 text-white px-1 rounded uppercase tracking-wider">Me</span>
                                </div>
                            </div>
                        </div>

                        <!-- 战力数值 -->
                        <div class="text-right">
                            <div class="font-mono font-black text-sm text-indigo-300 group-hover:text-indigo-200 transition">
                                {{ formatNumber(user.totalScore) }}
                            </div>
                            <div class="text-[9px] text-slate-600">Power</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ================= 右侧：分类资产榜 (Category Ranking) ================= -->
            <div class="flex-1 flex flex-col bg-slate-900/50 relative">
                
                <!-- 顶部 Tabs -->
                <div class="flex-shrink-0 px-6 py-4 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar items-center bg-slate-900/50">
                    <span class="text-xs font-bold text-slate-500 mr-2 hidden md:block">单项排行:</span>
                    <button v-for="(config, key) in currencyConfig" :key="key"
                            @click="currentTab = key"
                            class="relative px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 border overflow-hidden group"
                            :class="currentTab === key ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-200'">
                        <i :class="config.icon" :style="{ color: currentTab === key ? '' : 'inherit' }"></i>
                        {{ key }}
                        <div v-if="currentTab === key" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    </button>
                </div>

                <!-- 榜单列表容器 -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
                    
                    <!-- 榜单表头 -->
                    <div class="grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">
                        <div class="col-span-2 md:col-span-1 text-center">Rank</div>
                        <div class="col-span-6 md:col-span-7">Player Info</div>
                        <div class="col-span-4 text-right">Assets</div>
                    </div>

                    <transition-group name="list" tag="div" class="space-y-3">
                        <div v-for="(rankUser, index) in currentCategoryLeaderboard" :key="rankUser.id" 
                             class="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10 group hover:shadow-xl hover:shadow-black/20"
                             :class="[
                                isMe(rankUser) ? 'bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border-indigo-500/30' : 'bg-white/[0.02] hover:bg-white/[0.06]',
                                index === 0 ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : '',
                             ]">
                            
                            <!-- 排名 -->
                            <div class="col-span-2 md:col-span-1 flex justify-center items-center">
                                <div v-if="index < 3" class="relative">
                                    <i class="fa-solid fa-medal text-3xl drop-shadow-lg"
                                       :class="[
                                          index === 0 ? 'text-amber-400' : '',
                                          index === 1 ? 'text-slate-300' : '',
                                          index === 2 ? 'text-orange-400' : ''
                                       ]"></i>
                                     <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-[10px] font-black text-black/50">{{index+1}}</span>
                                </div>
                                <span v-else class="text-slate-600 font-mono font-bold text-lg group-hover:text-slate-400 transition">#{{ index + 1 }}</span>
                            </div>

                            <!-- 用户 -->
                            <div class="col-span-6 md:col-span-7 flex items-center gap-4">
                                <div class="relative group-hover:scale-105 transition-transform duration-300">
                                    <img :src="rankUser.avatar" class="size-12 rounded-full border-2 border-white/10 bg-slate-800 shadow-md">
                                    <div v-if="index < 3" class="absolute -bottom-1 -right-1 size-5 rounded-full flex items-center justify-center text-[10px] border border-slate-900"
                                         :class="index === 0 ? 'bg-amber-400 text-amber-900' : (index === 1 ? 'bg-slate-300 text-slate-800' : 'bg-orange-400 text-orange-900')">
                                        <i class="fa-solid fa-crown"></i>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="text-base font-bold text-slate-200 group-hover:text-white transition">{{ rankUser.name }}</span>
                                        <span v-if="isMe(rankUser)" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white shadow-lg shadow-indigo-500/40">YOU</span>
                                    </div>
                                    <div class="flex items-center gap-3 text-xs text-slate-500 group-hover:text-slate-400">
                                        <span><i class="fa-solid fa-layer-group text-slate-600 mr-1"></i> Lv.{{ rankUser.level }}</span>
                                        <span class="w-px h-3 bg-white/10"></span>
                                        <span>总战力: {{ formatNumber(rankUser.totalScore) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 数值 -->
                            <div class="col-span-4 text-right flex flex-col justify-center">
                                <div class="text-xl font-black font-mono tracking-tight group-hover:scale-110 transition-transform origin-right" 
                                     :class="getTextColor(currentTab)">
                                    {{ formatNumber(rankUser.value) }}
                                </div>
                                <div class="text-[10px] text-slate-600 uppercase">{{ currentTab }}</div>
                            </div>
                        </div>
                    </transition-group>

                    <!-- Loading / Empty State -->
                    <div v-if="currentCategoryLeaderboard.length === 0" class="text-center py-20 text-slate-500">
                        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 opacity-50"></i>
                        <p class="text-xs">正在计算排名数据...</p>
                    </div>

                    <div class="text-center py-8 text-slate-700 text-xs font-mono">
                        // END OF LEADERBOARD //
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            currentTab: '积分',
            mockUsers: []
        };
    },
    computed: {
        // 计算当前用户（我）的各项数据对象，用于插入到排行榜中
        myUserObject() {
            return {
                id: 'me',
                name: this.user.name,
                level: this.user.level,
                avatar: this.user.avatar,
                currencies: this.user.currencies,
                totalScore: this.calculateScore(this.user.currencies)
            };
        },
        // 我的总战力
        myTotalScore() {
            return this.myUserObject.totalScore;
        },
        // 综合战力总榜 (All Users sorted by Total Score)
        totalPowerLeaderboard() {
            // 合并模拟用户和自己
            let allUsers = [...this.mockUsers, this.myUserObject];
            
            // 去重（防止模拟数据ID冲突，虽然这里模拟的ID是数字，我是'me'）
            const uniqueUsers = Array.from(new Map(allUsers.map(item => [item.id, item])).values());

            // 按总分降序
            return uniqueUsers.sort((a, b) => b.totalScore - a.totalScore);
        },
        // 我在总榜的排名
        myTotalRank() {
            const index = this.totalPowerLeaderboard.findIndex(u => u.id === 'me');
            return index !== -1 ? index + 1 : '-';
        },
        // 当前选中分类的排行榜 (All Users sorted by Specific Currency)
        currentCategoryLeaderboard() {
            let allUsers = [...this.mockUsers, this.myUserObject];
            
            // 映射当前tab的值到 value 字段方便模板渲染
            const mapped = allUsers.map(u => ({
                ...u,
                value: u.currencies[this.currentTab] || 0
            }));

            // 按当前资产值降序，若相同则按等级降序
            return mapped.sort((a, b) => b.value - a.value || b.level - a.level);
        }
    },
    created() {
        this.generateMockData();
    },
    methods: {
        isMe(u) { return u.id === 'me'; },
        formatNumber(num) {
            return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        },
        calculateScore(currencies) {
            // 权重配置
            const weights = { '积分': 1, '码豆': 2, '活跃点': 5, '天梯币': 10, '荣誉点': 100 };
            return Object.entries(currencies).reduce((total, [key, val]) => {
                return total + (val * (weights[key] || 0));
            }, 0);
        },
        getTextColor(type) {
            const colors = {
                '积分': 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]',
                '码豆': 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]',
                '活跃点': 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]',
                '天梯币': 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]',
                '荣誉点': 'text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]'
            };
            return colors[type] || 'text-white';
        },
        generateMockData() {
            const names = ['Alex', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Helen', 'Ivy', 'Jack', 'Kevin', 'Lily', 'Mike', 'Nancy', 'Oscar', 'Paul', 'Queen', 'Rose', 'Steve', 'Tom', 'Zeus', 'Hera', 'Apollo', 'Athena', 'Thor', 'Loki'];
            
            this.mockUsers = Array.from({ length: 80 }, (_, i) => {
                const baseScore = Math.floor(Math.random() * 20000) + 1000;
                // 生成更随机的资产分布
                const currencies = {
                    '积分': baseScore,
                    '码豆': Math.floor(Math.random() * 5000),
                    '活跃点': Math.floor(Math.random() * 1500),
                    '天梯币': Math.floor(Math.random() * 3000),
                    '荣誉点': Math.random() > 0.8 ? Math.floor(Math.random() * 20) : 0 // 只有少数人有荣誉点
                };

                return {
                    id: i,
                    name: names[i % names.length] + (i > 25 ? `_${i}` : ''),
                    level: Math.floor(Math.random() * 12) + 1,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`,
                    currencies: currencies,
                    totalScore: this.calculateScore(currencies) // 预计算总分
                };
            });
        }
    }
};

window.WealthRankingFeature = WealthRankingFeature;