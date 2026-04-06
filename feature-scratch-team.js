// ==========================================
// 模块名称：Scratch 团队课堂 (Team Classroom)
// 版本：V5.0 (班级切换 + 队长区分 + 分页版)
// 更新内容：
// 1. [UX] 移除内部 Header，空间完全释放给协作项目。
// 2. [FEAT] 班级维度集成，支持多班级下的团队项目隔离切换。
// 3. [FEAT] 团队成员体系：显著区分队长(Leader)与队员，视觉化展示协作关系。
// 4. [UX] 分页系统 (每页8项) + 全局 no-scrollbar 隐藏滚动条。
// ==========================================

const ScratchTeamFeature = {
    props: ['user'],
    emits: ['show-toast', 'go-back', 'open-problem'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in p-6 md:p-8 overflow-y-auto no-scrollbar">
        
        <!-- 顶部控制区：班级选择(左) + 模糊搜索(右) -->
        <div class="mb-10 flex flex-col md:flex-row gap-6 justify-between items-center shrink-0">
            
            <!-- 左侧：班级切换 -->
            <div class="flex flex-col gap-2 w-full md:w-auto">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.2em]">当前协作班级</label>
                <div class="relative group min-w-[280px]">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500">
                        <i class="fa-solid fa-people-group"></i>
                    </div>
                    <select v-model="selectedClassId" 
                            class="appearance-none w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 transition-all cursor-pointer">
                        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-purple-500 transition-colors">
                        <i class="fa-solid fa-chevron-down text-xs"></i>
                    </div>
                </div>
            </div>

            <!-- 右侧：模糊搜索 -->
            <div class="w-full md:w-80 group">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fa-solid fa-magnifying-glass text-slate-300 group-focus-within:text-purple-500 transition-colors"></i>
                    </div>
                    <input v-model="searchQuery" 
                           type="text" 
                           placeholder="搜索团队或项目..." 
                           class="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-300 transition-all text-sm font-medium">
                </div>
            </div>
        </div>

        <!-- 1. 置顶团队公告/进度 (可选，作为 Hero 区域) -->
        <div v-if="currentPage === 1 && !searchQuery" class="mb-10 animate-scale-in">
            <div class="bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                <i class="fa-solid fa-users-viewfinder text-[15rem] absolute -right-20 -bottom-20 opacity-10 rotate-12 transition-transform duration-1000 group-hover:rotate-0"></i>
                <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold border border-white/20">团队共创模式</span>
                        <span class="text-xs text-white/50">当前班级: {{ currentClassName }}</span>
                    </div>
                    <h2 class="text-3xl font-black mb-2">并肩作战，共创精彩作品</h2>
                    <p class="text-white/70 text-sm max-w-lg mb-6 leading-relaxed">在团队课堂中，你可以与小伙伴共同完成复杂的 Scratch 项目。队长负责统筹，成员各司其职。加油，未来的技术团队！</p>
                    <div class="flex items-center gap-6">
                        <div class="flex -space-x-3">
                            <img v-for="i in 5" :key="i" :src="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + i" class="size-10 rounded-full border-2 border-slate-800 bg-slate-700">
                        </div>
                        <div class="text-xs font-bold text-indigo-200">+ {{ projectsInClass.length }} 个活跃项目</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. 团队项目网格 -->
        <div class="flex flex-col gap-6 flex-1">
            <div class="flex items-center justify-between">
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">团队协作工作区</h3>
                <span class="text-[10px] font-bold text-slate-300">{{ filteredItems.length }} 个团队项目</span>
            </div>

            <div v-if="paginatedItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="project in paginatedItems" :key="project.id" 
                     class="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 flex flex-col">
                    
                    <!-- 项目头部信息 -->
                    <div class="flex justify-between items-start mb-6">
                        <div class="size-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <i class="fa-solid fa-diagram-project"></i>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Status</span>
                            <span class="text-[10px] font-bold text-green-500 flex items-center gap-1">
                                <span class="size-1.5 bg-green-500 rounded-full animate-pulse"></span> 协作中
                            </span>
                        </div>
                    </div>

                    <h4 class="text-lg font-black text-slate-800 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">{{ project.title }}</h4>
                    <p class="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed h-8">{{ project.desc }}</p>

                    <!-- 团队成员展示 (区分队长和成员) -->
                    <div class="bg-slate-50 rounded-2xl p-4 mb-6 flex-1">
                        <p class="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest">Team Members</p>
                        <div class="flex flex-wrap gap-3">
                            <!-- 队长 Leader -->
                            <div class="relative group/member">
                                <div class="size-10 rounded-full border-2 border-purple-500 p-0.5 bg-white relative">
                                    <img :src="project.leader.avatar" class="size-full rounded-full object-cover">
                                    <div class="absolute -top-2 -right-1 bg-purple-600 text-white text-[8px] size-4 rounded-full flex items-center justify-center shadow-lg">
                                        <i class="fa-solid fa-crown scale-75"></i>
                                    </div>
                                </div>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[8px] rounded opacity-0 group-hover/member:opacity-100 transition whitespace-nowrap pointer-events-none">
                                    队长: {{ project.leader.name }}
                                </div>
                            </div>
                            <!-- 队员 Members -->
                            <div v-for="member in project.members" :key="member.id" class="relative group/member">
                                <img :src="member.avatar" class="size-10 rounded-full border-2 border-white bg-slate-200 hover:scale-110 transition-transform cursor-help shadow-sm">
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[8px] rounded opacity-0 group-hover/member:opacity-100 transition whitespace-nowrap pointer-events-none">
                                    {{ member.name }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 操作区 -->
                    <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-300 font-bold uppercase">最后活跃</span>
                            <span class="text-[10px] text-slate-500 font-bold">{{ project.lastUpdate }}</span>
                        </div>
                        <button @click="enterProject(project)" class="size-10 rounded-xl bg-slate-100 text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 空状态提示 -->
            <div v-else class="py-24 flex flex-col items-center text-center animate-fade-in bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                <div class="size-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-200 text-4xl">
                    <i class="fa-solid fa-user-group"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-800">暂未发现该班级的团队项目</h4>
                <p class="text-sm text-slate-400 mt-2">点击右侧搜索确认关键词，或者联系老师创建团队项目。</p>
                <button @click="resetFilters" class="mt-8 px-8 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black hover:bg-purple-700 transition shadow-lg shadow-purple-200">
                    查看所有项目
                </button>
            </div>
        </div>

        <!-- 3. 分页控制 (同一页最多8个) -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center gap-4 shrink-0 pb-10">
            <button @click="changePage(currentPage - 1)" 
                    :disabled="currentPage === 1"
                    class="size-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            
            <div class="flex items-center gap-2">
                <button v-for="page in totalPages" :key="page"
                        @click="changePage(page)"
                        class="size-12 rounded-2xl font-black text-sm transition-all shadow-sm"
                        :class="currentPage === page ? 'bg-purple-600 text-white shadow-purple-200' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'">
                    {{ page }}
                </button>
            </div>

            <button @click="changePage(currentPage + 1)" 
                    :disabled="currentPage === totalPages"
                    class="size-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>

        <!-- 装饰背景 -->
        <div class="fixed bottom-0 left-0 p-10 opacity-[0.03] pointer-events-none -z-10 select-none">
            <i class="fa-solid fa-handshake text-[25rem] -rotate-12"></i>
        </div>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, watch } = Vue;

        const searchQuery = ref('');
        const currentPage = ref(1);
        const pageSize = 8; // 同一页最多有8个项目
        
        // 1. 班级数据
        const classes = ref([
            { id: 't_class_01', name: 'Scratch 协作开发一班' },
            { id: 't_class_02', name: 'NOI 团队集训营' }
        ]);
        const selectedClassId = ref('t_class_01');
        const currentClassName = computed(() => classes.value.find(c => c.id === selectedClassId.value)?.name || '');

        // 2. 模拟团队项目数据 (含队长和成员)
        const allTeamProjects = ref([
            // 班级 1
            { 
                id: 1001, classId: 't_class_01', title: '《未来城市》科普动画', desc: '全班协作大型项目，通过多个关卡展示可持续能源的重要性。',
                leader: { name: '张小明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader1' },
                members: [
                    { id: 1, name: '李华', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m1' },
                    { id: 2, name: '王伟', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m2' },
                    { id: 3, name: '赵丽', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m3' }
                ],
                lastUpdate: '5分钟前', updateTS: Date.now() - 300000
            },
            { 
                id: 1002, classId: 't_class_01', title: '双人坦克对战', desc: '学习局域网变量（云变量）同步，制作一个可以实时对抗的坦克游戏。',
                leader: { name: '周佳缘', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
                members: [
                    { id: 4, name: '孙强', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m4' },
                    { id: 5, name: '陆瑶', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m5' }
                ],
                lastUpdate: '2小时前', updateTS: Date.now() - 7200000
            },
            { 
                id: 1003, classId: 't_class_01', title: '数字合唱团', desc: '声音扩展模块实践，多个角色协作演奏出完整的交响乐。',
                leader: { name: '陈默', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader2' },
                members: [
                    { id: 6, name: '周杰', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=m6' }
                ],
                lastUpdate: '昨天', updateTS: Date.now() - 86400000
            },
            // 更多模拟数据填充测试分页
            ...Array.from({ length: 10 }).map((_, i) => ({
                id: 2000 + i, classId: 't_class_01', title: '协作练习项目 #' + (i + 1), desc: '练习团队协作中的模块化拆分与接口定义。',
                leader: { name: '队长' + i, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=L${i}` },
                members: [{ id: 99 + i, name: '成员A', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=M${i}` }],
                lastUpdate: (i + 1) + '天前', updateTS: Date.now() - (i + 1) * 86400000
            }))
        ]);

        // 3. 计算属性逻辑
        const projectsInClass = computed(() => {
            return allTeamProjects.value
                .filter(p => p.classId === selectedClassId.value)
                .sort((a, b) => b.updateTS - a.updateTS);
        });

        const filteredItems = computed(() => {
            const query = searchQuery.value.trim().toLowerCase();
            if (!query) return projectsInClass.value;
            return projectsInClass.value.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.desc.toLowerCase().includes(query) ||
                p.leader.name.toLowerCase().includes(query)
            );
        });

        const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize) || 1);
        
        const paginatedItems = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredItems.value.slice(start, start + pageSize);
        });

        // 4. 操作方法
        const changePage = (p) => {
            if (p < 1 || p > totalPages.value) return;
            currentPage.value = p;
            const container = document.querySelector('.no-scrollbar');
            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const resetFilters = () => {
            searchQuery.value = '';
            currentPage.value = 1;
        };

        const enterProject = (project) => {
            emit('show-toast', `正在进入团队项目: ${project.title}`, 'info');
            emit('open-problem', { id: project.id, title: project.title, type: 'scratch-team' });
        };

        // 监听变化重置分页
        watch([selectedClassId, searchQuery], () => {
            currentPage.value = 1;
        });

        return {
            classes, selectedClassId, currentClassName,
            searchQuery,
            currentPage, pageSize, totalPages,
            projectsInClass, filteredItems, paginatedItems,
            changePage, resetFilters, enterProject
        };
    }
};

window.ScratchTeamFeature = ScratchTeamFeature;