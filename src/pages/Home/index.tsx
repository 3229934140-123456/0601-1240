import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/store/projectStore';
import PixelButton from '@/components/ui/PixelButton';
import PixelCard from '@/components/ui/PixelCard';
import {
  Plus,
  LayoutGrid,
  Gamepad2,
  User,
  Film,
  Palette,
  Share2,
  Zap,
  Clock,
  Users,
  MessageSquare,
  GitCommit,
  Bell,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const templates = [
  {
    id: 'steam',
    name: 'Steam 商店页',
    description: '专业的游戏商店页面设计',
    icon: Gamepad2,
    color: 'from-pixel-neon-pink to-pixel-neon-purple',
    ratio: 'steam-main',
  },
  {
    id: 'character',
    name: '角色宣传',
    description: '展示你的像素角色',
    icon: User,
    color: 'from-pixel-neon-cyan to-pixel-neon-pink',
    ratio: '1:1',
  },
  {
    id: 'gif',
    name: '动图海报',
    description: '制作吸引眼球的动图',
    icon: Film,
    color: 'from-pixel-neon-yellow to-pixel-neon-orange',
    ratio: '16:9',
  },
  {
    id: 'brand',
    name: '品牌套件',
    description: '完整的品牌视觉素材',
    icon: Palette,
    color: 'from-pixel-neon-purple to-pixel-neon-cyan',
    ratio: '16:9',
  },
  {
    id: 'social',
    name: '社交媒体包',
    description: '全平台社交素材',
    icon: Share2,
    color: 'from-pixel-neon-cyan to-pixel-neon-yellow',
    ratio: '1:1',
  },
  {
    id: 'epic',
    name: 'Epic 封面',
    description: 'Epic 游戏商店封面',
    icon: Zap,
    color: 'from-pixel-neon-orange to-pixel-neon-pink',
    ratio: 'epic-cover',
  },
];

const generateAvatarSvg = (name: string, color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect width="32" height="32" fill="${color}"/>
    <text x="16" y="20" text-anchor="middle" fill="#0D0B1F" font-family="Press Start 2P" font-size="10">${name.charAt(0)}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  return `${days}天前`;
};

export default function Home() {
  const { projects, createProject, setCurrentProject } = useProjectStore();

  const handleCreateProject = (ratio: string = '16:9') => {
    const newProject = createProject('未命名项目', ratio);
    setCurrentProject(newProject.id);
  };

  const handleProjectClick = (projectId: string) => {
    setCurrentProject(projectId);
  };

  const recentProjects = projects.slice(0, 4);

  const teamActivities = [
    {
      id: 'a1',
      type: 'comment',
      icon: MessageSquare,
      user: '美术B',
      action: '评论了',
      target: '像素冒险 - Steam 商店页',
      content: '这里的颜色可以再亮一点',
      time: Date.now() - 30 * 60 * 1000,
      color: '#FF6B9D',
    },
    {
      id: 'a2',
      type: 'version',
      icon: GitCommit,
      user: '开发者A',
      action: '提交了版本',
      target: '森林精灵 - 角色宣传',
      content: '版本 1.1 - 优化了角色配色',
      time: Date.now() - 2 * 60 * 60 * 1000,
      color: '#64FFDA',
    },
    {
      id: 'a3',
      type: 'collab',
      icon: Users,
      user: '系统',
      action: '邀请了',
      target: '赛博都市 - 动图宣传',
      content: '策划C 加入了项目',
      time: Date.now() - 5 * 60 * 60 * 1000,
      color: '#FFE66D',
    },
    {
      id: 'a4',
      type: 'notify',
      icon: Bell,
      user: '系统',
      action: '更新了',
      target: '深海探险 - 品牌套件',
      content: '导出任务已完成',
      time: Date.now() - 8 * 60 * 60 * 1000,
      color: '#C77DFF',
    },
  ];

  return (
    <div className="min-h-screen bg-pixel-bg relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
          animation: 'scanline 8s linear infinite',
        }}
      />

      <motion.div
        className="fixed inset-0 pointer-events-none z-10 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(13,11,31,0.8) 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
      />

      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pixel-neon-pink via-pixel-neon-cyan to-pixel-neon-pink z-20"
        initial={{ y: -100 }}
        animate={{ y: ['-100vh', '200vh'] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
      />

      <div className="relative z-30">
        <section className="relative pt-20 pb-16 px-4 md:px-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(255,107,157,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(100,255,218,0.4) 0%, transparent 50%)',
              filter: 'blur(40px)',
            }}
          />

          <div
            className="absolute inset-0 opacity-10 pixel-grid-bg"
            style={{ backgroundSize: '32px 32px' }}
          />

          <div className="max-w-7xl mx-auto relative">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-pixel-card border-4 border-pixel-border"
                style={{ boxShadow: '4px 4px 0 0 #0D0B1F' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-4 h-4 text-pixel-neon-yellow" />
                <span className="font-pixel text-pixel-xs text-pixel-neon-yellow">
                  v1.0 正式上线
                </span>
              </motion.div>

              <h1 className="font-pixel text-pixel-2xl md:text-5xl mb-6 leading-tight">
                <span className="text-pixel-neon-pink neon-glow-pink pixel-text-shadow">
                  PIXEL
                </span>
                <br />
                <span className="text-pixel-neon-cyan neon-glow-cyan pixel-text-shadow">
                  FORGE
                </span>
              </h1>

              <p className="font-vt text-vt-xl text-pixel-text-secondary max-w-2xl mx-auto mb-8">
                打造专属于你的像素艺术世界，释放创意无限可能
                <br />
                <span className="text-pixel-text-muted">
                  一键生成 Steam / Epic 商店页、角色宣传、社交媒体素材
                </span>
              </p>

              <motion.div
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <PixelButton
                  variant="primary"
                  size="lg"
                  onClick={() => handleCreateProject()}
                  className="group"
                >
                  <Plus className="w-4 h-4 inline mr-2 group-hover:rotate-90 transition-transform" />
                  创建新项目
                </PixelButton>
                <PixelButton variant="secondary" size="lg">
                  <LayoutGrid className="w-4 h-4 inline mr-2" />
                  浏览模板
                </PixelButton>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-16"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <PixelCard
                    className="h-full p-4 group hover:shadow-neon-pink"
                    glow={index === 0}
                    onClick={() => handleCreateProject(template.ratio)}
                  >
                    <div
                      className={`w-12 h-12 mb-3 flex items-center justify-center bg-gradient-to-br ${template.color} border-4 border-pixel-bg`}
                      style={{ boxShadow: '3px 3px 0 0 #0D0B1F' }}
                    >
                      <template.icon className="w-6 h-6 text-pixel-bg" />
                    </div>
                    <h3 className="font-pixel text-pixel-xs text-pixel-text-primary mb-1">
                      {template.name}
                    </h3>
                    <p className="font-vt text-vt-sm text-pixel-text-muted">
                      {template.description}
                    </p>
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-pixel text-[8px] text-pixel-neon-cyan flex items-center gap-1">
                        开始创建 <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </PixelCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4 md:px-8 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-pixel-neon-pink" />
                <h2 className="font-pixel text-pixel-lg text-pixel-text-primary">
                  最近项目
                </h2>
                <span className="chip-pixel bg-pixel-neon-pink text-pixel-bg">
                  {projects.length}
                </span>
              </div>
              <PixelButton variant="ghost" size="sm">
                查看全部 <ChevronRight className="w-3 h-3 ml-1" />
              </PixelButton>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {recentProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, x: -4 }}
                  >
                    <PixelCard
                      className="h-full overflow-hidden group"
                      glow
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <div className="relative">
                        <div
                          className="aspect-video bg-pixel-surface border-b-4 border-pixel-border overflow-hidden"
                          style={{
                            backgroundImage: project.thumbnail
                              ? `url(${project.thumbnail})`
                              : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            imageRendering: 'pixelated',
                          }}
                        >
                          {!project.thumbnail && (
                            <div className="w-full h-full flex items-center justify-center">
                              <LayoutGrid className="w-12 h-12 text-pixel-border" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-pixel-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                            <span className="font-pixel text-pixel-xs text-pixel-neon-cyan">
                              点击编辑
                            </span>
                          </div>
                        </div>

                        <div
                          className="absolute top-3 right-3 chip-pixel bg-pixel-neon-yellow text-pixel-bg"
                          style={{ fontSize: '8px' }}
                        >
                          {formatTime(project.updatedAt)}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-pixel text-pixel-xs text-pixel-text-primary mb-2 truncate">
                          {project.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-pixel-text-muted" />
                            <span className="font-vt text-vt-sm text-pixel-text-muted">
                              {project.collaborators.length} 人
                            </span>
                          </div>
                          <div className="flex -space-x-2">
                            {project.collaborators.slice(0, 3).map((collab, i) => (
                              <div
                                key={collab.id}
                                className="w-6 h-6 border-2 border-pixel-card overflow-hidden"
                                style={{
                                  zIndex: 3 - i,
                                  backgroundImage: collab.avatar
                                    ? `url(${collab.avatar})`
                                    : `url(${generateAvatarSvg(collab.name, ['#FF6B9D', '#64FFDA', '#FFE66D', '#C77DFF'][i % 4])})`,
                                  backgroundSize: 'cover',
                                }}
                                title={collab.name}
                              />
                            ))}
                            {project.collaborators.length > 3 && (
                              <div className="w-6 h-6 border-2 border-pixel-card bg-pixel-surface flex items-center justify-center">
                                <span className="font-pixel text-[6px] text-pixel-text-muted">
                                  +{project.collaborators.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {project.versions.length > 0 && (
                          <div className="mt-3 pt-3 border-t-2 border-pixel-border flex items-center gap-2">
                            <GitCommit className="w-3 h-3 text-pixel-neon-cyan" />
                            <span className="font-vt text-vt-sm text-pixel-text-muted">
                              {project.versions.length} 个版本
                            </span>
                          </div>
                        )}

                        {project.comments.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <MessageSquare className="w-3 h-3 text-pixel-neon-yellow" />
                            <span className="font-vt text-vt-sm text-pixel-text-muted">
                              {project.comments.filter((c) => !c.resolved).length} 条评论
                            </span>
                          </div>
                        )}
                      </div>
                    </PixelCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 md:px-8 relative">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(255,107,157,0.1) 50%, transparent 100%)',
            }}
          />

          <div className="max-w-7xl mx-auto relative">
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Bell className="w-5 h-5 text-pixel-neon-cyan" />
              <h2 className="font-pixel text-pixel-lg text-pixel-text-primary">
                团队动态
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teamActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PixelCard className="p-4" hover={false}>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-4 border-pixel-bg"
                        style={{
                          backgroundColor: activity.color,
                          boxShadow: '3px 3px 0 0 #0D0B1F',
                        }}
                      >
                        <activity.icon className="w-5 h-5 text-pixel-bg" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-pixel text-pixel-xs"
                            style={{ color: activity.color }}
                          >
                            {activity.user}
                          </span>
                          <span className="font-vt text-vt-sm text-pixel-text-muted">
                            {activity.action}
                          </span>
                        </div>

                        <p className="font-pixel text-pixel-xs text-pixel-text-primary mb-1 truncate">
                          {activity.target}
                        </p>

                        <p className="font-vt text-vt-base text-pixel-text-secondary mb-2">
                          {activity.content}
                        </p>

                        <span className="font-vt text-vt-sm text-pixel-text-muted">
                          {formatTime(activity.time)}
                        </span>
                      </div>
                    </div>
                  </PixelCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-12 px-4 md:px-8 border-t-4 border-pixel-border">
          <div className="max-w-7xl mx-auto text-center">
            <div className="font-pixel text-pixel-xs text-pixel-text-muted mb-4">
              <span className="text-pixel-neon-pink">PIXEL</span>
              <span className="text-pixel-neon-cyan">FORGE</span>
              <span className="text-pixel-text-muted"> © 2026</span>
            </div>
            <p className="font-vt text-vt-base text-pixel-text-muted">
              用像素，锻造无限创意
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
