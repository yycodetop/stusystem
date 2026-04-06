// ==========================================
// 模块名称：专题课程 (Feature Special Course)
// 版本：V6.0 (搜索集成 + 全局详情入口 + 分页版)
// 更新内容：
// 1. [UX] 移除 Header 与码豆显示，顶部改为：分类(左) + 模糊搜索(右)。
// 2. [FEAT] 所有状态下的课程卡片均支持点击查看详情。
// 3. [FEAT] 票夹移除出示凭证功能，由线下老师手动确认。
// 4. [UX] 分页功能覆盖所有标签页 (单页8项)，隐藏滚动条。
// ==========================================

const SpecialCourseFeature = {
    props: ['user'],
    emits: ['show-toast', 'go-back', 'show-modal'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in p-6 md:p-8 overflow-y-auto no-scrollbar">
        
        <!-- 顶部操作栏：分类标签(左) + 搜索(右) -->
        <div class="mb-10 flex flex-col md:flex-row gap-6 justify-between items-center shrink-0">
            <!-- 左侧：分类选择 -->
            <div class="flex bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                <button v-for="tab in tabs" :key="tab.id"
                        @click="currentTab = tab.id"
                        class="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                        :class="currentTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-white hover:text-slate-800'">
                    <i :class="tab.icon"></i> {{ tab.name }}
                </button>
            </div>
            
            <!-- 右侧：模糊搜索 -->
            <div class="w-full md:w-80 group">
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i class="fa-solid fa-magnifying-glass text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
                    </div>
                    <input v-model="searchQuery" 
                           type="text" 
                           placeholder="搜索专题课程名称..." 
                           class="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-300 transition-all text-sm font-medium">
                </div>
            </div>
        </div>

        <!-- 课程网格列表 -->
        <div class="flex-1 flex flex-col gap-6">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    {{ currentTabName }} · 探索编程的无限可能
                </h3>
                <span class="text-[10px] font-bold text-slate-300">检索到 {{ filteredItems.length }} 个相关项</span>
            </div>

            <!-- 数据网格 (统一分页 8 项) -->
            <div v-if="paginatedItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                
                <!-- 1. 热门预约 & 往期回顾 -->
                <template v-if="currentTab !== 'tickets'">
                    <div v-for="course in paginatedItems" :key="course.id" 
                         @click="showCourseDetail(course)"
                         class="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-500 flex flex-col relative cursor-pointer">
                        
                        <div class="h-40 relative flex items-center justify-center overflow-hidden" :class="course.bgClass">
                            <i :class="course.icon" class="text-6xl text-white/20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700"></i>
                            <div class="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] text-white font-black uppercase">
                                {{ course.type }}
                            </div>
                        </div>

                        <div class="p-6 flex flex-col flex-1">
                            <div class="flex flex-col gap-1.5 mb-4">
                                <div class="flex items-center justify-between text-[9px] font-black">
                                    <span :class="course.isHistory ? 'text-slate-400' : 'text-rose-500'" class="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                                        <i class="fa-solid fa-hourglass-end"></i> {{ course.isHistory ? '已结课' : '截止: ' + course.deadline }}
                                    </span>
                                    <span class="text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                                        <i class="fa-solid fa-calendar-check"></i> {{ course.endDate }}
                                    </span>
                                </div>
                            </div>

                            <h4 class="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">{{ course.title }}</h4>
                            <p class="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-2 h-8">{{ course.desc }}</p>

                            <div class="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-slate-300 font-black uppercase">报名费用</span>
                                    <div class="flex items-center gap-1.5">
                                        <i class="fa-solid fa-seedling text-emerald-500 text-sm"></i>
                                        <span class="text-base font-black text-slate-800">{{ course.price || '免费' }}</span>
                                    </div>
                                </div>
                                
                                <button @click.stop="showCourseDetail(course)" 
                                        class="relative overflow-hidden group/btn px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 shadow-sm"
                                        :class="currentTab === 'history' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600'">
                                    {{ currentTab === 'history' ? '查看详情' : '立即预约' }}
                                    <div v-if="currentTab !== 'history'" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-all"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- 2. 我的票夹 (拟物化票据) -->
                <template v-else>
                    <div v-for="ticket in paginatedItems" :key="ticket.id" 
                         @click="showCourseDetail(ticket)"
                         class="relative group bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col gap-6 hover:shadow-2xl transition-all border-dashed overflow-hidden cursor-pointer">
                        <div class="absolute -left-4 top-1/2 -translate-y-1/2 size-8 bg-slate-50 rounded-full border border-slate-200 shadow-inner"></div>
                        <div class="absolute -right-4 top-1/2 -translate-y-1/2 size-8 bg-slate-50 rounded-full border border-slate-200 shadow-inner"></div>
                        
                        <div class="flex justify-between items-center">
                            <span class="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full tracking-widest uppercase">My Ticket</span>
                            <span class="text-xs font-mono font-bold text-slate-300">#{{ ticket.code }}</span>
                        </div>
                        
                        <div>
                            <h4 class="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{{ ticket.title }}</h4>
                            <div class="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <i class="fa-solid fa-location-dot"></i> {{ ticket.location }}
                            </div>
                        </div>
                        
                        <div class="space-y-3 bg-slate-50 p-4 rounded-2xl">
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold text-slate-400 uppercase">开课时间</span>
                                <span class="text-xs font-black text-slate-700">{{ ticket.time }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] font-bold text-slate-400 uppercase">当前状态</span>
                                <span class="text-xs font-black text-amber-500 flex items-center gap-1">
                                    <i class="fa-solid fa-hourglass-half"></i> 待老师确认
                                </span>
                            </div>
                        </div>

                        <div class="mt-2 text-center text-[10px] font-bold text-slate-300 italic">
                            请准时到达现场，由老师进行核销确认
                        </div>
                    </div>
                </template>
            </div>

            <!-- 空状态提示 -->
            <div v-else class="py-24 flex flex-col items-center text-center animate-fade-in bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
                <div class="size-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-200 text-4xl">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-800">未找到相关项目</h4>
                <p class="text-sm text-slate-400 mt-2">换个关键词试试，或检查当前分类下的项目。</p>
                <button @click="resetFilters" class="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition">
                    清除所有筛选
                </button>
            </div>
        </div>

        <!-- 全局分页器 (总页数 > 1 时显示) -->
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
                        :class="currentPage === page ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'">
                    {{ page }}
                </button>
            </div>
            <button @click="changePage(currentPage + 1)" 
                    :disabled="currentPage === totalPages"
                    class="size-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:pointer-events-none transition-all">
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>

        <!-- 课程详情弹窗 (Teleport 不可用时使用内置 Transition) -->
        <transition name="fade">
            <div v-if="selectedCourse" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md" @click.self="selectedCourse = null">
                <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                    <div class="h-48 relative shrink-0" :class="selectedCourse.bgClass">
                        <i :class="selectedCourse.icon" class="text-7xl text-white/20 absolute bottom-4 right-8"></i>
                        <button @click="selectedCourse = null" class="absolute top-6 right-6 size-10 rounded-full bg-black/20 text-white hover:bg-black/40 flex items-center justify-center transition backdrop-blur-md">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="absolute bottom-6 left-8">
                            <span class="px-3 py-1 bg-white/20 border border-white/30 text-white text-[10px] font-black rounded-full uppercase">{{ selectedCourse.type }}</span>
                            <h2 class="text-3xl font-black text-white mt-2">{{ selectedCourse.title }}</h2>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div class="grid grid-cols-2 gap-4 mb-8">
                            <div class="bg-slate-50 p-4 rounded-2xl">
                                <p class="text-[10px] text-slate-400 font-black uppercase mb-1">上课地点</p>
                                <p class="text-sm font-bold text-slate-700 flex items-center gap-2"><i class="fa-solid fa-location-dot text-rose-500"></i> {{ selectedCourse.location }}</p>
                            </div>
                            <div class="bg-slate-50 p-4 rounded-2xl">
                                <p class="text-[10px] text-slate-400 font-black uppercase mb-1">专题导师</p>
                                <p class="text-sm font-bold text-slate-700 flex items-center gap-2"><i class="fa-solid fa-user-tie text-indigo-500"></i> {{ selectedCourse.teacher || '资深竞赛教练' }}</p>
                            </div>
                        </div>

                        <div class="mb-8">
                            <h5 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">核心内容大纲</h5>
                            <div class="text-sm text-slate-600 leading-relaxed space-y-4">
                                <p>{{ selectedCourse.fullDesc || selectedCourse.desc }}</p>
                                <div class="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50">
                                    <p class="font-bold text-indigo-900 mb-3">你将获得：</p>
                                    <ul class="space-y-2">
                                        <li v-for="point in selectedCourse.learningPoints" :key="point" class="flex items-center gap-2 text-xs text-indigo-700">
                                            <i class="fa-solid fa-circle-check text-indigo-400"></i> {{ point }}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-8 bg-slate-50 flex gap-4 shrink-0">
                        <button @click="selectedCourse = null" class="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-white transition">关闭</button>
                        <button v-if="!hasInTickets(selectedCourse) && !selectedCourse.isHistory" 
                                @click="confirmBookFromDetail" 
                                class="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-indigo-600 transition shadow-xl shadow-slate-200">
                            立即预约 ({{ selectedCourse.price }} 码豆)
                        </button>
                        <button v-else-if="hasInTickets(selectedCourse)" disabled class="flex-[2] py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-xs cursor-default">
                            已在票夹中
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- 水印装饰 -->
        <div class="fixed bottom-0 right-0 p-10 opacity-[0.03] pointer-events-none -z-10 select-none">
            <i class="fa-solid fa-rocket text-[25rem] rotate-12"></i>
        </div>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, watch } = Vue;

        const tabs = [
            { id: 'active', name: '热门预约', icon: 'fa-solid fa-fire' },
            { id: 'tickets', name: '预约专题', icon: 'fa-solid fa-ticket' },
            { id: 'history', name: '往期回顾', icon: 'fa-solid fa-clock-rotate-left' }
        ];
        const currentTab = ref('active');
        const searchQuery = ref('');
        const currentPage = ref(1);
        const pageSize = 8;
        const selectedCourse = ref(null);

        const currentTabName = computed(() => tabs.find(t => t.id === currentTab.value).name);

        // 数据源 (包含历史和活跃课程)
        const allCourses = ref([
            { 
                id: 1, title: 'NOI 暑期算法强化营', desc: '深度解析动态规划与图论，助力省选冲刺。', 
                fullDesc: '本课程专门针对有一定C++基础的学生设计。我们将深入探讨状态压缩DP、树状数组以及网络流等核心竞赛算法。',
                learningPoints: ['掌握状态压缩思想', '理解并查集的进阶应用', '模拟真实竞赛环境测试'],
                price: 1200, deadline: '08/10', endDate: '08/25', teacher: '叶老师 (NOI银牌教练)',
                location: '杭州总部校区', type: '线下特训', icon: 'fa-solid fa-code', 
                bgClass: 'bg-gradient-to-br from-indigo-500 to-blue-600' 
            },
            { 
                id: 2, title: '人工智能入门：手写识别', desc: '动手搭建神经网络，理解机器是如何“看见”数字的。', 
                fullDesc: '探索AI底层逻辑。通过图形化与代码结合，带你训练出一个能够精准识别手写数字的AI模型。',
                learningPoints: ['理解卷积神经网络原理', '训练第一个分类模型', 'AI伦理基础讨论'],
                price: 800, deadline: '09/01', endDate: '09/05', teacher: '李博士 (人工智能实验室)',
                location: '北京中关村校区', type: '名师讲座', icon: 'fa-solid fa-brain', 
                bgClass: 'bg-gradient-to-br from-purple-500 to-indigo-600' 
            },
            { 
                id: 101, title: '2023 寒假编程马拉松', desc: '冬季巅峰赛事，回顾精彩的作品与逻辑。', 
                fullDesc: '本场回顾包含了2023年寒假期间所有选手的创意火花。',
                learningPoints: ['优秀作品逻辑拆解', '评委深入点评视频', '源码获取'],
                price: 0, deadline: '已过', endDate: '01/20', teacher: '官方评审组',
                location: '在线回顾', type: '回顾', icon: 'fa-solid fa-trophy', 
                bgClass: 'bg-slate-400', isHistory: true 
            }
        ]);

        const myTickets = ref([]);

        // 核心过滤逻辑：搜索 + 分类
        const filteredItems = computed(() => {
            let baseList = [];
            if (currentTab.value === 'active') baseList = allCourses.value.filter(c => !c.isHistory);
            else if (currentTab.value === 'history') baseList = allCourses.value.filter(c => c.isHistory);
            else baseList = myTickets.value;

            if (!searchQuery.value.trim()) return baseList;
            
            const q = searchQuery.value.toLowerCase();
            return baseList.filter(item => 
                item.title.toLowerCase().includes(q) || 
                (item.desc && item.desc.toLowerCase().includes(q))
            );
        });

        // 分页计算
        const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize) || 1);
        const paginatedItems = computed(() => {
            const start = (currentPage.value - 1) * pageSize;
            return filteredItems.value.slice(start, start + pageSize);
        });

        const changePage = (p) => {
            if (p < 1 || p > totalPages.value) return;
            currentPage.value = p;
            document.querySelector('.no-scrollbar')?.scrollTo({ top: 0, behavior: 'smooth' });
        };

        const showCourseDetail = (course) => {
            // 如果是票夹里的，也要映射回原始课程数据以获取详情（或者票夹直接存全量）
            selectedCourse.value = course;
        };

        const hasInTickets = (course) => myTickets.value.some(t => t.id === course.id);

        const confirmBookFromDetail = () => {
            const course = selectedCourse.value;
            if (!course) return;
            
            if (props.user.currencies['码豆'] < course.price) {
                emit('show-toast', '码豆余额不足', 'error');
                return;
            }

            emit('show-modal', {
                type: 'confirm',
                title: '确认预约',
                message: `确定要扣除 ${course.price} 码豆预约专题课《${course.title}》吗？`,
                callback: (confirmed) => {
                    if (confirmed) {
                        myTickets.value.unshift({ ...course, time: course.date || '请查看详情', code: 'SC-' + Math.random().toString(36).substr(2, 6).toUpperCase() });
                        emit('show-toast', '预约成功！', 'success');
                        selectedCourse.value = null;
                        setTimeout(() => currentTab.value = 'tickets', 400);
                    }
                }
            });
        };

        const resetFilters = () => {
            currentPage.value = 1;
        };

        watch([currentTab, searchQuery], () => resetFilters());

        return {
            tabs, currentTab, currentTabName, searchQuery,
            currentPage, totalPages, paginatedItems, filteredItems,
            changePage, selectedCourse, showCourseDetail, confirmBookFromDetail, hasInTickets, resetFilters
        };
    }
};

window.SpecialCourseFeature = SpecialCourseFeature;