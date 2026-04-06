// ==========================================
// 模块名称：编程工作台 (Feature Coding Workspace)
// 包含：Monaco Editor, 终端, 调试器, 判题系统
// [NEW] 新增：全局资源搜索功能 (Search Feature)
// ==========================================

// 1. Monaco Editor 子组件 (保持不变)
const MonacoEditor = {
    props: ['modelValue', 'language', 'readOnly', 'theme', 'fontSize', 'breakpoints', 'debugLine'],
    emits: ['update:modelValue', 'toggle-breakpoint'],
    template: `
        <div ref="editorContainer" class="size-full overflow-hidden"></div>
    `,
    setup(props, { emit }) {
        const { ref, onMounted, onUnmounted, watch } = Vue;
        const editorContainer = ref(null);
        let editorInstance = null;
        let decorationsCollection = null; 

        const updateDecorations = () => {
            if (!editorInstance) return;
            const newDecorations = [];
            if (props.breakpoints && props.breakpoints.length > 0) {
                props.breakpoints.forEach(line => {
                    newDecorations.push({
                        range: new monaco.Range(line, 1, line, 1),
                        options: {
                            isWholeLine: false,
                            glyphMarginClassName: 'fas fa-circle text-red-500 text-[10px] flex items-center justify-center pt-1',
                            glyphMarginHoverMessage: { value: 'Breakpoint' }
                        }
                    });
                });
            }
            if (props.debugLine && props.debugLine > 0) {
                newDecorations.push({
                    range: new monaco.Range(props.debugLine, 1, props.debugLine, 1),
                    options: {
                        isWholeLine: true,
                        className: 'bg-yellow-500/20',
                        glyphMarginClassName: 'fas fa-caret-right text-yellow-500 text-lg flex items-center justify-center',
                    }
                });
            }
            if (decorationsCollection) {
                decorationsCollection.clear();
                decorationsCollection.set(newDecorations);
            } else {
                decorationsCollection = editorInstance.createDecorationsCollection(newDecorations);
            }
        };

        onMounted(() => {
            setTimeout(() => {
                if (typeof require !== 'undefined' && editorContainer.value) {
                    require(['vs/editor/editor.main'], () => {
                        if (!editorContainer.value) return;
                        if (editorInstance) editorInstance.dispose();

                        editorInstance = monaco.editor.create(editorContainer.value, {
                            value: props.modelValue || '',
                            language: props.language || 'cpp',
                            theme: props.theme || 'vs-dark',
                            automaticLayout: true,
                            fontSize: props.fontSize || 14,
                            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            readOnly: props.readOnly || false,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            cursorStyle: 'line',
                            glyphMargin: true, 
                        });

                        decorationsCollection = editorInstance.createDecorationsCollection([]);

                        editorInstance.onDidChangeModelContent(() => {
                            emit('update:modelValue', editorInstance.getValue());
                        });

                        editorInstance.onMouseDown((e) => {
                            if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
                                const lineNumber = e.target.position.lineNumber;
                                emit('toggle-breakpoint', lineNumber);
                            }
                        });

                        updateDecorations();
                    });
                }
            }, 100);
        });

        watch(() => props.modelValue, (newValue) => {
            if (editorInstance && newValue !== editorInstance.getValue()) {
                editorInstance.setValue(newValue);
            }
        });
        watch(() => props.theme, (newTheme) => {
            if (monaco && monaco.editor) monaco.editor.setTheme(newTheme);
        });
        watch(() => props.fontSize, (newSize) => {
            if (editorInstance) editorInstance.updateOptions({ fontSize: newSize });
        });
        watch(() => props.readOnly, (val) => {
             if (editorInstance) editorInstance.updateOptions({ readOnly: val });
        });
        
        watch(() => [props.breakpoints, props.debugLine], () => {
            updateDecorations();
            if (props.debugLine > 0 && editorInstance) {
                editorInstance.revealLineInCenter(props.debugLine);
            }
        }, { deep: true });

        onUnmounted(() => {
            if (editorInstance) editorInstance.dispose();
        });

        return { editorContainer };
    }
};

