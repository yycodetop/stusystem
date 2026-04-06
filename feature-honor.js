// ==========================================
// 模块名称：荣誉中心 (Feature Honor)
// 版本：V3.0 (UI重构：分页、搜索、精细化统计)
// ==========================================

const HonorFeature = {
    props: ['user'],
    emits: ['show-toast', 'go-back', 'show-modal'], 
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in-up overflow-hidden">
        
        <!-- 顶部控制栏：Tab 切换 + 搜索 -->
        <div class="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20 shrink-0">
            
            <!-- 漂亮的 Tab 切换 (胶囊风格) -->
            <div class="relative bg-slate-100 p-1.5 rounded-full flex items-center shadow-inner">
                <!-- 滑动背景块 -->
                <div class="absolute inset-y-1.5 rounded-full bg-white shadow-sm transition-all duration-300 ease-out"
                     :class="currentTab === 'certificates' ? 'left-1.5 w-[calc(50%-0.375rem)]' : 'left-[50%] w-[calc(50%-0.375rem)]'">
                </div>
                
                <button @click="currentTab = 'certificates'" 
                        class="relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 min-w-[140px] justify-center"
                        :class="currentTab === 'certificates' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                    <i class="fa-solid fa-certificate"></i> 我的奖状
                </button>
                <button @click="currentTab = 'badges'" 
                        class="relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 flex items-center gap-2 min-w-[140px] justify-center"
                        :class="currentTab === 'badges' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'">
                    <i class="fa-solid fa-medal"></i> 赛季勋章
                </button>
            </div>

            <!-- 搜索框 (仅在奖状 Tab 显示) -->
            <div class="relative group w-full md:w-64" v-if="currentTab === 'certificates'">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                <input type="text" v-model="searchQuery" placeholder="搜索奖状..." 
                       class="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-full py-2 pl-10 pr-4 text-sm transition-all duration-300 outline-none placeholder-slate-400">
            </div>
        </div>

        <!-- 内容区域 (隐藏滚动条) -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            
            <transition name="fade" mode="out-in">
                
                <!-- 1. 奖状墙视图 -->
                <div v-if="currentTab === 'certificates'" key="cert" class="space-y-8 max-w-7xl mx-auto">
                    
                    <!-- 统计概览 Cards -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-indigo-200 transition-colors">
                            <div class="size-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-trophy"></i>
                            </div>
                            <div class="text-2xl font-black text-slate-800">{{ stats.total }}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">总奖状</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-red-200 transition-colors">
                            <div class="size-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-flag"></i>
                            </div>
                            <div class="text-2xl font-black text-slate-800">{{ stats.national }}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">国家级</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-purple-200 transition-colors">
                            <div class="size-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-map"></i>
                            </div>
                            <div class="text-2xl font-black text-slate-800">{{ stats.provincial }}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">省级</div>
                        </div>
                        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center group hover:border-yellow-200 transition-colors">
                            <div class="size-10 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-building-columns"></i>
                            </div>
                            <div class="text-2xl font-black text-slate-800">{{ stats.city }}</div>
                            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">市/校级</div>
                        </div>
                    </div>

                    <!-- 搜索无结果提示 -->
                    <div v-if="filteredCertificates.length === 0" class="text-center py-20">
                        <div class="size-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-3xl">
                            <i class="fa-solid fa-folder-open"></i>
                        </div>
                        <p class="text-slate-400 font-medium">没有找到相关奖状</p>
                        <button @click="searchQuery = ''" class="mt-2 text-indigo-500 text-xs font-bold hover:underline">清除搜索</button>
                    </div>

                    <!-- 奖状列表 Grid -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div v-for="cert in paginatedCertificates" :key="cert.id" 
                             @click="previewCert(cert)"
                             class="group bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col">
                            
                            <!-- 顶部颜色条指示等级 -->
                            <div class="h-1 w-full" :class="getLevelBorderColor(cert.type)"></div>

                            <!-- 图片区域 -->
                            <div class="aspect-[4/3] bg-slate-50 relative overflow-hidden p-6 flex items-center justify-center">
                                <img :src="cert.image" 
                                     class="max-w-full max-h-full object-contain shadow-md transition-transform duration-500 group-hover:scale-105"
                                     :alt="cert.name">
                                <div class="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <!-- 内容区域 -->
                            <div class="p-5 flex-1 flex flex-col">
                                <div class="mb-3">
                                    <h3 class="font-bold text-slate-800 text-sm leading-snug line-clamp-2 h-10 group-hover:text-indigo-600 transition-colors" :title="cert.name">{{ cert.name }}</h3>
                                </div>
                                <div class="mt-auto flex items-center justify-between">
                                    <span class="text-[10px] px-2 py-1 rounded font-bold border" :class="getLevelColor(cert.type)">{{ cert.level }}</span>
                                    <span class="text-[10px] text-slate-400 font-mono">{{ cert.date }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 分页控制器 -->
                    <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
                        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                                class="size-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <i class="fa-solid fa-chevron-left text-xs"></i>
                        </button>
                        
                        <div class="flex gap-1">
                            <button v-for="page in totalPages" :key="page" 
                                    @click="changePage(page)"
                                    class="size-8 rounded-lg text-xs font-bold transition-all"
                                    :class="currentPage === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'">
                                {{ page }}
                            </button>
                        </div>

                        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                                class="size-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                            <i class="fa-solid fa-chevron-right text-xs"></i>
                        </button>
                    </div>

                </div>

                <!-- 2. 赛季勋章视图 (保持原有设计，适配无滚动条) -->
                <div v-else-if="currentTab === 'badges'" key="badge" class="animate-fade-in max-w-7xl mx-auto">
                    <div class="mb-8">
                        <div class="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 class="text-3xl font-black mb-2 tracking-tight">HALL OF FAME</h3>
                                    <p class="text-indigo-200 text-sm max-w-md">每一个勋章都见证了你在代码世界中的一次突破。保持热爱，奔赴山海。</p>
                                </div>
                                <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 flex gap-4 border border-white/10">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold">{{ badges.length }}</div>
                                        <div class="text-[10px] text-indigo-300 uppercase">Total Badges</div>
                                    </div>
                                </div>
                            </div>
                            <!-- 装饰背景 -->
                            <div class="absolute -right-10 -bottom-20 size-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
                            <div class="absolute -left-10 -top-20 size-64 bg-purple-500 rounded-full blur-[100px] opacity-30"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div v-for="badge in badges" :key="badge.id" 
                             class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                             
                            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]"></div>

                            <div class="relative size-28 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                <div class="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse" :class="badge.glowColor"></div>
                                <img :src="badge.image" class="w-full h-full object-contain relative z-10 drop-shadow-xl" alt="Badge">
                            </div>
                            
                            <div class="text-center relative z-10">
                                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 mb-3">
                                    <span class="size-1.5 rounded-full bg-indigo-500"></span>
                                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{{ badge.season }}</span>
                                </div>
                                <h3 class="font-black text-lg text-slate-800 mb-1">{{ badge.name }}</h3>
                                <p class="text-xs text-slate-400 font-mono">{{ badge.date }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>

        <!-- 全屏图片预览 (Lightbox) -->
        <Teleport to="body">
            <transition name="fade">
                <div v-if="previewingCert" class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-8" @click.self="closePreview">
                    
                    <!-- 顶部工具栏 -->
                    <div class="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 text-white">
                        <div class="text-sm font-medium opacity-80">
                            {{ currentIndex + 1 }} / {{ filteredCertificates.length }}
                        </div>
                        <button @click="closePreview" class="size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition backdrop-blur-md">
                            <i class="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    <!-- 左右导航 -->
                    <button @click.stop="navigateCert(-1)" :disabled="!hasPrev" 
                            class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-4 disabled:opacity-0 disabled:pointer-events-none transform hover:-translate-x-1">
                        <i class="fa-solid fa-chevron-left text-3xl"></i>
                    </button>
                    <button @click.stop="navigateCert(1)" :disabled="!hasNext"
                            class="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-4 disabled:opacity-0 disabled:pointer-events-none transform hover:translate-x-1">
                        <i class="fa-solid fa-chevron-right text-3xl"></i>
                    </button>
                    
                    <!-- 主要内容卡片 -->
                    <div class="flex flex-col md:flex-row max-w-6xl w-full max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in relative z-10" @click.stop>
                        
                        <!-- 图片区 -->
                        <div class="flex-1 bg-slate-100/50 relative flex items-center justify-center p-8 overflow-hidden group">
                            <!-- 装饰背景 -->
                            <div class="absolute inset-0 pattern-grid-lg opacity-5"></div>
                            
                            <transition name="fade" mode="out-in">
                                <img :key="previewingCert.id" 
                                     :src="previewingCert.image" 
                                     class="max-w-full max-h-full object-contain shadow-xl rounded-sm ring-8 ring-white"
                                     alt="Certificate Detail">
                            </transition>
                        </div>

                        <!-- 信息侧边栏 -->
                        <div class="w-full md:w-80 bg-white p-8 flex flex-col shrink-0 border-l border-slate-100 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            <div class="mb-6">
                                <span class="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold mb-3 border uppercase tracking-wider" :class="getLevelColor(previewingCert.type)">
                                    {{ previewingCert.level }}
                                </span>
                                <h2 class="text-2xl font-bold text-slate-800 leading-tight">{{ previewingCert.name }}</h2>
                            </div>

                            <div class="space-y-6 flex-1">
                                <div class="flex items-start gap-3">
                                    <div class="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <i class="fa-regular fa-calendar"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase">Date Awarded</p>
                                        <p class="text-sm font-medium text-slate-700">{{ previewingCert.date }}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <div class="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <i class="fa-solid fa-user-tie"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase">Instructor</p>
                                        <p class="text-sm font-medium text-slate-700">{{ previewingCert.teacher }}</p>
                                    </div>
                                </div>
                                <div class="flex items-start gap-3">
                                    <div class="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                        <i class="fa-solid fa-hashtag"></i>
                                    </div>
                                    <div>
                                        <p class="text-[10px] text-slate-400 font-bold uppercase">Cert ID</p>
                                        <p class="text-sm font-mono text-slate-600 select-all">{{ previewingCert.id }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 pt-8 border-t border-slate-100">
                                <button class="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 transform active:scale-95">
                                    <i class="fa-solid fa-download"></i> 下载电子证书
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, onMounted, onUnmounted, watch } = Vue;

        const currentTab = ref('certificates');
        const previewingCert = ref(null);
        const searchQuery = ref('');
        const currentPage = ref(1);
        const itemsPerPage = 8; // 每页显示8张

        // 扩展奖状数据以测试分页和搜索
        const allCertificates = [
            { id: 20241001, name: '2024 CSP-J/S 第一轮认证', level: '一等奖', teacher: '李老师', date: '2024-09-25', type: 'national', image: 'https://placehold.co/800x600/EEE/31343C?text=CSP-J+Certificate&font=serif' },
            { id: 20240612, name: '第十四届蓝桥杯全国软件大赛', level: '省赛二等奖', teacher: '张教练', date: '2024-06-15', type: 'provincial', image: 'https://placehold.co/600x840/FFFBEB/92400E?text=Blue+Bridge+Cup&font=serif' },
            { id: 20231205, name: 'NOC 编程猫创新编程赛项', level: '全国总决赛三等奖', teacher: '王老师', date: '2023-12-01', type: 'national', image: 'https://placehold.co/800x560/F0FDFA/0F766E?text=NOC+Finals&font=serif' },
            { id: 20230910, name: 'C++ 等级考试 (四级)', level: '合格证书', teacher: '李老师', date: '2023-09-10', type: 'level', image: 'https://placehold.co/500x700/FFF1F2/BE123C?text=C%2B%2B+Level+4&font=serif' },
            { id: 20230520, name: '校级算法编程挑战赛', level: '金奖', teacher: '陈老师', date: '2023-05-20', type: 'city', image: 'https://placehold.co/800x600/F8FAFC/475569?text=School+Contest&font=serif' },
            { id: 20230415, name: 'USACO 铜组晋级', level: 'Promotion', teacher: 'Self', date: '2023-04-15', type: 'national', image: 'https://placehold.co/800x600/ECFEFF/164E63?text=USACO+Bronze&font=serif' },
            { id: 20230310, name: '市中小学生信息素养提升实践', level: '市一等奖', teacher: '刘老师', date: '2023-03-10', type: 'city', image: 'https://placehold.co/800x600/F0FDF4/166534?text=City+Contest&font=serif' },
            { id: 20230101, name: '年度优秀学员', level: '荣誉称号', teacher: '教务处', date: '2023-01-01', type: 'city', image: 'https://placehold.co/800x600/FEF2F2/991B1B?text=Best+Student&font=serif' },
            { id: 20221111, name: 'GESP 编程能力等级认证 (二级)', level: '通过', teacher: '张教练', date: '2022-11-11', type: 'level', image: 'https://placehold.co/800x600/FDF4FF/86198F?text=GESP+Level+2&font=serif' },
            { id: 20221001, name: '国庆算法集训营结业', level: '优秀营员', teacher: '王老师', date: '2022-10-07', type: 'city', image: 'https://placehold.co/800x600/FFF7ED/9A3412?text=Camp+Award&font=serif' }
        ];

        const certificates = ref(allCertificates);

        const badges = ref([
            { id: 1, name: 'S3 赛季王者', season: 'Season 3', rank: 'Top 1%', date: '2024-10-01', image: 'https://cdn-icons-png.flaticon.com/512/5406/5406812.png', glowColor: 'bg-red-500', desc: '在天梯 S3 赛季中达到王者段位，并且排名进入全服前 1%。' },
            { id: 2, name: '算法新星', season: 'Season 2', rank: 'Top 10%', date: '2024-06-01', image: 'https://cdn-icons-png.flaticon.com/512/3176/3176294.png', glowColor: 'bg-yellow-400', desc: '在天梯 S2 赛季中表现优异，获得黄金段位以上。' },
            { id: 3, name: '全勤标兵', season: '2023年度', rank: '-', date: '2023-12-31', image: 'https://cdn-icons-png.flaticon.com/512/2583/2583319.png', glowColor: 'bg-blue-400', desc: '2023 年度保持全勤打卡记录，无缺席。' },
            { id: 4, name: '解题大师', season: '长期成就', rank: '500 AC', date: '2024-08-15', image: 'https://cdn-icons-png.flaticon.com/512/5673/5673629.png', glowColor: 'bg-purple-500', desc: '累计通过题目数量达到 500 题。' },
            { id: 5, name: '夜猫子', season: '隐藏成就', rank: '-', date: '2024-01-20', image: 'https://cdn-icons-png.flaticon.com/512/4825/4825038.png', glowColor: 'bg-slate-500', desc: '在凌晨 0:00 - 4:00 期间提交代码并通过。' }
        ]);

        // 1. 统计逻辑
        const stats = computed(() => {
            const list = certificates.value;
            return {
                total: list.length,
                national: list.filter(c => c.type === 'national').length,
                provincial: list.filter(c => c.type === 'provincial').length,
                // 将 city, school, level 归为第三类 (市/校级)
                city: list.filter(c => ['city', 'school', 'level'].includes(c.type)).length
            };
        });

        // 2. 搜索逻辑
        const filteredCertificates = computed(() => {
            if (!searchQuery.value.trim()) return certificates.value;
            const query = searchQuery.value.toLowerCase();
            return certificates.value.filter(c => 
                c.name.toLowerCase().includes(query) || 
                c.teacher.toLowerCase().includes(query)
            );
        });

        // 3. 分页逻辑
        const totalPages = computed(() => Math.ceil(filteredCertificates.value.length / itemsPerPage));
        
        const paginatedCertificates = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            return filteredCertificates.value.slice(start, end);
        });

        // 重置页码当搜索改变时
        watch(searchQuery, () => {
            currentPage.value = 1;
        });

        const changePage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                currentPage.value = page;
            }
        };

        // UI Helpers
        const getLevelColor = (type) => {
            const map = {
                national: 'bg-red-50 text-red-600 border-red-100',
                provincial: 'bg-purple-50 text-purple-600 border-purple-100',
                city: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                school: 'bg-blue-50 text-blue-600 border-blue-100',
                level: 'bg-green-50 text-green-600 border-green-100'
            };
            return map[type] || 'bg-slate-50 text-slate-600 border-slate-200';
        };
        
        const getLevelBorderColor = (type) => {
             const map = {
                national: 'bg-red-500',
                provincial: 'bg-purple-500',
                city: 'bg-yellow-500',
                level: 'bg-green-500'
            };
            return map[type] || 'bg-slate-300';
        }

        // Preview Logic (Adapts to filtered list)
        const currentIndex = computed(() => {
            if (!previewingCert.value) return -1;
            return filteredCertificates.value.findIndex(c => c.id === previewingCert.value.id);
        });

        const hasPrev = computed(() => currentIndex.value > 0);
        const hasNext = computed(() => currentIndex.value < filteredCertificates.value.length - 1);

        const navigateCert = (step) => {
            if (currentIndex.value === -1) return;
            const newIndex = currentIndex.value + step;
            if (newIndex >= 0 && newIndex < filteredCertificates.value.length) {
                previewingCert.value = filteredCertificates.value[newIndex];
            }
        };

        const handleKeydown = (e) => {
            if (!previewingCert.value) return;
            if (e.key === 'ArrowLeft' && hasPrev.value) navigateCert(-1);
            if (e.key === 'ArrowRight' && hasNext.value) navigateCert(1);
            if (e.key === 'Escape') closePreview();
        };

        onMounted(() => window.addEventListener('keydown', handleKeydown));
        onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

        const previewCert = (cert) => {
            previewingCert.value = cert;
        };

        const closePreview = () => {
            previewingCert.value = null;
        };

        return {
            currentTab, stats, badges, searchQuery,
            filteredCertificates, paginatedCertificates, 
            currentPage, totalPages, changePage,
            previewingCert, currentIndex, hasPrev, hasNext, 
            getLevelColor, getLevelBorderColor, previewCert, closePreview, navigateCert
        };
    }
};

window.HonorFeature = HonorFeature;