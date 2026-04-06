// ==========================================
// 模块名称：Scratch 个人课堂 (Personal Classroom)
// 版本：V6.0 (班级切换 + 搜索右置 + 分页版)
// 更新内容：
// 1. [UI] 布局重构：左侧班级切换，右侧模糊搜索。
// 2. [FEAT] 引入项目列表分页逻辑，适配多项目创作场景。
// 3. [UX] 自动置顶班级内最新编辑项目 (Hero Card)。
// 4. [STYLE] 全局隐藏上下滚动条 (no-scrollbar)，极简视觉。
// ==========================================

const ScratchPersonalFeature = {
    props: ['user'],
    emits: ['show-toast', 'go-back', 'open-problem'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in p-6 md:p-8 overflow-y-auto no-scrollbar">
        
        <!-- 顶部交互栏：班级(左) & 搜索(右) -->
        <div class="mb-10 flex flex-col md:flex-row gap-6 justify-between items-end shrink-0">
            
            <!-- 左侧：班级切换器 -->
            <div class="flex flex-col gap-2 w-full md:w-auto">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.2em]">切换学习班级</label>
                <div class="relative group min-w-[260px]">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-500">
                        <i class="fa-solid fa-graduation-cap"></i>
                    </div>
                    <select v-model="selectedClassId" 
                            class="appearance-none w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all cursor-pointer">
                        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <i class="fa-solid fa-chevron-down text-xs"></i>
                    </div>
                </div>
            </div>

            <!-- 右侧：模糊搜索 -->
            <div class="w-full md:w-80 group">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fa-solid fa-magnifying-glass text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
                    </div>
                    <input v-model="searchQuery" 
                           type="text" 
                           placeholder="搜索项目名称..." 
                           class="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all text-sm font-medium">
                </div>
            </div>
        </div>

        <!-- 1. 最近编辑项目 (Hero Card) -->
        <!-- 仅在第一页且没有搜索时展示当前班级的“扛鼎之作” -->
        <div v-if="latestProject && !searchQuery && currentPage === 1" class="mb-12 animate-scale-in">
            <h3 class="text-[10px] font-black text-slate-400 uppercase mb-4 ml-1 tracking-[0.2em]">继续上次的创作</h3>
            <div class="relative bg-gradient-to-br from-indigo-600 via-violet-700 to-fuchsia-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-200 overflow-hidden group">
                <!-- 背景装饰图标 -->
                <i class="fa-solid fa-wand-magic-sparkles text-[15rem] absolute -right-16 -bottom-16 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000"></i>
                
                <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div class="flex-1">
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-[10px] font-bold mb-6 backdrop-blur-md">
                            <span class="size-2 bg-green-400 rounded-full animate-pulse"></span>
                            活跃班级: {{ currentClassName }}
                        </div>
                        <h2 class="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">{{ latestProject.title }}</h2>
                        <p class="text-white/70 text-base md:text-lg max-w-xl leading-relaxed mb-8">{{ latestProject.desc }}</p>
                        
                        <div class="flex items-center gap-4">
                            <button @click="openProject(latestProject)" class="px-10 py-4 bg-white text-indigo-900 rounded-2xl font-black text-sm hover:bg-indigo-50 hover:scale-105 transition active:scale-95 shadow-xl shadow-indigo-900/20 flex items-center gap-2">
                                <i class="fa-solid fa-play"></i> 立即进入创作
                            </button>
                            <span class="text-xs text-white/40 font-medium italic">最后保存于 {{ latestProject.lastModified }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. 项目列表网格 -->
        <div class="flex flex-col gap-6">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.2em]">
                    {{ searchQuery ? '搜索结果' : '项目资源库' }}
                </h3>
                <span class="text-[10px] font-bold text-slate-300">共 {{ filteredItems.length }} 个创意项目</span>
            </div>
            
            <!-- Grid 列表 -->
            <div v-if="paginatedItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="item in paginatedItems" :key="item.id" 
                     @click="openProject(item)"
                     class="group bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden">
                    
                    <div class="flex justify-between items-start mb-8">
                        <div class="size-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm"
                             :class="item.type === 'lesson' ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'">
                            <i :class="item.type === 'lesson' ? 'fa-solid fa-book' : 'fa-solid fa-flask'"></i>
                        </div>
                        <div v-if="item.isNew" class="px-2 py-1 bg-amber-400 text-white text-[8px] font-black rounded-md uppercase">Hot</div>
                    </div>

                    <h4 class="text-xl font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors truncate">{{ item.title }}</h4>
                    <p class="text-sm text-slate-400 leading-relaxed mb-8 line-clamp-2 h-10">{{ item.desc }}</p>

                    <div class="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div class="flex flex-col">
                            <span class="text-[10px] text-slate-300 font-bold uppercase tracking-widest">最近活跃</span>
                            <span class="text-[11px] text-slate-500 font-bold">{{ item.lastModified }}</span>
                        </div>
                        <div class="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空结果占位区 -->
            <div v-else class="py-24 flex flex-col items-center text-center animate-fade-in bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                <div class="size-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-200 text-4xl">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-800">暂无相关项目记录</h4>
                <p class="text-sm text-slate-400 mt-2">请尝试更改班级或搜索关键词，或者开启一个新的项目。</p>
                <button @click="resetFilters" class="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    清除所有筛选条件
                </button>
            </div>
        </div>

        <!-- 3. 分页控制 (仅在总页数 > 1 时显示) -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center gap-4 shrink-0 pb-10">
            <button @click="changePage(currentPage - 1)" 
                    :disabled="currentPage === 1"
                    class="size-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            
            <div class="flex items-center gap-2">
                <button v-for="page in totalPages" :key="page"
                        @click="changePage(page)"
                        class="size-12 rounded-2xl font-black text-sm transition-all"
                        :class="currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'">
                    {{ page }}
                </button>
            </div>

            <button @click="changePage(currentPage + 1)" 
                    :disabled="currentPage === totalPages"
                    class="size-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>

        <!-- 装饰背景 -->
        <div class="fixed bottom-0 right-0 p-10 opacity-[0.03] pointer-events-none -z-10 select-none">
            <i class="fa-solid fa-palette text-[25rem] rotate-12"></i>
        </div>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, watch } = Vue;

        const searchQuery = ref('');
        const currentPage = ref(1);
        const pageSize = 6;
        
        // 班级模拟数据
        const classes = ref([
            { id: 'class_01', name: 'Scratch 基础入门一班' },
            { id: 'class_02', name: 'Scratch 算法精英班' },
            { id: 'class_03', name: 'Scratch 创意游戏工坊' }
        ]);
        const selectedClassId = ref('class_01');
        const currentClassName = computed(() => classes.value.find(c => c.id === selectedClassId.value)?.name || '');

        // 项目模拟数据（通过 classId 关联）
        const allItems = ref([
            // 班级 1 数据
            { id: 1, classId: 'class_01', type: 'lesson', title: '字母华尔兹', desc: '利用“外观”和“声音”模块，让你的名字随着音符在舞台上优雅起舞。', lastModified: '10分钟前', updatedAt: Date.now() - 600000, isNew: true },
            { id: 2, classId: 'class_01', type: 'project', title: '深海接金币', desc: '克隆、变量与碰撞侦测的综合运用，制作一个惊险刺激的深海接宝游戏。', lastModified: '2天前', updatedAt: Date.now() - 172800000 },
            { id: 3, classId: 'class_01', type: 'lesson', title: '画笔万花筒', desc: '探索画笔模块，通过数学循环逻辑创造出极其复杂的对称艺术图案。', lastModified: '1周前', updatedAt: Date.now() - 604800000 },
            { id: 4, classId: 'class_01', type: 'project', title: '星际躲避战', desc: '学习角色的重力感应、坐标位移与子弹发射机制，挑战最高分数。', lastModified: '2周前', updatedAt: Date.now() - 1209600000 },
            { id: 5, classId: 'class_01', type: 'lesson', title: '小小钢琴家', desc: '音乐扩展模块集成，让学生能够通过键盘弹奏出美妙动听的旋律。', lastModified: '3周前', updatedAt: Date.now() - 1814400000 },
            { id: 6, classId: 'class_01', type: 'project', title: '迷宫大冒险', desc: '自定义关卡设计，考验逻辑思维与地图建模能力，带有机关设计。', lastModified: '1个月前', updatedAt: Date.now() - 2592000000 },
            { id: 7, classId: 'class_01', type: 'lesson', title: '粒子喷泉效果', desc: '掌握克隆体的生命周期管理，模拟喷泉、爆炸、流星等动态粒子视觉。', lastModified: '2个月前', updatedAt: Date.now() - 5000000000 },
            
            // 班级 2 数据
            { id: 201, classId: 'class_02', type: 'project', title: '智能寻路机器人', desc: '初探算法：如何让角色利用“侦测”模块自动寻找出迷宫的最优解。', lastModified: '3天前', updatedAt: Date.now() - 259200000, isNew: true },
            { id: 202, classId: 'class_02', type: 'lesson', title: '冒泡排序可视化', desc: '将枯燥的算法概念具象化，用 Scratch 的列表数据演示排序的全过程。', lastModified: '昨天', updatedAt: Date.now() - 86400000 },
            
            // 班级 3 数据
            { id: 301, classId: 'class_03', type: 'project', title: '超级玛丽关卡复刻', desc: '进阶课程：复刻经典横版游戏机制，掌握平台跳跃、背景滚动与物理反馈。', lastModified: '刚刚', updatedAt: Date.now() - 10000, isNew: true }
        ]);

        // 获取当前班级的项目并按时间排序
        const currentClassItems = computed(() => {
            return allItems.value
                .filter(item => item.classId === selectedClassId.value)
                .sort((a, b) => b.updatedAt - a.updatedAt);
        });

        // 获取当前班级的“扛鼎之作” (Hero Project)
        const latestProject = computed(() => currentClassItems.value[0]);

        // 搜索过滤后的项目（在主列表中排除掉 Hero 卡片显示的那一项，除非是在搜索模式下）
        const filteredItems = computed(() => {
            let list = currentClassItems.value;
            
            // 模糊搜索逻辑
            if (searchQuery.value.trim()) {
                const q = searchQuery.value.toLowerCase();
                return list.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
            }

            // 非搜索模式下，排除已经在 Hero Card 展示的第一项
            return list.slice(1);
        });

        // 分页计算
        const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize) || 1);
        const paginatedItems = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredItems.value.slice(start, start + pageSize);
        });

        // 切页逻辑
        const changePage = (p) => {
            if (p < 1 || p > totalPages.value) return;
            currentPage.value = p;
            // 平滑滚动回顶部
            const container = document.querySelector('.no-scrollbar');
            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const resetFilters = () => {
            searchQuery.value = '';
            currentPage.value = 1;
        };

        // 关键：切换班级或输入搜索时，必须重置页码
        watch([selectedClassId, searchQuery], () => {
            currentPage.value = 1;
        });

        const openProject = (item) => {
            emit('show-toast', `正在加载项目: ${item.title}`, 'info');
            emit('open-problem', { id: item.id, title: item.title, type: 'scratch' });
        };

        return {
            classes, selectedClassId, currentClassName,
            searchQuery,
            currentPage, totalPages,
            latestProject,
            paginatedItems, filteredItems,
            changePage, resetFilters, openProject
        };
    }
};

window.ScratchPersonalFeature = ScratchPersonalFeature;