// ==========================================
// 模块名称：C++ 核心学习 (Feature Cpp Core)
// 版本：V3.7 (作业卡片高度减半与时间格式优化)
// 更新内容：
// 1. [UI] 作业卡片高度减半 (h-40 -> h-20)。
// 2. [UI] 时间显示增加年月日 (formatTimeFull)。
// 3. [UI] 调整内部布局以适应更矮的卡片高度。
// ==========================================

const CppCoreFeature = {
    props: ['user', 'initialTab'],
    emits: ['open-problem', 'show-toast', 'show-modal'],
    
    template: `
    <div class="h-full flex flex-col animate-fade-in-up">
        <!-- 顶部 Tab 导航 -->
        <div class="flex border-b border-slate-200 bg-white mb-6 rounded-lg shadow-sm flex-shrink-0">
            <button @click="activeTab = 'homework'" class="flex-1 py-4 text-center font-bold text-sm transition relative" :class="activeTab === 'homework' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                <i class="fa-solid fa-briefcase mr-1"></i> 我的作业
                <div v-if="activeTab === 'homework'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
            <div class="w-px bg-slate-100 my-2"></div>
            <button @click="activeTab = 'notes'" class="flex-1 py-4 text-center font-bold text-sm transition relative" :class="activeTab === 'notes' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                <i class="fa-solid fa-book-open mr-1"></i> 编程笔记
                <span v-if="unreadSharedNotes > 0" class="absolute top-3 ml-1 size-2 bg-red-500 rounded-full animate-pulse"></span>
                <div v-if="activeTab === 'notes'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
            <div class="w-px bg-slate-100 my-2"></div>
            <button @click="activeTab = 'class'" class="flex-1 py-4 text-center font-bold text-sm transition relative" :class="activeTab === 'class' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                <i class="fa-solid fa-users mr-1"></i> 我的班级
                <div v-if="activeTab === 'class'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-hidden relative">
            
            <!-- ================= Tab 1: 我的作业 (Height Reduced) ================= -->
            <div v-if="activeTab === 'homework'" class="h-full flex flex-col animate-fade-in">
                <div class="flex justify-between items-center mb-4 shrink-0">
                    <div class="flex bg-slate-100 p-1 rounded-lg">
                        <button @click="filterStatus = 'all'" class="px-4 py-1.5 rounded-md text-xs font-bold transition" :class="filterStatus === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">全部</button>
                        <button @click="filterStatus = 'pending'" class="px-4 py-1.5 rounded-md text-xs font-bold transition" :class="filterStatus === 'pending' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">未完成</button>
                        <button @click="filterStatus = 'completed'" class="px-4 py-1.5 rounded-md text-xs font-bold transition" :class="filterStatus === 'completed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'">已完成</button>
                    </div>
                    <div class="relative w-56 group">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-indigo-500 transition-colors"></i>
                        <input v-model="homeworkSearchQuery" type="text" placeholder="搜索作业名称..." class="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition shadow-sm">
                    </div>
                </div>
                
                <!-- 列表区域 (Grid - 高度减半) -->
                <div class="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2">
                    <div v-if="paginatedHomeworks.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        <div v-for="hw in paginatedHomeworks" :key="hw.id" 
                             class="group relative bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-24"
                             @click="handleOpenProblem(hw)">
                            
                            <!-- 左侧状态指示条 -->
                            <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors" :class="hw.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'"></div>
                            
                            <!-- 老师名字 (右上角) -->
                            <div class="absolute top-1.5 right-1.5 z-10 text-[9px] font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 scale-90 origin-top-right">
                                <i class="fa-solid fa-user-tie text-slate-300 mr-0.5"></i> {{ hw.teacher }}
                            </div>

                            <div class="p-2.5 pl-4 flex flex-col h-full relative justify-between">
                                
                                <!-- Header Row: Icon + Title -->
                                <div class="flex items-start gap-2 pr-12"> 
                                    <div class="size-5 rounded-lg flex items-center justify-center text-[10px] shrink-0 transition-colors bg-slate-50 group-hover:bg-indigo-50 mt-0.5" 
                                         :class="hw.status === 'completed' ? 'text-green-500' : 'text-indigo-500'">
                                        <i class="fa-solid" :class="hw.status === 'completed' ? 'fa-check' : 'fa-code'"></i>
                                    </div>
                                    <h3 class="font-bold text-slate-800 text-xs line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors" :title="hw.title">
                                        {{ hw.title }}
                                    </h3>
                                </div>
                                
                                <!-- Time Info (Left-Right Layout, Smaller Text) -->
                                <div class="flex justify-between items-end text-[9px] text-slate-400 group-hover:opacity-10 transition-opacity duration-300">
                                    <div class="flex items-center gap-1">
                                        <span class="scale-90 origin-left whitespace-nowrap">{{ formatTimeFull(hw.assignedAt) }}</span>
                                    </div>
                                    <div v-if="hw.status === 'completed'" class="flex items-center gap-1 text-green-600/80">
                                        <i class="fa-solid fa-check-double scale-75"></i> 
                                        <span class="font-mono scale-90 origin-right whitespace-nowrap">{{ formatTimeFull(hw.completedAt) }}</span>
                                    </div>
                                </div>

                                <!-- Hover Button Overlay (Centered) -->
                                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-white/5 backdrop-blur-[1px]">
                                    <button class="px-3 py-1 rounded-full font-bold text-[10px] shadow-lg transform scale-90 group-hover:scale-100 transition-transform flex items-center gap-1"
                                            :class="hw.status === 'completed' ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'">
                                        <span>{{ hw.status === 'completed' ? '复习' : '挑战' }}</span>
                                        <i class="fa-solid" :class="hw.status === 'completed' ? 'fa-rotate-left' : 'fa-arrow-right'"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
                        <div class="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50 shadow-inner"><i class="fa-solid fa-clipboard-question text-slate-300"></i></div>
                        <p class="text-sm font-medium text-slate-500">未找到相关的作业任务</p>
                        <button v-if="homeworkSearchQuery || filterStatus !== 'all'" @click="resetHomeworkFilter" class="mt-4 text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-indigo-100 transition">重置筛选条件</button>
                    </div>
                </div>
                <!-- 分页控件 -->
                <div v-if="totalHomeworkPages > 1" class="flex justify-center items-center gap-4 mt-2 mb-2 shrink-0 animate-fade-in">
                    <button @click="homeworkPage--" :disabled="homeworkPage === 1" class="size-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                    <span class="text-xs font-bold text-slate-600 font-mono">{{ homeworkPage }} / {{ totalHomeworkPages }}</span>
                    <button @click="homeworkPage++" :disabled="homeworkPage === totalHomeworkPages" class="size-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                </div>
            </div>

            <!-- ================= Tab 2: 编程笔记 (保持不变) ================= -->
            <div v-else-if="activeTab === 'notes'" class="h-full flex flex-col animate-fade-in">
                <div class="flex justify-between items-center mb-4 shrink-0">
                    <div class="relative w-64 group">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs group-focus-within:text-indigo-500 transition-colors"></i>
                        <input v-model="noteSearchQuery" type="text" placeholder="搜索笔记..." class="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition shadow-sm">
                    </div>
                    <button @click="startCreateNote" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-indigo-200 transition transform active:scale-95 flex items-center gap-1">
                        <i class="fa-solid fa-plus"></i> 新建笔记
                    </button>
                </div>
                <!-- 列表区域 -->
                <div class="flex-1 overflow-y-auto custom-scrollbar pb-2 px-1">
                    <div v-if="paginatedNotes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div v-for="note in paginatedNotes" :key="note.id" 
                             class="group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-visible h-48"
                             :class="note.isPinned ? 'border-indigo-200 shadow-md shadow-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1'">
                            
                            <!-- 未读标记 (New Badge) -->
                            <div v-if="note.isShared && note.isUnread" class="absolute -top-1 -right-1 z-20 size-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                            <div v-if="note.isShared && note.isUnread" class="absolute top-2 right-2 z-10 text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase">New</div>

                            <!-- 置顶条 -->
                            <div v-if="note.isPinned" class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-t-2xl"></div>
                            
                            <div class="p-4 flex flex-col h-full relative overflow-hidden rounded-2xl">
                                <!-- 标题行 (支持编辑) -->
                                <div class="flex justify-between items-start mb-2 relative z-10">
                                    <div class="flex items-center gap-2 overflow-hidden flex-1">
                                        <!-- 图标：老师分享 vs 普通笔记 -->
                                        <div v-if="note.isShared" class="h-6 px-1.5 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm bg-purple-500" title="老师分享">
                                            <i class="fa-solid fa-chalkboard-user mr-1"></i> 老师
                                        </div>
                                        <div v-else class="size-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm" :class="note.isPinned ? 'bg-indigo-500' : 'bg-slate-400'">C++</div>
                                        
                                        <!-- 编辑模式 -->
                                        <div v-if="editingNoteId === note.id" class="flex-1">
                                            <input :ref="'editInput-' + note.id" 
                                                   v-model="note.title" 
                                                   @blur="finishEditingTitle(note)" 
                                                   @keyup.enter="finishEditingTitle(note)"
                                                   class="w-full text-sm font-bold text-slate-800 border-b-2 border-indigo-500 outline-none bg-transparent px-1"
                                                   type="text">
                                        </div>
                                        <!-- 展示模式 (现在允许所有笔记进行标题编辑) -->
                                        <div v-else class="flex items-center gap-2 min-w-0">
                                            <h3 class="font-bold text-slate-800 text-sm truncate cursor-pointer hover:text-indigo-600" :title="note.title" @dblclick="startEditingTitle(note)">{{ note.title }}</h3>
                                            <button @click.stop="startEditingTitle(note)" class="text-slate-300 hover:text-indigo-500 transition text-xs opacity-0 group-hover:opacity-100">
                                                <i class="fa-solid fa-pen"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- 置顶按钮 -->
                                    <button @click.stop="togglePin(note)" class="transition-colors transform active:scale-90 ml-1" :class="note.isPinned ? 'text-indigo-500 rotate-45' : 'text-slate-300 hover:text-indigo-400 hover:rotate-45'" :title="note.isPinned ? '取消置顶' : '置顶'"><i class="fa-solid fa-thumbtack"></i></button>
                                </div>

                                <!-- 代码预览区 -->
                                <div class="flex-1 bg-[#1e293b] rounded-lg p-3 relative overflow-hidden border border-slate-700/50 group-hover:border-indigo-500/30 transition-colors cursor-pointer" @click="openQuickView(note)">
                                    <div class="absolute top-2 right-2 flex gap-1 opacity-50"><div class="size-1.5 rounded-full bg-red-500"></div><div class="size-1.5 rounded-full bg-yellow-500"></div><div class="size-1.5 rounded-full bg-green-500"></div></div>
                                    <code class="text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre-wrap line-clamp-3 select-none block mt-1">{{ note.content }}</code>
                                    
                                    <!-- 悬浮遮罩 -->
                                    <div class="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-transparent flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span class="text-[10px] text-white font-bold bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-1">
                                            <i class="fa-solid" :class="note.isShared && note.isUnread ? 'fa-envelope-open' : 'fa-expand'"></i> 
                                            {{ note.isShared && note.isUnread ? '查收笔记' : '点击查看' }}
                                        </span>
                                    </div>
                                </div>

                                <!-- 底部信息 -->
                                <div class="mt-3 flex justify-between items-center h-6">
                                    <span class="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                        <i class="fa-regular fa-clock mr-1"></i> {{ note.lastModified }}
                                    </span>
                                    
                                    <!-- 操作栏：所有笔记（包括分享）现在都可以编辑和删除 -->
                                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button @click="handleOpenProblem(note)" class="size-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition shadow-sm" title="编辑内容"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
                                        <button @click="deleteNote(note.id)" class="size-7 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition shadow-sm" title="删除"><i class="fa-solid fa-trash text-xs"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center py-20 text-slate-400 animate-fade-in">
                        <div class="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50 shadow-inner"><i class="fa-solid fa-file-circle-xmark text-slate-300"></i></div>
                        <p class="text-sm font-medium text-slate-500">未找到与 "<span class="text-indigo-500 font-bold">{{ noteSearchQuery }}</span>" 相关的笔记</p>
                        <button @click="noteSearchQuery = ''" class="mt-3 text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-indigo-100 transition">清除搜索条件</button>
                    </div>
                </div>
                <!-- 分页控件 -->
                <div v-if="totalNotesPages > 1" class="flex justify-center items-center gap-4 mt-2 mb-2 shrink-0 animate-fade-in">
                    <button @click="notesPage--" :disabled="notesPage === 1" class="size-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                    <span class="text-xs font-bold text-slate-600 font-mono">{{ notesPage }} / {{ totalNotesPages }}</span>
                    <button @click="notesPage++" :disabled="notesPage === totalNotesPages" class="size-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                </div>
            </div>

            <!-- ================= Tab 3: 我的班级 (保持不变) ================= -->
            <div v-else-if="activeTab === 'class'" class="h-full flex flex-col animate-fade-in overflow-hidden">
                <!-- 1. 班级选择器 -->
                <div class="flex justify-between items-center mb-6 shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3">
                        <div class="size-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xl"><i class="fa-solid fa-graduation-cap"></i></div>
                        <div>
                            <h2 class="text-sm font-bold text-slate-500">当前班级</h2>
                            <div class="relative group">
                                <button class="flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-indigo-600 transition">{{ currentClass.name }} <i class="fa-solid fa-chevron-down text-xs text-slate-400"></i></button>
                                <div class="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-20 hidden group-hover:block animate-scale-in">
                                    <div class="p-2 space-y-1">
                                        <div v-for="cls in myClasses" :key="cls.id" @click="switchClass(cls)" class="px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between text-sm" :class="currentClass.id === cls.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'hover:bg-slate-50 text-slate-600'"><span>{{ cls.name }}</span><i v-if="currentClass.id === cls.id" class="fa-solid fa-check"></i></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-slate-400"><div class="flex items-center gap-1"><i class="fa-solid fa-users"></i> {{ currentClass.members }} 人</div><div class="flex items-center gap-1"><i class="fa-solid fa-person-chalkboard"></i> {{ currentClass.teacher }}</div></div>
                </div>

                <!-- 2. 主体内容 -->
                <div class="flex-1 flex gap-6 overflow-hidden min-h-0">
                    <!-- 左侧：班级动态流 -->
                    <div class="w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 class="font-bold text-slate-700 text-sm"><i class="fa-solid fa-bolt text-yellow-500 mr-2"></i> 实时动态</h3>
                            <span class="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded animate-pulse">Live</span>
                        </div>
                        <div class="flex-1 overflow-y-auto p-0 custom-scrollbar">
                            <div v-for="(act, idx) in classActivities" :key="idx" class="flex gap-3 p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer group" @click="viewStudentHistory(act)">
                                <div class="relative">
                                    <img :src="act.avatar" class="size-10 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition">
                                    <div v-if="idx < 3" class="absolute -top-1 -right-1 bg-yellow-400 text-white text-[8px] size-4 flex items-center justify-center rounded-full shadow-sm border border-white"><i class="fa-solid fa-fire"></i></div>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start"><span class="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition">{{ act.name }}</span><span class="text-[10px] text-slate-400">{{ act.time }}</span></div>
                                    <p class="text-xs text-slate-500 mt-0.5">完成了 <span class="font-bold text-slate-700">{{ act.problem }}</span></p>
                                    <div class="mt-1 flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded w-fit border border-green-100"><i class="fa-solid fa-check-circle"></i> Passed (100pts)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：题目列表 -->
                    <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 class="font-bold text-slate-700 text-sm">课堂作业列表</h3>
                            <div class="flex gap-2">
                                <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-green-500"></span> <span class="text-xs text-slate-500">已完成</span></span>
                                <span class="flex items-center gap-1 ml-2"><span class="size-2 rounded-full bg-indigo-500"></span> <span class="text-xs text-slate-500">进行中</span></span>
                                <span class="flex items-center gap-1 ml-2"><span class="size-2 rounded-full bg-slate-300"></span> <span class="text-xs text-slate-500">未解锁</span></span>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div class="grid grid-cols-2 gap-4">
                                <div v-for="task in paginatedClassTasks" :key="task.id" 
                                     class="border rounded-xl p-4 transition-all duration-300 group relative overflow-hidden flex flex-col"
                                     :class="task.status === 'locked' ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer'"
                                     @click="task.status !== 'locked' && handleOpenProblem(task)">
                                    <div class="absolute left-0 top-0 bottom-0 w-1.5 transition-colors" 
                                         :class="task.status === 'completed' ? 'bg-green-500' : (task.status === 'locked' ? 'bg-slate-300' : 'bg-indigo-500')"></div>
                                    <div class="pl-4 flex-1 flex flex-col" :class="{'opacity-60 grayscale-[0.5]': task.status === 'locked'}">
                                        <div class="flex justify-between items-start mb-2">
                                            <span class="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">Unit {{ String(task.id).slice(-2) }}</span>
                                            <i v-if="task.status === 'completed'" class="fa-solid fa-circle-check text-green-500 text-lg"></i>
                                            <i v-else-if="task.status === 'locked'" class="fa-solid fa-lock text-slate-400 text-lg"></i>
                                            <i v-else class="fa-regular fa-circle-play text-indigo-400 text-lg group-hover:text-indigo-600 transition"></i>
                                        </div>
                                        <h4 class="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition line-clamp-1">{{ task.title }}</h4>
                                        <p class="text-xs text-slate-400 mb-4 line-clamp-2">{{ task.desc }}</p>
                                        <div class="mt-auto">
                                            <div class="flex justify-between items-end mb-1"><span class="text-[10px] text-slate-400">班级完成率</span><span class="text-xs font-bold font-mono" :class="task.classCompletion >= 80 ? 'text-green-600' : 'text-indigo-600'">{{ task.classCompletion }}%</span></div>
                                            <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-1000" :class="task.status === 'completed' ? 'bg-green-500' : (task.status === 'locked' ? 'bg-slate-300' : 'bg-indigo-500')" :style="{width: task.classCompletion + '%'}"></div></div>
                                        </div>
                                    </div>
                                    <div v-if="task.status === 'locked'" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]"><div class="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg"><i class="fa-solid fa-lock mr-1"></i> 老师未解锁</div></div>
                                </div>
                            </div>
                        </div>
                         <div v-if="totalClassPages > 1" class="flex justify-center items-center gap-4 py-3 border-t border-slate-100 bg-slate-50/50">
                            <button @click="classPage--" :disabled="classPage === 1" class="size-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                            <span class="text-xs font-bold text-slate-600 font-mono">{{ classPage }} / {{ totalClassPages }}</span>
                            <button @click="classPage++" :disabled="classPage === totalClassPages" class="size-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right text-xs"></i></button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modals -->
            <!-- 1. 笔记阅读器 (使用 Teleport, z-30: 位于导航栏之下) -->
            <Teleport to="body">
                <transition name="fade">
                    <div v-if="quickViewNote" class="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-lg flex items-center justify-center p-8 transition-all" @click.self="closeQuickView">
                        <button @click="navigateNote(-1)" :disabled="!hasPrev" class="absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition p-4"><i class="fa-solid fa-chevron-left text-4xl"></i></button>
                        <button @click="navigateNote(1)" :disabled="!hasNext" class="absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white disabled:opacity-10 disabled:cursor-not-allowed transition p-4"><i class="fa-solid fa-chevron-right text-4xl"></i></button>
                        <div class="bg-white w-full max-w-5xl h-[68vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-slate-700/50 relative z-10">
                            <div class="h-16 border-b border-slate-200 flex justify-between items-center px-6 bg-slate-50 shrink-0">
                                <div class="flex items-center gap-4">
                                    <div class="size-8 rounded-lg text-white flex items-center justify-center text-lg shadow-sm" :class="quickViewNote.isShared ? 'bg-purple-600' : 'bg-indigo-600'">
                                        <i class="fa-brands fa-cuttlefish"></i>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="font-bold text-slate-800 text-lg leading-tight">{{ quickViewNote.title }}</h3>
                                            <span v-if="quickViewNote.isShared" class="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold border border-purple-200">老师分享</span>
                                        </div>
                                        <p class="text-xs text-slate-400">最后修改: {{ quickViewNote.lastModified }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs font-mono font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">{{ currentQuickViewIndex + 1 }} / {{ sortedNotes.length }}</span>
                                    <div class="h-4 w-px bg-slate-300"></div>
                                    
                                    <!-- 编辑按钮：允许编辑所有笔记 -->
                                    <button @click="handleOpenProblem(quickViewNote); closeQuickView()" class="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1 transition"><i class="fa-solid fa-pen-to-square"></i> 编辑</button>
                                    
                                    <button @click="closeQuickView" class="text-slate-400 hover:text-slate-600 ml-2 transition"><i class="fa-solid fa-xmark text-xl"></i></button>
                                </div>
                            </div>
                            <div class="flex-1 overflow-auto bg-[#1e1e1e] p-6 relative group"><pre class="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{{ quickViewNote.content }}</pre><div class="absolute bottom-4 right-4 text-[10px] text-white/20 select-none pointer-events-none opacity-0 group-hover:opacity-100 transition">使用 ← → 键快速切换</div></div>
                        </div>
                    </div>
                </transition>
            </Teleport>

            <!-- 2. 学生画像弹窗 (保持不变) -->
            <Teleport to="body">
                <transition name="fade">
                    <div v-if="showStudentHistory" 
                         class="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4" 
                         @click.self="showStudentHistory = false">
                        <div class="w-full max-w-sm bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden animate-scale-in border border-white/50 relative">
                            <div class="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
                            <div class="absolute top-0 right-0 p-4 z-10"><button @click="showStudentHistory = false" class="size-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition backdrop-blur-md"><i class="fa-solid fa-xmark"></i></button></div>
                            <div class="relative pt-16 px-6 pb-6 text-center">
                                <div class="relative inline-block mb-3 group cursor-pointer"><div class="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div><img :src="selectedStudent?.avatar" class="relative size-24 rounded-full border-4 border-white shadow-xl object-cover z-10"><div class="absolute bottom-1 right-1 z-20 bg-green-500 border-2 border-white size-5 rounded-full shadow-sm" title="在线"></div></div>
                                <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-1">{{ selectedStudent?.name }}</h2>
                                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm"><i class="fa-solid fa-medal text-indigo-500 text-xs"></i><span class="text-xs font-bold text-indigo-600 uppercase tracking-wide">Lv.5 算法新星</span></div>
                            </div>
                            <div class="px-6 pb-8">
                                <div class="flex items-center justify-between mb-4"><h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Activity</h4><span class="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">实时</span></div>
                                <div class="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                    <div v-for="(rec, idx) in studentHistoryData" :key="idx" class="relative pl-6 animate-fade-in-up" :style="{ animationDelay: idx * 100 + 'ms' }">
                                        <div class="absolute left-0 top-1.5 size-4 rounded-full border-2 border-white shadow-sm z-10" :class="idx === 0 ? 'bg-indigo-500 ring-2 ring-indigo-100' : 'bg-slate-300'"></div>
                                        <div class="bg-white border border-slate-100 hover:border-indigo-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-default group">
                                            <div class="flex justify-between items-start mb-1"><span class="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-indigo-600 transition">{{ rec.title }}</span><span class="text-[10px] text-slate-300 whitespace-nowrap ml-2 font-mono">{{ rec.time }}</span></div>
                                            <div class="flex items-center gap-2"><span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 flex items-center gap-1"><i class="fa-solid fa-check"></i> AC</span><span class="text-[10px] text-slate-400">100 pts</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        </div>
                    </div>
                </transition>
            </Teleport>

            <!-- 3. 新建笔记弹窗 (保持不变) -->
            <Teleport to="body">
                <transition name="fade">
                    <div v-if="createNoteModal.open" class="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center" @click.self="closeCreateNoteModal">
                        <div class="bg-white rounded-xl shadow-2xl p-6 w-80 animate-scale-in text-center border border-white/20 relative">
                            <h3 class="text-lg font-bold text-slate-800 mb-2">新建笔记</h3>
                            <p class="text-slate-500 text-sm mb-6">请输入笔记标题</p>
                            <div class="mb-6"><input ref="createNoteInput" v-model="createNoteModal.title" @keyup.enter="confirmCreateNote" type="text" placeholder="例如：DFS 深度优先搜索" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"></div>
                            <div class="flex gap-3 justify-center">
                                <button @click="closeCreateNoteModal" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold flex-1 transition">取消</button>
                                <button @click="confirmCreateNote" class="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-200 flex-1 transition">确认</button>
                            </div>
                        </div>
                    </div>
                </transition>
            </Teleport>

        </div>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, watch, onMounted, onUnmounted, nextTick } = Vue;

        const activeTab = ref(props.initialTab || 'homework'); 
        watch(() => props.initialTab, (newTab) => { if (newTab) activeTab.value = newTab; });

        const pageSize = 10; // Increased page size for denser grid
        
        // --- 1. Notes Logic ---
        const noteSearchQuery = ref('');
        const notesPage = ref(1);
        const editingNoteId = ref(null);

        const cppNotes = ref([
            { id: 999, title: 'C++ 易错点总结 (期末必看)', content: '// 老师分享的重点内容：\n// 1. 数组越界问题\n// 2. 数据类型溢出 (long long)\n// 3. 变量未初始化', isPinned: true, lastModified: '10分钟前', isShared: true, isUnread: true },
            { id: 1, title: '冒泡排序模板', content: 'for(int i=0; i<n-1; i++) {\n  for(int j=0; j<n-i-1; j++) {\n    if(a[j] > a[j+1]) swap(a[j], a[j+1]);\n  }\n}', isPinned: true, lastModified: '2025-10-20', isShared: false, isUnread: false },
            { id: 2, title: '快速读入(read)', content: 'inline int read() {\n  int x=0,f=1;char ch=getchar();\n  while(ch<\'0\'||ch>\'9\'){if(ch==\'-\')f=-1;ch=getchar();}\n  while(ch>=\'0\'&&ch<=\'9\'){x=x*10+ch-\'0\';ch=getchar();}\n  return x*f;\n}', isPinned: false, lastModified: '2025-10-18', isShared: false, isUnread: false },
            { id: 3, title: '二分查找 (Binary Search)', content: 'int l=1, r=n, ans=0;\nwhile(l <= r) {\n  int mid = l + (r-l)/2;\n  if(check(mid)) { ans=mid; l=mid+1; }\n  else r=mid-1;\n}', isPinned: false, lastModified: '2025-10-15', isShared: false, isUnread: false },
            { id: 4, title: '最大公约数 (GCD)', content: 'int gcd(int a, int b) {\n  return b == 0 ? a : gcd(b, a % b);\n}', isPinned: false, lastModified: '2025-10-10', isShared: false, isUnread: false },
            { id: 5, title: 'SPFA 最短路', content: 'queue<int> q; q.push(s); dis[s]=0; vis[s]=1; ...', isPinned: false, lastModified: '2025-09-28', isShared: false, isUnread: false },
        ]);
        const quickViewNote = ref(null);
        const createNoteModal = ref({ open: false, title: '' });
        const createNoteInput = ref(null);

        const unreadSharedNotes = computed(() => cppNotes.value.filter(n => n.isShared && n.isUnread).length);

        const sortedNotes = computed(() => {
            let list = cppNotes.value;
            if (noteSearchQuery.value.trim()) list = list.filter(n => n.title.toLowerCase().includes(noteSearchQuery.value.trim().toLowerCase()));
            return list.sort((a, b) => {
                if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
                if (a.isShared && a.isUnread && (!b.isShared || !b.isUnread)) return -1;
                if (b.isShared && b.isUnread && (!a.isShared || !a.isUnread)) return 1;
                return 0;
            });
        });

        const totalNotesPages = computed(() => Math.ceil(sortedNotes.value.length / 6)); // Notes page size fixed at 6
        const paginatedNotes = computed(() => {
            const start = (notesPage.value - 1) * 6;
            return sortedNotes.value.slice(start, start + 6);
        });

        watch(noteSearchQuery, () => { notesPage.value = 1; });

        const openQuickView = (note) => { 
            quickViewNote.value = note; 
            if (note.isShared && note.isUnread) {
                note.isUnread = false; 
                emit('show-toast', '已标记为已读', 'success');
            }
        };
        const closeQuickView = () => { quickViewNote.value = null; };

        const startEditingTitle = (note) => {
            editingNoteId.value = note.id;
            nextTick(() => {
                const el = document.querySelector(`input[type="text"]`); 
                if(el) el.focus();
            });
        };

        const finishEditingTitle = (note) => {
            if (!note.title.trim()) {
                emit('show-toast', '标题不能为空', 'warning');
                return;
            }
            editingNoteId.value = null;
            note.lastModified = '刚刚';
            emit('show-toast', '笔记标题已更新', 'success');
        };

        const currentQuickViewIndex = computed(() => !quickViewNote.value ? -1 : sortedNotes.value.findIndex(n => n.id === quickViewNote.value.id));
        const hasPrev = computed(() => currentQuickViewIndex.value > 0);
        const hasNext = computed(() => currentQuickViewIndex.value !== -1 && currentQuickViewIndex.value < sortedNotes.value.length - 1);
        const navigateNote = (step) => {
            const newIdx = currentQuickViewIndex.value + step;
            if (newIdx >= 0 && newIdx < sortedNotes.value.length) {
                const nextNote = sortedNotes.value[newIdx];
                openQuickView(nextNote); 
            }
        };
        
        const handleKeydown = (e) => {
            if (!quickViewNote.value) return;
            if (e.key === 'ArrowLeft' && hasPrev.value) navigateNote(-1);
            if (e.key === 'ArrowRight' && hasNext.value) navigateNote(1);
            if (e.key === 'Escape') closeQuickView();
        };
        onMounted(() => window.addEventListener('keydown', handleKeydown));
        onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

        const startCreateNote = () => {
            createNoteModal.value = { open: true, title: '' };
            nextTick(() => { if(createNoteInput.value) createNoteInput.value.focus(); });
        };
        const closeCreateNoteModal = () => { createNoteModal.value.open = false; };
        const confirmCreateNote = () => {
            const title = createNoteModal.value.title.trim();
            if (title) {
                cppNotes.value.unshift({ id: Date.now(), title: title, content: '// Write your code here...', isPinned: false, lastModified: '刚刚', isShared: false, isUnread: false });
                emit('show-toast', '新建笔记成功', 'success');
                closeCreateNoteModal();
                notesPage.value = 1;
            } else {
                emit('show-toast', '标题不能为空', 'warning');
            }
        };
        const deleteNote = (id) => {
            emit('show-modal', { type: 'confirm', title: '删除笔记', message: '确定要删除这条笔记吗？\n删除后无法恢复。', callback: (confirmed) => { if (confirmed) { cppNotes.value = cppNotes.value.filter(n => n.id !== id); emit('show-toast', '笔记已删除', 'info'); } } });
        };
        const togglePin = (note) => { note.isPinned = !note.isPinned; };

        // --- 2. Homework Logic (Updated) ---
        const filterStatus = ref('all');
        const homeworkSearchQuery = ref('');
        const homeworkPage = ref(1);
        const cppHomeworks = ref([
            { id: 101, title: '数组逆序输出专项练习', status: 'pending', assignedAt: '2025-01-14 09:00:00', difficulty: '入门', teacher: '李老师', initialCode: '#include<iostream>\nusing namespace std;\nint main() {\n  // TODO\n  return 0;\n}' },
            { id: 102, title: '判断质数 (Prime Number)', status: 'completed', assignedAt: '2025-01-13 14:30:00', completedAt: '2025-01-13 16:22:15', difficulty: '普及-', teacher: '王老师', initialCode: '' },
            { id: 103, title: '斐波那契数列递归与递推', status: 'pending', assignedAt: '2025-01-12 10:00:00', difficulty: '入门', teacher: '张老师', initialCode: '' },
            { id: 104, title: '高精度加法实现', status: 'pending', assignedAt: '2025-01-10 08:45:00', difficulty: '普及/提高-', teacher: '李老师', initialCode: '' },
            { id: 105, title: '快速排序手写实现', status: 'pending', assignedAt: '2025-01-08 16:20:00', difficulty: '普及', teacher: '赵老师', initialCode: '' },
            { id: 106, title: '01 背包问题基础', status: 'pending', assignedAt: '2025-01-05 09:30:00', difficulty: '普及/提高-', teacher: '王老师', initialCode: '' },
            { id: 107, title: 'KMP 字符串匹配', status: 'completed', assignedAt: '2025-01-01 10:00:00', completedAt: '2025-01-02 20:15:33', difficulty: '提高+', teacher: '陈教练', initialCode: '' },
            { id: 108, title: '最小生成树 (Prim/Kruskal)', status: 'pending', assignedAt: '2024-12-28 11:00:00', difficulty: '提高', teacher: '陈教练', initialCode: '' },
        ]);
        const filteredHomeworks = computed(() => {
            let list = cppHomeworks.value;
            if (filterStatus.value !== 'all') list = list.filter(h => h.status === filterStatus.value);
            if (homeworkSearchQuery.value.trim()) list = list.filter(h => h.title.toLowerCase().includes(homeworkSearchQuery.value.trim().toLowerCase()));
            return list;
        });
        const totalHomeworkPages = computed(() => Math.ceil(filteredHomeworks.value.length / pageSize));
        const paginatedHomeworks = computed(() => { const start = (homeworkPage.value - 1) * pageSize; return filteredHomeworks.value.slice(start, start + pageSize); });
        watch([homeworkSearchQuery, filterStatus], () => { homeworkPage.value = 1; });
        const resetHomeworkFilter = () => { homeworkSearchQuery.value = ''; filterStatus.value = 'all'; };
        
        // Updated Helper to format time strictly (e.g., "2025-01-14 09:00")
        const formatTimeFull = (timeStr) => {
            if (!timeStr) return '';
            // Assuming input format YYYY-MM-DD HH:mm:ss, return YYYY-MM-DD HH:mm
            const parts = timeStr.split(' ');
            if (parts.length < 2) return timeStr;
            const dateParts = parts[0];
            const timeParts = parts[1].split(':');
            return `${dateParts} ${timeParts[0]}:${timeParts[1]}`;
        };

        // --- 3. Class Logic (Unchanged) ---
        const myClasses = ref([{ id: 1, name: '五年级 (2) 班 - C++ 入门', members: 45, teacher: '李老师' }, { id: 2, name: '校信奥队 - 算法集训 A 组', members: 12, teacher: '陈教练' }]);
        const currentClass = ref(myClasses.value[0]);
        const classActivities = ref([
            { name: '李明', problem: 'P1001 A+B Problem', time: '刚刚', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiMing' },
            { name: '王强', problem: 'B2029 大象喝水', time: '5分钟前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang' },
            { name: '赵薇', problem: 'P5706 再分肥宅水', time: '12分钟前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao' },
            { name: '孙悟空', problem: 'P1421 小玉买文具', time: '半小时前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sun' },
            { name: '周杰伦', problem: 'P1085 [NOIP2004] 不高兴的津津', time: '1小时前', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jay' },
        ]);
        const classPage = ref(1);
        const classTasks = ref([
            { id: 201, type: '课堂练习', title: '第1章：变量与输入输出', desc: '掌握 cin/cout 及基本数据类型定义。', status: 'completed', classCompletion: 100, difficulty: '入门' },
            { id: 202, type: '课堂练习', title: '第2章：if-else 分支结构', desc: '逻辑运算符与条件判断的综合应用。', status: 'completed', classCompletion: 92, difficulty: '入门' },
            { id: 203, type: '课堂练习', title: '第3章：循环结构 (For/While)', desc: '水仙花数、素数判断等经典算法。', status: 'pending', classCompletion: 65, difficulty: '普及-' },
            { id: 204, type: '课堂练习', title: '第4章：一维数组的应用', desc: '数组存取、最值查找与冒泡排序。', status: 'pending', classCompletion: 15, difficulty: '普及-' },
            { id: 205, type: '课堂练习', title: '第5章：字符串处理', desc: '字符数组与 string 类的基本操作。', status: 'locked', classCompletion: 0, difficulty: '普及' }, 
            { id: 206, type: '课堂练习', title: '第6章：函数与模块化', desc: '自定义函数的声明、定义与调用。', status: 'locked', classCompletion: 0, difficulty: '普及' },
            { id: 207, type: '课堂练习', title: '第7章：结构体与排序', desc: 'struct 定义与 sort 函数自定义比较。', status: 'locked', classCompletion: 0, difficulty: '普及' },
            { id: 208, type: '课堂练习', title: '第8章：文件操作', desc: 'freopen 重定向与文件流读写。', status: 'locked', classCompletion: 0, difficulty: '入门' },
        ]);
        const totalClassPages = computed(() => Math.ceil(classTasks.value.length / 6));
        const paginatedClassTasks = computed(() => { const start = (classPage.value - 1) * 6; return classTasks.value.slice(start, start + 6); });
        const showStudentHistory = ref(false);
        const selectedStudent = ref(null);
        const studentHistoryData = ref([]);
        const switchClass = (cls) => { currentClass.value = cls; emit('show-toast', `已切换到: ${cls.name}`, 'success'); };
        const viewStudentHistory = (activity) => { selectedStudent.value = activity; studentHistoryData.value = [{ title: activity.problem, time: activity.time }, { title: 'P1000 超级玛丽游戏', time: '昨天' }, { title: 'B2005 字符三角形', time: '前天' }]; showStudentHistory.value = true; };
        const handleOpenProblem = (task) => { emit('open-problem', task); };

        return {
            activeTab, unreadSharedNotes,
            noteSearchQuery, cppNotes, quickViewNote, sortedNotes, deleteNote, togglePin, showQuickView: openQuickView, openQuickView, closeQuickView,
            notesPage, totalNotesPages, paginatedNotes,
            startCreateNote, createNoteModal, closeCreateNoteModal, confirmCreateNote, createNoteInput,
            currentQuickViewIndex, hasPrev, hasNext, navigateNote,
            // Editing Logic
            editingNoteId, startEditingTitle, finishEditingTitle,
            filterStatus, homeworkSearchQuery, filteredHomeworks, cppHomeworks, resetHomeworkFilter, formatTimeFull,
            homeworkPage, totalHomeworkPages, paginatedHomeworks,
            myClasses, currentClass, switchClass,
            classActivities, classTasks, classPage, totalClassPages, paginatedClassTasks,
            showStudentHistory, selectedStudent, studentHistoryData, viewStudentHistory,
            handleOpenProblem
        };
    }
};

window.CppCoreFeature = CppCoreFeature;