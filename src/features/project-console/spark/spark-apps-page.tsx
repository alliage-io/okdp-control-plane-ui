import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { useProjectContext } from '../../../core/context/project-context';
import { SparkList } from './spark-list';

export default function SparkAppsPage() {
  const navigate = useNavigate();
  const context = useProjectContext();

  const goToSubmit = () => {
    const project = context.currentProject;
    if (project) {
      navigate(`/project/${project.name}/spark/applications/submit`);
    }
  };

  return (
    <div className="cluster-container">
      <div className="top-bar">
        <div className="left-group">
          <h1>Spark Jobs</h1>
        </div>
        <Button label="Submit job" icon="pi pi-plus" onClick={goToSubmit} className="create-btn" />
      </div>
      <SparkList />
    </div>
  );
}
