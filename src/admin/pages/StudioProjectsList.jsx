import { FolderKanban } from 'lucide-react'
import StudioItemsList from '../components/studio/StudioItemsList'

const StudioProjectsList = () => (
  <StudioItemsList
    kind="project"
    basePath="/admin/studio/projects"
    titleSingular="Project"
    titlePlural="Studio Projects"
    emptyIcon={FolderKanban}
  />
)

export default StudioProjectsList
