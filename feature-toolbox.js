const ToolboxFeature = {
    props: ['user'],
    template: `
    <div class="fixed inset-0 z-[300] bg-slate-900/95 backdrop-blur-2xl flex flex-col animate-fade-in text-white overflow-hidden font-sans selection:bg-cyan-500/30">
        
        <!-- 顶部：工具箱头部 -->
        <div class="flex-shrink-0 px-6 py-4 flex justify-between items-center border-b border-cyan-500/20 bg-slate-900/80 relative z-20 shadow-lg shadow-cyan-900/10">
            <div class="flex items-center gap-4">
                <div class="size-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(8,145,178,0.4)] border border-cyan-400/30 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-30"></div>
                    <i class="fa-solid fa-toolbox text-2xl text-white relative z-10 group-hover:rotate-12 transition-transform duration-500"></i>
                </div>
                <div>
                    <h2 class="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        极客工具箱 <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono tracking-wider">V2.0 PRO</span>
                    </h2>
                    <p class="text-xs text-cyan-400/60 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <span class="size-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        Developer Utilities
                    </p>
                </div>
            </div>
            <button @click="$emit('close')" class="size-10 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition flex items-center justify-center border border-white/10 group">
                <i class="fa-solid fa-xmark text-lg group-hover:scale-110 transition-transform"></i>
            </button>
        </div>

        <div class="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
            
            <!-- 左侧：工具导航 -->
            <div class="w-full lg:w-64 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-cyan-500/10 flex flex-row lg:flex-col p-3 gap-2 overflow-x-auto lg:overflow-visible flex-shrink-0 backdrop-blur-sm">
                <button v-for="tool in tools" :key="tool.id"
                        @click="currentTool = tool.id"
                        class="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden group flex-shrink-0"
                        :class="currentTool === tool.id ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/20 text-cyan-300 border border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'">
                    
                    <!-- 激活时的发光条 -->
                    <div v-if="currentTool === tool.id" class="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
                    
                    <div class="size-9 rounded-lg flex items-center justify-center text-lg transition-all duration-300 shadow-inner"
                         :class="currentTool === tool.id ? 'bg-cyan-500 text-slate-900 shadow-cyan-500/50 scale-105' : 'bg-slate-800 group-hover:bg-slate-700'">
                        <i :class="tool.icon"></i>
                    </div>
                    <div class="flex flex-col items-start relative z-10">
                        <span class="font-bold text-sm tracking-wide">{{ tool.name }}</span>
                        <span class="text-[9px] opacity-60 uppercase font-mono tracking-wider">{{ tool.sub }}</span>
                    </div>
                </button>
            </div>

            <!-- 右侧：工具内容区域 -->
            <div class="flex-1 relative bg-[#0b1121] overflow-hidden flex flex-col">
                <!-- 装饰背景：赛博网格 -->
                <div class="absolute inset-0" style="background-image: radial-gradient(rgba(6,182,212,0.1) 1px, transparent 1px); background-size: 30px 30px; opacity: 0.5;"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-slate-900/0 via-slate-900/50 to-slate-900 pointer-events-none"></div>

                <div class="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
                    
                    <!-- 工具 1: 进制转换 -->
                    <transition name="fade" mode="out-in">
                        <div v-if="currentTool === 'base'" key="base" class="max-w-4xl mx-auto space-y-8 mt-10">
                            <div class="text-center relative">
                                <h3 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                    全能进制转换
                                </h3>
                                <p class="text-slate-400 text-sm font-mono">Base Converter // DEC-BIN-OCT-HEX</p>
                            </div>

                            <div class="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <!-- 输入 -->
                                    <div class="space-y-3">
                                        <label class="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                            <i class="fa-solid fa-arrow-right-to-bracket"></i> Input Source
                                        </label>
                                        <div class="flex gap-3">
                                            <div class="relative w-32">
                                                <select v-model="baseInputRadix" class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer hover:bg-slate-800 transition shadow-inner">
                                                    <option value="2">BIN (2)</option>
                                                    <option value="8">OCT (8)</option>
                                                    <option value="10">DEC (10)</option>
                                                    <option value="16">HEX (16)</option>
                                                </select>
                                                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none"><i class="fa-solid fa-chevron-down text-xs"></i></div>
                                            </div>
                                            <input type="text" v-model="baseInputVal" placeholder="输入数值..." 
                                                   class="flex-1 bg-slate-900/80 border border-white/10 rounded-xl px-5 py-3 text-white font-mono text-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition shadow-inner tracking-wide placeholder:text-slate-600">
                                        </div>
                                    </div>

                                    <!-- 输出 -->
                                    <div class="space-y-3">
                                        <label class="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                            <i class="fa-solid fa-arrow-right-from-bracket"></i> Converted Result
                                        </label>
                                        <div class="flex gap-3">
                                            <div class="relative w-32">
                                                <select v-model="baseOutputRadix" class="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-emerald-300 font-bold focus:border-emerald-500 focus:outline-none appearance-none cursor-pointer hover:bg-slate-800 transition shadow-inner">
                                                    <option value="2">BIN (2)</option>
                                                    <option value="8">OCT (8)</option>
                                                    <option value="10">DEC (10)</option>
                                                    <option value="16">HEX (16)</option>
                                                </select>
                                                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"><i class="fa-solid fa-chevron-down text-xs"></i></div>
                                            </div>
                                            <div class="flex-1 bg-[#0f1c2e] border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-400 font-mono font-bold text-lg flex items-center justify-between group cursor-pointer relative overflow-hidden transition-all hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]" @click="copyToClipboard(baseResult)">
                                                <div class="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition"></div>
                                                <span class="truncate relative z-10">{{ baseResult || '...' }}</span>
                                                <i class="fa-regular fa-copy opacity-0 group-hover:opacity-100 transition text-sm relative z-10"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 快速参考表 (HUD风格) -->
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div v-for="(val, label) in baseQuickView" :key="label" 
                                     class="bg-slate-800/30 rounded-xl p-4 border border-white/5 hover:border-cyan-500/40 transition group relative overflow-hidden hover:-translate-y-1 duration-300">
                                    <div class="absolute -right-2 -top-2 text-4xl font-black text-white/5 group-hover:text-cyan-500/10 transition">{{ label }}</div>
                                    <div class="text-[10px] text-cyan-500/70 uppercase font-bold tracking-widest mb-1">{{ label }} MODE</div>
                                    <div class="text-xl font-mono font-bold text-slate-200 truncate group-hover:text-cyan-300 transition shadow-black drop-shadow-sm">{{ val }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- 工具 2: 酷炫二叉树生成 -->
                        <div v-else-if="currentTool === 'tree'" key="tree" class="h-full flex flex-col">
                            <div class="flex justify-between items-end mb-4 flex-shrink-0 px-2">
                                <div>
                                    <h3 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                        <i class="fa-solid fa-circle-nodes text-cyan-400"></i> 二叉树可视化
                                    </h3>
                                    <p class="text-slate-400 text-xs font-mono mt-1">Binary Tree Visualizer // Matrix Render</p>
                                </div>
                                <div class="flex gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-white/10 shadow-lg">
                                    <button @click="treeMode = 'pre-in'" 
                                            class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300" 
                                            :class="treeMode === 'pre-in' ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/5'">
                                        前序 + 中序
                                    </button>
                                    <button @click="treeMode = 'in-post'" 
                                            class="px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300" 
                                            :class="treeMode === 'in-post' ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/5'">
                                        中序 + 后序
                                    </button>
                                </div>
                            </div>

                            <!-- 输入控制台 -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4 flex-shrink-0 px-2">
                                <div class="space-y-1.5 group">
                                    <label class="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex justify-between">
                                        <span>{{ treeMode === 'pre-in' ? 'Pre-order Sequence' : 'In-order Sequence' }}</span>
                                        <span class="opacity-0 group-hover:opacity-100 transition duration-500 text-[8px] border border-cyan-500/30 px-1 rounded text-cyan-300">INPUT 01</span>
                                    </label>
                                    <div class="relative">
                                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/30 font-mono text-sm pointer-events-none">></div>
                                        <input type="text" v-model="treeInput1" 
                                               class="w-full bg-[#0f172a] border border-cyan-900/50 rounded-xl pl-8 pr-4 py-3 text-cyan-100 font-mono text-sm focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] outline-none uppercase tracking-[0.2em] transition placeholder:text-slate-700" 
                                               placeholder="输入序列 如: ABDECF..." @input="debouncedBuildTree">
                                    </div>
                                </div>
                                <div class="space-y-1.5 group">
                                    <label class="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex justify-between">
                                        <span>{{ treeMode === 'pre-in' ? 'In-order Sequence' : 'Post-order Sequence' }}</span>
                                        <span class="opacity-0 group-hover:opacity-100 transition duration-500 text-[8px] border border-purple-500/30 px-1 rounded text-purple-300">INPUT 02</span>
                                    </label>
                                    <div class="relative">
                                        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500/30 font-mono text-sm pointer-events-none">></div>
                                        <input type="text" v-model="treeInput2" 
                                               class="w-full bg-[#0f172a] border border-purple-900/50 rounded-xl pl-8 pr-4 py-3 text-purple-100 font-mono text-sm focus:border-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] outline-none uppercase tracking-[0.2em] transition placeholder:text-slate-700" 
                                               placeholder="输入序列 如: DBEAFC..." @input="debouncedBuildTree">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 错误提示 -->
                            <div v-if="treeError" class="mx-2 mb-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2 animate-bounce-in">
                                <i class="fa-solid fa-triangle-exclamation"></i> 
                                <span class="font-mono font-bold">SYSTEM ERROR: {{ treeError }}</span>
                            </div>

                            <!-- 绘图区 (CRT效果) -->
                            <div class="flex-1 rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl bg-[#050910]" id="tree-canvas-container">
                                <!-- 网格线动画背景 -->
                                <div class="absolute inset-0 z-0 opacity-20 pointer-events-none" 
                                     style="background-image: linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px); background-size: 40px 40px;">
                                </div>
                                
                                <canvas ref="treeCanvas" class="absolute inset-0 w-full h-full z-10"></canvas>
                                
                                <!-- 空状态占位 -->
                                <div v-if="!treeData && !treeError" class="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                                    <div class="relative size-24 mb-4">
                                        <div class="absolute inset-0 rounded-full border-4 border-slate-800 animate-[ping_3s_infinite]"></div>
                                        <div class="absolute inset-0 rounded-full border-4 border-slate-700 animate-[ping_3s_animation-delay:1s_infinite]"></div>
                                        <div class="flex items-center justify-center w-full h-full text-slate-800 text-4xl">
                                            <i class="fa-solid fa-network-wired"></i>
                                        </div>
                                    </div>
                                    <p class="text-slate-600 text-xs font-mono uppercase tracking-widest animate-pulse">Waiting for valid sequence inputs...</p>
                                </div>
                                
                                <!-- 扫描线效果 -->
                                <div class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-[scan_3s_linear_infinite] pointer-events-none z-30"></div>
                            </div>
                        </div>

                        <!-- 工具 3: 表达式转换 -->
                        <div v-else-if="currentTool === 'expr'" key="expr" class="max-w-4xl mx-auto space-y-10 mt-10">
                            <div class="text-center">
                                <h3 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-400 mb-2">
                                    波兰表达式引擎
                                </h3>
                                <p class="text-slate-400 text-sm font-mono">Infix to Polish / Reverse Polish Notation</p>
                            </div>

                            <div class="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                                <div class="space-y-4 mb-10">
                                    <label class="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                        <i class="fa-solid fa-code"></i> Infix Expression
                                    </label>
                                    <div class="relative group">
                                        <input type="text" v-model="exprInput" placeholder="(A + B) * (C - D)" 
                                               class="w-full bg-[#0f172a] border border-amber-500/20 rounded-2xl px-6 py-5 text-amber-100 font-mono text-xl focus:border-amber-500 focus:shadow-[0_0_20px_rgba(245,158,11,0.2)] outline-none transition shadow-inner tracking-widest placeholder:text-slate-700">
                                        <div class="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-amber-500/10 rounded text-[10px] text-amber-500 border border-amber-500/20 font-bold opacity-0 group-hover:opacity-100 transition">INFIX</div>
                                    </div>
                                </div>

                                <div class="space-y-6">
                                    <!-- 前缀 -->
                                    <div class="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-slate-900/50 group hover:border-purple-500/50 transition duration-300">
                                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>
                                        <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div class="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Prefix (Polish Notation)</div>
                                                <div class="font-mono text-xl text-white font-bold tracking-widest min-h-[1.75rem]">{{ exprPrefix }}</div>
                                            </div>
                                            <button @click="copyToClipboard(exprPrefix)" class="size-10 rounded-lg bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20 transition flex items-center justify-center">
                                                <i class="fa-regular fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- 后缀 -->
                                    <div class="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900/50 group hover:border-emerald-500/50 transition duration-300">
                                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                        <div class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Postfix (Reverse Polish Notation)</div>
                                                <div class="font-mono text-xl text-white font-bold tracking-widest min-h-[1.75rem]">{{ exprPostfix }}</div>
                                            </div>
                                            <button @click="copyToClipboard(exprPostfix)" class="size-10 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 transition flex items-center justify-center">
                                                <i class="fa-regular fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-center gap-4 text-[10px] text-slate-500 font-mono uppercase">
                                <span class="px-2 py-1 rounded bg-slate-800 border border-slate-700">Supported: + - * / ^ ( )</span>
                                <span class="px-2 py-1 rounded bg-slate-800 border border-slate-700">Auto-Balancing</span>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            currentTool: 'tree', // 默认打开二叉树以便查看效果
            tools: [
                { id: 'base', name: '进制转换', sub: 'Radix', icon: 'fa-solid fa-right-left' },
                { id: 'tree', name: '二叉树构建', sub: 'Binary Tree', icon: 'fa-solid fa-share-nodes' },
                { id: 'expr', name: '表达式转换', sub: 'Notation', icon: 'fa-solid fa-superscript' }
            ],
            
            // Base Converter Data
            baseInputRadix: '10',
            baseOutputRadix: '2',
            baseInputVal: '',
            
            // Tree Builder Data
            treeMode: 'pre-in', 
            treeInput1: '',
            treeInput2: '',
            treeData: null,
            treeError: '',
            buildTimer: null,
            animationFrameId: null,
            
            // Expression Data
            exprInput: '',
        };
    },
    computed: {
        baseResult() {
            if (!this.baseInputVal) return '';
            try {
                const valStr = this.baseInputVal.trim();
                const fromRadix = parseInt(this.baseInputRadix);
                const toRadix = parseInt(this.baseOutputRadix);
                const validChars = fromRadix === 16 ? /^[0-9a-fA-F]+$/ : 
                                   fromRadix === 10 ? /^[0-9]+$/ :
                                   fromRadix === 8 ? /^[0-7]+$/ : /^[0-1]+$/;
                if (!validChars.test(valStr)) return 'Invalid Input';
                const decimal = parseInt(valStr, fromRadix);
                if (isNaN(decimal)) return 'Error';
                return decimal.toString(toRadix).toUpperCase();
            } catch (e) { return 'Error'; }
        },
        baseQuickView() {
            const res = this.baseResult;
            if (res === 'Error' || res === 'Invalid Input' || !res) return {};
            const valStr = this.baseInputVal.trim();
            if(!valStr) return {};
            try {
                const decimal = parseInt(valStr, parseInt(this.baseInputRadix));
                if(isNaN(decimal)) return {};
                return {
                    'BIN': decimal.toString(2),
                    'OCT': decimal.toString(8),
                    'DEC': decimal.toString(10),
                    'HEX': decimal.toString(16).toUpperCase()
                };
            } catch { return {}; }
        },
        exprPrefix() { return this.convertExpression(this.exprInput, 'prefix'); },
        exprPostfix() { return this.convertExpression(this.exprInput, 'postfix'); }
    },
    watch: {
        treeMode() { this.debouncedBuildTree(); },
        currentTool(val) {
             if(val === 'tree') {
                 this.$nextTick(() => {
                     window.addEventListener('resize', this.resizeCanvas);
                     this.resizeCanvas();
                 });
             } else {
                 window.removeEventListener('resize', this.resizeCanvas);
             }
        }
    },
    mounted() {
        if(this.currentTool === 'tree') {
            window.addEventListener('resize', this.resizeCanvas);
            this.$nextTick(this.resizeCanvas);
        }
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.resizeCanvas);
        if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    },
    methods: {
        copyToClipboard(text) {
            if (!text || text === 'Error' || text === 'Invalid Input') return;
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            // 这里可以触发一个简易的 toast (如果 props 里传了方法)
            // console.log('Copied');
        },
        
        // --- 树构建逻辑 ---
        debouncedBuildTree() {
            if (this.buildTimer) clearTimeout(this.buildTimer);
            this.buildTimer = setTimeout(this.buildAndDrawTree, 600);
        },
        resizeCanvas() {
             if(this.currentTool !== 'tree' || !this.$refs.treeCanvas) return;
             this.drawTree(true); // Force redraw
        },
        buildAndDrawTree() {
            const s1 = this.treeInput1.toUpperCase().trim();
            const s2 = this.treeInput2.toUpperCase().trim();
            this.treeError = '';
            
            if (!s1 || !s2) { this.treeData = null; this.clearCanvas(); return; }
            if (s1.length !== s2.length) { this.treeError = '序列长度不一致 (Length Mismatch)'; this.clearCanvas(); return; }
            
            const set1 = new Set(s1.split(''));
            if (set1.size !== s1.length) { this.treeError = '节点名称重复 (Duplicate Nodes)'; this.clearCanvas(); return; }

            try {
                if (this.treeMode === 'pre-in') {
                    this.treeData = this.buildTreePreIn(s1, s2);
                } else {
                    this.treeData = this.buildTreeInPost(s1, s2);
                }
                // Start Animation
                this.animationProgress = 0;
                this.animateTree();
            } catch (e) {
                this.treeError = '无法构建树：序列无效 (Invalid Sequence)';
                this.treeData = null;
                this.clearCanvas();
            }
        },
        buildTreePreIn(preOrder, inOrder) {
            if (!preOrder || !inOrder) return null;
            if (preOrder.length === 0) return null;
            const rootVal = preOrder[0];
            const rootIndex = inOrder.indexOf(rootVal);
            if (rootIndex === -1) throw new Error('Invalid');
            
            const node = { val: rootVal, left: null, right: null };
            
            const leftIn = inOrder.slice(0, rootIndex);
            const rightIn = inOrder.slice(rootIndex + 1);
            
            const leftPre = preOrder.slice(1, 1 + leftIn.length);
            const rightPre = preOrder.slice(1 + leftIn.length);
            
            node.left = this.buildTreePreIn(leftPre, leftIn);
            node.right = this.buildTreePreIn(rightPre, rightIn);
            return node;
        },
        buildTreeInPost(inOrder, postOrder) {
            if (!inOrder || !postOrder) return null;
            if (postOrder.length === 0) return null;
            const rootVal = postOrder[postOrder.length - 1];
            const rootIndex = inOrder.indexOf(rootVal);
            if (rootIndex === -1) throw new Error('Invalid');
            
            const node = { val: rootVal, left: null, right: null };
            
            const leftIn = inOrder.slice(0, rootIndex);
            const rightIn = inOrder.slice(rootIndex + 1);
            
            const leftPost = postOrder.slice(0, leftIn.length);
            const rightPost = postOrder.slice(leftIn.length, postOrder.length - 1);
            
            node.left = this.buildTreeInPost(leftIn, leftPost);
            node.right = this.buildTreeInPost(rightIn, rightPost);
            return node;
        },
        clearCanvas() {
            const canvas = this.$refs.treeCanvas;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        },
        animateTree() {
            if(this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
            const startTime = performance.now();
            const duration = 1000; // 1s animation

            const step = (timestamp) => {
                const elapsed = timestamp - startTime;
                let progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                progress = 1 - Math.pow(1 - progress, 3);
                
                this.drawTree(false, progress);

                if (elapsed < duration) {
                    this.animationFrameId = requestAnimationFrame(step);
                }
            };
            this.animationFrameId = requestAnimationFrame(step);
        },
        drawTree(resize = false, progress = 1) {
            if (!this.$refs.treeCanvas) return;
            const canvas = this.$refs.treeCanvas;
            const parent = canvas.parentElement;

            const dpr = window.devicePixelRatio || 1;
            const displayWidth = parent.clientWidth;
            const displayHeight = parent.clientHeight;

            // Check if canvas size matches display size
            if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
                canvas.width = displayWidth * dpr;
                canvas.height = displayHeight * dpr;
                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);
            }

            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, displayWidth, displayHeight);

            if (!this.treeData) return;
            
            const getDepth = (n) => !n ? 0 : 1 + Math.max(getDepth(n.left), getDepth(n.right));
            const depth = getDepth(this.treeData);
            
            const width = parent.clientWidth;
            const height = parent.clientHeight;
            const levelHeight = Math.min(height / (depth + 1), 100);
            
            // Draw logic
            const drawNode = (node, x, y, layer, availableWidth, currentProgress) => {
                if (!node) return;
                
                // Staggered animation based on layer
                const layerStart = (layer - 1) * 0.2; // Each layer starts a bit later
                let localProgress = (currentProgress - layerStart) * 2; // Speed up
                localProgress = Math.max(0, Math.min(1, localProgress));
                
                if (localProgress <= 0) return;

                const nextY = y + levelHeight;
                const offset = availableWidth / 2;
                
                // Draw Edges first (behind nodes)
                ctx.globalAlpha = localProgress;
                
                if (node.left) {
                    const nextX = x - offset / 2;
                    // Draw Line
                    ctx.beginPath();
                    ctx.moveTo(x, y + 20); // offset by node radius
                    ctx.lineTo(x + (nextX - x) * localProgress, (y + 20) + (nextY - 20 - (y+20)) * localProgress);
                    
                    const grad = ctx.createLinearGradient(x, y, nextX, nextY);
                    grad.addColorStop(0, '#06b6d4'); // Cyan
                    grad.addColorStop(1, '#a855f7'); // Purple
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 3;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#06b6d4';
                    ctx.stroke();
                    
                    ctx.shadowBlur = 0; // Reset
                    drawNode(node.left, nextX, nextY, layer + 1, offset, currentProgress);
                }
                
                if (node.right) {
                    const nextX = x + offset / 2;
                    ctx.beginPath();
                    ctx.moveTo(x, y + 20);
                    ctx.lineTo(x + (nextX - x) * localProgress, (y + 20) + (nextY - 20 - (y+20)) * localProgress);
                    
                    const grad = ctx.createLinearGradient(x, y, nextX, nextY);
                    grad.addColorStop(0, '#06b6d4');
                    grad.addColorStop(1, '#ec4899'); // Pink
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 3;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ec4899';
                    ctx.stroke();
                    
                    ctx.shadowBlur = 0;
                    drawNode(node.right, nextX, nextY, layer + 1, offset, currentProgress);
                }

                // Draw Node Circle (Animated Pop)
                // Bounce effect
                let scale = localProgress;
                if (localProgress > 0.8 && localProgress < 1) scale = 1.1;
                else if (localProgress === 1) scale = 1;

                ctx.save();
                ctx.translate(x, y);
                ctx.scale(scale, scale);
                
                // Glow
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#06b6d4';
                
                // Fill Gradient
                const radGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 25);
                radGrad.addColorStop(0, '#22d3ee'); // Cyan-400
                radGrad.addColorStop(1, '#0e7490'); // Cyan-700
                ctx.fillStyle = radGrad;
                
                ctx.beginPath();
                ctx.arc(0, 0, 22, 0, 2 * Math.PI);
                ctx.fill();
                
                // Border
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#cffafe'; // Cyan-50
                ctx.stroke();
                
                // Text
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 16px "JetBrains Mono"';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.val, 0, 1); // slight offset adjustment
                
                ctx.restore();
            };
            
            drawNode(this.treeData, width / 2, 50, 1, width, progress);
            ctx.globalAlpha = 1; // Reset
        },

        // --- 表达式转换逻辑 ---
        getPriority(op) {
            if (op === '+' || op === '-') return 1;
            if (op === '*' || op === '/') return 2;
            if (op === '^') return 3;
            return 0;
        },
        convertExpression(infix, type) {
            if (!infix) return '';
            let cleanExpr = infix.replace(/\s+/g, '');
            
            if (type === 'prefix') {
                cleanExpr = cleanExpr.split('').reverse().join('');
                cleanExpr = cleanExpr.replace(/[()]/g, m => m === '(' ? ')' : '(');
            }
            
            let output = [];
            let stack = [];
            
            for (let char of cleanExpr) {
                if (/[a-zA-Z0-9]/.test(char)) {
                    output.push(char);
                } else if (char === '(') {
                    stack.push(char);
                } else if (char === ')') {
                    while (stack.length && stack[stack.length - 1] !== '(') {
                        output.push(stack.pop());
                    }
                    stack.pop();
                } else {
                    while (stack.length && this.getPriority(char) <= this.getPriority(stack[stack.length - 1])) {
                         if (type === 'prefix' && this.getPriority(char) === this.getPriority(stack[stack.length - 1])) break;
                         output.push(stack.pop());
                    }
                    stack.push(char);
                }
            }
            while (stack.length) output.push(stack.pop());
            
            let res = output.join(' '); 
            if (type === 'prefix') {
                res = output.reverse().join(' ');
            }
            return res;
        }
    }
};

window.ToolboxFeature = ToolboxFeature;