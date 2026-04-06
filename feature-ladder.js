// ==========================================
// 模块名称：天梯训练中心 (Feature Ladder)
// 版本：V3.7 (报名页精简优化)
// 更新内容：
// 1. [UI] 着陆页移除数据统计栏，聚焦核心行动。
// 2. [Content] 优化报名文案，移除特定赛季头像奖励描述。
// 3. [Feature] 保持全屏阻断与支付解锁逻辑不变。
// ==========================================

const LadderFeature = {
    props: ['user', 'viewMode'],
    emits: ['open-problem', 'show-toast', 'go-back', 'show-modal'], 
    
    template: `
    <div class="flex-1 flex flex-col gap-6 h-full overflow-hidden animate-fade-in-up relative">
        
        <!-- ================= 状态 A: 未报名 (全屏着陆页) ================= -->
        <div v-if="!isSignedUp" class="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
            <!-- 动态背景装饰 -->
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-50 via-white to-indigo-50/30"></div>
            
            <!-- 装饰光斑 -->
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px]"></div>

            <div class="relative z-10 text-center max-w-4xl px-8 flex flex-col items-center">
                
                <!-- 赛季 Logo -->
                <div class="mb-10 relative group">
                    <div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition duration-1000"></div>
                    <div class="size-36 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl mx-auto flex items-center justify-center text-7xl text-white shadow-2xl relative transform rotate-12 group-hover:rotate-0 transition-transform duration-700 border-4 border-white/20">
                        <i class="fa-solid fa-trophy"></i>
                    </div>
                    <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-slate-900 text-sm font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap border-2 border-white">
                        SEASON 3
                    </div>
                </div>

                <h1 class="text-5xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
                    算法天梯 <span class="text-indigo-600">S3 赛季</span>
                </h1>
                
                <p class="text-slate-500 text-lg mb-12 leading-relaxed max-w-xl">
                    全服 <span class="font-bold text-slate-700">12,450+</span> 名极客已集结。
                    <br>在这里挑战算法极限，点亮属于你的传说级荣誉徽章。
                    <span class="block mt-4 text-sm text-indigo-400 font-bold bg-indigo-50 py-2 px-4 rounded-full w-fit mx-auto border border-indigo-100">
                        <i class="fa-solid fa-code-branch mr-1"></i> 报名即刻解锁晋升路线与荣耀榜单
                    </span>
                </p>
                
                <!-- 报名按钮 -->
                <div class="flex flex-col items-center gap-5">
                    <button @click="handleSignUp" class="group relative px-20 py-5 bg-slate-900 text-white rounded-full font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden ring-4 ring-slate-100">
                        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient"></div>
                        <span class="relative flex items-center gap-3">
                            <i class="fa-solid fa-file-signature"></i> 立即报名参赛
                        </span>
                    </button>
                    <p class="text-xs text-slate-400 font-mono">
                        <i class="fa-solid fa-ticket mr-1 text-yellow-500"></i> 
                        入场费: <span class="font-bold text-slate-600">{{ seasonFee }}</span> 天梯币
                    </p>
                </div>
            </div>
        </div>

        <!-- ================= 状态 B: 已报名 (完整天梯界面) ================= -->
        <template v-else>
            <!-- 顶部区域: 赛季概览 + 排行榜入口 -->
            <div class="flex gap-6 h-48 shrink-0 animate-scale-in">
                <!-- 左侧：赛季与段位主卡片 -->
                <div @click="openRankChain" class="flex-1 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer border border-indigo-500/30">
                    <!-- 动态背景 -->
                    <div class="absolute top-0 right-0 size-80 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none animate-pulse"></div>
                    <div class="absolute bottom-0 left-0 size-60 bg-purple-500/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>
                    
                    <div class="relative z-10 h-full flex flex-col justify-between">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="flex items-center gap-3 mb-1">
                                    <h2 class="text-3xl font-black italic tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">S3 赛季</h2>
                                    <span class="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase shadow-lg shadow-indigo-500/50">已参赛</span>
                                </div>
                                <p class="text-indigo-200/60 text-xs flex items-center gap-2 mt-1">
                                    <i class="fa-regular fa-clock"></i> 赛季剩余 12 天 · 算法巅峰之战
                                </p>
                            </div>
                            <!-- 查看路线入口 -->
                            <div class="text-right">
                                <span class="text-xs text-indigo-300/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 group-hover:bg-white/10 transition flex items-center gap-2 backdrop-blur-sm group-hover:scale-105">
                                    晋升路线 <i class="fa-solid fa-arrow-right"></i>
                                </span>
                            </div>
                        </div>

                        <!-- 底部段位信息 -->
                        <div class="flex items-end gap-6 mt-2">
                            <div class="relative">
                                <i class="text-6xl drop-shadow-[0_0_25px_rgba(99,102,241,0.6)] filter transition-transform duration-500 group-hover:scale-110" 
                                   :class="[currentRankObj.icon, currentRankObj.color]"></i>
                            </div>
                            <div class="flex-1 pb-1">
                                <div class="flex items-end gap-3 mb-2">
                                    <h3 class="text-2xl font-black tracking-wide text-white">{{ currentRankObj.name }}</h3>
                                    <span class="text-lg font-bold opacity-80" :class="currentRankObj.color">IV</span>
                                </div>
                                <div v-if="nextRankObj" class="w-full max-w-md">
                                    <div class="flex justify-between text-xs mb-1.5 font-medium">
                                        <span class="text-slate-400">当前星数: <span class="text-yellow-400 font-bold">{{ totalStars }}</span></span>
                                        <span class="text-slate-500">距离升段还需 {{ starsNeeded }} 星</span>
                                    </div>
                                    <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                        <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 relative overflow-hidden transition-all duration-1000" :style="{width: progressPercent + '%'}"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧：天梯霸主 (仅展示前三，激励用户) -->
                <div class="w-80 bg-[#0f172a] rounded-2xl shadow-lg border border-slate-700/50 p-5 flex flex-col relative overflow-hidden group">
                    <!-- 顶部光效 -->
                    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.6)]"></div>
                    
                    <div class="flex justify-between items-center mb-4 relative z-10">
                        <h3 class="font-black text-yellow-500 text-sm flex items-center gap-2 uppercase tracking-wider">
                            <i class="fa-solid fa-crown"></i> 荣耀榜首
                        </h3>
                        <button @click="showFullRanking = true" class="text-[10px] text-slate-400 hover:text-white transition flex items-center gap-1">
                            完整榜单 <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                    
                    <div class="flex-1 flex items-end justify-center gap-2 pb-1 relative z-10">
                        <!-- No 2 -->
                        <div class="flex flex-col items-center gap-1 w-1/3 opacity-80">
                            <div class="size-10 rounded-full border border-slate-500 p-0.5 bg-slate-800">
                                <img :src="ladderTopPlayers[1]?.avatar" class="w-full h-full rounded-full grayscale hover:grayscale-0 transition">
                            </div>
                            <span class="text-[10px] text-slate-400 truncate w-full text-center">{{ ladderTopPlayers[1]?.name }}</span>
                        </div>
                        <!-- No 1 -->
                        <div class="flex flex-col items-center gap-1 pb-2 w-1/3 relative">
                            <i class="fa-solid fa-crown text-yellow-400 text-xl absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce"></i>
                            <div class="size-14 rounded-full border-2 border-yellow-400 p-0.5 bg-yellow-900/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                                <img :src="ladderTopPlayers[0]?.avatar" class="w-full h-full rounded-full">
                            </div>
                            <span class="text-xs font-bold text-yellow-100 truncate w-full text-center">{{ ladderTopPlayers[0]?.name }}</span>
                            <span class="text-[10px] text-yellow-500 font-mono">{{ ladderTopPlayers[0]?.stars }}★</span>
                        </div>
                        <!-- No 3 -->
                        <div class="flex flex-col items-center gap-1 w-1/3 opacity-80">
                            <div class="size-10 rounded-full border border-orange-800 p-0.5 bg-slate-800">
                                <img :src="ladderTopPlayers[2]?.avatar" class="w-full h-full rounded-full grayscale hover:grayscale-0 transition">
                            </div>
                            <span class="text-[10px] text-slate-400 truncate w-full text-center">{{ ladderTopPlayers[2]?.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 主内容区域 (Home / History) -->
            <div class="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in delay-100">
                
                <!-- Home View: Task Grid + Levels -->
                <div v-if="internalView === 'home'" class="flex flex-1 gap-6 overflow-hidden">
                     <!-- Levels Selector -->
                     <div class="w-72 flex flex-col gap-3 overflow-y-auto no-scrollbar py-2 px-1">
                        <div v-for="level in ladderLevels" :key="level.id"
                                class="relative transition-all duration-300 ease-out cursor-pointer group select-none"
                                :class="activeLadderLevel === level.id ? 'scale-105 z-10' : 'hover:scale-102 z-0 opacity-80 hover:opacity-100'"
                                @click="handleLevelClick(level)">
                            <div class="relative overflow-hidden rounded-xl border transition-all duration-300"
                                    :class="[activeLadderLevel === level.id ? 'h-24 bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-200 border-transparent' : 'h-16 bg-white border-slate-200 hover:border-indigo-300']">
                                    <div v-if="activeLadderLevel === level.id" class="absolute -right-6 -top-6 size-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                                    <div class="flex items-center h-full px-4 relative z-10">
                                        <div class="text-3xl font-black italic mr-4 w-10 text-center shrink-0" :class="activeLadderLevel === level.id ? 'text-white/30' : 'text-slate-200 group-hover:text-slate-300'">{{ level.id }}</div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center justify-between mb-1.5">
                                                <h4 class="font-bold text-sm truncate" :class="activeLadderLevel === level.id ? 'text-white' : 'text-slate-600'">Level {{ level.id }}</h4>
                                                <div v-if="level.status === 'locked'" class="flex items-center gap-1"><i class="fa-solid fa-lock text-xs text-slate-300"></i></div>
                                                <div v-else-if="activeLadderLevel !== level.id" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">共 {{ level.problemCount }} 题</div>
                                            </div>
                                            <div v-if="activeLadderLevel === level.id">
                                                <div class="flex justify-between text-[10px] text-indigo-100 mb-1"><span>完成进度</span><span class="font-mono">{{ level.passedCount }}/{{ level.problemCount }}</span></div>
                                                <div class="w-full bg-black/20 h-1.5 rounded-full overflow-hidden"><div class="bg-white h-full transition-all duration-1000" :style="{width: (level.passedCount / level.problemCount) * 100 + '%'}"></div></div>
                                            </div>
                                            <div v-else-if="level.status !== 'locked' && level.passedCount > 0" class="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1"><div class="bg-green-400 h-full" :style="{width: (level.passedCount / level.problemCount) * 100 + '%'}"></div></div>
                                            <div v-else-if="level.status === 'locked'" class="text-[10px] text-slate-400">需完成上一级解锁</div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>

                    <!-- Task Grid with Pagination -->
                    <div class="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                         <div class="flex items-center justify-between mb-6 shrink-0">
                            <div>
                                <h3 class="font-bold text-slate-800 text-lg flex items-center gap-3">
                                    Level {{ activeLadderLevel }} 挑战
                                    <span class="text-xs font-normal text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                                        本级星数: 
                                        <span class="font-bold font-mono">{{ levelStarStats.obtained }} / {{ levelStarStats.total }}</span>
                                        <i class="fa-solid fa-star text-yellow-400"></i>
                                    </span>
                                </h3>
                            </div>
                            <div class="relative w-64"><i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i><input v-model="ladderSearchQuery" type="text" placeholder="搜索题目编号或名称..." class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition"></div>
                        </div>
                        <div class="flex-1 flex flex-col justify-between min-h-0">
                            <div class="overflow-y-auto pr-2 custom-scrollbar">
                                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    <div v-for="task in paginatedTasks" :key="task.id" @click="handleTaskClick(task)" 
                                         class="rounded-xl border p-4 transition-all cursor-pointer group relative overflow-hidden h-24 flex flex-col animate-fade-in-up"
                                         :class="task.status === 'passed' 
                                            ? 'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200 shadow-sm hover:shadow-md' 
                                            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-indigo-300 hover:shadow-md'">
                                        
                                        <div class="absolute top-3 right-3 z-20">
                                            <div v-if="task.status === 'passed'" class="text-[10px] text-indigo-700 font-bold bg-white/60 px-2 py-0.5 rounded border border-indigo-200 shadow-sm backdrop-blur-sm">
                                                +{{ task.score }} pts
                                            </div>
                                            <div v-else class="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:bg-white">
                                                {{ task.score }} pts
                                            </div>
                                        </div>

                                        <div class="relative z-10 pr-12">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="font-mono text-[10px] px-1.5 rounded" 
                                                      :class="task.status === 'passed' ? 'text-indigo-700 bg-indigo-200/50' : 'text-slate-500 bg-slate-200/50'">
                                                      #{{ task.id }}
                                                </span>
                                                <h4 class="font-bold text-sm transition truncate"
                                                    :class="task.status === 'passed' ? 'text-indigo-900' : 'text-slate-700 group-hover:text-indigo-600'">
                                                    {{ task.title }}
                                                </h4>
                                                <i v-if="task.status === 'passed'" class="fa-solid fa-circle-check text-indigo-500 text-xs shadow-sm"></i>
                                            </div>
                                            <p class="text-[10px] line-clamp-2 leading-relaxed"
                                               :class="task.status === 'passed' ? 'text-indigo-700/80' : 'text-slate-400 group-hover:text-slate-500'">
                                               {{ task.description }}
                                            </p>
                                        </div>
                                        
                                        <i class="fa-solid fa-code absolute -bottom-2 -right-2 text-5xl opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none"
                                           :class="task.status === 'passed' ? 'text-indigo-300 group-hover:text-indigo-400/20' : 'text-slate-200 group-hover:text-indigo-50'">
                                        </i>
                                    </div>
                                </div>
                                <div v-if="paginatedTasks.length === 0" class="h-64 flex flex-col items-center justify-center text-slate-400"><i class="fa-solid fa-box-open text-4xl mb-2 opacity-50"></i><p class="text-sm">未找到相关题目</p></div>
                            </div>
                            <div v-if="totalPages > 1" class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between shrink-0 select-none">
                                <div class="text-xs text-slate-400">显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredLadderTasks.length) }} 项，共 {{ filteredLadderTasks.length }} 题</div>
                                <div class="flex items-center gap-2"><button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="size-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left"></i></button><div class="flex gap-1"><button v-for="p in totalPages" :key="p" @click="changePage(p)" v-show="shouldShowPage(p)" class="size-8 rounded-lg flex items-center justify-center text-xs font-bold transition" :class="currentPage === p ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'">{{ p }}</button></div><button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="size-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right text-xs"></i></button></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History View: 历史赛季记录 -->
                <div v-else-if="internalView === 'history'" class="flex-1 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <button @click="internalView = 'home'" class="mb-2 text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-bold transition">
                                <i class="fa-solid fa-arrow-left"></i> 返回训练
                            </button>
                            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <i class="fa-solid fa-clock-rotate-left text-indigo-500"></i> 历史赛季档案
                            </h2>
                        </div>
                        <div class="flex gap-4">
                            <div class="text-center px-4 py-2 bg-white rounded-lg border border-slate-100">
                                <div class="text-[10px] text-slate-400 uppercase font-bold">累计获得星数</div>
                                <div class="text-lg font-bold text-yellow-500 font-mono">{{ totalStars + 450 }}</div>
                            </div>
                            <div class="text-center px-4 py-2 bg-white rounded-lg border border-slate-100">
                                <div class="text-[10px] text-slate-400 uppercase font-bold">最高历史段位</div>
                                <div class="text-lg font-bold text-rose-500">钻石大师</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto p-0 custom-scrollbar">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th class="p-4 border-b">赛季名称</th>
                                    <th class="p-4 border-b">结算排名</th>
                                    <th class="p-4 border-b">最终段位</th>
                                    <th class="p-4 border-b">获得星数</th>
                                    <th class="p-4 border-b">积分奖励</th>
                                    <th class="p-4 border-b">天梯币奖励</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                <tr v-for="season in historySeasons" :key="season.id" class="border-b hover:bg-slate-50 transition group">
                                    <td class="p-4 font-bold text-slate-700">
                                        {{ season.name }}
                                        <span class="text-[10px] font-normal text-slate-400 block mt-0.5">{{ season.date }}</span>
                                    </td>
                                    <td class="p-4">
                                        <div class="flex items-center gap-2">
                                            <span class="size-6 rounded flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-600">{{ season.rank }}</span>
                                            <i v-if="season.rank <= 10" class="fa-solid fa-trophy text-yellow-400 text-xs"></i>
                                        </div>
                                    </td>
                                    <td class="p-4">
                                        <span class="flex items-center gap-2 font-bold" :class="getRankColor(season.tier)">
                                            <i class="fa-solid" :class="getRankIcon(season.tier)"></i> {{ season.tier }}
                                        </span>
                                    </td>
                                    <td class="p-4 font-mono font-bold text-slate-600">
                                        {{ season.stars }} <i class="fa-solid fa-star text-yellow-400 text-xs"></i>
                                    </td>
                                    <td class="p-4 font-mono text-indigo-600 font-bold">
                                        +{{ season.points }} pts
                                    </td>
                                    <td class="p-4">
                                        <span class="bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs font-bold border border-orange-100 flex items-center w-fit gap-1">
                                            <i class="fa-solid fa-coins"></i> {{ season.coins }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </template>

        <!-- 模态框 1: 完整排行榜 (Teleport) - [UPDATED: 优化自我定位显示] -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showFullRanking" class="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="showFullRanking = false">
                    <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in border border-slate-200">
                        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white shadow-md z-10">
                            <h3 class="font-bold flex items-center gap-2"><i class="fa-solid fa-trophy text-yellow-300"></i> 完整天梯榜单</h3>
                            <button @click="showFullRanking = false" class="hover:bg-white/20 rounded-full size-8 flex items-center justify-center transition"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto p-2 custom-scrollbar bg-slate-50">
                            <div v-for="(player, idx) in sortedFullRanking" :key="idx" 
                                 class="flex flex-col rounded-xl border mb-2 transition relative overflow-hidden"
                                 :class="player.name === user.name ? 'bg-white border-indigo-300 shadow-lg ring-1 ring-indigo-100 z-10 scale-[1.01] my-3' : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-sm'">
                                
                                <!-- 主内容行 -->
                                <div class="flex items-center gap-4 p-3 relative z-10">
                                    <div v-if="player.name === user.name" class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                                    <div class="w-8 flex justify-center">
                                        <span class="font-bold italic text-lg" :class="{ 'text-yellow-500 drop-shadow-sm': idx === 0, 'text-slate-400': idx === 1, 'text-orange-500': idx === 2, 'text-slate-300': idx > 2 }">
                                            <i v-if="idx < 3" class="fa-solid fa-crown text-[10px] absolute -mt-2"></i>
                                            {{ idx + 1 }}
                                        </span>
                                    </div>
                                    <img :src="player.avatar" class="size-10 rounded-full border border-slate-200 shadow-sm object-cover" :class="idx<3 ? 'ring-2 ring-offset-1 ring-yellow-400/30' : ''">
                                    <div class="flex-1 min-w-0">
                                        <div class="flex items-center gap-2">
                                            <h4 class="font-bold text-sm text-slate-800 truncate">{{ player.name }}</h4>
                                            <span v-if="player.name === user.name" class="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-medium shadow-sm">ME</span>
                                        </div>
                                        <p class="text-[10px] text-slate-400 truncate">Lv.{{ Math.floor(player.stars / 20) + 1 }} 进阶者</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="font-bold text-slate-700 text-sm flex items-center gap-1 justify-end">
                                            {{ player.stars }} <i class="fa-solid fa-star text-yellow-400 text-xs"></i>
                                        </p>
                                    </div>
                                </div>

                                <!-- [NEW] 差距分析条 (仅针对自己显示) -->
                                <div v-if="player.name === user.name" class="bg-slate-50 px-3 py-1.5 border-t border-slate-100 flex items-center justify-between text-xs animate-fade-in">
                                    <!-- 情况A: 不是第一名，显示与上一名的差距 -->
                                    <div v-if="idx > 0" class="flex items-center gap-2 w-full">
                                        <div class="flex items-center gap-1 text-slate-400">
                                            <i class="fa-solid fa-crosshairs"></i> 目标: <span class="font-bold text-slate-600">{{ sortedFullRanking[idx-1].name }}</span>
                                        </div>
                                        <div class="flex-1 border-b border-dashed border-slate-300 mx-2 relative top-[1px]"></div>
                                        <div class="flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                            <i class="fa-solid fa-arrow-trend-up"></i> 
                                            差 {{ sortedFullRanking[idx-1].stars - player.stars }} 星
                                        </div>
                                    </div>
                                    <!-- 情况B: 是第一名，显示领先优势 -->
                                    <div v-else class="flex items-center justify-center w-full gap-2 text-yellow-600 font-bold py-0.5">
                                        <i class="fa-solid fa-crown text-yellow-500 animate-bounce"></i>
                                        <span v-if="sortedFullRanking.length > 1">遥遥领先第二名 {{ player.stars - sortedFullRanking[1].stars }} 星</span>
                                        <span v-else>独孤求败，暂无对手</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 模态框 2: 晋升路线图 (Fix: 修复连接线错位) -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showRankChain" class="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-8 overflow-hidden" @click.self="showRankChain = false">
                    <div class="w-full max-w-7xl h-[70vh] flex flex-col relative animate-scale-in">
                        <button @click="showRankChain = false" class="absolute -top-12 right-0 text-white/50 hover:text-white transition flex items-center gap-2"><span class="text-sm font-bold">关闭</span> <i class="fa-regular fa-circle-xmark text-2xl"></i></button>
                        
                        <div class="text-center text-white mb-16">
                            <h2 class="text-4xl font-black mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200">天梯荣耀之路</h2>
                            <p class="text-indigo-200/60 font-mono">ROAD TO GLORY</p>
                        </div>

                        <!-- 荣耀之路滚动容器 -->
                        <div class="flex-1 flex items-center px-10 overflow-x-auto custom-scrollbar pb-8">
                            <div class="flex gap-0 mx-auto"> <!-- 使用 flex 布局自然排列 -->
                                <div v-for="(rank, idx) in rankSystem" :key="rank.id" 
                                     class="relative flex flex-col items-center group w-64 shrink-0">
                                    
                                    <!-- 1. 连接线 (使用伪元素或绝对定位，连接当前节点中心到下一个节点中心) -->
                                    <div v-if="idx < rankSystem.length - 1" 
                                         class="absolute top-[3.5rem] left-1/2 w-full h-1 bg-slate-800 -z-10">
                                        <!-- 激活状态的连接线 -->
                                        <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 origin-left transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                             :style="{width: (totalStars >= rankSystem[idx+1].minStars) ? '100%' : (totalStars > rank.minStars && totalStars < rankSystem[idx+1].minStars ? '50%' : '0%')}"></div>
                                    </div>

                                    <!-- 2. 段位图标圆环 -->
                                    <div class="size-28 rounded-full flex items-center justify-center border-4 bg-slate-900 transition-all duration-500 relative z-10 shadow-2xl"
                                         :class="[
                                            rank.id === currentRankObj.id ? 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)] scale-110' : 
                                            (totalStars >= rank.minStars ? 'border-indigo-500 shadow-indigo-500/20' : 'border-slate-700 opacity-60 grayscale')
                                         ]">
                                        <i class="text-4xl" :class="[rank.icon, rank.color]"></i>
                                        
                                        <!-- 当前标记 -->
                                        <div v-if="rank.id === currentRankObj.id" class="absolute -top-10 bg-yellow-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">Current Rank</div>
                                        
                                        <!-- 锁定图标 -->
                                        <div v-if="totalStars < rank.minStars" class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-[1px]"><i class="fa-solid fa-lock text-white/40 text-2xl"></i></div>
                                    </div>

                                    <!-- 3. 文字信息 -->
                                    <div class="mt-8 text-center transition-opacity duration-300" :class="totalStars < rank.minStars ? 'opacity-50' : 'opacity-100'">
                                        <h4 class="text-xl font-bold text-white mb-1">{{ rank.name }}</h4>
                                        <div class="text-xs text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 inline-block font-mono">
                                            {{ rank.minStars }}+ Stars
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- 模态框 3: 支付确认 (新增) -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="showPaymentModal" class="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4" @click.self="showPaymentModal = false">
                    <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-scale-in text-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        
                        <div class="size-16 rounded-full bg-indigo-50 mx-auto flex items-center justify-center mb-4 text-3xl text-indigo-500 shadow-inner">
                            <i class="fa-solid fa-ticket"></i>
                        </div>
                        
                        <h3 class="text-xl font-black text-slate-800 mb-2">确认报名 S3 赛季?</h3>
                        <p class="text-sm text-slate-500 mb-6 px-4">
                            将扣除您的账户余额 <strong class="text-slate-800">{{ seasonFee }}</strong> 天梯币。
                            <br>报名后立即解锁所有赛季挑战权限。
                        </p>

                        <div class="bg-slate-50 rounded-xl p-3 mb-6 flex justify-between items-center border border-slate-100">
                            <span class="text-xs text-slate-400 font-bold">当前余额</span>
                            <span class="font-mono font-bold" :class="user.currencies['天梯币'] >= seasonFee ? 'text-green-600' : 'text-red-500'">
                                {{ user.currencies['天梯币'] }} <i class="fa-solid fa-coins text-[10px]"></i>
                            </span>
                        </div>

                        <div class="flex gap-3">
                            <button @click="showPaymentModal = false" class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition">再想想</button>
                            <button @click="confirmPayment" 
                                    :disabled="user.currencies['天梯币'] < seasonFee || isProcessing"
                                    class="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <i v-if="isProcessing" class="fa-solid fa-circle-notch fa-spin"></i>
                                <span>{{ isProcessing ? '支付中...' : '确认支付' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

    </div>
    `,
    
    setup(props, { emit }) {
        const { ref, computed, onMounted, onUnmounted, watch } = Vue;

        const internalView = ref('home');
        
        watch(() => props.viewMode, (newVal) => {
            if(newVal) internalView.value = newVal;
        }, { immediate: true });

        // 报名与支付状态
        const isSignedUp = ref(false); // 默认未报名
        const showPaymentModal = ref(false);
        const isProcessing = ref(false);
        const seasonFee = 200;

        const handleSignUp = () => {
            showPaymentModal.value = true;
        };

        const confirmPayment = () => {
            if (props.user.currencies['天梯币'] < seasonFee) {
                emit('show-toast', '余额不足，请先获取更多天梯币！', 'error');
                return;
            }
            
            isProcessing.value = true;
            // 模拟API延时
            setTimeout(() => {
                props.user.currencies['天梯币'] -= seasonFee;
                isSignedUp.value = true;
                isProcessing.value = false;
                showPaymentModal.value = false;
                
                // 播放音效或显示更强的提示
                emit('show-toast', '报名成功！S3 赛季已解锁！', 'success');
                // 触发烟花或其他庆祝逻辑可在此添加
            }, 1000);
        };

        const openRankChain = () => {
            // [Updated] 因为全屏阻断，其实这里可以不判断，因为未报名看不到入口
            // 但保留作为防御性编程
            if(!isSignedUp.value) {
                emit('show-toast', '请先报名参赛以查看晋升路线', 'warning');
                return;
            }
            showRankChain.value = true;
        };

        const activeLadderLevel = ref(1); 
        const ladderSearchQuery = ref('');
        const showFullRanking = ref(false);
        const showRankChain = ref(false);
        const totalStars = ref(115); 
        
        const currentPage = ref(1);
        const pageSize = ref(12);

        // [NEW] 历史赛季数据
        const historySeasons = ref([
            { id: 1, name: 'S2 2024 春季赛', date: '2024.03 - 2024.06', rank: 5, tier: '钻石大师', stars: 450, points: 5200, coins: 1200 },
            { id: 2, name: 'S1 2023 冬季赛', date: '2023.11 - 2024.02', rank: 12, tier: '尊贵白金', stars: 280, points: 3500, coins: 800 },
            { id: 3, name: '2023 季前赛', date: '2023.09 - 2023.10', rank: 45, tier: '荣耀黄金', stars: 120, points: 1500, coins: 500 },
        ]);

        const rankSystem = [
            { id: 'bronze', name: '倔强青铜', icon: 'fa-solid fa-medal', color: 'text-orange-700', minStars: 0 },
            { id: 'silver', name: '秩序白银', icon: 'fa-solid fa-medal', color: 'text-slate-400', minStars: 51 },
            { id: 'gold', name: '荣耀黄金', icon: 'fa-solid fa-trophy', color: 'text-yellow-400', minStars: 101 },
            { id: 'platinum', name: '尊贵白金', icon: 'fa-solid fa-certificate', color: 'text-cyan-400', minStars: 201 },
            { id: 'diamond', name: '永恒钻石', icon: 'fa-solid fa-gem', color: 'text-purple-400', minStars: 401 },
            { id: 'master', name: '最强王者', icon: 'fa-solid fa-crown', color: 'text-rose-500', minStars: 801 }
        ];

        const ladderLevels = ref([
            { id: 1, status: 'unlocked', passedCount: 15, problemCount: 45 },
            { id: 2, status: 'unlocked', passedCount: 2, problemCount: 28 },
            { id: 3, status: 'locked', passedCount: 0, problemCount: 30 },
            { id: 4, status: 'locked', passedCount: 0, problemCount: 35 },
            { id: 5, status: 'locked', passedCount: 0, problemCount: 40 },
            { id: 6, status: 'locked', passedCount: 0, problemCount: 45 },
            { id: 7, status: 'locked', passedCount: 0, problemCount: 50 },
            { id: 8, status: 'locked', passedCount: 0, problemCount: 60 },
            { id: 9, status: 'locked', passedCount: 0, problemCount: 80 }
        ]);

        const generateMockTasks = () => {
            const tasks = [];
            for(let i=1; i<=45; i++) { tasks.push({ id: 1000 + i, level: 1, title: `基础算术与输入输出`, description: '练习基本的输入输出格式控制和四则运算。', status: i <= 15 ? 'passed' : 'unstarted', score: Math.floor(100 + Math.random() * 50), starReward: 1, passRate: Math.floor(80 + Math.random()*20) }); }
            for(let i=1; i<=28; i++) { tasks.push({ id: 2000 + i, level: 2, title: `循环控制结构综合训练`, description: '使用嵌套循环解决图形打印与数学问题。', status: i <= 2 ? 'passed' : 'unstarted', score: Math.floor(200 + Math.random() * 100), starReward: 2, passRate: Math.floor(60 + Math.random()*30) }); }
            for(let i=1; i<=30; i++) { tasks.push({ id: 3000 + i, level: 3, title: `一维数组与字符串处理`, description: '掌握数组的遍历、查找、排序及字符串操作。', status: 'unstarted', score: 300 + Math.floor(Math.random() * 50), starReward: 3, passRate: 50 }); }
            return tasks;
        };

        const allLadderTasks = ref(generateMockTasks());

        const currentRankObj = computed(() => [...rankSystem].reverse().find(r => totalStars.value >= r.minStars) || rankSystem[0]);
        const nextRankObj = computed(() => { const idx = rankSystem.findIndex(r => r.id === currentRankObj.value.id); return idx < rankSystem.length - 1 ? rankSystem[idx + 1] : null; });
        const starsNeeded = computed(() => nextRankObj.value ? nextRankObj.value.minStars - totalStars.value : 0);
        const progressPercent = computed(() => { if (!nextRankObj.value) return 100; const floor = currentRankObj.value.minStars, ceil = nextRankObj.value.minStars; return Math.min(100, Math.max(0, ((totalStars.value - floor) / (ceil - floor)) * 100)); });

        const filteredLadderTasks = computed(() => { 
            let tasks = allLadderTasks.value.filter(t => t.level === activeLadderLevel.value); 
            if (ladderSearchQuery.value.trim()) { const q = ladderSearchQuery.value.toLowerCase(); tasks = tasks.filter(task => task.title.toLowerCase().includes(q) || task.id.toString().includes(q)); } 
            return tasks; 
        });

        const levelStarStats = computed(() => {
            const tasksInLevel = allLadderTasks.value.filter(t => t.level === activeLadderLevel.value);
            let total = 0, obtained = 0;
            tasksInLevel.forEach(t => { total += t.starReward; if (t.status === 'passed') obtained += t.starReward; });
            return { total, obtained };
        });

        const totalPages = computed(() => Math.ceil(filteredLadderTasks.value.length / pageSize.value));
        const paginatedTasks = computed(() => { const start = (currentPage.value - 1) * pageSize.value; return filteredLadderTasks.value.slice(start, start + pageSize.value); });

        const fullLadderRanking = ref([
            { name: '李子涵', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily', stars: 210 },
            { name: '王大力', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', stars: 180 },
            { name: '赵小云', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cloud', stars: 150 },
            { name: '钱多多', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Money', stars: 120 },
            { name: '孙悟空', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sun', stars: 98 },
            { name: '周杰伦', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jay', stars: 95 },
        ]);
        
        const sortedFullRanking = computed(() => {
            let list = fullLadderRanking.value.filter(u => u.name !== props.user.name);
            list.push({ name: props.user.name, avatar: props.user.avatar, stars: totalStars.value });
            return list.sort((a, b) => b.stars - a.stars);
        });
        
        const ladderTopPlayers = computed(() => sortedFullRanking.value.slice(0, 3));
        const myRankIndex = computed(() => sortedFullRanking.value.findIndex(p => p.name === props.user.name));
        const prevPlayerName = computed(() => myRankIndex.value > 0 ? sortedFullRanking.value[myRankIndex.value - 1].name : null);
        const rankGap = computed(() => myRankIndex.value > 0 ? sortedFullRanking.value[myRankIndex.value - 1].stars - totalStars.value : 0);

        const handleTaskClick = (task) => emit('open-problem', task);
        
        // 处理关卡点击
        const handleLevelClick = (level) => {
            if (level.status === 'locked') {
                emit('show-modal', {
                    type: 'alert',
                    title: `Level ${level.id} 未解锁`,
                    message: `请先完成 Level ${level.id - 1} 的所有关键挑战！\n(当前进度: ${ladderLevels.value[level.id-2]?.passedCount || 0}题已通过)`
                });
            } else {
                changeLevel(level.id);
            }
        };

        const changeLevel = (id) => { activeLadderLevel.value = id; currentPage.value = 1; };
        const changePage = (page) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page; };
        const shouldShowPage = (p) => { if (totalPages.value <= 7) return true; if (p === 1 || p === totalPages.value) return true; if (p >= currentPage.value - 1 && p <= currentPage.value + 1) return true; return false; };
        watch(ladderSearchQuery, () => currentPage.value = 1);
        let rankingInterval = null;
        onMounted(() => { rankingInterval = setInterval(() => { fullLadderRanking.value.forEach(p => { if (Math.random() > 0.7) p.stars += 1; }); }, 5000); });
        onUnmounted(() => clearInterval(rankingInterval));

        const getRankIcon = (tier) => {
            if (tier.includes('钻石')) return 'fa-gem';
            if (tier.includes('王者')) return 'fa-crown';
            if (tier.includes('黄金')) return 'fa-trophy';
            if (tier.includes('白金')) return 'fa-certificate';
            return 'fa-medal';
        };
        const getRankColor = (tier) => {
            if (tier.includes('钻石')) return 'text-purple-400';
            if (tier.includes('王者')) return 'text-rose-500';
            if (tier.includes('黄金')) return 'text-yellow-400';
            if (tier.includes('白金')) return 'text-cyan-400';
            if (tier.includes('白银')) return 'text-slate-400';
            return 'text-orange-700';
        };

        return {
            internalView, activeLadderLevel, ladderSearchQuery, ladderLevels, 
            paginatedTasks, currentPage, totalPages, pageSize, changePage, shouldShowPage, changeLevel,
            totalStars, ladderTopPlayers, showFullRanking, sortedFullRanking, handleTaskClick,
            rankSystem, currentRankObj, nextRankObj, starsNeeded, progressPercent, showRankChain, filteredLadderTasks,
            myRankIndex, prevPlayerName, rankGap, levelStarStats,
            historySeasons, getRankIcon, getRankColor,
            handleLevelClick,
            // New Registration Logic
            isSignedUp, handleSignUp, showPaymentModal, confirmPayment, isProcessing, seasonFee, openRankChain
        };
    }
};

window.LadderFeature = LadderFeature;