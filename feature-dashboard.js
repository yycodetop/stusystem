// ==========================================
// 模块名称：学生端首页仪表盘 (Feature Dashboard)
// 版本：V18.8 (侧边栏信息流优化版)
// 更新内容：
// 1. [Text] 侧边栏标题更新：“待办任务”->“我的作业”，“日程安排”->“我的预约”。
// 2. [UI] 侧边栏列表布局大幅紧凑化，缩小卡片尺寸与间距，确保核心信息（如预约和竞赛）能单屏展示更多条目。
// 3. [Feature] 保持所有原有跳转逻辑和动态数据绑定。
// ==========================================

const DashboardFeature = {
    props: ['user'],
    emits: ['nav-cloud', 'show-toast', 'nav-ladder', 'nav-calendar', 'nav-special', 'nav-cpp', 'open-problem', 'nav-competition', 'notification-read', 'nav-scratch-personal', 'nav-scratch-creative', 'nav-scratch-team'],
    
    template: `
    <div class="h-full flex flex-col relative animate-fade-in-up pb-6 overflow-hidden">
        
        <!-- ================= 顶部滚动公告栏 (通用) ================= -->
        <div v-if="unreadAnnouncements.length > 0" 
             class="shrink-0 h-10 text-white flex items-center px-4 relative overflow-hidden mb-4 rounded-xl shadow-lg mx-8 mt-2 z-30 transition-colors duration-500"
             :class="theme.marqueeBg">
            <div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r to-transparent z-10" :class="theme.marqueeGradientL"></div>
            <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l to-transparent z-10" :class="theme.marqueeGradientR"></div>
            
            <div class="flex items-center gap-2 z-20 shrink-0 mr-4 opacity-90">
                <i class="fa-solid fa-volume-high animate-pulse"></i>
                <span class="text-xs font-bold uppercase tracking-wider">Notice:</span>
            </div>

            <div class="flex-1 overflow-hidden relative h-full flex items-center group cursor-pointer">
                <div class="animate-marquee whitespace-nowrap flex items-center gap-12 group-hover:pause-animation">
                    <div v-for="news in unreadAnnouncements" :key="news.id" 
                         @click="openBulletin(news)"
                         class="flex items-center gap-2 text-sm font-medium hover:text-yellow-300 transition opacity-90 hover:opacity-100">
                        <span v-if="news.urgent" class="bg-red-500 text-[10px] px-1.5 rounded font-bold">URGENT</span>
                        <span>{{ news.title }}</span>
                        <span class="text-xs opacity-60">({{ news.date }})</span>
                    </div>
                    <!-- 重复用于无缝滚动 -->
                    <div v-for="news in unreadAnnouncements" :key="'dup-'+news.id" 
                         @click="openBulletin(news)"
                         class="flex items-center gap-2 text-sm font-medium hover:text-yellow-300 transition opacity-90 hover:opacity-100">
                        <span v-if="news.urgent" class="bg-red-500 text-[10px] px-1.5 rounded font-bold">URGENT</span>
                        <span>{{ news.title }}</span>
                        <span class="text-xs opacity-60">({{ news.date }})</span>
                    </div>
                </div>
            </div>
            
            <button @click="markAllRead" class="z-20 ml-4 text-xs opacity-80 hover:opacity-100 underline decoration-dashed">全部已读</button>
        </div>

        <!-- 主内容容器 -->
        <div class="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden px-8 md:px-10">
            
            <!-- ================= 左侧区域 (C++: 70%, Scratch: 70%) ================= -->
            <div class="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar pr-2">
                
                <!-- 1. 自适应 Hero 卡片 -->
                <div class="relative rounded-3xl p-8 text-white shadow-2xl overflow-hidden shrink-0 min-h-[280px] flex flex-col justify-between group transition-all duration-700"
                     :class="theme.heroBg">
                    
                    <!-- 背景装饰球 -->
                    <div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse opacity-40" :class="theme.heroBlob1"></div>
                    <div class="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-30" :class="theme.heroBlob2"></div>
                    
                    <!-- 极客/创意水印 -->
                    <div v-if="currentTrack === 'cpp'" class="absolute right-10 top-10 text-9xl opacity-5 font-mono rotate-12 pointer-events-none select-none">{code}</div>
                    <div v-else class="absolute right-10 top-10 text-9xl opacity-10 rotate-12 pointer-events-none select-none text-white"><i class="fa-solid fa-puzzle-piece"></i></div>

                    <!-- 顶部信息：日期、天气、欢迎语 -->
                    <div class="relative z-10 flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-3 text-sm font-medium opacity-90 mb-1">
                                <span class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm">{{ currentDate }}</span>
                                <span>{{ currentWeek }}</span>
                                <span class="flex items-center gap-1"><i class="fa-solid fa-location-dot"></i> {{ weatherData.city }}</span>
                            </div>
                            <h1 class="text-4xl font-bold tracking-tight mt-3 flex items-baseline gap-2 text-white drop-shadow-sm">
                                早安, {{ user.name }} 
                                <span class="text-lg font-normal opacity-60 font-mono hidden sm:inline-block">Good Morning</span>
                            </h1>
                            <!-- 10周年勋章 -->
                            <div class="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-white/20 to-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 animate-fade-in shadow-inner">
                                <div class="size-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-[10px] text-amber-900 font-black shadow-lg"><i class="fa-solid fa-award"></i></div>
                                <div class="flex flex-col leading-none">
                                    <span class="text-[10px] opacity-80 uppercase tracking-wider text-yellow-50">Since 2015</span>
                                    <span class="text-xs font-bold text-white">已与原因STEAM同行 <span class="font-mono text-sm mx-0.5 text-yellow-300">{{ daysJoined }}</span> 天</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 切换开关 -->
                        <div class="flex flex-col items-end text-right">
                            <div class="text-3xl font-light flex items-center gap-3 drop-shadow-sm">
                                <span>{{ weatherData.today.temp }}°</span>
                                <i class="fa-solid fa-cloud-sun text-yellow-400"></i>
                            </div>
                            <button @click="toggleTrack" class="mt-2 text-[10px] bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/30 transition flex items-center gap-1.5 backdrop-blur-md shadow-sm hover:shadow-md">
                                <i class="fa-solid fa-shuffle"></i> 
                                <span>切换: {{ currentTrack === 'cpp' ? 'C++极客' : 'Scratch创意' }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- 底部区域：名言 & 资产栏 -->
                    <div class="relative z-10 flex flex-col md:flex-row items-end justify-between mt-6 gap-4">
                        <p class="text-white text-sm italic max-w-xs border-l-2 pl-3 hidden md:block drop-shadow-sm opacity-90" :class="theme.quoteBorder">
                            “{{ currentQuote }}”
                        </p>
                        
                        <!-- 资产栏容器 -->
                        <div class="flex items-center gap-2 rounded-2xl p-2 w-full md:w-auto overflow-x-auto no-scrollbar transition-all duration-500"
                             :class="theme.assetBarBg">
                             
                            <div v-for="key in ['积分', '码豆', '活跃点', '天梯币', '荣誉点']" :key="key" 
                                 @click="openAssetModal(key)"
                                 class="flex flex-col items-center justify-center px-4 py-2 rounded-xl transition cursor-pointer min-w-[80px] group/asset relative overflow-hidden"
                                 :class="currentTrack === 'cpp' ? 'hover:bg-white/10' : 'hover:bg-slate-100'">
                                
                                <div class="absolute inset-0 bg-gradient-to-b opacity-0 group-hover/asset:opacity-100 transition-opacity"
                                     :class="currentTrack === 'cpp' ? 'from-white/10 to-transparent' : 'from-slate-100 to-transparent'"></div>
                                
                                <div class="text-[10px] mb-0.5 uppercase tracking-wide scale-90 font-bold shadow-sm transition-colors duration-500"
                                     :class="theme.assetLabelColor">
                                    {{ assetConfig[key].label }}
                                </div>
                                
                                <div class="font-mono font-bold text-lg leading-none flex items-center gap-1 drop-shadow-sm transition-colors duration-500" 
                                     :class="currentTrack === 'cpp' ? assetConfig[key].colorDark : assetConfig[key].colorLight">
                                    <i :class="assetConfig[key].icon" class="text-xs opacity-90"></i>
                                    {{ formatNumber(user.currencies[key]) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ================= C++ 模式独有内容 (Start) ================= -->
                <template v-if="currentTrack === 'cpp'">
                    <!-- 2. 数据概览 (核心指标 + 活跃度卡片) -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                        <!-- 卡片 A: 段位/等级 -->
                        <div @click="handleNav('rank')" class="relative rounded-3xl p-6 text-white shadow-lg overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 bg-gradient-to-br from-amber-500 to-orange-600 shadow-orange-500/20">
                            <div class="absolute -right-6 -bottom-6 text-9xl text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <i class="fa-solid fa-trophy"></i>
                            </div>
                            <div class="relative z-10 h-full flex flex-col justify-between">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex items-center gap-2">
                                        <div class="size-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-inner border border-white/20">
                                            <i class="fa-solid fa-crown"></i>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-xs text-white/90 font-bold leading-none">当前段位</span>
                                            <span class="text-[10px] text-white/60 font-bold uppercase tracking-wider scale-90 origin-left mt-0.5">Rank Tier</span>
                                        </div>
                                    </div>
                                    <span class="bg-black/20 text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">S3 赛季</span>
                                </div>
                                <div class="flex flex-col gap-3 mt-1">
                                    <div v-for="(ladder, idx) in userStats.ladders" :key="idx" class="relative">
                                        <div v-if="idx > 0" class="absolute -top-1.5 left-0 w-full h-px bg-white/20"></div>
                                        <div class="flex justify-between items-end">
                                            <div class="flex flex-col">
                                                <span class="text-[10px] font-bold opacity-90">{{ ladder.label }}</span>
                                                <div class="text-xl font-black leading-none">{{ ladder.rank }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-[10px] bg-white/20 px-1.5 py-0.5 rounded mb-0.5 inline-block">Top {{ ladder.top }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 卡片 B: 刷题数 -->
                        <div @click="handleNav('work')" class="relative rounded-3xl p-6 text-white shadow-lg overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20">
                            <div class="absolute -right-6 -bottom-6 text-9xl text-white/10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                 <i class="fa-solid fa-check-double"></i>
                            </div>
                            <div class="relative z-10 flex flex-col h-full justify-between gap-4">
                                <div class="flex justify-between items-start">
                                    <div class="size-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
                                         <i class="fa-solid fa-list-check"></i>
                                    </div>
                                    <span class="bg-black/20 text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                                        <i class="fa-solid fa-arrow-trend-up text-[10px]"></i> +12
                                    </span>
                                </div>
                                <div>
                                    <div class="flex items-baseline gap-2 mb-1">
                                        <span class="text-xs text-white/90 font-bold">刷题总数</span>
                                        <span class="text-[10px] text-white/60 font-bold uppercase tracking-wider">Solved</span>
                                    </div>
                                    <div class="text-3xl font-black font-mono tracking-tight leading-none mb-2">
                                        {{ formatNumber(userStats.completedProblems) }}
                                    </div>
                                    <div class="flex items-center gap-2 text-xs font-medium text-white/80">
                                        <span>击败了全站 88% 的同学</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 卡片 C: 活跃度热力图卡片 -->
                        <div class="bg-white rounded-3xl p-5 shadow-lg shadow-indigo-500/5 border border-slate-100 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                             <!-- 装饰背景 -->
                             <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                             
                             <!-- Header -->
                             <div class="flex justify-between items-start z-10">
                                <div>
                                    <h3 class="font-bold text-slate-800 text-base leading-tight">学习活跃度</h3>
                                    <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Momentum</span>
                                </div>
                                <!-- 图例简化 -->
                                <div class="flex gap-1 text-[10px] items-center">
                                    <span class="text-slate-300 scale-75">Less</span>
                                    <div class="size-2 rounded-sm bg-slate-200"></div>
                                    <div class="size-2 rounded-sm" :class="theme.heatDark"></div>
                                    <span class="text-slate-300 scale-75">More</span>
                                </div>
                             </div>

                             <!-- Heatmap Visual (适配卡片宽度，只显示最近 24 天) -->
                             <div class="flex items-end justify-between gap-1 h-14 w-full mt-4 z-10">
                                  <div v-for="(day, idx) in activityData.slice(-24)" :key="idx" 
                                        class="flex-1 rounded-sm transition-all hover:scale-y-125 hover:opacity-80 cursor-help relative group/cell"
                                        :class="getHeatmapColor(day.minutes)"
                                        :style="{ height: getHeatmapHeight(day.minutes) }">
                                        <div class="absolute bottom-full right-0 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/cell:opacity-100 transition pointer-events-none whitespace-nowrap z-20 shadow-xl">
                                            {{ day.date }}: {{ day.minutes }}m
                                        </div>
                                  </div> 
                             </div>
                             
                             <!-- Footer info -->
                             <div class="mt-2 flex items-center justify-between z-10 pt-2 border-t border-slate-50">
                                 <div class="flex items-center gap-2 text-xs text-slate-500">
                                    <i class="fa-solid fa-fire text-orange-400 animate-pulse"></i>
                                    <span class="font-bold font-mono" :class="theme.textPrimary">{{ formatNumber(userStats.totalBookingMinutes) }}</span> <span class="scale-90 opacity-70">mins total</span>
                                 </div>
                                 <div class="text-[10px] text-slate-300 font-bold">近30天</div>
                             </div>
                        </div>
                    </div>

                    <!-- 3. 足迹与继续学习 (原位置) -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        <!-- 4.1 最近观看/课程 -->
                        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[340px]">
                            <div class="flex items-center gap-3 mb-4 shrink-0">
                                <div class="size-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm"><i class="fa-solid fa-play"></i></div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-700 leading-none">最近学习</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider scale-90 origin-left mt-0.5">Last Lessons</span>
                                </div>
                            </div>
                            <div class="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-2">
                                <div v-for="(video, idx) in recentVideos" :key="idx" @click="$emit('nav-cloud')" class="group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition">
                                    <div class="flex justify-between items-start mb-1.5">
                                        <h4 class="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition line-clamp-1">{{ video.title }}</h4>
                                        <span class="text-[10px] text-slate-400 font-mono">{{ video.time }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <div class="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div class="bg-indigo-500 h-full rounded-full" :style="{width: video.progress + '%'}"></div>
                                        </div>
                                        <span class="text-[10px] font-bold text-indigo-500 w-8 text-right">{{ video.progress }}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 4.2 最近练习 -->
                        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[340px]">
                            <div class="flex items-center gap-3 mb-4 shrink-0">
                                <div class="size-10 rounded-full flex items-center justify-center shadow-sm bg-emerald-50 border-emerald-100 text-emerald-500">
                                    <i class="fa-solid fa-code"></i>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-700 leading-none">最近练习</span>
                                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider scale-90 origin-left mt-0.5">Last Problems</span>
                                </div>
                            </div>
                            
                            <div class="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-2">
                                <div v-for="problem in displayProblems" :key="problem.id" @click="$emit('open-problem', problem)" class="group flex items-center gap-3 cursor-pointer hover:bg-emerald-50/50 p-2 -mx-2 rounded-xl transition border border-transparent hover:border-emerald-100">
                                    <div class="size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors" :class="problem.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-emerald-500 group-hover:shadow-sm'">
                                        <i :class="problem.status === 'completed' ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h4 class="text-xs font-bold text-slate-700 truncate group-hover:text-emerald-700 transition">{{ problem.title }}</h4>
                                        <div class="flex items-center gap-2 mt-0.5">
                                            <span class="text-[10px] px-1.5 py-0.5 rounded border" :class="getDifficultyClass(problem.difficulty)">{{ problem.difficulty }}</span>
                                            <span class="text-[10px] text-slate-400 ml-auto">{{ problem.time }}</span>
                                        </div>
                                    </div>
                                    <i class="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- ================= C++ 模式独有内容 (End) ================= -->


                <!-- ================= Scratch 模式独有内容 (Start) ================= -->
                <template v-else>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
                        
                        <!-- 1. 个人课堂最近项目 (Personal Projects) -->
                        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <!-- 装饰背景 -->
                            <div class="absolute -right-10 -top-10 size-40 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
                            
                            <div class="flex items-center justify-between mb-6 relative z-10">
                                <div class="flex items-center gap-3">
                                    <div class="size-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <i class="fa-solid fa-user-astronaut text-lg"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-base font-black text-slate-700 leading-none tracking-tight">个人课堂项目</span>
                                        <span class="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-1">Personal Lab</span>
                                    </div>
                                </div>
                                <button @click="$emit('nav-scratch-personal')" class="size-8 rounded-full bg-slate-50 hover:bg-orange-500 hover:text-white hover:shadow-orange-200 hover:shadow-md text-slate-400 transition flex items-center justify-center border border-transparent hover:border-orange-400">
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                            
                            <div class="flex-1 space-y-4 relative z-10">
                                <div v-if="scratchPersonalProjects.length > 0" class="flex flex-col gap-3">
                                    <div v-for="(proj, idx) in scratchPersonalProjects.slice(0, 3)" :key="proj.id" 
                                         @click="$emit('nav-scratch-personal')"
                                         class="group/item cursor-pointer relative flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                        
                                        <!-- 矢量图标卡片 -->
                                        <div class="size-12 shrink-0 rounded-xl flex items-center justify-center text-xl text-white shadow-inner"
                                             :class="idx === 0 ? 'bg-gradient-to-br from-orange-400 to-pink-500' : (idx === 1 ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-gradient-to-br from-purple-400 to-indigo-500')">
                                            <i class="fa-solid" :class="idx === 0 ? 'fa-rocket' : (idx === 1 ? 'fa-gamepad' : 'fa-music')"></i>
                                        </div>
                                        
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-center mb-1">
                                                <h4 class="font-bold text-slate-700 truncate group-hover/item:text-orange-500 transition">{{ proj.title }}</h4>
                                            </div>
                                            <div class="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                                <span><i class="fa-solid fa-cube text-[10px] mr-1"></i>{{ proj.blocks }} 积木</span>
                                                <span><i class="fa-regular fa-clock text-[10px] mr-1"></i>{{ proj.time }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <div class="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2 text-2xl">
                                        <i class="fa-solid fa-ghost"></i>
                                    </div>
                                    <p class="text-xs text-slate-400 font-bold">空空如也，快去创作吧！</p>
                                </div>
                            </div>
                        </div>

                        <!-- 2. 团队课堂最近项目 (Team Projects) -->
                        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                             <!-- 装饰背景 -->
                             <div class="absolute -right-10 -top-10 size-40 bg-pink-50 rounded-full blur-3xl opacity-50"></div>

                            <div class="flex items-center justify-between mb-6 relative z-10">
                                <div class="flex items-center gap-3">
                                    <div class="size-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
                                        <i class="fa-solid fa-people-group text-lg"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-base font-black text-slate-700 leading-none tracking-tight">团队协作项目</span>
                                        <span class="text-[10px] text-pink-500 font-bold uppercase tracking-wider mt-1">Team Squad</span>
                                    </div>
                                </div>
                                <button @click="$emit('nav-scratch-team')" class="size-8 rounded-full bg-slate-50 hover:bg-pink-500 hover:text-white hover:shadow-pink-200 hover:shadow-md text-slate-400 transition flex items-center justify-center border border-transparent hover:border-pink-400">
                                    <i class="fa-solid fa-arrow-right"></i>
                                </button>
                            </div>
                            
                            <div class="flex-1 space-y-4 relative z-10">
                                <div v-if="scratchTeamProjects.length > 0" class="flex flex-col gap-3">
                                    <div v-for="(proj, idx) in scratchTeamProjects.slice(0, 3)" :key="proj.id" 
                                         @click="$emit('nav-scratch-team')"
                                         class="group/item cursor-pointer relative flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 hover:border-pink-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                        
                                        <!-- 矢量图标卡片 -->
                                        <div class="size-12 shrink-0 rounded-xl flex items-center justify-center text-xl text-white shadow-inner bg-gradient-to-br from-indigo-400 to-violet-500">
                                            <i class="fa-solid fa-network-wired"></i>
                                        </div>
                                        
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-start">
                                                <h4 class="font-bold text-slate-700 truncate group-hover/item:text-pink-500 transition">{{ proj.title }}</h4>
                                                <div class="flex -space-x-1.5">
                                                    <div class="size-4 rounded-full bg-slate-200 border border-white"></div>
                                                    <div class="size-4 rounded-full bg-slate-300 border border-white"></div>
                                                    <div class="size-4 rounded-full bg-pink-400 border border-white flex items-center justify-center text-[8px] text-white font-bold">+2</div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                                                <span class="truncate"><i class="fa-solid fa-pen-nib text-[10px] mr-1"></i>{{ proj.lastEdit }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-60">
                                    <div class="size-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2 text-2xl">
                                        <i class="fa-solid fa-user-plus"></i>
                                    </div>
                                    <p class="text-xs text-slate-400 font-bold">还没有加入团队，去组队吧！</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- 3. Scratch 创意工坊 -->
                    <div class="bg-white/80 backdrop-blur-md border border-white/60 rounded-3xl p-6 flex flex-col shadow-lg shadow-pink-500/5 relative overflow-hidden mt-2">
                        <!-- 装饰背景 -->
                        <div class="absolute -left-10 -bottom-10 size-64 bg-gradient-to-tr from-pink-100 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                        <div class="flex items-center justify-between mb-4 relative z-10">
                            <div class="flex items-center gap-3">
                                <div class="size-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                                </div>
                                <div class="flex flex-col">
                                    <h3 class="text-lg font-black text-slate-800 leading-none">创意工坊精选</h3>
                                    <span class="text-[10px] font-bold text-pink-400 uppercase tracking-wider mt-1">Creative Gallery</span>
                                </div>
                            </div>
                            <!-- [更新] 点击触发全屏沉浸画廊 -->
                            <button @click="creativeGalleryModal.visible = true" class="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-white transition px-4 py-2 rounded-full hover:bg-pink-500 hover:shadow-lg hover:shadow-pink-200 border border-slate-100 hover:border-pink-500 group">
                                更多作品 <i class="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                            </button>
                        </div>
                        
                        <div class="flex overflow-x-auto no-scrollbar gap-5 pb-2 relative z-10 px-1">
                            <div v-for="item in scratchSharedProjects" :key="item.id" 
                                 @click="creativeGalleryModal.visible = true"
                                 class="flex-shrink-0 w-64 bg-white border border-slate-100 rounded-2xl p-3 hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 hover:border-pink-200 transition-all duration-300 cursor-pointer group flex gap-3">
                                
                                <!-- 模拟作品缩略图 (矢量) -->
                                <div class="size-16 rounded-xl shrink-0 flex items-center justify-center text-2xl text-white shadow-inner"
                                     :class="item.colorBg">
                                     <i :class="item.icon"></i>
                                </div>

                                <div class="flex flex-col justify-between py-0.5 min-w-0 flex-1">
                                    <div>
                                        <h4 class="text-sm font-bold text-slate-700 truncate group-hover:text-pink-600 transition">{{ item.title }}</h4>
                                        <div class="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                            <i class="fa-solid fa-user-circle"></i> {{ item.author }}
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-end gap-1 text-[10px] font-bold text-rose-400 bg-rose-50 w-fit px-1.5 py-0.5 rounded self-end">
                                        <i class="fa-solid fa-heart"></i> {{ item.likes }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- ================= Scratch 模式独有内容 (End) ================= -->

            </div>

            <!-- ================= 右侧边栏区域 ================= -->
            <div class="w-full lg:w-96 bg-white border-l border-slate-100 h-full flex flex-col shadow-xl z-20 overflow-hidden">
                
                <!-- C++ 模式：原有的三段式信息流 (任务、日程、竞赛) -->
                <template v-if="currentTrack === 'cpp'">
                    <!-- 1. 任务流 -> 我的作业 -->
                    <div class="flex-1 flex flex-col min-h-0 overflow-hidden border-b border-slate-100">
                        <div class="p-5 pb-2 shrink-0 bg-white z-10">
                            <div class="flex justify-between items-end pb-2 border-b border-slate-50">
                                <div class="flex flex-col">
                                    <h2 class="font-black text-base text-slate-800 flex items-center gap-2 leading-none">
                                        <i class="fa-solid fa-book text-base" :class="theme.textPrimary"></i> 我的作业
                                    </h2>
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-6 mt-1">My Homework</span>
                                </div>
                                <span v-if="pendingHomework.length" class="text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md bg-rose-500 shadow-rose-200">{{ pendingHomework.length }}</span>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto no-scrollbar px-5 pb-2 space-y-2">
                            <div v-if="pendingHomework.length > 0">
                                <div v-for="hw in pendingHomework" :key="hw.id" 
                                     @click="handleOpenTask(hw)"
                                     class="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-2.5 transition cursor-pointer shadow-sm group relative overflow-hidden mb-2 hover:border-indigo-300">
                                    <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors bg-rose-400 group-hover:bg-rose-500"></div>
                                    <div class="flex justify-between items-start mb-0.5 pl-2">
                                        <h4 class="text-xs font-bold text-slate-700 transition line-clamp-1 group-hover:text-indigo-600">{{ hw.title }}</h4>
                                        <i class="text-[10px] text-slate-300 mt-0.5 shrink-0 fa-solid fa-code"></i>
                                    </div>
                                     <div class="flex items-center gap-2 pl-2 mt-1">
                                        <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1"><i class="fa-regular fa-clock"></i> {{ hw.deadline }}</span>
                                        <span class="text-[10px] text-slate-400">未完成</span>
                                    </div>
                                </div>
                            </div>
                             <div v-else class="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <p class="text-xs text-slate-400">暂无待办任务 🎉</p>
                            </div>
                        </div>
                    </div>

                    <!-- 2. 日程安排 -> 我的预约 -->
                    <div class="flex-1 flex flex-col min-h-0 overflow-hidden border-b border-slate-100">
                        <div class="p-5 pb-2 shrink-0 bg-white z-10">
                             <div class="flex flex-col pb-2 border-b border-slate-50">
                                <h2 class="font-black text-base text-slate-800 flex items-center gap-2 leading-none">
                                    <i class="fa-regular fa-calendar-check text-base" :class="theme.textPrimary"></i> 我的预约
                                </h2>
                                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-6 mt-1">Appointments</span>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto no-scrollbar px-5 pb-2 relative">
                            <div class="space-y-3 relative pl-2">
                                <div class="absolute left-[21px] top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>
                                <div class="relative z-10 group cursor-pointer" @click="$emit('nav-calendar')">
                                    <div class="flex gap-3">
                                        <div class="size-3 rounded-full border-4 border-white shadow-sm shrink-0 mt-1 z-10 box-content ring-2 bg-indigo-500 ring-indigo-100"></div>
                                        <div class="flex-1">
                                            <div class="text-[10px] text-slate-400 font-mono mb-0.5">{{ nextBooking.date }}</div>
                                            <div class="border rounded-lg p-2.5 transition bg-indigo-50/50 hover:bg-indigo-50 border-indigo-100">
                                                <h4 class="text-xs font-bold text-slate-700 mb-0.5">{{ nextBooking.teacher }} - 辅导</h4>
                                                <div class="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <i class="fa-solid fa-location-dot text-[9px]"></i> {{ nextBooking.campus }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                 <div class="relative z-10 group cursor-pointer" @click="$emit('nav-special')">
                                    <div class="flex gap-3">
                                         <div class="size-3 rounded-full bg-amber-500 border-4 border-white shadow-sm shrink-0 mt-1 z-10 box-content ring-2 ring-amber-100"></div>
                                        <div class="flex-1">
                                             <div class="text-[10px] text-slate-400 font-mono mb-0.5">{{ nextSpecial.date }} · {{ nextSpecial.countdown }}后</div>
                                            <div class="bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-lg p-2.5 transition">
                                                <h4 class="text-xs font-bold text-slate-700 mb-0.5 line-clamp-1">{{ nextSpecial.title }}</h4>
                                                <div class="text-[10px] text-slate-500">
                                                   {{ nextSpecial.location }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. 我的竞赛 -->
                    <div class="flex-1 flex flex-col min-h-0 overflow-hidden border-b border-slate-100">
                        <div class="p-5 pb-2 shrink-0 bg-white z-10">
                            <div class="flex justify-between items-end pb-2 border-b border-slate-50">
                                <div class="flex flex-col">
                                    <h2 class="font-black text-base text-slate-800 flex items-center gap-2 leading-none">
                                        <i class="fa-solid fa-flag-checkered text-rose-500 text-base"></i> 我的竞赛
                                    </h2>
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] ml-6 mt-1">My Contests</span>
                                </div>
                                <span v-if="upcomingCompetitions.length" class="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{{ upcomingCompetitions.length }}</span>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto no-scrollbar px-5 pb-2 space-y-2">
                            <div v-for="comp in upcomingCompetitions" :key="comp.id" 
                                 @click="openCompetition(comp)"
                                 class="group cursor-pointer bg-white border border-slate-200 hover:border-rose-300 rounded-lg p-2.5 transition shadow-sm relative overflow-hidden hover:shadow-md">
                                <div class="absolute -right-4 -bottom-4 text-5xl text-rose-500/5 rotate-12 group-hover:rotate-0 transition-transform"><i class="fa-solid fa-trophy"></i></div>
                                
                                <div class="flex justify-between items-start mb-1 relative z-10">
                                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border" 
                                          :class="comp.status === 'live' ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-blue-50 text-blue-500 border-blue-100'">
                                        {{ comp.status === 'live' ? '正在进行' : '即将开始' }}
                                    </span>
                                    <span class="text-[9px] text-slate-400 font-mono">{{ comp.startTime }}</span>
                                </div>
                                <h4 class="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition mb-0.5 relative z-10 line-clamp-1">{{ comp.title }}</h4>
                                <div class="flex items-center gap-1 text-[9px] text-slate-500 relative z-10">
                                    <i class="fa-regular fa-clock"></i> {{ comp.countdown }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Scratch 模式：固定排课视图 (Update: 新增剩余课时 + 移除“固定班级”文字) -->
                <template v-else>
                    <div class="flex-1 flex flex-col h-full bg-gradient-to-b from-white to-slate-50 relative">
                        
                        <!-- [NEW] 右侧顶部：剩余课时概览卡片 -->
                        <div class="px-6 pt-6 pb-4 shrink-0 bg-white z-20 shadow-sm border-b border-slate-100">
                             <!-- 课时展示卡片 (点击进入沉浸式详情) -->
                             <div class="bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-orange-500/20 group cursor-pointer transition-transform hover:scale-[1.02]"
                                  @click="classHourModal.visible = true">
                                <!-- 装饰纹理 -->
                                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                                <div class="absolute bottom-0 left-0 w-24 h-24 bg-rose-600/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
                                
                                <div class="relative z-10 flex justify-between items-center mb-4">
                                    <div>
                                        <div class="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">Total Balance</div>
                                        <div class="text-4xl font-black font-mono leading-none tracking-tight">
                                            {{ totalRemainingHours }} <span class="text-base font-bold opacity-70">课时</span>
                                        </div>
                                    </div>
                                    <div class="size-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                        <i class="fa-solid fa-hourglass-half text-xl"></i>
                                    </div>
                                </div>
                                
                                <div class="relative z-10 flex items-center justify-between">
                                    <div class="flex items-center gap-1.5 text-xs font-bold opacity-90 group-hover:opacity-100 transition-opacity">
                                        <span>查看消耗明细</span>
                                        <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                                    </div>
                                    <div class="text-[10px] bg-black/10 px-2 py-0.5 rounded backdrop-blur-sm">
                                        已消耗 {{ totalConsumedHours }} 课时
                                    </div>
                                </div>
                             </div>

                             <!-- 标题区域 -->
                             <div class="flex flex-col mt-6">
                                <h2 class="font-black text-xl text-slate-800 flex items-center gap-2 leading-none">
                                    <i class="fa-solid fa-calendar-days text-orange-500"></i> 我的排课
                                </h2>
                                <div class="flex items-center justify-between mt-3">
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Class Schedule</span>
                                    <!-- [Removed] “固定班级”标签已移除 -->
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto no-scrollbar px-6 relative py-4">
                            <!-- 时间轴线 -->
                            <div class="absolute left-[34px] top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>
                            
                            <div class="space-y-6 relative z-10">
                                <!-- 遍历排课数据 -->
                                <div v-for="(cls, idx) in scratchSchedule" :key="idx" class="relative group">
                                    <!-- 状态指示点 -->
                                    <div class="absolute left-0 top-0 w-[18px] h-full flex flex-col items-center">
                                        <div v-if="cls.status === 'past'" class="size-4 rounded-full bg-slate-300 border-4 border-slate-50 shadow-sm z-10 mt-1"></div>
                                        <div v-else-if="cls.status === 'next'" class="size-6 rounded-full bg-orange-500 border-4 border-orange-100 shadow-lg shadow-orange-500/30 z-10 flex items-center justify-center animate-pulse">
                                            <div class="size-2 bg-white rounded-full"></div>
                                        </div>
                                        <div v-else class="size-4 rounded-full bg-white border-4 border-slate-200 shadow-sm z-10 mt-1"></div>
                                    </div>

                                    <div class="pl-8">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" 
                                                  :class="cls.status === 'past' ? 'bg-slate-100 text-slate-400' : (cls.status === 'next' ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400 border border-slate-200')">
                                                {{ cls.status === 'past' ? '已结课' : (cls.status === 'next' ? '即将开始' : '待上课') }}
                                            </span>
                                        </div>
                                        
                                        <div class="rounded-xl p-4 transition-all relative overflow-hidden flex flex-col gap-3 group-hover:shadow-md border"
                                             :class="cls.status === 'next' ? 'bg-white border-orange-200 ring-4 ring-orange-50' : 'bg-white border-slate-100'">
                                            
                                            <div class="flex items-center gap-3">
                                                <div class="size-10 rounded-lg flex flex-col items-center justify-center shrink-0 border"
                                                     :class="cls.status === 'next' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'">
                                                    <span class="text-[10px] uppercase font-bold">{{ cls.weekDay }}</span>
                                                    <span class="text-sm font-black leading-none">{{ cls.day }}</span>
                                                </div>
                                                <div class="flex flex-col">
                                                    <span class="text-lg font-black font-mono tracking-tight leading-none" 
                                                          :class="cls.status === 'next' ? 'text-slate-800' : 'text-slate-500'">{{ cls.time }}</span>
                                                    <span class="text-[10px] text-slate-400 mt-1">{{ cls.fullDate }}</span>
                                                </div>
                                            </div>
                                            <div class="h-px bg-slate-50 w-full"></div>
                                            <div class="flex items-center gap-2 text-xs text-slate-500">
                                                <i class="fa-solid fa-location-dot text-slate-300"></i>
                                                <span class="font-bold text-slate-600">{{ cls.campus }}</span>
                                                <span class="text-slate-300">|</span>
                                                <span>{{ cls.room }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

            </div>
        </div>

        <!-- ================= 全屏沉浸式：课时管家详情 (New) ================= -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="classHourModal.visible" 
                     class="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12 transition-all"
                     @click.self="classHourModal.visible = false">
                     
                    <div class="w-full max-w-6xl h-full flex flex-col animate-scale-in relative">
                        <!-- 关闭按钮 -->
                        <button @click="classHourModal.visible = false" class="absolute top-0 right-0 size-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition z-50">
                            <i class="fa-solid fa-xmark text-2xl"></i>
                        </button>

                        <!-- 顶部 Header -->
                        <div class="flex items-end justify-between mb-8 shrink-0 border-b border-white/10 pb-6">
                            <div>
                                <h1 class="text-4xl font-black text-white flex items-center gap-4">
                                    <div class="size-12 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <i class="fa-solid fa-hourglass-half text-2xl"></i>
                                    </div>
                                    课时管家
                                </h1>
                                <p class="text-white/40 mt-2 font-medium tracking-wide">
                                    当前剩余总课时: <span class="text-orange-400 font-mono font-bold text-xl mx-1">{{ totalRemainingHours }}</span> H
                                    <span class="mx-3 opacity-20">|</span>
                                    累计已消耗: <span class="text-white font-mono font-bold text-xl mx-1">{{ totalConsumedHours }}</span> H
                                </p>
                            </div>
                            <div class="text-right hidden md:block">
                                <div class="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-1">CONSUMPTION LOGIC</div>
                                <div class="text-sm font-bold text-white/60 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                    <i class="fa-solid fa-sort-amount-down-alt mr-2 text-orange-400"></i>按报名顺序优先抵扣 (FIFO)
                                </div>
                            </div>
                        </div>

                        <!-- 核心内容区 -->
                        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                            
                            <!-- 左侧：课时包队列 (报名情况) -->
                            <div class="lg:col-span-7 flex flex-col min-h-0">
                                <h3 class="text-lg font-bold text-white/80 mb-4 flex items-center gap-2">
                                    <i class="fa-solid fa-layer-group text-orange-400"></i> 课时包队列
                                </h3>
                                <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                    <!-- 遍历课时包 -->
                                    <div v-for="(pkg, idx) in classPackages" :key="pkg.id" 
                                         class="relative p-5 rounded-2xl border transition-all duration-300 group"
                                         :class="pkg.status === 'completed' 
                                            ? 'bg-white/5 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100' 
                                            : (pkg.status === 'active' ? 'bg-gradient-to-r from-orange-500/10 to-rose-500/10 border-orange-500/30 ring-1 ring-orange-500/20' : 'bg-white/10 border-white/10')">
                                        
                                        <!-- 状态标签 -->
                                        <div class="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border"
                                             :class="pkg.status === 'completed' ? 'bg-black/20 text-white/40 border-white/10' : (pkg.status === 'active' ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30')">
                                            {{ pkg.status === 'completed' ? '已耗尽' : (pkg.status === 'active' ? '当前消耗中' : '待生效') }}
                                        </div>

                                        <div class="flex justify-between items-start mb-4">
                                            <div>
                                                <div class="text-xs text-white/40 font-mono mb-1">NO.{{ String(idx + 1).padStart(2, '0') }} · {{ pkg.date }}</div>
                                                <h4 class="text-xl font-bold text-white group-hover:text-orange-400 transition">{{ pkg.name }}</h4>
                                            </div>
                                        </div>

                                        <!-- 进度条 -->
                                        <div class="relative h-3 bg-black/20 rounded-full overflow-hidden mb-2">
                                            <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-1000"
                                                 :style="{ width: (pkg.used / pkg.total * 100) + '%' }"></div>
                                        </div>
                                        <div class="flex justify-between text-xs font-mono">
                                            <span class="text-white/40">已用: {{ pkg.used }}</span>
                                            <span class="font-bold" :class="pkg.status === 'active' ? 'text-orange-400' : 'text-white/60'">
                                                剩余: {{ pkg.total - pkg.used }} / Total: {{ pkg.total }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 右侧：消耗流水 (Timeline) -->
                            <div class="lg:col-span-5 flex flex-col min-h-0 bg-white/5 rounded-3xl p-6 border border-white/5">
                                <h3 class="text-lg font-bold text-white/80 mb-4 flex items-center gap-2">
                                    <i class="fa-solid fa-clock-rotate-left text-rose-400"></i> 消耗记录
                                </h3>
                                <div class="flex-1 overflow-y-auto custom-scrollbar relative pl-2">
                                    <div class="absolute left-[9px] top-2 bottom-2 w-px bg-white/10"></div>
                                    
                                    <div v-for="(log, idx) in classHistory" :key="idx" class="relative pl-6 mb-6 group">
                                        <div class="absolute left-0 top-1.5 size-5 rounded-full border-4 border-[#1e2330] bg-rose-500 z-10 shadow-sm"></div>
                                        <div class="flex flex-col">
                                            <div class="flex justify-between items-baseline mb-1">
                                                <span class="text-sm font-bold text-white/90">{{ log.reason }}</span>
                                                <span class="font-mono font-bold text-rose-400 text-lg">-{{ log.amount }}</span>
                                            </div>
                                            <div class="text-xs text-white/40 flex items-center gap-2">
                                                <span>{{ log.date }}</span>
                                                <span class="size-1 rounded-full bg-white/20"></span>
                                                <span class="text-orange-400/80">抵扣自: {{ getPackageName(log.packageId) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="relative pl-6 pt-4 text-center">
                                        <span class="text-xs text-white/20 uppercase tracking-widest">End of History</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- ================= [NEW] 全屏沉浸式：创意工坊沉浸画廊 ================= -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="creativeGalleryModal.visible" 
                     class="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex flex-col transition-all overflow-hidden"
                     @click.self="creativeGalleryModal.visible = false">
                     
                     <!-- 顶部导航栏 -->
                     <div class="shrink-0 h-20 border-b border-white/10 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md relative z-20">
                        <div class="flex items-center gap-4">
                            <div class="size-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white">
                                <i class="fa-solid fa-wand-magic-sparkles text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-black text-white tracking-tight leading-none">创意工坊 · 灵感宇宙</h1>
                                <p class="text-xs text-white/40 mt-1 font-mono uppercase tracking-wider">Creative Gallery Universe</p>
                            </div>
                        </div>

                        <!-- 搜索与筛选 -->
                        <div class="flex-1 max-w-xl mx-8 relative group">
                            <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-hover:text-pink-400 transition-colors"></i>
                            <input type="text" placeholder="搜索创意作品..." 
                                   class="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-pink-500/50 transition-all placeholder:text-white/20">
                        </div>

                        <div class="flex items-center gap-4">
                             <div class="flex bg-white/5 rounded-lg p-1 border border-white/5">
                                <button v-for="tab in galleryFilters" :key="tab.value"
                                        @click="creativeGalleryModal.filter = tab.value"
                                        class="px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-300"
                                        :class="creativeGalleryModal.filter === tab.value ? 'bg-pink-500 text-white shadow-md' : 'text-white/40 hover:text-white hover:bg-white/5'">
                                    {{ tab.label }}
                                </button>
                             </div>
                             <button @click="creativeGalleryModal.visible = false" class="size-10 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition flex items-center justify-center border border-white/5">
                                <i class="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                     </div>

                     <!-- 画廊主体内容 -->
                     <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            
                            <!-- 遍历展示过滤后的作品 -->
                            <div v-for="(item, idx) in filteredGalleryItems" :key="item.id"
                                 class="group relative bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-pink-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/10 cursor-pointer flex flex-col animate-scale-in"
                                 :style="{ animationDelay: idx * 50 + 'ms' }">
                                
                                <!-- 封面图模拟 (Icon + Gradient) -->
                                <div class="aspect-video relative overflow-hidden flex items-center justify-center text-5xl text-white/90"
                                     :class="item.colorBg">
                                     <!-- 装饰光效 -->
                                     <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                     <i :class="item.icon" class="transform group-hover:scale-125 transition-transform duration-700 drop-shadow-lg"></i>
                                     
                                     <!-- 悬浮播放按钮 -->
                                     <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] bg-black/20">
                                        <div class="size-12 rounded-full bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-pink-500 hover:border-pink-500 hover:scale-110 transition-all shadow-lg">
                                            <i class="fa-solid fa-play ml-1"></i>
                                        </div>
                                     </div>

                                     <!-- 类型标签 -->
                                     <div class="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-white border border-white/10 uppercase tracking-wider">
                                        {{ item.categoryLabel }}
                                     </div>
                                </div>

                                <!-- 信息区 -->
                                <div class="p-4 flex flex-col flex-1">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-white font-bold text-sm line-clamp-1 group-hover:text-pink-400 transition">{{ item.title }}</h3>
                                    </div>
                                    
                                    <div class="flex items-center gap-2 mb-4">
                                        <div class="size-5 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10"></div>
                                        <span class="text-xs text-white/40">{{ item.author }}</span>
                                    </div>

                                    <div class="mt-auto flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/30 font-mono">
                                        <div class="flex items-center gap-3">
                                            <span class="flex items-center gap-1 group-hover:text-pink-400 transition"><i class="fa-solid fa-heart"></i> {{ item.likes }}</span>
                                            <span class="flex items-center gap-1 group-hover:text-blue-400 transition"><i class="fa-solid fa-eye"></i> {{ item.views }}</span>
                                        </div>
                                        <span>{{ item.time }}</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                        
                        <!-- 底部 Loading -->
                        <div class="py-12 text-center">
                            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/30 text-xs font-bold border border-white/5 hover:bg-white/10 hover:text-white/60 cursor-pointer transition">
                                <i class="fa-solid fa-circle-notch animate-spin"></i> 加载更多创意...
                            </div>
                        </div>
                     </div>
                </div>
            </transition>
        </Teleport>

        <!-- ================= 全屏沉浸式资产详情弹窗 (通用) ================= -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="assetModal.visible" 
                     class="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 transition-all" 
                     @click.self="closeAssetModal"
                     @keydown.up.prevent="handleAssetKeydown"
                     @keydown.down.prevent="handleAssetKeydown">
                    <div class="relative w-full max-w-5xl flex flex-col items-center animate-scale-in h-full justify-center">
                        <button @click="closeAssetModal" class="absolute top-0 right-0 text-white/30 hover:text-white hover:rotate-90 transition duration-300 text-2xl z-50"><i class="fa-solid fa-xmark"></i></button>
                        <div class="text-center mb-8 relative z-20 shrink-0">
                            <div class="size-16 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto shadow-2xl shadow-indigo-500/20 bg-gradient-to-br" :class="assetModal.config.bgGradient"><i :class="[assetModal.config.icon, 'text-white']"></i></div>
                            <h2 class="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-2">TOTAL LIFETIME VOLUME</h2>
                            <div class="text-6xl font-black text-white font-mono tracking-tighter drop-shadow-2xl flex items-center justify-center gap-3"><span class="count-up">{{ formatNumber(assetModal.stats.earned + assetModal.stats.spent) }}</span><span class="text-xl bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">{{ assetModal.config.unit }}</span></div>
                        </div>
                        <div class="w-full relative mb-8 group flex-1 flex flex-col min-h-0 max-w-4xl">
                            <div class="absolute left-0 right-0 top-0 h-12 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
                            <div class="absolute left-0 right-0 bottom-0 h-12 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
                            <div ref="assetHistoryContainer" class="grid grid-cols-2 gap-4 overflow-y-auto no-scrollbar py-8 px-4 w-full h-full content-start scroll-smooth">
                                <div v-for="(item, idx) in assetModal.history" :key="idx" class="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-xl p-5 flex flex-col justify-between h-28 backdrop-blur-md group/card cursor-default transform hover:scale-[1.02] shadow-lg">
                                    <div class="flex justify-between items-start"><span class="text-xs text-white/40 font-mono bg-black/20 px-2 py-1 rounded tracking-tight">{{ item.date }}</span><i :class="item.amount > 0 ? 'fa-solid fa-arrow-down text-emerald-400' : 'fa-solid fa-arrow-up text-rose-400'" class="opacity-50 text-lg"></i></div>
                                    <div><div class="text-white font-bold text-sm mb-1 truncate">{{ item.desc }}</div><div class="font-mono text-2xl font-bold tracking-tight" :class="item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'">{{ item.amount > 0 ? '+' : '' }}{{ item.amount }}</div></div>
                                </div>
                            </div>
                            <div class="absolute bottom-4 right-4 text-white/10 text-[10px] font-mono flex flex-col items-end gap-1 pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity z-20"><span><i class="fa-solid fa-computer-mouse mr-1"></i> SCROLL VERTICAL</span><span><i class="fa-regular fa-keyboard mr-1"></i> UP / DOWN KEYS</span></div>
                        </div>
                        <div class="grid grid-cols-3 gap-8 w-full max-w-4xl border-t border-white/10 pt-6 mt-auto shrink-0">
                            <div class="text-center group cursor-default"><div class="text-xs text-emerald-400/60 uppercase tracking-wider mb-2 font-bold group-hover:text-emerald-400 transition-colors">Total Income</div><div class="text-2xl text-emerald-400 font-mono font-black flex items-center justify-center gap-2"><i class="fa-solid fa-circle-arrow-down text-lg opacity-50"></i>+{{ formatNumber(assetModal.stats.earned) }}</div></div>
                            <div class="text-center border-x border-white/10 group cursor-default"><div class="text-xs text-rose-400/60 uppercase tracking-wider mb-2 font-bold group-hover:text-rose-400 transition-colors">Total Expenditure</div><div class="text-2xl text-rose-400 font-mono font-black flex items-center justify-center gap-2"><i class="fa-solid fa-circle-arrow-up text-lg opacity-50"></i>{{ formatNumber(assetModal.stats.spent) }}</div></div>
                            <div class="text-center group cursor-default"><div class="text-xs text-indigo-400/60 uppercase tracking-wider mb-2 font-bold group-hover:text-indigo-400 transition-colors">Current Balance</div><div class="text-2xl text-white font-mono font-black flex items-center justify-center gap-2"><i class="fa-solid fa-wallet text-lg opacity-50"></i>{{ formatNumber(assetModal.balance) }}</div></div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 公告详情弹窗 (通用) -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="bulletinModal.visible" class="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="closeBulletin">
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[80vh] relative" ref="bulletinModalRef">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border" :class="bulletinModal.data.urgent ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'">
                                        {{ bulletinModal.data.urgent ? '紧急通知' : '系统消息' }}
                                    </span>
                                    <span class="text-xs text-slate-400">{{ bulletinModal.data.date }}</span>
                                </div>
                                <h3 class="text-xl font-bold text-slate-800 leading-tight">{{ bulletinModal.data.title }}</h3>
                            </div>
                            <button @click="closeBulletin" class="text-slate-400 hover:text-slate-600 transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                        </div>
                        <div class="p-6 overflow-y-auto custom-scrollbar text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {{ bulletinModal.data.content }}
                        </div>
                        <div class="p-4 border-t border-slate-100 bg-slate-50 text-center flex gap-3">
                            <button @click="closeBulletin" class="flex-1 px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-lg transition">稍后阅读</button>
                            <button @click="markAsRead($event)" class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-indigo-200">我已阅读</button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 添加 Marquee 动画样式 -->
        <component :is="'style'">
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
            .group-hover\\:pause-animation:hover {
                animation-play-state: paused;
            }
            @keyframes flyToBell {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                50% { transform: translate(var(--mid-x), var(--mid-y)) scale(0.5); opacity: 0.8; }
                100% { transform: translate(var(--target-x), var(--target-y)) scale(0.1); opacity: 0; }
            }
            .fly-particle {
                position: fixed;
                z-index: 9999;
                pointer-events: none;
                animation: flyToBell 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
        </component>

    </div>
    `,
    
    setup(props, { emit }) {
        const { ref, computed } = Vue;

        // [New] 1. 身份轨道与主题系统 (Track System)
        // 默认混合模式，可通过 UI 切换 cpp 或 scratch
        const currentTrack = ref('cpp'); 
        const toggleTrack = () => {
            currentTrack.value = currentTrack.value === 'cpp' ? 'scratch' : 'cpp';
            emit('show-toast', `已切换至 ${currentTrack.value === 'cpp' ? 'C++ 极客' : 'Scratch 创意'} 模式`, 'info');
        };

        const theme = computed(() => {
            if (currentTrack.value === 'cpp') {
                return {
                    marqueeBg: 'bg-indigo-600',
                    marqueeGradientL: 'from-indigo-600',
                    marqueeGradientR: 'from-indigo-600',
                    heroBg: 'bg-slate-900',
                    heroBlob1: 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30',
                    heroBlob2: 'bg-blue-500/20',
                    textPrimary: 'text-indigo-600',
                    quoteBorder: 'border-indigo-400',
                    heatLight: 'bg-indigo-300',
                    heatMedium: 'bg-indigo-500',
                    heatDark: 'bg-indigo-700',
                    // [UPDATED] C++ 模式资产栏：半透明磨砂，白色文字
                    assetBarBg: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5',
                    assetLabelColor: 'text-white/80'
                };
            } else {
                return {
                    marqueeBg: 'bg-orange-500',
                    marqueeGradientL: 'from-orange-500',
                    marqueeGradientR: 'from-orange-500',
                    // [UPDATED] Scratch 模式背景：更暖、更活泼的渐变
                    heroBg: 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400',
                    heroBlob1: 'bg-yellow-300/30',
                    heroBlob2: 'bg-white/20',
                    textPrimary: 'text-orange-600',
                    quoteBorder: 'border-yellow-200',
                    heatLight: 'bg-orange-300',
                    heatMedium: 'bg-orange-500',
                    heatDark: 'bg-orange-700',
                    // [UPDATED] Scratch 模式资产栏：纯白悬浮岛，深色文字
                    assetBarBg: 'bg-white/95 backdrop-blur-md border border-white shadow-xl shadow-orange-500/10',
                    assetLabelColor: 'text-slate-500'
                };
            }
        });

        // 2. 日期与天气
        const now = new Date();
        const currentDate = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
        const currentWeek = now.toLocaleDateString('zh-CN', { weekday: 'long' });
        const weatherData = ref({
            city: '北京市',
            today: { temp: 24, condition: '多云' },
        });
        
        // 10周年拾光机数据
        const daysJoined = ref(842); // Mock: 用户加入天数

        const currentQuote = computed(() => {
            if (currentTrack.value === 'cpp') {
                return "代码如诗，逻辑为骨。";
            } else {
                return "想象力比知识更重要。";
            }
        });

        // 3. 核心统计 (C++ Data)
        const userStats = ref({
            completedProblems: 342,
            linesOfCode: 15890,
            ladders: [
                { type: 'basic', label: '基础天梯', rank: '黄金 II', top: '5%', stars: 3 },
                { type: 'algo', label: '算法天梯', rank: '钻石 V', top: '1%', stars: 1 }
            ],
            totalBookingMinutes: 4800,
        });

        // 4. Scratch 模式特有数据 (Mock)
        const scratchPersonalProjects = ref([
            { id: 201, title: '母亲节贺卡 v1.0', time: '2小时前', blocks: 120, status: 'published' },
            { id: 202, title: '我的世界跑酷', time: '3天前', blocks: 450, status: 'private' },
            { id: 203, title: '音乐节奏大师', time: '1周前', blocks: 280, status: 'private' }
        ]);
        const scratchTeamProjects = ref([
            { id: 301, title: '海洋环保大作战', lastEdit: '5分钟前 by Alice', status: 'active' },
            { id: 302, title: '太空探索计划', lastEdit: '2天前 by Bob', status: 'active' }
        ]);
        
        // Scratch 固定排课数据 (模拟：过去1次，下节1次，未来2次)
        const scratchSchedule = ref([
            { status: 'past', fullDate: '2023-11-18', weekDay: '周六', day: '18', time: '08:30', campus: '科技园校区', room: '302教室' },
            { status: 'next', fullDate: '2023-11-25', weekDay: '周六', day: '25', time: '08:30', campus: '科技园校区', room: '302教室' },
            { status: 'future', fullDate: '2023-12-02', weekDay: '周六', day: '02', time: '08:30', campus: '海淀总校', room: '201教室' },
            { status: 'future', fullDate: '2023-12-09', weekDay: '周六', day: '09', time: '08:30', campus: '海淀总校', room: '201教室' }
        ]);

        // ================= [NEW] Scratch 课时消耗与报名数据 (FIFO Logic) =================
        const classPackages = ref([
            // 历史已用完的包
            { id: 101, name: '2022秋季常规班', total: 40, used: 40, status: 'completed', date: '2022-09-01' },
            { id: 102, name: '2023寒假集训营', total: 15, used: 15, status: 'completed', date: '2023-01-15' },
            // 当前正在使用的包 (active)
            { id: 103, name: '2023春季常规班', total: 40, used: 28, status: 'active', date: '2023-03-01' },
            // 未来待使用的包 (pending)
            { id: 104, name: '2023暑期特训营', total: 20, used: 0, status: 'pending', date: '2023-06-01' }
        ]);

        const classHistory = ref([
            { date: '2023-11-18', amount: 2, packageId: 103, reason: '常规课消 - 科技园校区' },
            { date: '2023-11-11', amount: 2, packageId: 103, reason: '常规课消 - 科技园校区' },
            { date: '2023-11-04', amount: 2, packageId: 103, reason: '常规课消 - 科技园校区' },
            { date: '2023-10-28', amount: 2, packageId: 103, reason: '常规课消 - 科技园校区' },
            { date: '2023-10-21', amount: 2, packageId: 103, reason: '常规课消 - 科技园校区' }
        ]);

        const classHourModal = ref({ visible: false });

        // 计算总剩余课时
        const totalRemainingHours = computed(() => {
            return classPackages.value.reduce((sum, pkg) => sum + (pkg.total - pkg.used), 0);
        });

        // 计算总消耗课时
        const totalConsumedHours = computed(() => {
            return classPackages.value.reduce((sum, pkg) => sum + pkg.used, 0);
        });

        const getPackageName = (id) => {
            const pkg = classPackages.value.find(p => p.id === id);
            return pkg ? pkg.name : '未知课包';
        };

        // Scratch 创意工坊分享项目 (精选)
        const scratchSharedProjects = ref([
            { id: 801, title: '植物大战僵尸Remix', author: 'GeekBoy', likes: 128, colorBg: 'bg-green-400', icon: 'fa-solid fa-plant-wilt' },
            { id: 802, title: '弹球王者', author: 'CodeStar', likes: 89, colorBg: 'bg-blue-400', icon: 'fa-solid fa-table-tennis-paddle-ball' },
            { id: 803, title: '互动故事书', author: 'Dreamer', likes: 256, colorBg: 'bg-purple-400', icon: 'fa-solid fa-book-open-reader' },
            { id: 804, title: '数学大冒险', author: 'MathWiz', likes: 45, colorBg: 'bg-red-400', icon: 'fa-solid fa-calculator' },
            { id: 805, title: '画板工具', author: 'Artist', likes: 67, colorBg: 'bg-yellow-400', icon: 'fa-solid fa-palette' }
        ]);

        // ================= [NEW] 全屏创意画廊数据 & 逻辑 =================
        const creativeGalleryModal = ref({ visible: false, filter: 'all' });
        const galleryFilters = [
            { label: '全部作品', value: 'all' },
            { label: '游戏 Game', value: 'game' },
            { label: '动画 Animation', value: 'animation' },
            { label: '艺术 Art', value: 'art' },
            { label: '音乐 Music', value: 'music' }
        ];

        // 模拟更多画廊数据
        const galleryItems = ref([
            { id: 1, title: '我的世界：生存模式', author: 'CraftMaster', likes: 1024, views: 5000, category: 'game', categoryLabel: 'Game', colorBg: 'bg-emerald-500', icon: 'fa-solid fa-cube', time: '1天前' },
            { id: 2, title: '太空漫游指南', author: 'StarWalker', likes: 856, views: 3200, category: 'animation', categoryLabel: 'Animation', colorBg: 'bg-indigo-500', icon: 'fa-solid fa-rocket', time: '2天前' },
            { id: 3, title: '钢琴块儿：致爱丽丝', author: 'MusicBox', likes: 2300, views: 12000, category: 'music', categoryLabel: 'Music', colorBg: 'bg-pink-500', icon: 'fa-solid fa-music', time: '3小时前' },
            { id: 4, title: '赛博朋克城市生成器', author: 'NeoArtist', likes: 560, views: 2100, category: 'art', categoryLabel: 'Art', colorBg: 'bg-purple-500', icon: 'fa-solid fa-city', time: '5天前' },
            { id: 5, title: '超级马里奥 Bros', author: 'RetroGamer', likes: 4500, views: 20000, category: 'game', categoryLabel: 'Game', colorBg: 'bg-red-500', icon: 'fa-solid fa-gamepad', time: '1周前' },
            { id: 6, title: 'AI 聊天机器人', author: 'CodeBot', likes: 780, views: 4000, category: 'game', categoryLabel: 'Game', colorBg: 'bg-blue-500', icon: 'fa-solid fa-robot', time: 'Just now' },
            { id: 7, title: '分形艺术展示', author: 'MathArt', likes: 320, views: 1500, category: 'art', categoryLabel: 'Art', colorBg: 'bg-teal-500', icon: 'fa-solid fa-shapes', time: '2天前' },
            { id: 8, title: '粒子特效演示', author: 'VFX_Pro', likes: 900, views: 3800, category: 'animation', categoryLabel: 'Animation', colorBg: 'bg-orange-500', icon: 'fa-solid fa-fire', time: '昨天' },
            { id: 9, title: '节奏光剑', author: 'BeatSaber', likes: 1500, views: 6000, category: 'music', categoryLabel: 'Music', colorBg: 'bg-rose-500', icon: 'fa-solid fa-bolt', time: '4天前' },
            { id: 10, title: '塔防：守卫雅典娜', author: 'StrategyGod', likes: 2100, views: 9000, category: 'game', categoryLabel: 'Game', colorBg: 'bg-yellow-500', icon: 'fa-solid fa-shield-halved', time: '1周前' },
            { id: 11, title: '海底世界屏保', author: 'OceanDeep', likes: 430, views: 2200, category: 'animation', categoryLabel: 'Animation', colorBg: 'bg-cyan-500', icon: 'fa-solid fa-fish', time: '3天前' },
            { id: 12, title: '像素画生成器', author: 'PixelArt', likes: 670, views: 2900, category: 'art', categoryLabel: 'Art', colorBg: 'bg-lime-500', icon: 'fa-solid fa-table-cells', time: '5小时前' }
        ]);

        const filteredGalleryItems = computed(() => {
            if (creativeGalleryModal.value.filter === 'all') return galleryItems.value;
            return galleryItems.value.filter(item => item.category === creativeGalleryModal.value.filter);
        });

        // 5. 右侧数据 (C++ 模式使用)
        const nextBooking = ref({ date: '周五 14:00', campus: '科技园校区', teacher: '王老师', time: '14:00 - 16:00' });
        const nextSpecial = ref({ title: '10周年·创客马拉松', location: '一阶教室', date: '11月24日', countdown: '3天' });
        const pendingHomework = ref([ 
            { id: 1, title: '数组与字符串综合练习', deadline: '23:59', type: 'cpp' }, 
            { id: 2, title: '制作“我的世界”开场动画', deadline: '明天', type: 'scratch' } 
        ]);
        const upcomingCompetitions = ref([
            { id: 101, title: '2025 新春编程挑战赛', startTime: '今天 14:00', status: 'live', countdown: '进行中' },
            { id: 102, title: '第 12 届创意编程大赛', startTime: '12月26日', status: 'upcoming', countdown: '2天后' }
        ]);

        // 公告数据
        const announcements = ref([
            { id: 99, title: '🎉 10周年庆典活动开启！', date: 'Just now', urgent: true, read: false, content: '亲爱的同学们，原因STEAM十周年啦！\n参与首页寻宝活动，赢取限定徽章！' },
            { id: 1, title: '服务器停机维护通知', date: '10m ago', urgent: true, read: false, content: '例行维护...' },
            { id: 2, title: 'S3 赛季结算完成', date: '昨天', urgent: false, read: false, content: '赛季结算...' }
        ]);
        const unreadAnnouncements = computed(() => announcements.value.filter(a => !a.read));

        // 足迹数据 (C++ 模式)
        const recentVideos = ref([
            { title: '第5章：深度优先搜索(DFS)基础', progress: 65, time: '20分钟前' },
            { title: 'Scratch 角色动画原理', progress: 100, time: '昨天' },
        ]);
        const recentProblemsRaw = ref([
            { id: 1005, title: 'P1005 矩阵取数游戏', difficulty: '提高', status: 'uncompleted', time: '10分钟前' },
            { id: 1002, title: 'P1002 过河卒', difficulty: '普及', status: 'uncompleted', time: '1小时前' },
            { id: 1001, title: 'P1001 A+B Problem', difficulty: '入门', status: 'completed', time: '昨天' },
        ]);

        const displayProblems = computed(() => {
            return [...recentProblemsRaw.value].sort((a, b) => {
                const statusWeightA = a.status === 'uncompleted' ? -1 : 1;
                const statusWeightB = b.status === 'uncompleted' ? -1 : 1;
                if (statusWeightA !== statusWeightB) return statusWeightA - statusWeightB;
                return 0;
            });
        });

        // 热力图 (C++ 模式)
        const activityData = ref([]);
        for (let i = 0; i < 35; i++) {
            const d = new Date(); d.setDate(d.getDate() - (34 - i));
            const minutes = Math.random() > 0.4 ? Math.floor(Math.random() * 180) : 0;
            activityData.value.push({ date: d.toLocaleDateString('zh-CN', {month:'numeric', day:'numeric'}), minutes: minutes });
        }
        
        const getHeatmapColor = (mins) => { 
            const colors = ['bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600'];
            if (mins === 0) return 'bg-slate-100'; 
            if (mins < 60) return colors[0]; 
            if (mins < 120) return colors[1]; 
            return colors[2]; 
        };
        const getHeatmapHeight = (mins) => { if (mins === 0) return '30%'; if (mins < 60) return '50%'; if (mins < 120) return '75%'; return '100%'; };

        // 辅助功能
        const getDifficultyClass = (diff) => {
            if (diff === '入门') return 'text-slate-500 border-slate-200 bg-slate-50';
            if (diff === '普及') return 'text-orange-500 border-orange-200 bg-orange-50';
            if (diff === '提高') return 'text-green-500 border-green-200 bg-green-50';
            return 'text-purple-500 border-purple-200 bg-purple-50';
        };
        const formatNumber = (num) => num ? num.toLocaleString() : '0';

        // 导航处理
        const handleNav = (type) => {
            if (type === 'rank') emit(currentTrack.value === 'cpp' ? 'nav-ladder' : 'nav-scratch-creative');
            if (type === 'work') emit(currentTrack.value === 'cpp' ? 'nav-cpp' : 'nav-scratch-personal');
        };

        const handleOpenTask = (task) => {
            if (task.type === 'scratch') emit('nav-scratch-personal');
            else emit('open-problem', task);
        };

        // ================= 沉浸式资产弹窗逻辑 (通用) =================
        const assetModal = ref({ visible: false, config: {}, balance: 0, history: [], stats: {} });
        const assetHistoryContainer = ref(null);
        
        // [Config Update] 配置现在支持 colorDark (深底亮字) 和 colorLight (白底深字)
        const assetConfig = {
            '积分': { label: 'Points', icon: 'fa-solid fa-gem', colorDark: 'text-blue-400', colorLight: 'text-blue-600', unit: 'PTS', bgGradient: 'from-blue-500 to-indigo-600' },
            '码豆': { label: 'Code Coins', icon: 'fa-solid fa-seedling', colorDark: 'text-emerald-400', colorLight: 'text-emerald-600', unit: 'COIN', bgGradient: 'from-emerald-500 to-teal-600' },
            '活跃点': { label: 'Activity', icon: 'fa-solid fa-fire', colorDark: 'text-rose-400', colorLight: 'text-rose-600', unit: 'ACT', bgGradient: 'from-rose-500 to-pink-600' },
            '天梯币': { label: 'Ladder Token', icon: 'fa-solid fa-trophy', colorDark: 'text-amber-400', colorLight: 'text-amber-600', unit: 'TKN', bgGradient: 'from-amber-500 to-orange-600' },
            '荣誉点': { label: 'Honor', icon: 'fa-solid fa-medal', colorDark: 'text-purple-400', colorLight: 'text-purple-600', unit: 'HNR', bgGradient: 'from-purple-500 to-fuchsia-600' }
        };

        const openAssetModal = (type) => {
            const config = assetConfig[type];
            const currentBal = props.user.currencies[type];
            const history = []; let earned = 0; let spent = 0;
            const reasons = ['每日签到', '课程完成', '作业奖励', '天梯胜场', '商城兑换'];
            for (let i = 0; i < 15; i++) {
                const isGain = Math.random() > 0.4;
                const amt = Math.floor(Math.random() * 100) + 10;
                if (isGain) earned += amt; else spent += amt;
                history.push({
                    date: '2023-10-24',
                    desc: reasons[Math.floor(Math.random() * reasons.length)],
                    amount: isGain ? amt : -amt
                });
            }
            assetModal.value = { visible: true, config, balance: currentBal, history, stats: { earned, spent } };
            window.addEventListener('keydown', handleAssetKeydown);
        };

        const closeAssetModal = () => { 
            assetModal.value.visible = false; 
            window.removeEventListener('keydown', handleAssetKeydown);
        };

        const handleAssetKeydown = (e) => {
            if (!assetModal.value.visible || !assetHistoryContainer.value) return;
            const scrollAmount = 150;
            if (e.key === 'ArrowDown') assetHistoryContainer.value.scrollBy({ top: scrollAmount, behavior: 'smooth' });
            else if (e.key === 'ArrowUp') assetHistoryContainer.value.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        };

        // 公告逻辑
        const bulletinModal = ref({ visible: false, data: {} });
        const bulletinModalRef = ref(null);
        const openBulletin = (news) => { bulletinModal.value = { visible: true, data: news }; };
        const closeBulletin = () => { bulletinModal.value.visible = false; };
        
        const markAsRead = (event) => {
            const news = announcements.value.find(a => a.id === bulletinModal.value.data.id);
            if (news) {
                news.read = true;
                bulletinModal.value.visible = false;
                emit('notification-read', news);
                emit('show-toast', '已归档', 'success');
            }
        };

        const markAllRead = () => {
            announcements.value.forEach(a => a.read = true);
            emit('show-toast', '全部已读', 'success');
        };

        const openCompetition = (comp) => { emit('nav-competition', comp.id); };

        return {
            // Track & Theme
            currentTrack, toggleTrack, theme, daysJoined,
            // Base
            currentDate, currentWeek, currentQuote, weatherData,
            userStats, nextBooking, nextSpecial,
            pendingHomework, upcomingCompetitions,
            recentVideos, displayProblems, getDifficultyClass,
            activityData, getHeatmapColor, getHeatmapHeight,
            announcements, unreadAnnouncements, formatNumber,
            // Scratch New Data
            scratchPersonalProjects, scratchTeamProjects, scratchSchedule, scratchSharedProjects,
            // Class Hour Management [NEW]
            classPackages, classHistory, classHourModal, totalRemainingHours, totalConsumedHours, getPackageName,
            // Creative Gallery [NEW]
            creativeGalleryModal, galleryFilters, filteredGalleryItems,
            // Actions
            handleNav, handleOpenTask,
            // Asset
            assetConfig, assetModal, openAssetModal, closeAssetModal, assetHistoryContainer, handleAssetKeydown,
            // Bulletin
            bulletinModal, openBulletin, closeBulletin, markAsRead, markAllRead, bulletinModalRef,
            openCompetition
        };
    }
};

window.DashboardFeature = DashboardFeature;