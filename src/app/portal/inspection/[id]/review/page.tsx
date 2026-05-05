'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getReview, submitReview } from '@/lib/supabase'
import { usePortal } from '@/contexts/PortalContext'
import type { Review } from '@/types'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { client } = usePortal()
  const [existing, setExisting] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const inspectionId = params.id as string

  useEffect(() => {
    if (!client) return
    getReview(inspectionId).then(rev => {
      if (rev) {
        setExisting(rev)
        setRating(rev.rating)
        setComment(rev.comment ?? '')
      }
    }).finally(() => setLoading(false))
  }, [inspectionId, client])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!client) return
    setSubmitting(true)
    try {
      await submitReview(inspectionId, client.id, rating, comment)
      router.push(`/portal/inspection/${inspectionId}`)
    } catch (err) {
      console.error(err)
      alert('Failed to submit review. Please try again.')
      setSubmitting(false)
    }
  }

  if (!client) return null

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href={`/portal/inspection/${inspectionId}`} className="text-sm text-green-700 dark:text-green-400 hover:underline">
          ← Back to report
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
          {existing ? 'Edit Your Review' : 'Leave a Review'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Navigator Home Inspections LLC
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
        {/* Star selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Rating
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              >
                <svg
                  className={`w-10 h-10 transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-yellow-400'
                      : 'text-slate-200 dark:text-slate-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-2 h-5">
            {LABELS[hovered || rating]}
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Comments{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 resize-none"
            rows={5}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with Navigator Home Inspections…"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : existing ? 'Update Review' : 'Submit Review'}
          </button>
          <Link
            href={`/portal/inspection/${inspectionId}`}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
