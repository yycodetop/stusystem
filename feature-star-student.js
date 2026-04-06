const StarStudentFeature = {
    props: ['user'],
    template: `
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl animate-fade-in text-white overflow-hidden">
        <!-- 背景动效 -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow"></div>
            <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[100px] rounded-full"></div>
            <div class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-amber-500/10 blur-[100px] rounded-full"></div>
            <div class="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-purple-600/20 blur-[100px] rounded-full"></div>
        </div>

        <!-- 关闭按钮 -->
        <button @click="$emit('close')" class="absolute top-6 right-8 z-50 text-slate-400 hover:text-white transition-colors duration-300 group">
            <div class="flex flex-col items-center">
                <span class="text-3xl group-hover:rotate-90 transition-transform duration-300">×</span>
                <span class="text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
            </div>
        </button>

        <!-- 主容器 -->
        <div class="relative z-10 w-full max-w-7xl h-full max-h-[95vh] grid grid-cols-12 gap-6 p-6">
            
            <!-- 【左侧区域】 (占比 4/12) -->
            <div class="col-span-12 lg:col-span-4 flex flex-col gap-4 animate-slide-in-left h-full overflow-hidden">
                
                <!-- 1. 头部标题 -->
                <div class="shrink-0">
                    <h1 class="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 flex items-baseline gap-3">
                        星耀学员 <span class="text-lg text-indigo-200/50 font-normal font-sans not-italic tracking-widest">STAR STUDENT</span>
                    </h1>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono font-bold">
                            <i class="fa-regular fa-calendar-check mr-1"></i>
                            2025.06.01 - 2026.05.30
                        </span>
                    </div>
                </div>

                <!-- 2. 个人年度评分卡 -->
                <div class="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/10 p-6 shrink-0 relative overflow-hidden group hover:bg-slate-800/60 transition-colors">
                    <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-6xl"><i class="fa-solid fa-medal"></i></div>
                    
                    <div class="flex items-center gap-5">
                        <div class="relative size-20 shrink-0">
                            <img :src="user.avatar" class="size-20 rounded-full border-4 border-amber-400/30 object-cover shadow-2xl">
                            <div class="absolute -bottom-1 -right-1 size-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900 text-[10px] font-bold">
                                Lv.{{ user.level }}
                            </div>
                        </div>
                        <div>
                            <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">年度综合评分</div>
                            <div class="text-4xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                                {{ animatedScore.toFixed(0) }}
                            </div>
                            <div class="text-amber-400 text-xs font-bold mt-1 flex items-center gap-1">
                                <span class="bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    {{ currentTier.name }}
                                </span>
                                <span class="text-slate-400">|</span>
                                <span>击败 {{ beatPercentage }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. 左下角：综合面板 (评分构成 + 权益风琴) -->
                <div class="flex-1 bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-white/5 flex flex-col overflow-hidden relative">
                    
                    <!-- [NEW] 评分构成明细 (置于权益上方) -->
                    <div class="p-4 bg-slate-900/40 border-b border-white/5 shrink-0">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <i class="fa-solid fa-chart-pie"></i> 我的评分构成
                            </span>
                            <span class="text-[9px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                                Weighted
                            </span>
                        </div>
                        <div class="grid grid-cols-4 gap-2">
                            <div v-for="m in metrics" :key="m.key" 
                                 class="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden group hover:bg-slate-700/50 transition-colors">
                                 <!-- 背景装饰图标 -->
                                 <div class="absolute -right-1 -top-1 opacity-5 text-2xl group-hover:opacity-10 transition-opacity pointer-events-none" :class="m.color">
                                     <i :class="m.icon"></i>
                                 </div>
                                 
                                 <div class="text-[10px] text-slate-500 mb-0.5 scale-90 origin-bottom">{{ m.label }}</div>
                                 <div class="text-sm font-black text-white font-mono leading-none mb-1">{{ m.value }}</div>
                                 <div class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 shadow-inner" :class="m.color">
                                    x{{ m.weight }}
                                 </div>
                            </div>
                        </div>
                    </div>

                    <!-- 权益一览标题 -->
                    <div class="p-4 border-b border-white/5 bg-slate-900/20 shrink-0">
                        <h3 class="text-sm font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-layer-group text-indigo-400"></i> 等级权益一览
                        </h3>
                        <p class="text-[10px] text-slate-500 mt-0.5">点击展开各等级详细奖励方案</p>
                    </div>

                    <!-- 垂直手风琴 (可滚动区域) -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        <div v-for="(tier, index) in allTiers" :key="index" 
                             class="rounded-xl border transition-all duration-300 overflow-hidden"
                             :class="[
                                activeAccordionIndex === index 
                                    ? 'bg-slate-700/40 border-indigo-500/30 shadow-lg' 
                                    : 'bg-slate-800/40 border-transparent hover:bg-slate-700/60 cursor-pointer'
                             ]"
                             @click="toggleAccordion(index)">
                            
                            <!-- 头部 -->
                            <div class="p-3 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="size-8 rounded-lg flex items-center justify-center text-sm transition-colors"
                                         :class="activeAccordionIndex === index ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'">
                                        <i class="fa-solid fa-star" v-if="index === 0"></i>
                                        <i class="fa-solid fa-crown" v-else-if="index === 1"></i>
                                        <i class="fa-solid fa-gem" v-else-if="index === 2"></i>
                                        <i class="fa-solid fa-medal" v-else-if="index === 3"></i>
                                        <i class="fa-solid fa-lightbulb" v-else></i>
                                    </div>
                                    <div>
                                        <div class="text-sm font-bold" :class="tier.color">{{ tier.name }}</div>
                                        <div class="text-[10px] text-slate-500 font-mono">Top {{ tier.top }}%</div>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-down text-xs text-slate-500 transition-transform duration-300"
                                   :class="{'rotate-180': activeAccordionIndex === index}"></i>
                            </div>

                            <!-- 展开内容 -->
                            <div class="grid transition-[grid-template-rows] duration-300 ease-out"
                                 :style="{ 'grid-template-rows': activeAccordionIndex === index ? '1fr' : '0fr' }">
                                <div class="overflow-hidden">
                                    <div class="px-3 pb-4 pt-1 border-t border-white/5 mx-3">
                                        <p class="text-[10px] text-slate-400 mb-3 italic">
                                            "{{ tier.desc }}"
                                        </p>
                                        <div class="space-y-2">
                                            <div v-for="(reward, rIndex) in tier.rewards" :key="rIndex" 
                                                 class="flex items-center gap-2 text-xs text-slate-200 bg-slate-900/50 p-2 rounded-lg border border-white/5">
                                                <i class="fa-solid fa-circle-check text-green-500 text-[10px]"></i>
                                                {{ reward }}
                                            </div>
                                        </div>
                                        <div class="mt-3 text-[10px] text-right" :class="tier.color">
                                            需年度积分 &ge; {{ tier.minScore }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 【右侧区域】年度风云榜 (占比 8/12) -->
            <div class="col-span-12 lg:col-span-8 flex flex-col gap-4 animate-fade-in-up delay-100 h-full overflow-hidden">
                <div class="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-white/10 flex-1 flex flex-col overflow-hidden relative shadow-2xl">
                    
                    <!-- 榜单头部 -->
                    <div class="p-6 border-b border-white/5 bg-slate-900/40 flex justify-between items-end shrink-0">
                        <div>
                            <h3 class="text-2xl font-black text-white flex items-center gap-3">
                                <span class="bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider transform -skew-x-12">Top Rank</span>
                                年度风云榜
                            </h3>
                            <p class="text-sm text-slate-400 mt-2 font-medium">实力见证荣耀 · 积分成就梦想</p>
                        </div>
                        <div class="flex gap-8 text-right">
                            <div>
                                <div class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Participants</div>
                                <div class="text-2xl font-mono font-black text-white">2,845</div>
                            </div>
                            <div>
                                <div class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Avg Score</div>
                                <div class="text-2xl font-mono font-black text-indigo-400">4,120</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 榜单列表 (隐藏滚动条但保留滚动功能) -->
                    <div class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-2">
                        <!-- 表头 -->
                        <div class="grid grid-cols-12 text-xs text-slate-500 px-6 py-2 font-bold uppercase tracking-wider">
                            <div class="col-span-1 text-center">Rank</div>
                            <div class="col-span-4">Student</div>
                            <div class="col-span-3">Tier</div>
                            <div class="col-span-4 text-right">Comprehensive Score</div>
                        </div>

                        <!-- 列表项 -->
                        <div v-for="(ranker, index) in leaderboardData" :key="index" 
                             class="grid grid-cols-12 items-center px-6 py-4 rounded-xl transition-all duration-300 group cursor-default relative overflow-hidden"
                             :class="ranker.isMe ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] z-10' : 'bg-slate-800/20 hover:bg-slate-700/40 border border-transparent hover:border-white/5'">
                            
                            <!-- 排名 -->
                            <div class="col-span-1 flex justify-center relative z-10">
                                <div v-if="index < 3" class="size-8 rounded-lg flex items-center justify-center text-lg font-black shadow-lg transform group-hover:scale-110 transition-transform"
                                     :class="[
                                        index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-600 text-white ring-2 ring-amber-400/30' : 
                                        index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white ring-2 ring-slate-400/30' : 
                                        'bg-gradient-to-br from-orange-300 to-amber-700 text-white ring-2 ring-orange-400/30'
                                     ]">
                                    {{ index + 1 }}
                                </div>
                                <span v-else class="text-lg text-slate-500 font-mono font-bold group-hover:text-white transition-colors">{{ index + 1 }}</span>
                            </div>

                            <!-- 学员信息 -->
                            <div class="col-span-4 flex items-center gap-4 relative z-10">
                                <div class="relative">
                                    <img :src="ranker.avatar" class="size-10 rounded-full border-2 border-slate-700 group-hover:border-white/50 transition-colors object-cover">
                                    <div v-if="index === 0" class="absolute -top-4 -right-2 text-amber-400 text-xl animate-bounce"><i class="fa-solid fa-crown"></i></div>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-base font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-2">
                                        {{ ranker.name }} 
                                        <span v-if="ranker.isMe" class="text-[9px] bg-indigo-500 px-1.5 py-0.5 rounded text-white font-black tracking-wide">ME</span>
                                    </span>
                                    <span class="text-[10px] text-slate-500 group-hover:text-slate-400">ID: {{ 20230000 + index }}</span>
                                </div>
                            </div>

                            <!-- 等级展示 -->
                            <div class="col-span-3 relative z-10">
                                <span class="text-xs px-2 py-1 rounded border font-bold inline-flex items-center gap-1.5 transition-all" 
                                      :class="getTierColor(ranker.score)">
                                    <span class="size-1.5 rounded-full" :class="getTierDotColor(ranker.score)"></span>
                                    {{ getTierName(ranker.score) }}
                                </span>
                            </div>

                            <!-- 分数 -->
                            <div class="col-span-4 text-right relative z-10">
                                <div class="text-xl font-mono font-black tracking-tight" :class="ranker.isMe ? 'text-indigo-300' : 'text-slate-300 group-hover:text-white'">
                                    {{ ranker.score.toLocaleString() }}
                                </div>
                                <!-- 进度条底纹 -->
                                <div class="w-full bg-slate-900/50 h-1 mt-1 rounded-full overflow-hidden ml-auto max-w-[120px]">
                                    <div class="h-full bg-current opacity-50" :style="{ width: (ranker.score / 10000 * 100) + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 底部：我的状态栏 -->
                    <div class="p-4 border-t border-white/10 bg-indigo-900/30 backdrop-blur-xl flex justify-between items-center px-8 shrink-0">
                        <div class="flex items-center gap-4">
                             <div class="size-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                             <div>
                                 <div class="text-sm text-indigo-100 font-bold">我的实时排名</div>
                                 <div class="text-[10px] text-indigo-300/60">数据每小时更新一次</div>
                             </div>
                        </div>
                        <div class="flex items-center gap-8">
                            <div class="text-right">
                                <div class="text-[10px] text-slate-400 uppercase font-bold">Current Score</div>
                                <div class="text-xl font-mono font-black text-white">{{ animatedScore.toFixed(0) }}</div>
                            </div>
                            <div class="text-right pl-8 border-l border-white/10">
                                <div class="text-[10px] text-slate-400 uppercase font-bold">My Rank</div>
                                <div class="text-3xl font-mono font-black text-amber-400">#12</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    `,
    data() {
        return {
            animatedScore: 0,
            activeAccordionIndex: 0, 
            allTiers: [
                { name: '骄阳之星', top: 2, minScore: 9000, color: 'text-rose-400', desc: '至高荣誉，学费全免', rewards: ['平台学费全额减免', '专属荣誉勋章 (实体+虚拟)', '年度盛典VIP席位'] },
                { name: '璀璨之星', top: 5, minScore: 7500, color: 'text-amber-400', desc: '光芒万丈，半价优享', rewards: ['课程5折优惠', '集训5折优惠', '3000积分奖励'] },
                { name: '卓越之星', top: 15, minScore: 5500, color: 'text-purple-400', desc: '出类拔萃，8折特权', rewards: ['课程8折优惠', '集训8折优惠', '2000积分奖励'] },
                { name: '金芒之星', top: 30, minScore: 3500, color: 'text-yellow-300', desc: '熠熠生辉，9折礼遇', rewards: ['课程9折优惠', '集训9折优惠', '1500积分奖励'] },
                { name: '启明之星', top: 60, minScore: 1500, color: 'text-blue-300', desc: '初露锋芒，鼓励前行', rewards: ['课程9.5折优惠', '集训9.5折优惠', '1000积分奖励'] }
            ],
            leaderboardData: [
                { name: '张*豪', score: 9850, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isMe: false },
                { name: '李*彤', score: 9620, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella', isMe: false },
                { name: '王*轩', score: 9300, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', isMe: false },
                { name: '赵*涵', score: 8900, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', isMe: false },
                { name: '陈*宇', score: 8540, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan', isMe: false },
                { name: '刘*希', score: 8200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona', isMe: false },
                { name: '孙*杰', score: 7800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George', isMe: false },
                { name: '吴*凯', score: 7500, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Harry', isMe: false },
                { name: '郑*雅', score: 7200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivy', isMe: false },
                { name: '周*杰', score: 6950, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', isMe: false },
                { name: '林*薇', score: 6800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kathy', isMe: false },
                { name: '周佳缘', score: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', isMe: true }, // 动态更新
                { name: '徐*铭', score: 5500, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', isMe: false },
                { name: '高*欣', score: 5200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia', isMe: false },
                { name: '郭*辰', score: 4800, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah', isMe: false }
            ]
        };
    },
    computed: {
        metrics() {
            return [
                { key: 'honor', label: '荣誉值', value: this.user.currencies['荣誉点'] || 0, weight: '220%', icon: 'fa-solid fa-medal', color: 'text-amber-400' },
                { key: 'activity', label: '活跃度', value: this.user.currencies['活跃点'] || 0, weight: '120%', icon: 'fa-solid fa-fire', color: 'text-rose-400' },
                { key: 'points', label: '积分', value: this.user.currencies['积分'] || 0, weight: '40%', icon: 'fa-solid fa-gem', color: 'text-blue-400' },
                { key: 'ladder', label: '天梯币', value: this.user.currencies['天梯币'] || 0, weight: '40%', icon: 'fa-solid fa-trophy', color: 'text-green-400' }
            ];
        },
        comprehensiveScore() {
            if (!this.user || !this.user.currencies) return 0;

            const honor = (this.user.currencies['荣誉点'] || 0) * 2.2;
            const activity = (this.user.currencies['活跃点'] || 0) * 1.2;
            const points = (this.user.currencies['积分'] || 0) * 0.4;
            const ladder = (this.user.currencies['天梯币'] || 0) * 0.4;
            
            const historyStats = this.user.historyStats || { honor: 0, activity: 0, points: 0, ladder: 0 };
            const historyScore = (historyStats.honor * 0.5) + 
                                 (historyStats.activity * 0.5) + 
                                 ((historyStats.points / 100) * 0.3) + 
                                 ((historyStats.ladder / 100) * 0.3);

            return honor + activity + points + ladder + historyScore;
        },
        currentTier() {
            const score = this.comprehensiveScore;
            return this.allTiers.find(t => score >= t.minScore) || { 
                name: '潜力新星', color: 'text-slate-400', desc: '继续努力，向着星辰大海出发！', rewards: ['暂无等级权益'] 
            };
        },
        beatPercentage() {
            const score = this.comprehensiveScore;
            if (score < 1000) return (score / 2000 * 50).toFixed(1);
            if (score > 10000) return 99.9;
            return (50 + (score - 1000) / 9000 * 49).toFixed(1);
        }
    },
    methods: {
        toggleAccordion(index) {
            this.activeAccordionIndex = index;
        },
        getTierName(score) {
             const tier = this.allTiers.find(t => score >= t.minScore) || { name: '潜力新星' };
             return tier.name;
        },
        getTierColor(score) {
             const tier = this.allTiers.find(t => score >= t.minScore);
             if (tier) {
                 if(tier.name.includes('骄阳')) return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
                 if(tier.name.includes('璀璨')) return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
                 if(tier.name.includes('卓越')) return 'text-purple-300 bg-purple-500/10 border-purple-500/30';
                 if(tier.name.includes('金芒')) return 'text-yellow-200 bg-yellow-500/10 border-yellow-500/30';
                 return 'text-blue-200 bg-blue-500/10 border-blue-500/30';
             }
             return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        },
        getTierDotColor(score) {
             const tier = this.allTiers.find(t => score >= t.minScore);
             if (tier) {
                 if(tier.name.includes('骄阳')) return 'bg-rose-500';
                 if(tier.name.includes('璀璨')) return 'bg-amber-500';
                 if(tier.name.includes('卓越')) return 'bg-purple-500';
                 if(tier.name.includes('金芒')) return 'bg-yellow-400';
                 return 'bg-blue-400';
             }
             return 'bg-slate-500';
        }
    },
    mounted() {
        const target = this.comprehensiveScore;
        const duration = 1500;
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            this.animatedScore = target * ease;
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

        const myEntry = this.leaderboardData.find(i => i.isMe);
        if(myEntry) {
            myEntry.score = Math.floor(this.comprehensiveScore);
            this.leaderboardData.sort((a, b) => b.score - a.score);
        }
    }
};

window.StarStudentFeature = StarStudentFeature;