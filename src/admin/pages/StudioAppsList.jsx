import { AppWindow } from 'lucide-react'
import StudioItemsList from '../components/studio/StudioItemsList'

const StudioAppsList = () => (
  <StudioItemsList
    kind="app"
    basePath="/admin/studio/apps"
    titleSingular="App"
    titlePlural="Studio Apps"
    emptyIcon={AppWindow}
  />
)

export default StudioAppsList
