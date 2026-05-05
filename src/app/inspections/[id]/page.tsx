import { getInspection } from '@/lib/supabase'
import InspectionForm from '@/components/InspectionForm'
import { notFound } from 'next/navigation'

export default async function EditInspection({ params }: { params: { id: string } }) {
  const inspection = await getInspection(params.id)
  if (!inspection) notFound()

  return (
    <div>
      <div className="mb-4">
        <a href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to inspections</a>
      </div>
      <InspectionForm inspection={inspection} />
    </div>
  )
}
