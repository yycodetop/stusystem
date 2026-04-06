// ==========================================
// 模块名称：数据中心 (Feature Data Center)
// 版本：V2.2 (Problem Detail Added)
// 描述：聚合展示题目操作日志、极简交互式视频进度卡片与代码执行复盘（含题目详情）。
// ==========================================

const DataCenterFeature = {
    props: ['user'],
    emits: ['go-back', 'show-toast'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 animate-fade-in-up overflow-hidden">
        
        <!-- Header -->
        <div class="px-8 py-5 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 z-10">
            <div class="flex items-center gap-4">
                <div class="size-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <i class="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                    <h2 class="text-xl font-black text-slate-800 tracking-tight leading-none">数据中心</h2>
                    <p class="text-xs text-slate-400 mt-1 font-medium">Data Intelligence Center</p>
                </div>
            </div>
            
            <!-- Tab Switcher -->
            <div class="flex bg-slate-100 p-1 rounded-xl" v-if="!selectedExecution">
                <button v-for="tab in tabs" :key="tab.id" 
                        @click="currentTab = tab.id"
                        class="px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 relative overflow-hidden"
                        :class="currentTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'">
                    <i :class="tab.icon"></i> {{ tab.label }}
                </button>
            </div>
            <div v-else>
                 <button @click="closeExecutionDetails" 
                        class="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition flex items-center gap-2">
                    <i class="fa-solid fa-arrow-left"></i> 返回列表
                </button>
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-hidden relative bg-slate-50/50">
            
            <!-- Tab 1: 题目操作页面 (Problem Operations) -->
            <div v-if="currentTab === 'problems'" class="h-full overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                
                <!-- 顶部统计卡 -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div class="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl"><i class="fa-solid fa-laptop-code"></i></div>
                        <div>
                            <div class="text-2xl font-black text-slate-800">{{ problemOps.length }}</div>
                            <div class="text-xs text-slate-400 font-bold uppercase">今日操作总数</div>
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div class="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl"><i class="fa-solid fa-play"></i></div>
                        <div>
                            <div class="text-2xl font-black text-slate-800">{{ problemOps.filter(o => o.action === '运行').length }}</div>
                            <div class="text-xs text-slate-400 font-bold uppercase">运行次数</div>
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div class="size-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl"><i class="fa-solid fa-vial"></i></div>
                        <div>
                            <div class="text-2xl font-black text-slate-800">{{ problemOps.filter(o => o.action === '测试').length }}</div>
                            <div class="text-xs text-slate-400 font-bold uppercase">提交测试</div>
                        </div>
                    </div>
                </div>

                <!-- 详细操作日志表格 -->
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-list-ul text-slate-400"></i> 操作日志
                        </h3>
                        <span class="text-xs text-slate-400">记录登录后的所有操作</span>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto custom-scrollbar">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 text-slate-500 sticky top-0 z-10 font-bold text-xs uppercase tracking-wider">
                                <tr>
                                    <th class="px-6 py-3 border-b border-slate-200">时间</th>
                                    <th class="px-6 py-3 border-b border-slate-200">题目名称</th>
                                    <th class="px-6 py-3 border-b border-slate-200">来源</th>
                                    <th class="px-6 py-3 border-b border-slate-200">动作</th>
                                    <th class="px-6 py-3 border-b border-slate-200">状态</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="op in problemOps" :key="op.id" class="hover:bg-slate-50/80 transition">
                                    <td class="px-6 py-3 font-mono text-slate-500 text-xs">{{ op.time }}</td>
                                    <td class="px-6 py-3 font-bold text-slate-700">{{ op.name }}</td>
                                    <td class="px-6 py-3">
                                        <span class="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-500">
                                            {{ op.source }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-3">
                                        <span class="px-2 py-1 rounded text-xs font-bold border" :class="getActionStyle(op.action)">
                                            {{ op.action }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-3 text-xs text-slate-400">
                                        <i class="fa-solid fa-check text-green-500 mr-1" v-if="true"></i> 记录成功
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab 2: 视频进度页面 (Video Progress - Optimized) -->
            <div v-else-if="currentTab === 'videos'" class="h-full overflow-y-auto custom-scrollbar p-6">
                
                <div class="mb-5 flex items-center justify-between">
                     <h3 class="font-bold text-slate-700 text-lg flex items-center gap-2">
                        <i class="fa-solid fa-play-circle text-indigo-500"></i> 最近学习
                     </h3>
                     <span class="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm font-mono">
                        {{ videoList.length }} 门课程进行中
                     </span>
                </div>

                <!-- 极简卡片网格 -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div v-for="course in videoList" :key="course.id" 
                         class="bg-white rounded-xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-40">
                        
                        <!-- 背景装饰 -->
                         <div class="absolute -right-6 -top-6 text-6xl opacity-[0.03] text-slate-800 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <i class="fa-solid fa-circle-play"></i>
                        </div>

                        <!-- 内容区 -->
                        <div class="relative z-10">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-bold text-slate-700 text-sm line-clamp-1 pr-2" :title="course.title">{{ course.title }}</h4>
                                <span class="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-50 px-1.5 py-0.5 rounded">{{ course.lastWatchedTime.split(' ')[0] }}</span>
                            </div>
                            <p class="text-xs text-slate-500 mb-4 line-clamp-1" :title="course.currentChapter">{{ course.currentChapter }}</p>
                        </div>
                        
                        <!-- 底部进度条 -->
                        <div class="relative z-10">
                            <div class="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                                <span>当前进度</span>
                                <span :class="getProgressTextColor(course.progress)">{{ course.progress }}%</span>
                            </div>
                            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-1000" 
                                     :class="getProgressColor(course.progress)" 
                                     :style="{width: course.progress + '%'}"></div>
                            </div>
                        </div>

                        <!-- 悬浮按钮覆盖层 (Hover Overlay) -->
                        <div class="absolute inset-0 bg-white/95 backdrop-blur-[2px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex items-center justify-center z-20 flex-col gap-2">
                            <p class="text-xs text-slate-500 font-medium mb-1 translate-y-2 group-hover:translate-y-0 transition duration-300 delay-75">上次播放至 {{ course.lastWatchedTime.split(' ')[1] }}</p>
                            <button class="px-6 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md transform translate-y-2 group-hover:translate-y-0 transition duration-300 active:scale-95 flex items-center gap-2">
                                <i class="fa-solid fa-play"></i> 继续学习
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tab 3: 执行记录页面 (Execution Logs) -->
            <div v-else-if="currentTab === 'executions'" class="h-full flex flex-col overflow-hidden">
                
                <!-- 视图 A: 执行概览列表 (Execution Summary List) -->
                <div v-if="!selectedExecution" class="h-full p-6 overflow-y-auto custom-scrollbar">
                    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                         <table class="w-full text-left text-sm">
                            <thead class="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th class="px-6 py-4 font-bold text-xs uppercase tracking-wider">题目名称</th>
                                    <th class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">执行次数 (Run/Debug)</th>
                                    <th class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">错误次数 (Errors)</th>
                                    <th class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">最近执行时间</th>
                                    <th class="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="summary in execSummaries" :key="summary.id" class="hover:bg-slate-50 transition group">
                                    <td class="px-6 py-4">
                                        <div class="font-bold text-slate-700 group-hover:text-indigo-600 transition cursor-pointer" @click="viewExecutionDetails(summary)">
                                            {{ summary.problemName }}
                                        </div>
                                        <div class="text-xs text-slate-400 mt-0.5">ID: {{ summary.problemId }}</div>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <span class="inline-block bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100 min-w-[3rem]">
                                            {{ summary.runCount }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <span class="inline-block px-2.5 py-1 rounded-md text-xs font-bold border min-w-[3rem]"
                                              :class="summary.errorCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'">
                                            {{ summary.errorCount }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 text-right font-mono text-xs text-slate-500">
                                        {{ summary.lastTime }}
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <button @click="viewExecutionDetails(summary)" class="size-8 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition">
                                            <i class="fa-solid fa-angle-right"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 视图 B: 详情钻取页面 (Detail Drill-down) -->
                <div v-else class="h-full flex flex-col md:flex-row bg-white">
                    
                    <!-- 左侧: 历史时间轴 (Timeline) -->
                    <div class="w-full md:w-64 border-r border-slate-200 bg-slate-50 flex flex-col h-full shrink-0">
                        <div class="p-4 border-b border-slate-200 bg-white">
                            <h4 class="font-bold text-slate-800 text-sm truncate" :title="selectedExecution.problemName">{{ selectedExecution.problemName }}</h4>
                            <p class="text-xs text-slate-400 mt-1">执行历史记录</p>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            <div v-for="(log, index) in selectedExecution.details" :key="index"
                                 @click="activeDetailLog = log"
                                 class="p-3 rounded-lg border cursor-pointer transition relative group"
                                 :class="activeDetailLog === log ? 'bg-white border-indigo-500 shadow-md z-10' : 'bg-white border-slate-200 hover:border-indigo-300 opacity-80 hover:opacity-100'">
                                
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-[10px] font-mono text-slate-500">{{ log.time.split(' ')[1] }}</span>
                                    <span class="size-2 rounded-full" :class="log.success ? 'bg-green-500' : 'bg-red-500'"></span>
                                </div>
                                <div class="text-xs font-bold" :class="log.success ? 'text-green-600' : 'text-red-500'">
                                    {{ log.status }}
                                </div>
                                <div class="text-[10px] text-slate-400 mt-1 truncate">
                                    {{ log.duration }}ms | {{ log.memory }}MB
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧: 详情展示区域 (Detail Area) -->
                    <div class="flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300"
                         :class="detailViewMode === 'code' ? 'bg-[#1e1e1e]' : 'bg-white'">
                        
                        <!-- Header with View Toggle -->
                        <div class="h-10 border-b flex items-center justify-between px-4 shrink-0"
                             :class="detailViewMode === 'code' ? 'bg-[#252526] border-[#333] text-slate-400' : 'bg-white border-slate-200 text-slate-600'">
                            
                            <!-- Mode Tabs -->
                            <div class="flex gap-4 h-full">
                                <button @click="detailViewMode = 'code'" 
                                        class="text-xs font-bold h-full border-b-2 px-2 transition flex items-center gap-2"
                                        :class="detailViewMode === 'code' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-300 opacity-60 hover:opacity-100'">
                                    <i class="fa-solid fa-code"></i> 代码快照
                                </button>
                                <button @click="detailViewMode = 'problem'" 
                                        class="text-xs font-bold h-full border-b-2 px-2 transition flex items-center gap-2"
                                        :class="detailViewMode === 'problem' ? 'border-indigo-600 text-indigo-600' : 'border-transparent hover:text-indigo-500 opacity-60 hover:opacity-100'">
                                    <i class="fa-solid fa-file-lines"></i> 题目详情
                                </button>
                            </div>

                            <!-- Meta Info (Visible in Code Mode) -->
                            <div v-if="detailViewMode === 'code' && activeDetailLog" class="flex gap-4 text-xs">
                                <span :class="activeDetailLog.success ? 'text-green-500' : 'text-red-500'">
                                    <i class="fa-solid" :class="activeDetailLog.success ? 'fa-circle-check' : 'fa-circle-xmark'"></i>
                                    {{ activeDetailLog.status }}
                                </span>
                                <span>{{ activeDetailLog.time }}</span>
                            </div>
                        </div>
                        
                        <!-- Content: Code Viewer -->
                        <div v-if="detailViewMode === 'code'" class="flex-1 flex flex-col min-h-0">
                            <div v-if="activeDetailLog" class="flex-1 flex flex-col min-h-0">
                                <div class="flex-1 overflow-auto custom-scrollbar p-4 font-mono text-sm leading-relaxed text-slate-300 select-text">
                                    <pre>{{ activeDetailLog.code }}</pre>
                                </div>
                                <div class="h-1/3 border-t border-[#333] bg-[#0f111a] flex flex-col shrink-0">
                                    <div class="px-4 py-2 bg-[#1e1e1e] text-[10px] text-slate-500 border-b border-[#333] font-bold uppercase tracking-wider">
                                        Console Output / Error Log
                                    </div>
                                    <div class="flex-1 p-4 font-mono text-xs overflow-auto custom-scrollbar">
                                        <div v-if="activeDetailLog.output" class="text-slate-300 whitespace-pre-wrap">{{ activeDetailLog.output }}</div>
                                        <div v-if="activeDetailLog.error" class="text-red-400 whitespace-pre-wrap">{{ activeDetailLog.error }}</div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-600">
                                <i class="fa-solid fa-hand-pointer text-4xl mb-4 opacity-50"></i>
                                <p class="text-sm">请在左侧选择一条执行记录查看详情</p>
                            </div>
                        </div>

                        <!-- Content: Problem Details -->
                        <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50">
                            <div class="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <div class="mb-6 border-b border-slate-100 pb-4">
                                    <h1 class="text-2xl font-black text-slate-800 mb-2">{{ selectedExecution.problemName }}</h1>
                                    <div class="flex gap-3 text-xs text-slate-400">
                                        <span class="bg-slate-100 px-2 py-0.5 rounded">ID: {{ selectedExecution.problemId }}</span>
                                        <span><i class="fa-regular fa-clock"></i> 时间限制: 1000ms</span>
                                        <span><i class="fa-solid fa-memory"></i> 内存限制: 128MB</span>
                                    </div>
                                </div>

                                <div class="space-y-6 text-slate-600 text-sm leading-relaxed">
                                    <div>
                                        <h3 class="font-bold text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">题目描述</h3>
                                        <p>{{ selectedExecution.problemDetails.description }}</p>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 class="font-bold text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">输入格式</h3>
                                            <p>{{ selectedExecution.problemDetails.inputFormat }}</p>
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">输出格式</h3>
                                            <p>{{ selectedExecution.problemDetails.outputFormat }}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 class="font-bold text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">输入输出样例</h3>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <div class="text-xs font-bold text-slate-400 mb-2 uppercase">Input Sample</div>
                                                <pre class="font-mono text-slate-700 whitespace-pre-wrap">{{ selectedExecution.problemDetails.sampleInput }}</pre>
                                            </div>
                                            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                <div class="text-xs font-bold text-slate-400 mb-2 uppercase">Output Sample</div>
                                                <pre class="font-mono text-slate-700 whitespace-pre-wrap">{{ selectedExecution.problemDetails.sampleOutput }}</pre>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="bg-blue-50 text-blue-700 p-4 rounded-lg text-xs">
                                        <i class="fa-solid fa-circle-info mr-1"></i> 提示：本题考查基础语法与逻辑思维，请注意数据范围。
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>
    `,
    
    setup(props, { emit }) {
        const { ref, reactive } = Vue;

        const currentTab = ref('problems');
        const tabs = [
            { id: 'problems', label: '题目操作', icon: 'fa-solid fa-list-check' },
            { id: 'videos', label: '视频进度', icon: 'fa-solid fa-play-circle' },
            { id: 'executions', label: '执行记录', icon: 'fa-solid fa-bug' }
        ];

        // 1. 题目操作日志数据 (Mock)
        const problemOps = ref([
            { id: 1, name: 'P1001 A+B Problem', source: '基础题库', action: '测试', time: '2025-01-14 10:42:05' },
            { id: 2, name: 'P1001 A+B Problem', source: '基础题库', action: '运行', time: '2025-01-14 10:40:12' },
            { id: 3, name: 'P1001 A+B Problem', source: '基础题库', action: '打开', time: '2025-01-14 10:38:00' },
            { id: 4, name: '冒泡排序可视化', source: '算法天梯', action: '运行', time: '2025-01-14 09:15:30' },
            { id: 5, name: '冒泡排序可视化', source: '算法天梯', action: '打开', time: '2025-01-14 09:10:00' },
            { id: 6, name: '二叉树遍历', source: '作业', action: '测试', time: '2025-01-13 16:20:11' },
            { id: 7, name: '二叉树遍历', source: '作业', action: '运行', time: '2025-01-13 16:15:44' },
            { id: 8, name: '二叉树遍历', source: '作业', action: '运行', time: '2025-01-13 16:10:22' },
            { id: 9, name: '二叉树遍历', source: '作业', action: '打开', time: '2025-01-13 16:05:00' },
        ]);

        const getActionStyle = (action) => {
            if (action === '打开') return 'bg-slate-50 text-slate-600 border-slate-200';
            if (action === '运行') return 'bg-blue-50 text-blue-600 border-blue-200';
            if (action === '测试') return 'bg-purple-50 text-purple-600 border-purple-200';
            return 'bg-slate-50 text-slate-500';
        };

        // 2. 视频进度数据 (Mock)
        const videoList = ref([
            { id: 1, title: 'C++ 核心：指针与引用', currentChapter: '第 4 章：指针运算', progress: 45, lastWatchedTime: '2025-01-14 14:20:00' },
            { id: 2, title: 'Arduino 智能家居实战', currentChapter: '第 2 节：传感器连接', progress: 82, lastWatchedTime: '2025-01-13 20:15:30' },
            { id: 3, title: '数据结构基础', currentChapter: '第 6 章：二叉树遍历', progress: 15, lastWatchedTime: '2025-01-10 09:00:00' },
            { id: 4, title: '算法竞赛入门', currentChapter: '动态规划基础', progress: 95, lastWatchedTime: '2025-01-05 16:45:00' },
            { id: 5, title: 'Python 自动化脚本', currentChapter: '文件操作实战', progress: 5, lastWatchedTime: '2025-01-02 11:20:00' },
            { id: 6, title: 'Web 前端开发基础', currentChapter: 'Flex 布局', progress: 60, lastWatchedTime: '2025-01-15 10:10:00' },
        ]);

        const getProgressColor = (progress) => {
            if (progress >= 80) return 'bg-green-500'; 
            if (progress >= 30) return 'bg-yellow-400'; 
            return 'bg-red-400'; 
        };

        const getProgressTextColor = (progress) => {
             if (progress >= 80) return 'text-green-500';
             if (progress >= 30) return 'text-yellow-500';
             return 'text-red-400';
        };

        // 3. 执行记录概览数据 (Mock)
        const execSummaries = ref([
            { id: 101, problemName: 'P1001 A+B Problem', problemId: 'P1001', runCount: 15, errorCount: 2, lastTime: '2025-01-14 10:42:05' },
            { id: 102, problemName: '冒泡排序可视化', problemId: 'ALGO-005', runCount: 8, errorCount: 5, lastTime: '2025-01-14 09:15:30' },
            { id: 103, problemName: '二叉树遍历', problemId: 'DS-102', runCount: 22, errorCount: 0, lastTime: '2025-01-13 16:20:11' },
            { id: 104, problemName: '最大子段和', problemId: 'DP-201', runCount: 45, errorCount: 12, lastTime: '2025-01-12 11:30:00' },
        ]);

        // 详情相关状态
        const selectedExecution = ref(null);
        const activeDetailLog = ref(null);
        const detailViewMode = ref('code'); // 'code' | 'problem'

        // 模拟题目详情数据生成
        const getProblemDetailsMock = (name) => {
            return {
                description: `这是一个关于 ${name} 的经典题目。你需要编写一个程序，接收特定的输入，经过逻辑处理后，输出符合要求的结果。请仔细阅读输入输出格式，并注意数据范围，避免溢出或超时。`,
                inputFormat: "第一行包含两个整数 N 和 M，中间用空格分隔。\n接下来 N 行，每行包含 M 个整数，表示矩阵的具体内容。",
                outputFormat: "输出一个整数，表示计算得到的最大路径和或特定的统计结果。",
                sampleInput: "5 3\n1 2 3\n4 5 6\n7 8 9\n1 1 1\n2 2 2",
                sampleOutput: "45"
            };
        };

        const generateDetails = (summary) => {
            const logs = [];
            for(let i=0; i<5; i++) {
                const isError = i % 3 === 0;
                logs.push({
                    time: summary.lastTime.replace(/:\d{2}$/, `:${10+i}`),
                    status: isError ? 'Compile Error' : 'Accepted',
                    success: !isError,
                    duration: Math.floor(Math.random() * 50) + 10,
                    memory: Math.floor(Math.random() * 128),
                    code: `// ${summary.problemName} - Version ${5-i}\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Simulation of code version ${5-i}\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}`,
                    output: isError ? '' : '15',
                    error: isError ? 'Error: Expected ";" at line 5' : ''
                });
            }
            return logs;
        };

        const viewExecutionDetails = (summary) => {
            const details = generateDetails(summary);
            const problemDetails = getProblemDetailsMock(summary.problemName);
            
            selectedExecution.value = { 
                ...summary, 
                details, 
                problemDetails 
            };
            activeDetailLog.value = details[0]; 
            detailViewMode.value = 'code'; // 默认重置为查看代码
        };

        const closeExecutionDetails = () => {
            selectedExecution.value = null;
        };

        return {
            currentTab, tabs,
            problemOps, getActionStyle, // Tab 1
            videoList, getProgressColor, getProgressTextColor, // Tab 2
            execSummaries, selectedExecution, activeDetailLog, viewExecutionDetails, closeExecutionDetails, // Tab 3
            detailViewMode // New: Detail View Mode
        };
    }
};

window.DataCenterFeature = DataCenterFeature;