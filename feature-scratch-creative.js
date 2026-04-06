// ==========================================
// 模块名称：Scratch 创意中心 (Creative Center)
// 版本：V3.0 (极简酷炫版)
// 更新内容：
// 1. [UX] 移除冗余 Header，使界面与全局导航融为一体。
// 2. [FEAT] 新建作品功能下沉至卡片列表首项，支持即时创建。
// 3. [FEAT] 增强搜索功能，支持名称模糊匹配。
// 4. [UI] 采用酷炫的底纹渐变卡片设计，支持分享/撤回、删除确认。
// ==========================================

const ScratchCreativeFeature = {
    props: ['user'],
    emits: ['show-toast', 'go-back', 'show-modal'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in p-6 md:p-8 overflow-y-auto no-scrollbar">
        
        <!-- 搜索与筛选区 -->
        <div class="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div class="relative w-full md:w-96 group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i class="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-orange-500 transition-colors"></i>
                </div>
                <input v-model="searchQuery" 
                       type="text" 
                       placeholder="搜索我的创意作品..." 
                       class="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all text-sm">
            </div>
            
            <div class="flex items-center gap-4 text-xs font-bold text-slate-400">
                <span class="flex items-center gap-1"><i class="fa-solid fa-layer-group"></i> 全部作品: {{ projects.length }}</span>
                <span class="flex items-center gap-1"><i class="fa-solid fa-share-nodes"></i> 已分享: {{ sharedCount }}</span>
            </div>
        </div>

        <!-- 作品网格列表 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            
            <!-- 新建作品卡片 (首项) -->
            <div class="group relative bg-white border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col justify-center items-center gap-4 hover:border-orange-400 hover:bg-orange-50/30 transition-all duration-300 min-h-[220px]">
                <div class="size-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <i class="fa-solid fa-plus"></i>
                </div>
                <div class="w-full space-y-3">
                    <input v-model="newProjectName" 
                           @keyup.enter="handleQuickCreate"
                           type="text" 
                           placeholder="给作品起个名字..." 
                           class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm focus:outline-none focus:border-orange-400 transition-all">
                    <button @click="handleQuickCreate" 
                            class="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-slate-200 group-hover:shadow-orange-200">
                        立即创建
                    </button>
                </div>
            </div>

            <!-- 作品展示卡片 -->
            <div v-for="project in filteredProjects" :key="project.id" 
                 class="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col border border-slate-100">
                
                <!-- 卡片背景与缩略图区 (无顶图设计，采用背景渐变与图标) -->
                <div class="h-32 relative overflow-hidden flex items-center justify-center transition-all duration-500"
                     :class="getCardBgClass(project)">
                    <!-- 动态底纹 (之前顶图的底色化应用) -->
                    <div class="absolute inset-0 opacity-20 pointer-events-none">
                        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
                        </svg>
                    </div>
                    
                    <i class="fa-solid fa-cat text-4xl text-white/80 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-500"></i>
                    
                    <!-- 状态标签 -->
                    <div v-if="project.isPublic" class="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg shadow-lg flex items-center gap-1 animate-pulse">
                        <i class="fa-solid fa-share-nodes"></i> 已分享
                    </div>
                </div>

                <!-- 内容区 -->
                <div class="p-5 flex-1 flex flex-col">
                    <div class="mb-4">
                        <h3 class="font-bold text-slate-800 group-hover:text-orange-600 transition-colors truncate">{{ project.name }}</h3>
                        <p class="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <i class="fa-regular fa-clock"></i> 最近保存: {{ project.lastModified }}
                        </p>
                    </div>

                    <!-- 操作按钮组 -->
                    <div class="mt-auto grid grid-cols-2 gap-2">
                        <button @click="editProject(project)" 
                                class="col-span-2 py-2.5 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all mb-1 border border-transparent hover:border-orange-100">
                            <i class="fa-solid fa-code"></i> 进入代码编辑
                        </button>
                        
                        <button @click="toggleShare(project)" 
                                :class="project.isPublic ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
                                class="py-2 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1">
                            <i :class="project.isPublic ? 'fa-solid fa-lock' : 'fa-solid fa-globe'"></i>
                            {{ project.isPublic ? '撤回分享' : '公开作品' }}
                        </button>

                        <button @click="confirmDelete(project)" 
                                class="py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1">
                            <i class="fa-solid fa-trash-can"></i> 删除作品
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 搜索为空提示 -->
        <div v-if="filteredProjects.length === 0 && searchQuery" class="py-20 text-center">
            <div class="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <p class="text-slate-400 font-medium">没有找到匹配的作品，换个关键词试试？</p>
        </div>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed } = Vue;

        const searchQuery = ref('');
        const newProjectName = ref('');
        
        const projects = ref([
            { id: 1, name: '超级玛丽世界 1-1', version: '1.2', lastModified: '2小时前', isPublic: true, theme: 'indigo' },
            { id: 2, name: '画笔模拟星空', version: '1.0', lastModified: '昨天', isPublic: false, theme: 'purple' },
            { id: 3, name: '接金币大挑战', version: '2.1', lastModified: '3天前', isPublic: true, theme: 'orange' },
            { id: 4, name: '我的第一个角色动画', version: '1.0', lastModified: '1周前', isPublic: false, theme: 'emerald' },
        ]);

        const filteredProjects = computed(() => {
            if (!searchQuery.value.trim()) return projects.value;
            const q = searchQuery.value.toLowerCase();
            return projects.value.filter(p => p.name.toLowerCase().includes(q));
        });

        const sharedCount = computed(() => projects.value.filter(p => p.isPublic).length);

        const handleQuickCreate = () => {
            const name = newProjectName.value.trim();
            if (!name) {
                emit('show-toast', '请输入作品名称后再创建', 'warning');
                return;
            }
            
            const themes = ['indigo', 'purple', 'orange', 'emerald', 'rose', 'cyan'];
            const newProject = {
                id: Date.now(),
                name: name,
                version: '1.0',
                lastModified: '刚刚',
                isPublic: false,
                theme: themes[Math.floor(Math.random() * themes.length)]
            };

            projects.value.unshift(newProject);
            newProjectName.value = '';
            emit('show-toast', `作品《${name}》已成功创建`, 'success');
        };

        const toggleShare = (project) => {
            project.isPublic = !project.isPublic;
            const msg = project.isPublic ? `作品《${project.name}》已公开分享` : `已取消《${project.name}》的分享`;
            emit('show-toast', msg, 'info');
        };

        const confirmDelete = (project) => {
            emit('show-modal', {
                type: 'confirm',
                title: '删除确认',
                message: `确定要删除作品《${project.name}》吗？\n删除后将无法找回该作品的任何数据。`,
                callback: (confirmed) => {
                    if (confirmed) {
                        projects.value = projects.value.filter(p => p.id !== project.id);
                        emit('show-toast', '作品已成功移除', 'info');
                    }
                }
            });
        };

        const editProject = (project) => {
            emit('show-toast', `正在加载作品: ${project.name} ...`, 'info');
            // 此处可扩展为跳转到 Scratch 编辑器的具体逻辑
        };

        const getCardBgClass = (project) => {
            const themes = {
                indigo: 'bg-gradient-to-br from-indigo-500 to-blue-600',
                purple: 'bg-gradient-to-br from-purple-500 to-indigo-600',
                orange: 'bg-gradient-to-br from-orange-400 to-amber-600',
                emerald: 'bg-gradient-to-br from-emerald-400 to-teal-600',
                rose: 'bg-gradient-to-br from-rose-400 to-pink-600',
                cyan: 'bg-gradient-to-br from-cyan-400 to-blue-500'
            };
            return themes[project.theme] || themes.indigo;
        };

        return {
            searchQuery,
            newProjectName,
            projects,
            filteredProjects,
            sharedCount,
            handleQuickCreate,
            toggleShare,
            confirmDelete,
            editProject,
            getCardBgClass
        };
    }
};

window.ScratchCreativeFeature = ScratchCreativeFeature;