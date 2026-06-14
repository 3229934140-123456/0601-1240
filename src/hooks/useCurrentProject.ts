import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '@/store/projectStore';
import { useCanvasStore } from '@/store/canvasStore';

export function useCurrentProject() {
  const { id } = useParams<{ id: string }>();
  const { currentProjectId, setCurrentProject, projects, getCurrentProject } = useProjectStore();
  const { setRatio } = useCanvasStore();

  useEffect(() => {
    if (id) {
      if (currentProjectId !== id) {
        setCurrentProject(id);
      }
      
      const project = projects.find(p => p.id === id);
      if (project && project.currentRatio) {
        setRatio(project.currentRatio);
      } else if (projects.length > 0 && !id.startsWith('project-')) {
        setCurrentProject(projects[0].id);
        if (projects[0].currentRatio) {
          setRatio(projects[0].currentRatio);
        }
      }
    } else if (projects.length > 0) {
      setCurrentProject(projects[0].id);
      if (projects[0].currentRatio) {
        setRatio(projects[0].currentRatio);
      }
    }
  }, [id, currentProjectId, projects, setCurrentProject, setRatio]);

  return {
    projectId: id || currentProjectId,
    currentProject: getCurrentProject(),
  };
}
