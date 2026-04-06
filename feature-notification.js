// ==========================================
// 模块名称：沉浸式通知中心 (Feature Notification Center)
// 版本：V2.0 (支持图文详情查看)
// ==========================================

const NotificationCenterFeature = {
    props: ['user', 'teacherNotifications', 'systemMessages', 'initialTab'],
    emits: ['close', 'mark-read', 'mark-all-read', 'delete-msg'],
    
    template: `
    <div class="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 transition-all" @click.self="$emit('close')">
        
        <div class="w-full max-w-6xl h-full bg-[#0f172a] rounded-3xl shadow-2xl border border-slate-700/50 flex overflow-hidden animate-scale-in relative">
            
            <!-- 背景装饰 -->
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <!-- 左侧侧边栏 (导航) -->
            <div class="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col shrink-0 z-20 backdrop-blur-md">
                <!-- Header -->
                <div class="h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
                    <div class="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-3 shadow-lg shadow-indigo-500/30">
                        <i class="fa-solid fa-inbox"></i>
                    </div>
                    <span class="text-lg font-black text-slate-100 tracking-tight">消息中心</span>
                </div>

                <!-- Nav Items -->
                <div class="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    <button @click="switchTab('teacher')" 
                            class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative overflow-hidden"
                            :class="currentTab === 'teacher' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'">
                        <div class="flex items-center gap-3 relative z-10">
                            <i class="fa-solid fa-chalkboard-user w-5 text-center"></i>
                            <span class="font-bold text-sm">教师通知</span>
                        </div>
                        <span v-if="teacherUnread > 0" class="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm relative z-10">{{ teacherUnread }}</span>
                    </button>

                    <button @click="switchTab('system')" 
                            class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group relative overflow-hidden"
                            :class="currentTab === 'system' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'">
                        <div class="flex items-center gap-3 relative z-10">
                            <i class="fa-solid fa-bullhorn w-5 text-center"></i>
                            <span class="font-bold text-sm">系统消息</span>
                        </div>
                        <span v-if="systemUnread > 0" class="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm relative z-10">{{ systemUnread }}</span>
                    </button>
                </div>

                <!-- Bottom Action -->
                <div class="p-4 border-t border-slate-800 shrink-0">
                    <button @click="$emit('mark-all-read')" class="w-full py-2 border border-slate-700 rounded-lg text-slate-400 text-xs font-bold hover:bg-slate-800 hover:text-white transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-check-double"></i> 全部已读
                    </button>
                </div>
            </div>

            <!-- 右侧区域 (列表 + 详情) -->
            <div class="flex-1 flex relative z-10 bg-slate-900/30 overflow-hidden">
                
                <!-- 消息列表 (当详情打开时在移动端隐藏，PC端保持) -->
                <div class="flex-1 flex flex-col h-full transition-all duration-300"
                     :class="{'hidden md:flex': selectedMessage, 'flex': !selectedMessage}">
                    
                    <!-- Toolbar -->
                    <div class="h-20 border-b border-slate-800 flex items-center justify-between px-6 md:px-8 bg-slate-900/50 shrink-0">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                {{ currentTab === 'teacher' ? '教师通知' : '系统消息' }}
                                <span class="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                    {{ currentList.length }} 条
                                </span>
                            </h2>
                        </div>
                        <button @click="$emit('close')" class="size-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <!-- List Container -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-3">
                        <transition-group name="list" tag="div" class="space-y-3">
                            
                            <!-- 空状态 -->
                            <div v-if="currentList.length === 0" key="empty" class="h-64 flex flex-col items-center justify-center text-slate-500">
                                <div class="size-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-2xl">
                                    <i class="fa-regular fa-envelope-open"></i>
                                </div>
                                <p class="text-sm font-medium">暂时没有新消息</p>
                            </div>

                            <!-- 列表项 -->
                            <div v-for="msg in currentList" :key="msg.id" 
                                 @click="openDetail(msg)"
                                 class="group relative border rounded-2xl p-4 transition-all duration-300 cursor-pointer flex gap-4 overflow-hidden hover:translate-x-1"
                                 :class="[
                                    selectedMessage && selectedMessage.id === msg.id 
                                        ? 'bg-indigo-900/20 border-indigo-500/50' 
                                        : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 hover:border-indigo-500/30'
                                 ]">
                                
                                <!-- 未读圆点 -->
                                <div v-if="!msg.read" class="absolute right-3 top-3 size-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse"></div>

                                <!-- Icon -->
                                <div class="shrink-0 pt-1">
                                    <div class="size-10 rounded-xl flex items-center justify-center text-lg shadow-lg transition-transform group-hover:scale-105 duration-300"
                                         :class="getIconClass(msg)">
                                        <i :class="getIcon(msg)"></i>
                                    </div>
                                </div>

                                <!-- Content Preview -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start mb-1">
                                        <h3 class="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition pr-6 truncate" :class="{'opacity-70': msg.read}">{{ msg.title }}</h3>
                                    </div>
                                    <div class="flex items-center gap-2 mb-2 text-[10px] text-slate-500 font-mono">
                                        <span>{{ msg.time }}</span>
                                        <span v-if="msg.images && msg.images.length > 0" class="flex items-center gap-1 bg-slate-700/50 px-1.5 rounded text-slate-400">
                                            <i class="fa-regular fa-image"></i> {{ msg.images.length }}图
                                        </span>
                                    </div>
                                    <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed opacity-80">
                                        {{ msg.desc }}
                                    </p>
                                </div>
                                
                                <!-- Hover Actions (列表快捷操作) -->
                                <div class="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button @click.stop="$emit('delete-msg', msg.id, currentTab)" class="size-7 rounded-lg bg-slate-700/50 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 flex items-center justify-center transition">
                                        <i class="fa-regular fa-trash-can text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                </div>

                <!-- 详情详情页 (Slide Over) -->
                <transition name="slide-in-right">
                    <div v-if="selectedMessage" class="absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[55%] bg-[#0f172a] border-l border-slate-700 shadow-2xl z-20 flex flex-col animate-slide-in-right">
                        
                        <!-- 详情 Header -->
                        <div class="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 shrink-0">
                            <div class="flex items-center gap-3">
                                <button @click="closeDetail" class="md:hidden text-slate-400 hover:text-white mr-2"><i class="fa-solid fa-arrow-left"></i></button>
                                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Details</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <button @click="$emit('delete-msg', selectedMessage.id, currentTab); closeDetail()" class="size-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition" title="删除">
                                    <i class="fa-regular fa-trash-can"></i>
                                </button>
                                <button @click="closeDetail" class="size-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition">
                                    <i class="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>
                        </div>

                        <!-- 详情 Content -->
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
                            <!-- 标题区 -->
                            <div class="mb-6">
                                <div class="flex items-center gap-3 mb-4">
                                    <span v-if="selectedMessage.urgent" class="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">URGENT</span>
                                    <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold">{{ currentTab === 'teacher' ? '教师通知' : '系统消息' }}</span>
                                    <span class="text-xs text-slate-500 font-mono ml-auto">{{ selectedMessage.time }}</span>
                                </div>
                                <h1 class="text-2xl font-black text-white leading-tight mb-2">{{ selectedMessage.title }}</h1>
                                <div class="flex items-center gap-2 text-sm text-slate-400">
                                    <div class="size-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                                        <i :class="getIcon(selectedMessage)"></i>
                                    </div>
                                    <span>发件人: {{ currentTab === 'teacher' ? '教学组' : '系统管理员' }}</span>
                                </div>
                            </div>

                            <div class="h-px bg-slate-800 w-full mb-6"></div>

                            <!-- 正文内容 (Rich Text Simulation) -->
                            <div class="prose prose-invert prose-sm max-w-none text-slate-300">
                                <!-- 描述 -->
                                <p class="text-base leading-relaxed mb-4 font-medium text-slate-200">
                                    {{ selectedMessage.desc }}
                                </p>
                                <!-- 详细内容 (如果有) -->
                                <div v-if="selectedMessage.content" v-html="selectedMessage.content" class="space-y-4 text-slate-400 leading-relaxed"></div>
                            </div>

                            <!-- 图片附件网格 -->
                            <div v-if="selectedMessage.images && selectedMessage.images.length > 0" class="mt-8">
                                <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                    <i class="fa-solid fa-paperclip"></i> 附件图片 ({{ selectedMessage.images.length }})
                                </h4>
                                <div class="grid grid-cols-2 gap-4">
                                    <div v-for="(img, idx) in selectedMessage.images" :key="idx" class="group relative aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 cursor-zoom-in">
                                        <!-- 模拟图片: 使用渐变色块代替真实图片URL，防止404 -->
                                        <div class="w-full h-full flex items-center justify-center text-slate-600 bg-gradient-to-br" :class="img.color || 'from-slate-700 to-slate-800'">
                                            <i class="fa-regular fa-image text-4xl opacity-50"></i>
                                            <span class="absolute bottom-2 left-2 text-[10px] bg-black/50 px-2 py-0.5 rounded text-white backdrop-blur-sm">{{ img.name }}</span>
                                        </div>
                                        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                            <button class="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white backdrop-blur-md transition"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
                                            <button class="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white backdrop-blur-md transition"><i class="fa-solid fa-download"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </transition>

            </div>
        </div>
    </div>
    `
    ,
    setup(props, { emit }) {
        const { ref, computed } = Vue;
        const currentTab = ref(props.initialTab || 'teacher');
        const selectedMessage = ref(null); // 当前选中的消息

        const teacherUnread = computed(() => props.teacherNotifications.filter(n => !n.read).length);
        const systemUnread = computed(() => props.systemMessages.filter(n => !n.read).length);

        const currentList = computed(() => {
            if (currentTab.value === 'teacher') return props.teacherNotifications;
            return props.systemMessages;
        });

        const switchTab = (tab) => {
            currentTab.value = tab;
            selectedMessage.value = null; // 切换 Tab 时关闭详情
        };

        const openDetail = (msg) => {
            selectedMessage.value = msg;
            if (!msg.read) {
                emit('mark-read', msg, currentTab.value);
            }
        };

        const closeDetail = () => {
            selectedMessage.value = null;
        };

        const getIconClass = (msg) => {
            if (currentTab.value === 'teacher') {
                return msg.urgent 
                    ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-900/20' 
                    : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-900/20';
            }
            if (msg.icon.includes('trophy')) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            if (msg.icon.includes('wallet')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            if (msg.icon.includes('server')) return 'bg-slate-700 text-slate-300 border border-slate-600';
            return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
        };

        const getIcon = (msg) => {
            if (currentTab.value === 'teacher') {
                return msg.urgent ? 'fa-solid fa-fire' : 'fa-solid fa-chalkboard-user';
            }
            return msg.icon || 'fa-solid fa-bell';
        };

        return {
            currentTab, switchTab,
            teacherUnread, systemUnread, currentList,
            selectedMessage, openDetail, closeDetail,
            getIconClass, getIcon
        };
    }
};

window.NotificationCenterFeature = NotificationCenterFeature;