// 2. 编程工作台主组件
const CodingWorkspaceFeature = {
    components: { 'monaco-editor': MonacoEditor },
    props: ['tabs', 'activeIndex', 'user', 'restrictedMode'], 
    emits: ['update:activeIndex', 'close-tab', 'minimize', 'save', 'toast', 'open-search-result'], 
    
    // [MODIFIED] z-index increased from 100 to 600 to be above Cloud Classroom Fullscreen (500)
    template: `
    <div class="fixed inset-0 bg-[#0f172a] z-[600] flex flex-col" @mouseup="stopResize" @mousemove="doResize">
        <!-- Top Bar -->
        <div class="h-12 border-b border-slate-700 bg-[#1e293b] flex items-center justify-between pl-2 pr-4 shadow-sm flex-shrink-0 select-none">
            <!-- Left: Window Controls -->
            <div class="flex items-center gap-2 mr-4">
                <button @click="$emit('minimize')" class="size-8 rounded hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition" :title="t('minimize')">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <div class="w-px h-4 bg-slate-600"></div>
            </div>

            <!-- Center: Tabs Scroll Container -->
            <div class="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1 h-full select-none">
                <div v-for="(tab, index) in tabs" :key="tab.id"
                     @click="$emit('update:activeIndex', index)"
                     class="h-9 px-3 rounded-t-lg flex items-center gap-2 cursor-pointer transition-all min-w-[120px] max-w-[200px] border-t border-x relative group"
                     :class="index === activeIndex ? 'bg-[#1e1e1e] border-[#333] text-indigo-400' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'">
                    
                    <i class="fa-solid fa-code text-[10px]"></i>
                    <span class="text-xs font-bold truncate flex-1">{{ tab.title }}</span>
                    
                    <button @click.stop="$emit('close-tab', index)" class="size-4 rounded-full hover:bg-slate-600 text-transparent group-hover:text-slate-400 flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark text-[10px]"></i>
                    </button>

                    <div v-if="index === activeIndex" class="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500"></div>
                </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center gap-3 ml-4 relative">
                
                <!-- [NEW] 搜索按钮入口 -->
                <button @click="openSearchModal" class="px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded text-xs transition-all flex items-center gap-2 group" :title="restrictedMode ? '考试模式下不可用' : '搜索资源 (Ctrl+P)'">
                    <i class="fa-solid fa-magnifying-glass text-lg group-hover:scale-110 transition-transform"></i>
                    <span v-if="restrictedMode" class="text-[10px] text-red-400 font-bold bg-red-900/30 px-1 rounded">禁用</span>
                </button>

                <!-- 设置按钮 -->
                <div class="relative">
                    <button @click="toggleSettings" class="px-2 py-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded text-xs transition-all" :title="t('settings')">
                        <i class="fa-solid fa-gear text-lg"></i>
                    </button>
                    <!-- Settings Panel -->
                    <transition name="fade">
                        <div v-if="showSettingsPanel" class="absolute top-full right-0 mt-3 w-64 bg-[#252526] border border-[#454545] rounded-xl shadow-2xl p-4 z-[200]">
                            <h4 class="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-700 pb-2">{{ t('editorSettings') }}</h4>
                            
                            <!-- Language Toggle -->
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-sm text-slate-200"><i class="fa-solid fa-language mr-2 text-indigo-400"></i>{{ t('language') }}</span>
                                <div class="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                    <button @click="setLang('zh-CN')" class="px-2 py-1 rounded text-[10px] font-bold transition-all w-10" :class="editorConfig.lang === 'zh-CN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'">中</button>
                                    <button @click="setLang('en-US')" class="px-2 py-1 rounded text-[10px] font-bold transition-all w-10" :class="editorConfig.lang === 'en-US' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'">EN</button>
                                </div>
                            </div>

                            <!-- Theme Toggle -->
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-sm text-slate-200"><i class="fa-solid fa-palette mr-2 text-indigo-400"></i>{{ t('theme') }}</span>
                                <div class="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                    <button @click="setTheme('vs')" class="px-3 py-1 rounded text-xs font-bold transition-all" :class="editorConfig.theme === 'vs' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-300'"><i class="fa-regular fa-sun"></i></button>
                                    <button @click="setTheme('vs-dark')" class="px-3 py-1 rounded text-xs font-bold transition-all" :class="editorConfig.theme === 'vs-dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'"><i class="fa-solid fa-moon"></i></button>
                                </div>
                            </div>

                            <!-- Font Size -->
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-slate-200"><i class="fa-solid fa-text-height mr-2 text-indigo-400"></i>{{ t('fontSize') }}</span>
                                <div class="flex items-center gap-2">
                                    <button @click="adjustFontSize(-1)" class="size-6 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center text-xs"><i class="fa-solid fa-minus"></i></button>
                                    <span class="text-sm font-mono font-bold text-white w-6 text-center">{{ editorConfig.fontSize }}</span>
                                    <button @click="adjustFontSize(1)" class="size-6 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center text-xs"><i class="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>

                <div class="w-px h-4 bg-slate-600 mx-1"></div>

                <button @click="handleSave" class="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-600 rounded text-xs font-bold flex items-center gap-1 transition-all" :title="t('saveCode')">
                    <i class="fa-solid fa-floppy-disk"></i> {{ t('save') }}
                </button>
                
                <div class="w-px h-4 bg-slate-600 mx-1"></div>
                
                <button @click="startDebugSession" :disabled="isDebugMode" class="px-3 py-1.5 text-orange-300 hover:text-white hover:bg-orange-600 rounded text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50">
                    <i class="fa-solid fa-bug"></i> {{ t('debug') }}
                </button>

                <button @click="openRunModal" class="px-3 py-1.5 text-indigo-300 hover:text-white hover:bg-indigo-600 rounded text-xs font-bold flex items-center gap-1 transition-all">
                    <i class="fa-solid fa-play"></i> {{ t('run') }}
                </button>
                
                <button @click="startJudgeProcedure" :disabled="judgeStatus === 'judging' || judgeStatus === 'compiling' || isDebugMode" 
                        class="px-3 py-1.5 text-green-300 hover:text-white hover:bg-green-600 rounded text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fa-solid fa-check-double" :class="{'fa-bounce': judgeStatus === 'judging'}"></i> {{ t('submit') }}
                </button>
            </div>
        </div>

        <!-- Main Layout -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Left: Problem Desc -->
            <div class="w-[30%] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                <div class="flex-1 overflow-y-auto p-6">
                    <div class="flex items-start gap-3 mb-4">
                        <button @click="showDetailModal = true" class="mt-1 size-8 shrink-0 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-105 flex items-center justify-center transition shadow-sm border border-indigo-100 group" :title="t('viewDetail')">
                            <i class="fa-solid fa-book group-hover:animate-pulse"></i>
                        </button>
                        <h1 class="text-2xl font-bold text-slate-800 leading-tight">{{ currentProblem.title }}</h1>
                    </div>
                    <div class="flex gap-2 mb-6">
                        <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold">{{ t('easy') }}</span>
                        <span class="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded font-bold">C++</span>
                        <span class="bg-yellow-50 text-yellow-600 text-xs px-2 py-0.5 rounded font-bold border border-yellow-100">ID: {{ currentProblem.id }}</span>
                    </div>
                    <div class="prose prose-sm max-w-none text-slate-600" v-html="renderMarkdown(currentProblem.description)"></div>
                    <!-- 样例 1 -->
                    <div class="mt-8 pt-6 border-t border-slate-100">
                        <h4 class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-code text-indigo-500"></i> {{ t('sampleInput') }} 1
                        </h4>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 relative group">
                            <pre class="font-mono text-sm text-slate-700 bg-transparent p-0 m-0 whitespace-pre-wrap">{{ currentProblem.sampleInput || '无' }}</pre>
                            <button @click="copyToClipboard(currentProblem.sampleInput)" class="absolute top-2 right-2 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"><i class="fa-regular fa-copy"></i></button>
                        </div>

                        <h4 class="font-bold text-slate-800 text-sm mt-4 mb-3 flex items-center gap-2">
                            <i class="fa-solid fa-terminal text-indigo-500"></i> {{ t('sampleOutput') }} 1
                        </h4>
                        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <pre class="font-mono text-sm text-slate-700 bg-transparent p-0 m-0 whitespace-pre-wrap">{{ currentProblem.sampleOutput || '无' }}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Editor & Bottom Panel -->
            <div class="flex-1 flex flex-col overflow-hidden transition-colors duration-300 relative"
                 :class="editorConfig.theme === 'vs-dark' ? 'bg-[#1e1e1e]' : 'bg-white'">
                
                <!-- Editor Area (Flex 1, will shrink as bottom panel grows) -->
                <div class="flex-1 relative overflow-hidden">
                    <monaco-editor 
                        v-model="currentProblem.code" 
                        language="cpp"
                        :theme="editorConfig.theme"
                        :font-size="editorConfig.fontSize"
                        :breakpoints="breakpoints"
                        :debug-line="currentDebugLine"
                        :read-only="isDebugMode"
                        @toggle-breakpoint="toggleBreakpoint"
                    ></monaco-editor>
                </div>

                <!-- Resize Handle -->
                <div class="absolute w-full h-1.5 cursor-row-resize z-50 hover:bg-indigo-500/50 transition-colors"
                     :style="{ bottom: bottomPanelHeight + 'px' }"
                     @mousedown="startResize">
                </div>

                <!-- Bottom Panel (Resizable) -->
                <div class="flex flex-col flex-shrink-0 transition-all duration-75 relative" 
                     :style="{ height: bottomPanelHeight + 'px' }"
                     :class="[
                        editorConfig.theme === 'vs-dark' ? 'border-t border-[#333] bg-[#1e1e1e]' : 'border-t border-slate-200 bg-white'
                     ]">
                    
                    <!-- Tabs Header -->
                    <div class="flex items-center justify-between px-4 py-1 border-b select-none transition-colors"
                         :class="editorConfig.theme === 'vs-dark' ? 'bg-[#252526] border-[#333]' : 'bg-slate-50 border-slate-200'">
                        <div class="flex gap-1">
                            
                            <button @click="activeBottomTab = 'debug'" v-if="isDebugMode || breakpoints.length > 0"
                                    class="text-xs px-3 py-1 rounded-t border-b-2 transition-colors flex items-center gap-2 animate-fade-in"
                                    :class="activeBottomTab === 'debug' 
                                        ? (editorConfig.theme === 'vs-dark' ? 'border-orange-500 text-slate-200 bg-[#1e1e1e]' : 'border-orange-500 text-orange-700 bg-white') 
                                        : 'border-transparent text-slate-500 hover:text-slate-400'">
                                <i class="fa-solid fa-bug"></i> {{ t('debugConsole') }}
                            </button>
                            <button @click="activeBottomTab = 'judge'"
                                    class="text-xs px-3 py-1 rounded-t border-b-2 transition-colors flex items-center gap-2"
                                    :class="activeBottomTab === 'judge' 
                                        ? (editorConfig.theme === 'vs-dark' ? 'border-indigo-500 text-slate-200 bg-[#1e1e1e]' : 'border-indigo-500 text-indigo-700 bg-white') 
                                        : 'border-transparent text-slate-500 hover:text-slate-400'">
                                <i class="fa-solid fa-gavel"></i> {{ t('judgeDashboard') }}
                                <span v-if="judgeStatus === 'judging'" class="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            </button>
                        </div>
                    </div>

                    <!-- View 2: Debug Console (Enhanced with Editable Variables) -->
                    <div v-show="activeBottomTab === 'debug'" class="flex-1 flex overflow-hidden" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#1e1e1e]' : 'bg-white'">
                        <!-- Debug Controls -->
                        <div class="w-48 border-r flex flex-col p-2 gap-2" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] bg-[#252526]/50' : 'border-slate-200 bg-slate-50'">
                            <div class="text-[10px] font-bold uppercase text-slate-500 mb-1">{{ t('controls') }}</div>
                            <button @click="continueDebug" :disabled="!isDebugMode" class="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" :class="editorConfig.theme === 'vs-dark' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'">
                                <i class="fa-solid fa-play"></i> {{ t('continue') }}
                            </button>
                            <button @click="stepOverDebug" :disabled="!isDebugMode" class="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#333] hover:bg-[#444] text-slate-200' : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'">
                                <i class="fa-solid fa-arrow-right-to-bracket rotate-90"></i> {{ t('stepOver') }}
                            </button>
                            <button @click="stopDebugSession" :disabled="!isDebugMode" class="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" :class="editorConfig.theme === 'vs-dark' ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'">
                                <i class="fa-solid fa-stop"></i> {{ t('stop') }}
                            </button>
                        </div>
                        
                        <!-- Variable Watch (Editable) -->
                        <div class="flex-1 flex flex-col">
                            <div class="px-4 py-2 border-b text-xs font-bold flex justify-between items-center" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] bg-[#1e1e1e] text-slate-300' : 'border-slate-200 bg-white text-slate-700'">
                                <span><i class="fa-solid fa-glasses mr-2 text-orange-500"></i>{{ t('variablesWatch') }}</span>
                                <span class="text-[10px] opacity-60 font-normal">{{ t('doubleClickEdit') }}</span>
                            </div>
                            <div class="flex-1 overflow-y-auto p-0">
                                <table class="w-full text-left border-collapse">
                                    <thead :class="editorConfig.theme === 'vs-dark' ? 'bg-[#252526] text-slate-400' : 'bg-slate-50 text-slate-500'">
                                        <tr class="text-[10px] uppercase">
                                            <th class="px-4 py-2 font-medium w-1/3">{{ t('varName') }}</th>
                                            <th class="px-4 py-2 font-medium w-1/3">{{ t('varValue') }}</th>
                                            <th class="px-4 py-2 font-medium w-1/3">{{ t('varType') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-xs font-mono">
                                        <tr v-if="debugVariables.length === 0" :class="editorConfig.theme === 'vs-dark' ? 'text-slate-500' : 'text-slate-400'">
                                            <td colspan="3" class="px-4 py-8 text-center italic">{{ t('noVariables') }}</td>
                                        </tr>
                                        <tr v-for="v in debugVariables" :key="v.name" class="border-b" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] text-slate-300 hover:bg-[#2a2d3e]' : 'border-slate-100 text-slate-700 hover:bg-slate-50'">
                                            <td class="px-4 py-2 text-indigo-400 font-bold">{{ v.name }}</td>
                                            
                                            <!-- Editable Cell -->
                                            <td class="px-4 py-2 group cursor-pointer relative" @dblclick="editVariable(v)">
                                                <div v-if="!v.isEditing" class="flex items-center gap-2">
                                                    <span class="text-green-500">{{ v.value }}</span>
                                                    <i class="fa-solid fa-pen text-[10px] opacity-0 group-hover:opacity-50 text-slate-500"></i>
                                                </div>
                                                <input v-else type="text" v-model="v.editValue" 
                                                       @blur="cancelEditVariable(v)" @keydown.enter="saveVariable(v)" @keydown.esc="cancelEditVariable(v)"
                                                       class="w-full bg-transparent border-b border-indigo-500 outline-none text-green-500 font-bold" 
                                                       autofocus>
                                            </td>

                                            <td class="px-4 py-2 opacity-60">{{ v.type }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                         <!-- Debug Terminal Output -->
                         <div class="w-1/3 border-l flex flex-col" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] bg-[#0f111a]' : 'border-slate-200 bg-slate-50'">
                             <div class="px-3 py-2 text-[10px] font-bold uppercase border-b" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] text-slate-500' : 'border-slate-200 text-slate-400'">{{ t('debugOutput') }}</div>
                             <div class="flex-1 p-2 font-mono text-xs overflow-y-auto" :class="editorConfig.theme === 'vs-dark' ? 'text-slate-300' : 'text-slate-700'">
                                <div v-for="(log, i) in debugConsoleLogs" :key="i">{{ log }}</div>
                                <div v-if="debugConsoleLogs.length===0" class="text-slate-500 italic opacity-50">{{ t('outputPlaceholder') }}</div>
                             </div>
                         </div>
                    </div>

                    <!-- View 3: Judge Dashboard (Keep existing logic) -->
                    <div v-show="activeBottomTab === 'judge'" class="flex-1 flex overflow-hidden" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#1e1e1e]' : 'bg-white'">
                         <!-- Left: Overall Status -->
                        <div class="w-56 border-r p-4 flex flex-col items-center justify-center"
                             :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] bg-[#252526]/50' : 'border-slate-200 bg-slate-50'">
                            <div v-if="judgeStatus === 'idle'" class="text-center opacity-50"><i class="fa-solid fa-code text-4xl mb-2 text-slate-500"></i><p class="text-xs text-slate-400">{{ t('readyToJudge') }}</p></div>
                            <div v-else-if="judgeStatus === 'compiling'" class="text-center"><i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2 text-yellow-500"></i><p class="text-sm font-bold" :class="editorConfig.theme==='vs-dark'?'text-slate-200':'text-slate-700'">{{ t('compiling') }}...</p></div>
                            <div v-else-if="judgeStatus === 'judging'" class="text-center">
                                <div class="relative size-12 mx-auto mb-2"><svg class="animate-spin size-full text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
                                <p class="text-sm font-bold" :class="editorConfig.theme==='vs-dark'?'text-slate-200':'text-slate-700'">{{ t('runningTests') }}...</p>
                                <p class="text-xs text-slate-400 mt-1">{{ judgeProgress.current }} / {{ judgeProgress.total }}</p>
                            </div>
                            <div v-else-if="judgeStatus === 'finished'" class="text-center animate-bounce-in">
                                <div class="size-16 rounded-full flex items-center justify-center text-3xl mb-2 mx-auto shadow-lg" :class="judgeFinalResult.status === 'AC' ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-red-500 text-white shadow-red-500/30'">
                                    <i v-if="judgeFinalResult.status === 'AC'" class="fa-solid fa-check"></i><i v-else class="fa-solid fa-xmark"></i>
                                </div>
                                <h3 class="text-lg font-bold" :class="judgeFinalResult.status === 'AC' ? 'text-green-500' : 'text-red-500'">{{ judgeFinalResult.status === 'AC' ? 'Accepted' : (judgeFinalResult.status === 'TLE' ? 'Time Limit Exceeded' : 'Wrong Answer') }}</h3>
                                <p class="text-xs text-slate-400 mt-1">Score: {{ judgeFinalResult.score }}</p>
                            </div>
                        </div>
                        <div class="flex-1 flex flex-col border-r overflow-hidden" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333]' : 'border-slate-200'">
                            <div class="p-4 flex-1 overflow-y-auto">
                                <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between"><span>{{ t('testCases') }}</span><span class="text-[10px] px-1.5 py-0.5 rounded" :class="editorConfig.theme === 'vs-dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'" v-if="judgeCaseResults.length > 0">{{ judgeCaseResults.filter(c => c.status === 'AC').length }}/{{ judgeCaseResults.length }} {{ t('passed') }}</span></h4>
                                <div class="flex flex-wrap gap-3">
                                    <div v-for="(res, idx) in judgeCaseResults" :key="idx" @click="selectedTestCase = res" class="judge-node size-10 rounded flex items-center justify-center cursor-pointer relative group transition-colors" :class="[editorConfig.theme === 'vs-dark' ? 'bg-[#252526]' : 'bg-slate-100 border border-slate-200', res.status === 'running' ? 'running border-indigo-500' : '', res.status === 'AC' ? 'passed' : (res.status === 'WA' || res.status === 'TLE' ? 'failed' : ''), selectedTestCase?.id === res.id ? (editorConfig.theme === 'vs-dark' ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1e1e1e]' : 'ring-2 ring-indigo-500 ring-offset-1') : '']">
                                        <span class="text-xs font-bold" :class="res.status === 'pending' ? 'text-slate-400' : (editorConfig.theme === 'vs-dark' ? 'text-slate-200' : 'text-slate-700')">{{ idx + 1 }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="w-[40%] flex flex-col overflow-hidden" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#0f111a]' : 'bg-slate-50'">
                            <div v-if="!selectedTestCase" class="flex-1 flex flex-col items-center justify-center text-slate-500"><i class="fa-regular fa-hand-pointer text-2xl mb-2"></i><p class="text-xs">{{ t('clickTestCase') }}</p></div>
                            <div v-else class="flex-1 flex flex-col">
                                <div class="px-4 py-2 border-b flex justify-between items-center" :class="editorConfig.theme === 'vs-dark' ? 'border-[#333] bg-[#1e1e1e]' : 'border-slate-200 bg-white'">
                                    <span class="text-xs font-bold" :class="editorConfig.theme === 'vs-dark' ? 'text-slate-300' : 'text-slate-700'">Test Case #{{ selectedTestCase.id }} Details</span>
                                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded" :class="selectedTestCase.status === 'AC' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'">{{ selectedTestCase.status }} | {{ selectedTestCase.time }}ms</span>
                                </div>
                                <div class="flex-1 overflow-y-auto p-4 space-y-4 diff-container" :class="editorConfig.theme === 'vs-dark' ? 'dark-scroll' : ''">
                                    <div v-if="!selectedTestCase.isPublic"><div class="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded flex items-center gap-3"><i class="fa-solid fa-lock text-yellow-500"></i><span class="text-xs text-yellow-600/80">{{ t('hiddenTestCase') }}</span></div></div>
                                    <div v-else><div class="mb-3"><span class="text-[10px] text-slate-500 block mb-1">STDIN (Input)</span><div class="p-2 rounded text-xs whitespace-pre-wrap font-mono" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#252526] text-slate-300' : 'bg-white border border-slate-200 text-slate-700'">{{ selectedTestCase.input }}</div></div><div class="grid grid-cols-2 gap-2"><div><span class="text-[10px] text-slate-500 block mb-1">Your Output</span><div class="rounded overflow-hidden" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#252526]' : 'bg-white border border-slate-200'"><div class="p-2 whitespace-pre-wrap font-mono text-xs" :class="selectedTestCase.status !== 'AC' ? 'diff-line-actual' : (editorConfig.theme === 'vs-dark' ? 'text-slate-300' : 'text-slate-700')">{{ selectedTestCase.output || '(No Output)' }}</div></div></div><div><span class="text-[10px] text-slate-500 block mb-1">Expected Output</span><div class="rounded overflow-hidden" :class="editorConfig.theme === 'vs-dark' ? 'bg-[#252526]' : 'bg-white border border-slate-200'"><div class="p-2 whitespace-pre-wrap font-mono text-xs" :class="selectedTestCase.status !== 'AC' ? 'diff-line-expect' : (editorConfig.theme === 'vs-dark' ? 'text-slate-300' : 'text-slate-700')">{{ selectedTestCase.expected }}</div></div></div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- [NEW] Search Modal (沉浸式搜索面板) -->
        <transition name="fade">
            <div v-if="showSearchPanel" class="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]" @click.self="closeSearch">
                <div class="w-full max-w-2xl bg-[#252526] rounded-xl shadow-2xl overflow-hidden border border-slate-700 animate-fade-in-up flex flex-col max-h-[60vh]">
                    <!-- Input Area -->
                    <div class="flex items-center gap-3 p-4 border-b border-slate-700 bg-[#2d2d2e]">
                        <i class="fa-solid fa-magnifying-glass text-slate-400 text-lg"></i>
                        <input ref="searchInputRef" type="text" v-model="searchQuery" 
                               class="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-slate-500" 
                               placeholder="搜索 C++ 笔记、作业、课堂项目... (支持模糊搜索)"
                               @keydown.esc="closeSearch"
                               @keydown.down.prevent="navigateSearch('next')"
                               @keydown.up.prevent="navigateSearch('prev')"
                               @keydown.enter="openSelectedResult">
                        <button @click="closeSearch" class="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600">ESC</button>
                    </div>
                    
                    <!-- Results List -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <div v-if="filteredResults.length === 0" class="text-center py-8 text-slate-500">
                             <i class="fa-regular fa-folder-open text-3xl mb-2 opacity-50"></i>
                             <p class="text-sm">没有找到相关内容</p>
                        </div>
                        <div v-else class="space-y-1">
                             <div v-for="(item, index) in filteredResults" :key="item.id"
                                  @click="handleSearchResultClick(item)"
                                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group"
                                  :class="index === activeSearchIndex ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-300'">
                                  
                                  <!-- Icon based on type -->
                                  <div class="size-8 rounded-md flex items-center justify-center bg-black/20 shrink-0">
                                      <i v-if="item.type === 'note'" class="fa-solid fa-book-open text-blue-400"></i>
                                      <i v-else-if="item.type === 'homework'" class="fa-solid fa-pen-to-square text-green-400"></i>
                                      <i v-else-if="item.type === 'class'" class="fa-solid fa-chalkboard-user text-orange-400"></i>
                                      <i v-else class="fa-solid fa-code text-slate-400"></i>
                                  </div>
                                  
                                  <div class="flex-1 min-w-0">
                                      <div class="font-bold text-sm truncate">{{ item.title }}</div>
                                      <div class="text-xs opacity-60 truncate">{{ item.desc || item.code.substring(0, 40) + '...' }}</div>
                                  </div>
                                  
                                  <div class="text-[10px] font-mono opacity-50 border border-current px-1.5 py-0.5 rounded uppercase">
                                      {{ item.type }}
                                  </div>
                             </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="bg-[#1e1e1e] p-2 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-500 px-4">
                        <span>共找到 {{ filteredResults.length }} 个结果</span>
                        <span v-if="restrictedMode" class="text-red-500"><i class="fa-solid fa-lock mr-1"></i>考试模式已锁定</span>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Run Modal (Internal) -->
        <transition name="fade">
            <div v-if="showRunModal" class="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center">
                <div class="bg-[#1e1e1e] w-[90vw] h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
                    <div class="h-10 bg-[#252526] border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0 select-none">
                        <div class="flex items-center gap-2 text-slate-300"><i class="fa-solid fa-terminal text-indigo-400 text-xs"></i><span class="font-bold text-xs">Terminal - {{ currentProblem.title }}</span></div>
                        <button @click="showRunModal = false" class="text-slate-400 hover:text-white transition"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="flex-1 flex overflow-hidden">
                        <div class="w-1/3 bg-[#1e1e1e] border-r border-slate-700 flex flex-col">
                            <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ t('testCaseRef') }}</h3>
                                <div class="space-y-4">
                                    <div><div class="flex justify-between items-center mb-1"><span class="text-slate-400 text-xs">{{ t('sampleInput') }}</span><button v-if="activeTerminalTab === 'terminal'" @click="customInput = currentProblem.sampleInput" class="text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20"><i class="fa-solid fa-arrow-right-to-bracket mr-1"></i>{{ t('fillIn') }}</button></div><div class="bg-[#252526] p-2 rounded border border-slate-700 font-mono text-xs text-slate-300 whitespace-pre-wrap">{{ currentProblem.sampleInput || '(Empty)' }}</div></div>
                                    <div><span class="text-slate-400 text-xs mb-1 block">{{ t('sampleOutput') }}</span><div class="bg-[#252526] p-2 rounded border border-slate-700 font-mono text-xs text-slate-300 whitespace-pre-wrap">{{ currentProblem.sampleOutput || '(Empty)' }}</div></div>
                                </div>
                                <div class="p-4 border-t border-slate-800 bg-[#252526] mt-auto">
                                    <button @click="executeCustomRun" :disabled="isRunningCustom" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"><i class="fa-solid fa-play" v-if="!isRunningCustom"></i><i class="fa-solid fa-circle-notch fa-spin" v-else></i> Run Code</button>
                                </div>
                            </div>
                        </div>
                        <div class="w-2/3 flex flex-col bg-[#1e1e1e]">
                            <div class="flex text-xs font-bold border-b border-slate-700 bg-[#1e1e1e] select-none">
                                <div @click="activeTerminalTab = 'terminal'" class="px-4 py-2 cursor-pointer transition-colors border-b-2" :class="activeTerminalTab === 'terminal' ? 'border-indigo-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'">TERMINAL</div>
                                <div @click="activeTerminalTab = 'debug'" class="px-4 py-2 cursor-pointer transition-colors border-b-2" :class="activeTerminalTab === 'debug' ? 'border-indigo-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'">DEBUG CONSOLE</div>
                            </div>
                            <div class="flex-1 relative font-mono text-sm overflow-hidden flex flex-col">
                                <template v-if="activeTerminalTab === 'terminal'">
                                    <div class="flex-1 flex flex-col p-2 bg-[#1e1e1e]"><div class="text-slate-500 text-[10px] mb-1 px-1">STDIN (在此输入测试数据)</div><textarea v-model="customInput" class="flex-1 w-full bg-[#1e1e1e] text-slate-300 p-2 outline-none resize-none run-input-area border border-slate-700 rounded focus:border-indigo-500 transition-colors" spellcheck="false" placeholder="输入数据..."></textarea></div>
                                    <div class="h-1/2 border-t border-slate-700 bg-[#0f111a] p-3 overflow-y-auto"><div class="text-slate-500 text-[10px] mb-2">STDOUT (运行结果)</div><div class="text-green-400 font-bold text-xs mb-1">student@lab:~/cpp_project$ ./main</div><div class="text-slate-300 whitespace-pre-wrap leading-relaxed">{{ customOutput }}<span class="blink-cursor" v-if="!isRunningCustom"></span></div></div>
                                </template>
                                <template v-else>
                                    <div class="flex-1 bg-[#0f111a] p-4 overflow-y-auto flex flex-col gap-1" ref="debugConsoleRef">
                                        <div class="text-slate-500 text-xs italic mb-2">Interactive Debug Session Started...</div>
                                        <div v-for="(log, idx) in debugLogs" :key="idx" :class="log.type === 'input' ? 'text-white' : 'text-slate-300'"><span v-if="log.type === 'input'" class="text-indigo-400 mr-2">➜</span><span v-else class="text-slate-500 mr-2"><<</span>{{ log.text }}</div>
                                        <div class="flex items-center mt-2" v-if="isRunningCustom"><span class="text-indigo-400 mr-2">➜</span><input type="text" v-model="debugInput" @keydown.enter="sendDebugInput" class="flex-1 bg-transparent outline-none text-white font-mono" placeholder="输入数据并回车..." autofocus></div>
                                        <div v-else class="text-slate-500 mt-2 text-xs">点击左侧 "Run Code" 开始调试会话</div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        
        <!-- Detail Modal (Refined for Focus Mode) -->
        <transition name="fade">
            <div v-if="showDetailModal" class="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8">
                <div class="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                    <!-- Header -->
                    <div class="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
                        <div>
                            <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                {{ currentProblem.title }}
                                <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-200">{{ t('readMode') }}</span>
                            </h2>
                        </div>
                        <button @click="showDetailModal = false" class="size-10 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition flex items-center justify-center">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <!-- Scrollable Content -->
                    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                        
                        <!-- 1. Description -->
                        <section>
                            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-align-left text-indigo-500"></i> {{ t('probDesc') }}
                            </h3>
                            <div class="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm leading-relaxed">
                                <div v-html="renderMarkdown(currentProblem.description)"></div>
                            </div>
                        </section>

                        <!-- 2. Data Constraints -->
                        <section>
                            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-database text-indigo-500"></i> {{ t('constraints') }}
                            </h3>
                            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-6 relative overflow-hidden shadow-sm">
                                <div class="relative z-10">
                                    <ul class="text-sm text-yellow-800 space-y-2 font-mono">
                                        <template v-if="currentProblem.dataConstraints">
                                            <li v-html="currentProblem.dataConstraints"></li>
                                        </template>
                                        <template v-else>
                                            <li class="flex items-center gap-2"><i class="fa-regular fa-clock"></i> Time Limit: 1000ms</li>
                                            <li class="flex items-center gap-2"><i class="fa-solid fa-memory"></i> Memory Limit: 256MB</li>
                                            <li>• 1 ≤ N ≤ 1000</li>
                                            <li>• -1000 ≤ a_i ≤ 1000</li>
                                        </template>
                                    </ul>
                                </div>
                                <i class="fa-solid fa-triangle-exclamation absolute right-4 bottom-4 text-6xl text-yellow-500/10 rotate-12"></i>
                            </div>
                        </section>

                        <!-- 3. Input Format -->
                        <section>
                            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-file-import text-indigo-500"></i> {{ t('inputFormat') }}
                            </h3>
                            <div class="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600 shadow-sm">
                                {{ currentProblem.inputFormat || '参照题目描述中关于输入的详细说明。通常第一行包含一个整数 N，接下来一行包含 N 个整数。' }}
                            </div>
                        </section>

                        <!-- 4. Output Format -->
                        <section>
                            <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-file-export text-indigo-500"></i> {{ t('outputFormat') }}
                            </h3>
                            <div class="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600 shadow-sm">
                                {{ currentProblem.outputFormat || '参照题目描述中关于输出的详细说明。请输出计算结果，末尾需要换行。' }}
                            </div>
                        </section>

                        <!-- 5 & 6. Samples -->
                        <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Sample Input -->
                            <div class="sample-box">
                                <h4 class="font-bold text-slate-700 text-sm mb-2 flex items-center justify-between">
                                    <span><i class="fa-solid fa-keyboard mr-2 text-indigo-400"></i>{{ t('sampleInput') }}</span>
                                    <button class="text-xs px-2 py-1 rounded border bg-white hover:bg-slate-50 transition text-slate-500 hover:text-indigo-600" @click="copyToClipboard(currentProblem.sampleInput)">
                                        <i class="fa-regular fa-copy mr-1"></i>{{ t('copy') }}
                                    </button>
                                </h4>
                                <div class="bg-slate-800 text-slate-300 rounded-lg p-4 font-mono text-sm min-h-[120px] whitespace-pre-wrap shadow-inner border border-slate-700">{{ currentProblem.sampleInput || '无' }}</div>
                            </div>
                            <!-- Sample Output -->
                            <div class="sample-box">
                                <h4 class="font-bold text-slate-700 text-sm mb-2 flex items-center justify-between">
                                    <span><i class="fa-solid fa-terminal mr-2 text-indigo-400"></i>{{ t('sampleOutput') }}</span>
                                    <button class="text-xs px-2 py-1 rounded border bg-white hover:bg-slate-50 transition text-slate-500 hover:text-indigo-600" @click="copyToClipboard(currentProblem.sampleOutput)">
                                        <i class="fa-regular fa-copy mr-1"></i>{{ t('copy') }}
                                    </button>
                                </h4>
                                <div class="bg-slate-800 text-slate-300 rounded-lg p-4 font-mono text-sm min-h-[120px] whitespace-pre-wrap shadow-inner border border-slate-700">{{ currentProblem.sampleOutput || '无' }}</div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </transition>
    </div>
    `,
    
    setup(props, { emit }) {
        const { ref, computed, nextTick, watch } = Vue; 

        // UI State
        const activeBottomTab = ref('judge'); 
        const showRunModal = ref(false);
        const showDetailModal = ref(false);
        const activeTerminalTab = ref('terminal');
        
        // Resize State
        const bottomPanelHeight = ref(300);
        const isResizing = ref(false);

        // Settings State
        const showSettingsPanel = ref(false);
        const loadSettings = () => {
            const saved = localStorage.getItem('ide_settings');
            if (saved) { try { return JSON.parse(saved); } catch (e) { console.error(e); } }
            return { theme: 'vs-dark', fontSize: 14, lang: 'zh-CN' }; 
        };
        const editorConfig = ref(loadSettings());
        watch(editorConfig, (newVal) => { localStorage.setItem('ide_settings', JSON.stringify(newVal)); }, { deep: true });

        // [NEW] Search & Navigation State
        const showSearchPanel = ref(false);
        const searchQuery = ref('');
        const searchInputRef = ref(null);
        const activeSearchIndex = ref(0);

        // [NEW] Mock Search Data (模拟数据源)
        const searchableResources = [
            { id: 'note-001', title: 'C++ 基础语法复习', type: 'note', desc: '包含变量、数据类型、运算符的详细笔记', code: '// C++ 基础语法复习\n#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 10;\n    cout << "Hello World " << a << endl;\n    return 0;\n}' },
            { id: 'note-002', title: 'STL 容器详解 - Vector', type: 'note', desc: 'Vector 的常用操作与示例', code: '// Vector 使用示例\n#include <vector>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    vector<int> v = {1, 2, 3};\n    v.push_back(4);\n    for(int x : v) cout << x << " ";\n    return 0;\n}' },
            { id: 'hw-101', title: '作业：循环结构练习题', type: 'homework', desc: '打印九九乘法表', code: '// 打印九九乘法表\n#include <iostream>\nusing namespace std;\n\nint main() {\n    for(int i=1; i<=9; i++) {\n        for(int j=1; j<=i; j++) {\n            cout << j << "*" << i << "=" << i*j << "\\t";\n        }\n        cout << endl;\n    }\n    return 0;\n}' },
            { id: 'cls-05', title: '课堂演示：二分查找', type: 'class', desc: '第五节课二分查找算法实现', code: '// 二分查找实现\n#include <iostream>\nusing namespace std;\n\nint binarySearch(int arr[], int l, int r, int x) {\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (arr[m] == x) return m;\n        if (arr[m] < x) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}\n\nint main() {\n    int arr[] = {2, 3, 4, 10, 40};\n    int n = sizeof(arr) / sizeof(arr[0]);\n    int x = 10;\n    int result = binarySearch(arr, 0, n - 1, x);\n    cout << (result == -1 ? "Element not found" : "Element found at index " + to_string(result));\n    return 0;\n}' },
            { id: 'note-003', title: '递归算法入门', type: 'note', desc: '斐波那契数列与阶乘', code: '// 递归求阶乘\n#include <iostream>\nusing namespace std;\n\nint factorial(int n) {\n    if(n <= 1) return 1;\n    return n * factorial(n-1);\n}\n\nint main() {\n    cout << factorial(5) << endl;\n    return 0;\n}' }
        ];

        // [NEW] Search Logic
        const filteredResults = computed(() => {
            if (!searchQuery.value) return searchableResources;
            const query = searchQuery.value.toLowerCase();
            return searchableResources.filter(item => 
                item.title.toLowerCase().includes(query) || 
                item.desc.toLowerCase().includes(query) ||
                item.type.toLowerCase().includes(query)
            );
        });

        // [NEW] Search Methods
        const openSearchModal = () => {
            if (props.restrictedMode) {
                emit('toast', '⚠️ 考试/竞赛模式下禁止使用搜索功能！', 'error');
                return;
            }
            showSearchPanel.value = true;
            searchQuery.value = '';
            activeSearchIndex.value = 0;
            nextTick(() => {
                if (searchInputRef.value) searchInputRef.value.focus();
            });
        };

        const closeSearch = () => {
            showSearchPanel.value = false;
        };

        const navigateSearch = (direction) => {
            if (filteredResults.value.length === 0) return;
            if (direction === 'next') {
                activeSearchIndex.value = (activeSearchIndex.value + 1) % filteredResults.value.length;
            } else {
                activeSearchIndex.value = (activeSearchIndex.value - 1 + filteredResults.value.length) % filteredResults.value.length;
            }
        };

        const handleSearchResultClick = (item) => {
            // Emit event to open this item in workspace
            emit('open-search-result', item);
            emit('toast', `已打开：${item.title}`, 'success');
            closeSearch();
        };

        const openSelectedResult = () => {
            if (filteredResults.value.length > 0) {
                handleSearchResultClick(filteredResults.value[activeSearchIndex.value]);
            }
        };

        // i18n Translations
        const translations = {
            'zh-CN': {
                minimize: '最小化挂起', settings: '编辑器设置', editorSettings: '编辑器设置',
                language: '界面语言', theme: '主题模式', fontSize: '字体大小',
                save: '保存', saveCode: '保存代码 (Ctrl+S)', debug: '调试运行', run: '运行测试', submit: '提交判题',
                viewDetail: '点击查看题目详情页', easy: '简单',
                sampleInput: '样例输入', sampleOutput: '样例输出', copy: '复制',
                debugConsole: '调试控制台', judgeDashboard: '判题结果',
                controls: '控制', continue: '继续', stepOver: '单步跳过', stop: '停止',
                variablesWatch: '变量监视', doubleClickEdit: '双击数值可修改',
                varName: '变量名', varValue: '当前值', varType: '类型', noVariables: '当前作用域无变量',
                debugOutput: '调试输出', outputPlaceholder: '程序输出将显示在这里...',
                readyToJudge: '准备就绪', compiling: '编译中', runningTests: '运行测试点',
                testCases: '测试用例', passed: '通过', clickTestCase: '点击左侧测试点查看详情', hiddenTestCase: '这是一个隐藏测试点。',
                testCaseRef: '测试用例参考', fillIn: '填入', readMode: '专注阅读',
                probDesc: '题目描述', constraints: '数据范围', inputFormat: '输入格式', outputFormat: '输出格式'
            },
            'en-US': {
                minimize: 'Minimize', settings: 'Settings', editorSettings: 'Editor Settings',
                language: 'Language', theme: 'Theme', fontSize: 'Font Size',
                save: 'Save', saveCode: 'Save Code (Ctrl+S)', debug: 'Debug', run: 'Run Test', submit: 'Submit',
                viewDetail: 'View Problem Details', easy: 'Easy',
                sampleInput: 'Sample Input', sampleOutput: 'Sample Output', copy: 'Copy',
                debugConsole: 'Debug Console', judgeDashboard: 'Judge Dashboard',
                controls: 'Controls', continue: 'Continue', stepOver: 'Step Over', stop: 'Stop',
                variablesWatch: 'Variables Watch', doubleClickEdit: 'Double-click to edit',
                varName: 'Name', varValue: 'Value', varType: 'Type', noVariables: 'No variables in scope',
                debugOutput: 'Debug Output', outputPlaceholder: 'Program output will appear here...',
                readyToJudge: 'Ready to Judge', compiling: 'Compiling', runningTests: 'Running Tests',
                testCases: 'Test Cases', passed: 'Passed', clickTestCase: 'Click test case to view details', hiddenTestCase: 'This is a hidden test case.',
                testCaseRef: 'Test Case Reference', fillIn: 'Fill In', readMode: 'Read Mode',
                probDesc: 'Description', constraints: 'Constraints', inputFormat: 'Input Format', outputFormat: 'Output Format'
            }
        };

        const t = (key) => {
            const lang = editorConfig.value.lang || 'zh-CN';
            return translations[lang][key] || key;
        };

        const setLang = (lang) => {
            editorConfig.value.lang = lang;
        };

        const currentProblem = computed(() => {
            if (!props.tabs || props.tabs.length === 0) return {};
            return props.tabs[props.activeIndex] || {};
        });

        // Resize Logic
        const startResize = () => {
            isResizing.value = true;
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        };

        const doResize = (e) => {
            if (!isResizing.value) return;
            let newHeight = window.innerHeight - e.clientY;
            const maxHeight = window.innerHeight / 3;
            const minHeight = 40; 
            if (newHeight > maxHeight) newHeight = maxHeight;
            if (newHeight < minHeight) newHeight = minHeight;
            bottomPanelHeight.value = newHeight;
        };

        const stopResize = () => {
            if (isResizing.value) {
                isResizing.value = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                window.dispatchEvent(new Event('resize'));
            }
        };

        // ================= Debug State =================
        const isDebugMode = ref(false);
        const breakpoints = ref([]);
        const currentDebugLine = ref(0);
        const debugVariables = ref([]);
        const debugConsoleLogs = ref([]);
        let codeLines = [];

        const toggleBreakpoint = (line) => {
            const idx = breakpoints.value.indexOf(line);
            if (idx === -1) {
                breakpoints.value.push(line);
                emit('toast', `Breakpoint set at line ${line}`, 'info');
            } else {
                breakpoints.value.splice(idx, 1);
                emit('toast', `Breakpoint removed at line ${line}`, 'info');
            }
        };
        
        const editVariable = (variable) => {
            variable.isEditing = true;
            variable.editValue = variable.value;
        };

        const saveVariable = (variable) => {
            if (variable.type === 'int' && isNaN(Number(variable.editValue))) {
                emit('toast', `Invalid integer value for ${variable.name}`, 'error');
                return;
            }
            variable.value = variable.editValue;
            variable.isEditing = false;
            emit('toast', `Updated ${variable.name} to ${variable.value}`, 'success');
        };

        const cancelEditVariable = (variable) => {
            variable.isEditing = false;
        };

        const evaluateExpression = (expr) => {
            let processed = expr;
            debugVariables.value.forEach(v => {
                const regex = new RegExp(`\\b${v.name}\\b`, 'g');
                processed = processed.replace(regex, v.value);
            });
            try {
                if (/^[\d\s+\-*/().]+$/.test(processed)) {
                    return new Function('return ' + processed)();
                }
                return processed;
            } catch (e) {
                return processed;
            }
        };

        const startDebugSession = () => {
            if (!currentProblem.value.code) return;
            isDebugMode.value = true;
            activeBottomTab.value = 'debug';
            debugVariables.value = [];
            debugConsoleLogs.value = [];
            codeLines = currentProblem.value.code.split('\n');
            let startLine = 1;
            const mainLineIdx = codeLines.findIndex(l => l.includes('int main'));
            if (mainLineIdx !== -1) {
                let braceFound = false;
                for (let i = mainLineIdx; i < codeLines.length; i++) {
                    if (codeLines[i].includes('{')) {
                        braceFound = true;
                        startLine = i + 2; 
                        break;
                    }
                }
                if (!braceFound) startLine = mainLineIdx + 2; 
            }
            currentDebugLine.value = startLine;
            debugConsoleLogs.value.push('[Debugger] Attached to process.');
            debugConsoleLogs.value.push(`[Debugger] Paused at line ${startLine}.`);
        };

        const stopDebugSession = () => {
            isDebugMode.value = false;
            currentDebugLine.value = 0;
            debugConsoleLogs.value.push('[Debugger] Detached.');
        };

        const stepOverDebug = () => {
            if (!isDebugMode.value || currentDebugLine.value > codeLines.length) {
                stopDebugSession();
                return;
            }
            let lineContent = codeLines[currentDebugLine.value - 1].trim();
            lineContent = lineContent.replace(/\/\/.*$/, '').trim(); 
            const varDeclMatch = lineContent.match(/(int|string|bool|double|float)\s+([a-zA-Z0-9_]+)\s*=\s*(.*);/);
            if (varDeclMatch) {
                const [_, type, name, expr] = varDeclMatch;
                const evaluatedValue = evaluateExpression(expr.replace(/^"|"$/g, ''));
                const existingIdx = debugVariables.value.findIndex(v => v.name === name);
                if (existingIdx !== -1) {
                    debugVariables.value[existingIdx].value = evaluatedValue;
                } else {
                    debugVariables.value.push({ name, value: evaluatedValue, type, isEditing: false, editValue: '' });
                }
            }
            const assignMatch = lineContent.match(/^([a-zA-Z0-9_]+)\s*=\s*(.*);/);
            if (assignMatch) {
                const [_, name, expr] = assignMatch;
                const evaluatedValue = evaluateExpression(expr);
                const existingIdx = debugVariables.value.findIndex(v => v.name === name);
                if (existingIdx !== -1) {
                     debugVariables.value[existingIdx].value = evaluatedValue;
                }
            }
            if (lineContent.startsWith('cout')) {
                const outMatch = lineContent.match(/cout\s*<<\s*(.*);/);
                if (outMatch) {
                    let output = outMatch[1].replace(/endl/g, '\n').replace(/"/g, '');
                    debugVariables.value.forEach(v => {
                        if (output.includes(v.name)) output = output.replace(v.name, v.value);
                    });
                    debugConsoleLogs.value.push(output);
                }
            }
            let nextLine = currentDebugLine.value + 1;
            while (nextLine <= codeLines.length) {
                const text = codeLines[nextLine - 1].trim();
                if (text && !text.startsWith('//') && text !== '}') {
                    break;
                }
                nextLine++;
            }
            if (nextLine > codeLines.length || lineContent === 'return 0;') {
                debugConsoleLogs.value.push('[Debugger] Program exited normally.');
                setTimeout(stopDebugSession, 1000);
            } else {
                currentDebugLine.value = nextLine;
            }
        };

        const continueDebug = () => {
            const runner = setInterval(() => {
                if (!isDebugMode.value) { clearInterval(runner); return; }
                stepOverDebug();
                if (breakpoints.value.includes(currentDebugLine.value)) {
                    clearInterval(runner);
                    debugConsoleLogs.value.push(`[Debugger] Hit breakpoint at line ${currentDebugLine.value}.`);
                }
                if (currentDebugLine.value === 0) {
                    clearInterval(runner);
                }
            }, 200); 
        };

        // Judge State & Logic
        const customInput = ref('');
        const customOutput = ref('');
        const isRunningCustom = ref(false);
        const debugLogs = ref([]);
        const debugInput = ref('');
        const debugConsoleRef = ref(null);

        const judgeStatus = ref('idle'); 
        const judgeProgress = ref({ current: 0, total: 0 });
        const judgeCaseResults = ref([]);
        const judgeFinalResult = ref({ status: '', score: 0 });
        const selectedTestCase = ref(null);

        const renderMarkdown = (text) => {
            if (!text) return '';
            if (typeof marked !== 'undefined') return marked.parse(text);
            return text; 
        };

        const copyToClipboard = (text) => {
            if (!text) return;
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            emit('toast', '已复制', 'success');
        };

        const handleSave = () => {
             emit('save', currentProblem.value);
        };

        const toggleSettings = () => { showSettingsPanel.value = !showSettingsPanel.value; };
        const setTheme = (theme) => { editorConfig.value.theme = theme; };
        const adjustFontSize = (delta) => {
            let newSize = editorConfig.value.fontSize + delta;
            if (newSize < 10) newSize = 10;
            if (newSize > 24) newSize = 24;
            editorConfig.value.fontSize = newSize;
        };

        const openRunModal = () => {
             showRunModal.value = true;
             activeTerminalTab.value = 'terminal';
             customInput.value = currentProblem.value.sampleInput || '';
             customOutput.value = '';
             isRunningCustom.value = false;
             debugLogs.value = [];
        };

        const executeCustomRun = () => {
            if (isRunningCustom.value) return;
            isRunningCustom.value = true;
            if (activeTerminalTab.value === 'terminal') {
                customOutput.value = 'Compiling and Running...';
                setTimeout(() => {
                    const code = currentProblem.value.code || '';
                    const input = customInput.value.trim();
                    let output = '';
                    if (!code.includes('main')) output = "[Error] Linker error: undefined reference to `main'";
                    else if ((code.includes('cin >>') || code.includes('scanf')) && (code.includes('a') || code.includes('b') || code.includes('n'))) {
                        const nums = input.split(/\s+/).map(Number).filter(n => !isNaN(n));
                        if (nums.length >= 2) output = (nums[0] + nums[1]).toString(); else if (nums.length === 1) output = nums[0].toString(); else output = "0";
                    } else if (code.includes('cout')) {
                        if (code.includes('Hello World')) output = "Hello World"; else output = "Program Output";
                    } else output = "Program exited with code 0. (No output)";
                    customOutput.value = output + '\n\n[Process completed]';
                    isRunningCustom.value = false;
                }, 800);
            } else {
                debugLogs.value = [{ type: 'output', text: 'Debugging session started. Compiling...' }];
                setTimeout(() => {
                    debugLogs.value.push({ type: 'output', text: 'Build successfully.' });
                    debugLogs.value.push({ type: 'output', text: 'Program running. Waiting for input...' });
                }, 800);
            }
        };

        const sendDebugInput = () => {
            if (!debugInput.value.trim()) return;
            const inputVal = debugInput.value.trim();
            debugLogs.value.push({ type: 'input', text: inputVal });
            debugInput.value = '';
            setTimeout(() => {
                debugLogs.value.push({ type: 'output', text: `Echo: ${inputVal}` });
                nextTick(() => { if (debugConsoleRef.value) debugConsoleRef.value.scrollTop = debugConsoleRef.value.scrollHeight; });
            }, 300);
        };

        const startJudgeProcedure = async () => {
            if (judgeStatus.value === 'judging' || judgeStatus.value === 'compiling') return;
            activeBottomTab.value = 'judge'; 
            judgeStatus.value = 'compiling';
            judgeCaseResults.value = [];
            judgeFinalResult.value = { status: '', score: 0 };
            selectedTestCase.value = null;
            await new Promise(r => setTimeout(r, 1500)); 
            
            if (!currentProblem.value.code || currentProblem.value.code.trim().length < 20) {
                judgeStatus.value = 'finished'; judgeFinalResult.value = { status: 'CE', score: 0 }; 
                return;
            }
            
            judgeStatus.value = 'judging';
            const testCases = currentProblem.value.testCases || [];
            judgeProgress.value = { current: 0, total: testCases.length };
            let totalPassed = 0;
            
            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];
                const caseResult = { id: i + 1, status: 'running', time: 0, input: tc.input, output: '', expected: tc.output, isPublic: tc.isPublic !== false };
                judgeCaseResults.value.push(caseResult);
                await new Promise(r => setTimeout(r, 600 + Math.random() * 500)); 
                
                let resultStatus = 'AC';
                let actualOutput = tc.output;
                if (currentProblem.value.code.includes('bug') && i % 2 !== 0) resultStatus = 'WA';
                
                caseResult.status = resultStatus;
                caseResult.time = Math.floor(Math.random() * 20) + 2; 
                caseResult.output = actualOutput;
                
                if (resultStatus === 'AC') { totalPassed++; } 
                judgeProgress.value.current++;
            }
            
            judgeStatus.value = 'finished';
            if (totalPassed === testCases.length) {
                judgeFinalResult.value = { status: 'AC', score: 100 };
                currentProblem.value.status = 'passed'; // 响应式修改
                emit('toast', '提交通过！', 'success');
            } else {
                judgeFinalResult.value = { status: 'WA', score: Math.floor((totalPassed / testCases.length) * 100) };
                emit('toast', '判题未通过', 'error');
            }
        };

        return {
            currentProblem,
            activeBottomTab, showRunModal, showDetailModal, activeTerminalTab,
            customInput, customOutput, isRunningCustom,
            debugLogs, debugInput, debugConsoleRef,
            judgeStatus, judgeProgress, judgeCaseResults, judgeFinalResult, selectedTestCase,
            renderMarkdown, copyToClipboard, handleSave,
            openRunModal, executeCustomRun, sendDebugInput, startJudgeProcedure,
            showSettingsPanel, editorConfig, toggleSettings, setTheme, adjustFontSize,
            // Debug Features
            isDebugMode, breakpoints, currentDebugLine, debugVariables, debugConsoleLogs,
            toggleBreakpoint, startDebugSession, stopDebugSession, stepOverDebug, continueDebug,
            editVariable, saveVariable, cancelEditVariable,
            // Resize Logic
            bottomPanelHeight, startResize, doResize, stopResize, isResizing,
            // [NEW] Search Features
            showSearchPanel, searchQuery, searchInputRef, filteredResults, activeSearchIndex, openSearchModal, closeSearch, handleSearchResultClick, navigateSearch, openSelectedResult,
            t, setLang
        };
    }
};

window.CodingWorkspaceFeature = CodingWorkspaceFeature;