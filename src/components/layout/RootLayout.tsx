import { Outlet } from 'react-router-dom'
import { AnnouncementBar } from './AnnouncementBar'
import { ScrollManager } from './ScrollManager'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

/** Chrome shared by every route. */
export function RootLayout() {
  return (
    <div id="top">
      <ScrollManager />
      <AnnouncementBar />
      <SiteHeader />

      <main>
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}
