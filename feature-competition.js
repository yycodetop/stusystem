// ==========================================
// 模块名称：竞赛中心 (Feature Competition)
// 版本：V3.5 (视觉统一与历史回溯版)
// 更新内容：
// 1. [UX] 竞赛大厅列表隐藏滚动条，视觉更洁净。
// 2. [FEAT] 历史战绩视图支持查看单场比赛的详细排行榜。
// 3. [UI] 比赛中的“实时榜单”弹窗升级为电竞暗黑风格 (非全屏)。
// 4. [FIX] 确保题目详情页能正常唤起编程控制台。
// ==========================================

const CompetitionFeature = {
    props: ['user'],
    emits: ['open-problem', 'show-toast', 'go-back', 'toggle-lockdown', 'show-modal'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in-up">
        
        <!-- ================= 1. 竞赛大厅 (Lobby) ================= -->
        <div v-if="view === 'lobby'" class="flex-1 flex overflow-hidden">
            
            <!-- 左侧：赛事列表区 -->
            <div class="flex-1 flex flex-col p-6 overflow-hidden">
                <header class="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <i class="fa-solid fa-trophy text-yellow-500"></i> 竞赛中心
                        </h2>
                        <p class="text-sm text-slate-500 mt-1">以赛代练，问鼎巅峰</p>
                    </div>
                    <!-- 筛选 Tab -->
                    <div class="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button v-for="tab in lobbyTabs" :key="tab.id" @click="activeLobbyTab = tab.id" 
                                class="px-4 py-1.5 rounded-md text-xs font-bold transition-all"
                                :class="activeLobbyTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'">
                            {{ tab.name }}
                        </button>
                    </div>
                </header>

                <!-- [UPDATE] 添加 no-scrollbar 类隐藏滚动条 -->
                <div class="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-4">
                    <div v-if="filteredContests.length === 0" class="text-center py-10 text-slate-400">
                        <i class="fa-solid fa-inbox text-4xl mb-2 opacity-50"></i>
                        <p>暂无相关赛事</p>
                    </div>

                    <div v-for="contest in filteredContests" :key="contest.id" 
                         class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        
                        <!-- 标签：私有赛/付费赛 -->
                        <div class="absolute top-0 left-0 flex flex-col items-start z-20">
                            <div v-if="contest.isPrivate" class="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-br-lg shadow-sm mb-1">
                                <i class="fa-solid fa-lock mr-1"></i> 私有
                            </div>
                            <div v-if="contest.fee > 0" class="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-r-lg shadow-sm">
                                <i class="fa-solid fa-coins mr-1"></i> {{ contest.fee }}
                            </div>
                        </div>

                        <!-- 装饰背景 -->
                        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <i class="fa-solid fa-flag-checkered text-8xl transform rotate-12"></i>
                        </div>

                        <div class="flex items-start justify-between relative z-10">
                            <div class="flex gap-5">
                                <!-- 日期 Badge -->
                                <div class="flex flex-col items-center justify-center w-16 h-16 rounded-xl border shrink-0"
                                     :class="getStatusColor(contest).bgBorder">
                                    <span class="text-xs font-bold uppercase" :class="getStatusColor(contest).text">{{ contest.month }}</span>
                                    <span class="text-2xl font-bold" :class="getStatusColor(contest).text">{{ contest.day }}</span>
                                </div>
                                
                                <div>
                                    <div class="flex items-center gap-3 mb-1">
                                        <h3 class="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition flex items-center gap-2">
                                            {{ contest.title }}
                                            <!-- 已报名 Tag -->
                                            <span v-if="contest.isParticipated" class="text-[10px] bg-green-100 text-green-600 border border-green-200 px-1.5 py-0.5 rounded ml-1 flex items-center gap-1">
                                                <i class="fa-solid fa-check-circle"></i> 已报名
                                            </span>
                                        </h3>
                                        <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border" 
                                              :class="getStatusColor(contest).badge">
                                            {{ contest.statusLabel }}
                                        </span>
                                    </div>
                                    <p class="text-sm text-slate-500 mb-3 flex items-center gap-4 flex-wrap">
                                        <span><i class="fa-regular fa-clock mr-1"></i> {{ contest.duration }}</span>
                                        <span><i class="fa-solid fa-users mr-1"></i> {{ contest.participants }} 人报名</span>
                                        <span class="font-mono bg-slate-100 px-1.5 rounded text-xs border border-slate-200"><i class="fa-solid fa-code mr-1"></i>{{ contest.rule }}</span>
                                    </p>
                                    <div class="flex items-center gap-2">
                                        <span v-for="tag in contest.tags" :key="tag" class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">#{{ tag }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col items-end gap-2">
                                <div class="flex gap-2">
                                    <!-- 观赛按钮 -->
                                    <button v-if="contest.status === 'live'" 
                                            @click="enterSpectatorMode(contest)"
                                            class="px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition active:scale-95 flex items-center gap-2 group"
                                            title="观众视角查看榜单">
                                        <i class="fa-solid fa-eye group-hover:scale-110 transition-transform"></i> 围观
                                    </button>

                                    <!-- 主操作按钮 -->
                                    <button @click="handleContestAction(contest)" 
                                            class="px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95 flex items-center gap-2 relative overflow-hidden"
                                            :class="[getStatusColor(contest).btn, {'opacity-50 cursor-not-allowed': contest.status === 'upcoming' && contest.isParticipated}]"
                                            :disabled="contest.status === 'upcoming' && contest.isParticipated">
                                        
                                        <template v-if="contest.status === 'upcoming' && !contest.isParticipated">
                                            <span>立即报名</span>
                                            <span v-if="contest.fee > 0" class="text-[10px] bg-white/20 px-1 rounded ml-1">
                                                <i class="fa-solid fa-coins"></i> {{ contest.fee }}
                                            </span>
                                        </template>
                                        <template v-else>
                                            {{ getStatusColor(contest).btnText }}
                                        </template>
                                        
                                        <i v-if="!(contest.status === 'upcoming' && contest.isParticipated)" class="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                                
                                <!-- 状态提示文本 -->
                                <span v-if="contest.status === 'live'" class="text-xs text-red-500 font-mono font-bold animate-pulse">
                                    进行中: {{ contest.displayTimeLeft }}
                                </span>
                                <span v-else-if="contest.status === 'upcoming' && contest.displayTimeLeft" class="text-xs text-indigo-500 font-mono font-bold">
                                    <template v-if="contest.isParticipated">等待开赛: </template>
                                    <template v-else>报名截止: </template>
                                    {{ contest.displayTimeLeft }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧：侧边栏 (我的记录) -->
            <div class="w-72 bg-white border-l border-slate-200 flex flex-col z-10">
                <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 class="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <i class="fa-solid fa-user-astronaut text-indigo-500"></i> 我的竞赛档案
                    </h3>
                </div>
                <!-- 资产展示 -->
                <div class="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex justify-between items-center">
                    <span class="text-xs text-amber-700 font-bold">我的天梯币</span>
                    <span class="font-mono font-black text-amber-600 text-lg flex items-center gap-1">
                        <i class="fa-solid fa-coins text-sm"></i> {{ user.currencies['天梯币'] }}
                    </span>
                </div>

                <div class="p-4 flex-1 overflow-y-auto">
                    <!-- 统计入口 -->
                    <div class="mb-6">
                        <div @click="view = 'history'" 
                             class="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-5 text-center shadow-lg shadow-indigo-200 cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden text-white">
                            <i class="fa-solid fa-chart-simple absolute -bottom-3 -right-3 text-6xl text-white/10 group-hover:rotate-12 transition-transform"></i>
                            <div class="text-4xl font-bold mb-1 relative z-10 font-mono">{{ myHistory.length }}</div>
                            <div class="text-xs font-bold text-indigo-100 relative z-10 flex items-center justify-center gap-1">
                                参赛场次 <i class="fa-solid fa-circle-chevron-right text-[10px] opacity-60 group-hover:opacity-100 transition-opacity"></i>
                            </div>
                            <div class="mt-2 text-[10px] text-indigo-200 bg-white/10 inline-block px-2 py-0.5 rounded-full border border-white/10">
                                查看全部战绩
                            </div>
                        </div>
                    </div>

                    <!-- 最近三战 -->
                    <h4 class="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span class="size-1.5 bg-slate-400 rounded-full"></span> 最近三战
                    </h4>
                    <div class="space-y-3 relative">
                        <div class="absolute left-1.5 top-2 bottom-2 w-px bg-slate-200"></div>
                        <div v-for="(hist, idx) in myHistory.slice(0, 3)" :key="hist.id" class="relative pl-5 py-1 group cursor-default">
                            <div class="absolute left-0 top-3 size-3 rounded-full border-2 border-white shadow-sm z-10" :class="hist.rank <= 3 ? 'bg-yellow-400' : 'bg-slate-300'"></div>
                            <div class="bg-white border border-slate-100 p-2.5 rounded-lg shadow-sm group-hover:shadow-md group-hover:border-indigo-100 transition">
                                <div class="font-bold text-slate-700 truncate text-xs mb-1" :title="hist.title">{{ hist.title }}</div>
                                <div class="flex justify-between items-center">
                                    <span class="text-[10px] text-slate-400 font-mono">{{ hist.date }}</span>
                                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded border" :class="hist.rank <= 3 ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-slate-50 text-slate-500 border-slate-100'">
                                        <i class="fa-solid fa-ranking-star mr-0.5"></i> Rank {{ hist.rank }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= 2. 赛事仪表盘 (Participant View) ================= -->
        <div v-else-if="view === 'dashboard'" class="flex-1 flex flex-col h-full bg-[#f8fafc]">
            <!-- Dashboard Header -->
            <header class="bg-white border-b border-slate-200 px-6 py-2 flex justify-between items-center shadow-sm z-20 sticky top-0 h-16">
                <div class="flex items-center gap-4">
                    <button @click="exitContest" class="size-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition" title="交卷/退出">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                    <div>
                        <h2 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {{ currentContest.title }}
                            <span v-if="isFrozen" class="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded animate-pulse"><i class="fa-solid fa-snowflake"></i> 封榜中</span>
                        </h2>
                        <div class="flex items-center gap-2 text-[10px] text-slate-400">
                            <span class="bg-indigo-50 text-indigo-600 px-1.5 rounded font-bold">{{ currentContest.rule }}赛制</span>
                        </div>
                    </div>
                </div>
                <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center top-1">
                    <div class="text-3xl font-mono font-bold tracking-widest text-slate-800 tabular-nums" :class="{'text-red-500 animate-pulse': isUrgent}">{{ timerDisplay }}</div>
                    <div class="h-1 w-32 bg-slate-200 rounded-full mt-1 overflow-hidden"><div class="h-full bg-indigo-500 transition-all duration-1000" :style="{ width: progressPercent + '%' }"></div></div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="text-right mr-2 hidden md:block">
                        <div class="text-xs font-bold text-slate-700">Rank: {{ myRank > 0 ? myRank : '-' }}</div>
                        <div class="text-[10px] text-slate-400">Solved: {{ mySolved }} / {{ problems.length }}</div>
                    </div>
                    <button @click="showRankings = true" class="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition flex items-center gap-2 shadow-lg shadow-slate-300">
                        <i class="fa-solid fa-list-ol"></i> 榜单
                    </button>
                </div>
            </header>

            <div class="flex-1 flex overflow-hidden">
                <!-- 题目列表 -->
                <div class="w-1/4 min-w-[280px] max-w-xs border-r border-slate-200 bg-white flex flex-col z-10">
                    <div class="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider">题目列表 ({{ problems.length }})</h3>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-2">
                        <div v-for="(prob, idx) in problems" :key="prob.id" @click="selectProblem(prob)"
                             class="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group relative overflow-hidden"
                             :class="[currentProblem?.id === prob.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm']">
                            <div class="size-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0" :class="prob.myStatus === 'AC' ? getBalloonColor(idx) : 'bg-slate-400'">
                                {{ String.fromCharCode(65 + idx) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-sm truncate" :class="currentProblem?.id === prob.id ? 'text-indigo-900' : 'text-slate-700'">{{ prob.title }}</h4>
                                <div class="flex justify-between items-center mt-1">
                                    <div v-if="prob.myStatus === 'AC'" class="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 rounded flex items-center gap-1">Accepted</div>
                                    <div v-else class="text-[10px] text-slate-400">未通过</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 详情区 -->
                <div class="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div v-if="!currentProblem" class="flex-1 flex flex-col items-center justify-center text-slate-400"><i class="fa-solid fa-code text-6xl mb-4 opacity-20"></i><p class="font-bold">请选择一道题目开始</p></div>
                    <template v-else>
                         <div class="flex items-center gap-6 px-8 border-b border-slate-200 bg-white sticky top-0 z-10">
                            <button @click="problemTab = 'desc'" class="py-3 text-sm font-bold border-b-2 transition border-indigo-600 text-indigo-600"><i class="fa-solid fa-file-lines mr-1"></i> 题目描述</button>
                        </div>
                        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <h1 class="text-3xl font-bold text-slate-800 mb-6">{{ String.fromCharCode(65 + problems.indexOf(currentProblem)) }}. {{ currentProblem.title }}</h1>
                            <div class="prose prose-slate max-w-none mb-8"><div v-html="renderMarkdown(currentProblem.description)"></div></div>
                        </div>
                        <!-- 底部动作栏 -->
                        <div class="p-4 border-t border-slate-200 bg-white flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                            <span class="text-xs text-slate-400"><i class="fa-solid fa-circle-info mr-1"></i> {{ isFrozen ? '当前处于封榜时间，提交结果将暂不公开' : '提交后请前往“提交记录”查看结果' }}</span>
                            <button @click="solveProblem(currentProblem)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition transform active:scale-95 flex items-center gap-2"><i class="fa-solid fa-terminal"></i> 编写代码 / 提交</button>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- ================= 3. 沉浸式观赛 (Spectator) ================= -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="view === 'spectator'" class="fixed inset-0 z-[9999] bg-[#020617] flex flex-col text-white font-sans overflow-hidden">
                    <header class="h-24 shrink-0 flex items-center justify-between px-10 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 relative shadow-2xl">
                        <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] animate-pulse"></div>
                        <div class="flex items-center gap-6 relative z-10">
                             <div class="size-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-white/20">
                                <i class="fa-solid fa-trophy text-yellow-300"></i>
                            </div>
                            <div>
                                <h1 class="text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 uppercase drop-shadow-lg">{{ currentContest?.title }}</h1>
                                <div class="flex items-center gap-4 text-xs font-bold font-mono text-indigo-300 mt-1">
                                    <span class="bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30 animate-pulse flex items-center gap-1"><i class="fa-solid fa-circle text-[8px]"></i> LIVE</span>
                                    <span><i class="fa-solid fa-globe"></i> GLOBAL RANKINGS</span>
                                </div>
                            </div>
                        </div>
                        <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                             <div class="text-5xl font-black font-mono tracking-widest tabular-nums text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.9)]">{{ timerDisplay }}</div>
                        </div>
                        <div class="flex items-center gap-6 relative z-10">
                            <button @click="exitSpectator" class="group relative px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition overflow-hidden">
                                <span class="relative z-10 text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">Exit View</span>
                            </button>
                        </div>
                    </header>
                    <div class="flex-1 overflow-hidden relative flex flex-col px-10 py-8">
                        <!-- Spectator Ranking Table (Shared Structure) -->
                        <div class="flex-1 bg-[#1e293b]/40 backdrop-blur-2xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col relative z-10">
                            <div class="h-14 bg-white/5 border-b border-white/5 flex items-center px-6 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                                <div class="w-24 text-center">Rank</div><div class="w-72 pl-4">Contestant</div><div class="w-24 text-center text-white">Solved</div><div class="w-28 text-center">Penalty</div>
                                <div class="flex-1 grid grid-flow-col auto-cols-min gap-1"><div v-for="(p, i) in problems" :key="p.id" class="w-20 text-center text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition rounded py-1" @click="inspectSpectatorProblem(p, i)">{{ String.fromCharCode(65 + i) }}</div></div>
                            </div>
                            <div class="flex-1 overflow-y-auto custom-scrollbar">
                                <div v-for="(player, idx) in leaderboard" :key="player.id" class="h-16 border-b border-white/5 transition flex items-center px-6 group relative hover:bg-white/10" :class="idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'">
                                    <div class="w-24 text-center font-black text-xl italic flex justify-center"><div v-if="idx === 0" class="text-yellow-400 drop-shadow-lg scale-110"><i class="fa-solid fa-crown mr-1"></i>1</div><div v-else-if="idx === 1" class="text-slate-300">2</div><div v-else-if="idx === 2" class="text-orange-400">3</div><div v-else class="text-slate-500 font-mono">{{ idx + 1 }}</div></div>
                                    <div class="w-72 pl-4 flex items-center gap-4">
                                        <div class="size-10 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-sm overflow-hidden shadow-inner"><img v-if="player.avatar" :src="player.avatar" class="w-full h-full object-cover"><i v-else class="fa-solid fa-user text-slate-400"></i></div>
                                        <div class="flex flex-col justify-center"><span class="font-bold text-slate-200 text-sm">{{ player.name }}</span><span class="text-[10px] text-slate-500 font-mono" v-if="player.school">{{ player.school }}</span></div>
                                    </div>
                                    <div class="w-24 text-center font-black text-2xl text-indigo-400">{{ player.solved }}</div><div class="w-28 text-center font-mono text-slate-500 text-sm">{{ player.time }}</div>
                                    <div class="flex-1 grid grid-flow-col auto-cols-min gap-1 opacity-90">
                                        <div v-for="(status, pid) in player.problems" :key="pid" class="w-20 h-12 flex items-center justify-center p-1.5">
                                            <div v-if="status.state === 'ac'" class="w-full h-full rounded bg-gradient-to-br flex flex-col items-center justify-center shadow-lg relative border" :class="status.first ? 'from-yellow-600/80 to-yellow-800/80 border-yellow-500/50' : 'from-green-600/60 to-green-900/60 border-green-500/30'">
                                                <span class="font-bold text-white text-xs z-10 flex items-center gap-1"><i v-if="status.first" class="fa-solid fa-star text-[8px] text-yellow-200"></i>{{ Math.floor(status.time / 60) }}</span>
                                            </div>
                                            <div v-else-if="status.state === 'wa'" class="w-full h-full rounded bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center"><span class="text-red-400 text-xs font-bold">-{{ status.tries }}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <transition name="slide-right">
                        <div v-if="spectatorProblem.open && spectatorProblem.data" class="absolute right-0 top-24 bottom-0 w-[500px] bg-[#1e293b]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right">
                            <div class="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                                <div><h3 class="text-2xl font-bold text-white flex items-center gap-3"><span class="text-indigo-400 font-mono text-xl">{{ String.fromCharCode(65 + spectatorProblem.index) }}.</span> {{ spectatorProblem.data.title }}</h3><div class="flex gap-4 mt-2 text-xs text-slate-400 font-mono"><span>Time: {{ spectatorProblem.data.timeLimit }}</span><span>Mem: {{ spectatorProblem.data.memLimit }}</span></div></div><button @click="spectatorProblem.open = false" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                            </div>
                            <div class="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-300 leading-relaxed text-sm"><div class="prose prose-invert max-w-none" v-html="renderMarkdown(spectatorProblem.data.description)"></div></div>
                        </div>
                    </transition>
                </div>
            </transition>
        </Teleport>

        <!-- ================= 4. 全屏战绩档案 (My Career Mode) ================= -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="view === 'history'" class="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col overflow-hidden text-slate-200 font-sans">
                    <div class="h-20 shrink-0 flex items-center justify-between px-10 bg-[#1e293b]/50 backdrop-blur-md border-b border-white/5 relative">
                        <div class="flex items-center gap-4">
                            <div class="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                                <i class="fa-solid fa-user-astronaut"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-black text-white tracking-tight">我的竞赛生涯</h2>
                                <p class="text-xs text-slate-400 font-mono uppercase tracking-widest">My Competition Career</p>
                            </div>
                        </div>
                        <button @click="view = 'lobby'" class="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/10 text-slate-400 hover:text-white">
                            <i class="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    <div class="flex-1 overflow-y-auto custom-scrollbar p-10">
                        <div class="max-w-7xl mx-auto space-y-10">
                            <!-- Stats Cards (Same as before) -->
                            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div class="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-[#1e293b]/60 transition">
                                    <div class="absolute -right-4 -bottom-4 text-8xl text-indigo-500/10 rotate-12 group-hover:scale-110 transition"><i class="fa-solid fa-trophy"></i></div>
                                    <div class="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">参赛总数</div>
                                    <div class="text-5xl font-black text-white font-mono">{{ myHistory.length }}</div>
                                </div>
                                <div class="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-[#1e293b]/60 transition">
                                    <div class="absolute -right-4 -bottom-4 text-8xl text-yellow-500/10 rotate-12 group-hover:scale-110 transition"><i class="fa-solid fa-medal"></i></div>
                                    <div class="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">金牌数</div>
                                    <div class="text-5xl font-black text-yellow-400 font-mono">{{ myHistory.filter(h=>h.medal==='gold').length }}</div>
                                </div>
                                <div class="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-[#1e293b]/60 transition">
                                    <div class="absolute -right-4 -bottom-4 text-8xl text-green-500/10 rotate-12 group-hover:scale-110 transition"><i class="fa-solid fa-check-double"></i></div>
                                    <div class="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">累计解题</div>
                                    <div class="text-5xl font-black text-green-400 font-mono">{{ myHistory.reduce((acc, cur) => acc + cur.solved, 0) }}</div>
                                </div>
                                <div class="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-[#1e293b]/60 transition flex items-center justify-center">
                                    <div class="relative size-32 opacity-80"><div class="absolute inset-0 border-2 border-slate-700 rotate-45"></div><div class="absolute inset-4 border-2 border-slate-700 rotate-45"></div><div class="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-bold">能力分布</div></div>
                                </div>
                            </div>

                            <!-- List -->
                            <div>
                                <h3 class="text-xl font-bold text-white mb-6 flex items-center gap-3"><span class="size-2 bg-indigo-500 rounded-full"></span> 历史战绩</h3>
                                <div class="space-y-4">
                                    <div v-for="record in myHistory" :key="record.id" 
                                         class="group relative bg-[#1e293b]/30 border border-white/5 hover:border-indigo-500/50 hover:bg-[#1e293b]/60 rounded-xl p-6 flex items-center justify-between transition-all duration-300 hover:translate-x-2">
                                        
                                        <div class="flex items-center gap-6">
                                            <div class="size-16 rounded-lg flex items-center justify-center text-2xl shadow-lg border border-white/10" :class="getMedalStyle(record.medal)"><i class="fa-solid fa-medal"></i></div>
                                            <div>
                                                <h4 class="text-lg font-bold text-white group-hover:text-indigo-400 transition">{{ record.title }}</h4>
                                                <div class="flex items-center gap-4 mt-1 text-xs text-slate-400 font-mono"><span><i class="fa-regular fa-calendar mr-1"></i> {{ record.date }}</span><span><i class="fa-solid fa-users mr-1"></i> Rank {{ record.rank }} / {{ record.totalRank }}</span></div>
                                            </div>
                                        </div>

                                        <div class="flex items-center gap-12">
                                            <div class="text-right">
                                                <div class="text-xs text-slate-500 font-bold uppercase">Solved</div>
                                                <div class="text-2xl font-black font-mono text-white"><span class="text-indigo-400">{{ record.solved }}</span><span class="text-slate-600 text-lg">/{{ record.total }}</span></div>
                                            </div>
                                            <!-- [UPDATE] 查看历史榜单按钮 -->
                                            <button @click="viewHistoryRankings(record)" class="size-10 rounded-full bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white flex items-center justify-center transition border border-white/10" title="查看本场排名">
                                                <i class="fa-solid fa-list-ol"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- [NEW] 历史榜单全屏弹窗 (Teleport) -->
        <Teleport to="body">
            <transition name="scale-in">
                <div v-if="showHistoryRankingsModal" class="fixed inset-0 z-[10000] bg-[#0f172a]/95 backdrop-blur-xl flex flex-col p-8">
                    <!-- 顶栏 -->
                    <div class="h-16 flex items-center justify-between shrink-0 mb-4">
                        <div class="flex items-center gap-4">
                            <div class="size-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl text-yellow-400 border border-white/10">
                                <i class="fa-solid fa-trophy"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-black text-white">{{ currentHistoryRecord?.title }}</h2>
                                <p class="text-xs text-slate-400 uppercase tracking-widest font-bold">Final Standings • {{ currentHistoryRecord?.date }}</p>
                            </div>
                        </div>
                        <button @click="showHistoryRankingsModal = false" class="size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    
                    <!-- 榜单主体 (复用 Spectator 样式) -->
                    <div class="flex-1 bg-[#1e293b]/60 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                        <div class="h-14 bg-white/5 border-b border-white/5 flex items-center px-6 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            <div class="w-24 text-center">Rank</div><div class="w-72 pl-4">Contestant</div><div class="w-24 text-center text-white">Solved</div><div class="w-28 text-center">Penalty</div>
                            <div class="flex-1 text-center text-slate-600">Problem Status Details</div>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar">
                            <!-- 模拟数据复用 leaderboard -->
                            <div v-for="(player, idx) in leaderboard" :key="player.id" class="h-16 border-b border-white/5 transition flex items-center px-6 hover:bg-white/5 text-slate-300">
                                <div class="w-24 text-center font-black text-xl italic flex justify-center"><span :class="idx<3?'text-yellow-400':''">{{ idx + 1 }}</span></div>
                                <div class="w-72 pl-4 flex items-center gap-4"><div class="size-8 rounded-full bg-slate-700 flex items-center justify-center text-xs"><i class="fa-solid fa-user"></i></div><span>{{ player.name }}</span></div>
                                <div class="w-24 text-center font-black text-xl text-indigo-400">{{ player.solved }}</div><div class="w-28 text-center font-mono text-slate-500">{{ player.time }}</div>
                                <div class="flex-1 flex justify-center opacity-50"><span class="text-xs text-slate-600">Detailed data archived</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- ================= 5. Modals ================= -->
        <!-- [UPDATE] 仪表盘实时榜单 (暗黑风格 Modal, 非全屏) -->
        <transition name="fade">
             <div v-if="showRankings" class="fixed inset-0 z-[150] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-[#1e293b] w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 text-slate-300">
                    <div class="h-16 bg-[#0f172a] border-b border-slate-700 flex justify-between items-center px-6 shrink-0 text-white">
                         <div><h3 class="font-bold text-lg flex items-center gap-2"><i class="fa-solid fa-list-ol text-yellow-400"></i> 实时排名 (Live Standings)</h3></div>
                         <button @click="showRankings = false" class="size-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                    </div>
                    <!-- 榜单内容 (复用暗色样式) -->
                    <div class="flex-1 overflow-auto bg-[#1e293b] custom-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-[#0f172a] sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th class="p-3 w-16 text-center border-b border-slate-700">Rank</th>
                                    <th class="p-3 w-48 border-b border-slate-700">Contestant</th>
                                    <th class="p-3 w-16 text-center border-b border-slate-700">Solved</th>
                                    <th class="p-3 w-20 text-center border-b border-slate-700">Penalty</th>
                                    <th v-for="(p, i) in problems" :key="p.id" class="p-3 text-center border-b border-slate-700">{{ String.fromCharCode(65 + i) }}</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm font-mono">
                                <tr v-for="(player, idx) in leaderboard" :key="player.id" class="border-b border-slate-700 hover:bg-white/5 transition">
                                    <td class="p-2 text-center text-white font-bold">{{ idx + 1 }}</td>
                                    <td class="p-2 text-white">{{ player.name }}</td>
                                    <td class="p-2 text-center text-indigo-400 font-bold">{{ player.solved }}</td>
                                    <td class="p-2 text-center text-slate-500">{{ player.time }}</td>
                                    <td v-for="(status, pid) in player.problems" :key="pid" class="p-1 text-center align-middle">
                                        <div v-if="status.state === 'ac'" class="w-full h-8 flex items-center justify-center rounded text-white text-xs bg-green-900/50 border border-green-700 text-green-400 font-bold">
                                            {{ Math.floor(status.time / 60) }}
                                        </div>
                                        <div v-else-if="status.state === 'wa'" class="w-full h-8 flex items-center justify-center rounded bg-red-900/50 border border-red-700 text-red-400 text-xs">-{{ status.tries }}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        </transition>

        <!-- 报名确认弹窗 (保持 V3.4 酷炫设计) -->
        <Teleport to="body">
            <transition name="scale-in">
                <div v-if="showRegisterModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" @click.self="showRegisterModal = false">
                    <div class="bg-[#0f172a] w-full max-w-md rounded-2xl border border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.2)] overflow-hidden relative">
                        <div class="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x"></div>
                        <div class="p-8 text-center relative z-10">
                            <div class="size-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]"><i class="fa-solid fa-file-signature"></i></div>
                            <h3 class="text-2xl font-black text-white uppercase italic tracking-wide mb-1">Confirm Registration</h3>
                            <p class="text-indigo-200/60 text-sm mb-6">{{ pendingContest?.title }}</p>
                            <div v-if="pendingContest?.fee > 0" class="bg-indigo-900/30 rounded-lg p-4 border border-indigo-500/20 mb-6">
                                <div class="flex justify-between items-center text-sm mb-2"><span class="text-slate-400">报名费用</span><span class="text-amber-400 font-bold"><i class="fa-solid fa-coins mr-1"></i> {{ pendingContest.fee }}</span></div>
                                <div class="flex justify-between items-center text-sm border-t border-white/10 pt-2"><span class="text-slate-400">当前余额</span><span class="text-slate-200 font-mono">{{ user.currencies['天梯币'] }}</span></div>
                            </div>
                            <div v-else class="bg-green-900/20 rounded-lg p-3 border border-green-500/20 mb-6 text-green-400 text-sm font-bold"><i class="fa-solid fa-ticket mr-1"></i> 本场比赛免费报名</div>
                            <div class="flex gap-4"><button @click="showRegisterModal = false" class="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white font-bold transition">取消</button><button @click="confirmRegistration" class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"><span>确认支付</span> <i class="fa-solid fa-check"></i></button></div>
                        </div>
                        <div class="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 进入比赛确认弹窗 (保持 V3.4 酷炫设计) -->
        <Teleport to="body">
            <transition name="scale-in">
                <div v-if="showEnterModal" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4" @click.self="showEnterModal = false">
                    <div class="bg-black w-full max-w-lg rounded-xl border border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.2)] overflow-hidden relative">
                        <div class="h-2 w-full bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,#7f1d1d_10px,#7f1d1d_20px)]"></div>
                        <div class="p-8 text-center relative z-10">
                            <div class="size-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-4xl mx-auto mb-6 border border-red-500/30 animate-pulse"><i class="fa-solid fa-shield-halved"></i></div>
                            <h3 class="text-3xl font-black text-white uppercase tracking-tighter mb-2">Security Check</h3>
                            <p class="text-red-400 font-bold text-sm mb-6">即将进入防作弊锁定模式</p>
                            <div class="text-left bg-slate-900/50 rounded-lg p-5 border border-white/10 space-y-3 mb-8 text-slate-300 text-sm">
                                <p class="flex items-start gap-3"><i class="fa-solid fa-triangle-exclamation text-yellow-500 mt-0.5"></i> <span>进入后全屏锁定，禁止切屏。</span></p>
                                <p class="flex items-start gap-3"><i class="fa-solid fa-eye text-indigo-500 mt-0.5"></i> <span>切屏超过 5 次将自动交卷。</span></p>
                                <p class="flex items-start gap-3"><i class="fa-solid fa-ban text-red-500 mt-0.5"></i> <span>禁止使用外部 IDE 或 AI 辅助工具。</span></p>
                            </div>
                            <button @click="confirmEnterContest" class="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transition transform hover:-translate-y-1 active:scale-95 group"><span class="group-hover:hidden">我已阅读并接受，开始比赛</span><span class="hidden group-hover:inline-block">ENTER CONTEST <i class="fa-solid fa-arrow-right ml-2"></i></span></button>
                            <button @click="showEnterModal = false" class="mt-4 text-slate-500 hover:text-slate-300 text-xs underline">暂不进入</button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 私有赛密码 Modal -->
        <transition name="fade">
            <div v-if="showPasswordModal" class="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <div class="bg-white rounded-xl shadow-2xl p-6 w-96 animate-scale-in">
                    <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2"><i class="fa-solid fa-lock text-slate-500"></i> 私有赛事验证</h3>
                    <input type="password" v-model="inputPassword" @keyup.enter="verifyPassword" class="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 mb-4 outline-none focus:border-indigo-500 transition text-center tracking-widest" placeholder="请输入密码">
                    <div class="flex gap-3"><button @click="showPasswordModal = false" class="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold">取消</button><button @click="verifyPassword" class="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200">进入比赛</button></div>
                </div>
            </div>
        </transition>

    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, onMounted, onUnmounted } = Vue;

        const view = ref('lobby');
        const activeLobbyTab = ref('all');
        const showRankings = ref(false); 
        const showPasswordModal = ref(false);
        const inputPassword = ref('');
        const pendingContest = ref(null);
        const problemTab = ref('desc'); 
        
        // Modals & History State
        const showRegisterModal = ref(false);
        const showEnterModal = ref(false);
        const showHistoryRankingsModal = ref(false);
        const currentHistoryRecord = ref(null);
        
        const spectatorProblem = ref({ open: false, data: null, index: 0 });

        const lobbyTabs = [
            { id: 'all', name: '全部赛事' },
            { id: 'live', name: '正在进行' },
            { id: 'upcoming', name: '即将开始' },
            { id: 'past', name: '往期回顾' }
        ];

        // [DATA] Mock Data
        const contests = ref([
            { id: 101, title: '2025 新春编程挑战赛', status: 'live', month: 'DEC', day: '24', duration: '3h', participants: 128, rule: 'ACM', tags: ['算法', '排位'], startTime: Date.now() - 3600000, endTime: Date.now() + 7200000, isPrivate: false, isParticipated: true, fee: 0 },
            { id: 105, title: 'CodeForces 镜像赛 #888', status: 'live', month: 'DEC', day: '24', duration: '2h', participants: 1240, rule: 'ACM', tags: ['镜像', '高难'], startTime: Date.now() - 1800000, endTime: Date.now() + 5400000, isPrivate: false, isParticipated: false, fee: 0 },
            { id: 102, title: '第 12 届校园杯选拔赛', status: 'upcoming', month: 'DEC', day: '26', duration: '5h', participants: 340, rule: 'OI', tags: ['选拔', '官方'], startTime: Date.now() + 86400000, endTime: Date.now() + 90000000, isPrivate: false, isParticipated: false, fee: 0 },
            { id: 106, title: '高阶算法专项排位赛', status: 'upcoming', month: 'DEC', day: '28', duration: '4h', participants: 56, rule: 'ACM', tags: ['精英', '奖金'], startTime: Date.now() + 172800000, endTime: Date.now() + 187200000, isPrivate: false, isParticipated: false, fee: 50 },
            { id: 107, title: 'C++ 基础周赛 (第10期)', status: 'upcoming', month: 'DEC', day: '25', duration: '2h', participants: 45, rule: 'ACM', tags: ['入门'], startTime: Date.now() + 3600000, endTime: Date.now() + 10800000, isPrivate: false, isParticipated: true, fee: 0 },
            { id: 103, title: '内部选拔测试赛', status: 'upcoming', month: 'JAN', day: '05', duration: '3h', participants: 10, rule: 'OI', tags: ['私有', '内部'], startTime: Date.now() + 864000000, endTime: Date.now() + 874800000, isPrivate: true, password: '123', isParticipated: false, fee: 0 },
            { id: 104, title: '2024 秋季热身赛', status: 'past', month: 'SEP', day: '15', duration: '3h', participants: 210, rule: 'ACM', tags: ['练习'], startTime: Date.now() - 100000000, endTime: Date.now() - 90000000, isPrivate: false, isParticipated: true, fee: 0 },
            { id: 108, title: '周五欢乐赛 (Div.3)', status: 'upcoming', month: 'DEC', day: '27', duration: '2h', participants: 88, rule: 'ACM', tags: ['娱乐', '新手'], startTime: Date.now() + 86400000 * 2, endTime: Date.now() + 86400000 * 2 + 7200000, isPrivate: false, isParticipated: false, fee: 10 },
        ]);

        const myHistory = ref([
            { id: 104, title: '2024 秋季热身赛', rank: 3, totalRank: 120, solved: 4, total: 5, date: '2024-09-15', medal: 'gold' },
            { id: 99, title: '暑期集训结营赛', rank: 12, totalRank: 80, solved: 2, total: 4, date: '2024-08-20', medal: 'bronze' },
            { id: 88, title: '新手入门赛 Round 5', rank: 45, totalRank: 300, solved: 1, total: 3, date: '2024-07-10', medal: null },
            { id: 76, title: 'DP 专题训练赛', rank: 5, totalRank: 50, solved: 5, total: 5, date: '2024-06-01', medal: 'silver' },
        ]);

        const problems = ref([
            { id: 'A', title: 'A+B Problem', description: 'Calculate a + b.', timeLimit: '1s', memLimit: '64MB', sampleInput: '1 2', sampleOutput: '3' },
            { id: 'B', title: 'The Water Problem', description: 'Classic water trap problem.', timeLimit: '1s', memLimit: '128MB', sampleInput: '4 2 0 3 2 5', sampleOutput: '9' },
            { id: 'C', title: 'Dynamic Grid', description: 'Hard grid problem.', timeLimit: '2s', memLimit: '256MB', sampleInput: '...', sampleOutput: '...' },
            { id: 'D', title: 'Magic Numbers', description: 'Math theory.', timeLimit: '1s', memLimit: '64MB', sampleInput: '...', sampleOutput: '...' },
        ]);

        const leaderboard = ref([
            { id: 1, name: 'Tourist', solved: 4, time: 240, isMe: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tourist', problems: { A: {state:'ac', time:600, tries:1, first:true}, B: {state:'ac', time:2700, tries:1, first:true}, C: {state:'ac', time:7200, tries:1}, D: {state:'ac', time:12000, tries:1} } },
            { id: 2, name: 'Benq', solved: 3, time: 180, isMe: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benq', problems: { A: {state:'ac', time:900, tries:1}, B: {state:'ac', time:3600, tries:1}, C: {state:'wa', tries:5}, D: {state:'ac', time:9000, tries:1} } },
            { id: 6, name: '周佳缘', solved: 1, time: 20, isMe: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', problems: { A: {state:'ac', time:1200, tries:1}, B: {state:'wa', tries:2}, C: {state:'pending', tries:1}, D: {state:'none'} } },
        ]);

        const filteredContests = computed(() => {
            let list = contests.value;
            if (activeLobbyTab.value !== 'all') { list = list.filter(c => c.status === activeLobbyTab.value); }
            list.forEach(c => { c.displayTimeLeft = calculateTimeLeft(c); });
            return list;
        });

        const myRank = computed(() => leaderboard.value.findIndex(p => p.isMe) + 1);
        const mySolved = computed(() => leaderboard.value.find(p => p.isMe)?.solved || 0);

        const currentContest = ref(null);
        const currentProblem = ref(null);
        const timerDisplay = ref('00:00:00');
        const progressPercent = ref(0);
        const isUrgent = ref(false);
        const isFrozen = ref(false); 
        const isVirtual = ref(false); 
        let timerInterval = null;

        const getStatusColor = (c) => {
            if (c.status === 'live') return { bgBorder: 'bg-red-50 border-red-200', text: 'text-red-600', badge: 'bg-red-100 text-red-600', btn: 'bg-red-600 hover:bg-red-700 text-white', btnText: '进入比赛', statusLabel: '进行中' };
            if (c.status === 'upcoming') {
                if (c.isParticipated) {
                    return { bgBorder: 'bg-green-50 border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-600', btn: 'bg-slate-100 text-slate-500', btnText: '等待开赛', statusLabel: '已报名' };
                } else {
                    return { bgBorder: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700 text-white', btnText: '立即报名', statusLabel: '报名中' };
                }
            }
            return { bgBorder: 'bg-slate-50 border-slate-200', text: 'text-slate-500', badge: 'bg-slate-100 text-slate-500', btn: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50', btnText: '查看复盘', statusLabel: '已结束' };
        };

        const getBalloonColor = (idx) => { const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500', 'bg-pink-400', 'bg-cyan-400', 'bg-orange-500']; return colors[idx % colors.length]; };
        const getRankStyle = (rank) => { if (rank === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-600' }; if (rank === 2) return { bg: 'bg-slate-200', text: 'text-slate-600' }; if (rank === 3) return { bg: 'bg-orange-100', text: 'text-orange-600' }; return { bg: 'bg-slate-50', text: 'text-slate-500' }; };
        const getMedalStyle = (medal) => {
            if (medal === 'gold') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            if (medal === 'silver') return 'bg-slate-400/20 text-slate-300 border-slate-400/50';
            if (medal === 'bronze') return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            return 'bg-white/5 text-slate-500 border-white/10';
        };

        // Actions
        const handleContestAction = (contest) => {
            pendingContest.value = contest;
            if (contest.status === 'live') {
                if (contest.isParticipated) {
                    showEnterModal.value = true;
                } else {
                    emit('show-toast', '比赛正在进行中，已无法报名，请围观比赛', 'warning');
                }
            } else if (contest.status === 'upcoming') {
                if (!contest.isParticipated) {
                    handleRegistration(contest);
                }
            } else if (contest.status === 'past') {
                tryEnterContest(contest);
            }
        };

        const handleRegistration = (contest) => {
            if (contest.isPrivate) {
                inputPassword.value = '';
                showPasswordModal.value = true;
            } else {
                showRegisterModal.value = true;
            }
        };

        const confirmRegistration = () => {
            const contest = pendingContest.value;
            const fee = contest.fee || 0;
            
            if (fee > 0 && (props.user.currencies['天梯币'] || 0) < fee) {
                emit('show-toast', '天梯币余额不足，请前往任务中心获取', 'error');
                showRegisterModal.value = false;
                return;
            }
            
            if (fee > 0) {
                props.user.currencies['天梯币'] -= fee; 
            }
            contest.isParticipated = true;
            contest.participants++;
            showRegisterModal.value = false;
            emit('show-toast', `报名成功！${fee > 0 ? '扣除 ' + fee + ' 天梯币' : ''}`, 'success');
        };

        const confirmEnterContest = () => {
            const contest = pendingContest.value;
            showEnterModal.value = false;
            currentContest.value = contest;
            view.value = 'dashboard';
            problemTab.value = 'desc';
            
            emit('toggle-lockdown', true);
            const totalDuration = contest.endTime - contest.startTime;
            const now = Date.now();
            let remaining = isVirtual.value ? contest.duration.replace('h', '') * 3600 : Math.max(0, (contest.endTime - now) / 1000);
            startTimer(remaining, totalDuration / 1000);
            
            setTimeout(() => {
                emit('show-toast', `欢迎参加 ${contest.title}`, 'success');
            }, 500);
        };

        const tryEnterContest = (contest) => {
             isVirtual.value = true;
             pendingContest.value = contest;
             showEnterModal.value = true; 
        };

        const enterSpectatorMode = (contest) => {
            currentContest.value = contest;
            view.value = 'spectator';
            const totalDuration = contest.endTime - contest.startTime;
            const now = Date.now();
            const remaining = Math.max(0, (contest.endTime - now) / 1000);
            startTimer(remaining, totalDuration / 1000);
            spectatorProblem.value = { open: false, data: null, index: 0 };
            emit('show-toast', `已进入 ${contest.title} 观赛室`, 'success');
        };
        
        const inspectSpectatorProblem = (problem, index) => { spectatorProblem.value = { open: true, data: problem, index: index }; };
        const exitSpectator = () => { view.value = 'lobby'; clearInterval(timerInterval); emit('show-toast', '已退出观赛', 'info'); };
        
        const verifyPassword = () => { 
            if (inputPassword.value === pendingContest.value.password) { 
                showPasswordModal.value = false; 
                pendingContest.value.isParticipated = true;
                pendingContest.value.participants++;
                emit('show-toast', '验证成功，已自动报名', 'success');
                if (pendingContest.value.status === 'live') {
                    showEnterModal.value = true;
                }
            } else { 
                emit('show-toast', '密码错误', 'error'); 
            } 
        };

        const exitContest = () => { 
            emit('show-modal', { 
                type: 'confirm', 
                title: '退出比赛确认', 
                message: '确定要交卷并退出比赛吗？\n退出后锁定模式将解除。', 
                callback: (confirmed) => { 
                    if (confirmed) { 
                        view.value = 'lobby'; 
                        clearInterval(timerInterval); 
                        isFrozen.value = false; 
                        emit('toggle-lockdown', false); 
                    } 
                } 
            }); 
        };

        const startTimer = (seconds, totalSeconds) => {
            if (timerInterval) clearInterval(timerInterval);
            let remaining = seconds;
            updateTimerDisplay(remaining);
            timerInterval = setInterval(() => {
                remaining--;
                if (remaining <= 0) { clearInterval(timerInterval); timerDisplay.value = '00:00:00'; return; }
                updateTimerDisplay(remaining);
                progressPercent.value = ((totalSeconds - remaining) / totalSeconds) * 100;
                isUrgent.value = remaining < 300; 
            }, 1000);
        };
        
        const updateTimerDisplay = (sec) => { const h = Math.floor(sec / 3600).toString().padStart(2, '0'); const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0'); const s = Math.floor(sec % 60).toString().padStart(2, '0'); timerDisplay.value = `${h}:${m}:${s}`; };
        function calculateTimeLeft(contest) { if (contest.status === 'past') return null; const target = contest.status === 'live' ? contest.endTime : contest.startTime; const diff = target - Date.now(); if (diff <= 0) return '00:00:00'; const h = Math.floor(diff / 3600000); const m = Math.floor((diff % 3600000) / 60000); const s = Math.floor((diff % 60000) / 1000); return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }

        let lobbyInterval;
        onMounted(() => { lobbyInterval = setInterval(() => { contests.value.forEach(c => c.displayTimeLeft = calculateTimeLeft(c)); }, 1000); });
        onUnmounted(() => { clearInterval(lobbyInterval); clearInterval(timerInterval); });

        const selectProblem = (prob) => { currentProblem.value = prob; problemTab.value = 'desc'; };
        const solveProblem = (prob) => { const contestProblem = { ...prob, isContest: true, contestId: currentContest.value.id }; emit('open-problem', contestProblem); };
        const renderMarkdown = (text) => { if (!text) return ''; if (typeof marked !== 'undefined') return marked.parse(text); return text; };
        const copyText = (text) => { emit('show-toast', '已复制到剪贴板', 'success'); };

        // [NEW] 查看历史榜单逻辑
        const viewHistoryRankings = (record) => {
            currentHistoryRecord.value = record;
            showHistoryRankingsModal.value = true;
        };

        return {
            view, lobbyTabs, activeLobbyTab, filteredContests, getStatusColor,
            myHistory, 
            tryEnterContest, enterSpectatorMode, inspectSpectatorProblem, exitSpectator, showPasswordModal, inputPassword, verifyPassword,
            handleContestAction, handleRegistration, // Actions
            currentContest, timerDisplay, progressPercent, isUrgent, isFrozen, isVirtual, exitContest,
            problems, currentProblem, selectProblem, getBalloonColor, problemTab, renderMarkdown, copyText, solveProblem,
            showRankings, leaderboard, myRank, mySolved,
            spectatorProblem,
            // Modals & History
            showRegisterModal, confirmRegistration,
            showEnterModal, confirmEnterContest,
            showHistoryRankingsModal, viewHistoryRankings, currentHistoryRecord,
            pendingContest, getRankStyle, getMedalStyle
        };
    }
};

window.CompetitionFeature = CompetitionFeature;