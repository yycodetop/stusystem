// ==========================================
// 模块名称：知识库 (Feature Knowledge Base)
// 版本：V4.2 (修复内容渲染与滚动显示)
// 更新内容：
// 1. [FIX] 修复 Mock 数据 Markdown 格式，解决换行渲染异常问题
// 2. [UI] 确保 no-scrollbar 类正确应用，保持页面整洁且可滚动
// ==========================================

const KnowledgeFeature = {
    props: ['user'],
    emits: ['show-toast', 'go-back'],
    
    template: `
    <div class="h-full flex flex-col bg-slate-50 relative animate-fade-in overflow-hidden">
        
        <!-- 弹窗：分类文章列表 (当文章超过4篇时使用) -->
        <div v-if="showModal && activeCategory" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-fade-in" @click.self="closeModal">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
                <!-- 弹窗头部 -->
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2 text-lg">
                        <div class="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-cyan-500 shadow-sm">
                            <i :class="activeCategory.icon"></i>
                        </div>
                        {{ activeCategory.name }}
                    </h3>
                    <button @click="closeModal" class="size-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <!-- 弹窗列表内容 (隐藏滚动条但可滚动) -->
                <div class="overflow-y-auto p-4 space-y-2 no-scrollbar">
                    <div v-for="article in activeCategory.articles" :key="article.id"
                         @click="openArticleFromModal(article)"
                         class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-cyan-300 hover:shadow-md hover:bg-cyan-50/30 cursor-pointer transition group">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <span class="text-slate-400 font-mono text-xs w-6">{{ article.id }}</span>
                            <span class="text-sm font-medium text-slate-700 group-hover:text-cyan-700 truncate">{{ article.title }}</span>
                        </div>
                        <i v-if="isBookmarked(article.id)" class="fa-solid fa-star text-yellow-400 text-xs shrink-0"></i>
                        <i v-else class="fa-solid fa-angle-right text-slate-300 group-hover:text-cyan-400 text-xs shrink-0 opacity-0 group-hover:opacity-100 transition"></i>
                    </div>
                </div>
                <!-- 弹窗底部 -->
                <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 text-center">
                    共 {{ activeCategory.articles.length }} 篇文档
                </div>
            </div>
        </div>

        <!-- 主内容区域 (隐藏滚动条但可滚动) -->
        <main class="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-6 md:p-8" ref="mainScroll">
            
            <!-- 状态 A: 知识库首页 (未选择文章) -->
            <div v-if="!currentArticle" class="max-w-6xl mx-auto space-y-10">
                
                <!-- 1. 顶部搜索区 -->
                <div class="text-center py-8">
                    <h1 class="text-3xl font-extrabold text-slate-800 mb-2">编程知识百科</h1>
                    <p class="text-slate-500 mb-8">收录 {{ totalArticles }} 个核心知识点，助你轻松通关</p>
                    
                    <div class="relative max-w-2xl mx-auto group z-10">
                        <input type="text" v-model="searchQuery"
                               class="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-14 pr-4 shadow-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition text-lg"
                               placeholder="搜索知识点，例如 '冒泡排序' 或 '指针'">
                        <i class="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-cyan-500 transition"></i>
                    </div>
                </div>

                <!-- 2. 快捷入口 Grid (搜索时不显示) -->
                <div v-if="!searchQuery" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- 最近浏览 -->
                    <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition group/card">
                        <div class="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-50 pb-3">
                            <div class="size-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover/card:bg-blue-500 group-hover/card:text-white transition"><i class="fa-solid fa-clock-rotate-left"></i></div>
                            最近浏览
                        </div>
                        <div v-if="recentHistory.length > 0" class="space-y-3">
                            <div v-for="history in recentHistory.slice(0, 3)" :key="history.id" 
                                 @click="openArticle(history)"
                                 class="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition">
                                <span class="text-sm text-slate-600 group-hover:text-blue-600 transition truncate flex-1">{{ history.title }}</span>
                                <i class="fa-solid fa-angle-right text-xs text-slate-300 group-hover:translate-x-1 transition"></i>
                            </div>
                        </div>
                        <div v-else class="text-xs text-slate-400 py-4 text-center italic">暂无浏览记录</div>
                    </div>

                    <!-- 老师推荐 -->
                    <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition group/card">
                        <div class="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-50 pb-3">
                            <div class="size-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover/card:bg-rose-500 group-hover/card:text-white transition"><i class="fa-solid fa-thumbs-up"></i></div>
                            重点推荐
                        </div>
                        <div class="space-y-3">
                            <div v-for="rec in recommendedArticles" :key="rec.id" 
                                 @click="openArticle(rec)"
                                 class="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition">
                                <span class="text-sm text-slate-600 group-hover:text-rose-600 transition truncate flex-1">{{ rec.title }}</span>
                                <span class="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-medium">必考</span>
                            </div>
                        </div>
                    </div>

                    <!-- 最近上新 -->
                    <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition group/card">
                        <div class="flex items-center gap-2 mb-4 text-slate-800 font-bold border-b border-slate-50 pb-3">
                            <div class="size-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover/card:bg-emerald-500 group-hover/card:text-white transition"><i class="fa-solid fa-bullhorn"></i></div>
                            最近上新
                        </div>
                        <div class="space-y-3">
                            <div v-for="news in newArticles" :key="news.id" 
                                 @click="openArticle(news)"
                                 class="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-lg transition">
                                <span class="text-sm text-slate-600 group-hover:text-emerald-600 transition truncate flex-1">{{ news.title }}</span>
                                <span class="text-[10px] text-slate-400 font-mono">{{ news.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. 内容列表 / 搜索结果 -->
                <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                    <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 class="font-bold text-slate-700 flex items-center gap-2">
                            <i class="fa-solid fa-layer-group text-slate-400"></i>
                            <span v-if="searchQuery">搜索结果: "{{ searchQuery }}"</span>
                            <span v-else>全部分类索引</span>
                        </h3>
                    </div>

                    <div class="p-6">
                        <!-- 搜索结果列表 -->
                        <div v-if="searchQuery">
                            <div v-if="searchResults.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="result in searchResults" :key="result.id" 
                                     @click="openArticle(result)"
                                     class="p-4 rounded-xl border border-slate-100 hover:border-cyan-400 hover:shadow-md transition cursor-pointer group bg-slate-50 hover:bg-white">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="px-2 py-0.5 rounded bg-slate-200 text-slate-500 text-[10px]">{{ result.categoryName }}</span>
                                        <h4 class="font-bold text-slate-800 group-hover:text-cyan-600">{{ result.title }}</h4>
                                    </div>
                                    <p class="text-xs text-slate-400 line-clamp-2">{{ getPreviewContent(result.content) }}</p>
                                </div>
                            </div>
                            <div v-else class="text-center py-12 text-slate-400">
                                <i class="fa-regular fa-face-dizzy text-3xl mb-3"></i>
                                <p>哎呀，没找到相关知识点，换个关键词试试？</p>
                            </div>
                        </div>

                        <!-- 默认分类列表 (Grid) -->
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="category in categories" :key="category.id" 
                                 class="border border-slate-100 rounded-xl p-4 hover:border-cyan-200 hover:shadow-sm transition flex flex-col h-full bg-slate-50/30">
                                
                                <!-- 分类卡片头部 -->
                                <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                    <div class="flex items-center gap-2">
                                        <i :class="[category.icon, 'text-cyan-500 text-lg']"></i>
                                        <h4 class="font-bold text-slate-800">{{ category.name }}</h4>
                                    </div>
                                    <!-- 关键交互：右上角计数 Badge -->
                                    <button @click.stop="openCategoryModal(category)"
                                            class="text-xs px-2.5 py-1 rounded-full transition font-medium flex items-center gap-1"
                                            :class="category.articles.length > 4 ? 'bg-cyan-100 text-cyan-700 hover:bg-cyan-500 hover:text-white cursor-pointer ring-2 ring-transparent hover:ring-cyan-200' : 'bg-slate-100 text-slate-400 cursor-default'">
                                        <span>{{ category.articles.length }}</span>
                                        <span v-if="category.articles.length > 4" class="scale-75"><i class="fa-solid fa-chevron-right"></i></span>
                                    </button>
                                </div>
                                
                                <!-- 分类文章列表 (固定高度或自动) -->
                                <div class="space-y-1 flex-1">
                                    <!-- 仅显示前 4 个 -->
                                    <div v-for="article in category.articles.slice(0, 4)" :key="article.id"
                                         @click="openArticle(article)" 
                                         class="group flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer transition border border-transparent hover:border-slate-100">
                                        <div class="size-1.5 rounded-full bg-slate-300 group-hover:bg-cyan-400 transition shrink-0"></div>
                                        <span class="text-sm text-slate-600 group-hover:text-cyan-700 group-hover:font-medium flex-1 truncate">{{ article.title }}</span>
                                        <i v-if="isBookmarked(article.id)" class="fa-solid fa-star text-[10px] text-yellow-400 shrink-0"></i>
                                    </div>

                                    <!-- 超过 4 个时的提示 -->
                                    <div v-if="category.articles.length > 4" 
                                         @click.stop="openCategoryModal(category)"
                                         class="mt-2 text-xs text-center py-2 text-cyan-600 bg-cyan-50/50 hover:bg-cyan-100 rounded-lg cursor-pointer transition flex items-center justify-center gap-1 border border-dashed border-cyan-200 hover:border-solid">
                                        查看剩余 {{ category.articles.length - 4 }} 篇
                                        <i class="fa-solid fa-angle-down"></i>
                                    </div>
                                    
                                    <div v-if="category.articles.length === 0" class="text-xs text-slate-400 italic px-2 py-4 text-center">
                                        暂无内容
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- 状态 B: 文章详情页 (带目录) -->
            <div v-else class="max-w-6xl mx-auto animate-fade-in-up">
                
                <!-- 顶部面包屑导航 -->
                <div class="flex items-center gap-2 mb-6">
                    <button @click="currentArticle = null" class="flex items-center gap-1 text-sm text-slate-500 hover:text-cyan-600 transition bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
                        <i class="fa-solid fa-arrow-left"></i> 返回列表
                    </button>
                    <span class="text-slate-300">/</span>
                    <span class="text-sm text-slate-500">{{ getCategoryName(currentArticle.categoryId) }}</span>
                    <span class="text-slate-300">/</span>
                    <span class="text-sm font-bold text-slate-800">{{ currentArticle.title }}</span>
                </div>

                <div class="flex flex-col lg:flex-row gap-8 items-start">
                    
                    <!-- 左侧：文章内容 (75%) -->
                    <div class="flex-1 w-full bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 min-h-[600px]">
                        <div class="flex justify-between items-start mb-8 pb-6 border-b border-slate-100">
                            <div>
                                <h1 class="text-3xl font-black text-slate-800 mb-4">{{ currentArticle.title }}</h1>
                                <div class="flex gap-4 text-xs text-slate-400">
                                    <span class="flex items-center gap-1"><i class="fa-regular fa-clock"></i> {{ currentArticle.date || '2024-03-20' }}</span>
                                    <span class="flex items-center gap-1"><i class="fa-regular fa-eye"></i> {{ currentArticle.views }} 次阅读</span>
                                </div>
                            </div>
                            <button @click="toggleBookmark(currentArticle.id)" 
                                    class="size-10 rounded-full flex items-center justify-center transition shrink-0 shadow-sm border hover:scale-110 active:scale-95"
                                    :class="isBookmarked(currentArticle.id) ? 'bg-yellow-50 border-yellow-200 text-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-yellow-500'">
                                <i class="text-lg" :class="isBookmarked(currentArticle.id) ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
                            </button>
                        </div>

                        <!-- Markdown 渲染区 -->
                        <div class="prose prose-slate prose-lg max-w-none 
                                    prose-headings:font-bold prose-headings:text-slate-800 prose-headings:scroll-mt-20
                                    prose-a:text-cyan-600 prose-a:no-underline hover:prose-a:underline
                                    prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-pre:rounded-xl prose-pre:shadow-lg
                                    prose-img:rounded-xl prose-img:shadow-md"
                             v-html="renderMarkdown(currentArticle.content)">
                        </div>
                    </div>

                    <!-- 右侧：目录 (25%) -->
                    <aside class="w-full lg:w-72 shrink-0 sticky top-4">
                        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                            <h3 class="font-bold text-slate-700 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100">
                                <i class="fa-solid fa-list-ol text-cyan-500"></i> 本文目录
                            </h3>
                            
                            <nav v-if="articleTOC.length > 0" class="flex flex-col space-y-1">
                                <a v-for="(item, index) in articleTOC" :key="index"
                                   href="javascript:;" 
                                   @click="scrollToHeading(item.text)"
                                   class="text-sm py-1.5 px-3 rounded hover:bg-cyan-50 hover:text-cyan-700 transition truncate border-l-2"
                                   :class="[
                                       item.level === 2 ? 'font-medium text-slate-700 border-transparent pl-3' : '',
                                       item.level === 3 ? 'text-slate-500 pl-6 border-transparent text-xs' : ''
                                   ]">
                                    {{ item.text }}
                                </a>
                            </nav>
                            <div v-else class="text-xs text-slate-400 py-4 text-center">
                                本文暂无目录结构
                            </div>
                        </div>

                        <!-- 底部小工具 -->
                        <div class="mt-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-5 text-white shadow-lg">
                            <h4 class="font-bold mb-2 text-sm"><i class="fa-solid fa-lightbulb text-yellow-300 mr-1"></i> 学习小贴士</h4>
                            <p class="text-xs opacity-90 leading-relaxed">
                                遇到看不懂的代码，记得动手敲一遍，实践出真知哦！
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
        </main>
    </div>
    `,

    setup(props, { emit }) {
        const { ref, computed, watch, nextTick } = Vue;

        // --- 1. State ---
        const searchQuery = ref('');
        const currentArticle = ref(null);
        const bookmarks = ref([201]); 
        const mainScroll = ref(null);
        const articleTOC = ref([]); 
        
        // Modal State
        const showModal = ref(false);
        const activeCategory = ref(null);

        // --- 2. Mock Data (使用 Template Literals 修复 Markdown 渲染) ---
        const categories = ref([
            {
                id: 'cpp', name: 'C++ 基础', icon: 'fa-brands fa-cuttlefish',
                articles: [
                    { 
                        id: 101, title: '01. 变量与数据类型', categoryId: 'cpp', views: 320, date: '3天前', 
                        content: `# 变量与数据类型

在 C++ 中，变量是存储数据的容器。

## 基本类型
- **int**: 整数
- **double**: 浮点数
- **char**: 字符
- **bool**: 布尔值 (true/false)

### 示例代码
\`\`\`cpp
int a = 10;
double b = 3.14;
char c = 'A';
bool d = true;
\`\`\`
` 
                    },
                    { 
                        id: 102, title: '02. if-else 条件判断', categoryId: 'cpp', views: 210, date: '1周前', 
                        content: `# 条件判断

使用 if-else 语句来控制程序的执行流程。

\`\`\`cpp
if (score >= 60) {
    cout << "及格";
} else {
    cout << "不及格";
}
\`\`\`
` 
                    },
                    { id: 103, title: '03. for 循环结构', categoryId: 'cpp', views: 540, date: '2周前', content: '# for 循环\n\n用于已知次数的循环。\n\n```cpp\nfor(int i=0; i<10; i++) {\n  cout << i << endl;\n}\n```' },
                    { id: 104, title: '04. while 循环结构', categoryId: 'cpp', views: 300, date: '3周前', content: '# while 循环\n\n用于条件满足时重复执行。' },
                    { id: 105, title: '05. 一维数组', categoryId: 'cpp', views: 420, date: '1个月前', content: '# 数组\n\n存储相同类型元素的集合。' },
                    { id: 106, title: '06. 函数的定义', categoryId: 'cpp', views: 380, date: '1个月前', content: '# 函数\n\n封装代码块，提高复用性。' }
                ]
            },
            {
                id: 'algo', name: '算法模板', icon: 'fa-solid fa-microchip',
                articles: [
                    { id: 201, title: '冒泡排序 (Bubble Sort)', categoryId: 'algo', views: 890, date: '昨天', content: '# 冒泡排序\n\n一种简单的排序算法。\n\n```cpp\n// 核心代码\nfor(int i=0; i<n-1; i++)\n  for(int j=0; j<n-i-1; j++)\n    if(a[j]>a[j+1]) swap(a[j], a[j+1]);\n```' },
                    { id: 202, title: '二分查找 (Binary Search)', categoryId: 'algo', views: 650, date: '1个月前', content: '# 二分查找\n\n在有序数组中查找元素。' }
                ]
            },
            {
                id: 'scratch', name: 'Scratch 创意', icon: 'fa-solid fa-cat',
                articles: [
                    { id: 301, title: '角色重力模拟', categoryId: 'scratch', views: 120, date: '2天前', content: '# 重力模拟\n\n通过变量控制 Y 坐标变化。' },
                    { id: 302, title: '平台跳跃碰撞检测', categoryId: 'scratch', views: 300, date: '3周前', content: '# 碰撞检测\n\n使用颜色侦测或角色接触侦测。' }
                ]
            },
            {
                id: 'debug', name: '报错速查', icon: 'fa-solid fa-bug',
                articles: [
                    { id: 401, title: 'Compilation Error: expected \';\'', categoryId: 'debug', views: 999, date: '4天前', content: '# 缺少分号\n\n这是最常见的编译错误，检查语句末尾。' }
                ]
            }
        ]);

        const recentHistory = ref([]); 

        // --- 3. Computed ---
        
        const allArticles = computed(() => {
            return categories.value.flatMap(c => c.articles.map(a => ({...a, categoryName: c.name})));
        });

        const totalArticles = computed(() => allArticles.value.length);

        const searchResults = computed(() => {
            if (!searchQuery.value) return [];
            const q = searchQuery.value.toLowerCase();
            return allArticles.value.filter(a => a.title.toLowerCase().includes(q));
        });

        const recommendedArticles = computed(() => {
            return [...allArticles.value].sort((a,b) => b.views - a.views).slice(0, 3);
        });

        const newArticles = computed(() => {
            return [
                allArticles.value.find(a => a.id === 201),
                allArticles.value.find(a => a.id === 301),
                allArticles.value.find(a => a.id === 101)
            ].filter(Boolean);
        });

        // --- 4. Methods ---

        const getCategoryName = (catId) => {
            const cat = categories.value.find(c => c.id === catId);
            return cat ? cat.name : '未知分类';
        };

        const isBookmarked = (id) => bookmarks.value.includes(id);

        const toggleBookmark = (id) => {
            if (isBookmarked(id)) {
                bookmarks.value = bookmarks.value.filter(bid => bid !== id);
                emit('show-toast', '已取消收藏');
            } else {
                bookmarks.value.push(id);
                emit('show-toast', '已收藏', 'success');
            }
        };

        const getPreviewContent = (markdown) => {
            return markdown.replace(/[#*`]/g, '').substring(0, 60) + '...';
        };

        const generateTOC = (markdown) => {
            if (!markdown) return [];
            const lines = markdown.split('\n');
            const toc = [];
            lines.forEach(line => {
                if (line.startsWith('## ')) {
                    toc.push({ text: line.replace('## ', '').trim(), level: 2 });
                } else if (line.startsWith('### ')) {
                    toc.push({ text: line.replace('### ', '').trim(), level: 3 });
                }
            });
            return toc;
        };

        const scrollToHeading = (text) => {
            const headings = document.querySelectorAll('h2, h3');
            for (let h of headings) {
                if (h.innerText.includes(text)) {
                    h.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    break;
                }
            }
        };

        // Modal Logic
        const openCategoryModal = (category) => {
            if (category.articles.length > 4) {
                activeCategory.value = category;
                showModal.value = true;
            }
        };
        const closeModal = () => {
            showModal.value = false;
            activeCategory.value = null;
        };
        const openArticleFromModal = (article) => {
            closeModal();
            openArticle(article);
        }

        const openArticle = (article) => {
            recentHistory.value = recentHistory.value.filter(h => h.id !== article.id);
            recentHistory.value.unshift(article);
            if (recentHistory.value.length > 5) recentHistory.value.pop();

            articleTOC.value = generateTOC(article.content);
            currentArticle.value = article;
            searchQuery.value = ''; 
            
            nextTick(() => {
                if (mainScroll.value) mainScroll.value.scrollTop = 0;
            });
        };

        const renderMarkdown = (text) => {
            if (!text) return '';
            try {
                return marked.parse(text);
            } catch (e) {
                return text;
            }
        };

        return {
            searchQuery, currentArticle, bookmarks, mainScroll,
            categories, searchResults, recentHistory, recommendedArticles, newArticles,
            totalArticles, articleTOC, showModal, activeCategory,
            openArticle, toggleBookmark, isBookmarked, renderMarkdown, 
            getCategoryName, getPreviewContent, scrollToHeading,
            openCategoryModal, closeModal, openArticleFromModal
        };
    }
};

window.KnowledgeFeature = KnowledgeFeature;