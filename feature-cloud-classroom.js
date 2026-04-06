// ==========================================
// 模块名称：云课堂 (Feature Cloud Classroom)
// 版本：V7.1 (精简版：移除顶部介绍，聚焦分类)
// 更新内容：
// 1. [UI] 移除了顶部的大图 Banner 和文字介绍。
// 2. [UI] 将 C++/Arduino 分类切换整合到顶部工具栏。
// 3. [Layout] 优化了课程列表的布局空间。
// ==========================================

const CloudClassroomFeature = {
    props: ['user'],
    emits: ['open-problem', 'show-toast', 'go-back', 'show-modal'],
    
    template: `
    <div class="h-full flex flex-col relative bg-slate-50 overflow-hidden">
        <!-- 内部导航/面包屑 (全屏或分屏模式下隐藏以腾出空间) -->
        <div v-if="internalView !== 'home' && !isSplitMode && !isFullScreen" class="flex items-center gap-2 mb-4 px-6 pt-4 shrink-0 animate-fade-in-right">
            <button @click="goBack" class="size-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition shadow-sm border border-slate-200">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div class="flex items-center gap-2 text-sm font-bold text-slate-600">
                <span class="opacity-50">云课堂</span>
                <i class="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
                <span class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">{{ activeTrack === 'cpp' ? 'C++ 学院' : 'Arduino 工坊' }}</span>
                <template v-if="internalView === 'detail'">
                    <i class="fa-solid fa-chevron-right text-[10px] opacity-30"></i>
                    <span class="truncate max-w-[200px]">{{ selectedCategory?.title }}</span>
                </template>
            </div>
        </div>

        <!-- ================= 视图 1: 课程大厅 (Home) ================= -->
        <div v-if="internalView === 'home'" class="flex-1 flex flex-col animate-fade-in-up overflow-hidden">
            
            <!-- 顶部工具栏：分类切换与搜索 (取代了原有的 Banner) -->
            <div class="px-8 py-5 flex justify-between items-center shrink-0 bg-white border-b border-slate-200 shadow-sm z-10">
                <div class="flex items-center gap-4">
                    <h2 class="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <i class="fa-solid fa-layer-group text-indigo-500"></i> 课程分类
                    </h2>
                    <div class="h-6 w-px bg-slate-200 mx-2"></div>
                    <div class="flex bg-slate-100 p-1 rounded-xl">
                        <button @click="switchTrack('cpp')" 
                                class="px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2" 
                                :class="activeTrack === 'cpp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'">
                            <i class="fa-brands fa-cuttlefish"></i> C++ 学院
                        </button>
                        <button @click="switchTrack('arduino')" 
                                class="px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2" 
                                :class="activeTrack === 'arduino' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'">
                            <i class="fa-solid fa-microchip"></i> Arduino 工坊
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-xs text-slate-400 font-medium">共 {{ filteredCategories.length }} 门精品课</span>
                    <div class="relative w-64">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input v-model="searchQuery" type="text" placeholder="搜索课程关键词..." class="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white transition shadow-inner">
                    </div>
                </div>
            </div>

            <!-- 列表区域 -->
            <div class="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-slate-50">
                <div v-if="filteredCategories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div v-for="course in paginatedCategories" :key="course.id" @click="selectCategory(course)"
                         class="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer flex flex-col h-full animate-fade-in-up">
                        
                        <!-- 封面图 -->
                        <div class="h-36 relative overflow-hidden flex items-center justify-center transition-colors duration-500" :class="getCourseCoverStyle(course)">
                            <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                            <i class="absolute text-9xl opacity-20 transform -rotate-12 group-hover:scale-125 group-hover:rotate-0 transition-transform duration-700" :class="getCourseIcon(course.type)"></i>
                            
                            <!-- 播放按钮悬浮 -->
                            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]">
                                <div class="size-12 rounded-full bg-white/20 border border-white/40 backdrop-blur-md flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                    <i class="fa-solid fa-play ml-1"></i>
                                </div>
                            </div>

                            <span v-if="course.isNew" class="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm z-10">NEW</span>
                        </div>

                        <div class="p-5 flex-1 flex flex-col">
                            <h4 class="font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition text-base">{{ course.title }}</h4>
                            <p class="text-xs text-slate-500 line-clamp-2 mb-4 flex-1 leading-relaxed">{{ course.desc }}</p>
                            
                            <div class="flex items-center justify-between text-[10px] text-slate-400 mt-auto pt-4 border-t border-slate-50">
                                <div class="flex items-center gap-3">
                                    <span><i class="fa-solid fa-layer-group mr-1"></i> {{ course.lessonCount }} 课时</span>
                                    <span><i class="fa-regular fa-clock mr-1"></i> {{ course.duration }}</span>
                                </div>
                                <span class="bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">{{ course.difficulty }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 空状态 -->
                <div v-else class="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                    <div class="size-24 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 text-4xl opacity-50 shadow-sm">
                        <i class="fa-solid fa-magnifying-glass-minus"></i>
                    </div>
                    <p class="text-sm font-bold">没有找到与 "{{ searchQuery }}" 相关的课程</p>
                    <button @click="searchQuery = ''" class="mt-3 text-indigo-600 text-xs font-bold hover:underline bg-indigo-50 px-4 py-1.5 rounded-full transition">清除搜索条件</button>
                </div>
            </div>

            <!-- 分页栏 -->
            <div v-if="totalPages > 1" class="px-8 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0 z-10">
                <span class="text-xs text-slate-400 mr-2">第 {{ currentPage }} / {{ totalPages }} 页</span>
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="size-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"><i class="fa-solid fa-chevron-left text-xs"></i></button>
                <div class="flex gap-1">
                    <button v-for="p in totalPages" :key="p" @click="changePage(p)" class="size-8 rounded-lg flex items-center justify-center text-xs font-bold transition" :class="currentPage === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'">{{ p }}</button>
                </div>
                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="size-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"><i class="fa-solid fa-chevron-right text-xs"></i></button>
            </div>
        </div>

        <!-- ================= 视图 2: 课程章节列表 (List) ================= -->
        <div v-else-if="internalView === 'list'" class="flex-1 flex flex-col px-6 pb-6 animate-fade-in-right overflow-hidden">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex gap-6 shrink-0 relative overflow-hidden">
                    <div class="absolute -right-10 -top-10 text-9xl opacity-5 transform rotate-12 pointer-events-none">
                        <i :class="getCourseIcon(selectedCategory.type)"></i>
                    </div>
                    <div class="size-24 rounded-xl shrink-0 border border-slate-200 shadow-sm flex items-center justify-center text-white text-4xl overflow-hidden" :class="getCourseCoverStyle(selectedCategory)">
                        <i :class="getCourseIcon(selectedCategory.type)"></i>
                    </div>
                    <div class="flex-1 relative z-10">
                        <h2 class="text-2xl font-bold text-slate-800 mb-2">{{ selectedCategory.title }}</h2>
                        <p class="text-sm text-slate-500 line-clamp-2 mb-2 max-w-2xl">{{ selectedCategory.desc }}</p>
                        <div class="flex items-center gap-4 text-xs text-slate-400">
                            <span><i class="fa-solid fa-user-tie mr-1"></i> {{ selectedCategory.author }}</span>
                            <span><i class="fa-regular fa-clock mr-1"></i> 总时长: {{ selectedCategory.duration }}</span>
                            <span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold">{{ selectedCategory.difficulty }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div class="space-y-3">
                        <div v-for="(lesson, index) in categoryLessons" :key="lesson.id" 
                             @click="openLesson(lesson)"
                             class="flex items-center gap-4 p-4 rounded-xl border transition group cursor-pointer"
                             :class="getLessonStatusClass(lesson)">
                            <div class="size-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-colors"
                                 :class="lesson.status === 'locked' ? 'bg-slate-100 text-slate-400' : (lesson.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600')">
                                <i v-if="lesson.status === 'locked'" class="fa-solid fa-lock"></i>
                                <i v-else-if="lesson.status === 'completed'" class="fa-solid fa-check"></i>
                                <span v-else>{{ index + 1 }}</span>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-slate-700 group-hover:text-indigo-600 transition">{{ lesson.title }}</h4>
                                <p class="text-xs text-slate-400 mt-0.5">{{ lesson.duration }} • {{ lesson.points }} 个知识点</p>
                            </div>
                            <button class="size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition" 
                                    :disabled="lesson.status === 'locked'">
                                <i class="fa-solid fa-play text-xs pl-0.5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= 视图 3: 分屏工坊播放页 (Detail) ================= -->
        <div v-else-if="internalView === 'detail'" 
             class="flex animate-fade-in overflow-hidden transition-all duration-500"
             :class="[
                isFullScreen ? 'fixed inset-0 z-[500] bg-black' : 'flex-1 rounded-xl',
                isSplitMode ? 'flex-row' : (isFullScreen ? 'flex-row justify-center' : 'flex-col lg:flex-row px-6 pb-6 gap-6')
             ]">
            
            <!-- 左侧：播放器区域 -->
            <div class="flex flex-col overflow-hidden transition-all duration-500 relative"
                 :class="[
                    isSplitMode ? (isFullScreen ? 'w-[65%]' : 'w-[60%] lg:w-[65%]') : (isFullScreen ? 'w-full max-w-5xl' : 'flex-1'),
                    isFullScreen ? 'bg-black' : ''
                 ]">
                
                <!-- 视频播放容器 -->
                <div class="bg-black relative group shadow-2xl overflow-hidden transition-all duration-500 flex flex-col"
                     :class="[
                        isSplitMode || isFullScreen ? 'flex-1' : 'aspect-video rounded-xl shrink-0',
                        isFullScreen ? '' : 'rounded-xl'
                     ]">
                    
                    <video ref="videoPlayerRef" class="w-full h-full object-contain bg-black"></video>
                    
                    <!-- 封面 (仅未播放时显示) -->
                    <div v-if="currentTime === 0 && !isPlaying" class="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                         <div class="text-white text-center">
                            <div class="size-20 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                                <i :class="getCourseIcon(selectedCategory.type)" class="text-4xl opacity-50"></i>
                            </div>
                            <p class="text-sm font-bold opacity-70">点击播放开始学习</p>
                         </div>
                    </div>

                    <!-- 交互 UI (Hover显示) -->
                    <div class="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/60 via-transparent to-black/80 transition-opacity duration-300 z-20" 
                         :class="(isPlaying && !interactionActive) ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'">
                        
                        <!-- 顶部栏 -->
                        <div class="flex justify-between items-center text-white">
                            <div class="flex items-center gap-3 overflow-hidden">
                                <!-- 退出全屏时的返回按钮 -->
                                <button v-if="isFullScreen" @click="toggleFullScreen" class="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur transition border border-white/10">
                                    <i class="fa-solid fa-arrow-left"></i>
                                </button>
                                <span class="text-sm font-bold truncate pr-4 drop-shadow-md">{{ selectedLesson?.title }}</span>
                            </div>
                            
                            <div class="flex gap-2 shrink-0">
                                <!-- 分屏切换按钮 -->
                                <button @click="toggleSplitMode" class="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur flex items-center gap-2 transition-all border border-white/10 group/btn" 
                                        :title="isSplitMode ? '退出工坊模式' : '开启分屏工坊模式'">
                                    <i class="fa-solid group-hover/btn:text-indigo-300 transition-colors" :class="isSplitMode ? 'fa-compress' : 'fa-columns'"></i>
                                    <span class="text-xs font-bold hidden sm:inline">{{ isSplitMode ? '退出工坊' : '分屏工坊' }}</span>
                                </button>
                                
                                <!-- 全屏切换按钮 -->
                                <button @click="toggleFullScreen" class="size-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-all border border-white/10" 
                                        :title="isFullScreen ? '退出全屏' : '全屏沉浸模式'">
                                    <i class="fa-solid" :class="isFullScreen ? 'fa-compress-arrows-alt' : 'fa-expand'"></i>
                                </button>

                                <button v-if="!isFullScreen" @click="goBack" class="size-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-all border border-white/10">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                        
                        <!-- 中间播放按钮 -->
                        <div class="absolute inset-0 flex items-center justify-center pointer-events-none" v-if="!interactionActive">
                            <button @click="togglePlay" class="size-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition pointer-events-auto shadow-lg border border-white/10">
                                <i class="fa-solid text-2xl ml-1" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
                            </button>
                        </div>

                        <!-- 底部控制条 -->
                        <div class="flex items-center gap-4 text-white text-xs select-none">
                            <button @click="togglePlay" class="hover:text-indigo-400 transition"><i class="fa-solid text-lg" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i></button>
                            <span class="font-mono">{{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}</span>
                            <div class="flex-1 h-1.5 bg-white/30 rounded-full cursor-pointer relative group/progress transition-all hover:h-2" @click="handleSeek">
                                <div class="absolute h-full bg-indigo-500 rounded-full" :style="{width: progressPercent + '%'}">
                                    <div class="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow-sm scale-0 group-hover/progress:scale-100 transition-transform"></div>
                                </div>
                                <!-- 互动点标记 -->
                                <div v-for="point in currentLessonInteractions" :key="point.time" 
                                     class="absolute top-1/2 -translate-y-1/2 size-2 bg-yellow-400 rounded-full border border-black z-10 hover:scale-150 transition" 
                                     :style="{left: (point.time / totalDuration * 100) + '%'}"
                                     :title="point.done ? '已完成测试' : '随堂测验点'"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 互动弹题覆盖层 -->
                    <transition name="fade">
                        <div v-if="interactionActive && currentInteraction" class="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-8">
                            <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-scale-in border border-indigo-100 flex flex-col max-h-full relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                <div class="flex justify-between items-center mb-4 shrink-0">
                                    <span class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider">随堂测验</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-slate-500 font-bold">第 {{ currentQuestionIndex + 1 }} / {{ currentInteraction.questions.length }} 题</span>
                                    </div>
                                </div>
                                <div class="flex-1 overflow-y-auto mb-4 custom-scrollbar px-1">
                                    <h3 class="text-lg font-bold text-slate-800 mb-6 leading-relaxed">{{ currentQuestion.question }}</h3>
                                    <div class="space-y-3">
                                        <button v-for="(opt, idx) in currentQuestion.options" :key="idx" 
                                                @click="selectOption(idx)"
                                                class="w-full p-3.5 rounded-xl border text-left text-sm font-medium transition flex items-center gap-3 group relative overflow-hidden"
                                                :class="getOptionClass(idx)">
                                            <span class="size-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                                                  :class="getOptionBadgeClass(idx)">
                                                {{ String.fromCharCode(65 + idx) }}
                                            </span>
                                            {{ opt }}
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-2 flex justify-between items-center shrink-0 pt-4 border-t border-slate-100">
                                    <div class="text-xs">
                                        <span v-if="answerStatus === 'correct'" class="text-green-600 font-bold flex items-center gap-1 animate-pulse"><i class="fa-solid fa-check-circle"></i> 回答正确</span>
                                        <span v-if="answerStatus === 'wrong'" class="text-red-500 font-bold flex items-center gap-1 animate-pulse"><i class="fa-solid fa-circle-xmark"></i> 答案错误</span>
                                    </div>
                                    <button @click="handleInteractionBtn" :disabled="selectedOption === null && answerStatus === 'pending'" 
                                            class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 flex items-center gap-2">
                                        {{ getInteractionBtnText() }} 
                                        <i class="fa-solid" :class="getInteractionBtnIcon()"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <!-- 课程介绍 (非分屏且非全屏模式显示) -->
                <div v-if="!isSplitMode && !isFullScreen" class="flex-1 bg-white rounded-xl mt-4 border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div class="flex border-b border-slate-100 bg-slate-50/50">
                        <div class="px-6 py-3 text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 bg-white">课程介绍</div>
                    </div>
                    <div class="p-6 overflow-y-auto custom-scrollbar text-sm text-slate-600 leading-relaxed">
                        <h3 class="font-bold text-slate-800 mb-2 text-base">本节知识点</h3>
                        <ul class="list-disc list-inside space-y-2 mb-6 text-slate-500">
                            <li>理解指针的基本概念与内存地址分配。</li>
                            <li>掌握指针变量的声明、初始化及解引用操作。</li>
                            <li>分析指针运算在数组遍历中的应用场景。</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- 右侧：分屏工坊随笔区 (Split Mode) -->
            <div v-if="isSplitMode" 
                 class="flex flex-col bg-[#1e1e1e] border-l border-slate-700 animate-slide-in-right relative shadow-[0_0_50px_rgba(0,0,0,0.5)] z-30 transition-all duration-300"
                 :class="isFullScreen ? 'w-[35%]' : 'w-[40%] lg:w-[35%]'">
                
                <!-- 随笔控制栏 -->
                <div class="h-12 flex items-center justify-between px-4 bg-[#252526] border-b border-[#333] shrink-0 select-none">
                    <div class="flex items-center gap-2">
                        <div class="size-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs border border-indigo-500/30">
                            <i class="fa-solid fa-code"></i>
                        </div>
                        <span class="text-xs font-bold text-slate-300">代码随笔 (Scratchpad)</span>
                    </div>
                    <button @click="syncToWorkspace" class="text-[10px] bg-indigo-600 text-white border border-indigo-500 px-3 py-1.5 rounded hover:bg-indigo-500 transition flex items-center gap-2 font-bold shadow-lg shadow-indigo-900/50 group">
                        <i class="fa-solid fa-cloud-arrow-up group-hover:animate-bounce"></i> 同步到工作台
                    </button>
                </div>
                
                <!-- 代码编辑区 -->
                <div class="flex-1 relative overflow-hidden group">
                    <textarea v-model="scratchpadCode" 
                              class="absolute inset-0 w-full h-full bg-[#1e1e1e] text-indigo-100 p-4 font-mono text-sm outline-none resize-none selection:bg-indigo-500/30 custom-scrollbar leading-6" 
                              spellcheck="false" 
                              placeholder="// 在此处跟随视频编写代码..."></textarea>
                    
                    <!-- 空状态提示 -->
                    <div v-if="!scratchpadCode" class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-10">
                        <i class="fa-solid fa-keyboard text-5xl mb-4 text-white"></i>
                        <p class="text-xs text-white uppercase tracking-widest font-bold">Ready to Code</p>
                    </div>
                </div>

                <!-- 随笔底部栏 -->
                <div class="p-2 bg-[#252526] border-t border-[#333] flex justify-between items-center text-[10px] text-slate-500 font-mono select-none">
                    <span>MODE: {{ isFullScreen ? 'FULLSCREEN_STUDIO' : 'SPLIT_STUDIO' }}</span>
                    <span class="flex items-center gap-1"><i class="fa-solid fa-circle text-[6px] text-green-500"></i>Active</span>
                </div>
            </div>

            <!-- 右侧：资料与练习 (非分屏且非全屏模式显示) -->
            <div v-if="!isSplitMode && !isFullScreen" class="w-80 flex flex-col gap-4">
                <!-- 练习卡片 -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-1/2">
                    <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 text-sm"><i class="fa-solid fa-code text-indigo-500 mr-2"></i> 随堂编程</h3>
                        <span class="text-xs text-slate-400">{{ currentCodeProblems.filter(p=>p.status==='passed').length }}/{{ currentCodeProblems.length }}</span>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        <div v-for="prob in currentCodeProblems" :key="prob.id" 
                             class="p-3 rounded-lg border flex items-center justify-between group transition hover:shadow-sm"
                             :class="prob.status === 'passed' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-indigo-200'">
                            <div>
                                <div class="text-xs font-bold text-slate-700 mb-0.5">{{ prob.title }}</div>
                                <div class="text-[10px]" :class="prob.status === 'passed' ? 'text-green-600' : 'text-slate-400'">
                                    {{ prob.status === 'passed' ? '已通过' : '未完成' }}
                                </div>
                            </div>
                            <button @click="$emit('open-problem', prob)" class="size-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 资料下载 -->
                <div class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1">
                    <div class="p-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 class="font-bold text-slate-700 text-sm"><i class="fa-solid fa-folder-open text-blue-500 mr-2"></i> 课件资料</h3>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        <div v-for="file in currentResources" :key="file.id" 
                             class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition"
                             @click="downloadFile(file)">
                            <div class="size-8 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-xs uppercase font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                                {{ file.type }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-xs font-bold text-slate-700 truncate">{{ file.name }}</div>
                                <div class="text-[10px] text-slate-400">{{ file.size }}</div>
                            </div>
                            <i class="fa-solid fa-download text-slate-300 group-hover:text-blue-500 transition"></i>
                        </div>
                    </div>
                </div>

                <!-- 解锁按钮 -->
                <button @click="completeLesson" 
                        class="w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        :class="allCodePassed ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200 animate-pulse' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
                    <i class="fa-solid" :class="allCodePassed ? 'fa-lock-open' : 'fa-lock'"></i>
                    {{ allCodePassed ? '解锁下一课' : '完成编程练习以解锁' }}
                </button>
            </div>
        </div>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, onUnmounted } = Vue;

        const internalView = ref('home');
        const activeTrack = ref('cpp'); 
        const searchQuery = ref('');
        const videoPlayerRef = ref(null);

        // --- 分屏与全屏状态 (NEW) ---
        const isSplitMode = ref(false);
        const isFullScreen = ref(false);
        const scratchpadCode = ref('');

        const toggleSplitMode = () => {
            isSplitMode.value = !isSplitMode.value;
            // 如果开启分屏且不在全屏，可以考虑自动全屏体验更好，但这里交由用户手动控制
            emit('show-toast', isSplitMode.value ? '已进入工坊模式' : '已退出分屏', 'info');
        };

        const toggleFullScreen = () => {
            isFullScreen.value = !isFullScreen.value;
            // 如果退出全屏，确保布局重置
            // isSplitMode 保持不变，允许用户只用小窗口分屏
        };

        const syncToWorkspace = () => {
            if (!scratchpadCode.value.trim()) {
                emit('show-toast', '随笔内容为空，无法同步', 'warning');
                return;
            }
            const task = {
                id: 'scratch-' + Date.now(),
                title: `随堂代码快照 ${new Date().toLocaleTimeString()}`,
                code: scratchpadCode.value,
                type: 'sketch',
                status: 'pending'
            };
            emit('open-problem', task);
            emit('show-toast', '代码已同步至编程工作台', 'success');
        };

        // --- 模拟数据 ---
        const recentVideos = ref([
            { id: 101, title: 'C++ 指针基础 (上)', progress: 45, categoryId: 1, lessonId: 101, timestamp: 15 },
            { id: 202, title: 'Arduino 传感器应用', progress: 80, categoryId: 2, lessonId: 202, timestamp: 24 }
        ]);

        const generateCategories = () => {
            return [
                { id: 1, type: 'cpp', title: 'C++ 核心：指针与引用', desc: '深入理解内存管理，掌握 C++ 指针的高级用法。', lessonCount: 8, difficulty: '进阶', author: '李老师', duration: '4小时' },
                { id: 2, type: 'arduino', title: 'Arduino 智能家居实战', desc: '动手制作温湿度监控、自动浇花系统。', lessonCount: 12, difficulty: '入门', author: '王工', duration: '6小时', isNew: true },
                { id: 3, type: 'cpp', title: 'STL 标准库详解', desc: 'Vector, Map, Set 等容器的高效使用指南。', lessonCount: 10, difficulty: '中级', author: '张老师', duration: '5小时' },
                { id: 4, type: 'cpp', title: '动态规划专题', desc: '算法竞赛难点攻克，从入门到状态转移方程。', lessonCount: 15, difficulty: '困难', author: '陈教练', duration: '8小时' },
                { id: 5, type: 'cpp', title: 'C++ 基础语法入门', desc: '变量、控制流、函数的基础知识。', lessonCount: 6, difficulty: '入门', author: '赵老师', duration: '3小时' },
                { id: 6, type: 'arduino', title: '电子元件基础', desc: '电阻、电容、二极管的工作原理与应用。', lessonCount: 8, difficulty: '入门', author: '刘工', duration: '4小时' },
                { id: 7, type: 'cpp', title: '面向对象编程 OOP', desc: '类、对象、继承与多态的深度解析。', lessonCount: 12, difficulty: '中级', author: '李老师', duration: '6小时' },
                { id: 8, type: 'cpp', title: '图论算法基础', desc: 'DFS, BFS, 最短路径算法。', lessonCount: 10, difficulty: '进阶', author: '陈教练', duration: '5小时' },
                { id: 9, type: 'arduino', title: 'ESP32 物联网开发', desc: 'Wi-Fi 模块连接与云平台数据上报。', lessonCount: 14, difficulty: '进阶', author: '王工', duration: '7小时', isNew: true },
                { id: 10, type: 'cpp', title: '高级数据结构', desc: '线段树、树状数组、并查集。', lessonCount: 8, difficulty: '困难', author: '张老师', duration: '6小时' },
                { id: 11, type: 'arduino', title: '机器人控制原理', desc: '电机驱动、PID 控制算法入门。', lessonCount: 10, difficulty: '中级', author: '刘工', duration: '5小时' },
                { id: 12, type: 'cpp', title: 'C++11/14/17 新特性', desc: 'Lambda 表达式、智能指针、右值引用。', lessonCount: 5, difficulty: '进阶', author: '赵老师', duration: '2小时' }
            ];
        };
        const categories = ref(generateCategories());

        const categoryLessons = ref([]); 
        const selectedCategory = ref(null);
        const selectedLesson = ref(null);
        const currentCodeProblems = ref([]);
        
        const currentResources = ref([
            { id: 1, name: '课件PPT.pdf', size: '2.4MB', type: 'PDF' },
            { id: 2, name: '示例代码.cpp', size: '4KB', type: 'CODE' },
            { id: 3, name: '参考手册.docx', size: '1.2MB', type: 'DOC' }
        ]);

        const mockInteractions = {
            101: [
                { 
                    time: 5, 
                    questions: [
                        { question: '1/3 以下哪个符号用于获取变量的地址？', options: ['*', '&', '#', '@'], correct: 1 },
                        { question: '2/3 int a = 10; 变量 a 存储在什么区域？', options: ['栈 (Stack)', '堆 (Heap)', '全局区', '代码区'], correct: 0 },
                        { question: '3/3 32位系统中，指针占用多少字节？', options: ['2', '4', '8', '16'], correct: 1 }
                    ],
                    done: false 
                },
                { 
                    time: 10, 
                    questions: [
                        { question: '1/3 int *p = &a; *p 表示什么？', options: ['a 的地址', 'a 的值', 'p 的地址', 'undefined'], correct: 1 },
                        { question: '2/3 修改 *p 会影响 a 的值吗？', options: ['会', '不会', '看情况', '报错'], correct: 0 },
                        { question: '3/3 如何定义一个空指针？', options: ['int *p = 0;', 'int *p = NULL;', 'int *p = nullptr;', '以上皆可'], correct: 3 }
                    ],
                    done: false 
                },
                { 
                    time: 20, 
                    questions: [
                        { question: '1/3 数组名在大多数情况下退化为？', options: ['首元素值', '首元素地址', '整个数组', '引用'], correct: 1 },
                        { question: '2/3 若 p 指向 int 数组，p++ 移动多少字节？', options: ['1', '4', '8', '随机'], correct: 1 },
                        { question: '3/3 *(p+i) 等价于？', options: ['p[i]', '&p[i]', 'p->i', 'p.i'], correct: 0 }
                    ],
                    done: false 
                }
            ]
        };
        const currentLessonInteractions = ref([]);

        const isPlaying = ref(false);
        const currentTime = ref(0);
        const totalDuration = ref(30); 
        const interactionActive = ref(false);
        const currentInteraction = ref(null);
        const currentQuestionIndex = ref(0); 
        const selectedOption = ref(null);
        const answerStatus = ref('pending');
        let playInterval = null;

        const currentPage = ref(1);
        const pageSize = 8; 

        // Helpers
        const getCourseIcon = (type) => ({ cpp: 'fa-brands fa-cuttlefish', arduino: 'fa-solid fa-microchip' }[type] || 'fa-solid fa-code');
        const getCourseCoverStyle = (c) => [
            'bg-gradient-to-br from-indigo-500 to-blue-600', 'bg-gradient-to-br from-emerald-500 to-teal-600',
            'bg-gradient-to-br from-violet-500 to-purple-600', 'bg-gradient-to-br from-orange-500 to-amber-600',
            'bg-gradient-to-br from-cyan-500 to-sky-600'
        ][(c.id||0) % 5];

        // Computed
        const filteredCategories = computed(() => {
            let list = categories.value.filter(c => c.type === activeTrack.value);
            if (searchQuery.value) list = list.filter(c => c.title.toLowerCase().includes(searchQuery.value.toLowerCase()));
            return list;
        });
        const totalPages = computed(() => Math.ceil(filteredCategories.value.length / pageSize));
        const paginatedCategories = computed(() => filteredCategories.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize));
        const allCodePassed = computed(() => currentCodeProblems.value.length > 0 && currentCodeProblems.value.every(p => p.status === 'passed'));
        const progressPercent = computed(() => (currentTime.value / totalDuration.value) * 100);
        const currentQuestion = computed(() => currentInteraction.value?.questions[currentQuestionIndex.value] || {});

        // Actions
        const changePage = (p) => {
            if (p >= 1 && p <= totalPages.value) currentPage.value = p;
        };
        
        const switchTrack = (track) => {
            activeTrack.value = track;
            currentPage.value = 1; 
            searchQuery.value = ''; 
        };

        const selectCategory = (cat) => {
            selectedCategory.value = cat;
            categoryLessons.value = Array.from({length: cat.lessonCount}, (_, i) => ({
                id: cat.id * 100 + i + 1,
                title: `${cat.title} - 第 ${i+1} 节`,
                duration: '15:00',
                points: Math.floor(Math.random() * 5) + 1,
                status: i === 0 ? 'current' : (i < 3 ? 'completed' : 'locked')
            }));
            internalView.value = 'list';
        };

        const openLesson = (lesson, startTime = 0) => {
            if (lesson.status === 'locked') return;
            selectedLesson.value = lesson;
            currentTime.value = startTime;
            isPlaying.value = false;
            interactionActive.value = false;
            
            const interactions = mockInteractions[101] || [];
            currentLessonInteractions.value = JSON.parse(JSON.stringify(interactions));
            currentLessonInteractions.value.forEach(i => { if (i.time < startTime) i.done = true; });
            
            currentCodeProblems.value = [
                { id: 1001, title: '概念验证：指针声明', status: 'pending', description: '声明一个指向整数的指针变量 ptr。' },
                { id: 1002, title: '实战演练：地址交换', status: 'pending', description: '编写函数 swap，通过指针交换两个变量的值。' },
                { id: 1003, title: '挑战任务：数组遍历', status: 'passed', description: '使用指针算术运算遍历并打印数组元素。' }
            ];
            internalView.value = 'detail';
            
            // 重置随笔
            scratchpadCode.value = `// 学习笔记: ${lesson.title}\n// 跟随老师的代码演示...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}`;
            
            if (startTime > 0) emit('show-toast', `已恢复至: ${formatTime(startTime)}`, 'info');
        };

        const goBack = () => {
            // 如果在全屏模式，先退出全屏
            if (isFullScreen.value) {
                isFullScreen.value = false;
                return;
            }
            // 如果在分屏模式，先退出分屏
            if (isSplitMode.value) {
                isSplitMode.value = false;
                return;
            }
            if (internalView.value === 'detail') internalView.value = 'list';
            else if (internalView.value === 'list') internalView.value = 'home';
            else emit('go-back');
        };

        const continueLearning = (video) => {
            const cat = categories.value.find(c => c.id === video.categoryId);
            if (cat) {
                selectCategory(cat);
                const lesson = categoryLessons.value.find(l => l.id === video.lessonId);
                if (lesson) openLesson(lesson, video.timestamp);
            }
        };

        const togglePlay = () => {
            isPlaying.value = !isPlaying.value;
            if (isPlaying.value) {
                playInterval = setInterval(() => {
                    if (currentTime.value >= totalDuration.value) {
                        isPlaying.value = false;
                        clearInterval(playInterval);
                        return;
                    }
                    currentTime.value += 0.5; 
                    checkInteraction();
                }, 500);
            } else {
                clearInterval(playInterval);
            }
        };

        const checkInteraction = () => {
            const hit = currentLessonInteractions.value.find(i => Math.abs(i.time - currentTime.value) < 0.6 && !i.done);
            if (hit) pauseForInteraction(hit);
        };

        const pauseForInteraction = (interaction) => {
            isPlaying.value = false;
            clearInterval(playInterval);
            interactionActive.value = true;
            currentInteraction.value = interaction;
            currentQuestionIndex.value = 0; 
            selectedOption.value = null;
            answerStatus.value = 'pending';
        };

        const selectOption = (idx) => {
            if (answerStatus.value === 'correct') return;
            selectedOption.value = idx;
        };

        const handleInteractionBtn = () => {
            if (answerStatus.value === 'pending' || answerStatus.value === 'wrong') {
                if (selectedOption.value === currentQuestion.value.correct) {
                    answerStatus.value = 'correct';
                    emit('show-toast', '回答正确！', 'success');
                } else {
                    answerStatus.value = 'wrong';
                    emit('show-toast', '答案错误，请重试', 'error');
                }
                return;
            }

            if (answerStatus.value === 'correct') {
                if (currentQuestionIndex.value < currentInteraction.value.questions.length - 1) {
                    currentQuestionIndex.value++;
                    selectedOption.value = null;
                    answerStatus.value = 'pending';
                } else {
                    currentInteraction.value.done = true;
                    interactionActive.value = false;
                    togglePlay(); 
                }
            }
        };

        const getInteractionBtnText = () => {
            if (answerStatus.value === 'correct') {
                return currentQuestionIndex.value < currentInteraction.value.questions.length - 1 ? '下一题' : '继续播放';
            }
            return answerStatus.value === 'wrong' ? '重试' : '提交答案';
        };

        const getInteractionBtnIcon = () => {
            if (answerStatus.value === 'correct') return currentQuestionIndex.value < currentInteraction.value.questions.length - 1 ? 'fa-arrow-right' : 'fa-play';
            return answerStatus.value === 'wrong' ? 'fa-rotate-right' : 'fa-paper-plane';
        };

        const handleSeek = (e) => {
            if (interactionActive.value) return; 
            const rect = e.currentTarget.getBoundingClientRect();
            currentTime.value = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * totalDuration.value;
        };

        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        };

        const getOptionClass = (idx) => {
            if (answerStatus.value === 'correct' && idx === currentQuestion.value.correct) return 'bg-green-50 border-green-200 text-green-700';
            if (answerStatus.value === 'wrong' && idx === selectedOption.value) return 'bg-red-50 border-red-200 text-red-600';
            if (selectedOption.value === idx) return 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200';
            return 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';
        };

        const getOptionBadgeClass = (idx) => {
            if (answerStatus.value === 'correct' && idx === currentQuestion.value.correct) return 'bg-green-200 border-green-300 text-green-700';
            if (answerStatus.value === 'wrong' && idx === selectedOption.value) return 'bg-red-200 border-red-300 text-red-700';
            if (selectedOption.value === idx) return 'bg-indigo-600 border-indigo-600 text-white';
            return 'bg-white border-slate-200 text-slate-400';
        };

        const getLessonStatusClass = (l) => (l.status === 'current' ? 'border-indigo-200 shadow-sm ring-1 ring-indigo-100 bg-white' : 'border-slate-100 bg-slate-50/50');
        
        const completeLesson = () => { 
            if (!allCodePassed.value) return; 
            const idx = categoryLessons.value.findIndex(l => l.id === selectedLesson.value.id); 
            if (idx !== -1 && idx < categoryLessons.value.length - 1) { 
                emit('show-modal', {
                    type: 'confirm',
                    title: '恭喜完成！',
                    message: '您已通过本节课的所有考核。是否立即解锁并进入下一节课？',
                    callback: (confirmed) => {
                        if (confirmed) {
                            categoryLessons.value[idx].status = 'completed'; 
                            categoryLessons.value[idx + 1].status = 'current'; 
                            openLesson(categoryLessons.value[idx + 1]);
                            emit('show-toast', '已进入下一课', 'success');
                        } else {
                            categoryLessons.value[idx].status = 'completed'; 
                            categoryLessons.value[idx + 1].status = 'current'; 
                            goBack();
                        }
                    }
                });
            } else { 
                emit('show-toast', '本章课程已全部完成！', 'success'); 
            } 
        };

        const downloadFile = (f) => {
            emit('show-modal', {
                type: 'confirm',
                title: '下载确认',
                message: `确定要下载文件 "${f.name}" (${f.size}) 吗？`,
                callback: (confirmed) => {
                    if (confirmed) { emit('show-toast', `开始下载 ${f.name}`, 'info'); }
                }
            });
        };

        onUnmounted(() => { clearInterval(playInterval); });

        return {
            internalView, activeTrack, searchQuery, recentVideos, filteredCategories, selectedCategory,
            categoryLessons, selectedLesson, currentCodeProblems, currentResources, allCodePassed,
            currentPage, pageSize, totalPages, paginatedCategories, changePage, selectCategory, openLesson, goBack, continueLearning,
            getLessonStatusClass, completeLesson, downloadFile,
            isPlaying, currentTime, totalDuration, progressPercent, formatTime, togglePlay, handleSeek,
            interactionActive, currentInteraction, currentQuestionIndex, currentQuestion, selectedOption, answerStatus,
            selectOption, handleInteractionBtn, getInteractionBtnText, getInteractionBtnIcon, getOptionClass, getOptionBadgeClass, currentLessonInteractions,
            videoPlayerRef, getCourseIcon, getCourseCoverStyle, switchTrack,
            // [NEW]
            isSplitMode, toggleSplitMode, scratchpadCode, syncToWorkspace,
            isFullScreen, toggleFullScreen
        };
    }
};

window.CloudClassroomFeature = CloudClassroomFeature;