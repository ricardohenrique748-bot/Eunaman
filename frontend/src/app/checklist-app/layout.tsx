import { getSession } from '@/app/actions/auth-actions'
import { redirect } from 'next/navigation'
import ChecklistAppShell from './ChecklistAppShell'

export default async function ChecklistAppLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession()

    if (!session) {
        redirect('/')
    }

    return (
        <ChecklistAppShell user={session}>
            {children}
        </ChecklistAppShell>
    )
}
