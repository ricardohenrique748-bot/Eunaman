import BacklogClient from "./BacklogClient";
import { getBacklogItems } from "@/app/actions/backlog-actions";
export const dynamic = 'force-dynamic'

export default async function BacklogPage() {
    // Initial fetch
    const result = await getBacklogItems()
    const initialData = result.success ? (result.data || []) : []

    // Serializar para evitar erro de objeto Date entre Server e Client Component
    const serializedData = JSON.parse(JSON.stringify(initialData))

    return <BacklogClient initialData={serializedData} />
}
